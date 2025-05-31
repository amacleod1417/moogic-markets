// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IFlareDataConnector.sol";
import "./interfaces/IPriceReader.sol";
import "./interfaces/IRandomConsumer.sol";

contract MoogicMarket is Ownable, IRandomConsumer {
    enum MarketStatus { OPEN, CLOSED, RESOLVED }

    struct Market {
        uint256 id;
        string question;
        uint256 deadline;
        MarketStatus status;
        bool outcome; // true = YES, false = NO
        uint256 totalYes;
        uint256 totalNo;
        uint256 resolutionTimestamp;
        bool resolved;
    }

    struct Bet {
        bool prediction;
        uint256 amount;
        bool claimed;
    }

    uint256 public marketId;
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Bet)) public bets;

    IFlareDataConnector public fdc;
    IPriceReader public ftso;
    address public rngContract;

    mapping(uint256 => address[]) public correctPredictors;
    mapping(uint256 => address) public bonusWinner;


    event MarketCreated(uint256 indexed id, string question);
    event BetPlaced(uint256 indexed marketId, address indexed bettor, bool prediction, uint256 amount);
    event MarketResolved(uint256 indexed id, bool outcome);
    event RewardClaimed(uint256 indexed marketId, address indexed bettor, uint256 amount);
    event BonusWinnerSelected(uint256 indexed marketId, address indexed winner);

    constructor(address _fdc, address _ftso, address _rng) Ownable(msg.sender) {
        fdc = IFlareDataConnector(_fdc);
        ftso = IPriceReader(_ftso);
        rngContract = _rng;
    }

    function createMarket(string memory _question, uint256 _deadline) external onlyOwner {
        require(_deadline > block.timestamp, "Deadline must be in the future");

        markets[marketId] = Market({
            id: marketId,
            question: _question,
            deadline: _deadline,
            status: MarketStatus.OPEN,
            outcome: false,
            totalYes: 0,
            totalNo: 0,
            resolutionTimestamp: 0,
            resolved: false
        });

        emit MarketCreated(marketId, _question);
        marketId++;
    }

    function placeBet(uint256 _id, bool _prediction) external payable {
        Market storage m = markets[_id];
        require(block.timestamp < m.deadline, "Market closed");
        require(msg.value > 0, "Must stake to bet");

        Bet storage b = bets[_id][msg.sender];
        require(b.amount == 0, "Already bet");

        b.prediction = _prediction;
        b.amount = msg.value;

        if (_prediction) {
            m.totalYes += msg.value;
        } else {
            m.totalNo += msg.value;
        }

        emit BetPlaced(_id, msg.sender, _prediction, msg.value);
    }

    function resolveFromFDC(uint256 _id, bytes32 queryId) external onlyOwner {
    Market storage m = markets[_id];
    require(!m.resolved, "Already resolved");
    require(block.timestamp >= m.deadline, "Too early");

    bytes memory raw = fdc.getData(queryId);
    require(raw.length > 0, "No data from FDC");

    bool outcome = abi.decode(raw, (bool));

    m.outcome = outcome;
    m.status = MarketStatus.RESOLVED;
    m.resolutionTimestamp = block.timestamp;
    m.resolved = true;

    emit MarketResolved(_id, outcome);

    }


    function resolveMarket(uint256 _id, bool _externalOutcome) external onlyOwner {
        Market storage m = markets[_id];
        require(block.timestamp >= m.deadline, "Too early");
        require(!m.resolved, "Already resolved");

        m.outcome = _externalOutcome;
        m.status = MarketStatus.RESOLVED;
        m.resolutionTimestamp = block.timestamp;
        m.resolved = true;

        emit MarketResolved(_id, _externalOutcome);
    }

    function claimReward(uint256 _id) external {
        Market storage m = markets[_id];
        require(m.resolved, "Not resolved");

        Bet storage b = bets[_id][msg.sender];
        require(!b.claimed, "Already claimed");
        require(b.amount > 0, "No bet");
        require(b.prediction == m.outcome, "Incorrect");

        uint256 reward = b.prediction
            ? (b.amount * (m.totalYes + m.totalNo)) / m.totalYes
            : (b.amount * (m.totalYes + m.totalNo)) / m.totalNo;

        b.claimed = true;
        correctPredictors[_id].push(msg.sender);
        payable(msg.sender).transfer(reward);

        emit RewardClaimed(_id, msg.sender, reward);
    }

    function requestRNG(uint256 marketId) external onlyOwner {
    require(markets[marketId].resolved, "Market not resolved yet");

    (bool success, ) = rngContract.call(
        abi.encodeWithSignature("requestRandom(uint256)", marketId)
    );
    require(success, "RNG request failed");
    }

   function receiveRandom(uint256 requestId, uint256 random) external override {
    require(msg.sender == rngContract, "Unauthorized");

    address[] memory winners = correctPredictors[requestId];
    if (winners.length == 0) return;

    uint256 index = random % winners.length;
    bonusWinner[requestId] = winners[index];

    // Send bonus reward (0.01 ether in this example)
    payable(winners[index]).transfer(0.01 ether);
    }

}

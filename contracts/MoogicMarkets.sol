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
    MarketType marketType;
    bool outcome; // used if binary
    uint256 winningOption; // used if multi-option
    uint256 totalYes;
    uint256 totalNo;
    uint256 resolutionTimestamp;
    bool resolved;
    uint256 optionCount; // >0 for multi-option
}

    struct Bet {
        bool prediction;
        uint256 amount;
        bool claimed;
    }

    enum MarketType { BINARY, MULTI }

    uint256 public marketId;
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Bet)) public bets;

    IFlareDataConnector public fdc;
    IPriceReader public ftso;
    address public rngContract;

    mapping(uint256 => address[]) public correctPredictors;
    mapping(uint256 => address) public bonusWinner;
    mapping(uint256 => mapping(address => uint256)) public userSelections; // user → selectedOption
    mapping(uint256 => mapping(uint256 => uint256)) public optionStakes; // option → total staked
    mapping(uint256 => uint256) public winningOption;
    mapping(uint256 => uint256) public optionCount;
    mapping(uint256 => mapping(address => uint256)) public multiBets;
    mapping(address => uint256) public merits;
    mapping(uint256 => address) public topStakerByMarket;
    mapping(uint256 => uint256) public topStakeByMarket;

    event MarketCreated(uint256 indexed id, string question);
    event BetPlaced(uint256 indexed marketId, address indexed bettor, bool prediction, uint256 amount);
    event MarketResolved(uint256 indexed id, bool outcome);
    event RewardClaimed(uint256 indexed marketId, address indexed bettor, uint256 amount);
    event BonusWinnerSelected(uint256 indexed marketId, address indexed winner);
    event MeritEarned(uint256 indexed marketId, address indexed user, uint256 totalMerits);

    constructor(address _fdc, address _ftso, address _rng) Ownable(msg.sender) {
        fdc = IFlareDataConnector(_fdc);
        ftso = IPriceReader(_ftso);
        rngContract = _rng;
    }

    function createMarket(
        string memory _question,
        uint256 _deadline,
        MarketType _marketType,
        uint256 _optionCount // 0 for binary, >0 for multi
    ) external onlyOwner {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        if (_marketType == MarketType.MULTI) {
            require(_optionCount > 1, "Multi-option needs > 1 option");
        }

        markets[marketId] = Market({
            id: marketId,
            question: _question,
            deadline: _deadline,
            status: MarketStatus.OPEN,
            marketType: _marketType,
            outcome: false,
            winningOption: 0,
            totalYes: 0,
            totalNo: 0,
            resolutionTimestamp: 0,
            resolved: false,
            optionCount: _optionCount
        });

        optionCount[marketId] = _optionCount;
        emit MarketCreated(marketId, _question);
        marketId++;
    }

    function placeBet(uint256 _id, uint256 selectedOption) external payable {
        Market storage m = markets[_id];
        require(block.timestamp < m.deadline, "Market closed");
        require(msg.value > 0, "Stake required");
        if (msg.value > topStakeByMarket[_id]) {
        topStakeByMarket[_id] = msg.value;
        topStakerByMarket[_id] = msg.sender;
        }

        if (m.marketType == MarketType.BINARY) {
            require(selectedOption == 0 || selectedOption == 1, "Invalid for binary");
            Bet storage b = bets[_id][msg.sender];
            require(b.amount == 0, "Already bet");

            b.prediction = (selectedOption == 1);
            b.amount = msg.value;

            if (b.prediction) {
                m.totalYes += msg.value;
            } else {
                m.totalNo += msg.value;
            }
        } else {
            require(userSelections[_id][msg.sender] == 0, "Already placed");
            require(selectedOption < m.optionCount, "Invalid option");

            userSelections[_id][msg.sender] = selectedOption + 1; // +1 to distinguish from default 0
            optionStakes[_id][selectedOption] += msg.value;
            multiBets[_id][msg.sender] = msg.value;
        }
    }

    function resolveWithRNG(uint256 marketId, uint256 optionCount) external onlyOwner {
        require(markets[marketId].resolved == false, "Already resolved");
        (bool success, ) = rngContract.call(
            abi.encodeWithSignature("requestRandom(uint256,uint256)", marketId, optionCount)
        );
        require(success, "RNG call failed");
    }

    function receiveRandom(uint256 requestId, uint256 random) external override {
        require(msg.sender == rngContract, "Unauthorized");

        Market storage m = markets[requestId];
        if (m.marketType == MarketType.MULTI) {
            m.winningOption = random % m.optionCount;
            m.resolved = true;
            m.status = MarketStatus.RESOLVED;
        } else {
            address[] memory winners = correctPredictors[requestId];
            if (winners.length == 0) return;

            uint256 index = random % winners.length;
            bonusWinner[requestId] = winners[index];
            payable(winners[index]).transfer(0.01 ether);
        }
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
        

        if (m.marketType == MarketType.BINARY) {
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

            merits[msg.sender] += 1;
            emit MeritEarned(_id, msg.sender, merits[msg.sender]);
            emit RewardClaimed(_id, msg.sender, reward);
        } else {
            uint256 selection = userSelections[_id][msg.sender];
            require(selection > 0, "No bet");
            require(selection - 1 == m.winningOption, "Incorrect");

            uint256 userStake = multiBets[_id][msg.sender];
            require(userStake > 0, "No stake");

            uint256 totalOptionStake = optionStakes[_id][selection - 1];
            require(totalOptionStake > 0, "Invalid stake");

            uint256 reward = (userStake * address(this).balance) / totalOptionStake;
            if (msg.sender == topStakerByMarket[_id]) {
            uint256 bonus = address(this).balance / 20; // e.g. 5% bonus
            reward += bonus;
             }

            multiBets[_id][msg.sender] = 0;
            userSelections[_id][msg.sender] = 0;

            payable(msg.sender).transfer(reward);

            emit RewardClaimed(_id, msg.sender, reward);
        }
    }

    function requestRNG(uint256 marketId) external onlyOwner {
        require(markets[marketId].resolved, "Market not resolved yet");

        (bool success, ) = rngContract.call(
            abi.encodeWithSignature("requestRandom(uint256)", marketId)
        );
        require(success, "RNG request failed");
    }
}

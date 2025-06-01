// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IFlareDataConnector.sol";
import "./interfaces/IPriceReader.sol";
import "./interfaces/IRandomConsumer.sol";
import "./CowNFT.sol";


contract MoogicMarket is Ownable, IRandomConsumer {
    enum MarketStatus { OPEN, CLOSED, RESOLVED }

    // Data IDs for dairy metrics
    bytes32 public constant MILK_YIELD_ID = keccak256("milk_yield_green_valley");
    bytes32 public constant BUTTERFAT_ID = keccak256("butterfat_green_valley");
    bytes32 public constant ACTIVITY_ID = keccak256("activity_green_valley");
    bytes32 public constant TEMPERATURE_ID = keccak256("temperature_green_valley");
    bytes32 public constant HUMIDITY_ID = keccak256("humidity_green_valley");

    // Add new events
    event MarketResolvedWithMetric(uint256 indexed marketId, bytes32 metricId, uint256 value, bool outcome);
    event MetricFetched(bytes32 indexed metricId, uint256 value, uint256 timestamp);

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
        bytes32 metricId; // ID of the metric used for resolution
        uint256 threshold; // Threshold value for resolution
        bool greaterWins; // If true, outcome is true when value > threshold
        uint256 cowId; // ID of the cow this market is tracking
    }

    struct Bet {
        bool prediction;
        uint256 amount;
        bool claimed;
    }

    struct CowStats {
        uint256 milk;
        uint256 steps;
        uint256 heartRate;
        bool isActive;
        uint256 lastUpdate;
    }

    enum MarketType { BINARY, MULTI, COW }
    CowNFT public cowNFT;

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
    mapping(uint256 => CowStats) public cowStats;
    mapping(uint256 => mapping(address => uint256)) public cowBets; // marketId → user → cowId


    event MarketCreated(uint256 indexed id, string question);
    event BetPlaced(uint256 indexed marketId, address indexed bettor, bool prediction, uint256 amount);
    event MarketResolved(uint256 indexed id, bool outcome);
    event RewardClaimed(uint256 indexed marketId, address indexed bettor, uint256 amount);
    event BonusWinnerSelected(uint256 indexed marketId, address indexed winner);
    event MeritEarned(uint256 indexed marketId, address indexed user, uint256 totalMerits);
    event CowStatsUpdated(uint256 indexed cowId, uint256 milk, uint256 steps, uint256 heartRate);

  constructor(address _fdc, address _ftso, address _rng, address _cowNFT) Ownable(msg.sender) {
        fdc = IFlareDataConnector(_fdc);
        ftso = IPriceReader(_ftso);
        rngContract = _rng;
        cowNFT = CowNFT(_cowNFT);
    }

    function createMarket(
        string memory _question,
        uint256 _deadline,
        MarketType _marketType,
        uint256 _optionCount,
        bytes32 _metricId,
        uint256 _threshold,
        bool _greaterWins,
        uint256 _cowId
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
            optionCount: _optionCount,
            metricId: _metricId,
            threshold: _threshold,
            greaterWins: _greaterWins,
            cowId: _cowId
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
        } else if (m.marketType == MarketType.MULTI) {
            require(userSelections[_id][msg.sender] == 0, "Already placed");
            require(selectedOption < m.optionCount, "Invalid option");

            userSelections[_id][msg.sender] = selectedOption + 1; // +1 to distinguish from default 0
            optionStakes[_id][selectedOption] += msg.value;
            multiBets[_id][msg.sender] = msg.value;
        } else {
            require(cowNFT.ownerOf(selectedOption) == msg.sender, "You must own this cow");
            require(cowBets[_id][msg.sender] == 0, "Already bet on a cow");
            
            cowBets[_id][msg.sender] = selectedOption; // selectedOption is cowId
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
        } else if (m.marketType == MarketType.COW) {
            uint256 cowId = cowBets[_id][msg.sender];
            require(cowId == m.winningOption, "Wrong cow");
            uint256 stake = multiBets[_id][msg.sender];
            require(stake > 0, "No stake");

            uint256 totalStake = optionStakes[_id][cowId];
            require(totalStake > 0, "No pool");

            uint256 reward = (stake * address(this).balance) / totalStake;

            multiBets[_id][msg.sender] = 0;
            cowBets[_id][msg.sender] = 0;

            payable(msg.sender).transfer(reward);
            emit RewardClaimed(_id, msg.sender, reward);
        }
        else {
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

    // Function to fetch dairy metric from FDC
    function getDairyMetric(bytes32 dataId) public view returns (uint256 value, uint256 timestamp) {
        (value, timestamp) = fdc.getData(dataId);
        return (value, timestamp);
    }

    // Function to get milk price from FTSO
    function getMilkPriceUSD() public view returns (uint256 price, uint256 timestamp) {
        return ftso.getCurrentPrice("milkUSD");
    }

    // Function to resolve market based on FDC metric
    function resolveMarketFromFDC(uint256 marketId) external onlyOwner {
        Market storage m = markets[marketId];
        require(!m.resolved, "Already resolved");
        require(block.timestamp >= m.deadline, "Too early");
        require(m.metricId != bytes32(0), "No metric configured");

        (uint256 value, uint256 timestamp) = fdc.getData(m.metricId);
        require(timestamp > 0, "No data available");

        bool outcome = m.greaterWins ? value > m.threshold : value < m.threshold;

        m.outcome = outcome;
        m.status = MarketStatus.RESOLVED;
        m.resolutionTimestamp = block.timestamp;
        m.resolved = true;

        emit MarketResolved(marketId, outcome);
        emit MarketResolvedWithMetric(marketId, m.metricId, value, outcome);
    }

    // Function to fetch and emit current metric values
    function fetchAndEmitMetrics() external {
        bytes32[] memory metricIds = new bytes32[](5);
        metricIds[0] = MILK_YIELD_ID;
        metricIds[1] = BUTTERFAT_ID;
        metricIds[2] = ACTIVITY_ID;
        metricIds[3] = TEMPERATURE_ID;
        metricIds[4] = HUMIDITY_ID;

        for (uint i = 0; i < metricIds.length; i++) {
            (uint256 value, uint256 timestamp) = fdc.getData(metricIds[i]);
            if (timestamp > 0) {
                emit MetricFetched(metricIds[i], value, timestamp);
            }
        }
    }

    function updateCowStats(
        uint256 cowId,
        uint256 milk,
        uint256 steps,
        uint256 heartRate
    ) external onlyOwner {
        require(milk <= 100, "Invalid milk amount"); // Assuming milk is in liters
        require(steps <= 10000, "Invalid step count"); // Assuming max 10k steps
        require(heartRate >= 40 && heartRate <= 120, "Invalid heart rate"); // Normal cow heart rate range

        cowStats[cowId] = CowStats({
            milk: milk,
            steps: steps,
            heartRate: heartRate,
            isActive: true,
            lastUpdate: block.timestamp
        });

        emit CowStatsUpdated(cowId, milk, steps, heartRate);
    }

    function updateCowStatsFromFDC(uint256 cowId) external onlyOwner {
        bytes32 cowIdBytes = bytes32(cowId);
        (uint256 milk, uint256 steps, uint256 heartRate, uint256 timestamp) = fdc.getCowStats(cowIdBytes);
        
        require(timestamp > cowStats[cowId].lastUpdate, "No new data available");

        cowStats[cowId] = CowStats({
            milk: milk,
            steps: steps,
            heartRate: heartRate,
            isActive: true,
            lastUpdate: timestamp
        });

        emit CowStatsUpdated(cowId, milk, steps, heartRate);
    }

    function resolveCowMarket(uint256 _id, uint256 winningCowId) external onlyOwner {
        Market storage m = markets[_id];
        require(m.marketType == MarketType.COW, "Not cow market");
        require(!m.resolved, "Already resolved");

        m.winningOption = winningCowId;
        m.status = MarketStatus.RESOLVED;
        m.resolved = true;
        m.resolutionTimestamp = block.timestamp;
    }


    function getCowStats(uint256 cowId) external view returns (
        uint256 milk,
        uint256 steps,
        uint256 heartRate,
        bool isActive,
        uint256 lastUpdate
    ) {
        CowStats memory stats = cowStats[cowId];
        return (stats.milk, stats.steps, stats.heartRate, stats.isActive, stats.lastUpdate);
    }
} // End of MoogicMarket contract


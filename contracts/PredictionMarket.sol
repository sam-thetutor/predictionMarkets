// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PredictionMarket {
    // Core data structures for markets, positions, and outcomes
    struct Market {
        uint256 id;
        string question;
        uint256 endTime;
        bool resolved;
        uint8 outcome; // 0 = unresolved, 1 = yes, 2 = no
        address creator;
        uint256 totalYesAmount;
        uint256 totalNoAmount;
    }
    
    // Market ID counter
    uint256 private marketIdCounter;
    
    // Mapping from market ID to Market
    mapping(uint256 => Market) public markets;
    
    // Mapping from market ID to user address to position amount (yes)
    mapping(uint256 => mapping(address => uint256)) public yesPositions;
    
    // Mapping from market ID to user address to position amount (no)
    mapping(uint256 => mapping(address => uint256)) public noPositions;
    
    // Events
    event MarketCreated(uint256 indexed marketId, string question, uint256 endTime, address creator);
    event PositionTaken(uint256 indexed marketId, address indexed user, bool isYes, uint256 amount);
    event MarketResolved(uint256 indexed marketId, uint8 outcome);
    event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount);
    
    // Create a new prediction market
    function createMarket(string memory _question, uint256 _endTime) external returns (uint256) {
        require(_endTime > block.timestamp, "End time must be in the future");
        
        uint256 marketId = marketIdCounter++;
        
        markets[marketId] = Market({
            id: marketId,
            question: _question,
            endTime: _endTime,
            resolved: false,
            outcome: 0,
            creator: msg.sender,
            totalYesAmount: 0,
            totalNoAmount: 0
        });
        
        emit MarketCreated(marketId, _question, _endTime, msg.sender);
        
        return marketId;
    }
    
    // Take a position in a market (yes or no)
    function takePosition(uint256 _marketId, bool _isYes) external payable {
        Market storage market = markets[_marketId];
        
        require(!market.resolved, "Market already resolved");
        require(block.timestamp < market.endTime, "Market has ended");
        require(msg.value > 0, "Amount must be greater than 0");
        
        if (_isYes) {
            yesPositions[_marketId][msg.sender] += msg.value;
            market.totalYesAmount += msg.value;
        } else {
            noPositions[_marketId][msg.sender] += msg.value;
            market.totalNoAmount += msg.value;
        }
        
        emit PositionTaken(_marketId, msg.sender, _isYes, msg.value);
    }
    
    // Resolve a market (only creator can resolve)
    function resolveMarket(uint256 _marketId, bool _outcome) external {
        Market storage market = markets[_marketId];
        
        require(msg.sender == market.creator, "Only creator can resolve");
        require(!market.resolved, "Market already resolved");
        require(block.timestamp >= market.endTime, "Market has not ended yet");
        
        market.resolved = true;
        market.outcome = _outcome ? 1 : 2;
        
        emit MarketResolved(_marketId, market.outcome);
    }
    
    // Claim winnings from a resolved market
    function claimWinnings(uint256 _marketId) external {
        Market storage market = markets[_marketId];
        
        require(market.resolved, "Market not resolved yet");
        
        uint256 winnings = 0;
        
        if (market.outcome == 1) { // Yes won
            uint256 yesAmount = yesPositions[_marketId][msg.sender];
            if (yesAmount > 0) {
                uint256 share = (yesAmount * 1e18) / market.totalYesAmount;
                winnings = (share * (market.totalYesAmount + market.totalNoAmount)) / 1e18;
                yesPositions[_marketId][msg.sender] = 0;
            }
        } else if (market.outcome == 2) { // No won
            uint256 noAmount = noPositions[_marketId][msg.sender];
            if (noAmount > 0) {
                uint256 share = (noAmount * 1e18) / market.totalNoAmount;
                winnings = (share * (market.totalYesAmount + market.totalNoAmount)) / 1e18;
                noPositions[_marketId][msg.sender] = 0;
            }
        }
        
        require(winnings > 0, "No winnings to claim");
        
        payable(msg.sender).transfer(winnings);
        
        emit WinningsClaimed(_marketId, msg.sender, winnings);
    }
    
    // Get market details
    function getMarket(uint256 _marketId) external view returns (
        string memory question,
        uint256 endTime,
        bool resolved,
        uint8 outcome,
        address creator,
        uint256 totalYesAmount,
        uint256 totalNoAmount
    ) {
        Market storage market = markets[_marketId];
        return (
            market.question,
            market.endTime,
            market.resolved,
            market.outcome,
            market.creator,
            market.totalYesAmount,
            market.totalNoAmount
        );
    }
    
    // Get user position in a market
    function getUserPosition(uint256 _marketId, address _user) external view returns (uint256 yesAmount, uint256 noAmount) {
        return (yesPositions[_marketId][_user], noPositions[_marketId][_user]);
    }
    
    // Get total number of markets
    function getMarketCount() external view returns (uint256) {
        return marketIdCounter;
    }
} 
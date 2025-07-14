// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AegisReputationToken (ART)
 * @dev ERC-20 token for AegisAI reputation system
 * @notice This token represents civic engagement reputation in the AegisAI ecosystem
 */
contract AegisReputationToken is ERC20, Ownable, Pausable {
    
    // Token details
    uint8 private _decimals = 18;
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    
    // Reputation categories and their multipliers
    mapping(string => uint256) public activityMultipliers;
    
    // User reputation tracking
    mapping(address => uint256) public userReputation;
    mapping(address => uint256) public lastActivityTimestamp;
    mapping(address => bool) public isVerifiedCitizen;
    
    // Authorized minters (ComplaintRegistry, DAO contracts, etc.)
    mapping(address => bool) public authorizedMinters;
    
    // Activity tracking
    struct ReputationActivity {
        address user;
        string activityType;
        uint256 tokensEarned;
        uint256 timestamp;
        string details;
    }
    
    ReputationActivity[] public reputationHistory;
    mapping(address => uint256[]) public userActivityHistory;
    
    // Events
    event ReputationEarned(
        address indexed user,
        uint256 amount,
        string activityType,
        string details
    );
    
    event VerificationStatusUpdated(
        address indexed user,
        bool isVerified
    );
    
    event ActivityMultiplierUpdated(
        string activityType,
        uint256 oldMultiplier,
        uint256 newMultiplier
    );
    
    // Modifiers
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    modifier onlyVerifiedUser() {
        require(isVerifiedCitizen[msg.sender], "User not verified");
        _;
    }
    
    constructor() ERC20("AegisAI Reputation Token", "ART") {
        // Initialize activity multipliers
        activityMultipliers["complaint_submission"] = 100;      // 1x multiplier
        activityMultipliers["complaint_resolution"] = 200;     // 2x multiplier
        activityMultipliers["community_voting"] = 50;          // 0.5x multiplier
        activityMultipliers["whistleblowing"] = 500;          // 5x multiplier
        activityMultipliers["peer_verification"] = 150;       // 1.5x multiplier
        activityMultipliers["emergency_reporting"] = 1000;    // 10x multiplier
        activityMultipliers["transparency_initiative"] = 300; // 3x multiplier
        
        // Set initial authorized minter
        authorizedMinters[msg.sender] = true;
    }
    
    /**
     * @dev Mint reputation tokens for specific activities
     * @param _to Address to mint tokens to
     * @param _amount Base amount of tokens (before multiplier)
     * @param _activityType Type of activity (must have defined multiplier)
     * @param _details Additional details about the activity
     */
    function mintReputation(
        address _to,
        uint256 _amount,
        string memory _activityType,
        string memory _details
    ) external onlyAuthorizedMinter whenNotPaused {
        require(_to != address(0), "Cannot mint to zero address");
        require(_amount > 0, "Amount must be greater than zero");
        require(activityMultipliers[_activityType] > 0, "Invalid activity type");
        require(totalSupply() + _amount <= MAX_SUPPLY, "Would exceed max supply");
        
        // Calculate final amount with multiplier
        uint256 finalAmount = (_amount * activityMultipliers[_activityType]) / 100;
        
        // Mint tokens
        _mint(_to, finalAmount);
        
        // Update user reputation
        userReputation[_to] += finalAmount;
        lastActivityTimestamp[_to] = block.timestamp;
        
        // Record activity
        ReputationActivity memory activity = ReputationActivity({
            user: _to,
            activityType: _activityType,
            tokensEarned: finalAmount,
            timestamp: block.timestamp,
            details: _details
        });
        
        reputationHistory.push(activity);
        userActivityHistory[_to].push(reputationHistory.length - 1);
        
        emit ReputationEarned(_to, finalAmount, _activityType, _details);
    }
    
    /**
     * @dev Batch mint reputation tokens for multiple users
     * @param _recipients Array of addresses to mint to
     * @param _amounts Array of base amounts
     * @param _activityType Type of activity
     * @param _details Details about the activity
     */
    function batchMintReputation(
        address[] memory _recipients,
        uint256[] memory _amounts,
        string memory _activityType,
        string memory _details
    ) external onlyAuthorizedMinter whenNotPaused {
        require(_recipients.length == _amounts.length, "Arrays length mismatch");
        require(_recipients.length > 0, "Empty arrays");
        require(activityMultipliers[_activityType] > 0, "Invalid activity type");
        
        uint256 totalToMint = 0;
        
        // Calculate total amount to mint
        for (uint256 i = 0; i < _amounts.length; i++) {
            totalToMint += (_amounts[i] * activityMultipliers[_activityType]) / 100;
        }
        
        require(totalSupply() + totalToMint <= MAX_SUPPLY, "Would exceed max supply");
        
        // Mint to each recipient
        for (uint256 i = 0; i < _recipients.length; i++) {
            if (_recipients[i] != address(0) && _amounts[i] > 0) {
                uint256 finalAmount = (_amounts[i] * activityMultipliers[_activityType]) / 100;
                
                _mint(_recipients[i], finalAmount);
                userReputation[_recipients[i]] += finalAmount;
                lastActivityTimestamp[_recipients[i]] = block.timestamp;
                
                // Record activity
                ReputationActivity memory activity = ReputationActivity({
                    user: _recipients[i],
                    activityType: _activityType,
                    tokensEarned: finalAmount,
                    timestamp: block.timestamp,
                    details: _details
                });
                
                reputationHistory.push(activity);
                userActivityHistory[_recipients[i]].push(reputationHistory.length - 1);
                
                emit ReputationEarned(_recipients[i], finalAmount, _activityType, _details);
            }
        }
    }
    
    /**
     * @dev Set verification status for a user (CARV integration)
     * @param _user Address of the user
     * @param _isVerified Verification status
     */
    function setVerificationStatus(address _user, bool _isVerified) external onlyOwner {
        isVerifiedCitizen[_user] = _isVerified;
        emit VerificationStatusUpdated(_user, _isVerified);
        
        // Bonus tokens for getting verified
        if (_isVerified && userReputation[_user] == 0) {
            mintReputation(_user, 100, "verification_bonus", "Initial verification completed");
        }
    }
    
    /**
     * @dev Update activity multiplier
     * @param _activityType Type of activity
     * @param _newMultiplier New multiplier (in basis points, 100 = 1x)
     */
    function updateActivityMultiplier(
        string memory _activityType,
        uint256 _newMultiplier
    ) external onlyOwner {
        uint256 oldMultiplier = activityMultipliers[_activityType];
        activityMultipliers[_activityType] = _newMultiplier;
        
        emit ActivityMultiplierUpdated(_activityType, oldMultiplier, _newMultiplier);
    }
    
    /**
     * @dev Add authorized minter
     * @param _minter Address to authorize
     */
    function addAuthorizedMinter(address _minter) external onlyOwner {
        authorizedMinters[_minter] = true;
    }
    
    /**
     * @dev Remove authorized minter
     * @param _minter Address to remove authorization
     */
    function removeAuthorizedMinter(address _minter) external onlyOwner {
        authorizedMinters[_minter] = false;
    }
    
    /**
     * @dev Get user's reputation score
     * @param _user Address of the user
     * @return Total reputation tokens earned
     */
    function getUserReputation(address _user) external view returns (uint256) {
        return userReputation[_user];
    }
    
    /**
     * @dev Get user's activity history
     * @param _user Address of the user
     * @return Array of activity indices
     */
    function getUserActivityHistory(address _user) external view returns (uint256[] memory) {
        return userActivityHistory[_user];
    }
    
    /**
     * @dev Get activity details by index
     * @param _index Index in reputationHistory array
     * @return ReputationActivity struct
     */
    function getActivityDetails(uint256 _index) external view returns (ReputationActivity memory) {
        require(_index < reputationHistory.length, "Invalid activity index");
        return reputationHistory[_index];
    }
    
    /**
     * @dev Get total number of activities
     * @return Total count of reputation activities
     */
    function getTotalActivities() external view returns (uint256) {
        return reputationHistory.length;
    }
    
    /**
     * @dev Calculate reputation tier based on token balance
     * @param _user Address of the user
     * @return Tier level (0-5)
     */
    function getReputationTier(address _user) external view returns (uint8) {
        uint256 reputation = userReputation[_user];
        
        if (reputation >= 10000 * 10**18) return 5; // Diamond tier
        if (reputation >= 5000 * 10**18) return 4;  // Platinum tier
        if (reputation >= 1000 * 10**18) return 3;  // Gold tier
        if (reputation >= 500 * 10**18) return 2;   // Silver tier
        if (reputation >= 100 * 10**18) return 1;   // Bronze tier
        return 0; // Newcomer tier
    }
    
    /**
     * @dev Check if user is active (has activity in last 30 days)
     * @param _user Address of the user
     * @return Boolean indicating if user is active
     */
    function isActiveUser(address _user) external view returns (bool) {
        return block.timestamp - lastActivityTimestamp[_user] <= 30 days;
    }
    
    /**
     * @dev Emergency pause function
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause function
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override decimals function
     */
    function decimals() public view override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Override transfer function to add verification checks for large amounts
     */
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        // Large transfers require verification
        if (amount > 1000 * 10**18) {
            require(isVerifiedCitizen[msg.sender], "Large transfers require verification");
        }
        
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom function with verification checks
     */
    function transferFrom(address from, address to, uint256 amount) 
        public 
        override 
        whenNotPaused 
        returns (bool) 
    {
        // Large transfers require verification
        if (amount > 1000 * 10**18) {
            require(isVerifiedCitizen[from], "Large transfers require verification");
        }
        
        return super.transferFrom(from, to, amount);
    }
}

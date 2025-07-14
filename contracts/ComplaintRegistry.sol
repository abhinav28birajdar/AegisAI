// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ComplaintRegistry
 * @dev Smart contract for AegisAI decentralized complaint management
 * @notice This contract stores complaint data on-chain with IPFS integration
 */
contract ComplaintRegistry is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _complaintIds;
    
    enum ComplaintStatus {
        PENDING,      // 0: Newly submitted
        REVIEWING,    // 1: Under review by authorities
        IN_PROGRESS,  // 2: Being processed
        RESOLVED,     // 3: Successfully resolved
        REJECTED,     // 4: Rejected or invalid
        ESCALATED     // 5: Escalated to higher authority
    }
    
    enum Priority {
        LOW,       // 0: Non-urgent issues
        MEDIUM,    // 1: Regular priority
        HIGH,      // 2: Important issues
        CRITICAL,  // 3: Emergency/safety issues
        EMERGENCY  // 4: Life-threatening situations
    }
    
    struct Complaint {
        uint256 id;
        address submitter;
        string title;
        string description;
        string category;
        Priority priority;
        ComplaintStatus status;
        uint256 timestamp;
        string ipfsHash;           // IPFS hash for additional data/evidence
        uint256 lastUpdated;
        address assignedOfficer;   // Government official assigned
        uint256 reputationReward;  // Reputation tokens earned
        bool isAnonymous;          // Privacy flag
    }
    
    // Mappings
    mapping(uint256 => Complaint) public complaints;
    mapping(address => uint256[]) public userComplaints;
    mapping(address => bool) public authorizedOfficers;
    mapping(string => uint256[]) public categoryComplaints;
    
    // Events
    event ComplaintSubmitted(
        uint256 indexed complaintId,
        address indexed submitter,
        string category,
        Priority priority,
        string ipfsHash
    );
    
    event ComplaintStatusUpdated(
        uint256 indexed complaintId,
        ComplaintStatus oldStatus,
        ComplaintStatus newStatus,
        address updatedBy
    );
    
    event OfficerAssigned(
        uint256 indexed complaintId,
        address indexed officer
    );
    
    event ReputationAwarded(
        address indexed user,
        uint256 amount,
        uint256 complaintId
    );
    
    // Modifiers
    modifier onlyAuthorizedOfficer() {
        require(authorizedOfficers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    modifier validComplaintId(uint256 _complaintId) {
        require(_complaintId > 0 && _complaintId <= _complaintIds.current(), "Invalid complaint ID");
        _;
    }
    
    constructor() {
        // Initialize with deployer as first authorized officer
        authorizedOfficers[msg.sender] = true;
    }
    
    /**
     * @dev Submit a new complaint to the registry
     * @param _title Brief title of the complaint
     * @param _description Detailed description
     * @param _category Category (e.g., "infrastructure", "safety", "corruption")
     * @param _priority Priority level (0-4)
     * @param _ipfsHash IPFS hash containing additional data/evidence
     * @param _isAnonymous Whether to submit anonymously
     * @return complaintId The ID of the newly created complaint
     */
    function submitComplaint(
        string memory _title,
        string memory _description,
        string memory _category,
        uint8 _priority,
        string memory _ipfsHash,
        bool _isAnonymous
    ) external nonReentrant returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(_category).length > 0, "Category cannot be empty");
        require(_priority <= 4, "Invalid priority level");
        
        _complaintIds.increment();
        uint256 newComplaintId = _complaintIds.current();
        
        complaints[newComplaintId] = Complaint({
            id: newComplaintId,
            submitter: _isAnonymous ? address(0) : msg.sender,
            title: _title,
            description: _description,
            category: _category,
            priority: Priority(_priority),
            status: ComplaintStatus.PENDING,
            timestamp: block.timestamp,
            ipfsHash: _ipfsHash,
            lastUpdated: block.timestamp,
            assignedOfficer: address(0),
            reputationReward: 0,
            isAnonymous: _isAnonymous
        });
        
        if (!_isAnonymous) {
            userComplaints[msg.sender].push(newComplaintId);
        }
        categoryComplaints[_category].push(newComplaintId);
        
        emit ComplaintSubmitted(
            newComplaintId,
            _isAnonymous ? address(0) : msg.sender,
            _category,
            Priority(_priority),
            _ipfsHash
        );
        
        return newComplaintId;
    }
    
    /**
     * @dev Update complaint status (only authorized officers)
     * @param _complaintId ID of the complaint to update
     * @param _newStatus New status to set
     */
    function updateComplaintStatus(
        uint256 _complaintId,
        uint8 _newStatus
    ) external onlyAuthorizedOfficer validComplaintId(_complaintId) {
        require(_newStatus <= 5, "Invalid status");
        
        Complaint storage complaint = complaints[_complaintId];
        ComplaintStatus oldStatus = complaint.status;
        complaint.status = ComplaintStatus(_newStatus);
        complaint.lastUpdated = block.timestamp;
        
        // Assign officer if not already assigned
        if (complaint.assignedOfficer == address(0)) {
            complaint.assignedOfficer = msg.sender;
            emit OfficerAssigned(_complaintId, msg.sender);
        }
        
        emit ComplaintStatusUpdated(_complaintId, oldStatus, ComplaintStatus(_newStatus), msg.sender);
        
        // Award reputation tokens for resolved complaints
        if (_newStatus == uint8(ComplaintStatus.RESOLVED) && complaint.reputationReward == 0) {
            _awardReputationTokens(_complaintId);
        }
    }
    
    /**
     * @dev Award reputation tokens for successful complaint resolution
     * @param _complaintId ID of the resolved complaint
     */
    function _awardReputationTokens(uint256 _complaintId) internal {
        Complaint storage complaint = complaints[_complaintId];
        
        if (complaint.submitter != address(0)) { // Not anonymous
            uint256 rewardAmount = _calculateReputationReward(complaint.priority);
            complaint.reputationReward = rewardAmount;
            
            // In a real implementation, this would mint ERC-20 tokens
            // For now, we just emit an event
            emit ReputationAwarded(complaint.submitter, rewardAmount, _complaintId);
        }
    }
    
    /**
     * @dev Calculate reputation reward based on complaint priority
     * @param _priority Priority level of the complaint
     * @return reward amount
     */
    function _calculateReputationReward(Priority _priority) internal pure returns (uint256) {
        if (_priority == Priority.LOW) return 10;
        if (_priority == Priority.MEDIUM) return 25;
        if (_priority == Priority.HIGH) return 50;
        if (_priority == Priority.CRITICAL) return 100;
        if (_priority == Priority.EMERGENCY) return 200;
        return 10; // Default
    }
    
    /**
     * @dev Get complaint details
     * @param _complaintId ID of the complaint
     * @return Complaint struct data
     */
    function getComplaint(uint256 _complaintId) 
        external 
        view 
        validComplaintId(_complaintId) 
        returns (Complaint memory) 
    {
        return complaints[_complaintId];
    }
    
    /**
     * @dev Get complaints by user address
     * @param _user Address of the user
     * @return Array of complaint IDs
     */
    function getUserComplaints(address _user) external view returns (uint256[] memory) {
        return userComplaints[_user];
    }
    
    /**
     * @dev Get complaints by category
     * @param _category Category string
     * @return Array of complaint IDs
     */
    function getComplaintsByCategory(string memory _category) external view returns (uint256[] memory) {
        return categoryComplaints[_category];
    }
    
    /**
     * @dev Get total number of complaints
     * @return Total complaint count
     */
    function getTotalComplaints() external view returns (uint256) {
        return _complaintIds.current();
    }
    
    /**
     * @dev Add authorized officer (only owner)
     * @param _officer Address to authorize
     */
    function addAuthorizedOfficer(address _officer) external onlyOwner {
        authorizedOfficers[_officer] = true;
    }
    
    /**
     * @dev Remove authorized officer (only owner)
     * @param _officer Address to remove authorization
     */
    function removeAuthorizedOfficer(address _officer) external onlyOwner {
        authorizedOfficers[_officer] = false;
    }
    
    /**
     * @dev Check if address is authorized officer
     * @param _officer Address to check
     * @return Boolean indicating authorization status
     */
    function isAuthorizedOfficer(address _officer) external view returns (bool) {
        return authorizedOfficers[_officer];
    }
    
    /**
     * @dev Get complaints by status
     * @param _status Status to filter by
     * @return Array of complaint IDs
     */
    function getComplaintsByStatus(uint8 _status) external view returns (uint256[] memory) {
        require(_status <= 5, "Invalid status");
        
        uint256 totalComplaints = _complaintIds.current();
        uint256[] memory tempResults = new uint256[](totalComplaints);
        uint256 resultCount = 0;
        
        for (uint256 i = 1; i <= totalComplaints; i++) {
            if (uint8(complaints[i].status) == _status) {
                tempResults[resultCount] = i;
                resultCount++;
            }
        }
        
        // Create properly sized array
        uint256[] memory results = new uint256[](resultCount);
        for (uint256 i = 0; i < resultCount; i++) {
            results[i] = tempResults[i];
        }
        
        return results;
    }
    
    /**
     * @dev Emergency escalation function for critical complaints
     * @param _complaintId ID of the complaint to escalate
     */
    function escalateComplaint(uint256 _complaintId) 
        external 
        onlyAuthorizedOfficer 
        validComplaintId(_complaintId) 
    {
        Complaint storage complaint = complaints[_complaintId];
        require(complaint.priority >= Priority.HIGH, "Only high priority complaints can be escalated");
        
        complaint.status = ComplaintStatus.ESCALATED;
        complaint.lastUpdated = block.timestamp;
        
        emit ComplaintStatusUpdated(_complaintId, complaint.status, ComplaintStatus.ESCALATED, msg.sender);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title FairFund
 * @dev A transparent aid distribution system for small farmers
 */
contract FairFund {
    // State variables
    address public owner;
    uint256 public totalFundsDistributed;
    uint256 public totalBeneficiaries;
    uint256 public totalDonors;
    
    // Structs
    struct Donor {
        string name;
        string description;
        uint256 totalDonated;
        uint256 successfulDisbursements;
        bool isVerified;
        uint256 reputationScore; // 0-100
    }
    
    struct Farmer {
        string name;
        string location;
        string farmType;
        bool isVerified;
        uint256 totalReceived;
        uint256 lastDisbursementDate;
    }
    
    struct Disbursement {
        uint256 id;
        address donor;
        address farmer;
        uint256 amount;
        uint256 timestamp;
        string purpose;
        bool claimed;
        uint256 claimDeadline;
    }
    
    // Mappings
    mapping(address => Donor) public donors;
    mapping(address => Farmer) public farmers;
    mapping(uint256 => Disbursement) public disbursements;
    mapping(address => bool) public registeredDonors;
    mapping(address => bool) public registeredFarmers;
    mapping(address => uint256[]) public donorToDisbursements;
    mapping(address => uint256[]) public farmerToDisbursements;
    
    uint256 public disbursementIdCounter;
    
    // Events
    event DonorRegistered(address indexed donorAddress, string name);
    event FarmerRegistered(address indexed farmerAddress, string name, string location);
    event FundsDisbursed(uint256 indexed disbursementId, address indexed donor, address indexed farmer, uint256 amount);
    event FundsClaimed(uint256 indexed disbursementId, address indexed farmer, uint256 amount);
    event DonorVerified(address indexed donorAddress);
    event FarmerVerified(address indexed farmerAddress);
    event ReputationUpdated(address indexed donorAddress, uint256 newScore);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyRegisteredDonor() {
        require(registeredDonors[msg.sender], "Only registered donors can call this function");
        _;
    }
    
    modifier onlyRegisteredFarmer() {
        require(registeredFarmers[msg.sender], "Only registered farmers can call this function");
        _;
    }
    
    /**
     * @dev Contract constructor
     */
    constructor() {
        owner = msg.sender;
        disbursementIdCounter = 1;
    }
    
    /**
     * @dev Register a new donor
     * @param _name Name of the donor organization
     * @param _description Description of the donor organization
     */
    function registerDonor(string memory _name, string memory _description) external {
        require(!registeredDonors[msg.sender], "Donor already registered");
        
        donors[msg.sender] = Donor({
            name: _name,
            description: _description,
            totalDonated: 0,
            successfulDisbursements: 0,
            isVerified: false,
            reputationScore: 50 // Default score
        });
        
        registeredDonors[msg.sender] = true;
        totalDonors++;
        
        emit DonorRegistered(msg.sender, _name);
    }
    
    /**
     * @dev Register a new farmer
     * @param _name Name of the farmer
     * @param _location Location of the farm
     * @param _farmType Type of farming (e.g., "Organic", "Traditional")
     */
    function registerFarmer(string memory _name, string memory _location, string memory _farmType) external {
        require(!registeredFarmers[msg.sender], "Farmer already registered");
        
        farmers[msg.sender] = Farmer({
            name: _name,
            location: _location,
            farmType: _farmType,
            isVerified: false,
            totalReceived: 0,
            lastDisbursementDate: 0
        });
        
        registeredFarmers[msg.sender] = true;
        totalBeneficiaries++;
        
        emit FarmerRegistered(msg.sender, _name, _location);
    }
    
    /**
     * @dev Verify a donor (can only be done by the contract owner)
     * @param _donorAddress Address of the donor to verify
     */
    function verifyDonor(address _donorAddress) external onlyOwner {
        require(registeredDonors[_donorAddress], "Donor not registered");
        donors[_donorAddress].isVerified = true;
        emit DonorVerified(_donorAddress);
    }
    
    /**
     * @dev Verify a farmer (can only be done by the contract owner)
     * @param _farmerAddress Address of the farmer to verify
     */
    function verifyFarmer(address _farmerAddress) external onlyOwner {
        require(registeredFarmers[_farmerAddress], "Farmer not registered");
        farmers[_farmerAddress].isVerified = true;
        emit FarmerVerified(_farmerAddress);
    }
    
    /**
     * @dev Create a new disbursement for a farmer
     * @param _farmerAddress Address of the farmer receiving aid
     * @param _purpose Purpose of the disbursement
     * @param _claimDeadlineDays Number of days the farmer has to claim funds
     */
    function createDisbursement(
        address _farmerAddress, 
        string memory _purpose,
        uint256 _claimDeadlineDays
    ) external payable onlyRegisteredDonor {
        require(msg.value > 0, "Amount must be greater than 0");
        require(registeredFarmers[_farmerAddress], "Farmer not registered");
        require(donors[msg.sender].isVerified, "Donor must be verified");
        
        uint256 claimDeadline = block.timestamp + (_claimDeadlineDays * 1 days);
        
        disbursements[disbursementIdCounter] = Disbursement({
            id: disbursementIdCounter,
            donor: msg.sender,
            farmer: _farmerAddress,
            amount: msg.value,
            timestamp: block.timestamp,
            purpose: _purpose,
            claimed: false,
            claimDeadline: claimDeadline
        });
        
        donorToDisbursements[msg.sender].push(disbursementIdCounter);
        farmerToDisbursements[_farmerAddress].push(disbursementIdCounter);
        
        donors[msg.sender].totalDonated += msg.value;
        
        emit FundsDisbursed(disbursementIdCounter, msg.sender, _farmerAddress, msg.value);
        
        disbursementIdCounter++;
    }
    
    /**
     * @dev Farmer claims funds from a disbursement
     * @param _disbursementId ID of the disbursement to claim
     */
    function claimFunds(uint256 _disbursementId) external onlyRegisteredFarmer {
        Disbursement storage disbursement = disbursements[_disbursementId];
        
        require(disbursement.farmer == msg.sender, "Only designated farmer can claim");
        require(!disbursement.claimed, "Funds already claimed");
        require(block.timestamp <= disbursement.claimDeadline, "Claim deadline has passed");
        
        disbursement.claimed = true;
        
        // Update farmer stats
        farmers[msg.sender].totalReceived += disbursement.amount;
        farmers[msg.sender].lastDisbursementDate = block.timestamp;
        
        // Update donor stats
        donors[disbursement.donor].successfulDisbursements++;
        updateDonorReputation(disbursement.donor);
        
        totalFundsDistributed += disbursement.amount;
        
        emit FundsClaimed(_disbursementId, msg.sender, disbursement.amount);
        
        // Transfer funds to farmer
        (bool success, ) = payable(msg.sender).call{value: disbursement.amount}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Reclaim expired funds (when farmer didn't claim before deadline)
     * @param _disbursementId ID of the disbursement to reclaim
     */
    function reclaimExpiredFunds(uint256 _disbursementId) external {
        Disbursement storage disbursement = disbursements[_disbursementId];
        
        require(disbursement.donor == msg.sender, "Only the donor can reclaim");
        require(!disbursement.claimed, "Funds already claimed");
        require(block.timestamp > disbursement.claimDeadline, "Claim deadline has not passed");
        
        disbursement.claimed = true;
        
        // Transfer funds back to donor
        (bool success, ) = payable(msg.sender).call{value: disbursement.amount}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Update donor reputation based on successful disbursements
     * @param _donorAddress Address of the donor
     */
    function updateDonorReputation(address _donorAddress) internal {
        Donor storage donor = donors[_donorAddress];
        
        if (donor.totalDonated == 0) return;
        
        // Calculate percentage of successful disbursements weighted by amount
        uint256 successRate = (donor.successfulDisbursements * 100) / donorToDisbursements[_donorAddress].length;
        
        // Calculate time factor (higher reputation for consistent donors)
        // This is a simplified calculation
        uint256 timeFactor = 5; // Default value
        
        // Update reputation score (weighted formula)
        donor.reputationScore = (successRate * 80 + timeFactor * 20) / 100;
        
        // Cap to 100
        if (donor.reputationScore > 100) {
            donor.reputationScore = 100;
        }
        
        emit ReputationUpdated(_donorAddress, donor.reputationScore);
    }
    
    /**
     * @dev Get all disbursements for a specific donor
     * @param _donorAddress Address of the donor
     * @return Array of disbursement IDs
     */
    function getDonorDisbursements(address _donorAddress) external view returns (uint256[] memory) {
        return donorToDisbursements[_donorAddress];
    }
    
    /**
     * @dev Get all disbursements for a specific farmer
     * @param _farmerAddress Address of the farmer
     * @return Array of disbursement IDs
     */
    function getFarmerDisbursements(address _farmerAddress) external view returns (uint256[] memory) {
        return farmerToDisbursements[_farmerAddress];
    }
    
  
    function getDisbursementDetails(uint256 _disbursementId) external view returns (
        uint256 id,
        address donor,
        address farmer,
        uint256 amount,
        uint256 timestamp,
        string memory purpose,
        bool claimed,
        uint256 claimDeadline
    ) {
        Disbursement storage d = disbursements[_disbursementId];
        return (
            d.id,
            d.donor,
            d.farmer,
            d.amount,
            d.timestamp,
            d.purpose,
            d.claimed,
            d.claimDeadline
        );
    }
    
   
    function getDonorStats(address _donorAddress) external view returns (
        string memory name,
        string memory description,
        uint256 totalDonated,
        uint256 successfulDisbursements,
        bool isVerified,
        uint256 reputationScore
    ) {
        Donor storage d = donors[_donorAddress];
        return (
            d.name,
            d.description,
            d.totalDonated,
            d.successfulDisbursements,
            d.isVerified,
            d.reputationScore
        );
    }
    
    
    function getFarmerStats(address _farmerAddress) external view returns (
        string memory name,
        string memory location,
        string memory farmType,
        bool isVerified,
        uint256 totalReceived,
        uint256 lastDisbursementDate
    ) {
        Farmer storage f = farmers[_farmerAddress];
        return (
            f.name,
            f.location,
            f.farmType,
            f.isVerified,
            f.totalReceived,
            f.lastDisbursementDate
        );
    }
    
    
    function getContractStats() external view returns (
        uint256 _totalDonors,
        uint256 _totalBeneficiaries,
        uint256 _totalFundsDistributed
    ) {
        return (totalDonors, totalBeneficiaries, totalFundsDistributed);
    }
}
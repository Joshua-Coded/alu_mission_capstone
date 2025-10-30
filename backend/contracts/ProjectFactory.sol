// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract ProjectFactory {
    struct Project {
        address payable owner;
        string title;
        string description;
        uint256 fundingGoal;
        string category;
        string location;
        uint256 timeline;
        uint256 totalFunding;
        bool isActive;
        bool isCompleted;
        bool fundsReleased;
        uint256 createdAt;
        uint256 completedAt;
        uint256 fundingDeadline;
    }

    struct ContributionInfo {
        address contributor;
        uint256 amount;
        uint256 timestamp;
    }

    Project[] public projects;
    address public admin;
    uint256 public platformFeePercentage = 2;
    uint256 public constant MIN_FUNDING_GOAL = 5 ether;
    uint256 public constant MIN_CONTRIBUTION = 0.1 ether;
    
    mapping(uint256 => ContributionInfo[]) public projectContributions;
    mapping(uint256 => mapping(address => uint256)) public contributorAmounts;
    mapping(uint256 => address[]) private projectContributors;
    mapping(uint256 => mapping(address => bool)) private isContributor;
    
    event ProjectCreated(uint256 indexed projectId, address indexed owner, string title, uint256 fundingGoal);
    event ProjectFunded(uint256 indexed projectId, address indexed funder, uint256 amount, uint256 newTotal);
    event FundsReleased(uint256 indexed projectId, address indexed recipient, uint256 amount, uint256 platformFee);
    event ProjectCompleted(uint256 indexed projectId, address completedBy, uint256 completedAt);
    event RefundIssued(uint256 indexed projectId, address indexed contributor, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier projectExists(uint256 projectId) {
        require(projectId < projects.length, "Not found");
        _;
    }

    modifier projectActive(uint256 projectId) {
        require(projects[projectId].isActive, "Not active");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createProject(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _fundingGoal,
        string memory _category,
        string memory _location,
        uint256 _timeline
    ) external returns (uint256) {
        require(_owner != address(0), "Invalid owner");
        require(_fundingGoal >= MIN_FUNDING_GOAL, "Goal must be at least 5 MATIC");
        require(_timeline > 0, "Timeline must be > 0");

        uint256 projectId = projects.length;
        
        projects.push(Project({
            owner: payable(_owner),
            title: _title,
            description: _description,
            fundingGoal: _fundingGoal,
            category: _category,
            location: _location,
            timeline: _timeline,
            totalFunding: 0,
            isActive: true,
            isCompleted: false,
            fundsReleased: false,
            createdAt: block.timestamp,
            completedAt: 0,
            fundingDeadline: block.timestamp + (_timeline * 1 days)
        }));

        emit ProjectCreated(projectId, _owner, _title, _fundingGoal);
        return projectId;
    }

    function _releaseFunds(uint256 projectId) private {
        Project storage project = projects[projectId];
        require(!project.fundsReleased, "Already released");
        
        project.fundsReleased = true;
        uint256 platformFee = (project.totalFunding * platformFeePercentage) / 100;
        uint256 farmerAmount = project.totalFunding - platformFee;
        
        (bool sentToFarmer, ) = project.owner.call{value: farmerAmount}("");
        require(sentToFarmer, "Transfer to farmer failed");
        
        if (platformFee > 0) {
            (bool sentToAdmin, ) = payable(admin).call{value: platformFee}("");
            require(sentToAdmin, "Transfer to admin failed");
        }
        
        emit FundsReleased(projectId, project.owner, farmerAmount, platformFee);
    }

    function _processContribution(uint256 projectId) private {
        Project storage p = projects[projectId];
        require(msg.value >= MIN_CONTRIBUTION, "Minimum contribution is 0.1 MATIC");
        require(!p.isCompleted, "Project already completed");
        require(block.timestamp <= p.fundingDeadline, "Deadline passed");
        
        uint256 remainingGoal = p.fundingGoal - p.totalFunding;
        uint256 actualContribution = msg.value;
        uint256 refundAmount = 0;

        if (msg.value > remainingGoal) {
            actualContribution = remainingGoal;
            refundAmount = msg.value - remainingGoal;
        }
        
        p.totalFunding += actualContribution;
        projectContributions[projectId].push(
            ContributionInfo(msg.sender, actualContribution, block.timestamp)
        );
        contributorAmounts[projectId][msg.sender] += actualContribution;
        
        if (!isContributor[projectId][msg.sender]) {
            projectContributors[projectId].push(msg.sender);
            isContributor[projectId][msg.sender] = true;
        }
        
        emit ProjectFunded(projectId, msg.sender, actualContribution, p.totalFunding);
        
        if (refundAmount > 0) {
            (bool refundSent, ) = payable(msg.sender).call{value: refundAmount}("");
            require(refundSent, "Refund failed");
        }
        
        if (p.totalFunding >= p.fundingGoal) {
            p.isCompleted = true;
            p.isActive = false;
            p.completedAt = block.timestamp;
            emit ProjectCompleted(projectId, msg.sender, block.timestamp);
            _releaseFunds(projectId);
        }
    }

    function fundProject(uint256 projectId) 
        external 
        payable 
        projectExists(projectId) 
        projectActive(projectId) 
    {
        _processContribution(projectId);
    }

    function contribute(uint256 projectId) 
        external 
        payable 
        projectExists(projectId) 
        projectActive(projectId) 
    {
        _processContribution(projectId);
    }

    function requestRefund(uint256 projectId) external projectExists(projectId) {
        Project storage p = projects[projectId];
        require(
            block.timestamp > p.fundingDeadline && !p.isCompleted,
            "Refund not available"
        );
        
        uint256 amount = contributorAmounts[projectId][msg.sender];
        require(amount > 0, "No contribution found");
        
        contributorAmounts[projectId][msg.sender] = 0;
        p.totalFunding -= amount;
        
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Refund failed");
        
        emit RefundIssued(projectId, msg.sender, amount);
    }

    function setProjectActive(uint256 projectId, bool _isActive) 
        external 
        onlyAdmin 
        projectExists(projectId) 
    {
        projects[projectId].isActive = _isActive;
    }

    function getProjectsCount() external view returns (uint256) {
        return projects.length;
    }

    function getProjectInfo(uint256 projectId) 
        external 
        view 
        projectExists(projectId) 
        returns (
            address owner,
            uint256 fundingGoal,
            uint256 totalFunding,
            bool isActive,
            bool isCompleted,
            bool fundsReleased,
            uint256 fundingDeadline
        ) 
    {
        Project storage p = projects[projectId];
        return (
            p.owner,
            p.fundingGoal,
            p.totalFunding,
            p.isActive,
            p.isCompleted,
            p.fundsReleased,
            p.fundingDeadline
        );
    }

    function getContributorAmount(uint256 projectId, address contributor)
        external
        view
        projectExists(projectId)
        returns (uint256)
    {
        return contributorAmounts[projectId][contributor];
    }

    function getContributorCount(uint256 projectId)
        external
        view
        projectExists(projectId)
        returns (uint256)
    {
        return projectContributors[projectId].length;
    }

    function hasContributed(uint256 projectId, address contributor)
        external
        view
        projectExists(projectId)
        returns (bool)
    {
        return isContributor[projectId][contributor];
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getMinimumFundingGoal() external pure returns (uint256) {
        return MIN_FUNDING_GOAL;
    }

    function getMinimumContribution() external pure returns (uint256) {
        return MIN_CONTRIBUTION;
    }

    receive() external payable {}
}
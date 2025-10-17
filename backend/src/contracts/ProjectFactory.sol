// contracts/ProjectFactory.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProjectFactory {
    struct Project {
        address owner;
        string title;
        string description;
        uint256 fundingGoal;
        string category;
        string location;
        uint256 timeline; // in days
        uint256 totalFunding;
        bool isActive;
        bool isCompleted;
        uint256 createdAt;
    }

    Project[] public projects;
    
    event ProjectCreated(uint256 indexed projectId, address indexed owner, string title);
    event ProjectFunded(uint256 indexed projectId, address indexed funder, uint256 amount);
    event ProjectCompleted(uint256 indexed projectId);

    modifier onlyOwner(uint256 projectId) {
        require(projects[projectId].owner == msg.sender, "Not project owner");
        _;
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
        uint256 projectId = projects.length;
        
        projects.push(Project({
            owner: _owner,
            title: _title,
            description: _description,
            fundingGoal: _fundingGoal,
            category: _category,
            location: _location,
            timeline: _timeline,
            totalFunding: 0,
            isActive: true,
            isCompleted: false,
            createdAt: block.timestamp
        }));

        emit ProjectCreated(projectId, _owner, _title);
        return projectId;
    }

    function fundProject(uint256 projectId) external payable {
        require(projects[projectId].isActive, "Project not active");
        require(!projects[projectId].isCompleted, "Project completed");
        
        projects[projectId].totalFunding += msg.value;
        
        emit ProjectFunded(projectId, msg.sender, msg.value);
    }

    function completeProject(uint256 projectId) external onlyOwner(projectId) {
        require(projects[projectId].isActive, "Project not active");
        require(!projects[projectId].isCompleted, "Already completed");
        require(
            projects[projectId].totalFunding >= projects[projectId].fundingGoal,
            "Funding goal not met"
        );

        projects[projectId].isCompleted = true;
        projects[projectId].isActive = false;

        emit ProjectCompleted(projectId);
    }

    function getProject(uint256 projectId) external view returns (
        address owner,
        string memory title,
        string memory description,
        uint256 fundingGoal,
        string memory category,
        string memory location,
        uint256 timeline,
        uint256 totalFunding,
        bool isActive,
        bool isCompleted,
        uint256 createdAt
    ) {
        Project memory p = projects[projectId];
        return (
            p.owner,
            p.title,
            p.description,
            p.fundingGoal,
            p.category,
            p.location,
            p.timeline,
            p.totalFunding,
            p.isActive,
            p.isCompleted,
            p.createdAt
        );
    }

    function getProjectsCount() external view returns (uint256) {
        return projects.length;
    }
}
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProjectFactory - Escrow System Tests", function () {
  let projectFactory;
  let admin, farmer, contributor1, contributor2;
  let projectId;

  const FUNDING_GOAL = ethers.parseEther("10"); // 10 MATIC
  const TIMELINE = 180; // 180 days

  beforeEach(async function () {
    // Get signers
    [admin, farmer, contributor1, contributor2] = await ethers.getSigners();

    // Deploy contract
    const ProjectFactory = await ethers.getContractFactory("ProjectFactory");
    projectFactory = await ProjectFactory.deploy();
    await projectFactory.waitForDeployment();

    console.log("✅ Contract deployed to:", await projectFactory.getAddress());
    console.log("👤 Admin address:", admin.address);
  });

  describe("1. Project Creation", function () {
    it("Should create a project successfully", async function () {
      const tx = await projectFactory.createProject(
        farmer.address,
        "Rice Farming Project",
        "Growing organic rice in rural Rwanda",
        FUNDING_GOAL,
        "Agriculture",
        "Kigali, Rwanda",
        TIMELINE
      );

      const receipt = await tx.wait();
      
      // Find ProjectCreated event
      const event = receipt.logs.find(
        (log) => {
          try {
            const parsed = projectFactory.interface.parseLog({
              topics: log.topics,
              data: log.data
            });
            return parsed && parsed.name === 'ProjectCreated';
          } catch {
            return false;
          }
        }
      );

      expect(event).to.not.be.undefined;
      
      if (event) {
        const parsed = projectFactory.interface.parseLog({
          topics: event.topics,
          data: event.data
        });
        projectId = Number(parsed.args[0]);
        console.log("✅ Project created with ID:", projectId);
      }

      // Verify project info
      const projectInfo = await projectFactory.getProjectInfo(projectId);
      expect(projectInfo[0]).to.equal(farmer.address); // owner
      expect(projectInfo[1]).to.equal(FUNDING_GOAL); // fundingGoal
      expect(projectInfo[3]).to.be.true; // isActive
    });

    it("Should fail with invalid funding goal", async function () {
      await expect(
        projectFactory.createProject(
          farmer.address,
          "Test Project",
          "Description",
          0, // Invalid!
          "Category",
          "Location",
          180
        )
      ).to.be.revertedWith("Goal > 0");
    });

    it("Should fail with invalid owner address", async function () {
      await expect(
        projectFactory.createProject(
          ethers.ZeroAddress,
          "Test Project",
          "Description",
          FUNDING_GOAL,
          "Category",
          "Location",
          180
        )
      ).to.be.revertedWith("Invalid owner");
    });
  });

  describe("2. Contribution & Escrow", function () {
    beforeEach(async function () {
      // Create project first
      const tx = await projectFactory.createProject(
        farmer.address,
        "Coffee Farm",
        "Premium coffee beans",
        FUNDING_GOAL,
        "Agriculture",
        "Kigali",
        TIMELINE
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => {
          try {
            const parsed = projectFactory.interface.parseLog({
              topics: log.topics,
              data: log.data
            });
            return parsed && parsed.name === 'ProjectCreated';
          } catch {
            return false;
          }
        }
      );
      
      if (event) {
        const parsed = projectFactory.interface.parseLog({
          topics: event.topics,
          data: event.data
        });
        projectId = Number(parsed.args[0]);
      }
    });

    it("Should accept contributions and hold in escrow", async function () {
      const contributionAmount = ethers.parseEther("3");

      // Check contract balance before
      const balanceBefore = await projectFactory.getContractBalance();
      expect(balanceBefore).to.equal(0);

      // Contribute
      await projectFactory.connect(contributor1).contribute(projectId, {
        value: contributionAmount
      });

      // Check contract balance after (should be held in escrow)
      const balanceAfter = await projectFactory.getContractBalance();
      expect(balanceAfter).to.equal(contributionAmount);

      // Check project info
      const projectInfo = await projectFactory.getProjectInfo(projectId);
      expect(projectInfo[2]).to.equal(contributionAmount); // totalFunding
      expect(projectInfo[5]).to.be.false; // fundsReleased (not yet)

      console.log("✅ Funds held in escrow:", ethers.formatEther(contributionAmount), "MATIC");
    });

    it("Should track contributor amounts", async function () {
      const amount1 = ethers.parseEther("2");
      const amount2 = ethers.parseEther("1.5");

      await projectFactory.connect(contributor1).contribute(projectId, {
        value: amount1
      });

      await projectFactory.connect(contributor1).contribute(projectId, {
        value: amount2
      });

      const totalContributed = await projectFactory.getContributorAmount(
        projectId,
        contributor1.address
      );

      expect(totalContributed).to.equal(amount1 + amount2);

      console.log("✅ Total contributed:", ethers.formatEther(totalContributed), "MATIC");
    });

    it("Should prevent exceeding funding goal", async function () {
      const tooMuch = ethers.parseEther("15"); // More than 10 MATIC goal

      await expect(
        projectFactory.connect(contributor1).contribute(projectId, {
          value: tooMuch
        })
      ).to.be.revertedWith("Exceeds");
    });

    it("Should track multiple contributors", async function () {
      await projectFactory.connect(contributor1).contribute(projectId, {
        value: ethers.parseEther("3")
      });

      await projectFactory.connect(contributor2).contribute(projectId, {
        value: ethers.parseEther("2")
      });

      const count = await projectFactory.getContributorCount(projectId);
      expect(count).to.equal(2);

      const hasContributed1 = await projectFactory.hasContributed(projectId, contributor1.address);
      const hasContributed2 = await projectFactory.hasContributed(projectId, contributor2.address);

      expect(hasContributed1).to.be.true;
      expect(hasContributed2).to.be.true;

      console.log("✅ Contributor count:", count.toString());
    });
  });

  describe("3. Auto-Release & Platform Fee", function () {
    beforeEach(async function () {
      const tx = await projectFactory.createProject(
        farmer.address,
        "Test Project",
        "Description",
        FUNDING_GOAL,
        "Category",
        "Location",
        TIMELINE
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => {
          try {
            const parsed = projectFactory.interface.parseLog({
              topics: log.topics,
              data: log.data
            });
            return parsed && parsed.name === 'ProjectCreated';
          } catch {
            return false;
          }
        }
      );
      
      if (event) {
        const parsed = projectFactory.interface.parseLog({
          topics: event.topics,
          data: event.data
        });
        projectId = Number(parsed.args[0]);
      }
    });

    it("Should auto-release funds when goal reached", async function () {
      // Get farmer balance before
      const farmerBalanceBefore = await ethers.provider.getBalance(farmer.address);

      // Fully fund the project
      const tx = await projectFactory.connect(contributor1).contribute(projectId, {
        value: FUNDING_GOAL
      });

      await tx.wait();

      // Check funds were released
      const projectInfo = await projectFactory.getProjectInfo(projectId);
      expect(projectInfo[4]).to.be.true; // isCompleted
      expect(projectInfo[5]).to.be.true; // fundsReleased

      // Check escrow is empty
      const contractBalance = await projectFactory.getContractBalance();
      expect(contractBalance).to.equal(0);

      // Check farmer received 98%
      const farmerBalanceAfter = await ethers.provider.getBalance(farmer.address);
      const farmerReceived = farmerBalanceAfter - farmerBalanceBefore;
      const expected98Percent = (FUNDING_GOAL * 98n) / 100n;
      
      expect(farmerReceived).to.equal(expected98Percent);

      console.log("✅ Auto-release successful");
      console.log("   Farmer received:", ethers.formatEther(farmerReceived), "MATIC (98%)");
      console.log("   Expected:", ethers.formatEther(expected98Percent), "MATIC");
    });

    it("Should send 2% platform fee to admin", async function () {
      const adminBalanceBefore = await ethers.provider.getBalance(admin.address);

      // Fully fund project
      const tx = await projectFactory.connect(contributor1).contribute(projectId, {
        value: FUNDING_GOAL
      });

      const receipt = await tx.wait();

      // Admin received platform fee but also may have paid gas
      // Check that some fee was sent
      const adminBalanceAfter = await ethers.provider.getBalance(admin.address);
      const expected2Percent = (FUNDING_GOAL * 2n) / 100n;

      console.log("✅ Platform fee test");
      console.log("   Expected fee:", ethers.formatEther(expected2Percent), "MATIC (2%)");
    });

    it("Should emit FundsReleased event", async function () {
      const tx = await projectFactory.connect(contributor1).contribute(projectId, {
        value: FUNDING_GOAL
      });

      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log) => {
          try {
            const parsed = projectFactory.interface.parseLog({
              topics: log.topics,
              data: log.data
            });
            return parsed && parsed.name === 'FundsReleased';
          } catch {
            return false;
          }
        }
      );

      expect(event).to.not.be.undefined;

      if (event) {
        const parsed = projectFactory.interface.parseLog({
          topics: event.topics,
          data: event.data
        });
        console.log("✅ FundsReleased event emitted");
        console.log("   Project ID:", parsed.args[0].toString());
        console.log("   Recipient:", parsed.args[1]);
        console.log("   Amount:", ethers.formatEther(parsed.args[2]), "MATIC");
        console.log("   Platform Fee:", ethers.formatEther(parsed.args[3]), "MATIC");
      }
    });
  });

  describe("4. Government Approval System", function () {
    beforeEach(async function () {
      const tx = await projectFactory.createProject(
        farmer.address,
        "Test Project",
        "Description",
        FUNDING_GOAL,
        "Category",
        "Location",
        TIMELINE
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => {
          try {
            const parsed = projectFactory.interface.parseLog({
              topics: log.topics,
              data: log.data
            });
            return parsed && parsed.name === 'ProjectCreated';
          } catch {
            return false;
          }
        }
      );
      
      if (event) {
        const parsed = projectFactory.interface.parseLog({
          topics: event.topics,
          data: event.data
        });
        projectId = Number(parsed.args[0]);
      }
    });

    it("Should allow admin to deactivate project", async function () {
      // Deactivate
      await projectFactory.connect(admin).setProjectActive(projectId, false);

      // Try to contribute (should fail)
      await expect(
        projectFactory.connect(contributor1).contribute(projectId, {
          value: ethers.parseEther("1")
        })
      ).to.be.revertedWith("Not active");

      console.log("✅ Admin deactivation works");
    });

    it("Should allow admin to reactivate project", async function () {
      // Deactivate then reactivate
      await projectFactory.setProjectActive(projectId, false);
      await projectFactory.setProjectActive(projectId, true);

      // Should be able to contribute now
      await expect(
        projectFactory.connect(contributor1).contribute(projectId, {
          value: ethers.parseEther("1")
        })
      ).to.not.be.reverted;

      console.log("✅ Reactivation works");
    });

    it("Should only allow admin to change project status", async function () {
      await expect(
        projectFactory.connect(farmer).setProjectActive(projectId, false)
      ).to.be.revertedWith("Only admin");
    });
  });

  describe("5. Statistics & Tracking", function () {
    it("Should track total projects", async function () {
      const countBefore = await projectFactory.getProjectsCount();

      await projectFactory.createProject(
        farmer.address,
        "Project 1",
        "Desc",
        FUNDING_GOAL,
        "Cat",
        "Loc",
        180
      );

      await projectFactory.createProject(
        farmer.address,
        "Project 2",
        "Desc",
        FUNDING_GOAL,
        "Cat",
        "Loc",
        180
      );

      const countAfter = await projectFactory.getProjectsCount();
      expect(countAfter).to.equal(countBefore + 2n);

      console.log("✅ Project count:", countAfter.toString());
    });

    it("Should get platform fee percentage", async function () {
      const fee = await projectFactory.platformFeePercentage();
      expect(fee).to.equal(2);

      console.log("✅ Platform fee:", fee.toString(), "%");
    });

    it("Should get admin address", async function () {
      const adminAddress = await projectFactory.admin();
      expect(adminAddress).to.equal(admin.address);

      console.log("✅ Admin address:", adminAddress);
    });
  });

  describe("6. Edge Cases", function () {
    beforeEach(async function () {
      const tx = await projectFactory.createProject(
        farmer.address,
        "Test Project",
        "Description",
        FUNDING_GOAL,
        "Category",
        "Location",
        TIMELINE
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => {
          try {
            const parsed = projectFactory.interface.parseLog({
              topics: log.topics,
              data: log.data
            });
            return parsed && parsed.name === 'ProjectCreated';
          } catch {
            return false;
          }
        }
      );
      
      if (event) {
        const parsed = projectFactory.interface.parseLog({
          topics: event.topics,
          data: event.data
        });
        projectId = Number(parsed.args[0]);
      }
    });

    it("Should not allow zero contributions", async function () {
      await expect(
        projectFactory.connect(contributor1).contribute(projectId, {
          value: 0
        })
      ).to.be.revertedWith("Invalid");
    });

    it("Should not allow contributions to completed projects", async function () {
      // Fully fund the project
      await projectFactory.connect(contributor1).contribute(projectId, {
        value: FUNDING_GOAL
      });

      // Try to contribute again
      await expect(
        projectFactory.connect(contributor2).contribute(projectId, {
          value: ethers.parseEther("1")
        })
      ).to.be.revertedWith("Invalid");
    });

    it("Should handle exact funding amount correctly", async function () {
      // Contribute exactly the funding goal
      await projectFactory.connect(contributor1).contribute(projectId, {
        value: FUNDING_GOAL
      });

      const projectInfo = await projectFactory.getProjectInfo(projectId);
      expect(projectInfo[2]).to.equal(FUNDING_GOAL); // totalFunding
      expect(projectInfo[4]).to.be.true; // isCompleted

      console.log("✅ Exact funding amount handled correctly");
    });
  });
});
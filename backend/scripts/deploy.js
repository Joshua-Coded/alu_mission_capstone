const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ProjectFactory...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "MATIC");

  const ProjectFactory = await hre.ethers.getContractFactory("ProjectFactory");
  const contract = await ProjectFactory.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("✅ Deployed to:", address);
  console.log("\n📝 Add to .env:");
  console.log(`CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
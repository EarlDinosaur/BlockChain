const { ethers } = require("hardhat");

async function main() {
  const fileRegistry = await ethers.deployContract("FileRegistry");
  await fileRegistry.waitForDeployment();
  console.log(`FileRegistry deployed to ${fileRegistry.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying CowNFT with account:", deployer.address);

  const CowNFT = await ethers.getContractFactory("CowNFT");
  const beraborrowAddress = "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7"

  const cowNFT = await CowNFT.deploy(beraborrowAddress);
  await cowNFT.waitForDeployment();

  console.log("CowNFT deployed to:", await cowNFT.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

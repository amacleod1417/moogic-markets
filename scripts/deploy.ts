import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  const MoogicMarket = await ethers.getContractFactory("MoogicMarket");

  // Replace these with real deployed addresses on Coston if needed
  const fdc = "0x0000000000000000000000000000000000000000";
  const ftso = "0x0000000000000000000000000000000000000000";
  const rng = "0x0000000000000000000000000000000000000000";

  const contract = await MoogicMarket.deploy(fdc, ftso, rng);
  await contract.waitForDeployment();

  console.log("✅ MoogicMarket deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

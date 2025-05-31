import { ethers } from "hardhat"

async function main() {
  const [deployer] = await ethers.getSigners()

  // Replace these with the actual deployed addresses (or mock ones for testing)
  const FDC_ADDRESS = "0x6a7e41eaa143fd310bdb69e0e336885ccf4b9e8c"
  const FTSO_ADDRESS = "0x33da0497ccedf4f5f9ab210fdb8406c9aeb6b7cf"
  const RNG_ADDRESS = "0x3b16c61fcad12292f75dc4cc9d1528f6c64c00c3"

  const MoogicMarket = await ethers.getContractFactory("MoogicMarket")
  const contract = await MoogicMarket.deploy(FDC_ADDRESS, FTSO_ADDRESS, RNG_ADDRESS)

  await contract.waitForDeployment()

  console.log("MoogicMarket deployed to:", await contract.getAddress())
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

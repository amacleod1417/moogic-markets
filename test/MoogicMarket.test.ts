import { expect } from "chai";
import { ethers } from "hardhat";

describe("MoogicMarket Integration", function () {
  let market: any;
  let fdc: any;
  let ftso: any;
  let rng: any;

  beforeEach(async () => {
    const [deployer] = await ethers.getSigners();

    // 🧠 Fix is RIGHT HERE: await deployment directly!
    const FDC = await ethers.getContractFactory("MockFDC");
    fdc = await FDC.deploy();
    await fdc.waitForDeployment();
    console.log("MockFDC deployed to:", await fdc.getAddress());

    const FTSO = await ethers.getContractFactory("MockFTSO");
    ftso = await FTSO.deploy();
    await ftso.waitForDeployment();

    const MockRNG = await ethers.getContractFactory("MockRNG");
    rng = await MockRNG.deploy(deployer.address);
    await rng.waitForDeployment();
    

    const Market = await ethers.getContractFactory("MoogicMarket");
    market = await Market.deploy(
      await fdc.getAddress(),
      await ftso.getAddress(),
      await rng.getAddress()
    );
    await market.waitForDeployment();
  });

  it("can resolve market using FDC mock", async () => {
    const queryId = ethers.keccak256(ethers.toUtf8Bytes("rain_001"));
    const encodedResult = ethers.AbiCoder.defaultAbiCoder().encode(["bool"], [true]);

    await fdc.setData(queryId, encodedResult);

    await ethers.provider.send("evm_increaseTime", [1000]);
    await ethers.provider.send("evm_mine", []);


    const block = await ethers.provider.getBlock("latest");
    const futureTime = block!.timestamp + 60;
    await market.createMarket("Did it rain?", futureTime);

    // Fast forward past the deadline
    await ethers.provider.send("evm_increaseTime", [4000]);
    await ethers.provider.send("evm_mine", []);

    // Push data and resolve
    await fdc.setData(queryId, encodedResult);
    await market.resolveFromFDC(0, queryId);

    const resolved = await market.markets(0);
    expect(resolved.resolved).to.be.true;
    expect(resolved.outcome).to.equal(true);
  });
});

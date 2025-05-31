import * as dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
    solidity: "0.8.20",
    networks: {
      coston2: {
        url: "https://coston2-api.flare.network/ext/C/rpc",
        accounts: [process.env.PRIVATE_KEY!], // Make sure PRIVATE_KEY is defined in your .env
        chainId: 114,
      },
    },
  }

export default config;

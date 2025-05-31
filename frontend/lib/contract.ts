import { ethers } from "ethers";
import MoogicMarketsABI from "../../artifacts/contracts/MoogicMarkets.sol/MoogicMarket.json"; 

declare global {
  interface Window {
    ethereum: any;
  }
}

const CONTRACT_ADDRESS = "0x9fE3dffDdC2918C59823eBa8420835F0226f03c4";

let provider: ethers.BrowserProvider | null = null;

export const getProvider = () => {
  if (!window.ethereum) throw new Error("MetaMask not found");
  if (!provider) provider = new ethers.BrowserProvider(window.ethereum);
  return provider;
};

export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

export const getMoogicMarketContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, MoogicMarketsABI.abi, signer);
};



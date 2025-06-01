import { ethers } from "ethers"
import { MoogicMarketABI, CONTRACT_ADDRESS } from "./web3"

const BLOCKSCOUT_API_URL = "https://blockscout.com/flr/coston/api/v2"

export type MeritsData = {
  address: string
  merits: number
  rank: number
  username: string
  totalPredictions: number
  winRate: number
}

export async function fetchUserMerits(provider: ethers.Provider, address: string): Promise<number> {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, MoogicMarketABI, provider)
    const merits = await contract.merits(address)
    return Number(merits)
  } catch (error) {
    console.error("Error fetching user merits:", error)
    return 0
  }
}

export async function fetchLeaderboard(provider: ethers.Provider, users: string[]): Promise<MeritsData[]> {
  try {
    const meritsData = await Promise.all(
      users.map(async (address) => ({
        address,
        merits: await fetchUserMerits(provider, address)
      }))
    )

    // Sort by merits in descending order
    return meritsData.sort((a, b) => b.merits - a.merits)
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }
}

export function getExplorerUrl(type: "tx" | "address", hash: string): string {
  return `https://blockscout.com/flr/coston/${type}/${hash}`
} 
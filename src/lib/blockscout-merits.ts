import { ethers } from "ethers"

const BLOCKSCOUT_API_URL = "https://blockscout.com/flr/coston/api/v2"

export type MeritsData = {
  address: string
  merits: number
}

export async function fetchUserMerits(address: string): Promise<number> {
  try {
    const response = await fetch(`${BLOCKSCOUT_API_URL}/addresses/${address}/tokens?type=ERC-20`)
    const data = await response.json()
    
    // Find the Merits token in the response
    const meritsToken = data.data.find((token: any) => 
      token.token.symbol === "MERITS" || 
      token.token.name.toLowerCase().includes("merits")
    )
    
    return meritsToken ? Number(ethers.formatUnits(meritsToken.value, meritsToken.token.decimals)) : 0
  } catch (error) {
    console.error("Error fetching user merits:", error)
    return 0
  }
}

export async function fetchLeaderboard(users: string[]): Promise<MeritsData[]> {
  try {
    const meritsData = await Promise.all(
      users.map(async (address) => ({
        address,
        merits: await fetchUserMerits(address)
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
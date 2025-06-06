"use client"

import * as React from "react"

import { ethers } from "ethers"
import { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "../components/ui/use-toast"
import { type MeritsData, fetchLeaderboard as fetchLeaderboardData } from "./blockscout-merits"

declare global {
  interface Window {
    ethereum?: any
  }
}

export const SUPPORTED_NETWORKS = {
  FLARE: {
    chainId: 14,
    name: "Flare Mainnet",
  },
  COSTON2: {
    chainId: 114,
    name: "Coston2 Testnet",
  },
} as const

// ABI for the MoogicMarket contract
export const MoogicMarketABI = [
  "function createMarket(string memory _question, uint256 _deadline, uint8 _marketType, uint256 _optionCount) external",
  "function createMultiOptionMarket(string memory _question, uint256 _deadline, uint256 _optionCount) external",
  "function placeBet(uint256 _id, uint256 selectedOption) external payable",
  "function resolveMarket(uint256 _id, bool _externalOutcome) external",
  "function claimReward(uint256 _id) external",
  "function markets(uint256 id) external view returns (uint256 id, string memory question, uint256 deadline, uint8 status, uint8 marketType, bool outcome, uint256 winningOption, uint256 totalYes, uint256 totalNo, uint256 resolutionTimestamp, bool resolved, uint256 optionCount)",
  "function bets(uint256 marketId, address bettor) external view returns (bool prediction, uint256 amount, bool claimed)",
  "function userSelections(uint256 marketId, address user) external view returns (uint256)",
  "function optionStakes(uint256 marketId, uint256 option) external view returns (uint256)",
  "function marketId() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function merits(address user) external view returns (uint256)",
  "function topStakerByMarket(uint256 marketId) external view returns (address)",
  "function topStakeByMarket(uint256 marketId) external view returns (uint256)",
  "event MeritEarned(uint256 indexed marketId, address indexed user, uint256 totalMerits)",
  "event RewardClaimed(uint256 indexed marketId, address indexed bettor, uint256 amount)",
  "event BonusWinnerSelected(uint256 indexed marketId, address indexed winner)"
]

// Contract address - will be set from environment variable
export const CONTRACT_ADDRESS: string = "0x01a5B26EdeC3e2B4f17BC3D95c47ec8d752AC921"
console.log(CONTRACT_ADDRESS)
export type Market = {
  id: number
  question: string
  deadline: Date
  status: "OPEN" | "CLOSED" | "RESOLVED"
  marketType: "BINARY" | "MULTI"
  outcome: boolean | null
  winningOption: number | null
  totalYes: number
  totalNo: number
  resolutionTimestamp: Date | null
  resolved: boolean
  optionCount: number
  odds: {
    yes: number
    no: number
  }
  topStaker?: string
  topStake?: string
}

export type Bet = {
  prediction: boolean | number // boolean for binary, number for multi-option
  amount: string
  claimed: boolean
}

type Web3ContextType = {
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  contract: ethers.Contract | null
  address: string | null
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  markets: Market[]
  loadMarkets: () => Promise<void>
  placeBet: (marketId: number, prediction: boolean, amount: string) => Promise<void>
  claimReward: (marketId: number) => Promise<void>
  getUserBet: (marketId: number) => Promise<Bet | null>
  refreshMarket: (marketId: number) => Promise<Market | null>
  contractStatus: "checking" | "found" | "not-found" | "not-configured"
  getUserMerits: () => Promise<number>
  getTopStaker: (marketId: number) => Promise<{ address: string; stake: string }>
  userMerits: number
  fetchLeaderboard: () => Promise<MeritsData[]>
  getExplorerUrl: (type: "tx" | "address", hash: string) => string
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  contract: null,
  address: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
  markets: [],
  loadMarkets: async () => {},
  placeBet: async () => {},
  claimReward: async () => {},
  getUserBet: async () => null,
  refreshMarket: async () => null,
  contractStatus: "checking",
  getUserMerits: async () => 0,
  getTopStaker: async () => ({ address: "", stake: "0" }),
  userMerits: 0,
  fetchLeaderboard: async () => [],
  getExplorerUrl: () => ""
})

export const useWeb3 = () => useContext(Web3Context)

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [markets, setMarkets] = useState<Market[]>([])
  const [contractStatus, setContractStatus] = useState<"checking" | "found" | "not-found" | "not-configured">(
    "checking",
  )
  const [userMerits, setUserMerits] = useState<number>(0)
  const [leaderboard, setLeaderboard] = useState<MeritsData[]>([])
  const { toast } = useToast()

  // Check contract status
  useEffect(() => {
    const checkContract = async () => {
      if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
        setContractStatus("not-configured")
        return
      }

      if (provider) {
        try {
          let code: string
          try {
            code = await provider.getCode(CONTRACT_ADDRESS)
          } catch (e) {
            console.error("Rate limited when checking contract code:", e)
            return // or retry after delay
          }
          console.log("Current network:", await provider.getNetwork())
        console.log("Checking contract code at:", CONTRACT_ADDRESS)
        console.log("Result of getCode:", code)
          if (code && code !== "0x") {
            setContractStatus("found")
          } else {
            setContractStatus("not-found")
          }
        } catch (error) {
          console.error("Error checking contract:", error)
          setContractStatus("not-found")
        }
      }
    }

    checkContract()
  }, [provider])

  // Connect wallet
  const connect = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet")
      return
    }

    try {
      setIsConnecting(true)
      
      // Request account access first
      await window.ethereum.request({ method: "eth_requestAccounts" })
      
      // Then try to switch/add network
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x72" }],
        })
      } catch (switchError: any) {
        // If not added yet, add and then switch
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x72",
                  chainName: "Flare Coston2 Testnet",
                  rpcUrls: ["https://coston2-api.flare.network/ext/C/rpc"],
                  blockExplorerUrls: ["https://coston2-explorer.flare.network/"],
                  nativeCurrency: {
                    name: "Coston2 FLR",
                    symbol: "C2FLR",
                    decimals: 18,
                  }
                },
              ],
            })
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x72" }],
            })
          } catch (addError) {
            console.error("Failed to add or switch to Coston:", addError)
            alert("Could not add or switch to Flare Coston network")
            return
          }
        } else {
          console.error("Failed to switch to Coston:", switchError)
          alert("Could not switch to Flare Coston network")
          return
        }
      }

      const browserProvider = new ethers.BrowserProvider(window.ethereum)
      const network = await browserProvider.getNetwork()
      const userSigner = await browserProvider.getSigner()
      const userAddress = await userSigner.getAddress()

      setProvider(browserProvider)
      setSigner(userSigner)
      setContract(new ethers.Contract(CONTRACT_ADDRESS, MoogicMarketABI, userSigner))
      setAddress(userAddress)
      setChainId(Number(network.chainId))
      setIsConnected(true)

      if (contractStatus === "found") {
        await loadMarketsInternal(new ethers.Contract(CONTRACT_ADDRESS, MoogicMarketABI, userSigner))
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      alert(`Failed to connect wallet: ${error?.message || "Unknown error"}`)
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet
  const disconnect = () => {
    setProvider(null)
    setSigner(null)
    setContract(null)
    setAddress(null)
    setChainId(null)
    setIsConnected(false)
    setMarkets([])
    console.log("Wallet disconnected")
  }

  // Internal load markets function
  const loadMarketsInternal = async (contractToUse?: ethers.Contract) => {
    const activeContract = contractToUse || contract
    if (!activeContract) {
      console.log("No contract available")
      return
    }

    if (contractStatus !== "found") {
      console.log("Contract not found, skipping market load")
      return
    }

    try {
      console.log("Loading markets from contract:", CONTRACT_ADDRESS)

      const marketIdBN = await activeContract.marketId()
      const marketCount = Number(marketIdBN)
      console.log("Total markets found:", marketCount)

      if (marketCount === 0) {
        console.log("No markets created yet")
        setMarkets([])
        return
      }

      const marketsData: Market[] = []

for (let i = 0; i < marketCount; i++) {
  try {
    const market = await refreshMarketInternal(i, activeContract)
    if (market) marketsData.push(market)
    
    // 💤 Wait 200ms between requests
    await new Promise(resolve => setTimeout(resolve, 200))
  } catch (error) {
    console.error(`Error loading market ${i}:`, error)
  }
}

      console.log("Loaded markets:", marketsData)
      setMarkets(marketsData)
    } catch (error) {
      console.error("Error loading markets:", error)
      setMarkets([])
    }
  }

  // Public load markets function
  const loadMarkets = async () => {
    await loadMarketsInternal()
  }

  // Internal refresh market function
  const refreshMarketInternal = async (marketId: number, contractToUse?: ethers.Contract): Promise<Market | null> => {
    const activeContract = contractToUse || contract
    if (!activeContract) return null

    try {
      const [marketData, topStakerInfo] = await Promise.all([
        activeContract.markets(marketId),
        getTopStaker(marketId)
      ])

      // Calculate odds based on total bets
      const totalYesEth = ethers.formatEther(marketData[7])
      const totalNoEth = ethers.formatEther(marketData[8])
      const totalPool = Number(totalYesEth) + Number(totalNoEth)

      // Default odds if no bets
      let yesOdds = 2.0
      let noOdds = 2.0

      if (totalPool > 0) {
        if (Number(totalYesEth) > 0) {
          yesOdds = totalPool / Number(totalYesEth)
        }
        if (Number(totalNoEth) > 0) {
          noOdds = totalPool / Number(totalNoEth)
        }
      }

      // Format to 2 decimal places
      yesOdds = Number.parseFloat(yesOdds.toFixed(2))
      noOdds = Number.parseFloat(noOdds.toFixed(2))

      const market: Market = {
        id: Number(marketData[0]),
        question: marketData[1],
        deadline: new Date(Number(marketData[2]) * 1000),
        status: ["OPEN", "CLOSED", "RESOLVED"][Number(marketData[3])] as "OPEN" | "CLOSED" | "RESOLVED",
        marketType: Number(marketData[4]) === 0 ? "BINARY" : "MULTI",
        outcome: marketData[5],
        winningOption: Number(marketData[6]),
        totalYes: Number(ethers.formatEther(marketData[7])),
        totalNo: Number(ethers.formatEther(marketData[8])),
        resolutionTimestamp: Number(marketData[9]) > 0 ? new Date(Number(marketData[9]) * 1000) : null,
        resolved: marketData[10],
        optionCount: Number(marketData[11]),
        odds: {
          yes: yesOdds,
          no: noOdds,
        },
        topStaker: topStakerInfo.address,
        topStake: topStakerInfo.stake
      }

      return market
    } catch (error) {
      console.error(`Error refreshing market ${marketId}:`, error)
      return null
    }
  }

  // Public refresh market function
  const refreshMarket = async (marketId: number): Promise<Market | null> => {
    return await refreshMarketInternal(marketId)
  }

  // Place a bet
  const placeBet = async (marketId: number, prediction: boolean, amount: string) => {
    if (!signer) return alert("Please connect wallet");

    try {
      const marketContract = new ethers.Contract(CONTRACT_ADDRESS, MoogicMarketABI, signer);
      const selectedOption = prediction ? 1 : 0;

      const tx = await marketContract.placeBet(marketId, selectedOption, {
        value: ethers.parseEther(amount),
      });

      await tx.wait();
      console.log("Bet placed!");
      
      // Refresh markets immediately after bet is placed
      await loadMarketsInternal(marketContract);
      
      // Also refresh user merits
      await getUserMerits();
    } catch (error: any) {
      console.error("Error placing bet:", error);
      alert(`Failed to place bet: ${error?.message || "Unknown error"}`);
    }
  };

  // Add auto-refresh interval for markets
  useEffect(() => {
    if (isConnected && contractStatus === "found") {
      const interval = setInterval(() => {
        loadMarkets();
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(interval);
    }
  }, [isConnected, contractStatus, loadMarkets]);
  
  // Claim reward
  const claimReward = async (marketId: number) => {
    if (!contract || !signer) {
      alert("Please connect your wallet first")
      return
    }

    try {
      console.log(`Claiming reward for market ${marketId}`)

      const tx = await contract.claimReward(marketId)
      console.log("Transaction sent:", tx.hash)

      const receipt = await tx.wait()
      console.log("Reward claimed successfully!")

      // Check for events
      const meritEarned = receipt.logs.some((log: { fragment?: { name: string }, args?: { user: string } }) => 
        log.fragment?.name === "MeritEarned" && 
        log.args?.user.toLowerCase() === address?.toLowerCase()
      )

      const bonusReceived = receipt.logs.some((log: { fragment?: { name: string }, args?: { winner: string } }) => 
        log.fragment?.name === "BonusWinnerSelected" && 
        log.args?.winner.toLowerCase() === address?.toLowerCase()
      )

      // Update UI based on events
      if (meritEarned) {
        await getUserMerits()
        toast({
          title: "🎉 Merit Earned!",
          description: "You've earned a merit point for your successful prediction!",
          variant: "default",
        })
      }

      if (bonusReceived) {
        toast({
          title: "👑 Bonus Reward!",
          description: "You received a bonus reward as the top staker!",
          variant: "default",
        })
      }

      toast({
        title: "Success!",
        description: "Your reward has been claimed successfully.",
        variant: "default",
      })

      await loadMarkets()
    } catch (error: any) {
      console.error("Error claiming reward:", error)
      toast({
        title: "Error",
        description: `Failed to claim reward: ${error?.message || "Unknown error"}`,
        variant: "destructive",
      })
    }
  }

  // Get user's bet for a market
  const getUserBet = async (marketId: number): Promise<Bet | null> => {
    if (!contract || !address) return null

    try {
      const market = await refreshMarketInternal(marketId)
      if (!market) return null

      if (market.marketType === "BINARY") {
        const betData = await contract.bets(marketId, address)
        return {
          prediction: betData[0],
          amount: ethers.formatEther(betData[1]),
          claimed: betData[2],
        }
      } else {
        const selection = await contract.userSelections(marketId, address)
        if (selection.eq(0)) return null
        
        const option = selection.toNumber() - 1
        const stake = await contract.optionStakes(marketId, option)
        
        return {
          prediction: option,
          amount: ethers.formatEther(stake),
          claimed: false, // You'll need to track this separately for multi-option markets
        }
      }
    } catch (error) {
      console.error(`Error getting bet for market ${marketId}:`, error)
      return null
    }
  }

  // Get user's merits
  const getUserMerits = async (): Promise<number> => {
    if (!contract || !address) return 0
    try {
      const merits = await contract.merits(address)
      setUserMerits(Number(merits))
      return Number(merits)
    } catch (error) {
      console.error("Error getting user merits:", error)
      return 0
    }
  }

  // Get top staker for a market
  const getTopStaker = async (marketId: number): Promise<{ address: string; stake: string }> => {
    if (!contract) return { address: "", stake: "0" }
    try {
      const [staker, stake] = await Promise.all([
        contract.topStakerByMarket(marketId),
        contract.topStakeByMarket(marketId)
      ])
      return {
        address: staker,
        stake: ethers.formatEther(stake)
      }
    } catch (error) {
      console.error("Error getting top staker:", error)
      return { address: "", stake: "0" }
    }
  }

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = () => {
        disconnect()
      }

      const handleChainChanged = () => {
        window.location.reload()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    }
  }, [])

  // Add new functions
  const fetchLeaderboard = async (): Promise<MeritsData[]> => {
    if (!contract || !provider) {
      // Return mock data when contract/provider is not available
      return [
        {
          address: "0x1234...5678",
          merits: 750,
          rank: 1,
          username: "BessieWhisperer",
          totalPredictions: 45,
          winRate: 0.89
        },
        {
          address: "0x2345...6789",
          merits: 520,
          rank: 2,
          username: "DairyKing",
          totalPredictions: 38,
          winRate: 0.82
        },
        {
          address: "0x3456...7890",
          merits: 480,
          rank: 3,
          username: "MilkMaster",
          totalPredictions: 42,
          winRate: 0.79
        },
        {
          address: "0x4567...8901",
          merits: 320,
          rank: 4,
          username: "CalfExpert",
          totalPredictions: 29,
          winRate: 0.75
        },
        {
          address: "0x5678...9012",
          merits: 280,
          rank: 5,
          username: "FarmOracle",
          totalPredictions: 25,
          winRate: 0.72
        },
        {
          address: "0x6789...0123",
          merits: 210,
          rank: 6,
          username: "HayHero",
          totalPredictions: 18,
          winRate: 0.68
        },
        {
          address: "0x7890...1234",
          merits: 180,
          rank: 7,
          username: "BarnBuddy",
          totalPredictions: 15,
          winRate: 0.65
        },
        {
          address: "0x8901...2345",
          merits: 150,
          rank: 8,
          username: "MilkMaven",
          totalPredictions: 12,
          winRate: 0.62
        },
        {
          address: "0x9012...3456",
          merits: 120,
          rank: 9,
          username: "CattleCaller",
          totalPredictions: 10,
          winRate: 0.60
        },
        {
          address: "0x0123...4567",
          merits: 90,
          rank: 10,
          username: "FarmFresh",
          totalPredictions: 8,
          winRate: 0.58
        }
      ]
    }
    
    try {
      // Get all MeritEarned events to find users who have earned merits
      const filter = contract.filters.MeritEarned()
      const events = await contract.queryFilter(filter)
      
      // Create a map to store user merits
      const userMeritsMap = new Map<string, number>()
      
      // Process all MeritEarned events
      for (const event of events) {
        if ('args' in event) {
          const user = event.args?.user
          if (user) {
            const currentMerits = userMeritsMap.get(user) || 0
            userMeritsMap.set(user, currentMerits + 1)
          }
        }
      }
      
      // Convert map to array and sort by merits
      const leaderboardData = Array.from(userMeritsMap.entries())
        .map(([address, merits], index) => ({
          address,
          merits,
          rank: index + 1,
          username: `User${index + 1}`, // You can replace this with actual usernames if available
          totalPredictions: Math.floor(merits * 1.5), // Estimate based on merits
          winRate: 0.7 + (Math.random() * 0.2) // Random win rate between 70-90%
        }))
        .sort((a, b) => b.merits - a.merits)
      
      setLeaderboard(leaderboardData)
      return leaderboardData
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      return []
    }
  }

  const getExplorerUrl = (type: "tx" | "address", hash: string) => {
    return `https://blockscout.com/flr/coston/${type}/${hash}`
  }

  const value = {
    provider,
    signer,
    contract,
    address,
    chainId,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    markets,
    loadMarkets,
    placeBet,
    claimReward,
    getUserBet,
    refreshMarket,
    contractStatus,
    getUserMerits,
    getTopStaker,
    userMerits,
    fetchLeaderboard,
    getExplorerUrl,
  }

  return React.createElement(Web3Context.Provider, { value }, children)
}

"use client"

import * as React from "react"

import { ethers } from "ethers"
import { createContext, useContext, useEffect, useState } from "react"

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
  "function createMarket(string memory _question, uint256 _deadline) external",
  "function placeBet(uint256 _id, bool _prediction) external payable",
  "function resolveMarket(uint256 _id, bool _externalOutcome) external",
  "function claimReward(uint256 _id) external",
  "function markets(uint256 id) external view returns (uint256 id, string memory question, uint256 deadline, uint8 status, bool outcome, uint256 totalYes, uint256 totalNo, uint256 resolutionTimestamp, bool resolved)",
  "function bets(uint256 marketId, address bettor) external view returns (bool prediction, uint256 amount, bool claimed)",
  "function marketId() external view returns (uint256)",
  "function owner() external view returns (address)",
]

// Contract address - will be set from environment variable
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"
console.log(CONTRACT_ADDRESS)
export type Market = {
  id: number
  question: string
  deadline: Date
  status: "OPEN" | "CLOSED" | "RESOLVED"
  outcome: boolean | null
  totalYes: string
  totalNo: string
  resolutionTimestamp: Date | null
  resolved: boolean
  odds: {
    yes: number
    no: number
  }
}

export type Bet = {
  prediction: boolean
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

  // Check contract status
  useEffect(() => {
    const checkContract = async () => {
      if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
        setContractStatus("not-configured")
        return
      }

      if (provider) {
        try {
          const code = await provider.getCode(CONTRACT_ADDRESS)
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
      
      // Request account access
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
                    chainId: "0x72", // Hex for 114
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
      
            // Try switching again after adding
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

      console.log("Connected to network:", Number(network.chainId), network.name)
      console.log("User address:", userAddress)
      console.log("Contract address:", CONTRACT_ADDRESS)

      const marketContract = new ethers.Contract(CONTRACT_ADDRESS, MoogicMarketABI, userSigner)

      setProvider(browserProvider)
      setSigner(userSigner)
      setContract(marketContract)
      setAddress(userAddress)
      setChainId(Number(network.chainId))
      setIsConnected(true)

      // Load markets after connecting
      if (contractStatus === "found") {
        await loadMarketsInternal(marketContract)
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
      const marketData = await activeContract.markets(marketId)

      // Calculate odds based on total bets
      const totalYesEth = ethers.formatEther(marketData[5])
      const totalNoEth = ethers.formatEther(marketData[6])
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
        outcome: marketData[4],
        totalYes: ethers.formatEther(marketData[5]),
        totalNo: ethers.formatEther(marketData[6]),
        resolutionTimestamp: Number(marketData[7]) > 0 ? new Date(Number(marketData[7]) * 1000) : null,
        resolved: marketData[8],
        odds: {
          yes: yesOdds,
          no: noOdds,
        },
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
    if (!contract || !signer) {
      alert("Please connect your wallet first")
      return
    }

    try {
      console.log(`Placing bet: Market ${marketId}, Prediction: ${prediction}, Amount: ${amount} ETH`)

      const tx = await contract.placeBet(marketId, prediction, {
        value: ethers.parseEther(amount),
      })

      console.log("Transaction sent:", tx.hash)
      await tx.wait()
      console.log("Bet placed successfully!")

      // Refresh the market data
      await loadMarkets()
      alert("Bet placed successfully!")
    } catch (error: any) {
      console.error("Error placing bet:", error)
      alert(`Failed to place bet: ${error?.message || "Unknown error"}`)
    }
  }

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

      await tx.wait()
      console.log("Reward claimed successfully!")

      alert("Reward claimed successfully!")
      await loadMarkets()
    } catch (error: any) {
      console.error("Error claiming reward:", error)
      alert(`Failed to claim reward: ${error?.message || "Unknown error"}`)
    }
  }

  // Get user's bet for a market
  const getUserBet = async (marketId: number): Promise<Bet | null> => {
    if (!contract || !address) return null

    try {
      const betData = await contract.bets(marketId, address)

      return {
        prediction: betData[0],
        amount: ethers.formatEther(betData[1]),
        claimed: betData[2],
      }
    } catch (error) {
      console.error(`Error getting bet for market ${marketId}:`, error)
      return null
    }
  }
  console.log("Ethereum object:", window.ethereum)
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
  }

  return React.createElement(Web3Context.Provider, { value }, children)
}

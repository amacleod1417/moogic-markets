"use client"

import { Header } from "../../components/header"
import { Footer } from "../../components/footer"
import { useWeb3, type Bet, type Market } from "../../lib/web3"
import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import * as React from "react"
import { MintCow } from '../../components/mint-cow'
import { useAccount, useWalletClient } from 'wagmi'
import { getCowNFTContract, type CowStats } from '../../lib/contracts'
import { COW_NFT_ADDRESS } from '../../config/contracts'
import { useToast } from "../../components/ui/use-toast"

type UserBet = {
  marketId: number
  market: Market
  bet: Bet
}

type OwnedCow = {
  tokenId: number
  vaultId: number
  stats: CowStats | null
}

export default function PortfolioPage() {
  const { isConnected, connect, markets, loadMarkets, getUserBet, claimReward, userMerits, getUserMerits, address } = useWeb3()
  const [userBets, setUserBets] = useState<UserBet[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const { address: wagmiAddress } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [ownedCows, setOwnedCows] = useState<OwnedCow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Load markets and merits on mount
  useEffect(() => {
    const initialize = async () => {
      if (isConnected) {
        await loadMarkets()
        await getUserMerits()
      }
      setInitialLoad(false)
    }
    initialize()
  }, [isConnected, loadMarkets, getUserMerits])

  // Fetch user bets when markets are loaded
  useEffect(() => {
    const fetchUserBets = async () => {
      if (!isConnected || markets.length === 0) {
        setLoading(false)
        return
      }

      try {
        const bets: UserBet[] = []
        for (const market of markets) {
          const bet = await getUserBet(market.id)
          if (bet && Number(bet.amount) > 0) {
            bets.push({
              marketId: market.id,
              market,
              bet,
            })
          }
        }
        setUserBets(bets)
      } catch (error) {
        console.error("Error fetching bets:", error)
      } finally {
        setLoading(false)
      }
    }

    if (!initialLoad) {
      fetchUserBets()
    }
  }, [isConnected, markets, getUserBet, initialLoad])

  useEffect(() => {
    const fetchOwnedCows = async () => {
      console.log('Starting fetchOwnedCows...', { 
        wagmiAddress, 
        hasWalletClient: !!walletClient,
        currentOwnedCows: ownedCows 
      })
      
      if (!wagmiAddress || !walletClient) {
        console.log('Missing wagmiAddress or walletClient')
        return
      }
      
      try {
        const cowNFT = getCowNFTContract(walletClient)
        console.log('Contract instance created')
        
        // Check if contract is deployed
        const bytecode = await cowNFT.getBytecode()
        console.log('Contract bytecode:', bytecode)
        
        if (!bytecode) {
          console.error('Contract is not deployed at address:', COW_NFT_ADDRESS)
          toast({
            title: "Error",
            description: "The Cow NFT contract is not deployed at the specified address. Please contact support.",
            variant: "destructive"
          })
          return
        }

        // Try to get contract name and symbol
        try {
          const name = await cowNFT.name()
          console.log('Contract name:', name)
        } catch (error) {
          console.error('Error getting contract name:', error)
        }

        try {
          const symbol = await cowNFT.symbol()
          console.log('Contract symbol:', symbol)
        } catch (error) {
          console.error('Error getting contract symbol:', error)
        }

        // Try to get balance directly first
        try {
          const balance = await cowNFT.balanceOf(wagmiAddress) as bigint
          console.log('Cow balance:', Number(balance))
          
          if (Number(balance) === 0) {
            console.log('No cows found for address:', wagmiAddress)
            setOwnedCows([])
            setIsLoading(false)
            return
          }
          
          const cows: OwnedCow[] = []
          for (let i = 0; i < Number(balance); i++) {
            console.log(`Fetching token at index ${i}...`)
            const tokenId = await cowNFT.tokenOfOwnerByIndex(wagmiAddress, i) as bigint
            console.log('Found cow tokenId:', Number(tokenId))
            
            // Get vault ID
            const vaultId = await cowNFT.cowToVault(Number(tokenId)) as bigint
            console.log('Vault ID:', Number(vaultId))
            
            // Get cow stats
            let stats: CowStats | null = null
            try {
              stats = await cowNFT.getCowStats(Number(tokenId))
              console.log('Cow stats:', stats)
            } catch (error) {
              console.error('Error fetching cow stats:', error)
              toast({
                title: "Warning",
                description: `Could not fetch stats for Cow #${Number(tokenId)}. The cow may still be initializing.`,
                variant: "default"
              })
            }
            
            cows.push({
              tokenId: Number(tokenId),
              vaultId: Number(vaultId),
              stats
            })
          }
          
          console.log('Setting owned cows:', cows)
          setOwnedCows(cows)
        } catch (error) {
          console.error('Error fetching balance:', error)
          if (error instanceof Error) {
            console.error('Error details:', {
              message: error.message,
              stack: error.stack,
              contractAddress: COW_NFT_ADDRESS,
              ownerAddress: wagmiAddress
            })
          }
          
          toast({
            title: "Error",
            description: "Failed to fetch your cows. Please make sure you're connected to the correct network.",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Error in fetchOwnedCows:', error)
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack
          })
          
          if (error.message.includes('Invalid contract address')) {
            toast({
              title: "Error",
              description: "The Cow NFT contract address is invalid. Please contact support.",
              variant: "destructive"
            })
          } else if (error.message.includes('Invalid owner address')) {
            toast({
              title: "Error",
              description: "Your wallet address is invalid. Please try reconnecting your wallet.",
              variant: "destructive"
            })
          } else {
            toast({
              title: "Error",
              description: "Failed to fetch your cows. Please make sure you're connected to the correct network.",
              variant: "destructive"
            })
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchOwnedCows()
  }, [wagmiAddress, walletClient])

  // Don't render anything while doing initial load
  if (initialLoad) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-lg text-gray-600">Loading your portfolio...</p>
        </div>
        <Footer />
      </div>
    )
  }

  // Don't render anything while loading bets
  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-lg text-gray-600">Loading your bets...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Bets</h1>
          {isConnected && (
            <div className="flex items-center space-x-2 bg-purple-100 px-4 py-2 rounded-full">
              <span className="text-purple-800 font-medium">Merits:</span>
              <span className="text-purple-900 font-bold">{userMerits}</span>
            </div>
          )}
        </div>

        {!isConnected ? (
          <div className="text-center py-20">
            <p className="text-lg text-gray-600 mb-8">Please connect your wallet to view your bets</p>
            <Button onClick={connect} className="bg-purple-600 hover:bg-purple-700" size="lg">
              Connect Wallet
            </Button>
          </div>
        ) : userBets.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-gray-600 mb-8">You haven't placed any bets yet</p>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              size="lg"
              onClick={() => (window.location.href = "/markets")}
            >
              Browse Markets
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {userBets.map((item) => (
              <Card key={item.marketId} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.market.question}</CardTitle>
                      <p className="text-sm text-gray-500">Market #{item.marketId}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge variant={item.bet.prediction ? "default" : "destructive"}>
                        {item.market.marketType === "BINARY" 
                          ? (item.bet.prediction ? "YES" : "NO")
                          : `Option ${Number(item.bet.prediction) + 1}`}
                      </Badge>
                      {item.market.topStaker && item.market.topStaker.toLowerCase() === address?.toLowerCase() && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          👑 Top Staker
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-medium">{item.bet.amount} FLR</span>
                    </div>

                    {item.market.topStaker && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Top Stake</span>
                        <span className="font-medium">{item.market.topStake} FLR</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-500">Potential Win</span>
                      <span className="font-medium">
                        {item.market.marketType === "BINARY" 
                          ? (Number(item.bet.amount) * (item.bet.prediction ? item.market.odds.yes : item.market.odds.no)).toFixed(4)
                          : "Calculating..."} FLR
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className="font-medium">
                        {item.market.resolved
                          ? item.market.marketType === "BINARY"
                            ? item.market.outcome === item.bet.prediction
                              ? "Won"
                              : "Lost"
                            : Number(item.bet.prediction) === item.market.winningOption
                              ? "Won"
                              : "Lost"
                          : "Pending"}
                      </span>
                    </div>

                    {item.market.resolved && 
                      ((item.market.marketType === "BINARY" && item.market.outcome === item.bet.prediction) ||
                       (item.market.marketType === "MULTI" && Number(item.bet.prediction) === item.market.winningOption)) && 
                      !item.bet.claimed && (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => claimReward(item.marketId)}
                      >
                        Claim Reward
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Your Portfolio</h1>
          
          {/* Cow NFTs Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Your Cows</h2>
              <MintCow />
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">Loading your cows...</div>
            ) : ownedCows.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedCows.map((cow) => (
                  <Card key={cow.tokenId} className="hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Cow #{cow.tokenId}</CardTitle>
                          <p className="text-sm text-gray-500">Vault #{cow.vaultId}</p>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Display Bessie image */}
                      <div className="flex justify-center mb-4">
                        <img src="/bessie.png" alt="Bessie the Cow" className="w-32 h-32 object-contain rounded-lg" />
                      </div>
                      {cow.stats ? (
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-500">🥛 Daily Milk</span>
                            <span className="font-medium">{Number(cow.stats.milkYield)} L</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">🐄 Steps</span>
                            <span className="font-medium">{Number(cow.stats.steps)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">❤️ Heart Rate</span>
                            <span className="font-medium">{Number(cow.stats.heartRate)} BPM</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Last Updated</span>
                            <span className="font-medium">
                              {new Date(Number(cow.stats.lastUpdated) * 1000).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          Stats not available yet
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">You don't own any cows yet</p>
                <MintCow />
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

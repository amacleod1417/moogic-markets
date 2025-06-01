"use client"

import { Header } from "../../components/header"
import { Footer } from "../../components/footer"
import { useWeb3, type Bet, type Market } from "../../lib/web3"
import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import * as React from "react"

type UserBet = {
  marketId: number
  market: Market
  bet: Bet
}

export default function PortfolioPage() {
  const { isConnected, connect, markets, loadMarkets, getUserBet, claimReward, userMerits, getUserMerits, address } = useWeb3()
  const [userBets, setUserBets] = useState<UserBet[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)

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
                      <span className="font-medium">{item.bet.amount} ETH</span>
                    </div>

                    {item.market.topStaker && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Top Stake</span>
                        <span className="font-medium">{item.market.topStake} ETH</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-500">Potential Win</span>
                      <span className="font-medium">
                        {item.market.marketType === "BINARY" 
                          ? (Number(item.bet.amount) * (item.bet.prediction ? item.market.odds.yes : item.market.odds.no)).toFixed(4)
                          : "Calculating..."} ETH
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
      </div>

      <Footer />
    </div>
  )
}

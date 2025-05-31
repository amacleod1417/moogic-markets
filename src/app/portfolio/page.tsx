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
  const { isConnected, connect, markets, loadMarkets, getUserBet, claimReward } = useWeb3()
  const [userBets, setUserBets] = useState<UserBet[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isConnected) {
      loadMarkets()
    }
  }, [isConnected, loadMarkets])

  useEffect(() => {
    const fetchUserBets = async () => {
      if (!isConnected || markets.length === 0) return

      setLoading(true)
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
      setLoading(false)
    }

    fetchUserBets()
  }, [isConnected, markets, getUserBet])

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8 text-center">My Bets</h1>

        {!isConnected ? (
          <div className="text-center py-20">
            <p className="text-lg text-gray-600 mb-8">Please connect your wallet to view your bets</p>
            <Button onClick={connect} className="bg-purple-600 hover:bg-purple-700" size="lg">
              Connect Wallet
            </Button>
          </div>
        ) : loading ? (
          <div className="text-center py-20">
            <p className="text-lg text-gray-600">Loading your bets...</p>
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
                    <Badge variant={item.bet.prediction ? "default" : "destructive"}>
                      {item.bet.prediction ? "YES" : "NO"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-medium">{item.bet.amount} ETH</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Potential Win</span>
                      <span className="font-medium">
                        {(
                          Number(item.bet.amount) * (item.bet.prediction ? item.market.odds.yes : item.market.odds.no)
                        ).toFixed(4)}{" "}
                        ETH
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className="font-medium">
                        {item.market.resolved
                          ? item.market.outcome === item.bet.prediction
                            ? "Won"
                            : "Lost"
                          : "Pending"}
                      </span>
                    </div>

                    {item.market.resolved && item.market.outcome === item.bet.prediction && !item.bet.claimed && (
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

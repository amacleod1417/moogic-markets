"use client"

import { Header } from "../../components/header"
import { Footer } from "../../components/footer"
import { MeritsLeaderboard } from "../../components/merits-leaderboard"
import { useWeb3 } from "../../lib/web3"
import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Trophy, Star, Flame, Medal, MapPin } from "lucide-react"

export default function LeaderboardPage() {
  const { isConnected, connect, fetchLeaderboard, userMerits } = useWeb3()
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLeaderboard = async () => {
      if (isConnected) {
        setLoading(true)
        const data = await fetchLeaderboard()
        setLeaderboard(data)
        setLoading(false)
      }
    }

    loadLeaderboard()
  }, [isConnected, fetchLeaderboard])

  const getBadgeInfo = (merits: number) => {
    if (merits >= 500) return { name: "🌟 Legend", icon: Star, color: "text-yellow-500", description: "The elite of CowDAO" }
    if (merits >= 200) return { name: "🔥 Pro", icon: Flame, color: "text-orange-500", description: "A seasoned predictor" }
    if (merits >= 50) return { name: "🥉 Beginner", icon: Medal, color: "text-blue-500", description: "Getting the hang of it" }
    return { name: "📍 Newcomer", icon: MapPin, color: "text-gray-500", description: "Just starting out" }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🏆 Merits Leaderboard</h1>
          <p className="text-gray-600">Top predictors ranked by their Merits points</p>
        </div>

        {!isConnected ? (
          <div className="text-center py-20">
            <p className="text-lg text-gray-600 mb-8">Please connect your wallet to view the leaderboard</p>
            <Button onClick={connect} className="bg-purple-600 hover:bg-purple-700" size="lg">
              Connect Wallet
            </Button>
          </div>
        ) : loading ? (
          <div className="text-center py-20">
            <p className="text-lg text-gray-600">Loading leaderboard...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <MeritsLeaderboard entries={leaderboard} />
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const badge = getBadgeInfo(userMerits)
                    const Icon = badge.icon
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-8 w-8 ${badge.color}`} />
                          <div>
                            <div className={`font-bold text-lg ${badge.color}`}>{badge.name}</div>
                            <div className="text-sm text-gray-500">{badge.description}</div>
                          </div>
                        </div>
                        <div className="pt-4 border-t">
                          <div className="text-sm text-gray-500 mb-1">Your Merits</div>
                          <div className="text-2xl font-bold text-purple-600">{userMerits}</div>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How to Earn Merits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 font-bold">
                      1
                    </div>
                    <div>
                      <div className="font-medium">Win Predictions</div>
                      <div className="text-sm text-gray-500">Correctly predict market outcomes</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 font-bold">
                      2
                    </div>
                    <div>
                      <div className="font-medium">Top Staker Bonus</div>
                      <div className="text-sm text-gray-500">Be the highest staker in a market</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 font-bold">
                      3
                    </div>
                    <div>
                      <div className="font-medium">Claim Rewards</div>
                      <div className="text-sm text-gray-500">Don't forget to claim your rewards</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
} 
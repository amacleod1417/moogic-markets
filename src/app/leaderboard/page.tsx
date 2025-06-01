"use client"

import { Header } from "../../components/header"
import { Footer } from "../../components/footer"
import { useWeb3 } from "../../lib/web3"
import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Trophy, TrendingUp, Target, Award } from "lucide-react"
import * as React from "react"

// Mock leaderboard data
const mockLeaderboardData = [
  {
    address: "0x1234...5678",
    username: "BessieWhisperer",
    merits: 750,
    totalPredictions: 45,
    winRate: 0.89,
    rank: 1
  },
  {
    address: "0x2345...6789",
    username: "DairyKing",
    merits: 520,
    totalPredictions: 38,
    winRate: 0.82,
    rank: 2
  },
  {
    address: "0x3456...7890",
    username: "MilkMaster",
    merits: 480,
    totalPredictions: 42,
    winRate: 0.79,
    rank: 3
  },
  {
    address: "0x4567...8901",
    username: "CalfExpert",
    merits: 320,
    totalPredictions: 29,
    winRate: 0.75,
    rank: 4
  },
  {
    address: "0x5678...9012",
    username: "FarmOracle",
    merits: 280,
    totalPredictions: 25,
    winRate: 0.72,
    rank: 5
  },
  {
    address: "0x6789...0123",
    username: "HayHero",
    merits: 210,
    totalPredictions: 18,
    winRate: 0.68,
    rank: 6
  },
  {
    address: "0x7890...1234",
    username: "BarnBuddy",
    merits: 180,
    totalPredictions: 15,
    winRate: 0.65,
    rank: 7
  },
  {
    address: "0x8901...2345",
    username: "MilkMaven",
    merits: 150,
    totalPredictions: 12,
    winRate: 0.62,
    rank: 8
  },
  {
    address: "0x9012...3456",
    username: "CattleCaller",
    merits: 120,
    totalPredictions: 10,
    winRate: 0.60,
    rank: 9
  },
  {
    address: "0x0123...4567",
    username: "FarmFresh",
    merits: 90,
    totalPredictions: 8,
    winRate: 0.58,
    rank: 10
  }
]

export default function LeaderboardPage() {
  const { isConnected, connect, userMerits } = useWeb3()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-purple-900 mb-4">🏆 Merits Leaderboard</h1>
          <p className="text-lg text-purple-700 max-w-2xl mx-auto">
            Top predictors in the CowDAO ecosystem, ranked by their merits
          </p>
        </div>

        {!isConnected ? (
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-purple-900 mb-4">Merits Leaderboard</h1>
            <p className="text-purple-700 mb-8">Please connect your wallet to view the leaderboard.</p>
            <Button onClick={connect} className="bg-purple-600 hover:bg-purple-700" size="lg">
              Connect Wallet
            </Button>
          </div>
        ) : loading ? (
          <div className="text-center py-20">
            <p className="text-lg text-purple-700">Loading leaderboard data...</p>
          </div>
        ) : (
          <>
            {/* User Stats Section */}
            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-purple-900">Your Merits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-700">{userMerits}</div>
                    <p className="text-sm text-purple-600 mt-2">Total merits earned</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-purple-900">Your Rank</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-700">#1</div>
                    <p className="text-sm text-purple-600 mt-2">Top predictor!</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-purple-900">Win Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">89%</div>
                    <p className="text-sm text-purple-600 mt-2">Successful predictions</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Leaderboard Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockLeaderboardData.map((entry, index) => (
                <Card key={entry.address} className="hover:shadow-lg transition-all bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                            {index === 0 ? (
                              <Trophy className="h-6 w-6 text-yellow-500" />
                            ) : index === 1 ? (
                              <TrendingUp className="h-6 w-6 text-purple-400" />
                            ) : index === 2 ? (
                              <Target className="h-6 w-6 text-pink-500" />
                            ) : (
                              <Award className="h-6 w-6 text-purple-500" />
                            )}
                          </div>
                          <Badge
                            className="absolute -top-2 -right-2 bg-purple-600"
                            variant="secondary"
                          >
                            #{index + 1}
                          </Badge>
                        </div>
                        <div>
                          <CardTitle className="text-lg text-purple-900">{entry.username}</CardTitle>
                          <p className="text-sm text-purple-600">{entry.address}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-white/50 rounded-lg p-3">
                        <p className="text-sm text-purple-600">Merits</p>
                        <p className="text-xl font-bold text-purple-700">{entry.merits}</p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-3">
                        <p className="text-sm text-purple-600">Predictions</p>
                        <p className="text-xl font-bold text-purple-700">{entry.totalPredictions}</p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-3">
                        <p className="text-sm text-purple-600">Win Rate</p>
                        <p className="text-xl font-bold text-green-600">{(entry.winRate * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-600">Total Volume</span>
                        <span className="font-medium text-purple-700">{(entry.merits * 0.1).toFixed(2)} FLR</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-600">Avg. Stake</span>
                        <span className="font-medium text-purple-700">{(entry.merits * 0.1 / entry.totalPredictions).toFixed(3)} FLR</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-600">Success Streak</span>
                        <span className="font-medium text-purple-700">{Math.floor(entry.winRate * 5)} markets</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
} 
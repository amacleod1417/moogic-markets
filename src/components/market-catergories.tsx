"use client"
import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Clock, Wifi, MapPin } from "lucide-react"
import { useWeb3, type Market } from "../lib/web3"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog"
import { Input } from "../components/ui/input"

// Helper function to get time left
function getTimeLeft(deadline: Date): string {
  const now = new Date()
  const diff = deadline.getTime() - now.getTime()

  if (diff <= 0) return "Ended"

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  return `${days}d ${hours}h`
}

// Helper to get market category and emoji
function getMarketDetails(question: string): { category: string; emoji: string; confidence: number } {
  if (question.toLowerCase().includes("cow") || question.toLowerCase().includes("bessie")) {
    return { category: "Livestock", emoji: "🐄", confidence: 87 }
  } else if (question.toLowerCase().includes("corn") || question.toLowerCase().includes("yield")) {
    return { category: "Crops", emoji: "🌽", confidence: 72 }
  } else if (question.toLowerCase().includes("rain") || question.toLowerCase().includes("weather")) {
    return { category: "Weather", emoji: "🌧️", confidence: 94 }
  } else if (question.toLowerCase().includes("goat")) {
    return { category: "Shenanigans", emoji: "🐐", confidence: 65 }
  }

  return { category: "Other", emoji: "🎯", confidence: 80 }
}

export function LiveMarkets() {
  const { markets, isConnected, placeBet, claimReward, contractStatus } = useWeb3()
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [betAmount, setBetAmount] = useState<string>("0.1")
  const [betType, setBetType] = useState<boolean>(true) // true = YES, false = NO
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [isPlacingBet, setIsPlacingBet] = useState<boolean>(false)

  // Function to handle bet placement
  const handlePlaceBet = async () => {
    if (!selectedMarket) return

    setIsPlacingBet(true)
    try {
      await placeBet(selectedMarket.id, betType, betAmount)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error placing bet:", error)
    } finally {
      setIsPlacingBet(false)
    }
  }

  // Function to open bet dialog
  const openBetDialog = (market: Market, prediction: boolean) => {
    setSelectedMarket(market)
    setBetType(prediction)
    setIsDialogOpen(true)
  }

  // Show message if contract not configured
  if (contractStatus === "not-configured") {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">🔧 Contract Not Configured</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Please set the NEXT_PUBLIC_CONTRACT_ADDRESS environment variable to connect to your deployed contract.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg max-w-md mx-auto">
              <code className="text-sm">NEXT_PUBLIC_CONTRACT_ADDRESS=0x01a5B26EdeC3e2B4f17BC3D95c47ec8d752AC921</code>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Show message if contract not found
  if (contractStatus === "not-found") {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">❌ Contract Not Found</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              No smart contract found at the configured address. Please check that the contract is deployed and the
              address is correct.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">🔥 Live Markets</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {markets.length > 0
              ? `${markets.length} active prediction markets powered by real IoT sensors`
              : "No markets available yet. Create your first market in the admin panel!"}
          </p>
        </div>

        {markets.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🐄</div>
            <h3 className="text-xl font-semibold mb-2">No Markets Yet</h3>
            <p className="text-gray-600 mb-6">Be the first to create an agricultural prediction market!</p>
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <a href="/admin">Create First Market</a>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-6">
              {markets.map((market, index) => {
                const { category, emoji, confidence } = getMarketDetails(market.question)
                const timeLeft = getTimeLeft(market.deadline)
                const status = market.resolved ? "closed" : timeLeft === "Ended" ? "closed" : "live"
                const volume = (Number(market.totalYes) + Number(market.totalNo)).toFixed(4) + " ETH"

                return (
                  <Card
                    key={index}
                    className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="text-2xl">{emoji}</span>
                            <Badge
                              variant={
                                status === "closed" ? "outline" : market.id % 3 === 0 ? "destructive" : "default"
                              }
                              className="text-xs"
                            >
                              {status === "closed" ? "CLOSED" : market.id % 3 === 0 ? "🔥 HOT" : "🟢 LIVE"}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <Wifi className="h-3 w-3 text-green-500" />
                              <span className="text-xs text-green-600 font-medium">{confidence}% confidence</span>
                            </div>
                          </div>
                          <CardTitle className="text-lg mb-2">{market.question}</CardTitle>
                          <p className="text-gray-600 text-sm mb-2">
                            Market #{market.id} - {market.resolved ? "Resolved" : "Open for betting"}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{category}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>Closes {timeLeft}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm text-gray-500 mb-1">Volume</div>
                          <div className="font-bold text-purple-600">{volume}</div>
                          <div className="text-xs text-gray-500 mt-1">{timeLeft} left</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="text-xs text-gray-600 mb-1">Data Source:</div>
                        <div className="text-sm font-medium">
                          {category === "Livestock"
                            ? "Collar sensor + Vet records"
                            : category === "Crops"
                              ? "Soil sensors + Weather API"
                              : category === "Weather"
                                ? "NOAA + Local weather stations"
                                : "Fence sensors + Farm cameras"}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex space-x-6">
                          <div className="text-center">
                            <div className="text-sm text-gray-500 mb-1">YES</div>
                            <div className="text-xl font-bold text-green-600">{market.odds.yes.toFixed(2)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500 mb-1">NO</div>
                            <div className="text-xl font-bold text-red-600">{market.odds.no.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>

                      {market.resolved ? (
                        <div className="p-3 bg-gray-100 rounded-lg text-center">
                          <p className="font-medium">Outcome: {market.outcome ? "YES" : "NO"}</p>
                          <Button
                            onClick={() => claimReward(market.id)}
                            className="mt-2 bg-purple-600 hover:bg-purple-700"
                            disabled={!isConnected}
                          >
                            Claim Reward
                          </Button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <Button
                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                            onClick={() => openBetDialog(market, true)}
                            disabled={!isConnected || timeLeft === "Ended"}
                          >
                            Bet YES
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => openBetDialog(market, false)}
                            disabled={!isConnected || timeLeft === "Ended"}
                          >
                            Bet NO
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="text-center mt-8">
              <Button
                variant="outline"
                size="lg"
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
                asChild
              >
                <a href="/admin">🎯 Create New Market</a>
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Betting Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Your Bet</DialogTitle>
          </DialogHeader>

          {selectedMarket && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="font-medium">{selectedMarket.question}</h3>
                <p className="text-sm text-gray-500">
                  You are betting: <span className="font-bold text-purple-600">{betType ? "YES" : "NO"}</span>
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  Bet Amount (ETH)
                </label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Potential win:{" "}
                  {(Number(betAmount) * (betType ? selectedMarket.odds.yes : selectedMarket.odds.no)).toFixed(4)} ETH
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlaceBet} disabled={isPlacingBet} className="bg-purple-600 hover:bg-purple-700">
              {isPlacingBet ? "Placing Bet..." : "Confirm Bet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

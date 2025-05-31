"use client"

import { Header } from "../../components/header"
import { Footer } from "../../components/footer"
import { LiveMarkets } from "../../components/live-markets"
import { useWeb3 } from "../../lib/web3"
import { useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { CheckCircle } from "lucide-react"
import * as React from "react"

export default function MarketsPage() {
  const { loadMarkets, isConnected, connect, markets, contractStatus } = useWeb3()

  useEffect(() => {
    if (isConnected && contractStatus === "found") {
      loadMarkets()
    }
  }, [isConnected, contractStatus, loadMarkets])

  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span>Ready to Trade</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contractStatus === "found" && (
                <Badge variant="secondary" className="mb-4">
                  Contract Found ✅
                </Badge>
              )}
              <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
              <p className="text-gray-600">Please connect your wallet to view and interact with markets</p>
              <Button onClick={connect} className="bg-purple-600 hover:bg-purple-700" size="lg">
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Status indicator */}
      {contractStatus === "found" && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-800">Connected to MoogicMarket contract</span>
              <Badge variant="secondary" className="text-xs">
                {markets.length} markets loaded
              </Badge>
            </div>
          </div>
        </div>
      )}

      <LiveMarkets />
      <Footer />
    </div>
  )
}

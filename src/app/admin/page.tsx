"use client"

import { Header } from "../../components/header"
import { Footer } from "../../components/footer"
import { useWeb3, CONTRACT_ADDRESS, MoogicMarketABI } from "../../lib/web3"
import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Badge } from "../../components/ui/badge"
import { PlusCircle, CheckCircle, AlertCircle } from "lucide-react"
import { ethers } from "ethers"
import * as React from "react"

export default function AdminPage() {
  const { isConnected, connect, contract, address, markets, loadMarkets, contractStatus, signer } = useWeb3()
  const [isCreating, setIsCreating] = useState(false)
  const [isResolving, setIsResolving] = useState(false)
  const [newMarket, setNewMarket] = useState({
    question: "",
    deadline: "",
    marketType: "BINARY",
    optionCount: 0,
  })
  const [resolveMarket, setResolveMarket] = useState({
    id: "",
    outcome: true,
  })

  

  // Create a new market
  const handleCreateMarket = async () => {
    if (!signer || !newMarket.question || !newMarket.deadline) {
      alert("Please fill in all fields")
      return
    }
  
    setIsCreating(true)
    try {
      const deadlineTimestamp = Math.floor(new Date(newMarket.deadline).getTime() / 1000)
      const marketTypeEnum = newMarket.marketType === "MULTI" ? 1 : 0
      const optionCount = marketTypeEnum === 1 ? newMarket.optionCount : 0
  
      const freshContract = new ethers.Contract(CONTRACT_ADDRESS, MoogicMarketABI, signer)
  
      console.log("Creating market with params:", {
        question: newMarket.question,
        deadline: deadlineTimestamp,
        marketTypeEnum,
        optionCount,
      })
  
      // Always prompt MetaMask directly with a write call (estimateGas is optional)
      const tx = await freshContract.createMarket(
        newMarket.question,
        deadlineTimestamp,
        marketTypeEnum,
        optionCount
      )
  
      console.log("Transaction sent:", tx.hash)
      await tx.wait()
      console.log("Market created!")
  
      alert("Market created successfully!")
      setNewMarket({ question: "", deadline: "", marketType: "BINARY", optionCount: 0 })
      await loadMarkets()
    } catch (error: any) {
      console.error("Error creating market:", error)
      alert(`Failed to create market: ${error?.message || "Unknown error"}`)
    } finally {
      setIsCreating(false)
    }
  }
  

  // Resolve a market
  const handleResolveMarket = async () => {
    if (!contract || !resolveMarket.id) {
      alert("Please enter a market ID")
      return
    }

    try {
      setIsResolving(true)

      console.log("Resolving market:", resolveMarket.id, resolveMarket.outcome)

      const tx = await contract.resolveMarket(Number(resolveMarket.id), resolveMarket.outcome)
      console.log("Transaction sent:", tx.hash)

      await tx.wait()
      console.log("Market resolved successfully!")

      alert("Market resolved successfully!")
      setResolveMarket({ id: "", outcome: true })
      await loadMarkets()
    } catch (error: any) {
      console.error("Error resolving market:", error)
      alert(`Failed to resolve market: ${error?.message || "Unknown error"}`)
    } finally {
      setIsResolving(false)
    }
  }

  // Get tomorrow's date as default
  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().slice(0, 16) // Format for datetime-local input
  }

  // Show contract status if not ready
  if (contractStatus !== "found") {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                <span>Admin Panel</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                {contractStatus === "not-configured"
                  ? "Contract not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS."
                  : contractStatus === "not-found"
                    ? "Contract not found at the configured address."
                    : "Checking contract status..."}
              </p>
              {!isConnected && (
                <Button onClick={connect} className="bg-purple-600 hover:bg-purple-700" size="lg">
                  Connect Wallet
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Please connect your wallet to access admin functions</p>
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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🔧 Admin Panel</h1>
          <p className="text-gray-600">Create and manage prediction markets</p>
          <Badge variant="secondary" className="mt-2">
            Connected as: {address?.slice(0, 6)}...{address?.slice(-4)}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Market */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PlusCircle className="h-5 w-5" />
                <span>Create New Market</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Market Question</Label>
                <Textarea
                  id="question"
                  placeholder="e.g., Will Bessie the cow give birth this week?"
                  value={newMarket.question}
                  onChange={(e) => setNewMarket({ ...newMarket, question: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marketType">Market Type</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={newMarket.marketType === "BINARY" ? "default" : "outline"}
                    onClick={() => setNewMarket({ ...newMarket, marketType: "BINARY", optionCount: 0 })}
                    className={`flex-1 ${newMarket.marketType === "BINARY" ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                  >
                    Binary (Yes/No)
                  </Button>
                  <Button
                    variant={newMarket.marketType === "MULTI" ? "default" : "outline"}
                    onClick={() => setNewMarket({ ...newMarket, marketType: "MULTI", optionCount: 2 })}
                    className={`flex-1 ${newMarket.marketType === "MULTI" ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                  >
                    Multi-Option
                  </Button>
                </div>
              </div>

              {newMarket.marketType === "MULTI" && (
                <div className="space-y-2">
                  <Label htmlFor="optionCount">Number of Options</Label>
                  <Input
                    id="optionCount"
                    type="number"
                    min="2"
                    value={newMarket.optionCount}
                    onChange={(e) => setNewMarket({ ...newMarket, optionCount: parseInt(e.target.value) || 0 })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={newMarket.deadline}
                  onChange={(e) => setNewMarket({ ...newMarket, deadline: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <Button
                onClick={handleCreateMarket}
                disabled={isCreating || !newMarket.question || !newMarket.deadline || 
                  (newMarket.marketType === "MULTI" && newMarket.optionCount < 2)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isCreating ? "Creating..." : "Create Market"}
              </Button>

              {/* Quick create buttons */}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Quick Create:</p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start"
                    onClick={() =>
                      setNewMarket({
                        question: "Will Bessie the cow give birth this week?",
                        deadline: getTomorrowDate(),
                        marketType: "BINARY",
                        optionCount: 0
                      })
                    }
                  >
                    🐄 Cow Birth Prediction
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start"
                    onClick={() =>
                      setNewMarket({
                        question: "Will it rain more than 2 inches this weekend?",
                        deadline: getTomorrowDate(),
                        marketType: "BINARY",
                        optionCount: 0
                      })
                    }
                  >
                    🌧️ Weather Prediction
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start"
                    onClick={() =>
                      setNewMarket({
                        question: "Will the corn yield exceed 180 bushels per acre?",
                        deadline: getTomorrowDate(),
                        marketType: "MULTI",
                        optionCount: 3
                      })
                    }
                  >
                    🌽 Crop Yield Prediction
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resolve Market */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Resolve Market</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="marketId">Market ID</Label>
                <Input
                  id="marketId"
                  type="number"
                  placeholder="e.g., 0"
                  value={resolveMarket.id}
                  onChange={(e) => setResolveMarket({ ...resolveMarket, id: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Outcome</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={resolveMarket.outcome ? "default" : "outline"}
                    onClick={() => setResolveMarket({ ...resolveMarket, outcome: true })}
                    className="flex-1"
                  >
                    YES
                  </Button>
                  <Button
                    variant={!resolveMarket.outcome ? "default" : "outline"}
                    onClick={() => setResolveMarket({ ...resolveMarket, outcome: false })}
                    className="flex-1"
                  >
                    NO
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleResolveMarket}
                disabled={isResolving || !resolveMarket.id}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isResolving ? "Resolving..." : "Resolve Market"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Existing Markets */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Existing Markets ({markets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {markets.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No markets created yet. Create your first market above!</p>
            ) : (
              <div className="space-y-4">
                {markets.map((market) => (
                  <div key={market.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium">
                          #{market.id}: {market.question}
                        </h3>
                        <p className="text-sm text-gray-500">Deadline: {market.deadline.toLocaleString()}</p>
                      </div>
                      <Badge variant={market.resolved ? "default" : "secondary"}>
                        {market.resolved ? `Resolved: ${market.outcome ? "YES" : "NO"}` : "Open"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">YES Pool:</span>
                        <div className="font-medium">{Number(market.totalYes).toFixed(4)} ETH</div>
                      </div>
                      <div>
                        <span className="text-gray-500">NO Pool:</span>
                        <div className="font-medium">{Number(market.totalNo).toFixed(4)} ETH</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <div className="font-medium">
                          {(Number(market.totalYes) + Number(market.totalNo)).toFixed(4)} ETH
                        </div>
                      </div>
                    </div>
                    {!market.resolved && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setResolveMarket({ id: market.id.toString(), outcome: true })}
                      >
                        Quick Resolve
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}

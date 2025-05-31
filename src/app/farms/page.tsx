"use client"

import { Header } from "../../components/header"
import { Footer } from "../../components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { useWeb3, SUPPORTED_NETWORKS } from "../../lib/web3"
import { MapPin, Thermometer, Droplets, Sun, Wind, Activity, AlertCircle } from "lucide-react"
import * as React from "react"
import { useState } from "react"
import FarmDataPanel from "../../components/FarmDataPanel"



// Mock farm data - in a real app, this would come from an API
const farms = [
  {
    id: 1,
    name: "Green Valley Dairy",
    location: "Wisconsin, USA",
    type: "Dairy",
    status: "active",
    metrics: {
      temperature: "72°F",
      humidity: "65%",
      rainfall: "0.2in",
      windSpeed: "8mph",
      activity: "High",
    },
    livestock: {
      cows: 120,
      goats: 45,
      chickens: 500,
    },
    crops: {
      corn: "120 acres",
      soybeans: "80 acres",
      alfalfa: "40 acres",
    },
  },
  {
    id: 2,
    name: "Sunny Acres",
    location: "Iowa, USA",
    type: "Mixed",
    status: "active",
    metrics: {
      temperature: "75°F",
      humidity: "60%",
      rainfall: "0.1in",
      windSpeed: "5mph",
      activity: "Medium",
    },
    livestock: {
      cows: 80,
      goats: 30,
      chickens: 300,
    },
    crops: {
      corn: "200 acres",
      soybeans: "150 acres",
      wheat: "100 acres",
    },
  },
  {
    id: 3,
    name: "Mountain View Ranch",
    location: "Colorado, USA",
    type: "Livestock",
    status: "active",
    metrics: {
      temperature: "68°F",
      humidity: "55%",
      rainfall: "0.3in",
      windSpeed: "12mph",
      activity: "Low",
    },
    livestock: {
      cows: 200,
      goats: 100,
      chickens: 200,
    },
    crops: {
      hay: "150 acres",
      pasture: "300 acres",
    },
  },
]

export default function FarmsPage() {
  const { isConnected, connect, chainId } = useWeb3()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      await connect()
    } catch (error) {
      console.error("Connection error:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const isCorrectNetwork = chainId === SUPPORTED_NETWORKS.COSTON2.chainId

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🏡 Farm Feeds</h1>
          <p className="text-gray-600">Real-time data from our network of partner farms</p>
        </div>

        {!isConnected ? (
          <div className="text-center py-20">
            <p className="text-lg text-gray-600 mb-8">Please connect your wallet to view farm data</p>
            <Button 
              onClick={handleConnect} 
              className="bg-purple-600 hover:bg-purple-700" 
              size="lg"
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          </div>
        ) : !isCorrectNetwork ? (
          <div className="text-center py-20">
            <div className="flex items-center justify-center text-yellow-600 mb-4">
              <AlertCircle className="h-8 w-8 mr-2" />
              <p className="text-lg">Please switch to Coston2 Testnet</p>
            </div>
            <p className="text-gray-600 mb-8">
              This application requires the Coston2 Testnet network to function properly.
            </p>
            <Button 
              onClick={handleConnect} 
              className="bg-yellow-600 hover:bg-yellow-700" 
              size="lg"
            >
              Switch Network
            </Button>
          </div>
        ) : (
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farms.map((farm) => (
                <Card key={farm.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{farm.name}</CardTitle>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {farm.location}
                        </div>
                      </div>
                      <Badge variant="secondary">{farm.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Weather Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Thermometer className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">{farm.metrics.temperature}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Droplets className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{farm.metrics.humidity}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Sun className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{farm.metrics.rainfall}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Wind className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{farm.metrics.windSpeed}</span>
                        </div>
                      </div>

                      {/* Livestock */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Livestock</h3>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-500">Cows</div>
                            <div className="font-medium">{farm.livestock.cows}</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-500">Goats</div>
                            <div className="font-medium">{farm.livestock.goats}</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-500">Chickens</div>
                            <div className="font-medium">{farm.livestock.chickens}</div>
                          </div>
                        </div>
                      </div>

                      {/* Crops */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Crops</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(farm.crops).map(([crop, acres]) => (
                            <div key={crop} className="bg-gray-50 p-2 rounded">
                              <div className="text-gray-500 capitalize">{crop}</div>
                              <div className="font-medium">{acres}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Activity Status */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Activity: {farm.metrics.activity}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6">
              <FarmDataPanel />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
} 
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
      milkProduction: "2,500 gal/day",
      feedConsumption: "1,200 lbs/day",
      activity: "High",
    },
    livestock: {
      dairyCows: 120,
      calves: 15,
      heifers: 30,
    },
    production: {
      milkYield: "21 gal/cow",
      butterfat: "3.8%",
      protein: "3.2%",
      somaticCells: "150,000/ml",
    },
  },
  {
    id: 2,
    name: "Sunny Acres Dairy",
    location: "Iowa, USA",
    type: "Dairy",
    status: "active",
    metrics: {
      temperature: "75°F",
      humidity: "60%",
      milkProduction: "1,800 gal/day",
      feedConsumption: "900 lbs/day",
      activity: "Medium",
    },
    livestock: {
      dairyCows: 80,
      calves: 10,
      heifers: 20,
    },
    production: {
      milkYield: "22.5 gal/cow",
      butterfat: "4.0%",
      protein: "3.3%",
      somaticCells: "120,000/ml",
    },
  },
  {
    id: 3,
    name: "Mountain View Dairy",
    location: "Colorado, USA",
    type: "Dairy",
    status: "active",
    metrics: {
      temperature: "68°F",
      humidity: "55%",
      milkProduction: "3,200 gal/day",
      feedConsumption: "1,500 lbs/day",
      activity: "Low",
    },
    livestock: {
      dairyCows: 200,
      calves: 25,
      heifers: 45,
    },
    production: {
      milkYield: "16 gal/cow",
      butterfat: "4.2%",
      protein: "3.4%",
      somaticCells: "100,000/ml",
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
                          <span className="text-sm text-gray-900">{farm.metrics.temperature}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Droplets className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-gray-900">{farm.metrics.humidity}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Sun className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-gray-900">{farm.metrics.milkProduction}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Wind className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-900">{farm.metrics.feedConsumption}</span>
                        </div>
                      </div>

                      {/* Livestock */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Dairy Herd</h3>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-700">Dairy Cows</div>
                            <div className="font-medium text-gray-900">{farm.livestock.dairyCows}</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-700">Calves</div>
                            <div className="font-medium text-gray-900">{farm.livestock.calves}</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-700">Heifers</div>
                            <div className="font-medium text-gray-900">{farm.livestock.heifers}</div>
                          </div>
                        </div>
                      </div>

                      {/* Production */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Milk Quality</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(farm.production).map(([metric, value]) => (
                            <div key={metric} className="bg-gray-50 p-2 rounded">
                              <div className="text-gray-700 capitalize">{metric.replace(/([A-Z])/g, ' $1').trim()}</div>
                              <div className="font-medium text-gray-900">{value}</div>
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
      
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
} 
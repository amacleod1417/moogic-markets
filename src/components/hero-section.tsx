"use client"
import * as React from "react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Zap, Shield, Activity, MilkIcon as Cow } from "lucide-react"
import { useWeb3 } from "../lib/web3"
import Link from "next/link"

export function HeroSection() {
  const { isConnected, connect } = useWeb3()

  return (
    <section className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 py-20 overflow-hidden">
      {/* Floating cow emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-4xl animate-bounce">🐄</div>
        <div className="absolute top-32 right-20 text-3xl animate-pulse">🌽</div>
        <div className="absolute bottom-20 left-20 text-3xl animate-bounce delay-300">🐐</div>
        <div className="absolute top-40 left-1/2 text-2xl animate-pulse delay-500">🌧️</div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
            🚀 Powered by Real-Time IoT Data
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Bet on Everything{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              COW
            </span>
            <br />
            <span className="text-3xl md:text-4xl">Defi Meets Dairy</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The world's first decentralized prediction market for granular agricultural outcomes. Bet on cow births,
            milk production, daily cow movements, and other shenanigans using real IoT sensor data.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {isConnected ? (
              <Link href="/markets">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8"
                >
                  🎯 Start Trading
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8"
                onClick={connect}
              >
                🔗 Connect Wallet
              </Button>
            )}
            <Link href="/data">
              <Button variant="outline" size="lg" className="text-lg px-8 border-purple-200">
                📊 View Live Feeds
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mt-16">
            <div className="text-center">
              <Activity className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Live IoT Data</h3>
              <p className="text-gray-600 text-sm">Real-time cow sensors & weather feeds</p>
            </div>
            <div className="text-center">
              <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Decentralized</h3>
              <p className="text-gray-600 text-sm">Smart contracts on blockchain</p>
            </div>
            <div className="text-center">
              <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Instant Payouts</h3>
              <p className="text-gray-600 text-sm">Automated settlements via oracles</p>
            </div>
            <div className="text-center">
              <Cow className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Farm Partners</h3>
              <p className="text-gray-600 text-sm">Connected to real life farms worldwide</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

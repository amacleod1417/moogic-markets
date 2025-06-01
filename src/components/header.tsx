"use client"

import Link from "next/link"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { MilkIcon as Cow, Wallet, Menu, Bell } from "lucide-react"
import { useWeb3 } from "../lib/web3"
import * as React from "react"

export function Header() {
  const { isConnected, connect, disconnect, address, isConnecting } = useWeb3()

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative">
            <Cow className="h-8 w-8 text-purple-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              CowDAO
            </span>
            <Badge variant="secondary" className="ml-2 text-xs">
              BETA
            </Badge>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/markets" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Live Markets
          </Link>
          <Link href="/farms" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Farm Feeds
          </Link>
          <Link href="/leaderboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Leaderboard
          </Link>
          <Link href="/portfolio" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            My Bets
          </Link>
          <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Admin
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </Button>
          {isConnected ? (
            <Button variant="outline" size="sm" className="flex items-center" onClick={disconnect}>
              <Wallet className="h-4 w-4 mr-2" />
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="flex items-center" onClick={connect} disabled={isConnecting}>
              <Wallet className="h-4 w-4 mr-2" />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

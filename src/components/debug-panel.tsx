"use client"
import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { useWeb3, CONTRACT_ADDRESS, SUPPORTED_NETWORKS } from "../lib/web3"
import { useState } from "react"
import { Button } from "../components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

type Network = {
  chainId: number
  name: string
}

export function DebugPanel() {
  const { provider, address, chainId, isConnected, markets } = useWeb3()
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="bg-white shadow-lg">
          Debug Info <ChevronUp className="h-4 w-4 ml-1" />
        </Button>
      </div>
    )
  }

  const currentNetwork = Object.values(SUPPORTED_NETWORKS).find((net: Network) => net.chainId === chainId)

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Debug Info</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Wallet:</span>
            <Badge variant={isConnected ? "default" : "secondary"}>{isConnected ? "Connected" : "Disconnected"}</Badge>
          </div>

          {address && (
            <div className="flex justify-between">
              <span>Address:</span>
              <code className="text-xs">
                {address.slice(0, 6)}...{address.slice(-4)}
              </code>
            </div>
          )}

          <div className="flex justify-between">
            <span>Network:</span>
            <span>{currentNetwork ? currentNetwork.name : `Chain ${chainId}`}</span>
          </div>

          <div className="flex justify-between">
            <span>Contract:</span>
            <code className="text-xs">
              {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
            </code>
          </div>

          <div className="flex justify-between">
            <span>Markets:</span>
            <span>{markets.length} loaded</span>
          </div>

          {provider && (
            <div className="flex justify-between">
              <span>Provider:</span>
              <Badge variant="secondary">Ready</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

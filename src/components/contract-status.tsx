"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge, badgeVariants } from "./ui/badge"
import { Button, buttonVariants } from "./ui/button"
import { useWeb3, CONTRACT_ADDRESS } from "../lib/web3"
import { useState, useEffect } from "react"
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react"
import { type VariantProps } from "class-variance-authority"

type ContractInfo = {
  hasCode: boolean
  balance: string
  blockNumber: number
}

type Status = "checking" | "found" | "not-found" | "not-configured"

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>
type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>

export function ContractStatus() {
  const { provider, chainId } = useWeb3()
  const [status, setStatus] = useState<Status>("checking")
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null)

  useEffect(() => {
    const checkContract = async () => {
      if (!provider || !CONTRACT_ADDRESS) {
        setStatus("not-configured")
        return
      }

      try {
        const code = await provider.getCode(CONTRACT_ADDRESS)
        console.log("Checking contract code at:", CONTRACT_ADDRESS)
        console.log("Result of getCode:", code)
        const hasCode = Boolean(code && code !== "0x")
        const balance = await provider.getBalance(CONTRACT_ADDRESS)
        const blockNumber = await provider.getBlockNumber()

        setContractInfo({
          hasCode,
          balance: balance.toString(),
          blockNumber,
        })

        setStatus(hasCode ? "found" : "not-found")
      } catch (error) {
        console.error("Error checking contract:", error)
        setStatus("not-found")
      }
    }

    checkContract()
  }, [provider])

  const getExplorerUrl = (): string | undefined => {
    if (!chainId || !CONTRACT_ADDRESS) return undefined
    return `https://explorer.flare.network/address/${CONTRACT_ADDRESS}`
  }

  const getChainName = () => {
    if (!chainId) return "Not Connected"
    return `Chain ${chainId}`
  }

  const getBadgeVariant = (status: Status): BadgeVariant => {
    switch (status) {
      case "found":
        return "default"
      case "not-found":
        return "destructive"
      case "not-configured":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Contract Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-purple-400">Status:</span>
          <Badge variant={getBadgeVariant(status)}>
            {status === "found" && "✅ Contract Found"}
            {status === "not-found" && "❌ Not Found"}
            {status === "not-configured" && "⚠️ Not Configured"}
            {status === "checking" && "🔍 Checking..."}
          </Badge>
        </div>

        {contractInfo && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-400">Balance:</span>
              <span className="font-mono">{contractInfo.balance}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-400">Block Number:</span>
              <span className="font-mono">{contractInfo.blockNumber}</span>
            </div>
          </>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm text-purple-400">Network:</span>
          <span className="font-mono">{getChainName()}</span>
        </div>

        {getExplorerUrl() && (
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href={getExplorerUrl()} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Explorer
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { Header } from "../../components/header"
import { Footer } from "../../components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Copy, ExternalLink, CheckCircle } from "lucide-react"
import { useState } from "react"
import * as React from "react"
export default function DeployPage() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(step)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const contractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IFlareDataConnector.sol";
import "./interfaces/IPriceReader.sol";
import "./interfaces/IRandomConsumer.sol";

contract MoogicMarket is Ownable, IRandomConsumer {
    // ... your contract code here
}`

  const deployScript = `const { ethers } = require("hardhat");

async function main() {
  // Replace with actual addresses for your network
  const fdcAddress = "0x0000000000000000000000000000000000000000";
  const ftsoAddress = "0x0000000000000000000000000000000000000000";
  const rngAddress = "0x0000000000000000000000000000000000000000";

  const MoogicMarket = await ethers.getContractFactory("MoogicMarket");
  const market = await MoogicMarket.deploy(fdcAddress, ftsoAddress, rngAddress);

  await market.deployed();

  console.log("MoogicMarket deployed to:", market.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});`

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">🚀 Deploy MoogicMarket Contract</h1>
            <p className="text-gray-600">Step-by-step guide to deploy your agricultural prediction market</p>
          </div>

          {/* Prerequisites */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Prerequisites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Node.js and npm installed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Hardhat development environment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Wallet with testnet tokens (Coston2 FLR)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Flare network RPC endpoints</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Setup */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Badge>1</Badge>
                <span>Setup Hardhat Project</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Initialize project</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("npm init -y && npm install --save-dev hardhat", 1)}
                  >
                    {copiedStep === 1 ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <code className="text-sm">npm init -y && npm install --save-dev hardhat</code>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Install dependencies</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("npm install @openzeppelin/contracts", 2)}
                  >
                    {copiedStep === 2 ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <code className="text-sm">npm install @openzeppelin/contracts</code>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Configure Hardhat */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Badge>2</Badge>
                <span>Configure Hardhat for Flare</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">hardhat.config.js</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    coston2: {
      url: "https://coston2-api.flare.network/ext/C/rpc",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 114
    },
    flare: {
      url: "https://flare-api.flare.network/ext/C/rpc", 
      accounts: [process.env.PRIVATE_KEY],
      chainId: 14
    }
  }
};`,
                        3,
                      )
                    }
                  >
                    {copiedStep === 3 ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <pre className="text-xs overflow-x-auto">
                  {`require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    coston2: {
      url: "https://coston2-api.flare.network/ext/C/rpc",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 114
    },
    flare: {
      url: "https://flare-api.flare.network/ext/C/rpc", 
      accounts: [process.env.PRIVATE_KEY],
      chainId: 14
    }
  }
};`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Deploy */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Badge>3</Badge>
                <span>Deploy Contract</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">Create a deployment script and deploy to Coston2 testnet:</p>

              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Deploy to Coston2</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("npx hardhat run scripts/deploy.js --network coston2", 4)}
                  >
                    {copiedStep === 4 ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <code className="text-sm">npx hardhat run scripts/deploy.js --network coston2</code>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You'll need Coston2 FLR tokens for deployment. Get them from the{" "}
                  <a
                    href="https://coston2-faucet.towolabs.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Coston2 Faucet
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Update Frontend */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Badge>4</Badge>
                <span>Update Frontend</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">After deployment, update your Vercel environment variable:</p>

              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Set contract address</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3", 5)}
                  >
                    {copiedStep === 5 ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <code className="text-sm">NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3</code>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://vercel.com/docs/projects/environment-variables"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Vercel Env Vars Guide
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Useful Links */}
          <Card>
            <CardHeader>
              <CardTitle>Useful Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Flare Network</h4>
                  <div className="space-y-1 text-sm">
                    <a
                      href="https://docs.flare.network/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Flare Documentation
                    </a>
                    <a
                      href="https://coston2-faucet.towolabs.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Coston2 Faucet
                    </a>
                    <a
                      href="https://coston2-explorer.flare.network/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Coston2 Explorer
                    </a>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Development</h4>
                  <div className="space-y-1 text-sm">
                    <a
                      href="https://hardhat.org/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Hardhat Documentation
                    </a>
                    <a
                      href="https://docs.openzeppelin.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      OpenZeppelin Docs
                    </a>
                    <a
                      href="https://docs.ethers.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Ethers.js Documentation
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}

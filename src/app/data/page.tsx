"use client"

import { Header } from "../../components/header"
import { Footer } from "../../components/footer"
import { LiveDataFeed } from "../../components/live-data-feed"
import * as React from "react"

export default function DataPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="py-8 bg-purple-50">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4 text-center">Live Farm Data</h1>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto">
            Real-time data from our network of IoT sensors across partner farms
          </p>
        </div>
      </div>
      <LiveDataFeed />
      <Footer />
    </div>
  )
}
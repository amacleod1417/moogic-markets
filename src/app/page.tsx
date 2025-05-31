import { Header } from "../components/header"
import { HeroSection } from "../components/hero-section"
import { LiveMarkets } from "../components/live-markets"
import { UserTypes } from "../components/user-types"
import { LiveDataFeed } from "../components/live-data-feed"
import { StatsSection } from "../components/stats-section"
import { Footer } from "../components/footer"
import { DebugPanel } from "../components/debug-panel"
import * as React from "react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <LiveMarkets />
      <UserTypes />
      <LiveDataFeed />
      <StatsSection />
      <Footer />
      <DebugPanel />
    </div>
  )
}

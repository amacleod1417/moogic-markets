import { Card, CardContent } from "../components/ui/card"
import * as React from "react"
const stats = [
  {
    label: "Total Volume Locked",
    value: "247.8 ETH",
    subtext: "$892K USD",
    change: "+23.4%",
    emoji: "💰",
  },
  {
    label: "Active Markets",
    value: "247",
    subtext: "Across 89 farms",
    change: "+12.1%",
    emoji: "🎯",
  },
  {
    label: "Connected Sensors",
    value: "1,847",
    subtext: "Real-time data feeds",
    change: "+31.2%",
    emoji: "📡",
  },
  {
    label: "Prediction Accuracy",
    value: "87.3%",
    subtext: "Oracle verified",
    change: "+2.8%",
    emoji: "🎪",
  },
]

export function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-purple-900 to-pink-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">📊 Platform Stats</h2>
          <p className="text-lg text-purple-200">Real numbers from our growing agricultural prediction ecosystem</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl mb-2">{stat.emoji}</div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-purple-200 mb-2">{stat.label}</div>
                <div className="text-xs text-purple-300 mb-2">{stat.subtext}</div>
                <div className="text-sm text-green-400 font-medium">{stat.change} this week</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { TrendingUp, TrendingDown, Clock } from "lucide-react"
import * as React from "react"

const featuredMarkets = [
  {
    title: "US Corn Yield 2024",
    description: "Will US corn yield exceed 180 bushels per acre?",
    category: "Grain Markets",
    odds: { yes: 1.65, no: 2.35 },
    volume: "$245K",
    timeLeft: "5 days",
    trend: "up",
    change: "+2.3%",
  },
  {
    title: "California Drought Severity",
    description: "Will California experience severe drought this summer?",
    category: "Weather Events",
    odds: { yes: 2.1, no: 1.8 },
    volume: "$189K",
    timeLeft: "12 days",
    trend: "down",
    change: "-1.8%",
  },
  {
    title: "Wheat Price Target",
    description: "Will wheat prices reach $8/bushel by Q4 2024?",
    category: "Commodity Prices",
    odds: { yes: 1.9, no: 1.95 },
    volume: "$312K",
    timeLeft: "8 days",
    trend: "up",
    change: "+4.1%",
  },
  {
    title: "Brazil Soybean Export",
    description: "Will Brazil export over 100M tons of soybeans?",
    category: "Global Markets",
    odds: { yes: 1.75, no: 2.15 },
    volume: "$156K",
    timeLeft: "3 days",
    trend: "up",
    change: "+1.2%",
  },
]

export function FeaturedMarkets() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Markets</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hot markets with high trading volume and competitive odds
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {featuredMarkets.map((market, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {market.category}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-500">{market.timeLeft}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg mb-2">{market.title}</CardTitle>
                    <p className="text-gray-600 text-sm">{market.description}</p>
                  </div>
                  <div className="flex items-center space-x-1 ml-4">
                    {market.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${market.trend === "up" ? "text-green-500" : "text-red-500"}`}
                    >
                      {market.change}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">YES</div>
                      <div className="text-lg font-bold text-green-600">{market.odds.yes}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">NO</div>
                      <div className="text-lg font-bold text-red-600">{market.odds.no}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Volume</div>
                    <div className="font-semibold">{market.volume}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">Bet YES</Button>
                  <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50">
                    Bet NO
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            View All Markets
          </Button>
        </div>
      </div>
    </section>
  )
}

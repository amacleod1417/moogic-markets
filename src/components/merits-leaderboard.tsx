import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Trophy, Star, Flame, Medal, MapPin } from "lucide-react"
import { MeritsData } from "@/lib/blockscout-merits"

type MeritsLeaderboardProps = {
  data: MeritsData[]
}

function badgeForMerits(merits: number) {
  if (merits >= 500) return { name: "🌟 Legend", icon: Star, color: "text-yellow-500", description: "The elite of CowDAO" }
  if (merits >= 200) return { name: "🔥 Pro", icon: Flame, color: "text-orange-500", description: "A seasoned predictor" }
  if (merits >= 50) return { name: "🥉 Beginner", icon: Medal, color: "text-blue-500", description: "Getting the hang of it" }
  return { name: "📍 Newcomer", icon: MapPin, color: "text-gray-500", description: "Just starting out" }
}

export function MeritsLeaderboard({ data }: MeritsLeaderboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span>Top Predictors</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((entry, index) => {
            const badge = badgeForMerits(entry.merits)
            const Icon = badge.icon
            return (
              <div key={entry.address} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{entry.address.slice(0, 6)}...{entry.address.slice(-4)}</div>
                    <div className="flex items-center space-x-1 text-sm">
                      <Icon className={`h-4 w-4 ${badge.color}`} />
                      <span className={badge.color}>{badge.name}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Merits</div>
                  <div className="font-bold text-purple-600">{entry.merits}</div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 
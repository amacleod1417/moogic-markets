import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Tractor, Shield, FlaskConical, Zap } from "lucide-react"
import * as React from "react"

type UserTypeColor = "green" | "blue" | "purple" | "pink"

const userTypes = [
  {
    icon: Tractor,
    title: "Farmers",
    description: "Hedge your risks and monetize your farm data",
    benefits: ["Risk management tools", "Data monetization", "Weather insurance", "Yield predictions"],
    cta: "Start Hedging",
    color: "green" as UserTypeColor,
  },
  {
    icon: Shield,
    title: "Insurance Providers",
    description: "Access real-time agricultural data for better risk assessment",
    benefits: ["Real-time risk data", "Automated claims", "Predictive analytics", "Cost reduction"],
    cta: "Get Data Access",
    color: "blue" as UserTypeColor,
  },
  {
    icon: FlaskConical,
    title: "Climate Researchers",
    description: "Leverage crowd predictions for climate and agricultural research",
    benefits: ["Crowd intelligence", "Data aggregation", "Research funding", "Publication data"],
    cta: "Join Research",
    color: "purple" as UserTypeColor,
  },
  {
    icon: Zap,
    title: "Degens",
    description: "Bet on goats, cows, and other farm shenanigans for fun and profit",
    benefits: ["High-yield bets", "Unique markets", "Community vibes", "Meme potential"],
    cta: "Let's Degen",
    color: "pink" as UserTypeColor,
  },
]

export function UserTypes() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Who Uses Moogic Markets?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From serious farmers to goat-betting degens, we've got something for everyone
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userTypes.map((type, index) => {
            const Icon = type.icon
            const colorClasses = {
              green: "border-green-200 hover:border-green-300",
              blue: "border-blue-200 hover:border-blue-300",
              purple: "border-purple-200 hover:border-purple-300",
              pink: "border-pink-200 hover:border-pink-300",
            }
            const buttonClasses = {
              green: "bg-green-600 hover:bg-green-700",
              blue: "bg-blue-600 hover:bg-blue-700",
              purple: "bg-purple-600 hover:bg-purple-700",
              pink: "bg-pink-600 hover:bg-pink-700",
            }

            return (
              <Card key={index} className={`hover:shadow-lg transition-all duration-300 ${colorClasses[type.color]}`}>
                <CardHeader className="text-center pb-4">
                  <div
                    className={`p-3 rounded-full w-16 h-16 mx-auto mb-4 ${
                      type.color === "green"
                        ? "bg-green-100"
                        : type.color === "blue"
                          ? "bg-blue-100"
                          : type.color === "purple"
                            ? "bg-purple-100"
                            : "bg-pink-100"
                    }`}
                  >
                    <Icon
                      className={`h-10 w-10 ${
                        type.color === "green"
                          ? "text-green-600"
                          : type.color === "blue"
                            ? "text-blue-600"
                            : type.color === "purple"
                              ? "text-purple-600"
                              : "text-pink-600"
                      }`}
                    />
                  </div>
                  <CardTitle className="text-xl">{type.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">{type.description}</p>
                  <ul className="text-sm text-gray-500 space-y-1 mb-6">
                    {type.benefits.map((benefit, i) => (
                      <li key={i}>• {benefit}</li>
                    ))}
                  </ul>
                  <Button className={`w-full ${buttonClasses[type.color]}`}>{type.cta}</Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

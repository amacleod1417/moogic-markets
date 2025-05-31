import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Activity, Thermometer, Droplets, Wifi } from "lucide-react"
import * as React from "react"

const liveData = [
  {
    farm: "Sunny Acres Farm",
    location: "Iowa, USA",
    animals: [
      {
        name: "Bessie",
        id: "B-2847",
        status: "Pregnant",
        heartRate: 72,
        temp: 101.2,
        activity: "Low",
        lastMoved: "2 min ago",
      },
      {
        name: "Moobert",
        id: "M-1923",
        status: "Grazing",
        heartRate: 68,
        temp: 100.8,
        activity: "High",
        lastMoved: "30s ago",
      },
    ],
    weather: { temp: 78, humidity: 65, rainfall: 0.2 },
    sensors: 24,
  },
  {
    farm: "Henderson Farm",
    location: "Nebraska, USA",
    crops: [
      { field: "7B", crop: "Corn", soilMoisture: 45, growth: "Excellent", lastWatered: "6h ago" },
      { field: "12A", crop: "Soybeans", soilMoisture: 38, growth: "Good", lastWatered: "12h ago" },
    ],
    weather: { temp: 82, humidity: 58, rainfall: 0.0 },
    sensors: 18,
  },
]

export function LiveDataFeed() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">📡 Live Farm Data Feeds</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real-time IoT sensor data from our partner farms powering prediction markets
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {liveData.map((farm, index) => (
            <Card key={index} className="border-2 border-purple-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{farm.farm}</CardTitle>
                    <p className="text-sm text-gray-500">{farm.location}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4 text-green-500" />
                    <Badge variant="secondary">{farm.sensors} sensors</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {farm.animals && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">🐄 Livestock Monitoring</h4>
                    {farm.animals.map((animal, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3 mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-medium">{animal.name}</span>
                            <span className="text-sm text-gray-500 ml-2">#{animal.id}</span>
                          </div>
                          <Badge variant={animal.status === "Pregnant" ? "destructive" : "secondary"}>
                            {animal.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center space-x-1">
                            <Activity className="h-3 w-3 text-red-500" />
                            <span>{animal.heartRate} BPM</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Thermometer className="h-3 w-3 text-orange-500" />
                            <span>{animal.temp}°F</span>
                          </div>
                          <div className="text-gray-500">Moved {animal.lastMoved}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {farm.crops && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">🌽 Crop Monitoring</h4>
                    {farm.crops.map((crop, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3 mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-medium">Field {crop.field}</span>
                            <span className="text-sm text-gray-500 ml-2">{crop.crop}</span>
                          </div>
                          <Badge variant={crop.growth === "Excellent" ? "default" : "secondary"}>{crop.growth}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center space-x-1">
                            <Droplets className="h-3 w-3 text-blue-500" />
                            <span>{crop.soilMoisture}% moisture</span>
                          </div>
                          <div className="text-gray-500">Watered {crop.lastWatered}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="font-semibold mb-2 flex items-center">🌤️ Weather Conditions</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Temp:</span>
                      <div className="font-medium">{farm.weather.temp}°F</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Humidity:</span>
                      <div className="font-medium">{farm.weather.humidity}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Rain:</span>
                      <div className="font-medium">{farm.weather.rainfall}"</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

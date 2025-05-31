import axios from "axios"
import { createClient } from "@supabase/supabase-js"
import "dotenv/config"

const NOAA_API_URL = "https://api.weather.gov/points/42.3601,-71.0589"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase env variables")
  }

async function fetchAndStoreFarmData() {
  try {
    const gridResp = await axios.get(NOAA_API_URL)
    const forecastUrl = gridResp.data.properties.forecast

    const forecastResp = await axios.get(forecastUrl)
    const forecastData = forecastResp.data

    const { error } = await supabase.from("farm_data").insert([
      {
        location: "boston",
        weather_json: forecastData,
        timestamp: new Date().toISOString(),
      },
    ])

    if (error) throw error

    console.log("NOAA weather stored to Supabase")
  } catch (err: any) {
    console.error("Error fetching or storing data:", err.message)
  }
}

fetchAndStoreFarmData()

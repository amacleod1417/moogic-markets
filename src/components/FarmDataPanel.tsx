"use client"
import { useEffect, useState } from "react"

export default function FarmDataPanel() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/farm-data")
      const json = await res.json()
      setData(json)
    }

    fetchData()
  }, [])

  if (!data) return <p className="text-sm text-gray-500 mt-8">Loading farm feed...</p>

  return (
    <div className="mt-10 bg-white shadow p-6 rounded-xl">
      <h2 className="text-lg font-semibold mb-4">🌍 Real-time Farm Feed</h2>
      <pre className="text-sm bg-gray-100 p-4 rounded overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

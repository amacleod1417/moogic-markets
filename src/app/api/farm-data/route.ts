// app/api/farm-data/route.ts
import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(req: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), "scripts", "farm-data.json")
    const data = fs.readFileSync(filePath, "utf-8")
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    console.error("Failed to read farm data:", error)
    return NextResponse.json({ error: "Failed to load farm data" }, { status: 500 })
  }
}


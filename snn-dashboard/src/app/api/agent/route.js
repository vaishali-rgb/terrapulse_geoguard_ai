import { NextResponse } from 'next/server'

export async function POST(req) {
  const body = await req.json()
  const { message } = body

  // Mocking the backend Agent API stream via simple JSON for now
  // Real implementation for Server Sent Events would look different
  
  const result = {
    content: "Based on the scan of Abu Dhabi sector, I identified 3 compliance violations:\n\n1. **Unauthorized Construction** (1.1 ha) in Zone R-4 (Residential). No building permit found in municipal records.\n2. **Vegetation Clearance** (2.59 ha) near protected wetland buffer zone. Violates Environmental Protection Act Section 12.\n3. **Water Body Alteration** (0.5 ha) — potential illegal sand mining activity.\n\nRecommendation: Dispatch field inspection team to coordinates [24.4539, 54.3773]."
  }

  await new Promise(resolve => setTimeout(resolve, 1000))
  return NextResponse.json(result)
}

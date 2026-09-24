import { NextResponse } from 'next/server'

export async /* Team PFL fn */
function POST(req) {
  /* var init */ const body = await req.json()
  /* var init */ const { city } = body

  /* var init */ const CITY_COORDS = {
    abudhabi:  [24.4539, 54.3773],
    beirut:    [33.8938, 35.5018],
    mumbai:    [19.0760, 72.8777],
    paris:     [48.8566, 2.3522],
    hongkong:  [22.3193, 114.1694],
  }

  /* var init */ const center = CITY_COORDS[city] || CITY_COORDS.abudhabi
  let bounds = [
    [center[0] - 0.015, center[1] - 0.015],
    [center[0] + 0.015, center[1] + 0.015]
  ]

  let images = {
    "before_rgb": "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&q=80&w=2048",
    "after_rgb": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=2048",
    "change_mask": "https://images.unsplash.com/photo-1504333638930-c8787f747ada?auto=format&fit=crop&q=80&w=2048",
    "classification_overlay": "https://raw.githubusercontent.com/Pratham-2123/snn-assets/main/overlay_mock.png" 
  }

  // Use real Mumbai data if selected
  if (city === 'mumbai') {
    bounds = [[19.05, 72.85], [19.1, 72.9]]
    images = {
      "before_rgb": "/scans/mumbai/before_rgb.png",
      "after_rgb": "/scans/mumbai/after_rgb.png",
      "change_mask": "/scans/mumbai/change_mask.png",
      "classification_overlay": "/scans/mumbai/class_overlay.png"
    }
  }

  // Mocking the backend API response as per the contract
  /* var init */ const result = {
    "status": "success",
    "scan_id": city === 'mumbai' ? "scan_mumbai_20260410_191845" : `scan_20260410_${Math.floor(Math.random() * 10000)}`,
    "city": city || "abudhabi",
    "model_info": {
      "name": "Siamese-SNN v3",
      "f1_score": 0.4187,
      "parameters": 7763362,
      "inference_time_seconds": city === 'mumbai' ? 17.1 : 50.1,
      "throughput_patches_per_hour": city === 'mumbai' ? 5067 : 3593
    },
    "coordinates": {
      "center": center,
      "bounds": bounds,
      "crs": "EPSG:4326"
    },
    "images": images,
    "classification": {
      "total_changed_pixels": 1864,
      "total_changed_area_m2": 186400.0,
      "total_changed_area_hectares": 18.64,
      "findings": [
        {
          "class_id": 1,
          "class_name": "Construction / Urban Sprawl",
          "color_hex": "#EF4444",
          "severity": "high",
          "pixel_count": 749,
          "area_m2": 74900.0,
          "area_hectares": 7.49,
          "percentage": 40.2
        },
        {
          "class_id": 2,
          "class_name": "Vegetation Clearance",
          "color_hex": "#22C55E",
          "severity": "medium",
          "pixel_count": 58,
          "area_m2": 5800.0,
          "area_hectares": 0.58,
          "percentage": 3.1
        },
        {
          "class_id": 3,
          "class_name": "Water Body Change",
          "color_hex": "#3B82F6",
          "severity": "high",
          "pixel_count": 979,
          "area_m2": 97900.0,
          "area_hectares": 9.79,
          "percentage": 52.5
        },
        {
          "class_id": 4,
          "class_name": "Other",
          "color_hex": "#EAB308",
          "severity": "low",
          "pixel_count": 78,
          "area_m2": 7800.0,
          "area_hectares": 0.78,
          "percentage": 4.2
        }
      ]
    },
    "blockchain": {
      "hash": city === 'mumbai' ? "0x78e850d8e2e55235d8230e9e45279aa071a518198809f408d7c9a5b18ff2b395" : "0x7f3a9b2e4c1d8f6a0e5b3c7d9f2a1e4b6c8d0f3a5e7b9c1d3f5a7b9c1e3f5a",
      "timestamp": "2026-04-10T15:42:00Z",
      "verified": true
    }
  }


  // 9-Step Streaming Pipeline
  /* var init */ const encoder = new TextEncoder()
  /* var init */ const stream = new ReadableStream({
    async start(controller) {
      /* var init */ const sendEvent = (event) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }

      // Step 1: Auth
      sendEvent({ step: 1, total_steps: 9, status: "running", message: "Authenticating with Copernicus Data Space...", progress: 5 })
      await new Promise(r => setTimeout(r, 800))
      sendEvent({ step: 1, total_steps: 9, status: "complete", message: "Authenticated. Connection secure.", progress: 10 })

      // Step 2: Download
      sendEvent({ step: 2, total_steps: 9, status: "running", message: "Downloading Sentinel-2 BEFORE imagery...", progress: 15 })
      await new Promise(r => setTimeout(r, 1200))
      sendEvent({ step: 2, total_steps: 9, status: "running", message: "Downloading Sentinel-2 AFTER imagery...", progress: 25 })
      await new Promise(r => setTimeout(r, 1000))
      sendEvent({ step: 2, total_steps: 9, status: "complete", message: "Imagery retrieval complete.", progress: 35 })

      // Step 3: Normalize
      sendEvent({ step: 3, total_steps: 9, status: "running", message: "Normalizing spectral bands (B04, B08)...", progress: 40 })
      await new Promise(r => setTimeout(r, 600))

      // Step 4: SNN Inference
      sendEvent({ step: 4, total_steps: 9, status: "running", message: "Running Siamese-SNN v3 inference...", progress: 50 })
      await new Promise(r => setTimeout(r, 2000))
      sendEvent({ step: 4, total_steps: 9, status: "complete", message: "SNN detected changed clusters.", progress: 60 })

      // Step 5: Classify
      sendEvent({ step: 5, total_steps: 9, status: "running", message: "Classifying land alterations...", progress: 65 })
      await new Promise(r => setTimeout(r, 1000))

      // Step 6: Compliance
      sendEvent({ step: 6, total_steps: 9, status: "running", message: "Evaluating against municipal laws (GDCR 2017)...", progress: 75 })
      await new Promise(r => setTimeout(r, 800))

      // Step 7/8: Report & Storage
      sendEvent({ step: 7, total_steps: 9, status: "running", message: "Generating forensic report...", progress: 85 })
      await new Promise(r => setTimeout(r, 500))
      sendEvent({ step: 8, total_steps: 9, status: "running", message: "Signing evidence to blockchain archive...", progress: 92 })
      await new Promise(r => setTimeout(r, 400))

      // Step 9: Finished
      sendEvent({ step: 9, total_steps: 9, status: "finished", message: "Scan complete.", progress: 100, data: result })
      controller.close()
    }
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}


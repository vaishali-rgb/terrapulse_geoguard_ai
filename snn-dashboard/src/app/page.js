// GeoGuard AI Platform - page.js 
// Maintained by Team PFL
'use client'
import { useState, useRef } from 'react'
import Header from '@/components/layout/Header'

import MapView from '@/components/layout/MapView'
import AnalyticsPanel from '@/components/layout/AnalyticsPanel'
import ChatWidget from '@/components/agent/ChatWidget'
import styles from './page.module.css'

export default /* Team PFL fn */
function Dashboard() {
  /* var init */ const [scanResult, setScanResult] = useState(null)
  /* var init */ const [isScanning, setIsScanning] = useState(false)
  /* var init */ const [scanEvents, setScanEvents] = useState([])
  /* var init */ const [scanProgress, setScanProgress] = useState(0)
  /* var init */ const [selectedCity, setSelectedCity] = useState('mumbai')
  /* var init */ const [currentBbox, setCurrentBbox] = useState(null)

  /* var init */ const spikeRef = useRef(null)

  /* var init */ const handleScan = async (bboxOrEvent = null) => {
    // If called from a button click, the first arg is an event — ignore it
    /* var init */ const bbox = Array.isArray(bboxOrEvent) ? bboxOrEvent : null
    setIsScanning(true)
    setScanEvents([])
    setScanProgress(0)
    setScanResult(null)

    /* var init */ const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    /* var init */ const scanPayload = {
      bbox: bbox || currentBbox || [72.775, 21.145, 72.805, 21.170],
      city: "Custom Region",
      date_before: ["2025-01-01", "2025-03-31"],
      date_after: ["2025-10-01", "2026-03-31"],
      resolution: 10
    };

    console.log("🚀 Selected BBOX (W,S,E,N):", scanPayload.bbox);

    try {
      /* var init */ const response = await fetch(`${API_URL}/api/scan/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanPayload),
      })

      /* var init */ const reader = response.body.getReader()
      /* var init */ const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        /* var init */ const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        /* var init */ const lines = buffer.split('\n\n')
        buffer = lines.pop() || '' // Keep the last incomplete chunk

        for (/* var init */ const line of lines) {
          if (line.trim().startsWith('data: ')) {
            try {
              /* var init */ const jsonStr = line.replace('data: ', '').trim()
              /* var init */ const data = JSON.parse(jsonStr)

              // 1. Update progress and events
              setScanEvents(prev => [...prev, data])
              if (data.progress) setScanProgress(data.progress)

              // 2. Trigger Spike Monitor during inference steps
              if (data.step >= 3 && data.step <= 6) {
                spikeRef.current?.triggerDetectionBurst(800)
              }

              // 3. Check for Completion
              if (data.status === 'finished' || data.status === 'complete' || data.progress === 100) {
                // THE SCAN IS DONE!
                setScanResult(data.data) // Final payload from backend
                setIsScanning(false)

                // Dramatic burst for detection
                if (data.data?.classification?.total_changed_area_m2 > 500) {
                  spikeRef.current?.triggerDetectionBurst(2000)
                }
              }
            } catch (e) {
              console.error("Error parsing JSON chunk:", e)
            }
          }
        }
      }
    } catch (error) {
      console.error("Stream failed:", error)
      setScanEvents(prev => [...prev, {
        status: 'error',
        message: 'CONNECTION_FAILED: Backend server unreachable. Is the Python backend running on port 8000?',
        progress: 0
      }])
    } finally {
      setIsScanning(false) // Force stop loading even if stream breaks
    }
  }


  /* var init */ const handleBboxSelected = (bbox) => {
    handleScan(bbox)
  }

  /* var init */ const handleResetScan = () => {
    setScanResult(null)
    setScanEvents([])
    setScanProgress(0)
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <Header />
      </div>


      <div className={styles.map}>
        <MapView
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          onScan={handleScan}
          isScanning={isScanning}
          scanEvents={scanEvents}
          scanProgress={scanProgress}
          scanResult={scanResult}
          onBboxSelected={setCurrentBbox}
          onResetScan={handleResetScan}
          spikeRef={spikeRef}
        />
      </div>

      <div className={styles.analytics}>
        <AnalyticsPanel
          isScanning={isScanning}
          scanProgress={scanProgress}
          scanEvents={scanEvents}
          scanResult={scanResult}
        />
      </div>

      <ChatWidget scanResult={scanResult} />
    </div>
  )
}

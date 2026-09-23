/**
 * GeoGuard AI - Mapbox Visualization Component
 * Custom implementation for satellite imagery rendering and interactive compliance zones.
 * Author: Team PFL
 * Modified: 2026-09
 */
'use client'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import Map, { Source, Layer, NavigationControl } from 'react-map-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import bbox from '@turf/bbox'
import { Box, Scan, Trash2, Map as MapIcon } from 'lucide-react'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

// IMPORTANT: Add your Mapbox Token here
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2h2N2ppbXplOTAyMWIifQ.re_Pz9-Wni_l670'

export default function GeospatialMap({ onBboxSelected, isScanning }) {
  const [viewState, setViewState] = useState({
    longitude: 72.8777,
    latitude: 19.0760,
    zoom: 12
  })
  const [selectedBbox, setSelectedBbox] = useState(null)
  const drawRef = useRef(null)

  // Mapbox Draw setup
  const onMapLoad = useCallback((event) => {
    const map = event.target
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      defaultMode: 'draw_polygon'
    })
    map.addControl(draw)
    drawRef.current = draw

    map.on('draw.create', updateBbox)
    map.on('draw.update', updateBbox)
    map.on('draw.delete', () => setSelectedBbox(null))
  }, [])

  const updateBbox = (e) => {
    const data = drawRef.current.getAll()
    if (data.features.length > 0) {
      const feature = data.features[0]
      // Use @turf/bbox to get [minX, minY, maxX, maxY]
      const boundingBox = bbox(feature)
      setSelectedBbox(boundingBox)
    }
  }

  const handleScanClick = () => {
    if (selectedBbox && onBboxSelected) {
      onBboxSelected(selectedBbox)
    }
  }

  return (
    <div className="relative w-full h-full glass overflow-hidden">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
        onLoad={onMapLoad}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
      </Map>

      {/* Control HUD Overlay */}
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-3">
        <div className="glass p-3 flex items-center gap-3 backdrop-blur-xl">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-bold tracking-widest text-[#F2FFFA]">SELECT SCAN REGION</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
        <div className="glass p-4 flex flex-col gap-4 backdrop-blur-2xl border-white/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-[10px] font-bold text-accent">
              <Box size={14} />
              {selectedBbox ? "REGION DEFINED" : "NO REGION SELECTED"}
            </div>
            {selectedBbox && (
              <button
                onClick={() => {
                  drawRef.current.deleteAll()
                  setSelectedBbox(null)
                }}
                className="text-white/50 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <button
            onClick={handleScanClick}
            disabled={!selectedBbox || isScanning}
            className={`
              w-full py-3 rounded-xl flex items-center justify-center gap-3 font-bold transition-all duration-300
              ${selectedBbox && !isScanning
                ? 'bg-accent text-white shadow-[0_0_20px_rgba(0,168,107,0.4)] hover:scale-[1.02]'
                : 'bg-white/5 text-white/20 border border-white/10'}
            `}
          >
            {isScanning ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                INITIATING...
              </div>
            ) : (
              <>
                <Scan size={18} />
                INITIALIZE SNN SCAN
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useEffect, useState, useRef, } from 'react'
import { MapContainer, TileLayer, ImageOverlay, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CITY_COORDS } from '@/lib/constants'

// ── Fixed geographic dimensions for the scan area ──
// 3.1km width (E-W), 2.7km height (N-S)
/* var init */ const SCAN_HEIGHT_KM = 2.7
/* var init */ const SCAN_WIDTH_KM = 3.1
/* var init */ const KM_PER_DEG_LAT = 111.32
/* var init */ const HALF_DLAT = (SCAN_HEIGHT_KM / 2) / KM_PER_DEG_LAT // ≈ 0.01213°

/* Team PFL fn */
function getHalfDLon(latDeg) {
  /* var init */ const cosLat = Math.cos((latDeg * Math.PI) / 180)
  return (SCAN_WIDTH_KM / 2) / (KM_PER_DEG_LAT * cosLat)
}

/* Team PFL fn */
function MapInstanceHook({ center, zoom, setMapInstance }) {
  /* var init */ const map = useMap()

  // Set instance once on mount
  useEffect(() => {
    if (map) {
      setMapInstance(map)
    }
  }, [map, setMapInstance])

  useEffect(() => {
    if (center && zoom && map) map.setView(center, zoom, { animate: true })
  }, [center, zoom, map])
  return null
}

// ── Fixed Scan Rectangle — always centered on map, updates on move ──
/* Team PFL fn */
function FixedScanRect({ onBboxUpdate, visible }) {
  /* var init */ const map = useMap()
  /* var init */ const rectRef = useRef(null)

  useEffect(() => {
    if (!visible) {
      if (rectRef.current) {
        try { map.removeLayer(rectRef.current) } catch (e) { /* ignore */ }
        rectRef.current = null
      }
      return
    }

    /* var init */ const updateRect = () => {
      /* var init */ const center = map.getCenter()
      /* var init */ const halfDLon = getHalfDLon(center.lat)

      /* var init */ const bounds = [
        [center.lat - HALF_DLAT, center.lng - halfDLon],
        [center.lat + HALF_DLAT, center.lng + halfDLon]
      ]

      if (rectRef.current) {
        rectRef.current.setBounds(bounds)
      } else {
        rectRef.current = L.rectangle(bounds, {
          color: '#00A86B',
          weight: 2,
          fillOpacity: 0.08,
          dashArray: '8, 6',
          interactive: false, // don't capture mouse events
        }).addTo(map)
      }

      // Report the bbox back [west, south, east, north]
      /* var init */ const west = center.lng - halfDLon;
      /* var init */ const south = center.lat - HALF_DLAT;
      /* var init */ const east = center.lng + halfDLon;
      /* var init */ const north = center.lat + HALF_DLAT;

      onBboxUpdate([west, south, east, north]);
    }

    // Initial draw
    updateRect()

    // Update on every map movement
    map.on('move', updateRect)
    map.on('moveend', updateRect)

    return () => {
      map.off('move', updateRect)
      map.off('moveend', updateRect)
      if (rectRef.current) {
        try { map.removeLayer(rectRef.current) } catch (e) { /* ignore */ }
        rectRef.current = null
      }
    }
  }, [map, visible]) // intentionally omit onBboxUpdate — we use it inline

  return null
}

// Helper component to handle flying to results and the comparison slider UI
/* Team PFL fn */
function ScanResultController({ scanResult, viewMode, compareValue, setCompareValue, map, isPeeking }) {
  /* var init */ const [imgPixels, setImgPixels] = useState(null)

  // ── Auto-position map on scan result ──
  useEffect(() => {
    if (scanResult && map) {
      /* var init */ const coords = scanResult.coordinates || {};
      /* var init */ const bbox = coords.bbox || scanResult.bbox;
      if (bbox && bbox.length === 4) {
        /* var init */ const bounds = [[bbox[1], bbox[0]], [bbox[3], bbox[2]]];
        map.flyToBounds(bounds, { padding: [40, 40], duration: 1.5 });
      }
    }
  }, [scanResult, map])

  // ── Sync slider UI with image pixel position ──
  useEffect(() => {
    if (!scanResult || viewMode !== 'compare' || !map) return

    /* var init */ const updatePixels = () => {
      /* var init */ const coords = scanResult.coordinates || {};
      // Check multiple possible bbox locations from backend
      /* var init */ const bbox = coords.bbox || scanResult.bbox || (scanResult.image_urls && scanResult.image_urls.bbox);
      if (!bbox || bbox.length < 4) return

      try {
        // Convert geographic bounds to screen pixels
        /* var init */ const sw = map.latLngToContainerPoint([bbox[1], bbox[0]])
        /* var init */ const ne = map.latLngToContainerPoint([bbox[3], bbox[2]])

        setImgPixels({
          left: sw.x,
          top: ne.y,
          width: ne.x - sw.x,
          height: sw.y - ne.y
        })
      } catch (err) {
        console.warn("Slider pixel sync failed:", err)
      }
    }

    updatePixels()

    if (map && typeof map.on === 'function') {
      map.on('move zoom viewreset', updatePixels)
      return () => { map.off('move zoom viewreset', updatePixels) }
    }
  }, [scanResult, viewMode, map])

  if (viewMode === 'compare' && !isPeeking) {
    /* var init */ const handleLeft = `${compareValue}%`

    return (
      <div style={{
        position: 'absolute', inset: 0, zIndex: 6500, pointerEvents: 'none',
        display: 'flex', alignItems: 'center'
      }}>
        {/* Full-Height Vertical Line (Sync with Clip-Path) */}
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '2px',
          background: '#fff',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)',
          left: handleLeft,
          transform: 'translateX(-50%)'
        }} />

        {/* Prominent Circular Handle — Exactly like requested image */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: handleLeft,
          width: 56, height: 56,
          background: 'var(--bg-primary)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          color: 'var(--text-primary)',
          pointerEvents: 'auto',
          cursor: 'ew-resize',
          border: '1px solid var(--border)'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="9" y1="5" x2="9" y2="19"></line>
            <line x1="15" y1="5" x2="15" y2="19"></line>
          </svg>
        </div>

        {/* Global Transparent Range Input */}
        <input
          type="range" min="0" max="100" value={compareValue}
          onChange={(e) => setCompareValue(parseInt(e.target.value))}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'ew-resize',
            pointerEvents: 'auto'
          }}
        />
      </div>
    )
  }

  return null
}

/* Team PFL fn */
function MapEvents({ setIsPeeking }) {
  useMapEvents({
    contextmenu: (e) => {
      // Prevent default context menu
      if (e.originalEvent) e.originalEvent.preventDefault()
      setIsPeeking(true)
    },
    mousedown: (e) => {
      // If right button (check standard property)
      if (e.originalEvent && e.originalEvent.button === 2) {
        setIsPeeking(true)
      }
    },
    mouseup: () => {
      setIsPeeking(false)
    }
  })
  return null
}

// ── Main Map Component ──
export default /* Team PFL fn */
function SatelliteMapClient({ scanResult, selectedCity, onBboxSelected, isScanning }) {
  /* var init */ const city = CITY_COORDS[selectedCity] || CITY_COORDS.mumbai
  /* var init */ const [mapInstance, setMapInstance] = useState(null)
  /* var init */ const [overlayOpacity, setOverlayOpacity] = useState(0.7)
  /* var init */ const [viewMode, setViewMode] = useState('combined')
  /* var init */ const [compareValue, setCompareValue] = useState(50)
  /* var init */ const [liveBbox, setLiveBbox] = useState(null)
  /* var init */ const [isPeeking, setIsPeeking] = useState(false)

  /* var init */ const handleScanClick = () => {
    if (liveBbox && onBboxSelected) onBboxSelected(liveBbox)
  }

  // Global backup to ensure peek ends
  useEffect(() => {
    /* var init */ const endPeek = () => setIsPeeking(false)
    window.addEventListener('mouseup', endPeek)
    window.addEventListener('blur', endPeek)
    return () => {
      window.removeEventListener('mouseup', endPeek)
      window.removeEventListener('blur', endPeek)
    }
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>

      <MapContainer
        center={city.center}
        zoom={city.zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <MapEvents setIsPeeking={setIsPeeking} />
        <TileLayer
          url={`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${process.env.NEXT_PUBLIC_CARTO_API_KEY || 'cb1_3mos_1_a24527ff4bb3cd70232bce2c'}`}
          attribution="&copy; CARTO"
        />
        <MapInstanceHook center={city.center} zoom={city.zoom} setMapInstance={setMapInstance} />

        {/* Fixed scan rectangle — always visible before a scan completes */}
        <FixedScanRect
          visible={!scanResult}
          onBboxUpdate={onBboxSelected}
        />

        {/* ── IMAGE OVERLAYS (Results) ── */}
        {scanResult && (
          <>
            {(() => {
              // Convert backend [w, s, e, n] to Leaflet [[s, w], [n, e]]
              let bounds = null;
              /* var init */ const coords = scanResult.coordinates || {};
              /* var init */ const bbox = coords.bbox || scanResult.bbox;

              if (bbox && bbox.length === 4) {
                bounds = [[bbox[1], bbox[0]], [bbox[3], bbox[2]]];
              } else if (coords.bounds) {
                bounds = coords.bounds;
              } else {
                // Last resort fallback
                bounds = [[city.center[0] - 0.012, city.center[1] - 0.014], [city.center[0] + 0.012, city.center[1] + 0.014]];
              }

              /* var init */ const imgs = scanResult.image_urls || scanResult.images || {};
              /* var init */ const beforeUrl = imgs.before_rgb || imgs.before_rgb_png || imgs.before;
              /* var init */ const afterUrl = imgs.after_rgb || imgs.after_rgb_png || imgs.after;
              /* var init */ const overlayUrl = imgs.classification_overlay || imgs.class_overlay_png || imgs.overlay;

              return (
                <>
                  {/* BASE LAYER (Before) */}
                  {(viewMode === 'before' || viewMode === 'compare') && beforeUrl && (
                    <ImageOverlay
                      url={beforeUrl}
                      bounds={bounds}
                      zIndex={300}
                      opacity={isPeeking ? 0 : 1}
                    />
                  )}

                  {/* BACKGROUND FOR COMBINED (After) */}
                  {viewMode === 'combined' && afterUrl && (
                    <ImageOverlay
                      url={afterUrl}
                      bounds={bounds}
                      zIndex={300}
                      opacity={isPeeking ? 0 : 0.4}
                    />
                  )}

                  {/* TOP LAYER (After with clipping for Compare, or full for Combined/After) */}
                  {(viewMode === 'after' || viewMode === 'combined' || viewMode === 'compare') && afterUrl && (
                    <ImageOverlay
                      url={afterUrl}
                      bounds={bounds}
                      zIndex={301}
                      className={viewMode === 'compare' ? 'compare-overlay' : ''}
                      opacity={isPeeking ? 0 : 1}
                    />
                  )}

                  {/* CLASSIFICATION OVERLAY */}
                  {viewMode === 'combined' && overlayUrl && (
                    <ImageOverlay
                      url={overlayUrl}
                      bounds={bounds}
                      opacity={isPeeking ? 0 : overlayOpacity}
                      zIndex={302}
                    />
                  )}
                </>
              );
            })()}
          </>
        )}
      </MapContainer>

      {/* Interactive Controller (Outside MapContainer to capture events) */}
      <ScanResultController
        scanResult={scanResult}
        viewMode={viewMode}
        compareValue={compareValue}
        setCompareValue={setCompareValue}
        map={mapInstance}
        isPeeking={isPeeking}
      />

      {/* Compare overlay clip-path */}
      <style jsx global>{`
        .compare-overlay { 
          clip-path: inset(0 0 0 ${compareValue}%); 
          transition: none !important;
          width: 100%;
          height: 100%;
        }
      `}</style>

      {/* ── SCAN HUD — always visible before scan ── */}
      {!scanResult && (
        <div style={{
          position: 'absolute', bottom: 24, left: 24,
          zIndex: 5001, width: '100%', maxWidth: 340,
        }}>
          <div className="glass" style={{
            padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
            background: 'var(--bg-card)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid var(--border)'
          }}>
            {/* Status row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{
                fontSize: '0.6rem', fontWeight: 900, color: 'var(--accent)',
                letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
                  boxShadow: '0 0 6px var(--accent)',
                }} />
                SCAN AREA LOCKED
              </div>
              <div style={{
                fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}>
                {SCAN_WIDTH_KM}×{SCAN_HEIGHT_KM} km
              </div>
            </div>

            {/* Instruction */}
            <div style={{
              fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5,
            }}>
              Pan the map to position your target area, then click scan.
            </div>


          </div>
        </div>
      )}

      {/* ── View Switchers & Legend — visible after scan ── */}
      {scanResult && (
        <>
          {/* Legend — Horizontally next to (left of) POTENTIAL MONITOR */}
          <div className="glass" style={{
            position: 'absolute',
            bottom: 160,
            right: 24,
            zIndex: 5001,
            padding: 14,
            width: 240,
            background: 'var(--bg-card)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: '1px solid var(--accent)'
          }}>
            <div style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: 10,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              borderBottom: '1px solid var(--border)',
              paddingBottom: 6
            }}>Classification</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Construction', color: '#EF4444' },
                { label: 'Vegetation', color: '#22C55E' },
                { label: 'Water', color: '#3B82F6' }
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  padding: '2px 0'
                }}>
                  <div style={{ width: 12, height: 12, borderRadius: '3px', backgroundColor: item.color }} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Switcher — Horizontal, Above VIEW RESULTS (Bottom Left Column) */}
          <div className="glass" style={{
            position: 'absolute',
            bottom: 120,
            left: 10,
            zIndex: 5001,
            padding: 4,
            display: 'flex',
            gap: 2,
            width: 'auto',
            minWidth: 240,
            background: 'var(--bg-card)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid var(--border)'
          }}>
            {['before', 'after', 'combined' /*, 'compare'*/].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s',
                  flex: 1, // equal width for horizontal 
                  background: viewMode === mode ? 'var(--accent)' : 'transparent',
                  color: viewMode === mode ? '#fff' : 'var(--text-muted)',
                  textAlign: 'center'
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </>
      )
      }

    </div >
  )
}

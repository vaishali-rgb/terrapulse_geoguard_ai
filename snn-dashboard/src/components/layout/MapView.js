'use client'
import { useState } from 'react'
import SatelliteMap from '../map/SatelliteMap'
import SpikeMonitor from '../ui/SpikeMonitor'
import ResultsModal from '../controls/ResultsModal'
import { FileText, Search, RefreshCcw, ChevronDown, MapPin } from 'lucide-react'
import GlowButton from '../ui/GlowButton'
import styles from '@/styles/map.module.css'
import sidebarStyles from '@/styles/sidebar.module.css'

export default function MapView({
  scanResult,
  selectedCity,
  onCityChange,
  onScan,
  isScanning,
  onBboxSelected,
  onResetScan,
  spikeRef
}) {
  const [showResults, setShowResults] = useState(false)

  return (
    <div className={styles.mapContainer}>
      <SatelliteMap
        scanResult={scanResult}
        selectedCity={selectedCity}
        onBboxSelected={onBboxSelected}
        isScanning={isScanning}
      />

      {/* ── TOP-LEFT CONTROLS (Floating Over Map) ── */}
      <div className={styles.topLeftOverlay}>
        <div className="glass" style={{
          padding: '20px',
          width: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <div className={sidebarStyles.controlGroup}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} className={sidebarStyles.pinIcon} />
              Target Region
            </label>
            <div className={sidebarStyles.selectWrapper}>
              <select
                value={selectedCity}
                onChange={(e) => onCityChange(e.target.value)}
                className={sidebarStyles.select}
              >
                <option value="abudhabi">Abu Dhabi</option>
                <option value="beirut">Beirut</option>
                <option value="mumbai">Mumbai</option>
                <option value="paris">Paris</option>
              </select>
              <ChevronDown className={sidebarStyles.selectIcon} size={16} />
            </div>
          </div>

          <GlowButton isScanning={isScanning} onClick={onScan} className={sidebarStyles.scanBtn}>
            INITIALIZE SCAN
          </GlowButton>

          <div className={sidebarStyles.paramsBox}>
            <div className={sidebarStyles.paramTitle}>── Scan Parameters ──</div>
            <div className={sidebarStyles.paramRow}><span>Patch Size:</span> <span>128</span></div>
            <div className={sidebarStyles.paramRow}><span>SNN Steps:</span> <span>10</span></div>
            <div className={sidebarStyles.paramRow}><span>Model:</span> <span>Siamese-SNN v3</span></div>
          </div>
        </div>
      </div>

      {/* ── TOP ACTION BAR (New Scan/Reset) ── */}
      {scanResult && !isScanning && (
        <div style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          zIndex: 5001,
        }}>
          <button
            onClick={onResetScan}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '10px 16px',
              background: '#fff',
              color: '#475569',
              border: '1px solid var(--border)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
              letterSpacing: '0.02em'
            }}
          >
            <RefreshCcw size={14} strokeWidth={2.5} />
            RESET DASHBOARD
          </button>
        </div>
      )}

      {/* ── ACTION BAR (Appears on scan complete) ── */}
      {scanResult && !isScanning && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '12px',
          zIndex: 9999, // Ensure it's above all map layers
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <button
            onClick={() => setShowResults(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '12px 18px',
              background: 'var(--accent)', // Solid emerald
              color: '#fff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              borderRadius: 'var(--radius)',
              boxShadow: '0 8px 16px rgba(0,168,107,0.3)',
              transition: 'all 0.2s',
              width: '260px',
              letterSpacing: '0.05em'
            }}
          >
            <Search size={14} strokeWidth={3} />
            VIEW SCAN RESULTS
          </button>

          {scanResult.image_urls?.compliance_report_pdf && (
            <a
              href={scanResult.image_urls.compliance_report_pdf}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: '12px 18px',
                background: '#0ea5e9', // Solid Azure/Sky blue
                color: '#fff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.85rem',
                textDecoration: 'none',
                borderRadius: 'var(--radius)',
                boxShadow: '0 8px 16px rgba(14,165,233,0.3)',
                transition: 'all 0.2s',
                width: '260px',
                letterSpacing: '0.05em'
              }}
            >
              <FileText size={14} strokeWidth={3} />
              DOWNLOAD REPORT PDF
            </a>
          )}
        </div>
      )}

      {/* Floating HUD Elements */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        right: '24px',
        zIndex: 6000,
        pointerEvents: 'none'
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <SpikeMonitor ref={spikeRef} />
        </div>
      </div>

      <ResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        data={scanResult}
      />
    </div>
  )
}

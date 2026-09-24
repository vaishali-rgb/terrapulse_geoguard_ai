import { ChevronDown } from 'lucide-react'
import GlowButton from '../ui/GlowButton'
import GeospatialChat from '../agent/GeospatialChat'
import ScanLoader from '../controls/ScanLoader'
import styles from '@/styles/sidebar.module.css'

export default function Sidebar({ 
  selectedCity, 
  onCityChange, 
  onScan, 
  isScanning, 
  agentMessages, 
  onSendMessage,
  scanEvents,
  scanProgress,
  scanResult
}) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.controlsSection}>
        <div className={styles.controlGroup}>
          <label>📍 Target Region</label>
          <div className={styles.selectWrapper}>
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className={styles.select}
            >
              <option value="abudhabi">Abu Dhabi</option>
              <option value="beirut">Beirut</option>
              <option value="mumbai">Mumbai</option>
              <option value="paris">Paris</option>
            </select>
            <ChevronDown className={styles.selectIcon} size={16} />
          </div>
        </div>

        <GlowButton isScanning={isScanning} onClick={onScan} className={styles.scanBtn}>
          INITIALIZE SCAN
        </GlowButton>

        <div className={styles.paramsBox}>
          <div className={styles.paramTitle}>── Scan Parameters ──</div>
          <div className={styles.paramRow}><span>Patch Size:</span> <span>128</span></div>
          <div className={styles.paramRow}><span>SNN Steps:</span> <span>10</span></div>
          <div className={styles.paramRow}><span>Model:</span> <span>Siamese-SNN v3</span></div>
        </div>

        <ScanLoader events={scanEvents} progress={scanProgress} status={isScanning ? 'scanning' : 'complete'} />
      </div>


    </aside>
  )
}



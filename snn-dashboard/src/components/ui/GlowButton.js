import styles from './ui.module.css'

export default function GlowButton({ children, isScanning, onClick, className = '', ...props }) {
  return (
    <button 
      className={`${styles.scanButton} ${isScanning ? styles.scanning : ''} ${className}`}
      onClick={onClick}
      disabled={isScanning}
      {...props}
    >
      {isScanning ? (
        <span className={styles.scanningText}>
          <span className={styles.spinner}></span>
          SCANNING...
        </span>
      ) : children}
    </button>
  )
}

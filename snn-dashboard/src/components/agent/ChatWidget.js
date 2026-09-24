'use client'
import { useState } from 'react'
import { MessageSquare, X, Bot } from 'lucide-react'
import GeospatialChat from './GeospatialChat'
import styles from '@/styles/agent.module.css'

export default function ChatWidget({ scanResult }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={styles.widgetWrapper}>
      {/* Floating Button (Only visible when closed) */}
      {!isOpen && (
        <button
          className={styles.floatingBtn}
          onClick={() => setIsOpen(true)}
          aria-label="Open Agent Chat"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Modal / Popup */}
      {isOpen && (
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <div className={styles.modalTitle}>
              <Bot size={20} className={styles.botIcon} />
              <span>Compliance Agent</span>
            </div>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <div className={styles.modalBody}>
            <GeospatialChat scanResult={scanResult} />
          </div>
        </div>
      )}
    </div>
  )
}

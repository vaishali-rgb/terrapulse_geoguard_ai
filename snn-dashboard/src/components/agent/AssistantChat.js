/**
 * Agentic AI Chat Interface
 * Connects to LangGraph backend for intelligent geospatial queries.
 * Developed for GeoGuard AI Platform.
 */
import { Send } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'
import styles from '@/styles/agent.module.css'

export default function AssistantChat({ chatHistory, onSendMessage }) {
  const [userQuery, setUserQuery] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    // MutationObserver to catch "typewriter" content updates
    const observer = new MutationObserver(() => {
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    })

    observer.observe(scrollContainer, {
      childList: true,
      subtree: true,
      characterData: true
    })

    return () => observer.disconnect()
  }, [])

  // Also scroll when message array changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatHistory])


  const handleSend = () => {
    if (userQuery.trim()) {
      onSendMessage(userQuery)
      setUserQuery('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={styles.chatWindow}>
      <div className={styles.messageList} ref={scrollRef}>
        {chatHistory.map((msg, idx) => (
          <ChatMessage key={idx} message={msg.content} sender={msg.sender} severity={msg.severity} />
        ))}
        {chatHistory.length === 0 && (
          <div className={styles.emptyState}>
            Agent standing by for scan results...
          </div>
        )}
      </div>
      <div className={styles.inputArea}>
        <input 
          type="text" 
          placeholder="Ask about this scan... ➤" 
          className={styles.input}
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className={styles.sendBtn} onClick={handleSend}>
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}


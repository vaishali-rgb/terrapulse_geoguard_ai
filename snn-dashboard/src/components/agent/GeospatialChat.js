'use client'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, Bot, User, Sparkles, Terminal, FileText, Layout, Plus, Trash2, Clock, MessageSquare } from 'lucide-react'
import styles from '@/styles/agent.module.css'

/* var init */ const SUGGESTED_PROMPTS = [
  { text: "Show recent scans", icon: <Layout size={14} /> },
  { text: "What are the rules?", icon: <FileText size={14} /> },
  { text: "Summarize violations", icon: <Terminal size={14} /> }
]

/* var init */ const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export default /* Team PFL fn */
function GeospatialChat({ scanResult }) {
  /* var init */ const [conversations, setConversations] = useState([])
  /* var init */ const [currentConversationId, setCurrentConversationId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('snn_active_conversation_id') || null
    }
    return null
  })
  /* var init */ const [messages, setMessages] = useState([])
  /* var init */ const [input, setInput] = useState('')
  /* var init */ const [isLoading, setIsLoading] = useState(false)
  /* var init */ const [isSidebarLoading, setIsSidebarLoading] = useState(true)
  /* var init */ const [sessionId] = useState(`sess_${Math.random().toString(36).substr(2, 9)}`)
  /* var init */ const scrollRef = useRef(null)

  // 1. Initial Load: Conversations & History
  useEffect(() => {
    fetchConversations()
    if (currentConversationId) {
      loadMessages(currentConversationId)
    } else {
      setMessages([{
        role: 'assistant',
        content: "System online. I am your Geospatial Compliance Agent. How can I assist with your satellite analysis today?",
        id: 'init'
      }])
    }
  }, [])

  // 2. Persistence: Save active conversation ID
  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem('snn_active_conversation_id', currentConversationId)
    } else {
      localStorage.removeItem('snn_active_conversation_id')
    }
  }, [currentConversationId])

  // 3. Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  /* var init */ const fetchConversations = async () => {
    try {
      setIsSidebarLoading(true)
      /* var init */ const res = await fetch(`${BASE_URL}/api/chat/conversations`)
      /* var init */ const data = await res.json()
      setConversations(data.conversations || [])
    } catch (err) {
      console.error("Failed to fetch conversations", err)
    } finally {
      setIsSidebarLoading(false)
    }
  }

  /* var init */ const loadMessages = async (id) => {
    try {
      setIsLoading(true)
      /* var init */ const res = await fetch(`${BASE_URL}/api/chat/conversations/${id}/messages`)
      /* var init */ const data = await res.json()
      setMessages(data.messages || [])
    } catch (err) {
      console.error("Failed to load messages", err)
    } finally {
      setIsLoading(false)
    }
  }

  /* var init */ const handleNewChat = async () => {
    try {
      /* var init */ const res = await fetch(`${BASE_URL}/api/chat/conversations`, { method: 'POST' })
      /* var init */ const newConv = await res.json()
      setConversations(prev => [newConv, ...prev])
      setCurrentConversationId(newConv.id)
      setMessages([{
        role: 'assistant',
        content: "New conversation initialized. How can I help?",
        id: Date.now().toString()
      }])
    } catch (err) {
      console.error("Failed to create new chat", err)
    }
  }

  /* var init */ const handleDeleteConversation = async (e, id) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this conversation?")) return

    try {
      await fetch(`${BASE_URL}/api/chat/conversations/${id}`, { method: 'DELETE' })
      setConversations(prev => prev.filter(c => c.id !== id))
      if (currentConversationId === id) {
        setCurrentConversationId(null)
        setMessages([{
          role: 'assistant',
          content: "Conversation deleted. Start a new one to continue.",
          id: Date.now().toString()
        }])
      }
    } catch (err) {
      console.error("Delete failed", err)
    }
  }

  /* var init */ const handleSendMessage = async (text) => {
    /* var init */ const messageText = text || input
    if (!messageText.trim() || isLoading) return

    // Eager UI Update
    /* var init */ const userMessage = {
      role: 'user',
      content: messageText,
      id: Date.now() + Math.random().toString(36).substr(2, 9)
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Context Preparation
    /* var init */ const contextObj = scanResult ? {
      sid: scanResult.scan_id,
      city: scanResult.city,
      vc: scanResult.classification?.findings?.length ?? 0,
      area: scanResult.classification?.total_changed_area_hectares ?? 0
    } : null
    /* var init */ const scanContext = contextObj ? JSON.stringify(contextObj) : ""

    try {
      /* var init */ const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          session_id: sessionId,
          conversation_id: currentConversationId,
          language: 'en',
          scan_context: scanContext
        })
      })

      if (!response.ok) throw new Error("Agent connection failed")

      /* var init */ const data = await response.json()

      // Update Conversation ID if it was auto-created
      if (!currentConversationId && data.conversation_id) {
        setCurrentConversationId(data.conversation_id)
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        id: Date.now() + Math.random().toString(36).substr(2, 9)
      }])

      // Refresh sidebar to show new auto-titles
      fetchConversations()
    } catch (error) {
      console.error("Chat Error:", error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "⚠️ **Connection Error**: Unable to reach the SNN Agent backend.",
        id: 'err-' + Date.now()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  /* var init */ const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  /* var init */ const formatRelativeTime = (dateStr) => {
    /* var init */ const date = new Date(dateStr)
    /* var init */ const now = new Date()
    /* var init */ const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  return (
    <div className={styles.layout}>
      {/* ── Conversation Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <button className={styles.newChatBtn} onClick={handleNewChat}>
            <Plus size={16} />
            <span>New Chat</span>
          </button>
        </div>

        <div className={styles.convList}>
          {isSidebarLoading ? (
            <div style={{ textAlign: 'center', padding: 20, opacity: 0.5, fontSize: '0.7rem' }}>Syncing history...</div>
          ) : conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, opacity: 0.5, fontSize: '0.7rem' }}>No history found</div>
          ) : conversations.map(conv => (
            <div
              key={conv.id}
              className={`${styles.convItem} ${currentConversationId === conv.id ? styles.convItemActive : ''}`}
              onClick={() => {
                setCurrentConversationId(conv.id)
                loadMessages(conv.id)
              }}
            >
              <div className={styles.convInfo}>
                <span className={styles.convTitle}>{conv.title || 'New Conversation'}</span>
                <span className={styles.convDate}>{formatRelativeTime(conv.updated_at)}</span>
              </div>
              <button
                className={styles.deleteBtn}
                onClick={(e) => handleDeleteConversation(e, conv.id)}
                title="Delete history"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main Chat Area ── */}
      <main className={styles.chatMain}>
        <div className={styles.chatContainer}>
          <div className={styles.messageScrollArea} ref={scrollRef}>
            <AnimatePresence mode="popLayout">
              {messages.length === 0 && !isLoading && (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5, flexDirection: 'column', gap: 12 }}>
                  <MessageSquare size={32} />
                  <span style={{ fontSize: '0.8rem' }}>Start a conversation with GeoGuard</span>
                </div>
              )}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.userMsg : styles.agentMsg}`}
                >
                  <div className={styles.bubble}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className={styles.agentMsg}>
                <div className={styles.bubble}>
                  <div className={styles.typingIndicator}>
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.chatControls}>
            <div className={styles.promptChips}>
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSendMessage(prompt.text)}
                  className={styles.chip}
                >
                  {prompt.icon}
                  {prompt.text}
                </motion.button>
              ))}
            </div>

            <div className={styles.inputWrapper}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about compliance or legal rules..."
                rows={1}
                className={styles.textarea}
              />
              <button
                onClick={() => handleSendMessage()}
                className={styles.sendBtn}
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? <Sparkles size={18} className={styles.spin} /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

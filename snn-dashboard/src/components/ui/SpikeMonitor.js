'use client'
import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react'

const SpikeMonitor = forwardRef((props, ref) => {
  const canvasRef = useRef(null)
  const dataRef = useRef(new Array(60).fill(0)) // Store last 60 points
  const stateRef = useRef('idle') // 'idle' | 'burst'
  const [currentValue, setCurrentValue] = useState(0)

  // UseImperativeHandle allows the parent (page.js) to call this method
  useImperativeHandle(ref, () => ({
    triggerDetectionBurst: (duration = 1000) => {
      stateRef.current = 'burst'
      setTimeout(() => {
        stateRef.current = 'idle'
      }, duration)
    }
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId

    const render = () => {
      // 1. Generate new point
      const isBurst = stateRef.current === 'burst'
      const newPoint = isBurst
        ? 0.7 + (Math.random() * 0.3)
        : Math.random() * 0.15

      dataRef.current.push(newPoint)
      if (dataRef.current.length > 60) dataRef.current.shift()

      if (Math.random() > 0.8) setCurrentValue(newPoint) // Update display value occasionally

      // 2. Clear Canvas
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      // 3. Draw Grid
      ctx.strokeStyle = 'rgba(0, 168, 107, 0.08)'
      ctx.lineWidth = 1
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke()
      }
      for (let i = 0; i < height; i += 20) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke()
      }

      // 4. Draw Line
      ctx.beginPath()
      ctx.strokeStyle = isBurst ? '#dc2626' : '#00A86B'
      ctx.lineWidth = 2.5
      ctx.shadowBlur = 4
      ctx.shadowColor = isBurst ? 'rgba(220, 30, 30, 0.3)' : 'rgba(0, 168, 107, 0.3)'

      const step = width / (dataRef.current.length - 1)
      dataRef.current.forEach((val, i) => {
        const x = i * step
        const y = height - (val * height * 0.8) - (height * 0.1)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()

      animationFrameId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <div className="glass" style={{
      width: '240px',
      padding: '12px',
      background: 'var(--bg-card)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{
          fontSize: '0.65rem',
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          color: stateRef.current === 'burst' ? '#dc2626' : 'var(--accent)',
          letterSpacing: '0.1em'
        }}>
          {stateRef.current === 'burst' ? '⚠️ ANOMALY DETECTED' : 'POTENTIAL MONITOR'}
        </span>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {(currentValue * 100).toFixed(1)}%
        </span>
      </div>

      <canvas
        ref={canvasRef}
        width={216}
        height={60}
        style={{ width: '100%', height: '60px', opacity: 1 }}
      />

      <div style={{
        marginTop: '8px',
        fontSize: '0.55rem',
        color: 'var(--text-muted)',
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>MEMR-SNN v3.4</span>
        <span>60FPS / LOW LATENCY</span>
      </div>
    </div>
  )
})

SpikeMonitor.displayName = 'SpikeMonitor'
export default SpikeMonitor

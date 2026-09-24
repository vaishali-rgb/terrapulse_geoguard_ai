'use client'

export default function ScanLoader({ events, progress, status }) {
  // Only show if we are scanning OR we have events to show
  if (status !== 'scanning' && (!events || events.length === 0)) return null


  return (
    <div className="glass" style={{
      padding: '16px',
      marginTop: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      position: 'relative',
      overflow: 'hidden'
    }}>



      {/* Progress Bar */}
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', 
          width: `${progress}%`, 
          background: 'linear-gradient(90deg, var(--accent), #3EF2A3)',
          boxShadow: '0 0 15px var(--accent-glow)',
          transition: 'width 0.4s ease'
        }} />
      </div>

      {/* Terminal Feed */}
      <div style={{ 
        maxHeight: '100px', 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '4px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem'
      }}>

        {events.map((e, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            gap: '12px', 
            opacity: i === events.length - 1 ? 1 : 0.6,
            color: e.status === 'complete' || e.status === 'finished' ? '#00A86B' : 'var(--text-primary)'
          }}>
            <span style={{ color: 'var(--accent)', minWidth: '60px' }}>[STEP {e.step}/9]</span>
            <span>{e.message}</span>
          </div>
        ))}

      </div>

      <style jsx>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

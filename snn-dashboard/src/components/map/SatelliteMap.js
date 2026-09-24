import dynamic from 'next/dynamic'

// Dynamic import with SSR disabled — this prevents leaflet from
// trying to access `window` during server-side rendering.
// The actual map code lives in SatelliteMapClient.js.
const SatelliteMap = dynamic(
  () => import('./SatelliteMapClient'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        width: '100%',
        height: '100%',
        background: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        letterSpacing: '0.1em',
      }}>
        INIT_NEURAL_MAP...
      </div>
    ),
  }
)

export default SatelliteMap

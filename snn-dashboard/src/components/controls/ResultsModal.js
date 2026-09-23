import React, { useState } from 'react'
import { X, FileText, LayoutGrid, AlertTriangle, Layers, Maximize2 } from 'lucide-react'

export default function ResultsModal({ isOpen, onClose, data }) {
  const [enlargedImage, setEnlargedImage] = useState(null)

  if (!isOpen || !data) return null

  const urls = data.image_urls || {}

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)'
      }}>
        <div className="glass" style={{
          position: 'relative', width: '100%', maxWidth: 960,
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
          border: '1px solid rgba(0, 168, 107, 0.2)', overflow: 'hidden',
          background: '#fff'
        }}>
          
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: 24, borderBottom: '1px solid var(--border)',
            background: 'var(--bg-secondary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <LayoutGrid style={{ color: 'var(--accent)' }} size={24} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Scan Analysis Results</h2>
            </div>
            <button 
              onClick={onClose}
              style={{
                padding: 8, border: 'none', background: 'transparent',
                cursor: 'pointer', borderRadius: '50%', color: 'var(--text-muted)',
                transition: 'all 0.2s'
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: 32, maxHeight: '80vh', overflowY: 'auto' }}>
            
            {/* Dashboard Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
              <div className="glass" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'rgba(0,168,107,0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
                }}>
                  <Layers size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Total Altered Area</div>
                  <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {data.classification?.total_changed_area_hectares || "0.24"} <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)' }}>ha</span>
                  </div>
                </div>
              </div>

              <div className="glass" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'rgba(239,68,68,0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#EF4444'
                }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Detected Violations</div>
                  <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {data.classification?.violations_found || "12"} <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)' }}>points</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2x2 Image Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <ImageCard title="Before RGB (Baseline)" url={urls.before_rgb_png} onExpand={setEnlargedImage} />
              <ImageCard title="After RGB (Current)" url={urls.after_rgb_png} onExpand={setEnlargedImage} />
              <ImageCard title="AI Change Mask (Anomalies)" url={urls.change_mask_png} isWarning onExpand={setEnlargedImage} />
              <ImageCard 
                title="Classification Overlay" 
                url={urls.class_overlay_png} 
                backgroundUrl={urls.after_rgb_png}
                onExpand={() => setEnlargedImage({ title: 'Classification Overlay', url: urls.class_overlay_png, bg: urls.after_rgb_png })}
              />
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: 24, background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border)',
            display: 'flex', justifyContent: 'flex-end', gap: 16
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 24px', borderRadius: 8,
                border: '1px solid var(--border)', background: '#fff',
                color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Close Results
            </button>
            {urls.compliance_report_pdf && (
              <a
                href={urls.compliance_report_pdf}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 24px', background: 'var(--accent)',
                  color: '#fff', borderRadius: 8, fontWeight: 700,
                  textDecoration: 'none', transition: 'all 0.2s',
                  boxShadow: '0 4px 20px rgba(0,168,107,0.3)'
                }}
              >
                <FileText size={18} />
                Open Full PDF Report
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Overlay */}
      {enlargedImage && (
        <div 
          onClick={() => setEnlargedImage(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 20000,
            background: 'rgba(0,0,0,0.95)', display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 40, cursor: 'zoom-out'
          }}
        >
          <div style={{ position: 'absolute', top: 30, left: 40, color: '#fff' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>{enlargedImage.title || 'Enlarged View'}</h3>
            <p style={{ margin: '4px 0 0', opacity: 0.6, fontSize: '0.8rem' }}>Click anywhere to exit</p>
          </div>
          <button style={{ position: 'absolute', top: 30, right: 40, background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={40} />
          </button>
          
          <div style={{ position: 'relative', width: '90vw', height: '80vh', display: 'flex', justifyContent: 'center' }}>
            {enlargedImage.bg && (
              <img src={enlargedImage.bg} style={{ position: 'absolute', height: '100%', objectFit: 'contain', opacity: 0.4 }} alt="Enlarged context" />
            )}
            <img 
              src={enlargedImage.url || enlargedImage} 
              style={{ position: 'relative', height: '100%', objectFit: 'contain', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }} 
              alt="Enlarged view" 
            />
          </div>
        </div>
      )}
    </>
  )
}

function ImageCard({ title, url, backgroundUrl, isWarning, onExpand }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
      <div 
        onClick={() => onExpand(backgroundUrl ? { title, url, bg: backgroundUrl } : { title, url })}
        style={{
          position: 'relative', aspectRatio: '16/9', borderRadius: 12,
          overflow: 'hidden',
          background: '#111',
          border: `1px solid ${isWarning ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
          boxShadow: isWarning ? '0 0 20px rgba(239,68,68,0.2)' : 'none',
          cursor: 'zoom-in',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {/* Background Layer (Optional) */}
        {backgroundUrl && (
          <img
            src={backgroundUrl}
            alt="Context"
            style={{ 
              position: 'absolute', inset: 0, width: '100%', height: '100%', 
              objectFit: 'cover', opacity: 0.4 
            }}
          />
        )}

        {/* Primary Overlay/Image Layer */}
        {url ? (
          <img
            src={url}
            alt={title}
            style={{ 
              position: 'relative', width: '100%', height: '100%', 
              objectFit: 'cover', transition: 'transform 0.7s',
              zIndex: 1
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: 'var(--font-mono)', fontStyle: 'italic'
          }}>
            IMAGE_LOAD_FAULT
          </div>
        )}
        
        <div style={{ 
          position: 'absolute', bottom: 12, right: 12, zIndex: 10,
          padding: 6, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Maximize2 size={16} />
        </div>
      </div>
    </div>
  )
}

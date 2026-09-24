import { useEffect, useRef } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { Copy, Download, FileText, ShieldAlert, Scale } from 'lucide-react'
import { useCountUp } from '@/hooks/useCountUp'
import GlassCard from '../ui/GlassCard'
import { CHANGE_TYPES } from '@/lib/constants'
import styles from '@/styles/analytics.module.css'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

// Custom plugin for 3D Shadow effect on hover
const hoverShadowPlugin = {
  id: 'hoverShadowPlugin',
  afterDraw: (chart) => {
    const { ctx, tooltip } = chart;

    if (tooltip && tooltip.opacity > 0) {
      const activeElement = chart.getActiveElements()[0];
      if (activeElement) {
        const { element } = activeElement;
        ctx.save();

        // Use 'destination-over' to draw the shadow BEHIND the already-rendered segments
        ctx.globalCompositeOperation = 'destination-over';

        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 8;
        ctx.shadowOffsetY = 8;

        // Draw the segment shape again. Because of destination-over, 
        // this only draws where the canvas is empty or behind existing pixels.
        // The shadow will cast onto the "wall" behind the chart.
        ctx.beginPath();
        ctx.arc(element.x, element.y, element.outerRadius, element.startAngle, element.endAngle);
        ctx.arc(element.x, element.y, element.innerRadius, element.endAngle, element.startAngle, true);
        ctx.closePath();
        ctx.fillStyle = element.options.backgroundColor;
        ctx.fill();

        ctx.restore();
      }
    }
  }
}

// Map backend severity strings to CSS class names
const SEVERITY_CSS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  high: 'high',
  medium: 'medium',
  low: 'low',
}

const SEVERITY_ICON = {
  CRITICAL: '🔴',
  HIGH: '🟠',
  MEDIUM: '🟡',
  LOW: '🟢',
}

// Helper for External HTML Tooltip
const getOrCreateTooltip = (chart) => {
  let tooltipEl = chart.canvas.parentNode.querySelector('div.chartjs-tooltip');

  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.classList.add('chartjs-tooltip');
    tooltipEl.style.background = 'rgba(28, 28, 30, 0.95)';
    tooltipEl.style.borderRadius = '8px';
    tooltipEl.style.color = 'white';
    tooltipEl.style.opacity = 1;
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.transform = 'translate(-50%, 0)';
    tooltipEl.style.transition = 'all .1s ease';
    tooltipEl.style.padding = '12px';
    tooltipEl.style.zIndex = '1000';
    tooltipEl.style.border = '1px solid rgba(255,255,255,0.1)';
    tooltipEl.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.5)';
    tooltipEl.style.minWidth = '140px';

    const table = document.createElement('table');
    table.style.margin = '0px';
    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  return tooltipEl;
};

const externalTooltipHandler = (context) => {
  // Tooltip Element
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  // Set Text
  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map(b => b.lines);

    const divTitle = document.createElement('div');
    divTitle.style.fontWeight = 'bold';
    divTitle.style.fontSize = '13px';
    divTitle.style.marginBottom = '6px';
    divTitle.style.color = '#fff';
    divTitle.innerText = titleLines[0] || '';

    const divBody = document.createElement('div');
    divBody.style.display = 'flex';
    divBody.style.alignItems = 'center';
    divBody.style.gap = '8px';
    divBody.style.fontSize = '12px';
    divBody.style.color = 'rgba(255,255,255,0.9)';

    // Color Box
    const colors = tooltip.labelColors[0];
    const span = document.createElement('span');
    span.style.background = colors.backgroundColor;
    span.style.borderColor = colors.borderColor;
    span.style.borderWidth = '2px';
    span.style.display = 'inline-block';
    span.style.height = '10px';
    span.style.width = '10px';
    span.style.borderRadius = '2px';

    const text = document.createElement('span');
    text.innerText = bodyLines[0] || '';

    divBody.appendChild(span);
    divBody.appendChild(text);

    const root = tooltipEl.querySelector('table');
    while (root.firstChild) {
      root.firstChild.remove();
    }
    root.appendChild(divTitle);
    root.appendChild(divBody);
  }

  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

  // Display, position, and set styles for font
  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = positionX + tooltip.caretX + 'px';
  tooltipEl.style.top = positionY + tooltip.caretY - 80 + 'px'; // Offset upward
  tooltipEl.style.font = tooltip.options.bodyFont.string;
  tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
};

export default function AnalyticsPanel({ scanResult, isScanning, scanProgress, scanEvents = [] }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [scanEvents])
  // Data processing basics (Must be before conditional returns for Hooks)
  const totalAreaHa = scanResult?.classification?.total_changed_area_m2
    ? scanResult.classification.total_changed_area_m2 / 10000
    : 0
  const animatedArea = useCountUp(totalAreaHa ? totalAreaHa * 100 : 0) / 100

  // ── 0. System Pipeline Monitor (Always Visible) ──
  const pipelineMonitor = (
    <div className="glass" style={{
      padding: '12px',
      marginBottom: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      border: '1px solid var(--accent-glow)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.1em', color: 'var(--accent)', margin: 0 }}>
          SYSTEM PIPELINE MONITOR
        </h3>
        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
          {isScanning ? '🛰️ RUNNING' : '✅ READY'}
        </span>
      </div>

      <div style={{ height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${scanProgress}%`,
          background: 'linear-gradient(90deg, var(--accent), #3EF2A3)',
          boxShadow: '0 0 10px var(--accent-glow)',
          transition: 'width 0.4s ease'
        }} />
      </div>

      {/* Terminal Feed of Steps */}
      {scanEvents.length > 0 && (
        <div
          ref={scrollRef}
          className={styles.noScrollbar}
          style={{
            maxHeight: '80px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            borderTop: '1px solid var(--border)',
            paddingTop: '10px',
            marginTop: '4px'
          }}>
          {scanEvents.map((e, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: '10px',
              opacity: i === scanEvents.length - 1 ? 1 : 0.5,
              color: e.status === 'complete' || e.status === 'finished' ? 'var(--accent)' : 'var(--text-secondary)'
            }}>
              <span style={{ color: 'var(--accent)', minWidth: '55px', fontWeight: 700 }}>[{e.step || '?'}/9]</span>
              <span style={{ lineHeight: 1.4 }}>{e.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!scanResult) {
    return (
      <aside className={styles.panel}>
        {pipelineMonitor}
        <div className={styles.emptyState}>
          Run a scan to view analytics
        </div>
      </aside>
    )
  }

  // Deep data processing when scanResult exists
  const findings = scanResult.classification?.findings || []
  const violations = scanResult.violations || []
  const blockchain = scanResult.blockchain || {}
  const imageUrls = scanResult.image_urls || {}

  const chartData = findings.map(f => ({
    name: f.class_name,
    value: f.area_hectares,
    percentage: f.percentage,
    color: CHANGE_TYPES[f.class_id]?.color || '#CCC'
  }))

  const handleCopyHash = () => {
    if (blockchain.hash) {
      navigator.clipboard.writeText(blockchain.hash)
    }
  }

  return (
    <aside className={styles.panel}>
      {pipelineMonitor}

      {/* ── 1. Change Breakdown Chart ── */}
      <GlassCard className={styles.card}>
        <h3 className={styles.cardTitle}>📊 Change Breakdown</h3>
        <div className={styles.chartWrapper} style={{ height: '160px', position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <Doughnut
            data={{
              labels: chartData.map(d => d.name),
              datasets: [{
                data: chartData.map(d => d.value),
                backgroundColor: chartData.map(d => d.color),
                borderWidth: 0,
                hoverOffset: 12, // Pops out segments on hover
                borderRadius: 4,
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              clip: false, // Prevents shadows from being cut off
              interaction: {
                mode: 'nearest',
                intersect: true,
              },
              layout: {
                padding: 15
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  enabled: false,
                  external: externalTooltipHandler,
                  backgroundColor: 'rgba(28, 28, 30, 0.95)',
                  titleColor: '#fff',
                  titleFont: {
                    size: 13,
                    weight: 'bold',
                    family: "'Inter', sans-serif"
                  },
                  bodyColor: '#fff',
                  bodyFont: {
                    size: 12,
                    family: "'Inter', sans-serif"
                  },
                  padding: 12,
                  cornerRadius: 6,
                  displayColors: true,
                  boxWidth: 10,
                  boxHeight: 10,
                  boxPadding: 6,
                  usePointStyle: false,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderWidth: 1,
                  callbacks: {
                    title: (context) => context[0].label,
                    label: (context) => {
                      const value = context.raw || 0;
                      return ` Area: ${value.toFixed(2)} ha`;
                    }
                  }
                }
              },
              cutout: '70%',
              animation: {
                animateScale: true,
                animateRotate: true
              }
            }}
            plugins={[hoverShadowPlugin]}
          />
        </div>
        <div className={styles.legend}>
          {findings.map(f => (
            <div key={f.class_id} className={styles.legendItem}>
              <span className={styles.dot} style={{ background: CHANGE_TYPES[f.class_id]?.color }}></span>
              <span className={styles.legendName}>{f.class_name.split('/')[0].trim()}</span>
              <span className={styles.legendValue}>{f.area_hectares} ha ({f.percentage}%)</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── 2. Compliance Alerts (from violations[]) ── */}
      <GlassCard className={styles.card}>
        <h3 className={styles.cardTitle}>🚨 Compliance Alerts</h3>
        {violations.length === 0 ? (
          <div className={styles.alertZone} style={{ textAlign: 'center', padding: 12 }}>
            No violations detected
          </div>
        ) : (
          <div className={styles.alertsList}>
            {violations.map((v, i) => (
              <div
                key={`${v.rule_id || 'v'}-${i}`}
                className={`${styles.alert} ${styles[SEVERITY_CSS[v.severity] || 'high']}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className={styles.alertIcon}>
                  {SEVERITY_ICON[v.severity] || '⚠️'}
                </div>
                <div className={styles.alertContent}>
                  <div className={styles.alertTitle}>{v.rule_name}</div>
                  <div className={styles.alertZone}>
                    <span style={{
                      fontWeight: 700,
                      color: v.severity === 'CRITICAL' ? 'var(--severity-high)' : 'inherit'
                    }}>
                      {v.severity}
                    </span>
                    {' · '}
                    {v.legal_reference}
                  </div>
                  {v.details?.overlap_area_ha && (
                    <div className={styles.alertZone}>
                      Overlap: {v.details.overlap_area_ha} ha
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* ── 3. Scan Statistics ── */}
      <GlassCard className={styles.card}>
        <h3 className={styles.cardTitle}>📐 Scan Statistics</h3>
        <div className={styles.statRow}><span>Total Changed</span> <span>{animatedArea} ha</span></div>
        <div className={styles.statRow}><span>Changed Pixels</span> <span>{scanResult.classification?.total_changed_pixels || 0}</span></div>
        <div className={styles.statRow}><span>Inference Time</span> <span>{scanResult.model_info?.inference_time_seconds || 0}s</span></div>
        <div className={styles.statRow}><span>Model</span> <span>{scanResult.model_info?.name}</span></div>
        <div className={styles.statRow}><span>Violations</span> <span style={{ color: violations.length > 0 ? 'var(--severity-high)' : 'var(--severity-low)', fontWeight: 700 }}>{scanResult.violation_count ?? violations.length}</span></div>
      </GlassCard>

      {/* ── 4. Evidence Integrity (blockchain) ── */}
      <GlassCard className={styles.card}>
        <h3 className={styles.cardTitle}>🔗 Evidence Integrity</h3>
        <div className={styles.hashBox} onClick={handleCopyHash} title="Click to copy full hash">
          {blockchain.hash
            ? `${blockchain.hash.substring(0, 14)}...${blockchain.hash.substring(blockchain.hash.length - 6)}`
            : 'Awaiting hash...'}
        </div>
        <div className={styles.authRow}>
          <span>
            {blockchain.verified
              ? 'Status: ✅ Verified'
              : 'Status: ⏳ Pending'}
          </span>
          <div className={styles.actionIcons}>
            <Copy size={14} className={styles.actionIcon} onClick={handleCopyHash} title="Copy hash" />
            {imageUrls.compliance_report_pdf && (
              <a
                href={imageUrls.compliance_report_pdf}
                target="_blank"
                rel="noreferrer"
                title="Download compliance report PDF"
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <FileText size={14} className={styles.actionIcon} />
              </a>
            )}
          </div>
        </div>
        {blockchain.timestamp && (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
            Signed: {new Date(blockchain.timestamp).toLocaleString()}
          </div>
        )}
      </GlassCard>
    </aside>
  )
}

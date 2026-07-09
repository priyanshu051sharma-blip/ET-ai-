import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const POLLUTANTS = [
  { key: 'AQI',  label: 'Air Quality Index', unit: '',       color: '#F59E0B', safeMax: 100,  max: 500,  icon: '🌫️', desc: 'Overall air quality composite index' },
  { key: 'PM25', label: 'Fine Particles PM2.5', unit: 'µg/m³', color: '#38BDF8', safeMax: 35.4, max: 250,  icon: '💨', desc: 'Fine particulate matter — penetrates lungs' },
  { key: 'PM10', label: 'Coarse Particles PM10', unit: 'µg/m³', color: '#818CF8', safeMax: 154,  max: 400,  icon: '🌁', desc: 'Coarse dust particles — irritates airways' },
  { key: 'NO2',  label: 'Nitrogen Dioxide NO₂', unit: 'µg/m³', color: '#F472B6', safeMax: 100,  max: 300,  icon: '🚗', desc: 'Vehicle & industrial combustion byproduct' },
  { key: 'SO2',  label: 'Sulfur Dioxide SO₂',   unit: 'µg/m³', color: '#FACC15', safeMax: 75,   max: 200,  icon: '🏭', desc: 'Industrial burning & coal emissions' },
  { key: 'CO',   label: 'Carbon Monoxide CO',    unit: 'mg/m³', color: '#FB923C', safeMax: 9,    max: 30,   icon: '🔥', desc: 'Incomplete combustion — toxic at high levels' },
  { key: 'O3',   label: 'Ground Ozone O₃',       unit: 'µg/m³', color: '#34D399', safeMax: 100,  max: 240,  icon: '☀️', desc: 'Photochemical smog — formed in sunlight' },
];

// Animated SVG bar with 3D depth effect
function Bar3D({ value, max, safeMax, color, animate: doAnimate }) {
  const [width, setWidth] = useState(0);
  const pct = Math.min((value / max) * 100, 100);
  const safePct = Math.min((safeMax / max) * 100, 100);
  const exceeded = value > safeMax;

  useEffect(() => {
    if (doAnimate) {
      const t = setTimeout(() => setWidth(pct), 80);
      return () => clearTimeout(t);
    } else {
      setWidth(pct);
    }
  }, [pct, doAnimate]);

  return (
    <div style={{ position: 'relative', height: '28px', borderRadius: '8px', overflow: 'visible' }}>
      {/* Track */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)' }} />
      {/* 3D shadow layer */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '0 0 8px 8px' }} />
      {/* Fill */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: '8px',
          background: exceeded
            ? `linear-gradient(90deg, ${color}, #EF4444)`
            : `linear-gradient(90deg, ${color}bb, ${color}, ${color}dd)`,
          boxShadow: `0 0 16px ${exceeded ? '#EF4444' : color}66, 0 4px 8px rgba(0,0,0,0.4)`,
          overflow: 'hidden',
        }}
      >
        {/* Shimmer */}
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)', transform: 'skewX(-15deg)' }}
        />
        {/* 3D top highlight */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(180deg,rgba(255,255,255,0.2),transparent)', borderRadius: '8px 8px 0 0' }} />
      </motion.div>

      {/* Safe threshold marker */}
      <div style={{
        position: 'absolute', top: '-4px', bottom: '-4px',
        left: `${safePct}%`, width: '2px',
        background: exceeded ? '#EF4444' : 'rgba(239,68,68,0.5)',
        boxShadow: exceeded ? '0 0 8px #EF4444' : 'none',
        zIndex: 2,
      }}>
        <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', fontSize: '7px', color: '#EF4444', fontWeight: 700, whiteSpace: 'nowrap' }}>SAFE MAX</div>
      </div>
    </div>
  );
}

// Expandable pollutant row
function PollutantRow({ p, value, expanded, onToggle, index }) {
  const exceeded = value > p.safeMax;
  const pct = Math.round((value / p.safeMax) * 100);
  const trend = Math.random() > 0.5 ? 'up' : 'down'; // simulated trend

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 120 }}
      style={{ borderRadius: '14px', overflow: 'hidden', border: `1px solid ${exceeded ? '#EF444430' : 'rgba(255,255,255,0.07)'}`, background: expanded ? `${p.color}08` : 'rgba(255,255,255,0.02)', transition: 'background 0.3s' }}
    >
      {/* Main row */}
      <div
        onClick={onToggle}
        style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        {/* Top line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px', flexShrink: 0 }}>{p.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC' }}>{p.label}</span>
                {exceeded && (
                  <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}
                    style={{ fontSize: '9px', padding: '2px 7px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '10px', color: '#EF4444', fontWeight: 800 }}>
                    ⚠ EXCEEDED
                  </motion.span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 900, color: exceeded ? '#EF4444' : p.color, fontFamily: 'monospace', filter: `drop-shadow(0 0 8px ${exceeded ? '#EF4444' : p.color}88)` }}>
                  {value}
                </span>
                <span style={{ fontSize: '11px', color: '#475569' }}>{p.unit}</span>
                <motion.span
                  animate={{ rotate: trend === 'up' ? 0 : 180 }}
                  style={{ fontSize: '12px', color: trend === 'up' ? '#EF4444' : '#10B981' }}>
                  ↑
                </motion.span>
              </div>
            </div>
            <Bar3D value={value} max={p.max} safeMax={p.safeMax} color={exceeded ? '#EF4444' : p.color} animate={true} />
          </div>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            style={{ fontSize: '12px', color: '#475569', marginLeft: '6px', flexShrink: 0 }}>▼</motion.span>
        </div>

        {/* Safe max label */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#334155', paddingLeft: '30px' }}>
          <span>WHO safe max: <span style={{ color: p.color, fontWeight: 700 }}>{p.safeMax} {p.unit}</span></span>
          <span style={{ color: pct > 100 ? '#EF4444' : '#10B981', fontWeight: 700 }}>{pct}% of safe limit</span>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 18px 16px', borderTop: `1px solid ${p.color}20` }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginTop: '12px' }}>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>Current</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: p.color, fontFamily: 'monospace' }}>{value}<span style={{ fontSize: '9px', color: '#475569' }}> {p.unit}</span></div>
                </div>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>Safe Limit</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#10B981', fontFamily: 'monospace' }}>{p.safeMax}<span style={{ fontSize: '9px', color: '#475569' }}> {p.unit}</span></div>
                </div>
                <div style={{ padding: '10px', background: `${exceeded ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)'}`, borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>Status</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: exceeded ? '#EF4444' : '#10B981' }}>{exceeded ? '⚠ HIGH' : '✓ SAFE'}</div>
                </div>
              </div>
              <div style={{ marginTop: '10px', padding: '10px 12px', background: 'rgba(56,189,248,0.05)', borderLeft: `3px solid ${p.color}`, borderRadius: '0 8px 8px 0', fontSize: '11px', color: '#94A3B8', lineHeight: 1.6 }}>
                <strong style={{ color: p.color }}>About {p.label}:</strong> {p.desc}
                {exceeded && <span style={{ color: '#EF4444', fontWeight: 600, display: 'block', marginTop: '4px' }}>⚠ Current level exceeds WHO safe maximum by {(((value - p.safeMax) / p.safeMax) * 100).toFixed(0)}%</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PollutantPanel({ reading, locationName }) {
  const [expanded, setExpanded] = useState(null);
  const [expandAll, setExpandAll] = useState(false);

  if (!reading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#334155', fontSize: '13px' }}>
      Loading pollutant data…
    </div>
  );

  const values = {
    AQI: reading.AQI, PM25: reading.PM25, PM10: reading.PM10,
    NO2: reading.NO2, SO2: reading.SO2, CO: reading.CO, O3: reading.O3 ?? 16.5,
  };

  const exceededCount = POLLUTANTS.filter(p => values[p.key] > p.safeMax).length;
  const overallColor = exceededCount > 2 ? '#EF4444' : exceededCount > 0 ? '#F59E0B' : '#10B981';

  const toggleAll = () => {
    setExpandAll(v => !v);
    if (!expandAll) setExpanded('all');
    else setExpanded(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
      {/* Panel header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ width: '9px', height: '9px', borderRadius: '50%', background: overallColor, boxShadow: `0 0 10px ${overallColor}`, display: 'inline-block' }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC' }}>Live Pollutant Breakdown</div>
            <div style={{ fontSize: '10px', color: '#475569', marginTop: '1px' }}>{locationName} · {exceededCount > 0 ? `${exceededCount} pollutant${exceededCount > 1 ? 's' : ''} above safe limit` : 'All within safe limits'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={toggleAll}
            style={{ padding: '5px 14px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '20px', color: '#38BDF8', fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(56,189,248,0.2)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(56,189,248,0.1)'}>
            {expandAll ? '▲ Collapse All' : '▼ Expand All'}
          </button>
        </div>
      </div>

      {/* Overall status bar */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ padding: '10px 16px', background: `${overallColor}10`, border: `1px solid ${overallColor}30`, borderRadius: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {POLLUTANTS.map(p => (
            <div key={p.key} title={`${p.label}: ${values[p.key]} ${p.unit}`}
              style={{ width: '10px', height: '24px', borderRadius: '4px', background: values[p.key] > p.safeMax ? '#EF4444' : p.color, opacity: 0.85, position: 'relative', overflow: 'hidden' }}>
              <motion.div animate={{ height: `${Math.min((values[p.key] / p.safeMax) * 100, 100)}%` }}
                initial={{ height: 0 }} transition={{ duration: 0.9, delay: 0.2 }}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.3)' }} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, fontSize: '11px', color: '#94A3B8' }}>
          <span style={{ color: overallColor, fontWeight: 700 }}>{exceededCount === 0 ? 'All Clear' : `${exceededCount} Alert${exceededCount > 1 ? 's'  : ''}`}</span>
          {' '}· {POLLUTANTS.filter(p => values[p.key] > p.safeMax).map(p => p.key).join(', ') || 'No threshold breaches'}
        </div>
        <div style={{ fontSize: '20px', fontWeight: 900, color: overallColor, fontFamily: 'monospace' }}>{reading.AQI}</div>
      </motion.div>

      {/* Pollutant rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {POLLUTANTS.map((p, i) => (
          <PollutantRow key={p.key} p={p} value={values[p.key]} index={i}
            expanded={expanded === p.key || expanded === 'all'}
            onToggle={() => setExpanded(prev => (prev === p.key ? null : p.key))} />
        ))}
      </div>
    </div>
  );
}

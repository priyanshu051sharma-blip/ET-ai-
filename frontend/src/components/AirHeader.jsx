import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AirHeader({ selectedLocation, onSelectLocation, locations = [], activeAlerts = 0, cityScore = 0, onGoHome }) {
  const [time, setTime] = useState('');
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  const criticalLocs = locations.filter(l => l.aqi_color === 'red' || l.aqi_color === 'orange');
  const scoreColor = cityScore >= 75 ? '#10B981' : cityScore >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <header style={{
      background: 'linear-gradient(90deg,#020c1b 0%,#071428 50%,#020c1b 100%)',
      borderBottom: '1px solid rgba(56,189,248,0.18)',
      height: '64px', padding: '0 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 500, flexShrink: 0, gap: '16px',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <motion.div onClick={onGoHome} whileHover={{ scale: 1.08 }} style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: 'linear-gradient(135deg,#0ea5e9,#38BDF8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', boxShadow: '0 0 18px rgba(56,189,248,0.5)',
          border: '1px solid rgba(56,189,248,0.3)', cursor: 'pointer',
        }}>🌫️</motion.div>
        <div style={{ cursor: 'pointer' }} onClick={onGoHome}>
          <div style={{ fontSize: '15px', fontWeight: 800, background: 'linear-gradient(90deg,#38BDF8,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AirSense AI
          </div>
          <div style={{ fontSize: '9px', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Urban Air Quality Intelligence</div>
        </div>
      </div>

      {/* City Score pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: `${scoreColor}12`, border: `1px solid ${scoreColor}30`, borderRadius: '20px', flexShrink: 0 }}>
        <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ width: '6px', height: '6px', borderRadius: '50%', background: scoreColor, display: 'inline-block', boxShadow: `0 0 8px ${scoreColor}` }} />
        <span style={{ fontSize: '11px', fontWeight: 700, color: scoreColor }}>City Score: {cityScore}</span>
      </div>

      {/* Location selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '380px' }}>
        <select value={selectedLocation} onChange={e => onSelectLocation(e.target.value)}
          style={{ width: '100%', background: 'rgba(7,20,40,0.9)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', color: '#f1f5f9', outline: 'none', cursor: 'pointer' }}>
          {locations.map(l => <option key={l.name} value={l.name} style={{ background: '#071428' }}>📍 {l.name} — AQI {l.current_aqi}</option>)}
        </select>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexShrink: 0 }}>
        <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#38BDF8' }}>{time}</div>

        {/* Alert bell */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowAlerts(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '6px 8px', borderRadius: '8px', position: 'relative', transition: 'background 0.15s' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(56,189,248,0.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}>
            🔔
            {activeAlerts > 0 && (
              <span style={{ position: 'absolute', top: '2px', right: '2px', background: '#EF4444', color: '#fff', fontSize: '9px', fontWeight: 800, borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #020c1b', boxShadow: '0 0 8px #EF4444', pointerEvents: 'none' }}>
                {activeAlerts}
              </span>
            )}
          </button>
          <AnimatePresence>
            {showAlerts && (
              <motion.div initial={{ opacity: 0, scale: 0.94, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: -6 }}
                style={{ position: 'absolute', top: '48px', right: 0, width: '300px', background: 'rgba(4,11,26,0.99)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '12px', padding: '14px', boxShadow: '0 20px 60px rgba(0,0,0,0.9)', zIndex: 9999 }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#38BDF8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(56,189,248,0.1)', paddingBottom: '8px' }}>Air Quality Alerts</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {criticalLocs.length === 0
                    ? <div style={{ fontSize: '12px', color: '#10B981' }}>✓ All zones within acceptable AQI limits</div>
                    : criticalLocs.map(l => (
                      <div key={l.name} style={{ fontSize: '11px', color: '#94A3B8', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '7px' }}>
                        <span style={{ color: l.aqi_color === 'red' ? '#EF4444' : '#F97316', fontWeight: 700 }}>{l.aqi_color === 'red' ? '🔴 CRITICAL' : '🟠 HIGH'}</span>{' '}{l.name} — AQI {l.current_aqi}
                      </div>
                    ))
                  }
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <motion.span animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
            style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981', display: 'inline-block' }} />
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live</span>
        </div>

        {/* Back to home */}
        <button onClick={onGoHome} style={{ padding: '7px 14px', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', color: '#38BDF8', fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.15)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.08)'; }}>
          ← Home
        </button>
      </div>
    </header>
  );
}

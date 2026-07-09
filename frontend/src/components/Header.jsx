import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileModal from './ProfileModal';

export default function Header({ lastUpdated, selectedLocation, onSelectLocation, locations = [], activeAlertsCount = 0, onGoHome, sensorHealth }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const filteredLocs = locations.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header style={{
      background: 'linear-gradient(90deg, #020c1b 0%, #071428 50%, #020c1b 100%)',
      borderBottom: '1px solid rgba(56,189,248,0.18)',
      height: '64px',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 500,      /* high enough to be above everything */
      flexShrink: 0,
      gap: '16px',
      /* NO overflow:hidden — lets dropdowns escape */
    }}>

      {/* ── Brand ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <motion.div
          onClick={onGoHome}
          animate={{ rotateY: [0, 12, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #0ea5e9, #0f3b6f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
            boxShadow: '0 0 18px rgba(56,189,248,0.45)',
            border: '1px solid rgba(56,189,248,0.3)',
            flexShrink: 0, cursor: 'pointer',
          }}
        >🌍</motion.div>
        <div style={{ cursor: 'pointer' }} onClick={onGoHome}>
          <div style={{
            fontSize: '15px', fontWeight: 800, lineHeight: 1.1,
            background: 'linear-gradient(90deg, #38BDF8, #818cf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            EcoSphere AI
          </div>
          <div style={{ fontSize: '9px', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '1px' }}>
            Environmental Intelligence
          </div>
        </div>
      </div>

      {/* ── Search + Location selector ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '480px', position: 'relative' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#38BDF8', fontSize: '13px', pointerEvents: 'none', zIndex: 1 }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search sectors..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onBlur={() => setTimeout(() => setSearchQuery(''), 200)}
            style={{
              width: '100%',
              background: 'rgba(7,20,40,0.9)',
              border: '1px solid rgba(56,189,248,0.2)',
              borderRadius: '8px',
              padding: '7px 12px 7px 32px',
              fontSize: '12px', color: '#f1f5f9', outline: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = '#38BDF8'; e.target.style.boxShadow = '0 0 0 2px rgba(56,189,248,0.15)'; }}
            onBlur2={e => { e.target.style.borderColor = 'rgba(56,189,248,0.2)'; e.target.style.boxShadow = 'none'; }}
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  position: 'absolute', top: '40px', left: 0, right: 0,
                  background: 'rgba(4,11,26,0.99)',
                  border: '1px solid rgba(56,189,248,0.2)',
                  borderRadius: '8px', maxHeight: '180px', overflowY: 'auto',
                  zIndex: 9999,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.8)',
                }}
              >
                {filteredLocs.length === 0
                  ? <div style={{ padding: '10px 14px', fontSize: '12px', color: '#334155' }}>No results</div>
                  : filteredLocs.map(l => (
                    <div key={l.name}
                      onMouseDown={() => { onSelectLocation(l.name); setSearchQuery(''); }}
                      style={{ padding: '9px 14px', fontSize: '12px', color: '#e2e8f0', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between' }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(56,189,248,0.1)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span>{l.name}</span>
                      <span style={{ color: '#334155', fontSize: '10px' }}>{l.sector_type}</span>
                    </div>
                  ))
                }
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Location dropdown */}
        <select
          value={selectedLocation}
          onChange={e => onSelectLocation(e.target.value)}
          style={{
            background: 'rgba(7,20,40,0.9)',
            border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: '8px', padding: '7px 10px',
            fontSize: '12px', color: '#f1f5f9', outline: 'none',
            cursor: 'pointer', minWidth: '155px',
          }}
        >
          {locations.map(l => (
            <option key={l.name} value={l.name} style={{ background: '#071428' }}>
              📍 {l.name}
            </option>
          ))}
        </select>
      </div>

      {/* ── Right controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexShrink: 0 }}>

        {/* Clock */}
        <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#38BDF8', letterSpacing: '0.05em', userSelect: 'none' }}>
          {time}
        </div>

        {/* Bell button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(v => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '20px', padding: '6px 8px',
              borderRadius: '8px', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
              color: '#fff',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(56,189,248,0.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
          >
            🔔
            {activeAlertsCount > 0 && (
              <span style={{
                position: 'absolute', top: '2px', right: '2px',
                background: '#EF4444', color: '#fff', fontSize: '9px', fontWeight: 800,
                borderRadius: '50%', width: '16px', height: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid #020c1b',
                boxShadow: '0 0 8px #EF4444',
                pointerEvents: 'none',
              }}>
                {activeAlertsCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: -6 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', top: '48px', right: 0,
                  width: '300px',
                  background: 'rgba(4,11,26,0.99)',
                  border: '1px solid rgba(56,189,248,0.2)',
                  borderRadius: '12px', padding: '14px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
                  zIndex: 9999,
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#38BDF8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(56,189,248,0.1)', paddingBottom: '8px' }}>
                  Active Notifications
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {activeAlertsCount === 0
                    ? <div style={{ fontSize: '12px', color: '#10B981' }}>✓ All grids nominal</div>
                    : locations.filter(l => l.aqi_color === 'red' || l.aqi_color === 'orange' || l.water_status !== 'Safe').map(l => (
                      <div key={l.name} style={{ fontSize: '11px', color: '#94A3B8', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '7px' }}>
                        <span style={{ color: l.aqi_color === 'red' ? '#EF4444' : '#F97316', fontWeight: 700 }}>
                          {l.aqi_color === 'red' ? '🔴 CRITICAL' : '🟠 WARNING'}
                        </span>{' '}
                        {l.name} — AQI {l.current_aqi}
                      </div>
                    ))
                  }
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', userSelect: 'none' }}>
          <motion.span
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981', display: 'inline-block' }}
          />
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Live
          </span>
        </div>

        {/* Avatar — opens profile modal */}
        <button
          onClick={() => setShowProfile(true)}
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #38BDF8, #0ea5e9)',
            color: '#020c1b', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 800, cursor: 'pointer',
            border: 'none', boxShadow: '0 0 14px rgba(56,189,248,0.4)',
            flexShrink: 0,
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(56,189,248,0.7)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 14px rgba(56,189,248,0.4)'; }}
        >
          EP
        </button>
      </div>

      {/* Profile Modal — rendered outside header flow to avoid clipping */}
      <ProfileModal
        open={showProfile}
        onClose={() => setShowProfile(false)}
        locations={locations}
        activeAlerts={activeAlertsCount}
        sensorHealth={sensorHealth}
      />
    </header>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileModal({ open, onClose, locations = [], activeAlerts = 0, sensorHealth = null }) {
  if (!open) return null;

  const online = sensorHealth?.online_sensors ?? '—';
  const offline = sensorHealth?.offline_sensors ?? '—';
  const total = sensorHealth?.total_sensors ?? '—';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 8000, backdropFilter: 'blur(4px)' }}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'fixed', top: '80px', right: '24px',
              width: '320px', zIndex: 9000,
              background: 'linear-gradient(145deg, rgba(4,11,26,0.99), rgba(10,20,42,0.98))',
              border: '1px solid rgba(56,189,248,0.2)',
              borderRadius: '16px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.12), rgba(129,140,248,0.08))', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg,#38BDF8,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900, color: '#020c1b', boxShadow: '0 0 24px rgba(56,189,248,0.5)', flexShrink: 0 }}>
                EP
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#F8FAFC' }}>Environment Planner</div>
                <div style={{ fontSize: '12px', color: '#38BDF8', marginTop: '2px' }}>ep@ecosphere.ai</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '6px', padding: '3px 10px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', fontSize: '10px', color: '#10B981', fontWeight: 700 }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981' }} />
                  Active
                </div>
              </div>
              <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#475569', fontSize: '20px', cursor: 'pointer', lineHeight: 1, padding: '4px', borderRadius: '6px', transition: 'color 0.15s' }}
                onMouseOver={e => e.target.style.color = '#F8FAFC'} onMouseOut={e => e.target.style.color = '#475569'}>✕</button>
            </div>

            {/* Stats */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '10px', color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Network Status</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                {[
                  { label: 'Total Sensors', val: total, color: '#38BDF8' },
                  { label: 'Online', val: online, color: '#10B981' },
                  { label: 'Offline', val: offline, color: '#EF4444' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: s.color, fontFamily: 'monospace' }}>{s.val}</div>
                    <div style={{ fontSize: '9px', color: '#334155', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active alerts */}
            <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#94A3B8' }}>Active Alerts</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: activeAlerts > 0 ? '#EF4444' : '#10B981', fontFamily: 'monospace' }}>
                {activeAlerts > 0 ? `⚠ ${activeAlerts}` : '✓ Clear'}
              </span>
            </div>

            {/* Monitored locations */}
            <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '10px', color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Monitored Sectors</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {locations.slice(0, 8).map(l => (
                  <span key={l.name} style={{ fontSize: '10px', padding: '3px 8px', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '6px', color: '#38BDF8' }}>
                    {l.name}
                  </span>
                ))}
                {locations.length > 8 && (
                  <span style={{ fontSize: '10px', padding: '3px 8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#475569' }}>
                    +{locations.length - 8} more
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { icon: '⚙️', label: 'Settings', sub: 'Dashboard preferences' },
                { icon: '📥', label: 'Export Data', sub: 'Download CSV / PDF reports' },
                { icon: '🔒', label: 'Sign Out', sub: 'End session', danger: true },
              ].map(item => (
                <button key={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
                  background: item.danger ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${item.danger ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '10px', cursor: 'pointer', width: '100%', textAlign: 'left',
                  transition: 'all 0.15s',
                }}
                  onMouseOver={e => e.currentTarget.style.background = item.danger ? 'rgba(239,68,68,0.1)' : 'rgba(56,189,248,0.08)'}
                  onMouseOut={e => e.currentTarget.style.background = item.danger ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)'}
                >
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: item.danger ? '#EF4444' : '#F8FAFC' }}>{item.label}</div>
                    <div style={{ fontSize: '10px', color: '#334155', marginTop: '1px' }}>{item.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

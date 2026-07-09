import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const SIM_EVENTS = [
  {
    key: 'chemical_spill',
    label: 'Chemical Spill Anomaly',
    desc: 'Drops pH & DO at River Stations — simulates industrial discharge',
    emoji: '🧪',
    color: '#EF4444',
  },
  {
    key: 'traffic_jam',
    label: 'Heavy Gridlock Traffic',
    desc: 'Spikes PM2.5, CO & AQI at City Center and Highways',
    emoji: '🚗',
    color: '#F97316',
  },
  {
    key: 'industrial_spike',
    label: 'Industrial Emission Surge',
    desc: 'Increases SO₂ & PM10 at Industrial Zone sensors',
    emoji: '🏭',
    color: '#F59E0B',
  },
];

export default function AdminPanel({ onConfigChange }) {
  const [config, setConfig] = useState({
    chemical_spill: false,
    traffic_jam: false,
    industrial_spike: false,
    sensor_offline_count: 0,
    aqi_threshold: 150,
    wqi_threshold: 70,
  });

  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    axios.get(`${API_BASE}/api/admin/config`).then(res => {
      if (res.data.config) setConfig(res.data.config);
    }).catch(() => {});
  }, []);

  const saveConfig = async (cfg) => {
    try {
      await axios.post(`${API_BASE}/api/admin/config`, cfg);
      onConfigChange?.();
    } catch (err) {
      console.error('Admin config save error:', err);
    }
  };

  const toggle = (key) => {
    const updated = { ...config, [key]: !config[key] };
    setConfig(updated);
    saveConfig(updated);
  };

  const slide = (key, val) => {
    const updated = { ...config, [key]: parseInt(val) };
    setConfig(updated);
    saveConfig(updated);
  };

  const anyActive = Object.values(config).some(v => v === true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.95) 100%)',
        border: anyActive ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(56,189,248,0.12)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: anyActive ? '0 8px 32px rgba(239,68,68,0.15)' : '0 8px 32px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        transition: 'all 0.3s',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <motion.span
              animate={anyActive ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.5, repeat: anyActive ? Infinity : 0, repeatDelay: 2 }}
            >
              ⚙️
            </motion.span>
            Simulation Control Panel
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Inject environmental anomalies to test AI response</div>
        </div>
        {anyActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '4px 10px',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '20px',
              fontSize: '10px', fontWeight: '700', color: '#EF4444',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}
          >
            🔴 Simulation Active
          </motion.div>
        )}
      </div>

      {/* Simulation toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {SIM_EVENTS.map(evt => (
          <motion.div
            key={evt.key}
            onClick={() => toggle(evt.key)}
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.99 }}
            style={{
              background: config[evt.key]
                ? `rgba(${evt.color === '#EF4444' ? '239,68,68' : evt.color === '#F97316' ? '249,115,22' : '245,158,11'},0.12)`
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${config[evt.key] ? evt.color + '44' : 'rgba(255,255,255,0.07)'}`,
              borderLeft: config[evt.key] ? `3px solid ${evt.color}` : '3px solid transparent',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px' }}>{evt.emoji}</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: config[evt.key] ? '#F8FAFC' : '#94A3B8' }}>
                  {evt.label}
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{evt.desc}</div>
              </div>
            </div>

            {/* Custom toggle switch */}
            <div style={{
              width: '44px', height: '22px', borderRadius: '11px',
              background: config[evt.key] ? evt.color : 'rgba(255,255,255,0.1)',
              position: 'relative',
              transition: 'background 0.25s',
              flexShrink: 0,
              boxShadow: config[evt.key] ? `0 0 12px ${evt.color}66` : 'none',
            }}>
              <motion.div
                animate={{ left: config[evt.key] ? '24px' : '2px' }}
                transition={{ duration: 0.2 }}
                style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute', top: '2px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Thresholds */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontSize: '10px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Alert Threshold Configuration
        </div>

        {[
          { key: 'sensor_offline_count', label: 'Offline Sensors (Simulated)', min: 0, max: 18, step: 1, color: '#EF4444', unit: 'nodes' },
          { key: 'aqi_threshold', label: 'Critical AQI Limit', min: 80, max: 300, step: 10, color: '#F97316', unit: '' },
          { key: 'wqi_threshold', label: 'Critical WQI Limit', min: 50, max: 90, step: 5, color: '#0EA5E9', unit: '' },
        ].map(sl => (
          <div key={sl.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#94A3B8' }}>{sl.label}</span>
              <span style={{ fontWeight: '700', color: sl.color, fontFamily: 'monospace' }}>
                {config[sl.key]} {sl.unit}
              </span>
            </div>
            <input
              type="range"
              min={sl.min} max={sl.max} step={sl.step}
              value={config[sl.key]}
              onChange={e => slide(sl.key, e.target.value)}
              style={{
                width: '100%', height: '4px',
                accentColor: sl.color,
                background: `linear-gradient(90deg, ${sl.color} ${((config[sl.key] - sl.min) / (sl.max - sl.min)) * 100}%, rgba(255,255,255,0.1) 0%)`,
                borderRadius: '4px', outline: 'none', cursor: 'pointer',
              }}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

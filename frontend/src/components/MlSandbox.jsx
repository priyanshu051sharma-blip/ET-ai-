import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const GLASS = {
  background: 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(20,30,55,0.95) 100%)',
  border: '1px solid rgba(56,189,248,0.12)',
  borderRadius: '18px',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
};

function NeonSlider({ item, value, onChange, accentColor = '#38BDF8' }) {
  const pct = ((value - item.min) / (item.max - item.min)) * 100;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
        <span style={{ color: '#94A3B8', fontWeight: 500 }}>{item.label}</span>
        <span style={{ fontWeight: 700, color: accentColor, fontFamily: 'monospace', fontSize: '13px' }}>
          {value} <span style={{ color: '#475569', fontSize: '10px' }}>{item.unit}</span>
        </span>
      </div>
      <div style={{ position: 'relative', height: '6px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '4px', background: 'rgba(255,255,255,0.06)' }} />
        <motion.div
          style={{ position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: '4px', width: `${pct}%`, background: `linear-gradient(90deg, ${accentColor}88, ${accentColor})`, boxShadow: `0 0 8px ${accentColor}44` }}
          layoutId={undefined}
        />
        <input type="range" min={item.min} max={item.max} step={item.step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{
            position: 'absolute', top: '-4px', left: 0, right: 0, width: '100%',
            appearance: 'none', WebkitAppearance: 'none',
            background: 'transparent', outline: 'none', cursor: 'pointer', height: '14px',
          }}
        />
      </div>
    </div>
  );
}

function AqiOrb({ aqi }) {
  const cfg =
    aqi <= 50  ? { label: 'Good',         color: '#10B981', glow: '#10B981' } :
    aqi <= 100 ? { label: 'Moderate',     color: '#F59E0B', glow: '#F59E0B' } :
    aqi <= 150 ? { label: 'Sensitive',    color: '#F97316', glow: '#F97316' } :
    aqi <= 200 ? { label: 'Unhealthy',    color: '#EF4444', glow: '#EF4444' } :
                 { label: 'Hazardous',    color: '#7C3AED', glow: '#7C3AED' };

  const radius = 46, circ = 2 * Math.PI * radius;
  const strokeLen = Math.min(aqi / 400, 1) * circ * 0.75;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <svg width="120" height="120" style={{ filter: `drop-shadow(0 0 16px ${cfg.glow}55)` }}>
        <defs>
          <linearGradient id="aqiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={cfg.color} />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <motion.circle cx="60" cy="60" r={radius} fill="none"
          stroke={`url(#aqiGrad)`} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${strokeLen} ${circ}`}
          strokeDashoffset={circ * 0.125}
          transform="rotate(-135 60 60)"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${strokeLen} ${circ}` }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
        <text x="60" y="55" textAnchor="middle" fill="white" fontSize="22" fontWeight="800" fontFamily="monospace">{aqi}</text>
        <text x="60" y="72" textAnchor="middle" fill={cfg.color} fontSize="9" fontWeight="700">{cfg.label.toUpperCase()}</text>
      </svg>
    </div>
  );
}

export default function MlSandbox({ selectedLocation, currentTelemetry }) {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  const [airInputs, setAirInputs] = useState({ AQI: 80, PM25: 15.0, PM10: 35.0, CO: 0.8, NO2: 24.0, SO2: 6.0, O3: 32.0, air_temperature: 25.0, humidity: 60.0, wind_speed: 12.0, traffic_index: 40.0 });
  const [waterInputs, setWaterInputs] = useState({ pH: 7.2, TDS: 220.0, DO: 6.8, turbidity: 1.8, temperature: 21.0 });
  const [airResult, setAirResult] = useState(null);
  const [waterResult, setWaterResult] = useState(null);
  const [airLoading, setAirLoading] = useState(false);
  const [waterLoading, setWaterLoading] = useState(false);
  const [activePanel, setActivePanel] = useState('air');

  const loadLiveTelemetry = () => {
    if (!currentTelemetry) return;
    setAirInputs({ AQI: currentTelemetry.AQI ?? 80, PM25: currentTelemetry.PM25 ?? 15.0, PM10: currentTelemetry.PM10 ?? 35.0, CO: currentTelemetry.CO ?? 0.8, NO2: currentTelemetry.NO2 ?? 24.0, SO2: currentTelemetry.SO2 ?? 6.0, O3: currentTelemetry.O3 ?? 32.0, air_temperature: currentTelemetry.air_temperature ?? 25.0, humidity: currentTelemetry.humidity ?? 60.0, wind_speed: currentTelemetry.wind_speed ?? 12.0, traffic_index: currentTelemetry.traffic_index ?? 40.0 });
    setWaterInputs({ pH: currentTelemetry.pH ?? 7.2, TDS: currentTelemetry.TDS ?? 220.0, DO: currentTelemetry.DO ?? 6.8, turbidity: currentTelemetry.turbidity ?? 1.8, temperature: currentTelemetry.water_temperature ?? 21.0 });
  };

  useEffect(() => { loadLiveTelemetry(); }, [currentTelemetry]);

  const predictAir = async () => {
    setAirLoading(true);
    try { const res = await axios.post(`${API_BASE}/api/sandbox/predict-air`, airInputs); setAirResult(res.data); }
    catch (e) { console.error(e); } finally { setAirLoading(false); }
  };

  const predictWater = async () => {
    setWaterLoading(true);
    try { const res = await axios.post(`${API_BASE}/api/sandbox/predict-water`, waterInputs); setWaterResult(res.data); }
    catch (e) { console.error(e); } finally { setWaterLoading(false); }
  };

  const AIR_SLIDERS = [
    { key: 'AQI', label: 'Base AQI', min: 10, max: 400, step: 1, unit: '' },
    { key: 'PM25', label: 'PM2.5', min: 1, max: 200, step: 0.1, unit: 'µg/m³' },
    { key: 'PM10', label: 'PM10', min: 5, max: 300, step: 1, unit: 'µg/m³' },
    { key: 'CO', label: 'CO', min: 0.1, max: 8.0, step: 0.1, unit: 'mg/m³' },
    { key: 'NO2', label: 'NO₂', min: 1, max: 120, step: 1, unit: 'µg/m³' },
    { key: 'SO2', label: 'SO₂', min: 1, max: 80, step: 1, unit: 'µg/m³' },
    { key: 'O3', label: 'O₃ Ozone', min: 1, max: 150, step: 1, unit: 'µg/m³' },
    { key: 'air_temperature', label: 'Temperature', min: -5, max: 45, step: 0.5, unit: '°C' },
    { key: 'humidity', label: 'Humidity', min: 10, max: 100, step: 1, unit: '%' },
    { key: 'wind_speed', label: 'Wind Speed', min: 0, max: 50, step: 0.5, unit: 'km/h' },
    { key: 'traffic_index', label: 'Traffic Index', min: 0, max: 100, step: 1, unit: '%' },
  ];

  const WATER_SLIDERS = [
    { key: 'pH', label: 'pH Level', min: 4.0, max: 10.0, step: 0.1, unit: '' },
    { key: 'TDS', label: 'TDS', min: 50, max: 800, step: 10, unit: 'mg/L' },
    { key: 'DO', label: 'Dissolved Oxygen', min: 1.0, max: 12.0, step: 0.1, unit: 'mg/L' },
    { key: 'turbidity', label: 'Turbidity', min: 0.5, max: 20.0, step: 0.1, unit: 'NTU' },
    { key: 'temperature', label: 'Water Temp', min: 5, max: 40, step: 0.5, unit: '°C' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        style={{ ...GLASS, padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>🧠</motion.span>
            ML Model Sandbox
          </div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '3px' }}>
            Test trained AI estimators with real or custom environmental inputs
          </div>
        </div>
        <motion.button onClick={loadLiveTelemetry}
          whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(56,189,248,0.4)' }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(14,165,233,0.15))',
            color: '#38BDF8', border: '1px solid rgba(56,189,248,0.35)',
            borderRadius: '10px', padding: '10px 20px',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            backdropFilter: 'blur(8px)',
          }}>
          <motion.span animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>🔄</motion.span>
          Sync Live · {selectedLocation}
        </motion.button>
      </motion.div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[{ id: 'air', label: '🌫️ Air Quality Forecast', color: '#38BDF8' }, { id: 'water', label: '💧 Water Safety Classifier', color: '#34D399' }].map(tab => (
          <motion.button key={tab.id} onClick={() => setActivePanel(tab.id)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{
              flex: 1, padding: '12px', border: '1px solid', borderRadius: '12px', cursor: 'pointer',
              fontSize: '13px', fontWeight: 700,
              borderColor: activePanel === tab.id ? tab.color : 'rgba(255,255,255,0.06)',
              background: activePanel === tab.id ? `${tab.color}15` : 'rgba(255,255,255,0.02)',
              color: activePanel === tab.id ? tab.color : '#475569',
              boxShadow: activePanel === tab.id ? `0 0 16px ${tab.color}22` : 'none',
              transition: 'all 0.2s',
            }}>
            {tab.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activePanel}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}
        >
          {/* Sliders panel */}
          <div style={{ ...GLASS, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: activePanel === 'air' ? '#38BDF8' : '#34D399', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              {activePanel === 'air' ? '🌫️ Air Pollutant Inputs' : '💧 Water Quality Inputs'}
            </div>
            {(activePanel === 'air' ? AIR_SLIDERS : WATER_SLIDERS).map((item, i) => (
              <motion.div key={item.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <NeonSlider
                  item={item}
                  value={activePanel === 'air' ? airInputs[item.key] : waterInputs[item.key]}
                  accentColor={activePanel === 'air' ? '#38BDF8' : '#34D399'}
                  onChange={v => activePanel === 'air'
                    ? setAirInputs(p => ({ ...p, [item.key]: v }))
                    : setWaterInputs(p => ({ ...p, [item.key]: v }))}
                />
              </motion.div>
            ))}
            <motion.button
              onClick={activePanel === 'air' ? predictAir : predictWater}
              disabled={activePanel === 'air' ? airLoading : waterLoading}
              whileHover={{ scale: 1.02, boxShadow: activePanel === 'air' ? '0 0 24px rgba(56,189,248,0.35)' : '0 0 24px rgba(52,211,153,0.35)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', padding: '14px', border: 'none', borderRadius: '12px',
                fontSize: '14px', fontWeight: 800, cursor: 'pointer', marginTop: '8px',
                background: activePanel === 'air'
                  ? 'linear-gradient(135deg, #0ea5e9, #38BDF8)'
                  : 'linear-gradient(135deg, #059669, #34D399)',
                color: '#020817',
                boxShadow: activePanel === 'air' ? '0 4px 20px rgba(56,189,248,0.3)' : '0 4px 20px rgba(52,211,153,0.3)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
              {(activePanel === 'air' ? airLoading : waterLoading)
                ? <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>⚙️</motion.span> Analyzing…</>
                : activePanel === 'air' ? '🔮 Compute AQI Forecast' : '🛡️ Classify Water Safety'
              }
            </motion.button>
          </div>

          {/* Result panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <AnimatePresence mode="wait">
              {activePanel === 'air' && airResult && (
                <motion.div key="air-result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  style={{ ...GLASS, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>🔮 ML Regressor Output</div>
                  <AqiOrb aqi={airResult.predicted_aqi} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>24h Forecast AQI</div>
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>{airResult.category}</div>
                  </div>
                  <div style={{ width: '100%', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px', fontSize: '10px', color: '#475569', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    Engine: {airResult.model_used}
                  </div>
                </motion.div>
              )}
              {activePanel === 'water' && waterResult && (
                <motion.div key="water-result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  style={{ ...GLASS, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>🛡️ ML Classifier Output</div>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      width: '100px', height: '100px', borderRadius: '50%',
                      border: `4px solid ${waterResult.status === 'SAFE' ? '#34D399' : '#EF4444'}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      background: waterResult.status === 'SAFE' ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
                      boxShadow: `0 0 28px ${waterResult.status === 'SAFE' ? 'rgba(52,211,153,0.35)' : 'rgba(239,68,68,0.35)'}`,
                    }}>
                    <span style={{ fontSize: '28px' }}>{waterResult.status === 'SAFE' ? '🛡️' : '⚠️'}</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: waterResult.status === 'SAFE' ? '#34D399' : '#EF4444' }}>{waterResult.status}</span>
                  </motion.div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#94A3B8' }}>Contamination Risk</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: waterResult.status === 'SAFE' ? '#34D399' : '#EF4444', fontFamily: 'monospace' }}>
                      {waterResult.probability_unsafe}%
                    </div>
                  </div>
                  {waterResult.reasons?.length > 0 && (
                    <div style={{ width: '100%', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px', fontSize: '11px', color: '#EF4444', textAlign: 'left' }}>
                      {waterResult.reasons.map((r, i) => <div key={i}>⚠ {r}</div>)}
                    </div>
                  )}
                  <div style={{ width: '100%', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px', fontSize: '10px', color: '#475569' }}>
                    Engine: {waterResult.model_used}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live stats mini-panel */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ ...GLASS, padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '10px', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Current Inputs Summary</div>
              {activePanel === 'air' ? (
                [['AQI', airInputs.AQI, '#38BDF8'], ['PM2.5', `${airInputs.PM25} µg`, '#818CF8'], ['Wind', `${airInputs.wind_speed} km/h`, '#F472B6'], ['Humidity', `${airInputs.humidity}%`, '#34D399']].map(([k, v, c]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748B' }}>{k}</span>
                    <span style={{ color: c, fontWeight: 700, fontFamily: 'monospace' }}>{v}</span>
                  </div>
                ))
              ) : (
                [['pH', waterInputs.pH, '#34D399'], ['TDS', `${waterInputs.TDS} mg/L`, '#38BDF8'], ['DO', `${waterInputs.DO} mg/L`, '#818CF8'], ['Turbidity', `${waterInputs.turbidity} NTU`, '#F59E0B']].map(([k, v, c]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748B' }}>{k}</span>
                    <span style={{ color: c, fontWeight: 700, fontFamily: 'monospace' }}>{v}</span>
                  </div>
                ))
              )}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

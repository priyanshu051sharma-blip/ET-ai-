import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
  AreaChart, Area, Brush
} from 'recharts';

const AIR_METRICS = [
  { key: 'AQI',   label: 'Air Quality Index', unit: '',       color: '#38BDF8', safeMax: 100 },
  { key: 'PM25',  label: 'PM2.5',             unit: 'µg/m³',  color: '#818CF8', safeMax: 35.4 },
  { key: 'PM10',  label: 'PM10',              unit: 'µg/m³',  color: '#C084FC', safeMax: 154 },
  { key: 'CO',    label: 'Carbon Monoxide',   unit: 'mg/m³',  color: '#F472B6', safeMax: 9.0 },
  { key: 'NO2',   label: 'Nitrogen Dioxide',  unit: 'µg/m³',  color: '#FB923C', safeMax: 100 },
  { key: 'SO2',   label: 'Sulfur Dioxide',    unit: 'µg/m³',  color: '#FACC15', safeMax: 75 },
];

const WATER_METRICS = [
  { key: 'WQI',       label: 'Water Quality Index', unit: '',     color: '#34D399', safeMin: 70 },
  { key: 'pH',        label: 'pH Level',             unit: '',     color: '#6EE7B7', safeMin: 6.5, safeMax: 8.5 },
  { key: 'turbidity', label: 'Turbidity',            unit: 'NTU',  color: '#FCD34D', safeMax: 5.0 },
  { key: 'DO',        label: 'Dissolved Oxygen',     unit: 'mg/L', color: '#93C5FD', safeMin: 4.5 },
  { key: 'TDS',       label: 'TDS',                  unit: 'mg/L', color: '#A5B4FC', safeMax: 400 },
];

const fmtTime = (ts) => {
  try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); }
  catch { return ''; }
};

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(15,23,42,0.98)',
      border: '1px solid rgba(56,189,248,0.2)',
      borderRadius: '8px',
      padding: '10px 14px',
      fontSize: '12px',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    }}>
      <div style={{ color: '#64748B', marginBottom: '6px', fontFamily: 'monospace', fontSize: '11px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#38BDF8', fontWeight: '700' }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value} {unit || ''}
        </div>
      ))}
    </div>
  );
};

export default function Chart({ historicalData, forecastData, locationName, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab || 'air');
  const [activeAirMetric, setActiveAirMetric] = useState('AQI');
  const [activeWaterMetric, setActiveWaterMetric] = useState('WQI');

  const airMetric = AIR_METRICS.find(m => m.key === activeAirMetric);
  const waterMetric = WATER_METRICS.find(m => m.key === activeWaterMetric);

  const tabConfig = [
    { id: 'air',      label: '🌫️ Air',     color: '#38BDF8' },
    { id: 'water',    label: '💧 Water',   color: '#34D399' },
    { id: 'forecast', label: '🔮 Forecast', color: '#818CF8' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.95) 100%)',
        border: '1px solid rgba(56,189,248,0.12)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#F8FAFC' }}>
            Environmental Telemetry
          </div>
          <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
            {locationName} · {activeTab === 'forecast' ? '7-day ML projection' : '24-hour sensor stream'}
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px' }}>
          {tabConfig.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '5px 12px', fontSize: '11px', fontWeight: '700',
                borderRadius: '7px', border: 'none', cursor: 'pointer',
                background: activeTab === tab.id ? 'rgba(56,189,248,0.15)' : 'transparent',
                color: activeTab === tab.id ? tab.color : '#475569',
                borderBottom: activeTab === tab.id ? `2px solid ${tab.color}` : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric pills */}
      {activeTab === 'air' && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {AIR_METRICS.map(m => (
            <motion.button
              key={m.key}
              onClick={() => setActiveAirMetric(m.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '3px 10px', fontSize: '10px', fontWeight: '700',
                borderRadius: '20px', border: '1px solid',
                cursor: 'pointer',
                borderColor: activeAirMetric === m.key ? m.color : 'rgba(255,255,255,0.08)',
                background: activeAirMetric === m.key ? `${m.color}22` : 'transparent',
                color: activeAirMetric === m.key ? m.color : '#64748B',
                transition: 'all 0.15s',
                boxShadow: activeAirMetric === m.key ? `0 0 8px ${m.color}44` : 'none',
              }}
            >
              {m.key}
            </motion.button>
          ))}
        </div>
      )}

      {activeTab === 'water' && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {WATER_METRICS.map(m => (
            <motion.button
              key={m.key}
              onClick={() => setActiveWaterMetric(m.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '3px 10px', fontSize: '10px', fontWeight: '700',
                borderRadius: '20px', border: '1px solid',
                cursor: 'pointer',
                borderColor: activeWaterMetric === m.key ? m.color : 'rgba(255,255,255,0.08)',
                background: activeWaterMetric === m.key ? `${m.color}22` : 'transparent',
                color: activeWaterMetric === m.key ? m.color : '#64748B',
                transition: 'all 0.15s',
                boxShadow: activeWaterMetric === m.key ? `0 0 8px ${m.color}44` : 'none',
              }}
            >
              {m.key}
            </motion.button>
          ))}
        </div>
      )}

      {/* Chart */}
      <div style={{ width: '100%', height: 240 }}>
        {activeTab === 'air' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id={`airGrad-${activeAirMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={airMetric.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={airMetric.color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="timestamp" tickFormatter={fmtTime}
                tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
              <YAxis domain={['auto', 'auto']}
                tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<CustomTooltip unit={airMetric.unit} />} />
              {airMetric.safeMax && (
                <ReferenceLine y={airMetric.safeMax} stroke="#EF444466"
                  strokeDasharray="4 4"
                  label={{ value: `⚠ ${airMetric.safeMax}`, fill: '#EF4444', fontSize: 9, position: 'insideTopRight' }} />
              )}
              <Area type="monotone" dataKey={activeAirMetric}
                stroke={airMetric.color} strokeWidth={2}
                fill={`url(#airGrad-${activeAirMetric})`}
                dot={false} activeDot={{ r: 5, stroke: airMetric.color, fill: '#0F172A', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'water' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id={`waterGrad-${activeWaterMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={waterMetric.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={waterMetric.color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="timestamp" tickFormatter={fmtTime}
                tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
              <YAxis domain={['auto', 'auto']}
                tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<CustomTooltip unit={waterMetric.unit} />} />
              {waterMetric.safeMin && (
                <ReferenceLine y={waterMetric.safeMin} stroke="#EF444466" strokeDasharray="4 4"
                  label={{ value: `⚠ min ${waterMetric.safeMin}`, fill: '#EF4444', fontSize: 9, position: 'insideBottomRight' }} />
              )}
              {waterMetric.safeMax && (
                <ReferenceLine y={waterMetric.safeMax} stroke="#EF444466" strokeDasharray="4 4"
                  label={{ value: `⚠ max ${waterMetric.safeMax}`, fill: '#EF4444', fontSize: 9, position: 'insideTopRight' }} />
              )}
              <Area type="monotone" dataKey={activeWaterMetric}
                stroke={waterMetric.color} strokeWidth={2}
                fill={`url(#waterGrad-${activeWaterMetric})`}
                dot={false} activeDot={{ r: 5, stroke: waterMetric.color, fill: '#0F172A', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'forecast' && (
          <>
            {(!forecastData || forecastData.length === 0) ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px' }}>
                <div style={{ fontSize: '28px' }}>📡</div>
                <div style={{ color: '#475569', fontSize: '12px' }}>Loading forecast data…</div>
              </div>
            ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818CF8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#818CF8" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 10, fontWeight: '700' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
              <YAxis domain={[0, 'auto']}
                tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<CustomTooltip />} />
              {/* Confidence band — just upper, no lower mask needed */}
              <Area type="monotone" dataKey="aqi_max" stroke="none" fill="url(#ciGrad)" name="Upper CI" />
              <Area type="monotone" dataKey="aqi" stroke="#818CF8" strokeWidth={2.5}
                fill="url(#forecastGrad)"
                dot={{ r: 4, fill: '#0a1020', stroke: '#818CF8', strokeWidth: 2 }}
                activeDot={{ r: 6, stroke: '#818CF8', fill: '#0a1020', strokeWidth: 2 }}
                name="Predicted AQI"
              />
              <ReferenceLine y={100} stroke="#F9731666" strokeDasharray="3 3"
                label={{ value: '⚠ 100', fill: '#F97316', fontSize: 9, position: 'insideTopRight' }} />
            </AreaChart>
          </ResponsiveContainer>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

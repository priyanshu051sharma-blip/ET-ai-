import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AQI_COLOR = (v) => v<=50?'#10B981':v<=100?'#F59E0B':v<=150?'#F97316':v<=200?'#EF4444':'#7C3AED';
const AQI_LABEL = (v) => v<=50?'Good':v<=100?'Moderate':v<=150?'Sensitive':v<=200?'Unhealthy':'Hazardous';
const AQI_EMOJI = (v) => v<=50?'🟢':v<=100?'🟡':v<=150?'🟠':v<=200?'🔴':'🟣';

export default function HotspotCards({ zones, onSelectZone, selectedZone }) {
  const [expanded, setExpanded] = useState(null);
  const [sortBy, setSortBy] = useState('aqi'); // 'aqi' | 'pm25' | 'no2'

  const sorted = [...(zones || [])].sort((a, b) => {
    if (sortBy === 'aqi') return b.aqi - a.aqi;
    if (sortBy === 'pm25') return b.pm25 - a.pm25;
    if (sortBy === 'no2') return b.no2 - a.no2;
    return 0;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🔥 All Zone Rankings
          <span style={{ fontSize: '10px', padding: '2px 8px', background: 'rgba(239,68,68,0.15)', color: '#EF4444', borderRadius: '10px', fontWeight: 700 }}>
            {(zones || []).filter(z => z.aqi > 100).length} elevated
          </span>
        </div>
        {/* Sort pills */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[['aqi','AQI'],['pm25','PM2.5'],['no2','NO₂']].map(([k,l]) => (
            <button key={k} onClick={() => setSortBy(k)}
              style={{ padding: '3px 10px', fontSize: '9px', fontWeight: 700, borderRadius: '20px', border: '1px solid', cursor: 'pointer', borderColor: sortBy===k ? '#38BDF8' : 'rgba(255,255,255,0.08)', background: sortBy===k ? 'rgba(56,189,248,0.15)' : 'transparent', color: sortBy===k ? '#38BDF8' : '#475569', transition: 'all 0.15s' }}>
              Sort: {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '460px', overflowY: 'auto', paddingRight: '2px' }}>
        {sorted.map((zone, i) => {
          const color = AQI_COLOR(zone.aqi);
          const isExpanded = expanded === zone.name;
          const isSelected = selectedZone === zone.name;
          const rankColor = i === 0 ? '#EF4444' : i === 1 ? '#F97316' : i === 2 ? '#F59E0B' : '#475569';

          return (
            <motion.div key={zone.name}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 200 }}
              style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${isSelected ? color + '44' : isExpanded ? color + '25' : 'rgba(255,255,255,0.06)'}`, background: isSelected ? `${color}08` : isExpanded ? `${color}05` : 'rgba(255,255,255,0.02)', transition: 'all 0.2s' }}
            >
              {/* Main row */}
              <div
                style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
                onClick={() => { setExpanded(isExpanded ? null : zone.name); onSelectZone(zone.name); }}
              >
                {/* Rank badge */}
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: `${rankColor}20`, border: `1.5px solid ${rankColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, color: rankColor, flexShrink: 0 }}>
                  {i + 1}
                </div>

                {/* Name + sector */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{zone.name}</div>
                  <div style={{ fontSize: '10px', color: '#475569', marginTop: '1px' }}>{zone.sector_type}</div>
                </div>

                {/* AQI badge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px' }}>{AQI_EMOJI(zone.aqi)}</span>
                    <span style={{ fontSize: '18px', fontWeight: 900, color, fontFamily: 'monospace', filter: `drop-shadow(0 0 6px ${color}88)` }}>{zone.aqi}</span>
                  </div>
                  <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '8px', background: `${color}18`, color, fontWeight: 700, border: `1px solid ${color}30` }}>{AQI_LABEL(zone.aqi)}</span>
                </div>

                <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}
                  style={{ fontSize: '11px', color: '#334155', flexShrink: 0 }}>▼</motion.span>
              </div>

              {/* Mini bar */}
              <div style={{ padding: '0 14px 8px', paddingLeft: '52px' }}>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((zone.aqi / 300) * 100, 100)}%` }} transition={{ duration: 0.9, delay: i * 0.04 }}
                    style={{ height: '100%', background: `linear-gradient(90deg,${color}88,${color})`, borderRadius: '2px', boxShadow: `0 0 6px ${color}55` }} />
                </div>
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '12px 14px 14px', borderTop: `1px solid ${color}18` }}>
                      {/* Pollutant grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '10px' }}>
                        {[
                          { label: 'PM2.5', value: zone.pm25, unit: 'µg', color: '#38BDF8', safe: 35.4 },
                          { label: 'PM10',  value: zone.pm10, unit: 'µg', color: '#818CF8', safe: 154 },
                          { label: 'NO₂',   value: zone.no2,  unit: 'µg', color: '#F472B6', safe: 100 },
                          { label: 'SO₂',   value: zone.so2,  unit: 'µg', color: '#FACC15', safe: 75 },
                          { label: 'CO',    value: zone.co,   unit: 'mg', color: '#FB923C', safe: 9 },
                          { label: 'Wind',  value: zone.wind_speed, unit: 'km/h', color: '#34D399', safe: null },
                        ].map(p => (
                          <div key={p.label} style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', textAlign: 'center', border: p.safe && p.value > p.safe ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '9px', color: '#475569', marginBottom: '3px' }}>{p.label}</div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: p.safe && p.value > p.safe ? '#EF4444' : p.color, fontFamily: 'monospace' }}>{p.value ?? '—'}</div>
                            <div style={{ fontSize: '8px', color: '#334155' }}>{p.unit}</div>
                          </div>
                        ))}
                      </div>

                      {/* Action bar */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', color: '#64748B' }}>
                          🌡️ {zone.temperature}°C · 💧 {zone.humidity}% · 🚗 {zone.traffic_index}% traffic
                        </span>
                        {zone.aqi > 100 && (
                          <span style={{ fontSize: '9px', padding: '2px 8px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', color: '#EF4444', fontWeight: 700, marginLeft: 'auto' }}>
                            ⚡ Action Required
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AQI_COLOR = (aqi) => aqi <= 50 ? '#10B981' : aqi <= 100 ? '#F59E0B' : aqi <= 150 ? '#F97316' : aqi <= 200 ? '#EF4444' : '#7C3AED';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(4,11,26,0.98)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
      <div style={{ color: '#38BDF8', fontWeight: 700, marginBottom: '4px' }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color || '#94A3B8' }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

export default function MultiCityAnalytics({ data }) {
  const [view, setView] = useState('bar'); // 'bar' | 'table'

  if (!data || !data.cities?.length) return (
    <div style={{ background: 'linear-gradient(135deg,rgba(10,16,32,0.98),rgba(15,26,52,0.95))', border: '1px solid rgba(56,189,248,0.12)', borderRadius: '18px', padding: '24px', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#334155', fontSize: '13px' }}>Loading city comparison…</div>
    </div>
  );

  const chartData = data.cities.slice(0, 12).map(c => ({ name: c.name.replace('Sector ', 'S-'), aqi: c.current_aqi, pm25: Math.round(c.pm25) }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'linear-gradient(135deg,rgba(10,16,32,0.98),rgba(15,26,52,0.95))', border: '1px solid rgba(56,189,248,0.12)', borderRadius: '18px', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#818CF8', boxShadow: '0 0 8px #818CF8' }} />
            Multi-Zone AQI Analytics
          </div>
          <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px' }}>Comparative pollution ranking across all {data.total_compared} monitored sectors</div>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '8px' }}>
          {[['bar', '📊 Chart'], ['table', '📋 Table']].map(([id, label]) => (
            <button key={id} onClick={() => setView(id)}
              style={{ padding: '4px 12px', fontSize: '10px', fontWeight: 700, borderRadius: '6px', border: 'none', cursor: 'pointer', background: view === id ? 'rgba(129,140,248,0.2)' : 'transparent', color: view === id ? '#818CF8' : '#475569', transition: 'all 0.15s' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Most/Least polluted */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {data.most_polluted && (
          <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px' }}>
            <div style={{ fontSize: '9px', color: '#EF4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>🔴 Most Polluted</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>{data.most_polluted.name}</div>
            <div style={{ fontSize: '11px', color: '#EF4444', fontFamily: 'monospace', fontWeight: 800 }}>AQI {data.most_polluted.current_aqi}</div>
          </div>
        )}
        {data.cleanest && (
          <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px' }}>
            <div style={{ fontSize: '9px', color: '#10B981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>🟢 Cleanest Zone</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>{data.cleanest.name}</div>
            <div style={{ fontSize: '11px', color: '#10B981', fontFamily: 'monospace', fontWeight: 800 }}>AQI {data.cleanest.current_aqi}</div>
          </div>
        )}
      </div>

      {view === 'bar' ? (
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" />
              <YAxis tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="aqi" name="AQI" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={AQI_COLOR(entry.aqi)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ overflowY: 'auto', maxHeight: '220px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['#', 'Zone', 'AQI', 'PM2.5', 'Trend', 'Pollutant'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', fontWeight: 600, color: '#334155', textAlign: 'left', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.cities.map((c, i) => (
                <motion.tr key={c.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '8px 10px', color: '#334155', fontFamily: 'monospace' }}>{i + 1}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 600, color: '#F1F5F9' }}>{c.name}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 800, color: AQI_COLOR(c.current_aqi), fontFamily: 'monospace' }}>{c.current_aqi}</td>
                  <td style={{ padding: '8px 10px', color: '#38BDF8' }}>{c.pm25}µg</td>
                  <td style={{ padding: '8px 10px', color: c.trend === 'improving' ? '#10B981' : c.trend === 'worsening' ? '#EF4444' : '#F59E0B' }}>
                    {c.trend === 'improving' ? '↓ Better' : c.trend === 'worsening' ? '↑ Worse' : '→ Stable'}
                  </td>
                  <td style={{ padding: '8px 10px', color: '#818CF8', fontSize: '10px' }}>{c.dominant_pollutant}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

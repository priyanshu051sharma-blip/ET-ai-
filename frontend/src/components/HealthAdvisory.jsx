import React from 'react';
import { motion } from 'framer-motion';

const RISK_COLOR = { None: '#10B981', Low: '#10B981', Moderate: '#F59E0B', High: '#F97316', Critical: '#EF4444' };

export default function HealthAdvisory({ data }) {
  if (!data) return (
    <div style={{ background: 'linear-gradient(135deg,rgba(10,16,32,0.98),rgba(15,26,52,0.95))', border: '1px solid rgba(56,189,248,0.12)', borderRadius: '18px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
      <div style={{ color: '#334155', fontSize: '13px' }}>Loading health advisory…</div>
    </div>
  );

  const levelColor = data.color || '#38BDF8';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'linear-gradient(135deg,rgba(10,16,32,0.98),rgba(15,26,52,0.95))', border: `1px solid ${levelColor}22`, borderRadius: '18px', padding: '24px', boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 24px ${levelColor}08`, display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: levelColor, boxShadow: `0 0 8px ${levelColor}` }} />
            Citizen Health Advisory
          </div>
          <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px' }}>{data.location} · Real-time health risk assessment</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {data.mask_required && (
            <span style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '20px', fontSize: '10px', fontWeight: 700, color: '#EF4444' }}>😷 Mask Required</span>
          )}
          {data.outdoor_restriction && (
            <span style={{ padding: '4px 10px', background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '20px', fontSize: '10px', fontWeight: 700, color: '#F97316' }}>🚫 Limit Outdoors</span>
          )}
        </div>
      </div>

      {/* AQI Big display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', background: `${levelColor}0a`, border: `1px solid ${levelColor}25`, borderRadius: '12px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', fontWeight: 900, color: levelColor, fontFamily: 'monospace', lineHeight: 1, filter: `drop-shadow(0 0 12px ${levelColor}88)` }}>{data.aqi}</div>
          <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>AQI</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: levelColor }}>{data.emoji} {data.level}</div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>PM2.5: <span style={{ color: '#38BDF8', fontWeight: 700 }}>{data.pm25} µg/m³</span> · {data.pm25_health_impact}</div>
          {data.emergency && (
            <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}
              style={{ marginTop: '8px', fontSize: '11px', fontWeight: 700, color: '#EF4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🚨 PUBLIC HEALTH EMERGENCY — IMMEDIATE ACTION REQUIRED
            </motion.div>
          )}
        </div>
      </div>

      {/* Advisory cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
        {(data.advisories || []).map((adv, i) => {
          const riskColor = RISK_COLOR[adv.risk] || '#38BDF8';
          return (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              style={{ display: 'flex', gap: '12px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.06)`, borderLeft: `3px solid ${riskColor}`, borderRadius: '0 10px 10px 0' }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{adv.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#F1F5F9' }}>{adv.group}</span>
                  <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '4px', background: `${riskColor}18`, color: riskColor, fontWeight: 700, textTransform: 'uppercase', border: `1px solid ${riskColor}30` }}>{adv.risk}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.5 }}>{adv.advice}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

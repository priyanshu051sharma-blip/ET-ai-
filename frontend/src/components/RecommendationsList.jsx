import React from 'react';
import { motion } from 'framer-motion';

const PRIORITY_CFG = {
  Critical: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#EF4444', glow: '#EF4444', icon: '🔴' },
  High:     { bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)', color: '#F97316', glow: '#F97316', icon: '🟠' },
  Medium:   { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', color: '#F59E0B', glow: '#F59E0B', icon: '🟡' },
  default:  { bg: 'rgba(56,189,248,0.06)', border: 'rgba(56,189,248,0.15)', color: '#38BDF8', glow: '#38BDF8', icon: '🔵' },
};

export default function RecommendationsList({ recommendations }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.95) 100%)',
        border: '1px solid rgba(56,189,248,0.12)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        minHeight: '340px',
      }}
    >
      {/* Header */}
      <div>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8', boxShadow: '0 0 8px #38BDF8' }} />
          AI Recommendations Engine
        </div>
        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
          Autonomous interventions from real-time analysis
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '280px', paddingRight: '4px' }}>
        {(!recommendations || recommendations.length === 0) ? (
          <div style={{ textAlign: 'center', color: '#475569', fontSize: '13px', padding: '40px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
            All parameters nominal — no interventions needed.
          </div>
        ) : (
          recommendations.map((rec, idx) => {
            const cfg = PRIORITY_CFG[rec.priority] || PRIORITY_CFG.default;
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.07 }}
                whileHover={{ x: 4, boxShadow: `0 4px 20px ${cfg.glow}22` }}
                style={{
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  borderLeft: `3px solid ${cfg.color}`,
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '12px', flexShrink: 0 }}>{cfg.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '9px', fontWeight: '800',
                        color: cfg.color,
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        background: `${cfg.bg}`,
                        border: `1px solid ${cfg.border}`,
                        padding: '2px 6px', borderRadius: '4px',
                      }}>
                        {rec.priority}
                      </span>
                      <span style={{ fontSize: '9px', color: '#475569', fontStyle: 'italic' }}>
                        🏢 {rec.department}
                      </span>
                    </div>
                    <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#F1F5F9', lineHeight: 1.4 }}>
                      {rec.action}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: '11px', color: '#64748B',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  paddingTop: '6px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <span style={{ color: '#38BDF8' }}>↗</span>
                  {rec.impact}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

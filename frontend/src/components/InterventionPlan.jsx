import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_STYLE = {
  'AUTO-TRIGGERED': { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', border: 'rgba(239,68,68,0.3)' },
  'RECOMMENDED':    { bg: 'rgba(249,115,22,0.12)', color: '#F97316', border: 'rgba(249,115,22,0.25)' },
  'SCHEDULED':      { bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', border: 'rgba(245,158,11,0.2)' },
  'ROUTINE':        { bg: 'rgba(16,185,129,0.1)',  color: '#10B981', border: 'rgba(16,185,129,0.2)' },
};

export default function InterventionPlan({ data }) {
  const [filter, setFilter] = useState('All');

  if (!data || !data.actions) return (
    <div style={{ background: 'linear-gradient(135deg,rgba(10,16,32,0.98),rgba(15,26,52,0.95))', border: '1px solid rgba(56,189,248,0.12)', borderRadius: '18px', padding: '24px', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#334155', fontSize: '13px' }}>Loading intervention plan…</div>
    </div>
  );

  const levelColor = data.intervention_level === 'Emergency' ? '#EF4444' : data.intervention_level === 'High Alert' ? '#F97316' : data.intervention_level === 'Moderate' ? '#F59E0B' : '#10B981';
  const timeframes = ['All', 'Immediate (0-2h)', 'Short-term (2-6h)', 'Medium-term (6-24h)', 'Preventive (ongoing)'];
  const filtered = filter === 'All' ? data.actions : data.actions.filter(a => a.timeframe === filter);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'linear-gradient(135deg,rgba(10,16,32,0.98),rgba(15,26,52,0.95))', border: `1px solid ${levelColor}22`, borderRadius: '18px', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: levelColor, boxShadow: `0 0 8px ${levelColor}` }} />
            AI Intervention Action Plan
          </div>
          <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px' }}>{data.location} · {data.total_actions} actions · {data.auto_triggered} auto-triggered</div>
        </div>
        <div style={{ padding: '4px 12px', background: `${levelColor}18`, border: `1px solid ${levelColor}30`, borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: levelColor }}>
          {data.intervention_level}
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {timeframes.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            style={{ padding: '3px 10px', fontSize: '10px', fontWeight: 700, borderRadius: '20px', border: '1px solid', cursor: 'pointer', borderColor: filter === t ? '#38BDF8' : 'rgba(255,255,255,0.08)', background: filter === t ? 'rgba(56,189,248,0.15)' : 'transparent', color: filter === t ? '#38BDF8' : '#475569', transition: 'all 0.15s' }}>
            {t === 'All' ? `All (${data.actions.length})` : t.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Actions list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '320px', paddingRight: '4px' }}>
        <AnimatePresence>
          {filtered.map((action, i) => {
            const ss = STATUS_STYLE[action.status] || STATUS_STYLE['ROUTINE'];
            return (
              <motion.div key={action.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}
                style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.06)`, borderLeft: `3px solid ${action.color || '#38BDF8'}`, borderRadius: '0 10px 10px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flex: 1 }}>
                    <span style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '4px', background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, fontWeight: 800, textTransform: 'uppercase', flexShrink: 0 }}>{action.status}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#F1F5F9', lineHeight: 1.3 }}>{action.action}</span>
                  </div>
                  <span style={{ fontSize: '9px', color: '#334155', flexShrink: 0, fontFamily: 'monospace' }}>{action.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px', gap: '8px', flexWrap: 'wrap' }}>
                  <span>🏢 {action.department}</span>
                  <span style={{ color: '#38BDF8' }}>↗ {action.impact}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

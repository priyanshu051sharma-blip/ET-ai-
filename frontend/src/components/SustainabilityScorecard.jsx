import React from 'react';
import { motion } from 'framer-motion';

const SDG_GOALS = [
  { num: '3',  name: 'Good Health',        desc: 'Air monitoring saves lives',          color: '#4C9F38' },
  { num: '6',  name: 'Clean Water',         desc: 'Real-time reservoir safety',           color: '#26BDE2' },
  { num: '11', name: 'Sustainable Cities',  desc: 'Smart sensor urban networks',          color: '#FD9D24' },
  { num: '13', name: 'Climate Action',      desc: 'Predictive environmental analytics',   color: '#3F7E44' },
];

function AnimatedBar({ pct, color, delay = 0 }) {
  return (
    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.2, delay, ease: 'easeOut' }}
        style={{ height: '100%', background: `linear-gradient(90deg, ${color}, ${color}cc)`, borderRadius: '4px', boxShadow: `0 0 8px ${color}44` }}
      />
    </div>
  );
}

export default function SustainabilityScorecard() {
  const overallScore = 78;
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const strokeLen = (overallScore / 100) * circ;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.95) 100%)',
        border: '1px solid rgba(56,189,248,0.12)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        minHeight: '340px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            Sustainability & ESG Scorecard
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Corporate SDG alignment & resource indices</div>
        </div>

        {/* Circular score gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <svg width="72" height="72">
            <defs>
              <filter id="score-glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <motion.circle
              cx="36" cy="36" r={radius}
              fill="none"
              stroke="#10B981"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${strokeLen} ${circ}`}
              strokeDashoffset={circ * 0.25}
              transform="rotate(-90 36 36)"
              filter="url(#score-glow)"
              initial={{ strokeDasharray: `0 ${circ}` }}
              animate={{ strokeDasharray: `${strokeLen} ${circ}` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
            <text x="36" y="39" textAnchor="middle" fill="#10B981" fontSize="13" fontWeight="800" fontFamily="monospace">{overallScore}</text>
          </svg>
          <span style={{ fontSize: '9px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>ESG Score</span>
        </div>
      </div>

      {/* Footprint metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {[
          { label: 'Carbon Footprint', val: '412 tCO2e', sub: '↓ 12% vs last month', ok: true },
          { label: 'Energy Load',      val: '84.2 MWh',  sub: '62% Renewable Share',  ok: true },
          { label: 'Water Consumed',   val: '12,400 L',  sub: 'Recycled: 42%',         ok: true },
          { label: 'Waste Recycling',  val: '88.5%',     sub: 'Target: 95.0%',          ok: false },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
            }}
          >
            <div style={{ fontSize: '9px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.label}</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#F8FAFC', fontFamily: 'monospace' }}>{m.val}</div>
            <div style={{ fontSize: '10px', color: m.ok ? '#10B981' : '#F59E0B', fontWeight: '600' }}>{m.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ESG bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
        {[
          { label: 'Environmental Score (E)', val: 82, color: '#10B981' },
          { label: 'Carbon Reduction Progress', val: 68, color: '#0EA5E9' },
        ].map((bar, i) => (
          <div key={bar.label} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ color: '#94A3B8' }}>{bar.label}</span>
              <span style={{ fontWeight: '700', color: bar.color, fontFamily: 'monospace' }}>{bar.val}%</span>
            </div>
            <AnimatedBar pct={bar.val} color={bar.color} delay={i * 0.2 + 0.5} />
          </div>
        ))}
      </div>

      {/* SDG Grid */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
        <div style={{ fontSize: '9px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
          UN SDG Alignment
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {SDG_GOALS.map((g, i) => (
            <motion.div
              key={g.num}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 + 0.8 }}
              whileHover={{ scale: 1.03 }}
              style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
            >
              <div style={{
                width: '28px', height: '28px', borderRadius: '6px',
                background: g.color,
                color: '#fff', fontSize: '13px', fontWeight: '900',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 0 10px ${g.color}44`,
              }}>
                {g.num}
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#F1F5F9' }}>{g.name}</div>
                <div style={{ fontSize: '9px', color: '#64748B' }}>{g.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

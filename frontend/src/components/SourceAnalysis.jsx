import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';

const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15,23,42,0.95)',
        border: '1px solid rgba(56,189,248,0.2)',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '13px',
        color: '#F8FAFC',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ fontWeight: '700', color: COLORS[payload[0].name] || '#38BDF8' }}>
          {payload[0].payload.name}
        </div>
        <div style={{ color: '#94A3B8', marginTop: '2px' }}>{payload[0].value}% share</div>
      </div>
    );
  }
  return null;
};

export default function SourceAnalysis({ data, explanation }) {
  const [activeIdx, setActiveIdx] = useState(null);

  const chartData = data ? data.map(item => ({
    name: item.source,
    value: item.percentage,
  })) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
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
      <div>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8', boxShadow: '0 0 8px #38BDF8' }} />
          Pollution Source Analysis
        </div>
        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          AI-driven sector attribution breakdown
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* 3D-effect Donut Chart */}
        <div style={{ flex: '1 1 180px', height: '180px', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                onMouseEnter={(_, idx) => setActiveIdx(idx)}
                onMouseLeave={() => setActiveIdx(null)}
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    opacity={activeIdx === null || activeIdx === index ? 1 : 0.4}
                    style={{ filter: activeIdx === index ? `drop-shadow(0 0 8px ${COLORS[index]})` : 'none', transition: 'all 0.2s' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{ fontSize: '9px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Source</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#38BDF8' }}>AI</div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {chartData.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              onMouseEnter={() => setActiveIdx(idx)}
              onMouseLeave={() => setActiveIdx(null)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '12px', cursor: 'default',
                opacity: activeIdx === null || activeIdx === idx ? 1 : 0.4,
                transition: 'opacity 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F1F5F9' }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '2px',
                  backgroundColor: COLORS[idx % COLORS.length],
                  flexShrink: 0,
                  boxShadow: activeIdx === idx ? `0 0 8px ${COLORS[idx]}` : 'none',
                  transition: 'box-shadow 0.2s',
                }} />
                {item.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Mini bar */}
                <div style={{ width: '50px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    style={{ height: '100%', background: COLORS[idx % COLORS.length], borderRadius: '2px' }}
                  />
                </div>
                <span style={{ fontWeight: '700', color: COLORS[idx % COLORS.length], fontFamily: 'monospace', minWidth: '36px', textAlign: 'right' }}>
                  {item.value}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Explanation */}
      <div style={{
        background: 'rgba(56,189,248,0.06)',
        border: '1px solid rgba(56,189,248,0.15)',
        borderLeft: '3px solid #38BDF8',
        borderRadius: '0 10px 10px 0',
        padding: '12px 16px',
        fontSize: '12.5px',
        lineHeight: 1.6,
        color: 'rgba(148,163,184,0.9)',
      }}>
        <div style={{ fontWeight: '700', fontSize: '10px', color: '#38BDF8', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.1em' }}>
          ✦ Agentic Core Observation
        </div>
        <em>"{explanation || 'Analyzing local pollutant variables…'}"</em>
      </div>
    </motion.div>
  );
}

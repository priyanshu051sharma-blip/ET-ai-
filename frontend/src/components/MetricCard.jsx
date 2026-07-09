import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function MetricCard({ label, value, unit, status, min, max }) {
  const isSafe = status === 'SAFE';
  const [displayValue, setDisplayValue] = useState(0);
  const animRef = useRef(null);

  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;

  // Count-up animation whenever value changes
  useEffect(() => {
    let start = null;
    const duration = 900;
    const target = numericValue;
    cancelAnimationFrame(animRef.current);

    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(eased * target);
      if (progress < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [numericValue]);

  let rangeText = null;
  if (min !== undefined && max !== undefined) rangeText = `${min}–${max}`;
  else if (min !== undefined) rangeText = `≥ ${min}`;
  else if (max !== undefined) rangeText = `≤ ${max}`;

  const isInteger = Number.isInteger(numericValue);
  const formattedVal = typeof value === 'number'
    ? (isInteger ? Math.round(displayValue).toString() : displayValue.toFixed(1))
    : value ?? '—';

  const safeColor = '#10B981';
  const unsafeColor = '#EF4444';
  const statusColor = isSafe ? safeColor : unsafeColor;

  // Determine percentage for ring (heuristic)
  let ringPct = 0;
  if (max !== undefined) ringPct = Math.min(numericValue / max, 1);
  else if (min !== undefined) ringPct = Math.min(numericValue / (min * 2), 1);
  else ringPct = 0.6;

  const ringSize = 46;
  const ringRadius = 18;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringStroke = ringPct * ringCirc;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.02 }}
      style={{
        background: 'linear-gradient(145deg, rgba(10,16,32,0.99) 0%, rgba(15,23,42,0.97) 60%, rgba(20,30,55,0.95) 100%)',
        border: `1px solid ${isSafe ? 'rgba(16,185,129,0.22)' : 'rgba(239,68,68,0.22)'}`,
        borderRadius: '16px',
        padding: '18px',
        boxShadow: `0 6px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 20px ${isSafe ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        minHeight: '140px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Glow orb */}
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '80px', height: '80px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${statusColor}22 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Top row: label + ring */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          fontSize: '10px',
          fontWeight: '700',
          color: 'rgba(148,163,184,0.8)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          lineHeight: 1.2,
          maxWidth: '70%',
        }}>
          {label}
        </div>

        {/* SVG ring indicator */}
        <svg width={ringSize} height={ringSize} style={{ flexShrink: 0 }}>
          <defs>
            <filter id={`ring-glow-${label.replace(/\s/g, '')}`}>
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <circle cx={ringSize / 2} cy={ringSize / 2} r={ringRadius}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
          <circle cx={ringSize / 2} cy={ringSize / 2} r={ringRadius}
            fill="none"
            stroke={statusColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={`${ringStroke} ${ringCirc}`}
            strokeDashoffset={ringCirc * 0.25}
            transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
            filter={`url(#ring-glow-${label.replace(/\s/g, '')})`}
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
      </div>

      {/* Value */}
      <div style={{
        fontSize: '30px',
        fontWeight: '800',
        color: '#F8FAFC',
        fontFamily: "'JetBrains Mono', monospace",
        lineHeight: 1,
        letterSpacing: '-1px',
        display: 'flex',
        alignItems: 'baseline',
        gap: '4px',
      }}>
        {formattedVal}
        {unit && (
          <span style={{ fontSize: '13px', fontWeight: '400', color: 'rgba(148,163,184,0.7)', fontFamily: 'sans-serif' }}>
            {unit}
          </span>
        )}
      </div>

      {/* Status row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '8px',
        marginTop: 'auto',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          color: statusColor,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            backgroundColor: statusColor,
            boxShadow: `0 0 6px ${statusColor}`,
            display: 'inline-block',
            animation: 'statusPulse 2s infinite',
          }} />
          {isSafe ? 'Normal' : 'Alert'}
        </span>
        {rangeText && (
          <span style={{ fontSize: '10px', color: 'rgba(148,163,184,0.5)', fontFamily: 'monospace' }}>
            {rangeText}
          </span>
        )}
      </div>

      <style>{`
        @keyframes statusPulse {
          0%, 100% { box-shadow: 0 0 4px currentColor; opacity: 1; }
          50% { box-shadow: 0 0 10px currentColor; opacity: 0.7; }
        }
      `}</style>
    </motion.div>
  );
}

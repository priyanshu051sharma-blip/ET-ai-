import React, { useEffect, useRef, useState } from 'react';

/**
 * AnimatedGauge — SVG-based animated arc gauge with count-up animation.
 */
export default function AnimatedGauge({ value = 0, max = 100, size = 110, label = '', color = '#38BDF8', unit = '' }) {
  const [displayVal, setDisplayVal] = useState(0);
  const animRef = useRef(null);

  const radius = (size / 2) - 10;
  const circumference = 2 * Math.PI * radius;
  const strokeLength = (Math.min(value, max) / max) * circumference * 0.75; // 270° arc
  const gapOffset = circumference * 0.25 / 2; // center the gap at the bottom

  // Count-up animation
  useEffect(() => {
    let start = null;
    const duration = 1200;
    const target = value;
    cancelAnimationFrame(animRef.current);

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayVal(Math.round(eased * target));
      if (progress < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [value]);

  const cx = size / 2;
  const cy = size / 2;

  // Arc path helper
  const describeArc = (percent) => {
    const angle = percent * 270 - 135; // -135 to +135 degrees
    const rads = (angle * Math.PI) / 180;
    const x = cx + radius * Math.cos(rads);
    const y = cy + radius * Math.sin(rads);
    return { x, y };
  };

  const startPt = describeArc(0);
  const endPt = describeArc(Math.min(value, max) / max);

  const largeArc = (Math.min(value, max) / max) * 270 > 180 ? 1 : 0;

  const startAngleDeg = -135;
  const endAngleDeg = -135 + (Math.min(value, max) / max) * 270;

  const toRad = (d) => (d * Math.PI) / 180;
  const sx = cx + radius * Math.cos(toRad(startAngleDeg));
  const sy = cy + radius * Math.sin(toRad(startAngleDeg));
  const ex = cx + radius * Math.cos(toRad(endAngleDeg));
  const ey = cy + radius * Math.sin(toRad(endAngleDeg));

  const trackStart = { x: sx, y: sy };
  const trackEnd = { x: cx + radius * Math.cos(toRad(135)), y: cy + radius * Math.sin(toRad(135)) };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        {/* Glow filter */}
        <defs>
          <filter id={`glow-${label}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track (background arc) */}
        <path
          d={`M ${sx} ${sy} A ${radius} ${radius} 0 1 1 ${trackEnd.x} ${trackEnd.y}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Value arc */}
        {value > 0 && (
          <path
            d={`M ${sx} ${sy} A ${radius} ${radius} 0 ${largeArc} 1 ${ex} ${ey}`}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            filter={`url(#glow-${label})`}
            style={{
              transition: 'stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease',
            }}
          />
        )}

        {/* Center value text */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={size * 0.2}
          fontWeight="800"
          fontFamily="'JetBrains Mono', monospace"
        >
          {displayVal}
        </text>
        <text
          x={cx}
          y={cy + size * 0.14}
          textAnchor="middle"
          fill="rgba(148,163,184,0.9)"
          fontSize={size * 0.1}
          fontFamily="sans-serif"
        >
          {unit}
        </text>
      </svg>
      <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(148,163,184,0.8)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  );
}

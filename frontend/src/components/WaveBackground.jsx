import React, { useRef, useEffect } from 'react';

export default function WaveBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    let frameId;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const cols = 28, rows = 14;
      const cellW = W / cols, cellH = H / rows;

      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        for (let c = 0; c <= cols; c++) {
          const x = c * cellW;
          const y = r * cellH + Math.sin((c / cols) * Math.PI * 2 + t) * 7 + Math.sin((r / rows) * Math.PI + t * 0.7) * 3;
          c === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(56,189,248,${0.02 + (r / rows) * 0.035})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      for (let c = 0; c <= cols; c++) {
        ctx.beginPath();
        for (let r = 0; r <= rows; r++) {
          const x = c * cellW;
          const y = r * cellH + Math.sin((c / cols) * Math.PI * 2 + t) * 7 + Math.sin((r / rows) * Math.PI + t * 0.7) * 3;
          r === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(56,189,248,${0.015 + (c / cols) * 0.018})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }

      // Ambient glow orbs
      [
        [W * 0.15, H * 0.3, 200, 'rgba(14,165,233,0.045)'],
        [W * 0.82, H * 0.65, 260, 'rgba(129,140,248,0.03)'],
        [W * 0.5,  H * 0.05, 160, 'rgba(56,189,248,0.04)'],
      ].forEach(([ox, oy, or_, oc]) => {
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, or_);
        g.addColorStop(0, oc); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(ox - or_, oy - or_, or_ * 2, or_ * 2);
      });

      t += 0.005;
      frameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',   /* NEVER intercept mouse/touch */
        zIndex: 0,
        display: 'block',
      }}
    />
  );
}

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Globe3D from './Globe3D';

function CountUp({ target }) {
  const [val, setVal] = useState(0);
  const parsed = parseInt(String(target).replace(/\D/g, '')) || 0;
  useEffect(() => {
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1800, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * parsed));
      if (p < 1) requestAnimationFrame(step);
    };
    const t = setTimeout(() => requestAnimationFrame(step), 700);
    return () => clearTimeout(t);
  }, [parsed]);
  const s = String(target);
  if (s.includes('K')) return <>{Math.floor(val / 1000)}K+</>;
  if (s.includes('%')) return <>{val}%</>;
  if (s.includes('-')) return <>{s}</>;
  return <>{val}</>;
}

const AIR_FEATURES = [
  { icon: '🗺️', title: 'Ward-Level Hotspot Map',   desc: 'Interactive GIS map with real-time AQI overlays, pollution hotspots coloured by severity.' },
  { icon: '🔍', title: 'Pollution Source Attribution', desc: 'AI identifies traffic, construction, industrial and burning contributions per area.' },
  { icon: '🔮', title: '24–72h AQI Prediction',    desc: 'LSTM & Random Forest models forecast hyperlocal AQI using weather, traffic and seasonal patterns.' },
  { icon: '⚡', title: 'Auto Intervention Engine', desc: 'Recommends restrict-vehicles, pause-construction, water-sprinkling and inspection actions.' },
  { icon: '🏥', title: 'Citizen Health Advisory',  desc: 'Generates personalised alerts for schools, hospitals and vulnerable groups.' },
  { icon: '🤖', title: 'AI Authority Chatbot',     desc: 'Ask "Why is AQI rising in Ward 12?" — get AI answers backed by live sensor data.' },
];

const WATER_FEATURES = [
  { icon: '💧', title: 'Real-Time WQI Monitoring',  desc: 'pH, TDS, turbidity, DO and chlorine tracked live across 18 water body sensor nodes.' },
  { icon: '🛡️', title: 'XGBoost Safety Classifier', desc: 'Instant SAFE / UNSAFE verdict with contamination probability and threshold breach reasons.' },
  { icon: '🧪', title: 'Chemical Spill Simulation',  desc: 'Inject anomalies to test AI response — drop pH, spike TDS and watch alerts fire.' },
  { icon: '📊', title: 'WQI Trend Analytics',        desc: 'Multi-hour WQI trend charts with safe-range reference lines and historical comparisons.' },
  { icon: '🔬', title: 'Water ML Sandbox',           desc: 'Manually tune pH, DO, turbidity sliders to run classifier predictions against trained models.' },
  { icon: '📋', title: 'Compliance Reports',         desc: 'Auto-generate EPA regulatory compliance documents and ESG scorecards as CSV or PDF.' },
];

export default function LandingPage({ onEnterAir, onEnterWater }) {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div style={{ minHeight: '100vh', background: '#020c1b', color: '#F8FAFC', fontFamily: "'Inter',sans-serif", overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(2,12,27,0.88)', borderBottom: '1px solid rgba(56,189,248,0.12)',
        backdropFilter: 'blur(18px)', padding: '0 48px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <motion.div animate={{ rotateY: [0,15,-15,0] }} transition={{ duration: 5, repeat: Infinity }}
            style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'linear-gradient(135deg,#0ea5e9,#0f3b6f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', boxShadow: '0 0 18px rgba(56,189,248,0.4)' }}>
            🌍
          </motion.div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, background: 'linear-gradient(90deg,#38BDF8,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EcoSphere AI</div>
            <div style={{ fontSize: '8px', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Environmental Intelligence Platform</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '28px', fontSize: '12px' }}>
          {['Features', 'Technology', 'About'].map(t => (
            <a key={t} href={`#${t.toLowerCase()}`} style={{ color: '#64748B', textDecoration: 'none', transition: 'color 0.15s', fontWeight: 500 }}
              onMouseOver={e => e.target.style.color = '#38BDF8'} onMouseOut={e => e.target.style.color = '#64748B'}>{t}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <motion.button onClick={onEnterAir} whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(56,189,248,0.45)' }} whileTap={{ scale: 0.97 }}
            style={{ padding: '8px 18px', background: 'linear-gradient(135deg,#0ea5e9,#38BDF8)', color: '#020c1b', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
            🌫️ AirSense AI
          </motion.button>
          <motion.button onClick={onEnterWater} whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(52,211,153,0.45)' }} whileTap={{ scale: 0.97 }}
            style={{ padding: '8px 18px', background: 'linear-gradient(135deg,#059669,#34D399)', color: '#020c1b', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
            💧 AquaGuard AI
          </motion.button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 48px 0', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(56,189,248,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,0.035) 1px,transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center', maxWidth: '1200px', width: '100%', position: 'relative', zIndex: 1 }}>

          {/* Left */}
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '20px', fontSize: '10px', fontWeight: 700, color: '#38BDF8', marginBottom: '22px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              <motion.span animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              ET AI Hackathon · Problem Statement 5
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ fontSize: '54px', fontWeight: 900, lineHeight: 1.05, marginBottom: '20px', letterSpacing: '-2px' }}>
              Intelligent Urban<br />
              <span style={{ background: 'linear-gradient(135deg,#38BDF8,#818cf8,#34D399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Environment AI
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.75, marginBottom: '32px', maxWidth: '460px' }}>
              Dual-platform AI system for urban air quality intelligence and water safety monitoring. Predict pollution, identify sources, recommend interventions — in real time.
            </motion.p>

            {/* Platform cards */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              style={{ display: 'flex', gap: '14px', marginBottom: '40px' }}>
              {[
                { label: 'AirSense AI', sub: 'Urban Air Quality Intelligence', icon: '🌫️', color: '#38BDF8', grad: 'linear-gradient(135deg,#0ea5e9,#38BDF8)', onClick: onEnterAir },
                { label: 'AquaGuard AI', sub: 'Water Safety Monitoring', icon: '💧', color: '#34D399', grad: 'linear-gradient(135deg,#059669,#34D399)', onClick: onEnterWater },
              ].map(card => (
                <motion.button key={card.label} onClick={card.onClick}
                  whileHover={{ scale: 1.04, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ flex: 1, padding: '18px', background: `${card.color}12`, border: `1px solid ${card.color}30`, borderRadius: '14px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{card.icon}</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#F8FAFC', marginBottom: '3px' }}>{card.label}</div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>{card.sub}</div>
                  <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: card.grad, borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: '#020c1b' }}>
                    Launch →
                  </div>
                </motion.button>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              style={{ display: 'flex', gap: '28px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { value: '18', label: 'Sensor Nodes', color: '#38BDF8' },
                { value: '18K+', label: 'Data Records', color: '#34D399' },
                { value: '7-Day', label: 'AI Forecasts', color: '#818CF8' },
                { value: '99%', label: 'Uptime', color: '#F472B6' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: s.color, fontFamily: 'monospace', letterSpacing: '-1px' }}><CountUp target={s.value} /></div>
                  <div style={{ fontSize: '9px', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '3px' }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Globe */}
          <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(56,189,248,0.07) 0%,transparent 70%)', animation: 'orbPulse 3s ease-in-out infinite' }} />
            <Globe3D size={340} />
            {[
              { label: 'AQI Delhi', val: '187', color: '#EF4444', top: '8%', left: '-4%' },
              { label: 'WQI Ganga', val: '68', color: '#F59E0B', top: '15%', right: '-5%' },
              { label: 'PM2.5', val: '42µg', color: '#38BDF8', bottom: '22%', left: '-2%' },
              { label: 'Live Nodes', val: '18 🟢', color: '#34D399', bottom: '12%', right: '-4%' },
            ].map((p, i) => (
              <motion.div key={p.label} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 + i * 0.12 }}
                style={{ position: 'absolute', ...p, background: 'rgba(4,11,26,0.92)', border: `1px solid ${p.color}44`, borderRadius: '10px', padding: '7px 13px', backdropFilter: 'blur(12px)', boxShadow: `0 0 14px ${p.color}20` }}>
                <div style={{ fontSize: '8px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{p.label}</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: p.color, fontFamily: 'monospace' }}>{p.val}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PLATFORM SECTIONS ── */}
      <section id="features" style={{ padding: '100px 48px 0', maxWidth: '1200px', margin: '0 auto' }}>

        {/* AirSense AI */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg,#0ea5e9,#38BDF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 0 20px rgba(56,189,248,0.4)' }}>🌫️</div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#F8FAFC', letterSpacing: '-0.5px' }}>AirSense AI</div>
              <div style={{ fontSize: '12px', color: '#38BDF8', fontWeight: 600 }}>Intelligent Urban Air Quality Prediction & Decision Support</div>
            </div>
            <motion.button onClick={onEnterAir} whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(56,189,248,0.5)' }} whileTap={{ scale: 0.97 }}
              style={{ marginLeft: 'auto', padding: '10px 24px', background: 'linear-gradient(135deg,#0ea5e9,#38BDF8)', color: '#020c1b', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
              Open AirSense →
            </motion.button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            {AIR_FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                whileHover={{ y: -5, borderColor: 'rgba(56,189,248,0.3)', boxShadow: '0 16px 48px rgba(56,189,248,0.1)' }}
                style={{ background: 'linear-gradient(135deg,rgba(10,20,42,0.9),rgba(14,26,56,0.85))', border: '1px solid rgba(56,189,248,0.1)', borderRadius: '14px', padding: '22px 20px', transition: 'all 0.22s' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{f.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', marginBottom: '6px' }}>{f.title}</div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,rgba(56,189,248,0.2),transparent)', margin: '0 0 80px' }} />

        {/* AquaGuard AI */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg,#059669,#34D399)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 0 20px rgba(52,211,153,0.4)' }}>💧</div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#F8FAFC', letterSpacing: '-0.5px' }}>AquaGuard AI</div>
              <div style={{ fontSize: '12px', color: '#34D399', fontWeight: 600 }}>Real-Time Water Safety Intelligence & Contamination Detection</div>
            </div>
            <motion.button onClick={onEnterWater} whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(52,211,153,0.5)' }} whileTap={{ scale: 0.97 }}
              style={{ marginLeft: 'auto', padding: '10px 24px', background: 'linear-gradient(135deg,#059669,#34D399)', color: '#020c1b', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
              Open AquaGuard →
            </motion.button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            {WATER_FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                whileHover={{ y: -5, borderColor: 'rgba(52,211,153,0.3)', boxShadow: '0 16px 48px rgba(52,211,153,0.08)' }}
                style={{ background: 'linear-gradient(135deg,rgba(5,20,18,0.9),rgba(8,30,24,0.85))', border: '1px solid rgba(52,211,153,0.1)', borderRadius: '14px', padding: '22px 20px', transition: 'all 0.22s' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{f.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', marginBottom: '6px' }}>{f.title}</div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Tech Stack ── */}
      <section id="technology" style={{ padding: '60px 48px', background: 'rgba(56,189,248,0.03)', borderTop: '1px solid rgba(56,189,248,0.08)', borderBottom: '1px solid rgba(56,189,248,0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '24px' }}>Powered By</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {['React 19 + Vite', 'FastAPI + Python', 'XGBoost + Random Forest', 'Google Gemini 2.5', 'Leaflet GIS', 'OpenWeatherMap API', 'Framer Motion', 'Recharts'].map(tech => (
              <div key={tech} style={{ padding: '8px 16px', background: 'rgba(56,189,248,0.07)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '8px', fontSize: '12px', color: '#38BDF8', fontWeight: 600 }}>
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: '80px 48px 100px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center,rgba(56,189,248,0.05) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} style={{ maxWidth: '640px', margin: '0 auto', position: 'relative' }}>
          <h2 style={{ fontSize: '38px', fontWeight: 900, marginBottom: '14px', letterSpacing: '-1.5px' }}>Select your platform</h2>
          <p style={{ color: '#475569', fontSize: '14px', marginBottom: '36px', lineHeight: 1.75 }}>
            Both platforms run on the same backend — switch between air quality intelligence and water safety monitoring seamlessly.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <motion.button onClick={onEnterAir} whileHover={{ scale: 1.05, boxShadow: '0 0 48px rgba(56,189,248,0.5)' }} whileTap={{ scale: 0.97 }}
              style={{ padding: '14px 36px', background: 'linear-gradient(135deg,#0ea5e9,#38BDF8)', color: '#020c1b', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🌫️ Launch AirSense AI
            </motion.button>
            <motion.button onClick={onEnterWater} whileHover={{ scale: 1.05, boxShadow: '0 0 48px rgba(52,211,153,0.5)' }} whileTap={{ scale: 0.97 }}
              style={{ padding: '14px 36px', background: 'linear-gradient(135deg,#059669,#34D399)', color: '#020c1b', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💧 Launch AquaGuard AI
            </motion.button>
          </div>
        </motion.div>
      </section>

      <style>{`
        @keyframes orbPulse { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.06);opacity:1} }
      `}</style>
    </div>
  );
}

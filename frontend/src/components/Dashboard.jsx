import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import MetricCard from './MetricCard';
import Chart from './Chart';
import GisMap from './GisMap';
import SourceAnalysis from './SourceAnalysis';
import RecommendationsList from './RecommendationsList';
import SustainabilityScorecard from './SustainabilityScorecard';
import SensorHealthMonitor from './SensorHealthMonitor';
import AdminPanel from './AdminPanel';
import ChatWidget from './ChatWidget';
import MlSandbox from './MlSandbox';
import Globe3D from './Globe3D';
import {
  fetchLocations, fetchLatestReadings, fetchSummary,
  fetchForecast, fetchSourceAnalysis, fetchRecommendations,
  fetchSensorHealth, fetchAiInsights, sendChatMessage
} from '../data/api';

const TABS = [
  { id: 'overview',   label: 'Overview & GIS',     icon: '🌍' },
  { id: 'sandbox',    label: 'ML Sandbox',          icon: '🧠' },
  { id: 'analytics',  label: 'Telemetry Analytics', icon: '📊' },
  { id: 'telemetry',  label: 'Sensor Database',     icon: '🎛️' },
  { id: 'safety',     label: 'Safety & Controls',   icon: '🚨' },
];

export default function Dashboard({ onGoHome }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('Sector A');
  const [readings, setReadings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [sourceData, setSourceData] = useState({ sources: [], explanation: '' });
  const [recommendations, setRecommendations] = useState([]);
  const [sensorHealth, setSensorHealth] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [embeddedChat, setEmbeddedChat] = useState([
    { role: 'assistant', text: 'Ask me anything about EcoSphere\'s monitored sectors, AI forecasts, or active alerts.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const loadNetworkData = async () => {
    try {
      const [locRes, healthRes, insightsRes] = await Promise.all([
        fetchLocations(), fetchSensorHealth(), fetchAiInsights()
      ]);
      setLocations(locRes.locations);
      setSensorHealth(healthRes);
      setAiInsights(insightsRes);
    } catch (err) {
      setError('Cannot connect to the backend server. Verify FastAPI is running on port 8000.');
    }
  };

  const loadLocationData = async (loc) => {
    const [latestReadings, dataSummary, forecastData, sourceAnalysis, recsList] = await Promise.all([
      fetchLatestReadings(loc), fetchSummary(loc), fetchForecast(loc),
      fetchSourceAnalysis(loc), fetchRecommendations(loc)
    ]);
    setReadings(latestReadings);
    setSummary(dataSummary);
    setForecast(forecastData);
    setSourceData(sourceAnalysis);
    setRecommendations(recsList);
  };

  const initLoad = async () => {
    setLoading(true);
    await loadNetworkData();
    await loadLocationData(selectedLocation);
    setLoading(false);
  };

  useEffect(() => {
    initLoad();
    const interval = setInterval(() => {
      loadNetworkData();
      loadLocationData(selectedLocation);
    }, 8000);
    return () => clearInterval(interval);
  }, [selectedLocation]);

  const handleConfigChange = () => { loadNetworkData(); loadLocationData(selectedLocation); };

  const handleEmbeddedChatSend = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setEmbeddedChat(prev => [...prev, { role: 'user', text }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const reply = await sendChatMessage(text, selectedLocation);
      setEmbeddedChat(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setEmbeddedChat(prev => [...prev, { role: 'assistant', text: 'Error communicating with Gemini Core.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const activeAlerts = [];
  locations.forEach(loc => {
    if (loc.aqi_color === 'red')
      activeAlerts.push({ id: `aqi-crit-${loc.name}`, type: 'Critical', msg: `Critical AQI ${loc.current_aqi} at ${loc.name}` });
    else if (loc.aqi_color === 'orange')
      activeAlerts.push({ id: `aqi-warn-${loc.name}`, type: 'Warning', msg: `AQI elevated at ${loc.name}` });
    if (loc.water_status === 'Unsafe/Contaminated')
      activeAlerts.push({ id: `wqi-crit-${loc.name}`, type: 'Critical', msg: `Water contamination at ${loc.name} (WQI ${loc.current_wqi})` });
    if (loc.sensor_status === 'OFFLINE')
      activeAlerts.push({ id: `sen-off-${loc.name}`, type: 'Warning', msg: `Sensor offline at ${loc.name}` });
  });

  // ── Loading screen ──
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '32px',
        background: 'transparent',
      }}>
        <Globe3D size={260} />
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: '18px', fontWeight: '700', color: '#38BDF8', marginBottom: '8px' }}
          >
            EcoSphere AI
          </motion.div>
          <div style={{ fontSize: '13px', color: '#475569' }}>Booting Environmental Intelligence Platform…</div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '16px' }}>
            {[0,1,2].map(i => (
              <motion.div key={i}
                animate={{ scale: [0.6, 1, 0.6], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8' }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error screen ──
  if (error) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#020817',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            maxWidth: '440px', padding: '32px',
            background: 'rgba(30,41,59,0.9)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderLeft: '4px solid #EF4444',
            borderRadius: '16px',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ fontWeight: '700', color: '#EF4444', marginBottom: '8px', fontSize: '16px' }}>⚠️ Core API Error</div>
          <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px' }}>{error}</p>
          <button onClick={initLoad} style={{
            padding: '10px 20px', fontSize: '13px', fontWeight: '700',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            background: 'linear-gradient(135deg, #38BDF8, #0ea5e9)', color: '#0F172A',
          }}>
            Reconnect
          </button>
        </motion.div>
      </div>
    );
  }

  const latestReading = readings[readings.length - 1] ?? null;

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', isolation: 'isolate' }}>
      <Header
        lastUpdated={latestReading?.timestamp}
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
        locations={locations}
        activeAlertsCount={activeAlerts.length}
        onGoHome={onGoHome}
        sensorHealth={sensorHealth}
      />

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Sidebar */}
        <aside style={{
          width: '220px', flexShrink: 0,
          background: 'linear-gradient(180deg, #020c1b 0%, #050f1e 100%)',
          borderRight: '1px solid rgba(56,189,248,0.08)',
          padding: '20px 12px',
          display: 'flex', flexDirection: 'column', gap: '4px',
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}>
          <div style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', color: '#334155', paddingLeft: '10px', marginBottom: '8px', letterSpacing: '0.1em' }}>
            Navigation
          </div>
          {TABS.map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', textAlign: 'left',
                padding: '10px 12px', border: 'none', borderRadius: '10px',
                cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                background: activeTab === tab.id ? 'rgba(56,189,248,0.12)' : 'transparent',
                color: activeTab === tab.id ? '#38BDF8' : '#64748B',
                borderLeft: activeTab === tab.id ? '2px solid #38BDF8' : '2px solid transparent',
                transition: 'color 0.15s, background 0.15s',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <span>{tab.icon}</span> {tab.label}
            </motion.button>
          ))}

          {/* System status */}
          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '9px', color: '#334155', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>System</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10B981' }}>
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }}
              />
              API Connected
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: activeAlerts.length > 0 ? '#EF4444' : '#10B981' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: activeAlerts.length > 0 ? '#EF4444' : '#10B981' }} />
              {activeAlerts.length > 0 ? `${activeAlerts.length} Alert(s)` : 'Nominal'}
            </div>
            <div style={{ fontSize: '10px', color: '#334155', marginTop: '4px' }}>
              {locations.length} sectors monitored
            </div>
          </div>
        </aside>

        {/* Main workspace */}
        <main style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', height: 'calc(100vh - 64px)', background: 'transparent', position: 'relative' }}>

          {/* KPI Row */}
          {latestReading && summary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: '12px' }}>
              <MetricCard label="Eco Score" value={summary.environmental_score} unit="/100" status={summary.environmental_score >= 75 ? 'SAFE' : 'UNSAFE'} min={75} />
              <MetricCard label="Air Quality (AQI)" value={latestReading.AQI} unit="" status={latestReading.AQI <= 100 ? 'SAFE' : 'UNSAFE'} max={100} />
              <MetricCard label="Water Quality" value={latestReading.WQI} unit="" status={latestReading.water_status === 'SAFE' ? 'SAFE' : 'UNSAFE'} min={70} />
              <MetricCard label="Air Temp" value={latestReading.air_temperature} unit="°C" status="SAFE" />
              <MetricCard label="Humidity" value={latestReading.humidity} unit="%" status="SAFE" />
              <MetricCard label="Active Alerts" value={activeAlerts.length} unit="" status={activeAlerts.length === 0 ? 'SAFE' : 'UNSAFE'} max={0} />
            </div>
          )}

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >

              {/* ── OVERVIEW TAB ── */}
              {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '20px' }}>
                  <GisMap locations={locations} selectedLocation={selectedLocation} onSelectLocation={setSelectedLocation} />

                  {/* Globe + AI Chat panel */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* 3D Globe widget */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{
                        background: 'radial-gradient(ellipse at 50% 50%, rgba(10,22,40,0.95), rgba(2,8,23,0.98))',
                        border: '1px solid rgba(56,189,248,0.15)',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.1em', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8', boxShadow: '0 0 8px #38BDF8', display: 'inline-block' }} />
                        Global Environmental Twin
                      </div>
                      <Globe3D size={220} />
                      <div style={{ fontSize: '10px', color: '#334155', textAlign: 'center' }}>
                        Real-time geospatial telemetry layer
                      </div>
                    </motion.div>

                    {/* Embedded AI Chat */}
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.95))',
                      border: '1px solid rgba(56,189,248,0.12)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      display: 'flex', flexDirection: 'column',
                      flex: 1, minHeight: '240px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }}>
                      <div style={{ background: 'rgba(56,189,248,0.06)', borderBottom: '1px solid rgba(56,189,248,0.12)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🤖</span>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#F8FAFC' }}>AI Assistant</div>
                          <div style={{ fontSize: '9px', color: '#475569' }}>Monitoring {selectedLocation}</div>
                        </div>
                      </div>
                      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {embeddedChat.map((msg, idx) => (
                          <motion.div key={idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                              maxWidth: '88%', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', lineHeight: 1.5,
                              background: msg.role === 'user' ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.05)',
                              color: msg.role === 'user' ? '#38BDF8' : '#94A3B8',
                              border: `1px solid ${msg.role === 'user' ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.06)'}`,
                            }}>
                              {msg.text}
                            </div>
                          </motion.div>
                        ))}
                        {chatLoading && (
                          <div style={{ display: 'flex', gap: '4px', padding: '8px' }}>
                            {[0,1,2].map(i => (
                              <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                                style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#38BDF8' }} />
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px' }}>
                        <input type="text" placeholder="Ask about readings…" value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleEmbeddedChatSend()}
                          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', color: '#fff', outline: 'none' }}
                        />
                        <button onClick={handleEmbeddedChatSend} disabled={chatLoading || !chatInput.trim()}
                          style={{ padding: '7px 14px', fontSize: '12px', fontWeight: '700', border: 'none', borderRadius: '8px', cursor: 'pointer', background: chatInput.trim() ? '#38BDF8' : 'rgba(255,255,255,0.1)', color: chatInput.trim() ? '#0F172A' : '#475569', transition: 'all 0.15s' }}>
                          →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── SANDBOX TAB ── */}
              {activeTab === 'sandbox' && (
                <MlSandbox selectedLocation={selectedLocation} currentTelemetry={latestReading} />
              )}

              {/* ── ANALYTICS TAB ── */}
              {activeTab === 'analytics' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {readings.length > 0 && forecast.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                      <Chart defaultTab="air" historicalData={readings} locationName={selectedLocation} />
                      <Chart defaultTab="water" historicalData={readings} locationName={selectedLocation} />
                      <Chart defaultTab="forecast" forecastData={forecast} locationName={selectedLocation} />
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <SourceAnalysis data={sourceData.sources} explanation={sourceData.explanation} />
                    <RecommendationsList recommendations={recommendations} />
                  </div>
                </div>
              )}

              {/* ── TELEMETRY TAB ── */}
              {activeTab === 'telemetry' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                    {/* Reports */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.95))',
                        border: '1px solid rgba(56,189,248,0.12)',
                        borderRadius: '16px', padding: '24px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        display: 'flex', flexDirection: 'column', gap: '14px',
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8', boxShadow: '0 0 8px #38BDF8' }} />
                        Reports Console
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {['📥 Export CSV','📄 PDF Report'].map((label, i) => (
                          <motion.button key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            style={{ padding: '10px', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: '#38BDF8' }}>
                            {label}
                          </motion.button>
                        ))}
                      </div>
                      {[
                        { title: 'Weekly Operational Audit', desc: '24h avg threshold summary' },
                        { title: 'Monthly ESG Scorecard', desc: 'SDG carbon footprint rates' },
                        { title: 'EPA Regulatory Compliance', desc: 'pH, TDS & PM verification' },
                      ].map((rep, i) => (
                        <motion.div key={i} whileHover={{ x: 4 }}
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#F8FAFC' }}>{rep.title}</div>
                            <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>{rep.desc}</div>
                          </div>
                          <span style={{ color: '#38BDF8', fontSize: '14px' }}>⚡</span>
                        </motion.div>
                      ))}
                    </motion.div>
                    {sensorHealth && <SensorHealthMonitor data={sensorHealth} />}
                  </div>

                  {/* Raw data table */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.95))',
                      border: '1px solid rgba(56,189,248,0.12)',
                      borderRadius: '16px', padding: '24px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8', boxShadow: '0 0 8px #38BDF8' }} />
                          Historical Telemetry Logger
                        </div>
                        <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>Raw sensor data logs — last 15 records</div>
                      </div>
                      <span style={{ fontSize: '10px', background: 'rgba(56,189,248,0.08)', color: '#38BDF8', padding: '4px 10px', borderRadius: '6px', fontFamily: 'monospace', border: '1px solid rgba(56,189,248,0.15)' }}>
                        {readings.length} records
                      </span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            {['Timestamp','AQI','PM2.5','PM10','WQI','pH','TDS','DO','Turbidity'].map(h => (
                              <th key={h} style={{ padding: '10px 12px', fontWeight: '600', color: '#475569', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {readings.slice(-15).reverse().map((r, idx) => (
                            <motion.tr key={idx}
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                              style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                            >
                              <td style={{ padding: '9px 12px', fontFamily: 'monospace', fontSize: '10px', color: '#475569' }}>{new Date(r.timestamp).toLocaleString()}</td>
                              <td style={{ padding: '9px 12px', fontWeight: '700', color: r.AQI > 100 ? '#EF4444' : '#34D399' }}>{r.AQI}</td>
                              <td style={{ padding: '9px 12px', color: '#94A3B8' }}>{r.PM25}</td>
                              <td style={{ padding: '9px 12px', color: '#94A3B8' }}>{r.PM10}</td>
                              <td style={{ padding: '9px 12px', fontWeight: '700', color: r.water_status === 'UNSAFE' ? '#EF4444' : '#34D399' }}>{r.WQI}</td>
                              <td style={{ padding: '9px 12px', color: '#94A3B8' }}>{r.pH}</td>
                              <td style={{ padding: '9px 12px', color: '#94A3B8' }}>{r.TDS}</td>
                              <td style={{ padding: '9px 12px', color: '#94A3B8' }}>{r.DO}</td>
                              <td style={{ padding: '9px 12px', color: '#94A3B8' }}>{r.turbidity}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* ── SAFETY TAB ── */}
              {activeTab === 'safety' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Active Alerts */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.95))',
                        border: activeAlerts.length > 0 ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(16,185,129,0.15)',
                        borderRadius: '16px', padding: '24px',
                        boxShadow: activeAlerts.length > 0 ? '0 8px 32px rgba(239,68,68,0.1)' : '0 8px 32px rgba(0,0,0,0.4)',
                        display: 'flex', flexDirection: 'column', gap: '14px',
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <motion.span animate={activeAlerts.length > 0 ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 1, repeat: Infinity }}>
                          🚨
                        </motion.span>
                        Active Alert Center
                        {activeAlerts.length > 0 && (
                          <span style={{ marginLeft: 'auto', fontSize: '10px', background: 'rgba(239,68,68,0.2)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', padding: '2px 8px', borderRadius: '10px', fontWeight: '800' }}>
                            {activeAlerts.length} ACTIVE
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '260px' }}>
                        {activeAlerts.length === 0 ? (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ textAlign: 'center', color: '#10B981', padding: '40px 0', fontSize: '13px' }}>
                            <div style={{ fontSize: '36px', marginBottom: '8px' }}>✅</div>
                            All systems operating normally
                          </motion.div>
                        ) : (
                          activeAlerts.map((alert, i) => (
                            <motion.div key={alert.id}
                              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.06 }}
                              style={{
                                padding: '10px 14px', borderRadius: '10px',
                                background: alert.type === 'Critical' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.08)',
                                borderLeft: `3px solid ${alert.type === 'Critical' ? '#EF4444' : '#F59E0B'}`,
                                border: `1px solid ${alert.type === 'Critical' ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.2)'}`,
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>
                                <span style={{ color: alert.type === 'Critical' ? '#EF4444' : '#F59E0B' }}>{alert.type}</span>
                                <span style={{ color: '#334155', fontFamily: 'monospace' }}>LIVE</span>
                              </div>
                              <div style={{ fontSize: '12px', color: '#F1F5F9', fontWeight: '500' }}>{alert.msg}</div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                    <SustainabilityScorecard />
                  </div>

                  {/* Admin Panel */}
                  <AdminPanel onConfigChange={handleConfigChange} />

                  {/* AI Timeline */}
                  {aiInsights.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.95))',
                        border: '1px solid rgba(56,189,248,0.12)',
                        borderRadius: '16px', padding: '20px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
                        ✦ AI Insights Timeline
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {aiInsights.map((insight, idx) => (
                          <motion.div key={idx}
                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            style={{ display: 'flex', gap: '12px', fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px', alignItems: 'center' }}
                          >
                            <span style={{ fontFamily: 'monospace', color: '#334155', fontWeight: '700', flexShrink: 0 }}>{insight.time}</span>
                            <span style={{
                              padding: '1px 7px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', flexShrink: 0,
                              background: insight.severity === 'CRITICAL' ? 'rgba(239,68,68,0.15)' : insight.severity === 'WARNING' ? 'rgba(245,158,11,0.15)' : 'rgba(56,189,248,0.12)',
                              color: insight.severity === 'CRITICAL' ? '#EF4444' : insight.severity === 'WARNING' ? '#F59E0B' : '#38BDF8',
                              border: `1px solid ${insight.severity === 'CRITICAL' ? 'rgba(239,68,68,0.3)' : insight.severity === 'WARNING' ? 'rgba(245,158,11,0.25)' : 'rgba(56,189,248,0.2)'}`,
                              textTransform: 'uppercase',
                            }}>
                              {insight.severity}
                            </span>
                            <span style={{ color: '#475569', fontWeight: '600', flexShrink: 0 }}>[{insight.location}]</span>
                            <span style={{ color: '#94A3B8' }}>{insight.message}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ChatWidget selectedLocation={selectedLocation} />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AirHeader from './AirHeader';
import AirGisMap from './AirGisMap';
import HealthAdvisory from './HealthAdvisory';
import InterventionPlan from './InterventionPlan';
import MultiCityAnalytics from './MultiCityAnalytics';
import AirChatbot from './AirChatbot';
import SourceAnalysis from './SourceAnalysis';
import Chart from './Chart';
import PollutantPanel from './PollutantPanel';
import HotspotCards from './HotspotCards';
import { fetchCityOverview, fetchHealthAdvisory, fetchInterventionPlan, fetchMultiCity, fetchForecast, fetchSourceAnalysis, fetchLocations, fetchLatestReadings } from '../data/airApi';

const TABS = [
  { id: 'overview',      icon: '🗺️', label: 'Live City Map' },
  { id: 'sources',       icon: '🔍', label: 'Source Attribution' },
  { id: 'forecast',      icon: '🔮', label: 'AQI Prediction' },
  { id: 'interventions', icon: '⚡', label: 'Interventions' },
  { id: 'advisory',      icon: '🏥', label: 'Health Advisory' },
  { id: 'comparison',    icon: '🏙️', label: 'Multi-City' },
  { id: 'chatbot',       icon: '🤖', label: 'AI Authority Bot' },
];
const GLASS = { background: 'linear-gradient(135deg,rgba(10,16,32,0.98),rgba(15,26,52,0.95))', border: '1px solid rgba(56,189,248,0.12)', borderRadius: '18px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' };
const AQI_COLOR = (v) => v<=50?'#10B981':v<=100?'#F59E0B':v<=150?'#F97316':v<=200?'#EF4444':'#7C3AED';
const AQI_LABEL = (v) => v<=50?'Good':v<=100?'Moderate':v<=150?'Sensitive':v<=200?'Unhealthy':'Hazardous';

/* ── Reusable 3D Big Bar ── */
function BigBar({ label, value, max, safeMax, unit, color, note, icon }) {
  const pct = Math.min((value / max) * 100, 100);
  const safePct = Math.min((safeMax / max) * 100, 100);
  const exceeded = value > safeMax;
  const barColor = exceeded ? '#EF4444' : color;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          {icon && <span style={{ fontSize:'18px' }}>{icon}</span>}
          <span style={{ fontSize:'14px', fontWeight:700, color:'#F1F5F9' }}>{label}</span>
          {exceeded && <motion.span animate={{ scale:[1,1.1,1] }} transition={{ duration:1, repeat:Infinity }}
            style={{ fontSize:'9px', padding:'2px 7px', background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.4)', borderRadius:'10px', color:'#EF4444', fontWeight:800 }}>⚠ HIGH</motion.span>}
        </div>
        <span style={{ fontSize:'22px', fontWeight:900, color:barColor, fontFamily:'monospace', filter:`drop-shadow(0 0 10px ${barColor}88)` }}>{value} <span style={{ fontSize:'12px', fontWeight:400, color:'#475569' }}>{unit}</span></span>
      </div>
      <div style={{ position:'relative', height:'32px', borderRadius:'10px', overflow:'visible' }}>
        <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.05)', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.07)' }} />
        <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:1.2, ease:[0.34,1.56,0.64,1] }}
          style={{ position:'absolute', top:0, left:0, height:'100%', borderRadius:'10px', background:`linear-gradient(90deg,${barColor}99,${barColor})`, boxShadow:`0 0 18px ${barColor}55, 0 4px 8px rgba(0,0,0,0.4)`, overflow:'hidden' }}>
          <motion.div animate={{ x:['-100%','220%'] }} transition={{ duration:2.8, repeat:Infinity, ease:'linear', repeatDelay:1.5 }}
            style={{ position:'absolute', top:0, left:0, width:'35%', height:'100%', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)', transform:'skewX(-20deg)' }} />
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'45%', background:'linear-gradient(180deg,rgba(255,255,255,0.18),transparent)', borderRadius:'10px 10px 0 0' }} />
        </motion.div>
        <div style={{ position:'absolute', top:'-6px', bottom:'-6px', left:`${safePct}%`, width:'2px', background:'rgba(239,68,68,0.55)', zIndex:2 }}>
          <div style={{ position:'absolute', top:'-14px', left:'50%', transform:'translateX(-50%)', fontSize:'7px', color:'#EF4444', fontWeight:700, whiteSpace:'nowrap' }}>SAFE</div>
        </div>
      </div>
      {note && <div style={{ fontSize:'10px', color:'#475569', paddingLeft:'4px' }}>{note}</div>}
    </div>
  );
}

/* ── KPI Card ── */
function KpiCard({ label, value, unit='', color='#38BDF8', sub, icon }) {
  return (
    <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} whileHover={{ y:-4, boxShadow:`0 12px 40px ${color}22` }}
      style={{ ...GLASS, padding:'18px', display:'flex', flexDirection:'column', gap:'8px', position:'relative', overflow:'hidden', cursor:'default' }}>
      <div style={{ position:'absolute', top:'-22px', right:'-22px', width:'80px', height:'80px', borderRadius:'50%', background:`radial-gradient(circle,${color}28,transparent 70%)`, pointerEvents:'none' }} />
      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
        {icon && <span style={{ fontSize:'15px' }}>{icon}</span>}
        <span style={{ fontSize:'9px', fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}</span>
      </div>
      <div style={{ fontSize:'28px', fontWeight:900, color, fontFamily:'monospace', lineHeight:1, filter:`drop-shadow(0 0 8px ${color}55)` }}>
        {value}<span style={{ fontSize:'12px', fontWeight:400, color:'#475569', marginLeft:'3px' }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize:'10px', color:'#334155', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'5px' }}>{sub}</div>}
    </motion.div>
  );
}

/* ── AQI Arc Gauge SVG ── */
function AqiGauge({ aqi, size=180 }) {
  const color = AQI_COLOR(aqi); const label = AQI_LABEL(aqi);
  const pct = Math.min(aqi / 400, 1);
  const arc = pct * 251;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
      <svg viewBox="0 0 200 130" width={size} height={size * 0.7} style={{ filter:`drop-shadow(0 0 16px ${color}44)` }}>
        <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" strokeLinecap="round" />
        <motion.path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          initial={{ strokeDasharray:'0 251' }} animate={{ strokeDasharray:`${arc} 251` }} transition={{ duration:1.4, ease:'easeOut' }} />
        <text x="100" y="90" fill={color} fontSize="34" fontWeight="900" textAnchor="middle" fontFamily="monospace">{aqi}</text>
        <text x="100" y="108" fill="#64748B" fontSize="11" textAnchor="middle">{label}</text>
      </svg>
    </div>
  );
}

/* ── Day Forecast Card ── */
function DayCard({ day, aqi, confidence, rain, date, i }) {
  const color = AQI_COLOR(aqi); const label = AQI_LABEL(aqi);
  return (
    <motion.div initial={{ opacity:0, y:20, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ delay:i*0.08, type:'spring', stiffness:140 }}
      whileHover={{ y:-6, boxShadow:`0 16px 40px ${color}33` }}
      style={{ ...GLASS, padding:'16px', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', cursor:'default', border:`1px solid ${color}22` }}>
      <div style={{ fontSize:'11px', fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.1em' }}>{day}</div>
      <AqiGauge aqi={aqi} size={100} />
      <div style={{ display:'flex', gap:'6px', alignItems:'center', flexWrap:'wrap', justifyContent:'center' }}>
        <span style={{ fontSize:'9px', padding:'2px 7px', borderRadius:'10px', background:`${color}18`, color, fontWeight:700, border:`1px solid ${color}30` }}>{label}</span>
        {rain > 35 && <span style={{ fontSize:'10px' }} title={`Rain ${rain}%`}>🌧 {rain}%</span>}
      </div>
      <div style={{ fontSize:'9px', color:'#334155' }}>{confidence}% confidence</div>
    </motion.div>
  );
}

export default function AirDashboard({ onGoHome }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLocation, setSelectedLocation] = useState('Sector A');
  const [cityOverview, setCityOverview] = useState(null);
  const [locations, setLocations] = useState([]);
  const [readings, setReadings] = useState([]);
  const [healthAdvisory, setHealthAdvisory] = useState(null);
  const [interventionPlan, setInterventionPlan] = useState(null);
  const [multiCity, setMultiCity] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [sourceData, setSourceData] = useState({ sources:[], explanation:'' });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadAll = async (loc) => {
    const [ov, ld, adv, inv, mc, fc, src, rds] = await Promise.all([
      fetchCityOverview(), fetchLocations(), fetchHealthAdvisory(loc),
      fetchInterventionPlan(loc), fetchMultiCity(), fetchForecast(loc),
      fetchSourceAnalysis(loc), fetchLatestReadings(loc),
    ]);
    setCityOverview(ov); setLocations(ld.locations||[]); setHealthAdvisory(adv);
    setInterventionPlan(inv); setMultiCity(mc); setForecast(fc);
    setSourceData(src); setReadings(rds); setLastRefresh(new Date().toLocaleTimeString()); setLoading(false);
  };
  useEffect(() => { setLoading(true); loadAll(selectedLocation); const id=setInterval(()=>loadAll(selectedLocation),10000); return ()=>clearInterval(id); }, [selectedLocation]);

  const activeAlerts = cityOverview?.critical_zones||0;
  const lr = readings[readings.length-1]??null;

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'20px' }}>
      <motion.div animate={{ rotate:360 }} transition={{ duration:1.2, repeat:Infinity, ease:'linear' }}
        style={{ width:'52px', height:'52px', border:'3px solid rgba(56,189,248,0.1)', borderTopColor:'#38BDF8', borderRadius:'50%' }} />
      <div style={{ fontSize:'16px', fontWeight:700, color:'#38BDF8' }}>AirSense AI Loading…</div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'transparent', fontFamily:"'Inter',sans-serif", display:'flex', flexDirection:'column', isolation:'isolate' }}>
      <AirHeader selectedLocation={selectedLocation} onSelectLocation={setSelectedLocation} locations={locations} activeAlerts={activeAlerts} cityScore={cityOverview?.city_score||0} onGoHome={onGoHome} />
      <div style={{ display:'flex', flex:1 }}>
        {/* Sidebar */}
        <aside style={{ width:'224px', flexShrink:0, background:'linear-gradient(180deg,#020c1b,#050f1e)', borderRight:'1px solid rgba(56,189,248,0.08)', padding:'18px 10px', display:'flex', flexDirection:'column', gap:'3px', height:'calc(100vh - 64px)', overflowY:'auto' }}>
          <div style={{ fontSize:'9px', fontWeight:700, color:'#334155', textTransform:'uppercase', letterSpacing:'0.12em', paddingLeft:'8px', marginBottom:'8px' }}>🌫️ AirSense Modules</div>
          {TABS.map(t => (
            <motion.button key={t.id} onClick={()=>setActiveTab(t.id)} whileHover={{ x:3 }} whileTap={{ scale:0.97 }}
              style={{ width:'100%', textAlign:'left', padding:'9px 10px', border:'none', borderRadius:'9px', cursor:'pointer', fontSize:'12px', fontWeight:600, background:activeTab===t.id?'rgba(56,189,248,0.12)':'transparent', color:activeTab===t.id?'#38BDF8':'#64748B', borderLeft:activeTab===t.id?'2px solid #38BDF8':'2px solid transparent', display:'flex', alignItems:'center', gap:'8px', transition:'all 0.15s' }}>
              <span>{t.icon}</span>{t.label}
            </motion.button>
          ))}
          <div style={{ marginTop:'auto', borderTop:'1px solid rgba(255,255,255,0.04)', paddingTop:'14px', display:'flex', flexDirection:'column', gap:'7px' }}>
            <div style={{ fontSize:'9px', color:'#334155', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>City Overview</div>
            {cityOverview && [['Avg AQI',cityOverview.city_avg_aqi,'#38BDF8'],['City Score',`${cityOverview.city_score}/100`,cityOverview.city_score>=70?'#10B981':'#F59E0B'],['Critical',activeAlerts,activeAlerts>0?'#EF4444':'#10B981'],['Zones',cityOverview.total_zones,'#818CF8']].map(([k,v,c])=>(
              <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'11px' }}>
                <span style={{ color:'#64748B' }}>{k}</span><span style={{ color:c, fontWeight:700, fontFamily:'monospace' }}>{v}</span>
              </div>
            ))}
            {lastRefresh&&<div style={{ fontSize:'9px', color:'#334155', marginTop:'2px' }}>Updated: {lastRefresh}</div>}
          </div>
        </aside>
        {/* Main */}
        <main style={{ flex:1, padding:'20px', display:'flex', flexDirection:'column', gap:'18px', overflowY:'auto', height:'calc(100vh - 64px)' }}>

          {/* KPI Row */}
          {lr && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))', gap:'12px' }}>
              <KpiCard icon="🌫️" label="Live AQI" value={lr.AQI} color={AQI_COLOR(lr.AQI)} sub={AQI_LABEL(lr.AQI)} />
              <KpiCard icon="💨" label="PM2.5" value={lr.PM25} unit="µg" color="#38BDF8" sub={lr.PM25>35.4?'⚠ Above WHO':'Safe range'} />
              <KpiCard icon="🌁" label="PM10" value={lr.PM10} unit="µg" color="#818CF8" sub={lr.PM10>154?'⚠ Elevated':'Normal'} />
              <KpiCard icon="🚗" label="Traffic Index" value={lr.traffic_index} unit="%" color="#F59E0B" sub={lr.traffic_index>75?'High congestion':'Normal flow'} />
              <KpiCard icon="💨" label="Wind Speed" value={lr.wind_speed} unit="km/h" color="#F472B6" sub={`${lr.weather_condition} · ${lr.air_temperature}°C`} />
              <KpiCard icon="🚨" label="Critical Zones" value={activeAlerts} color={activeAlerts>0?'#EF4444':'#10B981'} sub={activeAlerts>0?'Action needed':'All clear'} />
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.22 }}>

              {/* TAB: overview */}
              {activeTab==='overview' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:'20px' }}>
                    <AirGisMap zones={cityOverview?.zones||[]} selectedLocation={selectedLocation} onSelectLocation={setSelectedLocation} />
                    <div style={{ ...GLASS, padding:'22px', height:'520px', overflowY:'auto' }}>
                      <PollutantPanel reading={lr} locationName={selectedLocation} />
                    </div>
                  </div>
                  <div style={{ ...GLASS, padding:'22px' }}>
                    <HotspotCards zones={cityOverview?.zones||[]} onSelectZone={setSelectedLocation} selectedZone={selectedLocation} />
                  </div>
                </div>
              )}

              {/* TAB: sources */}
              {activeTab==='sources' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
                    <div style={{ ...GLASS, padding:'24px', minHeight:'460px' }}>
                      <SourceAnalysis data={sourceData.sources} explanation={sourceData.explanation} />
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                      <div style={{ ...GLASS, padding:'24px' }}>
                        <div style={{ fontSize:'15px', fontWeight:700, color:'#F8FAFC', marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px' }}>
                          <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#38BDF8', boxShadow:'0 0 8px #38BDF8', display:'inline-block' }} />
                          Causal Factor Analysis
                          <span style={{ fontSize:'10px', color:'#475569', fontWeight:400, marginLeft:'4px' }}>{selectedLocation}</span>
                        </div>
                        {lr && (
                          <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                            <BigBar icon="🚗" label="Traffic Congestion Index" value={lr.traffic_index} max={100} safeMax={70} unit="%" color="#F97316" note={lr.traffic_index>75?'HIGH — primary vehicle emission contributor':lr.traffic_index>40?'Moderate traffic load':'Low — minimal traffic impact'} />
                            <BigBar icon="💨" label="Wind Speed (Dispersion)" value={lr.wind_speed} max={50} safeMax={5} unit="km/h" color="#38BDF8" note={lr.wind_speed<5?'STAGNANT — pollutants accumulating near ground':lr.wind_speed<15?'Moderate — partial dispersion':'Good — effective pollutant dispersal'} />
                            <BigBar icon="🌡️" label="Air Temperature" value={lr.air_temperature} max={45} safeMax={38} unit="°C" color="#F472B6" note={lr.air_temperature>35?'HIGH — increases ground-level ozone formation':'Normal temperature range'} />
                            <BigBar icon="💧" label="Relative Humidity" value={lr.humidity} max={100} safeMax={80} unit="%" color="#818CF8" note={lr.humidity>80?'HIGH — promotes PM2.5 hygroscopic growth':'Normal humidity level'} />
                          </div>
                        )}
                      </div>
                      <div style={{ ...GLASS, padding:'20px' }}>
                        <div style={{ fontSize:'13px', fontWeight:700, color:'#F8FAFC', marginBottom:'12px' }}>📍 Zone Context</div>
                        {lr && (
                          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', padding:'10px 12px', background:'rgba(255,255,255,0.03)', borderRadius:'8px' }}>
                              <span style={{ color:'#64748B' }}>Sector Type</span><span style={{ color:'#38BDF8', fontWeight:700 }}>{lr.sector_type}</span>
                            </div>
                            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', padding:'10px 12px', background:'rgba(255,255,255,0.03)', borderRadius:'8px' }}>
                              <span style={{ color:'#64748B' }}>Weather</span><span style={{ color:'#94A3B8', fontWeight:600 }}>{lr.weather_condition}</span>
                            </div>
                            <div style={{ padding:'14px', background:'rgba(56,189,248,0.06)', border:'1px solid rgba(56,189,248,0.2)', borderLeft:'4px solid #38BDF8', borderRadius:'0 10px 10px 0', fontSize:'12px', color:'#94A3B8', lineHeight:1.7 }}>
                              <div style={{ fontSize:'10px', fontWeight:700, color:'#38BDF8', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'6px' }}>✦ AI Observation</div>
                              {sourceData.explanation||'Analyzing pollutant source attribution…'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Combined Attribution Insight */}
                  {lr && (
                    <div style={{ ...GLASS, padding:'24px' }}>
                      <div style={{ fontSize:'15px', fontWeight:700, color:'#F8FAFC', marginBottom:'16px' }}>🔬 Combined Attribution Summary</div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'12px' }}>
                        {(sourceData.sources||[]).map((s, i) => {
                          const cs=['#EF4444','#F97316','#F59E0B','#10B981','#3B82F6'];
                          const c=cs[i%cs.length];
                          return (
                            <div key={s.source} style={{ padding:'16px', background:`${c}10`, border:`1px solid ${c}25`, borderRadius:'12px', textAlign:'center' }}>
                              <div style={{ fontSize:'24px', fontWeight:900, color:c, fontFamily:'monospace', filter:`drop-shadow(0 0 8px ${c}66)` }}>{s.percentage}%</div>
                              <div style={{ fontSize:'12px', fontWeight:600, color:'#F1F5F9', marginTop:'6px' }}>{s.source}</div>
                              <div style={{ marginTop:'8px', height:'6px', background:'rgba(255,255,255,0.06)', borderRadius:'3px', overflow:'hidden' }}>
                                <motion.div initial={{ width:0 }} animate={{ width:`${s.percentage}%` }} transition={{ duration:1, delay:i*0.1 }}
                                  style={{ height:'100%', background:c, boxShadow:`0 0 8px ${c}66` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: forecast */}
              {activeTab==='forecast' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                  <div style={{ ...GLASS, padding:'24px' }}>
                    <div style={{ fontSize:'15px', fontWeight:700, color:'#F8FAFC', marginBottom:'4px' }}>🔮 7-Day AQI Forecast · {selectedLocation}</div>
                    <div style={{ fontSize:'11px', color:'#475569', marginBottom:'16px' }}>ML-powered prediction · Random Forest Regressor + seasonal patterns</div>
                    <div style={{ height:'320px' }}>
                      <Chart defaultTab="forecast" forecastData={forecast} locationName={selectedLocation} />
                    </div>
                  </div>
                  {/* Day cards */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'12px' }}>
                    {forecast.map((d,i)=><DayCard key={d.day} day={d.day} aqi={d.aqi} confidence={d.confidence_percent} rain={d.rain_probability} date={d.date} i={i} />)}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'20px' }}>
                    <div style={{ ...GLASS, padding:'24px' }}>
                      <div style={{ fontSize:'14px', fontWeight:700, color:'#F8FAFC', marginBottom:'16px' }}>📊 24h Air Quality Trend</div>
                      <Chart defaultTab="air" historicalData={readings} locationName={selectedLocation} />
                    </div>
                    <div style={{ ...GLASS, padding:'24px' }}>
                      <div style={{ fontSize:'14px', fontWeight:700, color:'#F8FAFC', marginBottom:'16px' }}>📡 Forecast Input Factors</div>
                      {lr && (
                        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                          {[['Base AQI', lr.AQI,'#38BDF8'],['PM2.5',`${lr.PM25} µg/m³`,'#818CF8'],['Traffic',`${lr.traffic_index}%`,'#F59E0B'],['Wind',`${lr.wind_speed} km/h`,'#F472B6'],['Humidity',`${lr.humidity}%`,'#34D399'],['Season','Summer/Dry','#64748B']].map(([k,v,c])=>(
                            <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'rgba(255,255,255,0.03)', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.06)' }}>
                              <span style={{ fontSize:'13px', color:'#94A3B8' }}>{k}</span>
                              <span style={{ fontSize:'15px', fontWeight:800, color:c, fontFamily:'monospace' }}>{v}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: interventions */}
              {activeTab==='interventions' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                  <div style={{ ...GLASS, padding:'24px' }}>
                    <div style={{ fontSize:'15px', fontWeight:700, color:'#F8FAFC', marginBottom:'4px', display:'flex', alignItems:'center', gap:'8px' }}>
                      <motion.span animate={{ scale:[1,1.15,1] }} transition={{ duration:1.5, repeat:Infinity }}>⚡</motion.span>
                      Recommended City Actions
                    </div>
                    <div style={{ fontSize:'11px', color:'#475569', marginBottom:'20px' }}>Actions auto-triggered based on live sensor readings · Updated every 10s</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px' }}>
                      {[
                        { icon:'🚛', action:'Restrict Heavy Vehicles', detail:'Odd-even rule on Ring Road & arterial roads', trigger:lr?.AQI>100, dept:'Traffic Police', impact:'−15% NOx & CO' },
                        { icon:'🏗️', action:'Pause Construction', detail:'Halt open excavation and demolition work', trigger:lr?.PM10>100, dept:'Municipal Corp', impact:'−18% PM10' },
                        { icon:'🚿', action:'Water Sprinkling Fleet', detail:'12-truck anti-smog fleet on dry corridors', trigger:lr?.AQI>80, dept:'Public Works', impact:'−20% dust PM' },
                        { icon:'🏭', action:'Industrial Inspection', detail:'Inspect Category-A emission units', trigger:lr?.SO2>30, dept:'PCB', impact:'−45% SO2/NOx' },
                        { icon:'🚌', action:'Boost Public Transport', detail:'Increase metro/bus frequency by 40%', trigger:lr?.traffic_index>60, dept:'City Transport', impact:'−12% vehicles' },
                        { icon:'🌿', action:'Street Sweeping', detail:'Mechanised sweeping on high-traffic corridors', trigger:true, dept:'Sanitation Dept', impact:'Baseline PM10' },
                      ].map((item,i)=>{
                        const c=item.trigger?'#38BDF8':'#334155';
                        return (
                          <motion.div key={item.action} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
                            whileHover={{ y:-4, boxShadow:item.trigger?'0 12px 32px rgba(56,189,248,0.15)':'none' }}
                            style={{ padding:'20px', background:item.trigger?'rgba(56,189,248,0.07)':'rgba(255,255,255,0.02)', border:`1px solid ${item.trigger?'rgba(56,189,248,0.22)':'rgba(255,255,255,0.06)'}`, borderRadius:'14px', display:'flex', flexDirection:'column', gap:'10px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                              <span style={{ fontSize:'28px' }}>{item.icon}</span>
                              <motion.span animate={item.trigger?{ opacity:[1,0.5,1] }:{}} transition={{ duration:1.5, repeat:Infinity }}
                                style={{ fontSize:'9px', padding:'3px 9px', borderRadius:'10px', fontWeight:800, background:item.trigger?'rgba(56,189,248,0.18)':'rgba(255,255,255,0.06)', color:item.trigger?'#38BDF8':'#334155', border:`1px solid ${item.trigger?'rgba(56,189,248,0.3)':'rgba(255,255,255,0.08)'}` }}>
                                {item.trigger?'⚡ ACTIVE':'STANDBY'}
                              </motion.span>
                            </div>
                            <div style={{ fontSize:'14px', fontWeight:700, color:'#F1F5F9' }}>{item.action}</div>
                            <div style={{ fontSize:'11px', color:'#475569', lineHeight:1.5 }}>{item.detail}</div>
                            <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'8px', display:'flex', justifyContent:'space-between', fontSize:'11px' }}>
                              <span style={{ color:'#64748B' }}>🏢 {item.dept}</span>
                              <span style={{ color:'#10B981', fontWeight:700 }}>{item.impact}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
                    <InterventionPlan data={interventionPlan} />
                    <div style={{ ...GLASS, padding:'24px' }}>
                      <SourceAnalysis data={sourceData.sources} explanation={sourceData.explanation} />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: advisory */}
              {activeTab==='advisory' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                  {/* Hero AQI banner */}
                  {lr && (
                    <div style={{ ...GLASS, padding:'28px', background:`linear-gradient(135deg,${AQI_COLOR(lr.AQI)}12,rgba(10,16,32,0.98))`, border:`1px solid ${AQI_COLOR(lr.AQI)}30` }}>
                      <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', gap:'32px', alignItems:'center' }}>
                        <AqiGauge aqi={lr.AQI} size={200} />
                        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                          <div style={{ fontSize:'13px', fontWeight:700, color:'#38BDF8', textTransform:'uppercase', letterSpacing:'0.1em' }}>Real-Time Air Quality · {selectedLocation}</div>
                          <div style={{ fontSize:'42px', fontWeight:900, color:AQI_COLOR(lr.AQI), fontFamily:'monospace', lineHeight:1, filter:`drop-shadow(0 0 20px ${AQI_COLOR(lr.AQI)}88)` }}>
                            {AQI_LABEL(lr.AQI)}
                          </div>
                          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                            {lr.AQI>100 && <span style={{ padding:'6px 14px', background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.35)', borderRadius:'20px', fontSize:'12px', fontWeight:700, color:'#EF4444' }}>😷 Mask Required</span>}
                            {lr.AQI>150 && <span style={{ padding:'6px 14px', background:'rgba(249,115,22,0.15)', border:'1px solid rgba(249,115,22,0.3)', borderRadius:'20px', fontSize:'12px', fontWeight:700, color:'#F97316' }}>🚫 Limit Outdoor Activities</span>}
                            {lr.AQI>200 && <motion.span animate={{ opacity:[1,0.5,1] }} transition={{ duration:1, repeat:Infinity }} style={{ padding:'6px 14px', background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.4)', borderRadius:'20px', fontSize:'12px', fontWeight:800, color:'#EF4444' }}>🚨 PUBLIC HEALTH EMERGENCY</motion.span>}
                            {lr.AQI<=100 && <span style={{ padding:'6px 14px', background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:'20px', fontSize:'12px', fontWeight:700, color:'#10B981' }}>✓ Normal Activity Permitted</span>}
                          </div>
                          <div style={{ fontSize:'13px', color:'#64748B' }}>PM2.5: <strong style={{ color:'#38BDF8' }}>{lr.PM25} µg/m³</strong> · NO₂: <strong style={{ color:'#F472B6' }}>{lr.NO2} µg/m³</strong> · Wind: <strong style={{ color:'#F59E0B' }}>{lr.wind_speed} km/h</strong></div>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'12px', minWidth:'160px' }}>
                          {[['PM2.5', lr.PM25, 35.4, 'µg/m³', '#38BDF8'],['NO₂', lr.NO2, 100, 'µg/m³', '#F472B6'],['SO₂', lr.SO2, 75, 'µg/m³', '#FACC15'],['CO', lr.CO, 9, 'mg/m³', '#FB923C']].map(([k,v,s,u,c])=>(
                            <div key={k} style={{ padding:'8px 12px', background:'rgba(255,255,255,0.03)', borderRadius:'8px', border:`1px solid ${v>s?'rgba(239,68,68,0.3)':'rgba(255,255,255,0.06)'}` }}>
                              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                                <span style={{ fontSize:'10px', color:'#64748B' }}>{k}</span>
                                <span style={{ fontSize:'12px', fontWeight:800, color:v>s?'#EF4444':c, fontFamily:'monospace' }}>{v}</span>
                              </div>
                              <div style={{ height:'4px', background:'rgba(255,255,255,0.05)', borderRadius:'2px', overflow:'hidden' }}>
                                <div style={{ width:`${Math.min((v/s)*60,100)}%`, height:'100%', background:v>s?'#EF4444':c }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Advisory + Notifications */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
                    <div style={{ ...GLASS, padding:'24px' }}>
                      <HealthAdvisory data={healthAdvisory} />
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                      <div style={{ ...GLASS, padding:'24px', flex:1 }}>
                        <div style={{ fontSize:'14px', fontWeight:700, color:'#F8FAFC', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px' }}>
                          <motion.span animate={{ opacity:[1,0.4,1] }} transition={{ duration:1.2, repeat:Infinity }}>📲</motion.span>
                          Alert Notifications · Status
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                          {[
                            { group:'🏫 Schools & Colleges', count:47, action:'Cancel outdoor PE — stay indoors', sent:lr?.AQI>100 },
                            { group:'🏥 Hospitals & Clinics', count:23, action:'Prepare respiratory emergency ward', sent:lr?.AQI>150 },
                            { group:'👴 Elderly Care Homes', count:18, action:'Indoor advisory — no outdoor walks', sent:lr?.AQI>80 },
                            { group:'🫁 Asthma / COPD Patients', count:3420, action:'Carry rescue inhaler at all times', sent:lr?.AQI>100 },
                            { group:'🏃 Sports & Recreation', count:12, action:'Suspend all outdoor training sessions', sent:lr?.AQI>120 },
                            { group:'🏗️ Outdoor Workers', count:280, action:'Provide N95 masks & limit shift duration', sent:lr?.AQI>100 },
                          ].map((n,i)=>(
                            <motion.div key={n.group} initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07 }}
                              style={{ padding:'12px 14px', background:n.sent?'rgba(239,68,68,0.06)':'rgba(255,255,255,0.02)', border:`1px solid ${n.sent?'rgba(239,68,68,0.2)':'rgba(255,255,255,0.05)'}`, borderRadius:'10px' }}>
                              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
                                <span style={{ fontSize:'13px', fontWeight:700, color:'#F1F5F9' }}>{n.group}</span>
                                <span style={{ fontSize:'9px', padding:'2px 9px', borderRadius:'10px', fontWeight:800, background:n.sent?'rgba(239,68,68,0.15)':'rgba(255,255,255,0.06)', color:n.sent?'#EF4444':'#334155', border:`1px solid ${n.sent?'rgba(239,68,68,0.3)':'rgba(255,255,255,0.1)'}` }}>
                                  {n.sent?`✉ SENT · ${n.count} recipients`:'STANDBY'}
                                </span>
                              </div>
                              <div style={{ fontSize:'11px', color:'#475569' }}>{n.action}</div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: comparison */}
              {activeTab==='comparison' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                  <div style={{ ...GLASS, padding:'24px' }}>
                    <MultiCityAnalytics data={multiCity} />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
                    <div style={{ ...GLASS, padding:'24px' }}>
                      <div style={{ fontSize:'14px', fontWeight:700, color:'#F8FAFC', marginBottom:'16px' }}>📊 24h AQI Trend · {selectedLocation}</div>
                      <Chart defaultTab="air" historicalData={readings} locationName={selectedLocation} />
                    </div>
                    <div style={{ ...GLASS, padding:'24px' }}>
                      <div style={{ fontSize:'14px', fontWeight:700, color:'#F8FAFC', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px' }}>
                        <span>📈</span> Intervention Effectiveness History
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                        {[
                          { label:'Vehicle Restriction Days', pct:22, period:'Last 30 days', color:'#10B981' },
                          { label:'Water Sprinkling Program', pct:18, period:'Last 14 days', color:'#38BDF8' },
                          { label:'Construction Ban (PM peak)', pct:31, period:'Last 7 days',  color:'#818CF8' },
                          { label:'Industrial Inspection Drive', pct:45, period:'Last 60 days', color:'#F59E0B' },
                          { label:'Public Transport Push',       pct:12, period:'Last 30 days', color:'#F472B6' },
                          { label:'Street Sweeping Fleet',       pct:8,  period:'Ongoing',      color:'#34D399' },
                        ].map((item,i)=>(
                          <div key={item.label} style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px' }}>
                              <span style={{ color:'#F1F5F9', fontWeight:600 }}>{item.label}</span>
                              <span style={{ color:item.color, fontWeight:900, fontFamily:'monospace', fontSize:'15px' }}>−{item.pct}%</span>
                            </div>
                            <div style={{ height:'22px', background:'rgba(255,255,255,0.05)', borderRadius:'6px', overflow:'hidden', position:'relative' }}>
                              <motion.div initial={{ width:0 }} animate={{ width:`${item.pct*2}%` }} transition={{ duration:1, delay:i*0.1 }}
                                style={{ position:'absolute', top:0, left:0, height:'100%', background:`linear-gradient(90deg,${item.color}88,${item.color})`, borderRadius:'6px', overflow:'hidden', boxShadow:`0 0 8px ${item.color}55` }}>
                                <div style={{ position:'absolute', top:0, left:0, right:0, height:'45%', background:'linear-gradient(180deg,rgba(255,255,255,0.18),transparent)' }} />
                              </motion.div>
                            </div>
                            <div style={{ fontSize:'9px', color:'#334155' }}>{item.period}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: chatbot */}
              {activeTab==='chatbot' && (
                <div style={{ display:'grid', gridTemplateColumns:'3fr 1fr 1fr', gap:'18px', alignItems:'start' }}>
                  <div style={{ ...GLASS, overflow:'hidden' }}>
                    <AirChatbot selectedLocation={selectedLocation} />
                  </div>
                  {/* Quick stats */}
                  <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                    <div style={{ ...GLASS, padding:'20px' }}>
                      <div style={{ fontSize:'13px', fontWeight:700, color:'#F8FAFC', marginBottom:'14px' }}>⚡ Live Stats · {selectedLocation}</div>
                      {lr && (
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                          {[['AQI',lr.AQI,'',AQI_COLOR(lr.AQI)],['PM2.5',lr.PM25,'µg','#38BDF8'],['PM10',lr.PM10,'µg','#818CF8'],['NO₂',lr.NO2,'µg','#F472B6'],['Wind',lr.wind_speed,'km/h','#34D399'],['Humidity',lr.humidity,'%','#F59E0B']].map(([k,v,u,c])=>(
                            <div key={k} style={{ padding:'10px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'10px', textAlign:'center' }}>
                              <div style={{ fontSize:'9px', color:'#475569', marginBottom:'4px', fontWeight:600 }}>{k}</div>
                              <div style={{ fontSize:'18px', fontWeight:900, color:c, fontFamily:'monospace', filter:`drop-shadow(0 0 6px ${c}55)` }}>{v}<span style={{ fontSize:'9px', color:'#334155' }}>{u}</span></div>
                            </div>
                          ))}
                        </div>
                      )}
                      {lr && (
                        <div style={{ marginTop:'12px', padding:'10px 14px', background:`${AQI_COLOR(lr.AQI)}12`, border:`1px solid ${AQI_COLOR(lr.AQI)}28`, borderRadius:'10px', textAlign:'center' }}>
                          <div style={{ fontSize:'14px', fontWeight:800, color:AQI_COLOR(lr.AQI) }}>{AQI_LABEL(lr.AQI)} Air Quality</div>
                          <div style={{ fontSize:'9px', color:'#475569', marginTop:'3px' }}>{lastRefresh?`Updated ${lastRefresh}`:'Live'}</div>
                        </div>
                      )}
                    </div>
                    <div style={{ ...GLASS, padding:'20px' }}>
                      <div style={{ fontSize:'12px', fontWeight:700, color:'#F8FAFC', marginBottom:'12px' }}>🏙️ City Overview</div>
                      {cityOverview && (
                        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                          {[['Avg AQI',cityOverview.city_avg_aqi,'#38BDF8'],['City Score',`${cityOverview.city_score}/100`,cityOverview.city_score>=70?'#10B981':'#F59E0B'],['Critical Zones',activeAlerts,activeAlerts>0?'#EF4444':'#10B981'],['Total Monitored',cityOverview.total_zones,'#818CF8']].map(([k,v,c])=>(
                            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'rgba(255,255,255,0.03)', borderRadius:'8px' }}>
                              <span style={{ fontSize:'12px', color:'#64748B' }}>{k}</span>
                              <span style={{ fontSize:'14px', fontWeight:800, color:c, fontFamily:'monospace' }}>{v}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* AI Insights timeline */}
                  <div style={{ ...GLASS, padding:'20px' }}>
                    <div style={{ fontSize:'13px', fontWeight:700, color:'#F8FAFC', marginBottom:'14px', display:'flex', alignItems:'center', gap:'6px' }}>
                      🧠 AI Insights
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                      {lr && [
                        { icon:'🌫️', time:'2 min ago', color:AQI_COLOR(lr.AQI), text:`AQI at ${lr.AQI} in ${selectedLocation} — ${lr.AQI>150?'Critical: trigger emergency protocol':lr.AQI>100?'Elevated: activate vehicle restrictions':'Within acceptable range'}` },
                        { icon:'💨', time:'8 min ago', color:'#38BDF8', text:`PM2.5 is ${lr.PM25>35.4?`above WHO limit (${lr.PM25} vs 35.4 µg). Recommend masks.`:'within safe range. Continue monitoring.'}` },
                        { icon:'🚗', time:'15 min ago', color:'#F59E0B', text:`Traffic index ${lr.traffic_index}%. ${lr.traffic_index>75?'Heavy congestion contributing ~30% to NO2 spike.':'Normal flow, low traffic contribution.'}` },
                        { icon:'💨', time:'22 min ago', color:'#F472B6', text:`Wind ${lr.wind_speed} km/h. ${lr.wind_speed<5?'Stagnant — pollutants accumulating.':'Adequate dispersion conditions.'}` },
                        { icon:'🏙️', time:'30 min ago', color:'#10B981', text:`City score: ${cityOverview?.city_score??'—'}/100. ${(cityOverview?.critical_zones??0)>0?`${cityOverview.critical_zones} zones need attention.`:'All zones nominal.'}` },
                      ].map((item,i)=>(
                        <motion.div key={i} initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.09 }}
                          style={{ display:'flex', gap:'10px', paddingBottom:'14px', borderBottom:i<4?'1px solid rgba(255,255,255,0.04)':'none' }}>
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', flexShrink:0 }}>
                            <span style={{ fontSize:'16px' }}>{item.icon}</span>
                            {i<4&&<div style={{ width:'1px', flex:1, background:'rgba(255,255,255,0.05)' }} />}
                          </div>
                          <div>
                            <div style={{ fontSize:'9px', color:'#334155', fontFamily:'monospace', marginBottom:'3px' }}>{item.time}</div>
                            <div style={{ fontSize:'11px', color:'#94A3B8', lineHeight:1.55 }}>{item.text}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

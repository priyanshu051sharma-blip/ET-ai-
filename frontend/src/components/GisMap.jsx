import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const STATUS_COLOR = { green: '#10B981', yellow: '#F59E0B', orange: '#F97316', red: '#EF4444' };

export default function GisMap({ locations, selectedLocation, onSelectLocation }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [hoveredLoc, setHoveredLoc] = useState(null);

  const createIcon = (loc, isSelected) => {
    const color = STATUS_COLOR[loc.aqi_color] || '#6B7280';
    const offline = loc.sensor_status === 'OFFLINE';
    const c = offline ? '#6B7280' : color;
    const size = isSelected ? 20 : 14;
    return L.divIcon({
      className: '',
      html: `<div style="position:relative;width:${size+12}px;height:${size+12}px;display:flex;align-items:center;justify-content:center">
        <div style="position:absolute;width:${size+12}px;height:${size+12}px;border-radius:50%;background:${c};opacity:0.25;animation:leafletPulse 2s infinite"></div>
        <div style="width:${size}px;height:${size}px;border-radius:50%;background:${c};border:2.5px solid rgba(0,0,0,0.6);box-shadow:0 0 14px ${c},0 0 6px ${c}"></div>
        ${isSelected ? `<div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,0.95);color:${c};font-size:9px;font-weight:800;white-space:nowrap;padding:2px 6px;border-radius:4px;border:1px solid ${c}44">${loc.name}</div>` : ''}
      </div>`,
      iconSize: [size + 12, size + 12],
      iconAnchor: [(size + 12) / 2, (size + 12) / 2],
      popupAnchor: [0, -(size + 16)],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, { center: [12.9716, 77.5946], zoom: 11, zoomControl: true, attributionControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
    mapRef.current = map;
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    locations.forEach(loc => {
      if (!loc.latitude || !loc.longitude) return;
      const isSelected = selectedLocation.toLowerCase() === loc.name.toLowerCase();
      const icon = createIcon(loc, isSelected);
      const marker = L.marker([loc.latitude, loc.longitude], { icon }).addTo(mapRef.current);
      const color = STATUS_COLOR[loc.aqi_color] || '#6B7280';
      marker.bindPopup(`
        <div style="background:rgba(10,16,32,0.98);border:1px solid rgba(56,189,248,0.2);padding:12px 14px;border-radius:10px;min-width:180px;font-family:system-ui,sans-serif;backdrop-filter:blur(12px)">
          <div style="font-weight:800;font-size:13px;color:#38BDF8;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">
            <span>${loc.name}</span>
            <span style="font-size:8px;padding:2px 7px;border-radius:4px;background:${loc.sensor_status==='ONLINE'?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)'};color:${loc.sensor_status==='ONLINE'?'#10B981':'#EF4444'};border:1px solid ${loc.sensor_status==='ONLINE'?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'};font-weight:800">${loc.sensor_status}</span>
          </div>
          <div style="font-size:11px;color:#64748B;margin-bottom:2px">${loc.sector_type||'—'}</div>
          <div style="display:flex;flex-direction:column;gap:4px;margin-top:8px;font-size:11px">
            <div style="display:flex;justify-content:space-between"><span style="color:#475569">AQI</span><span style="color:${color};font-weight:700">${loc.current_aqi} <span style="opacity:0.6;font-size:9px">(${loc.aqi_category||''})</span></span></div>
            <div style="display:flex;justify-content:space-between"><span style="color:#475569">WQI</span><span style="color:${loc.water_status==='SAFE'?'#10B981':'#EF4444'};font-weight:700">${loc.current_wqi||'—'} <span style="opacity:0.6;font-size:9px">(${loc.water_status||''})</span></span></div>
            <div style="display:flex;justify-content:space-between"><span style="color:#475569">Diagnostics</span><span style="color:#94A3B8;font-weight:600">🔋${loc.battery||100}% 📶${loc.signal||100}%</span></div>
          </div>
        </div>`, { closeButton: false, className: 'custom-leaflet-popup' });
      marker.on('click', () => onSelectLocation(loc.name));
      if (isSelected) { mapRef.current.setView([loc.latitude, loc.longitude], 12, { animate: true }); marker.openPopup(); }
      markersRef.current.push(marker);
    });
  }, [locations, selectedLocation]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'linear-gradient(135deg, rgba(10,16,32,0.98), rgba(15,23,42,0.95))',
        border: '1px solid rgba(56,189,248,0.15)',
        borderRadius: '18px',
        padding: '20px',
        boxShadow: '0 12px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
        color: '#fff',
        display: 'flex', flexDirection: 'column', gap: '14px',
        height: '540px',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8', boxShadow: '0 0 10px #38BDF8', display: 'inline-block' }} />
            Geospatial Digital Twin
          </div>
          <div style={{ fontSize: '11px', color: '#334155', marginTop: '3px' }}>
            Live telemetry — click markers to inspect sensor nodes
          </div>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {[['#10B981','Good'],['#F59E0B','Moderate'],['#EF4444','Critical']].map(([c,l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#64748B' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}`, display: 'inline-block' }} />
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div ref={mapContainerRef} className="dark-leaflet-map"
        style={{ flex: 1, borderRadius: '12px', border: '1px solid rgba(56,189,248,0.1)', overflow: 'hidden', zIndex: 1 }}
      />

      <style>{`
        @keyframes leafletPulse { 0% { transform:scale(0.6);opacity:0.9; } 100% { transform:scale(2.4);opacity:0; } }
        .custom-leaflet-popup .leaflet-popup-content-wrapper { background:rgba(10,16,32,0.97)!important;border:1px solid rgba(56,189,248,0.18)!important;box-shadow:0 16px 40px rgba(0,0,0,0.7)!important;border-radius:12px!important;padding:0!important;backdrop-filter:blur(16px); }
        .custom-leaflet-popup .leaflet-popup-content { margin:0!important; }
        .custom-leaflet-popup .leaflet-popup-tip-container { display:none; }
        .leaflet-control-zoom { background:rgba(15,23,42,0.9)!important;border:1px solid rgba(56,189,248,0.2)!important;border-radius:8px!important; }
        .leaflet-control-zoom a { background:transparent!important;color:#38BDF8!important;border-color:rgba(56,189,248,0.15)!important;font-size:16px!important; }
        .leaflet-control-zoom a:hover { background:rgba(56,189,248,0.1)!important; }
      `}</style>
    </motion.div>
  );
}

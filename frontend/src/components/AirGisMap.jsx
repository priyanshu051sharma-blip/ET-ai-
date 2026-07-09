import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const AQI_COLOR = (aqi) =>
  aqi <= 50 ? '#10B981' : aqi <= 100 ? '#F59E0B' : aqi <= 150 ? '#F97316' : aqi <= 200 ? '#EF4444' : '#7C3AED';

const AQI_LABEL = (aqi) =>
  aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : aqi <= 150 ? 'Sensitive' : aqi <= 200 ? 'Unhealthy' : 'Hazardous';

export default function AirGisMap({ zones = [], selectedLocation, onSelectLocation }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersRef = useRef([]);
  const circlesRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { center: [12.9716, 77.5946], zoom: 11, zoomControl: true, attributionControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
    mapRef.current = map;
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !zones.length) return;
    markersRef.current.forEach(m => m.remove());
    circlesRef.current.forEach(c => c.remove());
    markersRef.current = []; circlesRef.current = [];

    zones.forEach(zone => {
      if (!zone.latitude || !zone.longitude) return;
      const isSelected = selectedLocation === zone.name;
      const color = AQI_COLOR(zone.aqi);
      const label = AQI_LABEL(zone.aqi);

      // Heatmap circle
      const circle = L.circle([zone.latitude, zone.longitude], {
        radius: isSelected ? 900 : 600,
        color: color, fillColor: color, fillOpacity: 0.18, weight: 1.5, opacity: 0.5,
      }).addTo(mapRef.current);
      circlesRef.current.push(circle);

      // Marker icon
      const markerSize = isSelected ? 22 : 14;
      const icon = L.divIcon({
        className: '',
        html: `<div style="position:relative;width:${markerSize+14}px;height:${markerSize+14}px;display:flex;align-items:center;justify-content:center">
          <div style="position:absolute;width:${markerSize+14}px;height:${markerSize+14}px;border-radius:50%;background:${color};opacity:0.25;animation:aqiPulse 2s infinite"></div>
          <div style="width:${markerSize}px;height:${markerSize}px;border-radius:50%;background:${color};border:2.5px solid rgba(0,0,0,0.6);box-shadow:0 0 12px ${color},0 0 4px ${color};display:flex;align-items:center;justify-content:center;font-size:${isSelected?'8':'6'}px;font-weight:800;color:#fff">${zone.aqi}</div>
          ${isSelected ? `<div style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:rgba(10,16,32,0.96);color:${color};font-size:9px;font-weight:800;white-space:nowrap;padding:2px 7px;border-radius:4px;border:1px solid ${color}44">${zone.name}</div>` : ''}
        </div>`,
        iconSize: [markerSize + 14, markerSize + 14],
        iconAnchor: [(markerSize + 14) / 2, (markerSize + 14) / 2],
        popupAnchor: [0, -(markerSize + 16)],
      });

      const marker = L.marker([zone.latitude, zone.longitude], { icon }).addTo(mapRef.current);

      const popup = `<div style="background:rgba(4,11,26,0.97);border:1px solid ${color}44;padding:12px 14px;border-radius:10px;min-width:190px;font-family:system-ui,sans-serif">
        <div style="font-weight:800;font-size:13px;color:${color};margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">
          <span>${zone.name}</span>
          <span style="font-size:9px;padding:2px 8px;border-radius:4px;background:${color}20;border:1px solid ${color}44;font-weight:800">${label}</span>
        </div>
        <div style="font-size:11px;color:#64748B;margin-bottom:8px">${zone.sector_type}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;font-size:11px">
          <div style="color:#475569">AQI <span style="color:${color};font-weight:700">${zone.aqi}</span></div>
          <div style="color:#475569">PM2.5 <span style="color:#38BDF8;font-weight:700">${zone.pm25}µg</span></div>
          <div style="color:#475569">NO2 <span style="color:#818CF8;font-weight:700">${zone.no2}µg</span></div>
          <div style="color:#475569">Wind <span style="color:#F472B6;font-weight:700">${zone.wind_speed}km/h</span></div>
          <div style="color:#475569">Traffic <span style="color:#F59E0B;font-weight:700">${zone.traffic_index}%</span></div>
          <div style="color:#475569">Temp <span style="color:#94A3B8;font-weight:700">${zone.temperature}°C</span></div>
        </div>
      </div>`;

      marker.bindPopup(popup, { closeButton: false, className: 'custom-leaflet-popup' });
      marker.on('click', () => onSelectLocation(zone.name));
      if (isSelected) { mapRef.current.setView([zone.latitude, zone.longitude], 12, { animate: true }); marker.openPopup(); }
      markersRef.current.push(marker);
    });
  }, [zones, selectedLocation]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
      style={{ background: 'linear-gradient(135deg,rgba(4,11,26,0.98),rgba(10,20,42,0.95))', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '18px', padding: '20px', boxShadow: '0 12px 48px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', gap: '14px', height: '520px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8', boxShadow: '0 0 10px #38BDF8', display: 'inline-block' }} />
            AQI Hotspot Map — City Digital Twin
          </div>
          <div style={{ fontSize: '11px', color: '#334155', marginTop: '2px' }}>Live pollution heatmap — click zones to inspect sensor data</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {[['#10B981', 'Good'], ['#F59E0B', 'Moderate'], ['#F97316', 'Sensitive'], ['#EF4444', 'Unhealthy'], ['#7C3AED', 'Hazardous']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: '#64748B' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, display: 'inline-block', boxShadow: `0 0 5px ${c}` }} />{l}
            </div>
          ))}
        </div>
      </div>

      <div ref={containerRef} className="dark-leaflet-map"
        style={{ flex: 1, borderRadius: '12px', border: '1px solid rgba(56,189,248,0.1)', overflow: 'hidden', zIndex: 1 }} />

      <style>{`
        @keyframes aqiPulse { 0%{transform:scale(0.6);opacity:0.9} 100%{transform:scale(2.8);opacity:0} }
        .leaflet-control-zoom { background:rgba(10,16,32,0.92)!important;border:1px solid rgba(56,189,248,0.2)!important;border-radius:8px!important; }
        .leaflet-control-zoom a { background:transparent!important;color:#38BDF8!important;border-color:rgba(56,189,248,0.15)!important; }
        .leaflet-control-zoom a:hover { background:rgba(56,189,248,0.1)!important; }
      `}</style>
    </motion.div>
  );
}

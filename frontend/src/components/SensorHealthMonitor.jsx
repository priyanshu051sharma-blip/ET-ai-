import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function SensorCard({ sensor, idx }) {
  const [flipped, setFlipped] = useState(false);

  const isOnline = sensor.status === 'ONLINE';
  const batteryColor = sensor.battery < 20 ? '#EF4444' : sensor.battery < 50 ? '#F59E0B' : '#10B981';
  const signalColor = sensor.signal < 40 ? '#F59E0B' : '#10B981';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      style={{ perspective: '1000px', height: '78px', cursor: 'pointer' }}
      onClick={() => setFlipped(f => !f)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
      >
        {/* Front face */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
          background: isOnline ? 'rgba(30,41,59,0.8)' : 'rgba(127,29,29,0.3)',
          border: `1px solid ${isOnline ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(8px)',
        }}>
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <motion.span
                animate={isOnline ? { opacity: [1, 0.3, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: isOnline ? '#10B981' : '#EF4444',
                  display: 'block',
                  boxShadow: `0 0 8px ${isOnline ? '#10B981' : '#EF4444'}`,
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#F8FAFC', fontFamily: 'monospace' }}>
                {sensor.id}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>{sensor.location}</div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {/* Battery bar */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: '#64748B', marginBottom: '3px' }}>BAT</div>
              <div style={{ width: '36px', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${sensor.battery}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.05 }}
                  style={{ height: '100%', background: batteryColor, borderRadius: '3px' }}
                />
              </div>
              <div style={{ fontSize: '9px', color: batteryColor, marginTop: '2px', fontWeight: '700' }}>{sensor.battery.toFixed(0)}%</div>
            </div>

            {/* Signal bar */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: '#64748B', marginBottom: '3px' }}>SIG</div>
              <div style={{ width: '36px', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${sensor.signal}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.05 + 0.1 }}
                  style={{ height: '100%', background: signalColor, borderRadius: '3px' }}
                />
              </div>
              <div style={{ fontSize: '9px', color: signalColor, marginTop: '2px', fontWeight: '700' }}>{sensor.signal}%</div>
            </div>

            {/* Status badge */}
            <div style={{
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '9px',
              fontWeight: '700',
              background: isOnline ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: isOnline ? '#10B981' : '#EF4444',
              border: `1px solid ${isOnline ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
              {sensor.status}
            </div>
          </div>
        </div>

        {/* Back face */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: 'rgba(15,23,42,0.95)',
          border: '1px solid rgba(56,189,248,0.2)',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '4px',
        }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {sensor.sensor_type}
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8' }}>
            Last seen: {sensor.last_updated ? new Date(sensor.last_updated).toLocaleString() : '—'}
          </div>
          {sensor.maintenance_required ? (
            <div style={{ fontSize: '10px', color: '#EF4444', fontWeight: '600' }}>
              ⚠ {sensor.maintenance_reason}
            </div>
          ) : (
            <div style={{ fontSize: '10px', color: '#10B981', fontWeight: '600' }}>✓ No maintenance required</div>
          )}
          <div style={{ fontSize: '9px', color: '#475569', marginTop: '2px' }}>Click to flip back</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SensorHealthMonitor({ data }) {
  const onlineCount = data?.online_sensors ?? 0;
  const offlineCount = data?.offline_sensors ?? 0;
  const totalCount = data?.total_sensors ?? 0;
  const sensors = data?.sensors ?? [];

  const onlinePct = totalCount > 0 ? (onlineCount / totalCount) * 100 : 0;

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
        gap: '18px',
        minHeight: '340px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8', boxShadow: '0 0 8px #38BDF8' }} />
            IoT Sensor Network
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Click any card to inspect diagnostics</div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '9px', color: '#64748B', marginBottom: '4px' }}>UPTIME</div>
            <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${onlinePct}%` }}
                transition={{ duration: 1 }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #10B981, #34d399)', borderRadius: '3px' }}
              />
            </div>
            <div style={{ fontSize: '10px', color: '#10B981', marginTop: '2px', fontWeight: '700' }}>{onlinePct.toFixed(0)}%</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#10B981' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
              {onlineCount} Online
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#EF4444' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444' }} />
              {offlineCount} Offline
            </div>
          </div>
        </div>
      </div>

      {/* Sensor cards grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '260px', paddingRight: '4px' }}>
        {sensors.length === 0
          ? <div style={{ textAlign: 'center', color: '#475569', padding: '40px 0', fontSize: '13px' }}>Loading sensor arrays…</div>
          : sensors.map((sensor, idx) => (
            <SensorCard key={sensor.id} sensor={sensor} idx={idx} />
          ))
        }
      </div>
    </motion.div>
  );
}

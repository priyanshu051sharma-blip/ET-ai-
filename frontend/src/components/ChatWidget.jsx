import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatMessage } from '../data/api';

export default function ChatWidget({ selectedLocation }) {
  const [open, setOpen] = useState(false);
  const [messages, setMsgs] = useState([{
    role: 'assistant',
    text: `Hello! I'm EcoSphere AI. Ask me about air quality, water safety, alerts, or forecasts for ${selectedLocation || 'the network'}.`,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { endRef.current?.scrollIntoView({ behavior: 'smooth' }); setUnread(0); setTimeout(() => inputRef.current?.focus(), 80); }
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMsgs(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const reply = await sendChatMessage(text, selectedLocation);
      setMsgs(prev => [...prev, { role: 'assistant', text: reply }]);
      if (!open) setUnread(c => c + 1);
    } catch {
      setMsgs(prev => [...prev, { role: 'assistant', text: 'Unable to reach the assistant.' }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog" aria-label="EcoSphere AI assistant"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'fixed', bottom: '88px', right: '24px',
              width: '360px', height: '480px',
              background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.96))',
              border: '1px solid rgba(56,189,248,0.2)',
              borderRadius: '16px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              zIndex: 1000, backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div style={{
              background: 'rgba(56,189,248,0.08)',
              borderBottom: '1px solid rgba(56,189,248,0.12)',
              height: '52px', padding: '0 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <motion.div
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: '30px', height: '30px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0ea5e9, #0f3b6f)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', border: '1px solid rgba(56,189,248,0.3)',
                    boxShadow: '0 0 12px rgba(56,189,248,0.3)',
                  }}
                >🌍</motion.div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#F8FAFC' }}>EcoSphere Assistant</div>
                  <div style={{ fontSize: '9px', color: '#475569' }}>AI Environmental Copilot</div>
                </div>
              </div>
              <motion.button onClick={() => setOpen(false)} whileHover={{ scale: 1.1 }}
                style={{ background: 'none', border: 'none', color: '#475569', fontSize: '20px', cursor: 'pointer', lineHeight: 1, padding: '4px' }}>
                ×
              </motion.button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '84%', padding: '9px 13px', fontSize: '12.5px', lineHeight: 1.55, whiteSpace: 'pre-line',
                    borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                    background: msg.role === 'user' ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.05)',
                    color: msg.role === 'user' ? '#38BDF8' : '#94A3B8',
                    border: `1px solid ${msg.role === 'user' ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: '5px', padding: '8px' }}>
                  {[0,1,2].map(i => (
                    <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8' }} />
                  ))}
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px' }}>
              <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask about AQI, WQI, forecasts…"
                disabled={loading}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', padding: '8px 12px', fontSize: '12.5px', color: '#F8FAFC', outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#38BDF8'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <motion.button onClick={send} disabled={loading || !input.trim()}
                whileHover={input.trim() ? { scale: 1.05 } : {}}
                whileTap={input.trim() ? { scale: 0.95 } : {}}
                style={{
                  padding: '8px 14px', fontSize: '13px', fontWeight: '700', border: 'none', borderRadius: '8px',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  background: loading || !input.trim() ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #38BDF8, #0ea5e9)',
                  color: loading || !input.trim() ? '#475569' : '#0F172A',
                  transition: 'all 0.15s',
                }}>
                →
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble button */}
      <motion.button
        onClick={() => { setOpen(o => !o); setUnread(0); }}
        aria-label="Open EcoSphere AI assistant"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        animate={!open && unread > 0 ? { scale: [1, 1.08, 1] } : {}}
        transition={{ duration: 1, repeat: unread > 0 ? Infinity : 0 }}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '58px', height: '58px', borderRadius: '50%', border: 'none',
          background: open ? 'rgba(30,41,59,0.95)' : 'linear-gradient(135deg, #38BDF8, #0ea5e9)',
          color: open ? '#38BDF8' : '#0F172A',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(56,189,248,0.35)',
          zIndex: 1001,
          border: '1px solid rgba(56,189,248,0.3)',
        }}
      >
        <span style={{ fontSize: open ? '24px' : '22px', lineHeight: 1 }}>{open ? '×' : '🌍'}</span>
        {unread > 0 && !open && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
            style={{
              position: 'absolute', top: '2px', right: '2px',
              width: '18px', height: '18px', borderRadius: '50%',
              background: '#EF4444', color: '#fff', fontSize: '9px', fontWeight: '800',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #020817', boxShadow: '0 0 8px #EF4444',
            }}>
            {unread}
          </motion.span>
        )}
      </motion.button>
    </>
  );
}

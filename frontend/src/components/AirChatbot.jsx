import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendAirChat } from '../data/airApi';

const QUICK_QUESTIONS = [
  'Why is AQI rising in this zone?',
  'Which area needs immediate inspection?',
  'What actions should be taken today?',
  'Forecast for next 24 hours?',
  'Which groups are most at risk?',
  'What is the main pollution source?',
];

export default function AirChatbot({ selectedLocation }) {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    text: `Hello, I'm AirSense AI. I have live telemetry data for all 18 monitored zones. Ask me about AQI levels, pollution sources, intervention recommendations, or health advisories for ${selectedLocation}.`,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setLoading(true);
    try {
      const reply = await sendAirChat(msg, selectedLocation);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Unable to reach AI assistant. Check backend connection.' }]);
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'linear-gradient(135deg,rgba(10,16,32,0.98),rgba(15,26,52,0.95))', border: '1px solid rgba(56,189,248,0.12)', borderRadius: '18px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '520px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>

      {/* Header */}
      <div style={{ background: 'rgba(56,189,248,0.07)', borderBottom: '1px solid rgba(56,189,248,0.12)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <motion.div animate={{ rotateY: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#0ea5e9,#38BDF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', boxShadow: '0 0 14px rgba(56,189,248,0.4)', flexShrink: 0 }}>
          🤖
        </motion.div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>AI Authority Assistant</div>
          <div style={{ fontSize: '9px', color: '#475569' }}>Gemini-powered · Live telemetry context · {selectedLocation}</div>
        </div>
        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
          style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981', display: 'inline-block' }} />
      </div>

      {/* Quick questions */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {QUICK_QUESTIONS.map(q => (
          <button key={q} onClick={() => send(q)}
            style={{ padding: '4px 10px', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '20px', color: '#38BDF8', fontSize: '10px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s', flexShrink: 0 }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(56,189,248,0.18)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(56,189,248,0.08)'}>
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '86%', padding: '9px 13px', borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
              fontSize: '12.5px', lineHeight: 1.55, whiteSpace: 'pre-line',
              background: msg.role === 'user' ? 'rgba(56,189,248,0.18)' : 'rgba(255,255,255,0.05)',
              color: msg.role === 'user' ? '#38BDF8' : '#94A3B8',
              border: `1px solid ${msg.role === 'user' ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.06)'}`,
            }}>{msg.text}</div>
          </motion.div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '5px', padding: '8px' }}>
            {[0,1,2].map(i => (
              <motion.div key={i} animate={{ y: [0,-5,0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8' }} />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)' }}>
        <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask about AQI, pollution sources, interventions…"
          disabled={loading}
          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', fontSize: '12.5px', color: '#F8FAFC', outline: 'none', transition: 'border-color 0.15s' }}
          onFocus={e => e.target.style.borderColor = '#38BDF8'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
        <motion.button onClick={() => send()} disabled={loading || !input.trim()}
          whileHover={input.trim() ? { scale: 1.05 } : {}} whileTap={input.trim() ? { scale: 0.95 } : {}}
          style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 700, border: 'none', borderRadius: '8px', cursor: input.trim() ? 'pointer' : 'not-allowed', background: input.trim() ? 'linear-gradient(135deg,#0ea5e9,#38BDF8)' : 'rgba(255,255,255,0.08)', color: input.trim() ? '#020c1b' : '#475569', transition: 'all 0.15s' }}>
          Send
        </motion.button>
      </div>
    </motion.div>
  );
}

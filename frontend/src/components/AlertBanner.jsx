import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlertBanner({ show, title, message }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            background: 'linear-gradient(90deg, rgba(239,68,68,0.12), rgba(239,68,68,0.05))',
            borderLeft: '3px solid #EF4444',
            padding: '14px 20px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            marginBottom: '16px',
            borderRadius: '0 8px 8px 0',
            boxShadow: '0 0 20px rgba(239,68,68,0.15)',
            overflow: 'hidden',
          }}
        >
          <motion.span
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ fontSize: '18px', lineHeight: 1.4, flexShrink: 0 }}
          >
            ⚠️
          </motion.span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#EF4444', lineHeight: 1.4 }}>
              {title || 'Water Quality Warning'}
            </div>
            {message && (
              <div style={{ fontSize: '13px', color: 'rgba(148,163,184,0.9)', marginTop: '4px', lineHeight: 1.55 }}>
                {message}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

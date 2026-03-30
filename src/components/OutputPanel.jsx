import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../game/useGameStore';

/**
 * OutputPanel — cartoon terminal that shows execution output
 * Text appears with typewriter-style animation
 */
export default function OutputPanel() {
  const { outputs } = useGame();

  return (
    <div className="terminal">
      {/* Terminal Header */}
      <div className="terminal-header">
        <div className="terminal-dot" style={{ background: '#ef4444' }} />
        <div className="terminal-dot" style={{ background: '#fbbf24' }} />
        <div className="terminal-dot" style={{ background: '#4ade80' }} />
        <span style={{
          fontSize: 12,
          color: 'var(--color-text-dim)',
          marginLeft: 8,
          fontFamily: 'var(--font-code)',
        }}>
          output
        </span>
      </div>

      {/* Output Lines */}
      <div style={{ padding: '10px 14px', minHeight: 80 }}>
        <AnimatePresence>
          {outputs.map((line, i) => (
            <motion.div
              key={`${i}-${line}`}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{
                color: '#4ade80',
                fontFamily: 'var(--font-code)',
                fontSize: 13,
                padding: '2px 0',
                display: 'flex',
                gap: 8,
              }}
            >
              <span style={{ color: 'rgba(74, 222, 128, 0.4)', userSelect: 'none' }}>{'>'}</span>
              <span>{line}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Blinking cursor */}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
          style={{
            display: 'inline-block',
            width: 8,
            height: 16,
            background: '#4ade80',
            marginTop: 4,
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../game/useGameStore';

/**
 * HintBubble — collapsible hint panel. Collapsed by default.
 */
export default function HintBubble() {
  const { level } = useGame();
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className="hint-bubble"
      initial={{ opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
      key={level.id}
      style={{ maxWidth: '100%' }}
    >
      {/* Toggle header */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          color: 'inherit',
          fontFamily: 'inherit',
          minHeight: 28,
        }}
      >
        <span style={{ fontSize: 16 }}>💡</span>
        <span style={{
          fontWeight: 800,
          fontSize: 12,
          color: 'var(--color-accent)',
          textTransform: 'uppercase',
          letterSpacing: 1,
          flex: 1,
          textAlign: 'left',
        }}>
          Hint
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: 10, color: 'var(--color-accent)', opacity: 0.7 }}
        >
          ▼
        </motion.span>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{
              fontSize: 13,
              lineHeight: 1.5,
              color: 'var(--color-text)',
              margin: 0,
              paddingTop: 8,
            }}>
              {level.hint}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

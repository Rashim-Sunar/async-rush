import { motion } from 'framer-motion';
import { useGame } from '../game/useGameStore';

/**
 * HintBubble — floating speech bubble in top-right with level hint
 */
export default function HintBubble() {
  const { level } = useGame();

  return (
    <motion.div
      className="hint-bubble"
      initial={{ opacity: 0, y: -20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
      key={level.id}
      style={{ maxWidth: 280 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 16 }}>💡</span>
        <span style={{ fontWeight: 800, fontSize: 12, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Hint
        </span>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--color-text)', margin: 0 }}>
        {level.hint}
      </p>
    </motion.div>
  );
}

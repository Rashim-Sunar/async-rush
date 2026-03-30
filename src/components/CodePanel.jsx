import { motion } from 'framer-motion';
import { useGame } from '../game/useGameStore';

/**
 * CodePanel — displays the level's code with syntax highlighting
 * Each line is color-coded to match its task ball type
 */
export default function CodePanel() {
  const { level, currentStepIndex, phase } = useGame();

  return (
    <div className="glass-card" style={{ padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>📜</span>
        <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: 0.5 }}>CODE</span>
        <span style={{
          fontSize: 11,
          color: 'var(--color-text-dim)',
          marginLeft: 'auto',
          fontFamily: 'var(--font-code)',
        }}>
          script.js
        </span>
      </div>

      {/* Code Lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {level.code.map((line, i) => {
          // Determine if this line's associated step is already executed
          const isActive = phase === 'execute' || phase === 'animating';

          return (
            <motion.div
              key={i}
              className="code-line"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}
              style={{
                color: line.color,
                borderLeftColor: isActive ? line.color : 'transparent',
              }}
            >
              <span style={{ color: 'rgba(167, 139, 250, 0.3)', marginRight: 12, fontSize: 11, userSelect: 'none' }}>
                {String(i + 1).padStart(2, ' ')}
              </span>
              {line.text}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../game/useGameStore';
import { LEVELS } from '../game/levels';

/**
 * LevelComplete — victory overlay with confetti animation and progression
 */
export default function LevelComplete() {
  const { showLevelComplete, score, currentLevelIndex, level, wrongMoves, actions } = useGame();
  const isLastLevel = currentLevelIndex >= LEVELS.length - 1;

  // Star rating based on wrong moves
  const stars = wrongMoves === 0 ? 3 : wrongMoves <= 2 ? 2 : 1;

  return (
    <AnimatePresence>
      {showLevelComplete && (
        <motion.div
          className="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              background: 'linear-gradient(145deg, rgba(30, 20, 70, 0.95), rgba(60, 30, 100, 0.95))',
              border: '2px solid rgba(251, 191, 36, 0.4)',
              borderRadius: 28,
              padding: '40px 50px',
              textAlign: 'center',
              maxWidth: 420,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative glow */}
            <div style={{
              position: 'absolute',
              top: -50,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }} />

            {/* Trophy */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{ fontSize: 64, marginBottom: 8 }}
            >
              🏆
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: 28,
                fontWeight: 900,
                background: 'linear-gradient(135deg, #fbbf24, #f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: '8px 0',
              }}
            >
              Level Complete!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ color: 'var(--color-text-dim)', fontSize: 14, margin: '4px 0 16px' }}
            >
              {level.title}
            </motion.p>

            {/* Stars */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              style={{ fontSize: 36, marginBottom: 16, display: 'flex', justifyContent: 'center', gap: 4 }}
            >
              {[1, 2, 3].map(s => (
                <motion.span
                  key={s}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5 + s * 0.15, type: 'spring', stiffness: 300 }}
                >
                  {s <= stars ? '⭐' : '☆'}
                </motion.span>
              ))}
            </motion.div>

            {/* Score */}
            <div style={{
              fontSize: 18,
              fontWeight: 800,
              color: 'var(--color-accent)',
              marginBottom: 24,
            }}>
              Score: {score}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <motion.button
                className="btn-secondary"
                onClick={actions.resetLevel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔄 Replay
              </motion.button>

              {!isLastLevel && (
                <motion.button
                  className="btn-execute"
                  onClick={actions.nextLevel}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  Next Level ➡️
                </motion.button>
              )}

              {isLastLevel && (
                <motion.button
                  className="btn-execute"
                  onClick={actions.resetLevel}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🎉 You Won!
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Floating confetti particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: '50vw',
                y: '50vh',
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: `${Math.random() * 100}vw`,
                y: `${Math.random() * 100}vh`,
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
                rotate: Math.random() * 720,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: 'easeOut',
              }}
              style={{
                position: 'fixed',
                width: 10 + Math.random() * 10,
                height: 10 + Math.random() * 10,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                background: ['#fbbf24', '#f472b6', '#4ade80', '#c084fc', '#60a5fa'][Math.floor(Math.random() * 5)],
                pointerEvents: 'none',
                zIndex: 101,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

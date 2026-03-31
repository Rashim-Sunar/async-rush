import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../game/useGameStore';
import { useEffect, useState } from 'react';

/**
 * LevelComplete — victory overlay.
 * Props:
 *   onNextQuestion — navigate to next question (provided by GameBoard)
 *   isLastQuestion — boolean, show "All Done" instead of "Next Question"
 */
export default function LevelComplete({ onNextQuestion, isLastQuestion }) {
  const { showLevelComplete, score, level, wrongMoves, actions } = useGame();

  const stars = wrongMoves === 0 ? 3 : wrongMoves <= 2 ? 2 : 1;

  const [showDelayed, setShowDelayed] = useState(false);
  useEffect(() => {
    if (showLevelComplete) {
      const t = setTimeout(() => setShowDelayed(true), 1200);
      return () => clearTimeout(t);
    } else {
      setShowDelayed(false);
    }
  }, [showLevelComplete]);

  return (
    <AnimatePresence>
      {showDelayed && (
        <motion.div
          className="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            style={{
              background: 'linear-gradient(145deg, rgba(25,15,60,0.98), rgba(50,25,90,0.98))',
              border: '2px solid rgba(251,191,36,0.35)',
              borderRadius: 28,
              padding: '40px 52px',
              textAlign: 'center',
              maxWidth: 420, width: '90vw',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 80px rgba(251,191,36,0.12), 0 24px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Top glow */}
            <div style={{
              position: 'absolute', top: -60, left: '50%',
              transform: 'translateX(-50%)',
              width: 220, height: 220,
              background: 'radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)',
              borderRadius: '50%', pointerEvents: 'none',
            }} />

            {/* Shimmer sweep */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, delay: 0.5, ease: 'easeInOut' }}
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
                pointerEvents: 'none',
              }}
            />

            {/* Trophy */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              style={{ fontSize: 66, marginBottom: 6 }}
            >
              🏆
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{
                fontSize: 28, fontWeight: 900, margin: '6px 0 4px',
                background: 'linear-gradient(135deg, #fbbf24, #f472b6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}
            >
              Question Cleared!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.32 }}
              style={{
                color: 'var(--color-text-dim)', fontSize: 13,
                margin: '0 0 18px',
                fontFamily: 'var(--font-code)',
              }}
            >
              {level.title}
            </motion.p>

            {/* Stars */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                display: 'flex', justifyContent: 'center', gap: 6,
                fontSize: 38, marginBottom: 18,
              }}
            >
              {[1, 2, 3].map(s => (
                <motion.span
                  key={s}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.42 + s * 0.14, type: 'spring', stiffness: 300 }}
                >
                  {s <= stars ? '⭐' : '☆'}
                </motion.span>
              ))}
            </motion.div>

            {/* Score */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              style={{
                fontSize: 18, fontWeight: 800,
                color: 'var(--color-accent)', marginBottom: 28,
              }}
            >
              Score: {score}
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72 }}
              style={{ display: 'flex', gap: 12, justifyContent: 'center' }}
            >
              <motion.button
                className="btn-secondary"
                onClick={actions.resetLevel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔄 Retry
              </motion.button>

              {!isLastQuestion ? (
                <motion.button
                  className="btn-execute"
                  onClick={onNextQuestion}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ position: 'relative', overflow: 'hidden' }}
                >
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                      pointerEvents: 'none',
                    }}
                  />
                  <span style={{ position: 'relative', zIndex: 1 }}>Next Question ➡️</span>
                </motion.button>
              ) : (
                <motion.button
                  className="btn-execute"
                  onClick={onNextQuestion}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🎉 Zone Complete!
                </motion.button>
              )}
            </motion.div>
          </motion.div>

          {/* Confetti */}
          {Array.from({ length: 22 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: '50vw', y: '50vh', scale: 0, opacity: 1 }}
              animate={{
                x: `${15 + Math.random() * 70}vw`,
                y: `${10 + Math.random() * 80}vh`,
                scale: [0, 1.6, 0],
                opacity: [1, 1, 0],
                rotate: Math.random() * 720,
              }}
              transition={{
                duration: 1.8 + Math.random() * 1.8,
                delay: Math.random() * 0.4,
                ease: 'easeOut',
              }}
              style={{
                position: 'fixed',
                width: 8 + Math.random() * 10,
                height: 8 + Math.random() * 10,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                background: ['#fbbf24', '#f472b6', '#4ade80', '#c084fc', '#60a5fa'][i % 5],
                pointerEvents: 'none', zIndex: 101,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

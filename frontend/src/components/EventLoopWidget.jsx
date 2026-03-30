import { motion } from 'framer-motion';
import { useGame } from '../game/useGameStore';

export default function EventLoopWidget() {
  const { eventLoopActive, phase } = useGame();

  const isSpinning = eventLoopActive || phase === 'animating';
  const spinSpeed = eventLoopActive ? 1.2 : (phase === 'animating' ? 3 : 8);

  return (
    <div className="event-loop-widget">
      <svg
        viewBox="0 0 140 140"
        width="140"
        height="140"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <linearGradient id="outerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
          <filter id="glowFilter">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: spinSpeed, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '50%', originY: '50%', transformOrigin: '70px 70px' }}
        >
          <circle
            cx="70" cy="70" r="58"
            fill="none"
            stroke="url(#outerGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="80 30 50 30"
            filter={isSpinning ? "url(#glowFilter)" : "none"}
            opacity={isSpinning ? 1 : 0.6}
          />
          <polygon points="118,52 128,62 118,62" fill="#fbbf24" />
          <polygon points="22,78 12,68 22,68" fill="#fbbf24" />
        </motion.g>

        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: spinSpeed * 1.5, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '50%', originY: '50%', transformOrigin: '70px 70px' }}
        >
          <circle
            cx="70" cy="70" r="44"
            fill="none"
            stroke="url(#innerGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="60 25 40 25"
            opacity={isSpinning ? 0.9 : 0.4}
          />
          <polygon points="108,55 114,62 104,62" fill="#f472b6" />
          <polygon points="32,78 26,71 36,71" fill="#f472b6" />
        </motion.g>
      </svg>

      <motion.div
        className="event-loop-center"
        animate={{
          boxShadow: isSpinning
            ? [
                '0 0 15px rgba(251, 191, 36, 0.3)',
                '0 0 30px rgba(251, 191, 36, 0.6)',
                '0 0 15px rgba(251, 191, 36, 0.3)',
              ]
            : '0 0 10px rgba(251, 191, 36, 0.15)',
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span className="event-loop-label">EVENT</span>
        <span className="event-loop-label">LOOP</span>
        <motion.div
          className="event-loop-icon"
          animate={{ rotate: isSpinning ? 360 : 0 }}
          transition={{ duration: isSpinning ? 1 : 0, repeat: isSpinning ? Infinity : 0, ease: 'linear' }}
        >
          &#x21BB;
        </motion.div>
      </motion.div>

      {isSpinning && (
        <motion.div
          className="event-loop-pulse-ring"
          initial={{ scale: 0.8, opacity: 0.6 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}

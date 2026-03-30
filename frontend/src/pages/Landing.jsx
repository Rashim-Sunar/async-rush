import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Suspense, useState } from 'react';
import EngineScene from '../scene/EngineScene';

const SUBTITLE_WORDS = 'Control the flow. Beat the chaos.'.split(' ');

const TASK_BALLS = [
  {
    label: 'sync',
    tooltipLabel: 'Sync',
    color: '#22c55e',
    shadow: '0 0 20px #22c55e, inset -6px -6px 12px rgba(0,0,0,0.4), inset 4px 4px 8px rgba(255,255,255,0.3)',
    shadowHover: '0 0 40px #22c55e, 0 0 80px rgba(34,197,94,0.35), inset -6px -6px 12px rgba(0,0,0,0.4), inset 4px 4px 8px rgba(255,255,255,0.3)',
    bounceDuration: 2.1,
    mountDelay: 0.6,
  },
  {
    label: 'promise',
    tooltipLabel: 'Promise',
    color: '#a855f7',
    shadow: '0 0 20px #a855f7, inset -6px -6px 12px rgba(0,0,0,0.4), inset 4px 4px 8px rgba(255,255,255,0.3)',
    shadowHover: '0 0 40px #a855f7, 0 0 80px rgba(168,85,247,0.35), inset -6px -6px 12px rgba(0,0,0,0.4), inset 4px 4px 8px rgba(255,255,255,0.3)',
    bounceDuration: 1.8,
    mountDelay: 0.7,
  },
  {
    label: 'timeout',
    tooltipLabel: 'setTimeout',
    color: '#3b82f6',
    shadow: '0 0 20px #3b82f6, inset -6px -6px 12px rgba(0,0,0,0.4), inset 4px 4px 8px rgba(255,255,255,0.3)',
    shadowHover: '0 0 40px #3b82f6, 0 0 80px rgba(59,130,246,0.35), inset -6px -6px 12px rgba(0,0,0,0.4), inset 4px 4px 8px rgba(255,255,255,0.3)',
    bounceDuration: 2.4,
    mountDelay: 0.8,
  },
];

const DEBRIS = [
  {
    top: '11%', left: '7%', width: 64, height: 64,
    borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
    bg: 'rgba(199,125,255,0.08)', blur: 10,
    animation: 'debris-1 18s ease-in-out infinite',
  },
  {
    top: '68%', left: '5%', width: 96, height: 96,
    borderRadius: '50%',
    bg: 'rgba(78,205,196,0.06)', blur: 14,
    animation: 'debris-2 22s ease-in-out infinite',
  },
  {
    top: '18%', right: '6%', width: 72, height: 72,
    borderRadius: '50% 20% 50% 20%',
    bg: 'rgba(255,107,107,0.07)', blur: 10,
    animation: 'debris-3 16s ease-in-out infinite',
  },
  {
    top: '74%', right: '8%', width: 52, height: 52,
    borderRadius: '20%',
    bg: 'rgba(255,217,61,0.08)', blur: 8,
    animation: 'debris-4 20s ease-in-out infinite',
  },
  {
    top: '43%', left: '2%', width: 42, height: 42,
    borderRadius: '50% 50% 20% 80%',
    bg: 'rgba(78,205,196,0.09)', blur: 8,
    animation: 'debris-5 15s ease-in-out infinite',
  },
];

const subtitleVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.9 } },
};

const wordVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function Landing() {
  const navigate = useNavigate();
  const [hoveredBall, setHoveredBall] = useState(null);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(145deg, #0f0a2e 0%, #1a0e3e 40%, #12082e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>

      {/* Three.js background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }}>
        <Suspense fallback={null}>
          <EngineScene phase="drag" />
        </Suspense>
      </div>

      {/* Ambient radial orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.16, 0.08] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '15%', left: '20%',
            width: 420, height: 420,
            background: 'radial-gradient(circle, rgba(192,132,252,0.22) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.13, 0.06] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            position: 'absolute', bottom: '10%', right: '15%',
            width: 520, height: 520,
            background: 'radial-gradient(circle, rgba(96,165,250,0.16) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.11, 0.05] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 360, height: 360,
            background: 'radial-gradient(circle, rgba(251,191,36,0.13) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
      </div>

      {/* Floating debris shapes */}
      {DEBRIS.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: d.top, left: d.left, right: d.right,
            width: d.width, height: d.height,
            borderRadius: d.borderRadius,
            background: d.bg,
            filter: `blur(${d.blur}px)`,
            animation: d.animation,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Hero content stack */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>

        {/* Lightning bolt — delay 0 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
          transition={{
            opacity: { duration: 0.6 },
            scale: { duration: 0.6, type: 'spring', stiffness: 220 },
            y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 },
          }}
          style={{
            fontSize: 72,
            filter: 'drop-shadow(0 0 40px rgba(192,132,252,0.55))',
            marginBottom: 14,
          }}
        >
          ⚡
        </motion.div>

        {/* Title — delay 0.3, gradient cycle + letter-spacing pulse + Y-axis skew */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0, rotateX: [0, 3, 0] }}
          transition={{
            opacity: { delay: 0.3, duration: 0.6 },
            y: { delay: 0.3, duration: 0.6 },
            rotateX: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 },
          }}
          className="hero-title"
          style={{
            fontSize: 'clamp(48px, 8vw, 76px)',
            fontWeight: 900,
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.1,
            transformPerspective: 800,
          }}
        >
          Async Rush
        </motion.h1>

        {/* Task balls — staggered from delay 0.6 */}
        <div style={{ display: 'flex', gap: 20, margin: '30px 0 0' }}>
          {TASK_BALLS.map((ball) => {
            const hovered = hoveredBall === ball.label;
            return (
              <div
                key={ball.label}
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                {/* Mount spring */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: ball.mountDelay, type: 'spring', stiffness: 260, damping: 18 }}
                >
                  {/* Continuous bounce */}
                  <motion.div
                    animate={{ y: [0, -18, 0] }}
                    transition={{ duration: ball.bounceDuration, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {/* Ball — hover scale + glow */}
                    <motion.div
                      onHoverStart={() => setHoveredBall(ball.label)}
                      onHoverEnd={() => setHoveredBall(null)}
                      whileHover={{ scale: 1.4 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        width: 52, height: 52,
                        borderRadius: '50%',
                        background: ball.color,
                        boxShadow: hovered ? ball.shadowHover : ball.shadow,
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.25s ease',
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: 9, left: 11,
                        width: 14, height: 9,
                        background: 'rgba(255,255,255,0.45)',
                        borderRadius: '50%',
                        transform: 'rotate(-30deg)',
                        pointerEvents: 'none',
                      }} />
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Tooltip */}
                <motion.div
                  animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : -6 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(15,10,46,0.92)',
                    border: `1px solid ${ball.color}66`,
                    borderRadius: 8,
                    padding: '4px 10px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: ball.color,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    letterSpacing: 1,
                  }}
                >
                  {ball.tooltipLabel}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Subtitle — word-by-word stagger, delay 0.9 */}
        <motion.div
          variants={subtitleVariants}
          initial="hidden"
          animate="show"
          style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.4em',
            justifyContent: 'center',
            margin: '22px 0 38px',
            fontFamily: 'var(--font-code)',
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: '0.2em',
            color: '#a78bfa',
            textTransform: 'uppercase',
          }}
        >
          {SUBTITLE_WORDS.map((word, i) => (
            <motion.span key={i} variants={wordVariant}>{word}</motion.span>
          ))}
        </motion.div>

        {/* CTA button — delay 1.1, sonar ping */}
        <motion.button
          onClick={() => navigate('/game')}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            boxShadow: [
              '0 0 0px 0px rgba(251,191,36,0.75), 0 4px 20px rgba(0,0,0,0.3)',
              '0 0 0px 28px rgba(251,191,36,0),    0 4px 20px rgba(0,0,0,0.3)',
              '0 0 0px 0px rgba(251,191,36,0),    0 4px 20px rgba(0,0,0,0.3)',
            ],
          }}
          transition={{
            opacity: { delay: 1.1, duration: 0.5 },
            y: { delay: 1.1, duration: 0.5 },
            boxShadow: { duration: 2, repeat: Infinity, ease: 'easeOut', delay: 1.7 },
          }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="btn-cta"
          style={{
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            color: '#451a03',
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 20,
            padding: '16px 52px',
            borderRadius: 18,
            border: 'none',
            cursor: 'pointer',
            letterSpacing: 1,
            textTransform: 'uppercase',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2.2 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              pointerEvents: 'none',
            }}
          />
          <span style={{ position: 'relative', zIndex: 1 }}>▶ Start Playing</span>
        </motion.button>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          style={{
            fontSize: 12,
            color: 'rgba(167,139,250,0.35)',
            marginTop: 44,
            letterSpacing: 1,
          }}
        >
          Learn JavaScript execution through play
        </motion.p>
      </div>
    </div>
  );
}

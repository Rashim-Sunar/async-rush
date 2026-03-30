import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Suspense } from 'react';
import EngineScene from '../scene/EngineScene';

export default function Landing() {
  const navigate = useNavigate();

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
      {/* 3D background scene at low opacity */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }}>
        <Suspense fallback={null}>
          <EngineScene phase="drag" />
        </Suspense>
      </div>

      {/* Ambient gradient orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '15%',
            left: '20%',
            width: 400,
            height: 400,
            background: 'radial-gradient(circle, rgba(192, 132, 252, 0.2) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '15%',
            width: 500,
            height: 500,
            background: 'radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 350,
            height: 350,
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.12) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
      </div>

      {/* Center content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}>
        {/* Animated icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 30 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -8, 0],
          }}
          transition={{
            opacity: { duration: 0.8 },
            scale: { duration: 0.8, type: 'spring', stiffness: 200 },
            y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 },
          }}
          style={{
            fontSize: 72,
            filter: 'drop-shadow(0 0 40px rgba(192, 132, 252, 0.4))',
            marginBottom: 8,
          }}
        >
          ⚡
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            fontSize: 64,
            fontWeight: 900,
            background: 'linear-gradient(135deg, #fbbf24, #f472b6, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            letterSpacing: -2,
            textAlign: 'center',
            lineHeight: 1.1,
            filter: 'drop-shadow(0 0 30px rgba(251, 191, 36, 0.2))',
          }}
        >
          Async Rush
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            fontSize: 18,
            color: 'rgba(167, 139, 250, 0.7)',
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: 'uppercase',
            margin: '4px 0 32px',
            textAlign: 'center',
          }}
        >
          Control the flow. Beat the chaos.
        </motion.p>

        {/* Start Button */}
        <motion.button
          onClick={() => navigate('/game')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          whileHover={{
            scale: 1.08,
            boxShadow: '0 0 40px rgba(251, 191, 36, 0.5), 0 0 80px rgba(251, 191, 36, 0.2)',
          }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            color: '#451a03',
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 20,
            padding: '16px 48px',
            borderRadius: 18,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 24px rgba(251, 191, 36, 0.3), 0 4px 20px rgba(0, 0, 0, 0.3)',
            letterSpacing: 1,
            textTransform: 'uppercase',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Glow shimmer effect */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              pointerEvents: 'none',
            }}
          />
          <span style={{ position: 'relative', zIndex: 1 }}>▶ Start Playing</span>
        </motion.button>

        {/* Subtle footer text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          style={{
            fontSize: 12,
            color: 'rgba(167, 139, 250, 0.35)',
            marginTop: 40,
            letterSpacing: 1,
          }}
        >
          Learn JavaScript execution through play
        </motion.p>
      </div>
    </div>
  );
}

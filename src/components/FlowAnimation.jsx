import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../game/useGameStore';
import { useEffect, useState, useCallback } from 'react';
import { TYPE_COLORS } from '../game/levels';

export default function FlowAnimation() {
  const {
    animatingBall, phase, level, getComponentRect, actions,
    currentFlowIndex, currentAnimWaypoint,
  } = useGame();

  const [fromPos, setFromPos] = useState(null);
  const [toPos, setToPos] = useState(null);
  const [ballData, setBallData] = useState(null);

  const calculatePositions = useCallback(() => {
    if (!animatingBall) return;

    const fromRect = getComponentRect(animatingBall.from);
    const toRect = getComponentRect(animatingBall.to);

    if (fromRect) {
      setFromPos({
        x: fromRect.left + fromRect.width / 2,
        y: fromRect.top + fromRect.height / 2,
      });
    }
    if (toRect) {
      setToPos({
        x: toRect.left + toRect.width / 2,
        y: toRect.top + toRect.height / 2,
      });
    }

    const ball = level.balls.find(b => b.id === animatingBall.ballId);
    setBallData(ball);
  }, [animatingBall, getComponentRect, level]);

  useEffect(() => {
    if (phase !== 'animating' || !animatingBall) {
      setFromPos(null);
      setToPos(null);
      setBallData(null);
      return;
    }

    const timer = setTimeout(() => calculatePositions(), 50);
    return () => clearTimeout(timer);
  }, [phase, animatingBall, calculatePositions]);

  const handleAnimationComplete = useCallback(() => {
    if (!animatingBall) return;

    const currentStep = level.flow[currentFlowIndex];
    if (!currentStep) return;

    const path = currentStep.animationPath;
    const nextWaypoint = currentAnimWaypoint + 1;

    if (nextWaypoint < path.length) {
      setTimeout(() => actions.advanceWaypoint(), 300);
    } else {
      setTimeout(() => actions.finishFlowStep(), 400);
    }
  }, [animatingBall, level, currentFlowIndex, currentAnimWaypoint, actions]);

  if (phase !== 'animating' || !animatingBall || !fromPos || !toPos || !ballData) {
    return null;
  }

  const colors = TYPE_COLORS[ballData.type];
  const isSameSpot = animatingBall.from === animatingBall.to;

  if (isSameSpot) {
    setTimeout(() => handleAnimationComplete(), 600);
    return (
      <div className="flow-animation-overlay">
        <motion.div
          className="flow-ball"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: [0.5, 1.3, 1],
            opacity: [0, 1, 1],
          }}
          transition={{ duration: 0.5 }}
          style={{
            left: fromPos.x - 25,
            top: fromPos.y - 25,
            background: `radial-gradient(circle at 35% 35%, ${colors.bg}, ${colors.dark})`,
            boxShadow: `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}`,
          }}
        >
          <span className="flow-ball-label">{ballData.label}</span>
        </motion.div>
      </div>
    );
  }

  const midX = (fromPos.x + toPos.x) / 2;
  const midY = Math.min(fromPos.y, toPos.y) - 60;

  return (
    <div className="flow-animation-overlay">
      <svg className="flow-trail-svg" width="100%" height="100%">
        <defs>
          <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.bg} stopOpacity="0" />
            <stop offset="50%" stopColor={colors.bg} stopOpacity="0.6" />
            <stop offset="100%" stopColor={colors.bg} stopOpacity="0" />
          </linearGradient>
          <filter id="trailGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.path
          d={`M ${fromPos.x} ${fromPos.y} Q ${midX} ${midY} ${toPos.x} ${toPos.y}`}
          fill="none"
          stroke="url(#trailGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#trailGlow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </svg>

      <motion.div
        className="flow-ball"
        initial={{
          left: fromPos.x - 25,
          top: fromPos.y - 25,
          scale: 1,
          opacity: 1,
        }}
        animate={{
          left: toPos.x - 25,
          top: toPos.y - 25,
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
          scale: { duration: 0.8, times: [0, 0.5, 1] },
        }}
        onAnimationComplete={handleAnimationComplete}
        style={{
          background: `radial-gradient(circle at 35% 35%, ${colors.bg}, ${colors.dark})`,
          boxShadow: `0 0 25px ${colors.glow}, 0 0 50px ${colors.glow}`,
        }}
      >
        <div className="flow-ball-shine" />
        <span className="flow-ball-label">{ballData.label}</span>
      </motion.div>

      <AnimatePresence>
        <motion.div
          className="flow-waypoint-label"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            left: toPos.x,
            top: toPos.y + 35,
          }}
        >
          {getComponentLabel(animatingBall.to)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function getComponentLabel(id) {
  const labels = {
    callstack: 'Call Stack',
    webapi: 'Web API',
    microtask: 'Microtask Queue',
    macrotask: 'Macrotask Queue',
  };
  return labels[id] || id;
}

import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../game/useGameStore';
import TaskBall from './TaskBall';

/**
 * EngineComponent — drop zone for task balls (Call Stack, Web API, Queues)
 * Shows placed balls inside with visual feedback
 */
export default function EngineComponent({ component }) {
  const { id, label, color, borderColor, bgColor } = component;
  const { placedBalls, level } = useGame();

  const { isOver, setNodeRef } = useDroppable({ id });

  // Get balls placed in this component
  const ballIds = placedBalls[id] || [];
  const balls = ballIds.map(bid => level.balls.find(b => b.id === bid)).filter(Boolean);

  return (
    <motion.div
      ref={setNodeRef}
      className={`engine-box ${isOver ? 'is-over' : ''}`}
      style={{
        background: bgColor,
        border: `2px solid ${borderColor}`,
        boxShadow: isOver
          ? `0 0 30px ${borderColor}, inset 0 0 20px ${bgColor}`
          : `0 0 12px ${borderColor.replace('0.4', '0.15')}`,
      }}
      animate={isOver ? { scale: 1.04 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {/* Label */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 8,
      }}>
        <span style={{
          fontWeight: 800,
          fontSize: 12,
          color: color,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
        }}>
          {label}
        </span>
      </div>

      {/* Placed Balls */}
      <div style={{
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        justifyContent: 'center',
        minHeight: 44,
        alignItems: 'center',
      }}>
        <AnimatePresence>
          {balls.map(ball => (
            <motion.div
              key={ball.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              <div
                className={`task-ball ${ball.type}`}
                style={{
                  width: 40,
                  height: 40,
                  fontSize: 8,
                  cursor: 'default',
                }}
              >
                {/* Shine */}
                <div style={{
                  position: 'absolute',
                  top: 4,
                  left: 6,
                  width: 12,
                  height: 8,
                  background: 'rgba(255,255,255,0.4)',
                  borderRadius: '50%',
                  transform: 'rotate(-30deg)',
                  pointerEvents: 'none',
                }} />
                <span style={{ position: 'relative', zIndex: 2, fontWeight: 800 }}>
                  {ball.label}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {balls.length === 0 && (
          <motion.span
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              fontSize: 11,
              color: color,
              fontWeight: 600,
              opacity: 0.4,
            }}
          >
            {isOver ? '✨ Drop here!' : 'Drop tasks here'}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}

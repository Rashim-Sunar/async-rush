import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { TYPE_COLORS } from '../game/levels';

/**
 * TaskBall — draggable colored sphere representing a code task
 * Uses the active level's randomized color mapping so colors are not fixed by task type.
 */
export default function TaskBall({ ball, isSmall = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ball.id,
    data: { ball },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 999 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const size = isSmall ? 40 : 56;
  const colors = ball.colorStyle || TYPE_COLORS[ball.type];

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="task-ball"
      style={{
        ...style,
        width: size,
        height: size,
        fontSize: isSmall ? 9 : 11,
        background: `radial-gradient(circle at 35% 35%, ${colors.bg}, ${colors.dark})`,
        boxShadow: `0 0 20px ${colors.glow}, inset 0 -4px 8px rgba(0,0,0,0.2)`,
        color: '#ffffff',
      }}
      animate={isDragging ? { scale: 1.15 } : { scale: 1 }}
      whileHover={{ scale: 1.12 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      layout
    >
      {/* Shine effect */}
      <div style={{
        position: 'absolute',
        top: 6,
        left: 8,
        width: size * 0.3,
        height: size * 0.2,
        background: 'rgba(255,255,255,0.4)',
        borderRadius: '50%',
        transform: 'rotate(-30deg)',
        pointerEvents: 'none',
      }} />
      <span
        style={{
          position: 'relative',
          zIndex: 2,
          fontWeight: 400,
          textShadow: '0 1px 2px rgba(0,0,0,0.85), 0 0 6px rgba(0,0,0,0.65)',
          letterSpacing: 0.2,
        }}
      >
        {ball.label}
      </span>
    </motion.div>
  );
}

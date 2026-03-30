import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';

/**
 * TaskBall — draggable colored sphere representing a code task
 * Color-coded by type: sync (green), promise (purple), timeout (blue)
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

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`task-ball ${ball.type}`}
      style={{
        ...style,
        width: size,
        height: size,
        fontSize: isSmall ? 8 : 10,
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
      <span style={{ position: 'relative', zIndex: 2, fontWeight: 800 }}>
        {ball.label}
      </span>
    </motion.div>
  );
}

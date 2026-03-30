import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../game/useGameStore';
import { useEffect } from 'react';

/**
 * FeedbackOverlay — shows success/error feedback on ball placement
 * Green glow + bounce for correct, red shake for wrong
 */
export default function FeedbackOverlay() {
  const { feedback, actions } = useGame();

  // Auto-clear feedback after a delay
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => actions.clearFeedback(), 1500);
      return () => clearTimeout(timer);
    }
  }, [feedback, actions]);

  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          style={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            padding: '12px 28px',
            borderRadius: 16,
            fontWeight: 800,
            fontSize: 16,
            background: feedback.type === 'success'
              ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.9), rgba(34, 197, 94, 0.9))'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))',
            color: 'white',
            boxShadow: feedback.type === 'success'
              ? '0 4px 24px rgba(74, 222, 128, 0.4)'
              : '0 4px 24px rgba(239, 68, 68, 0.4)',
          }}
        >
          {feedback.type === 'success' ? (
            <motion.span
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.2, 1] }}
              transition={{ duration: 0.4 }}
            >
              {feedback.message}
            </motion.span>
          ) : (
            <motion.span
              animate={{ x: [0, -8, 8, -4, 4, 0] }}
              transition={{ duration: 0.4 }}
            >
              {feedback.message}
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

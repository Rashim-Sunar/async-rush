import { motion } from 'framer-motion';
import { useGame } from '../game/useGameStore';

export default function GameControls() {
  const { level, phase, score, allPlaced, actions } = useGame();

  const canExecute = phase === 'ready' && allPlaced;
  const isAnimating = phase === 'animating';
  const isComplete  = phase === 'complete';

  let buttonLabel = 'Place a Ball';
  if (canExecute)   buttonLabel = 'Execute ▶';
  else if (isAnimating) buttonLabel = 'Running...';
  else if (isComplete)  buttonLabel = 'Done!';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Level title + score row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.h2
          key={level.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            fontSize: 18, fontWeight: 900, margin: 0, flex: 1,
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-pink))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}
        >
          {level.title}
        </motion.h2>

        <motion.span
          className="score-badge"
          key={score}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          {score}
        </motion.span>
      </div>

      <p style={{ fontSize: 12, color: 'var(--color-text-dim)', margin: 0, lineHeight: 1.5 }}>
        {level.description}
      </p>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <motion.button
          className="btn-execute"
          onClick={() => canExecute && actions.startExecution()}
          disabled={!canExecute}
          whileHover={canExecute ? { scale: 1.05 } : {}}
          whileTap={canExecute ? { scale: 0.95 } : {}}
        >
          {buttonLabel}
        </motion.button>

        <motion.button
          className="btn-secondary"
          onClick={actions.resetLevel}
          disabled={isAnimating}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Reset
        </motion.button>
      </div>
    </div>
  );
}

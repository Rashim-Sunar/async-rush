import { motion } from 'framer-motion';
import { useGame } from '../game/useGameStore';
import { LEVELS } from '../game/levels';

export default function GameControls() {
  const { level, phase, score, currentLevelIndex, allPlaced, actions } = useGame();

  const canExecute = phase === 'ready' && allPlaced;
  const isAnimating = phase === 'animating';
  const isComplete = phase === 'complete';

  const handleExecute = () => {
    if (canExecute) {
      actions.startExecution();
    }
  };

  let buttonLabel = 'Place a ball';
  if (canExecute) buttonLabel = 'Execute';
  else if (isAnimating) buttonLabel = 'Running...';
  else if (isComplete) buttonLabel = 'Done!';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {LEVELS.map((lvl, i) => (
          <motion.button
            key={lvl.id}
            className={`level-tab ${i === currentLevelIndex ? 'active' : ''}`}
            onClick={() => actions.initLevel(i)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isAnimating}
            style={{
              color: i === currentLevelIndex ? 'var(--color-text)' : 'var(--color-text-dim)',
              background: i === currentLevelIndex
                ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.3), rgba(192, 132, 252, 0.2))'
                : 'rgba(167, 139, 250, 0.05)',
            }}
          >
            L{lvl.id}
          </motion.button>
        ))}

        <div style={{ marginLeft: 'auto' }}>
          <motion.span
            className="score-badge"
            key={score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            {score}
          </motion.span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <motion.h2
          key={level.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            fontSize: 20,
            fontWeight: 900,
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-pink))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
          }}
        >
          Level {level.id}: {level.title}
        </motion.h2>
      </div>

      <p style={{ fontSize: 13, color: 'var(--color-text-dim)', margin: 0, lineHeight: 1.4 }}>
        {level.description}
      </p>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <motion.button
          className="btn-execute"
          onClick={handleExecute}
          disabled={!canExecute}
          whileHover={canExecute ? { scale: 1.05 } : {}}
          whileTap={canExecute ? { scale: 0.95 } : {}}
        >
          {canExecute ? '\u25B6 ' : ''}{buttonLabel}
        </motion.button>

        <motion.button
          className="btn-secondary"
          onClick={actions.resetLevel}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isAnimating}
        >
          Reset
        </motion.button>
      </div>
    </div>
  );
}

import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, Suspense, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { GameProvider, useGame } from '../game/useGameStore';
import { ENGINE_COMPONENTS } from '../game/levels';
import { ALL_LEVELS } from '../game/allLevels';

import CodePanel from '../components/CodePanel';
import OutputPanel from '../components/OutputPanel';
import HintBubble from '../components/HintBubble';
import TaskBall from '../components/TaskBall';
import EngineComponent from '../components/EngineComponent';
import GameControls from '../components/GameControls';
import LevelComplete from '../components/LevelComplete';
import FeedbackOverlay from '../components/FeedbackOverlay';
import EventLoopWidget from '../components/EventLoopWidget';
import FlowAnimation from '../components/FlowAnimation';
import EngineScene from '../scene/EngineScene';
import { api } from '../lib/api';

// Resolve which level to load from URL params
function resolveLevelFromParams(searchParams) {
  const levelId = searchParams.get('levelId');
  const difficulty = searchParams.get('difficulty') || 'easy';
  if (levelId && ALL_LEVELS[difficulty]) {
    const found = ALL_LEVELS[difficulty].find(l => l.id === levelId);
    if (found) return { level: found, difficulty, levelNum: ALL_LEVELS[difficulty].indexOf(found) };
  }
  return null;
}

export default function Game() {
  const [searchParams] = useSearchParams();
  const resolved = resolveLevelFromParams(searchParams);
  const levelKey = resolved?.level?.id || 'default-level';

  return (
    <GameProvider key={levelKey} initialLevel={resolved?.level}>
      <GameBoard resolved={resolved} />
    </GameProvider>
  );
}

function GameBoard({ resolved }) {
  const {
    level, phase, remainingBalls, actions,
    score, wrongMoves,
    currentFlowIndex, currentAnimWaypoint, animatingBall
  } = useGame();

  const navigate = useNavigate();
  const [activeBall, setActiveBall] = useState(null);
  const [isLevelAccessible, setIsLevelAccessible] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!resolved) {
      navigate('/levels', { replace: true });
      return;
    }

    let active = true;
    const checkAccess = async () => {
      setCheckingAccess(true);
      try {
        const data = await api.getLevelStatus(resolved.difficulty, resolved.levelNum + 1);
        if (!active) return;
        if (!data.isUnlocked) {
          navigate('/levels', { replace: true });
          return;
        }
        setIsLevelAccessible(true);
      } catch {
        if (!active) return;
        navigate('/levels', { replace: true });
      } finally {
        if (active) setCheckingAccess(false);
      }
    };

    checkAccess();
    return () => {
      active = false;
    };
  }, [navigate, resolved]);

  // Persist level completion to backend once per level run.
  useEffect(() => {
    if (phase !== 'complete' || !resolved || submittedRef.current) {
      return;
    }

    submittedRef.current = true;
    setSubmitError('');

    const stars = wrongMoves === 0 ? 3 : wrongMoves <= 2 ? 2 : 1;
    api.submitLevel({
      difficulty: resolved.difficulty,
      level: resolved.levelNum + 1,
      score,
      stars,
    }).catch((err) => {
      submittedRef.current = false;
      setSubmitError(err.message || 'Progress sync failed');
    });
  }, [phase, resolved, score, wrongMoves]);

  useEffect(() => {
    // When user retries the level, allow a new submit attempt after completion.
    if (phase !== 'complete') {
      submittedRef.current = false;
    }
  }, [phase]);

  // Next question: navigate to the next level in the same difficulty
  const diffLevels      = resolved ? ALL_LEVELS[resolved.difficulty] : [];
  const nextLevelIndex  = resolved ? resolved.levelNum + 1 : -1;
  const nextLevel       = diffLevels[nextLevelIndex];
  const isLastQuestion  = !nextLevel;

  const handleNextQuestion = () => {
    const targetDifficulty = resolved?.difficulty || 'easy';
    navigate(`/levels?difficulty=${targetDifficulty}`);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = useCallback((event) => {
    if (phase === 'animating' || phase === 'complete' || phase === 'ready') return;
    const ball = event.active.data.current?.ball;
    if (ball) setActiveBall(ball);
  }, [phase]);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveBall(null);

    if (phase === 'animating' || phase === 'complete' || phase === 'ready') return;

    if (over && active.data.current?.ball) {
      const ballId = active.data.current.ball.id;
      const componentId = over.id;
      actions.placeBall(ballId, componentId);
    }
  }, [actions, phase]);

  const ballObjects = remainingBalls
    .map(id => level.balls.find(b => b.id === id))
    .filter(Boolean);

  if (checkingAccess || !isLevelAccessible) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(145deg, #0f0a2e 0%, #1a0e3e 40%, #12082e 100%)',
        color: 'var(--color-text)',
        fontWeight: 700,
        letterSpacing: 1,
      }}>
        Validating level access...
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #0f0a2e 0%, #1a0e3e 40%, #12082e 100%)',
      }}>
        <Suspense fallback={null}>
          <EngineScene phase={phase} />
        </Suspense>

        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 1,
        }}>
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(192, 132, 252, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '15%',
            right: '15%',
            width: 400,
            height: 400,
            background: 'radial-gradient(circle, rgba(96, 165, 250, 0.06) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 250,
            height: 250,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.05) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />
        </div>

        <div style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100%',
          display: 'grid',
          gridTemplateColumns: '340px 1fr 280px',
          gridTemplateRows: 'auto 1fr auto',
          gap: 16,
          padding: 20,
        }}>

          <div style={{
            gridColumn: '1 / -1',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <motion.button
                  onClick={() => navigate('/levels')}
                  whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                  style={{
                    background: 'rgba(167,139,250,0.1)',
                    border: '1px solid rgba(167,139,250,0.25)',
                    borderRadius: 10, padding: '5px 12px',
                    color: 'var(--color-text-dim)', fontWeight: 700, fontSize: 12,
                    cursor: 'pointer',
                  }}
                >← Levels</motion.button>
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  style={{ fontSize: 28 }}
                >
                  ⚡
                </motion.span>
                <h1 style={{
                  fontSize: 22,
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #fbbf24, #f472b6, #c084fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0,
                  letterSpacing: -0.5,
                }}>
                  Async Rush
                </h1>
              </div>
              <GameControls />
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minWidth: 0,
          }}>
            <CodePanel />
            <OutputPanel />
            <HintBubble />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: 12,
            alignContent: 'center',
            position: 'relative',
          }}>
            {ENGINE_COMPONENTS.map((comp) => (
              <EngineComponent key={comp.id} component={comp} />
            ))}

            <div style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
              pointerEvents: 'none',
            }}>
              <EventLoopWidget />
            </div>
          </div>

          <div className="glass-card" style={{
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            overflow: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>📖</span>
              <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: 0.5 }}>HOW TO PLAY</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-dim)', lineHeight: 1.6 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>1️⃣</span>
                <span>Read the code on the left panel</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>2️⃣</span>
                <span>Drag each task ball to its engine component <strong>in code order</strong></span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>3️⃣</span>
                <span>Once all placed, click <strong>Execute</strong></span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>4️⃣</span>
                <span>Watch the animated flow through the engine!</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>5️⃣</span>
                <span>See how the Event Loop moves tasks to the Call Stack</span>
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(167, 139, 250, 0.15)' }}>
              <span style={{ fontWeight: 700, fontSize: 11, color: 'var(--color-text-dim)', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                TASK TYPES
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { color: '#4ade80', label: 'Sync \u2192 Call Stack', emoji: '🟢' },
                  { color: '#c084fc', label: 'Promise \u2192 Microtask', emoji: '🟣' },
                  { color: '#60a5fa', label: 'setTimeout \u2192 Macrotask', emoji: '🔵' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <span>{item.emoji}</span>
                    <span style={{ color: item.color }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            gridColumn: '1 / -1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
          }}>
            <div className="glass-card" style={{
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              <span style={{
                fontWeight: 800,
                fontSize: 12,
                color: 'var(--color-text-dim)',
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}>
                🎨 Tasks
              </span>

              <div style={{ width: 1, height: 32, background: 'rgba(167, 139, 250, 0.2)' }} />

              <AnimatePresence>
                {ballObjects.length > 0 ? (
                  ballObjects.map((ball) => (
                    <motion.div
                      key={ball.id}
                      layout
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: phase === 'animating' || phase === 'ready' ? 0.4 : 1,
                        y: [0, -4, 0],
                      }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        layout: { type: 'spring', stiffness: 300 },
                        y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                      }}
                    >
                      <TaskBall ball={ball} />
                    </motion.div>
                  ))
                ) : (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ fontSize: 13, color: 'var(--color-text-dim)' }}
                  >
                    {phase === 'complete' ? '🎉 All done!' :
                     phase === 'ready' ? '✅ Ready to execute!' :
                     phase === 'animating' ? '⚡ Running...' : '⏳ Place all balls...'}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <FeedbackOverlay />
        {submitError && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 80,
              borderRadius: 10,
              border: '1px solid rgba(248,113,113,0.5)',
              background: 'rgba(127,29,29,0.75)',
              color: '#fecaca',
              fontSize: 12,
              fontWeight: 700,
              padding: '8px 12px',
            }}
          >
            {submitError}
          </div>
        )}
        <LevelComplete
          onNextQuestion={handleNextQuestion}
          isLastQuestion={isLastQuestion}
          nextLabel="Back To Zone Map"
        />
        <FlowAnimation key={`flow-${currentFlowIndex}-${currentAnimWaypoint}-${animatingBall?.ballId || 'none'}`} />

        <DragOverlay dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeBall && (
            <div
              className={`task-ball ${activeBall.type}`}
              style={{ cursor: 'grabbing', transform: 'scale(1.15)' }}
            >
              <div style={{
                position: 'absolute',
                top: 6,
                left: 8,
                width: 16,
                height: 10,
                background: 'rgba(255,255,255,0.4)',
                borderRadius: '50%',
                transform: 'rotate(-30deg)',
                pointerEvents: 'none',
              }} />
              <span style={{ position: 'relative', zIndex: 2, fontWeight: 800 }}>
                {activeBall.label}
              </span>
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

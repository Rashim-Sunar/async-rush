import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, Suspense } from 'react';

import { GameProvider, useGame } from './game/useGameStore';
import { ENGINE_COMPONENTS } from './game/levels';

import CodePanel from './components/CodePanel';
import OutputPanel from './components/OutputPanel';
import HintBubble from './components/HintBubble';
import TaskBall from './components/TaskBall';
import EngineComponent from './components/EngineComponent';
import GameControls from './components/GameControls';
import LevelComplete from './components/LevelComplete';
import FeedbackOverlay from './components/FeedbackOverlay';
import EngineScene from './scene/EngineScene';

/**
 * App — Main application component
 * Assembles 3D scene (background) + 2D game UI (overlay)
 */
export default function App() {
  return (
    <GameProvider>
      <GameBoard />
    </GameProvider>
  );
}

function GameBoard() {
  const {
    level, phase, remainingBalls, actions,
  } = useGame();

  const [activeBall, setActiveBall] = useState(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // Handle drag start
  const handleDragStart = useCallback((event) => {
    const ball = event.active.data.current?.ball;
    if (ball) setActiveBall(ball);
  }, []);

  // Handle drag end — validate placement
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveBall(null);

    if (over && active.data.current?.ball) {
      const ballId = active.data.current.ball.id;
      const componentId = over.id;
      actions.placeBall(ballId, componentId);
    }
  }, [actions]);

  // Get remaining ball objects
  const ballObjects = remainingBalls
    .map(id => level.balls.find(b => b.id === id))
    .filter(Boolean);

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
        {/* === 3D SCENE (BACKGROUND) === */}
        <Suspense fallback={null}>
          <EngineScene phase={phase} />
        </Suspense>

        {/* === BACKGROUND DECORATION === */}
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 1,
        }}>
          {/* Gradient orbs for depth */}
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

        {/* === 2D UI OVERLAY === */}
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

          {/* --- TOP BAR: Logo + Controls + Hint --- */}
          <div style={{
            gridColumn: '1 / -1',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16,
          }}>
            {/* Logo + Game Controls */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  style={{ fontSize: 28 }}
                >
                  🎮
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

            {/* Hint Bubble — top right */}
            <div style={{ flexShrink: 0 }}>
              <HintBubble />
            </div>
          </div>

          {/* --- LEFT COLUMN: Code + Output --- */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minWidth: 0,
          }}>
            <CodePanel />
            <OutputPanel />
          </div>

          {/* --- CENTER: Engine Components (Drop Zones) --- */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: 12,
            alignContent: 'center',
          }}>
            {ENGINE_COMPONENTS.map((comp) => (
              <EngineComponent key={comp.id} component={comp} />
            ))}

            {/* Event Loop indicator in center of grid */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 5,
            }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: phase === 'execute' ? 2 : 8, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  border: `3px solid ${phase === 'execute' ? 'rgba(251, 191, 36, 0.6)' : 'rgba(251, 191, 36, 0.2)'}`,
                  borderTopColor: phase === 'execute' ? '#fbbf24' : 'rgba(251, 191, 36, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: phase === 'execute' ? '0 0 20px rgba(251, 191, 36, 0.3)' : 'none',
                }}
              >
                <span style={{ fontSize: 18 }}>🔁</span>
              </motion.div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: Instructions --- */}
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
                <span>Drag the correct task ball to its engine component</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>3️⃣</span>
                <span>Click <strong>Execute</strong> to run the task</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>4️⃣</span>
                <span>Watch the output appear in the terminal</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>5️⃣</span>
                <span>Complete all steps to finish the level!</span>
              </div>
            </div>

            {/* Color Legend */}
            <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(167, 139, 250, 0.15)' }}>
              <span style={{ fontWeight: 700, fontSize: 11, color: 'var(--color-text-dim)', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                TASK TYPES
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { color: '#4ade80', label: 'Sync → Call Stack', emoji: '🟢' },
                  { color: '#c084fc', label: 'Promise → Microtask', emoji: '🟣' },
                  { color: '#60a5fa', label: 'setTimeout → Macrotask', emoji: '🔵' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <span>{item.emoji}</span>
                    <span style={{ color: item.color }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- BOTTOM: Task Balls Tray --- */}
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
                        opacity: 1,
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
                    {phase === 'complete' ? '🎉 All done!' : '⏳ Execute to continue...'}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* === OVERLAYS === */}
        <FeedbackOverlay />
        <LevelComplete />

        {/* Drag overlay for smooth drag visuals */}
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

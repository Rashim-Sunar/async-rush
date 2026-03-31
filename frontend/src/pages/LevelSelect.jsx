import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ALL_LEVELS } from '../game/allLevels';
import EngineScene from '../scene/EngineScene';

const DIFFICULTIES = ['easy', 'medium', 'hard'];

const DIFF_META = {
  easy:   { label: 'EASY',   zone: 'I',   color: '#4ade80', glow: 'rgba(74,222,128,0.5)',  border: 'rgba(74,222,128,0.35)'  },
  medium: { label: 'MEDIUM', zone: 'II',  color: '#fbbf24', glow: 'rgba(251,191,36,0.5)',  border: 'rgba(251,191,36,0.35)'  },
  hard:   { label: 'HARD',   zone: 'III', color: '#f87171', glow: 'rgba(248,113,113,0.5)', border: 'rgba(248,113,113,0.35)' },
};

function loadProgress() {
  try {
    const raw = localStorage.getItem('asyncrush_progress');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { easy: 0, medium: 0, hard: 0 };
}

function saveProgress(p) {
  localStorage.setItem('asyncrush_progress', JSON.stringify(p));
}

// Alternating X position for winding path
function getNodeX(slotFromTop, totalW) {
  return slotFromTop % 2 === 0 ? totalW * 0.38 : totalW * 0.62;
}

const NODE_H = 96;

export default function LevelSelect() {
  const navigate    = useNavigate();
  const [difficulty, setDifficulty] = useState('easy');
  const [progress, setProgress]     = useState(loadProgress);
  const [shakingId, setShakingId]   = useState(null);
  const scrollRef   = useRef(null);
  const containerRef = useRef(null);
  const [containerW, setContainerW] = useState(360);

  // Measure map column width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setContainerW(e.contentRect.width));
    obs.observe(el);
    setContainerW(el.offsetWidth);
    return () => obs.disconnect();
  }, []);

  // Scroll map to BOTTOM so level 1 is visible first
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [difficulty, containerW]);

  const levels        = ALL_LEVELS[difficulty];
  const completedCount = progress[difficulty];
  const totalLevels   = levels.length;

  const isDiffUnlocked = (d) => {
    if (d === 'easy')   return true;
    if (d === 'medium') return progress.easy   >= 10;
    if (d === 'hard')   return progress.medium >= 10;
    return false;
  };

  const shake = (id) => {
    setShakingId(id);
    setTimeout(() => setShakingId(null), 550);
  };

  const handleNodeClick = (lvl, nodeNum) => {
    if (nodeNum > completedCount) { shake(lvl.id); return; }
    navigate(`/game?levelId=${lvl.id}&difficulty=${difficulty}`);
  };

  const handleDiffClick = (diff) => {
    if (!isDiffUnlocked(diff)) { shake('diff_' + diff); return; }
    setDifficulty(diff);
  };

  // --- SVG path: starts at BOTTOM node, travels UP ---
  // level 1 → slotFromTop = (n-1)  i.e. position at BOTTOM
  // level n → slotFromTop = 0      i.e. position at TOP
  const PATH_H = totalLevels * NODE_H + 80;

  // pts[0] = bottom (level 1), pts[n-1] = top (level n)
  const pts = levels.map((_, i) => {
    const slotFromTop = totalLevels - 1 - i; // i=0 (level1) → slotFromTop=9 (bottom)
    const x = getNodeX(slotFromTop, containerW);
    const y = slotFromTop * NODE_H + 80;
    return { x, y };
  }); // pts[0] = level 1 at bottom, pts[9] = level 10 at top

  const buildSVGPath = () => {
    if (pts.length < 2) return '';
    // Start M at bottom (level 1)
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const midY = (prev.y + curr.y) / 2;
      // Cubic bezier for smooth S-curve
      d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
    }
    return d;
  };
  const svgPath = buildSVGPath();

  // Fraction of path that is completed (bottom → up)
  const completedFraction = totalLevels > 0 ? completedCount / totalLevels : 0;
  const meta = DIFF_META[difficulty];

  return (
    <div style={{
      width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(145deg, #0f0a2e 0%, #1a0e3e 40%, #12082e 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--font-display)', color: 'var(--color-text)',
    }}>

      {/* ── 3D Background ── */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.25, pointerEvents: 'none', zIndex: 0 }}>
        <Suspense fallback={null}>
          <EngineScene phase="drag" />
        </Suspense>
      </div>

      {/* Ambient gradient orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.07, 0.14, 0.07] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '5%', left: '-5%',
            width: 380, height: 380,
            background: 'radial-gradient(circle, rgba(192,132,252,0.22) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.11, 0.05] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{
            position: 'absolute', bottom: '5%', right: '-5%',
            width: 440, height: 440,
            background: 'radial-gradient(circle, rgba(96,165,250,0.14) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
      </div>

      {/* ── TOP BAR ── */}
      <motion.div
        initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'relative', zIndex: 20,
          display: 'flex', alignItems: 'center',
          padding: '16px 28px',
          borderBottom: '1px solid rgba(167,139,250,0.1)',
          background: 'rgba(15,10,46,0.55)', backdropFilter: 'blur(12px)',
          flexShrink: 0,
        }}
      >
        {/* Back */}
        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.06, background: 'rgba(167,139,250,0.18)' }}
          whileTap={{ scale: 0.94 }}
          style={{
            background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)',
            borderRadius: 12, padding: '7px 16px',
            color: 'var(--color-text-dim)', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            transition: 'background 0.2s',
          }}
        >
          ← Back
        </motion.button>

        {/* Title */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <motion.span
            animate={{ rotate: [0, 12, -12, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
            style={{ fontSize: 26 }}
          >⚡</motion.span>
          <h1 style={{
            fontSize: 20, fontWeight: 900, margin: 0,
            background: 'linear-gradient(135deg, #fbbf24, #f472b6, #c084fc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: -0.5,
          }}>Async Rush</h1>
        </div>

        {/* Profile placeholder (future) */}
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          border: '2px dashed rgba(167,139,250,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(167,139,250,0.3)', fontSize: 18,
          cursor: 'not-allowed',
          title: 'Profile — coming soon',
        }}>
          👤
        </div>
      </motion.div>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        flex: 1, display: 'flex', overflow: 'hidden',
        position: 'relative', zIndex: 10,
      }}>

        {/* ═══ LEFT: Progression Map ═══ */}
        <div style={{
          flex: '0 0 58%', display: 'flex', flexDirection: 'column',
          borderRight: '1px solid rgba(167,139,250,0.1)',
        }}>
          {/* Zone header */}
          <motion.div
            key={difficulty}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            style={{
              padding: '14px 28px 10px', flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <div style={{
              background: `${meta.color}18`,
              border: `1px solid ${meta.border}`,
              borderRadius: 10, padding: '4px 12px',
              fontSize: 11, fontWeight: 900, letterSpacing: 2,
              color: meta.color, textTransform: 'uppercase',
            }}>
              ZONE {meta.zone}
            </div>
            <span style={{ fontSize: 13, color: 'var(--color-text-dim)', fontWeight: 600 }}>
              {meta.label} — {completedCount}/{totalLevels} questions solved
            </span>
          </motion.div>

          {/* Scrollable map — scroll starts at bottom */}
          <div
            ref={scrollRef}
            style={{
              flex: 1, overflowY: 'auto', overflowX: 'hidden',
              scrollbarWidth: 'thin', scrollbarColor: 'rgba(167,139,250,0.2) transparent',
            }}
          >
            <div ref={containerRef} style={{ position: 'relative', width: '100%', height: PATH_H }}>

              {/* SVG winding path */}
              <svg
                width="100%" height={PATH_H}
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
              >
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                {/* Dim dashed base path */}
                <path d={svgPath} fill="none"
                  stroke="rgba(167,139,250,0.12)" strokeWidth="5"
                  strokeDasharray="10 7"
                />

                {/* Completed segment — animates from BOTTOM upward (pathLength 0→fraction) */}
                {completedCount > 0 && (
                  <motion.path
                    key={`${difficulty}-${completedCount}`}
                    d={svgPath} fill="none"
                    stroke={meta.color} strokeWidth="5"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: completedFraction }}
                    transition={{ duration: 1.1, ease: 'easeOut', delay: 0.3 }}
                  />
                )}
              </svg>

              {/* Level nodes */}
              {levels.map((lvl, i) => {
                const nodeNum    = i;                        // 0 = level 1
                const slotFromTop = totalLevels - 1 - i;    // 0 = top, (n-1) = bottom
                const x = getNodeX(slotFromTop, containerW);
                const y = slotFromTop * NODE_H + 80;

                const isCompleted = nodeNum < completedCount;
                const isCurrent   = nodeNum === completedCount;
                const isLocked    = nodeNum > completedCount;

                const isShaking = shakingId === lvl.id;

                // Tooltip: left or right depending on column
                const tooltipLeft = slotFromTop % 2 === 0;

                return (
                  <motion.div
                    key={lvl.id}
                    style={{
                      position: 'absolute',
                      left: x - 34, top: y - 34,
                      width: 68, height: 68,
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      userSelect: 'none', zIndex: 5,
                    }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={isShaking
                      ? { x: [0, -9, 9, -9, 9, 0], opacity: 1, scale: 1 }
                      : { opacity: 1, scale: 1 }}
                    transition={isShaking
                      ? { duration: 0.45 }
                      : { delay: 0.04 * (totalLevels - nodeNum), type: 'spring', stiffness: 280, damping: 22 }}
                    onClick={() => handleNodeClick(lvl, nodeNum)}
                  >
                    {/* Pulsing sonar ring — current node only */}
                    {isCurrent && (
                      <>
                        <motion.div
                          animate={{ scale: [1, 1.7, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                          style={{
                            position: 'absolute', inset: -10, borderRadius: '50%',
                            border: '2px solid #fbbf24', pointerEvents: 'none',
                          }}
                        />
                        <motion.div
                          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                          style={{
                            position: 'absolute', inset: -5, borderRadius: '50%',
                            border: '2px solid #fbbf24', pointerEvents: 'none',
                          }}
                        />
                      </>
                    )}

                    {/* The node circle */}
                    <motion.div
                      whileHover={!isLocked ? { scale: 1.18 } : {}}
                      transition={{ duration: 0.15 }}
                      style={{
                        width: 68, height: 68, borderRadius: '50%',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', overflow: 'hidden',
                        background: isCompleted
                          ? `radial-gradient(circle at 35% 30%, ${meta.color}ee, ${meta.color}88)`
                          : isCurrent
                          ? 'radial-gradient(circle at 35% 30%, #ffd166ee, #fbbf24aa)'
                          : 'radial-gradient(circle at 35% 30%, rgba(50,35,90,0.95), rgba(25,15,55,0.95))',
                        border: `2.5px solid ${isCompleted ? meta.color : isCurrent ? '#fbbf24' : 'rgba(167,139,250,0.18)'}`,
                        boxShadow: isCompleted
                          ? `0 0 22px ${meta.glow}, 0 0 6px ${meta.glow}`
                          : isCurrent
                          ? '0 0 22px rgba(251,191,36,0.55), 0 0 6px rgba(251,191,36,0.4)'
                          : 'none',
                      }}
                    >
                      {/* Shine on completed/current */}
                      {(isCompleted || isCurrent) && (
                        <div style={{
                          position: 'absolute', top: 8, left: 11,
                          width: 16, height: 10,
                          background: 'rgba(255,255,255,0.3)',
                          borderRadius: '50%', transform: 'rotate(-30deg)',
                          pointerEvents: 'none',
                        }} />
                      )}

                      {isCompleted ? (
                        <span style={{ fontSize: 26, lineHeight: 1 }}>✓</span>
                      ) : isLocked ? (
                        <span style={{ fontSize: 20, lineHeight: 1, opacity: 0.4 }}>🔒</span>
                      ) : (
                        <>
                          <span style={{
                            fontSize: 18, fontWeight: 900, lineHeight: 1,
                            color: isCurrent ? '#3d2000' : 'rgba(167,139,250,0.5)',
                          }}>
                            {nodeNum + 1}
                          </span>
                          <span style={{
                            fontSize: 8, fontWeight: 800, letterSpacing: 0.8,
                            color: isCurrent ? 'rgba(61,32,0,0.7)' : 'rgba(167,139,250,0.3)',
                            marginTop: 1,
                          }}>
                            Q
                          </span>
                        </>
                      )}
                    </motion.div>

                    {/* Title label beside node */}
                    {!isLocked && (
                      <div style={{
                        position: 'absolute',
                        top: '50%', transform: 'translateY(-50%)',
                        ...(tooltipLeft ? { left: 76 } : { right: 76 }),
                        whiteSpace: 'nowrap',
                        background: 'rgba(12,8,38,0.88)',
                        backdropFilter: 'blur(8px)',
                        border: `1px solid ${isCompleted ? meta.color + '44' : isCurrent ? '#fbbf2444' : 'rgba(167,139,250,0.12)'}`,
                        borderRadius: 10, padding: '5px 12px',
                        fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
                        color: isCurrent ? '#fbbf24' : isCompleted ? meta.color : 'rgba(167,139,250,0.55)',
                        pointerEvents: 'none',
                        maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {lvl.title}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT: Zone Selector + Stats ═══ */}
        <div style={{
          flex: '0 0 42%',
          display: 'flex', flexDirection: 'column',
          padding: '24px 28px',
          gap: 20, overflowY: 'auto',
        }}>

          {/* ZONE selector */}
          <motion.div
            initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div style={{
              fontSize: 11, fontWeight: 900, letterSpacing: 3,
              color: 'rgba(167,139,250,0.5)', marginBottom: 14,
              textTransform: 'uppercase',
            }}>
              Select Zone
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DIFFICULTIES.map((diff, di) => {
                const unlocked = isDiffUnlocked(diff);
                const m        = DIFF_META[diff];
                const active   = difficulty === diff;
                const isShaking = shakingId === 'diff_' + diff;

                return (
                  <motion.button
                    key={diff}
                    onClick={() => handleDiffClick(diff)}
                    animate={isShaking ? { x: [0, -9, 9, -9, 9, 0] } : {}}
                    transition={isShaking ? { duration: 0.45 } : { delay: 0.05 * di }}
                    whileHover={unlocked ? { scale: 1.02, y: -2 } : {}}
                    whileTap={unlocked ? { scale: 0.97 } : {}}
                    style={{
                      background: active
                        ? `linear-gradient(135deg, ${m.color}20, ${m.color}0d)`
                        : 'rgba(20,12,48,0.7)',
                      border: `1.5px solid ${active ? m.color : unlocked ? 'rgba(167,139,250,0.15)' : 'rgba(167,139,250,0.08)'}`,
                      borderRadius: 18, padding: '14px 18px',
                      cursor: unlocked ? 'pointer' : 'not-allowed',
                      opacity: unlocked ? 1 : 0.38,
                      display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left',
                      boxShadow: active ? `0 0 28px ${m.glow}40, inset 0 1px 0 rgba(255,255,255,0.05)` : 'none',
                      backdropFilter: 'blur(10px)',
                      transition: 'box-shadow 0.25s, border-color 0.25s',
                      position: 'relative', overflow: 'hidden',
                    }}
                  >
                    {/* Active shimmer */}
                    {active && (
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
                        style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
                          pointerEvents: 'none',
                        }}
                      />
                    )}

                    {/* Zone badge */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: active ? `${m.color}28` : 'rgba(167,139,250,0.06)',
                      border: `1.5px solid ${active ? m.color + '88' : 'rgba(167,139,250,0.12)'}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{
                        fontSize: 9, fontWeight: 900, letterSpacing: 1.5,
                        color: active ? m.color : 'rgba(167,139,250,0.4)',
                        lineHeight: 1,
                      }}>ZONE</span>
                      <span style={{
                        fontSize: 15, fontWeight: 900,
                        color: active ? m.color : 'rgba(167,139,250,0.35)',
                        lineHeight: 1.2,
                      }}>{m.zone}</span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: 900, fontSize: 15, letterSpacing: 1.5,
                        color: active ? m.color : unlocked ? 'var(--color-text)' : 'rgba(167,139,250,0.35)',
                        marginBottom: 4,
                      }}>
                        {!unlocked && '🔒 '}{m.label}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(167,139,250,0.5)', fontWeight: 600 }}>
                        {unlocked
                          ? `${progress[diff]} / 10 solved`
                          : diff === 'medium'
                          ? 'Finish Easy to unlock'
                          : 'Finish Medium to unlock'}
                      </div>

                      {/* Mini progress bar */}
                      {unlocked && (
                        <div style={{
                          marginTop: 6, height: 3, borderRadius: 2,
                          background: 'rgba(167,139,250,0.1)', overflow: 'hidden',
                        }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(progress[diff] / 10) * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                            style={{
                              height: '100%', borderRadius: 2,
                              background: m.color,
                              boxShadow: `0 0 6px ${m.glow}`,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {active && (
                      <motion.div
                        layoutId="zoneActive"
                        style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: m.color, boxShadow: `0 0 12px ${m.glow}`,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Stats card */}
          <motion.div
            key={difficulty + '-stats'}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'rgba(20,12,48,0.7)',
              border: `1px solid ${meta.border}`,
              borderRadius: 20, padding: '18px 20px',
              backdropFilter: 'blur(10px)',
              boxShadow: `0 0 32px ${meta.glow}20`,
            }}
          >
            <div style={{
              fontSize: 11, fontWeight: 900, letterSpacing: 2,
              color: meta.color, marginBottom: 14, textTransform: 'uppercase',
            }}>
              Zone {meta.zone} — {meta.label}
            </div>

            {/* Progress bar */}
            <div style={{
              height: 10, borderRadius: 5,
              background: 'rgba(167,139,250,0.08)', marginBottom: 10, overflow: 'hidden',
            }}>
              <motion.div
                key={difficulty + completedCount}
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / 10) * 100}%` }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.25 }}
                style={{
                  height: '100%', borderRadius: 5,
                  background: `linear-gradient(90deg, ${meta.color}, ${meta.color}bb)`,
                  boxShadow: `0 0 10px ${meta.glow}`,
                }}
              />
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 12, color: 'rgba(167,139,250,0.5)', fontWeight: 600, marginBottom: 14,
            }}>
              <span>{completedCount} solved</span>
              <span>{10 - completedCount} remaining</span>
            </div>

            {/* Star track */}
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: i < completedCount ? 1 : 0.18 }}
                  transition={{ delay: 0.05 * i + 0.2, type: 'spring', stiffness: 300 }}
                  style={{ fontSize: 16 }}
                >
                  {i < completedCount ? '⭐' : '☆'}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Node legend */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            style={{
              background: 'rgba(15,10,46,0.5)',
              border: '1px solid rgba(167,139,250,0.1)',
              borderRadius: 16, padding: '14px 18px',
            }}
          >
            <div style={{
              fontSize: 10, fontWeight: 900, letterSpacing: 2.5,
              color: 'rgba(167,139,250,0.4)', marginBottom: 12, textTransform: 'uppercase',
            }}>
              Node Guide
            </div>
            {[
              { symbol: '✓', color: meta.color, label: 'Solved',         desc: 'Question complete' },
              { symbol: '●', color: '#fbbf24',  label: 'Current',        desc: 'Pulsing — play now' },
              { symbol: '🔒', color: 'rgba(167,139,250,0.25)', label: 'Locked', desc: 'Solve previous first' },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                marginBottom: 10, fontSize: 12,
              }}>
                <span style={{ color: item.color, fontSize: 16, width: 22, textAlign: 'center', flexShrink: 0 }}>
                  {item.symbol}
                </span>
                <div>
                  <span style={{ color: 'var(--color-text)', fontWeight: 700 }}>{item.label}</span>
                  <span style={{ color: 'rgba(167,139,250,0.4)', marginLeft: 6 }}>{item.desc}</span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* DEV reset — dev only */}
          {import.meta.env.DEV && (
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              onClick={() => {
                const reset = { easy: 0, medium: 0, hard: 0 };
                saveProgress(reset);
                setProgress(reset);
              }}
              style={{
                marginTop: 'auto', background: 'rgba(248,113,113,0.07)',
                border: '1px solid rgba(248,113,113,0.18)', borderRadius: 12,
                padding: '9px 16px', color: 'rgba(248,113,113,0.55)',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: 1,
              }}
            >
              DEV: Reset Progress
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

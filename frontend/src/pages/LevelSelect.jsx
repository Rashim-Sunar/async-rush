import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ALL_LEVELS } from '../game/allLevels';

const DIFFICULTIES = ['easy', 'medium', 'hard'];

const DIFF_META = {
  easy:   { label: 'Easy',   color: '#4ade80', glow: 'rgba(74,222,128,0.4)',   emoji: '🟢', maxAttempts: 2 },
  medium: { label: 'Medium', color: '#fbbf24', glow: 'rgba(251,191,36,0.4)',   emoji: '🟡', maxAttempts: 3 },
  hard:   { label: 'Hard',   color: '#f87171', glow: 'rgba(248,113,113,0.4)',   emoji: '🔴', maxAttempts: 5 },
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

// S-curve winding path: alternates left / center-right per node
function getNodeX(index, containerW) {
  // nodes alternate: left-ish (35%) then right-ish (65%)
  return index % 2 === 0 ? containerW * 0.35 : containerW * 0.65;
}

export default function LevelSelect() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('easy');
  const [progress, setProgress] = useState(loadProgress);
  const [shakingNode, setShakingNode] = useState(null);
  const containerRef = useRef(null);
  const [containerW, setContainerW] = useState(360);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setContainerW(e.contentRect.width));
    obs.observe(el);
    setContainerW(el.offsetWidth);
    return () => obs.disconnect();
  }, []);

  const completedCount = progress[difficulty];
  const levels = ALL_LEVELS[difficulty];

  // Unlock logic
  const isDiffUnlocked = (diff) => {
    if (diff === 'easy') return true;
    if (diff === 'medium') return progress.easy >= 10;
    if (diff === 'hard') return progress.medium >= 10;
    return false;
  };

  const handleNodeClick = (lvl, idx) => {
    const isUnlocked = idx <= completedCount; // current + completed
    if (!isUnlocked) {
      setShakingNode(lvl.id);
      setTimeout(() => setShakingNode(null), 600);
      return;
    }
    navigate(`/game?levelId=${lvl.id}&difficulty=${difficulty}`);
  };

  const handleDiffClick = (diff) => {
    if (!isDiffUnlocked(diff)) {
      setShakingNode('diff_' + diff);
      setTimeout(() => setShakingNode(null), 600);
      return;
    }
    setDifficulty(diff);
  };

  // Node positions — rendered top=0 is the TOP of the list (level 10), bottom = level 1
  // We render levels reversed so level 1 is at bottom (Duolingo style)
  const NODE_H = 90; // px per node slot
  const PATH_H = levels.length * NODE_H + 60;

  // Build SVG path through node centers
  const buildPath = () => {
    const pts = levels
      .map((_, i) => {
        const reversed = levels.length - 1 - i; // level 0 = top
        const x = getNodeX(reversed, containerW);
        const y = reversed * NODE_H + 60;
        return { x, y };
      })
      .reverse(); // now pts[0] = bottom node (level 1), pts[last] = top

    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cy = (prev.y + curr.y) / 2;
      d += ` C ${prev.x} ${cy}, ${curr.x} ${cy}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  const svgPath = buildPath();

  // Split path into completed vs upcoming stroke-dasharray trick
  const totalLevels = levels.length;
  const completedFraction = completedCount / totalLevels;

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(145deg, #0f0a2e 0%, #1a0e3e 40%, #12082e 100%)',
      display: 'flex', overflow: 'hidden', position: 'relative',
      fontFamily: 'var(--font-display)',
      color: 'var(--color-text)',
    }}>

      {/* Ambient orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <motion.div animate={{ scale: [1,1.2,1], opacity:[0.07,0.14,0.07] }}
          transition={{ duration: 7, repeat: Infinity, ease:'easeInOut' }}
          style={{ position:'absolute', top:'10%', left:'5%', width:300, height:300,
            background:'radial-gradient(circle, rgba(192,132,252,0.2) 0%, transparent 70%)', borderRadius:'50%' }} />
        <motion.div animate={{ scale:[1,1.15,1], opacity:[0.05,0.1,0.05] }}
          transition={{ duration: 9, repeat: Infinity, ease:'easeInOut', delay:3 }}
          style={{ position:'absolute', bottom:'10%', right:'5%', width:400, height:400,
            background:'radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)', borderRadius:'50%' }} />
      </div>

      {/* Back button */}
      <motion.button
        onClick={() => navigate('/')}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          position: 'absolute', top: 20, left: 20, zIndex: 50,
          background: 'rgba(167,139,250,0.12)',
          border: '1px solid rgba(167,139,250,0.3)',
          borderRadius: 12, padding: '8px 18px',
          color: 'var(--color-text-dim)', fontWeight: 700, fontSize: 14,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        ← Back
      </motion.button>

      {/* ── LEFT: Progression Map (60%) ── */}
      <div style={{
        width: '60%', height: '100%',
        display: 'flex', flexDirection: 'column',
        borderRight: '1px solid rgba(167,139,250,0.12)',
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: '22px 32px 0', flexShrink: 0 }}
        >
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <span style={{ fontSize:28 }}>⚡</span>
            <h1 style={{
              fontSize: 22, fontWeight: 900, margin: 0,
              background:'linear-gradient(135deg, #fbbf24, #f472b6, #c084fc)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            }}>Async Rush</h1>
          </div>
          <p style={{ fontSize:13, color:'var(--color-text-dim)', margin:0 }}>
            {DIFF_META[difficulty].emoji} {DIFF_META[difficulty].label} — {completedCount}/{totalLevels} completed
          </p>
        </motion.div>

        {/* Scrollable map */}
        <div ref={containerRef} style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          padding: '16px 0',
          scrollbarWidth: 'thin',
        }}>
          <div style={{ position: 'relative', width: '100%', height: PATH_H }}>

            {/* SVG winding path */}
            <svg
              width="100%" height={PATH_H}
              style={{ position:'absolute', inset:0, pointerEvents:'none' }}
            >
              {/* Full dim path */}
              <path d={svgPath} fill="none"
                stroke="rgba(167,139,250,0.15)" strokeWidth="4"
                strokeDasharray="8 6" />
              {/* Completed path overlay */}
              {completedCount > 0 && (
                <motion.path
                  d={svgPath} fill="none"
                  stroke={DIFF_META[difficulty].color}
                  strokeWidth="4" strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: completedFraction }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                />
              )}
            </svg>

            {/* Level nodes — rendered bottom-to-top (index 0 = bottom = level 1) */}
            {levels.map((lvl, i) => {
              const reversedIdx = levels.length - 1 - i; // 0 = top slot
              const x = getNodeX(reversedIdx, containerW);
              const y = reversedIdx * NODE_H + 60;
              const nodeNum = i; // 0-indexed from bottom

              const isCompleted = nodeNum < completedCount;
              const isCurrent = nodeNum === completedCount;
              const isLocked = nodeNum > completedCount;

              let bg, borderColor, textColor, icon;
              if (isCompleted) {
                bg = `radial-gradient(circle at 35% 35%, ${DIFF_META[difficulty].color}cc, ${DIFF_META[difficulty].color}88)`;
                borderColor = DIFF_META[difficulty].color;
                textColor = '#fff';
                icon = '✓';
              } else if (isCurrent) {
                bg = 'radial-gradient(circle at 35% 35%, #fbbf24cc, #f59e0b88)';
                borderColor = '#fbbf24';
                textColor = '#fff';
                icon = null;
              } else {
                bg = 'rgba(30,20,60,0.8)';
                borderColor = 'rgba(167,139,250,0.2)';
                textColor = 'rgba(167,139,250,0.4)';
                icon = '🔒';
              }

              return (
                <motion.div
                  key={lvl.id}
                  initial={{ opacity: 0, y: 30, scale: 0.7 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.05 * (levels.length - nodeNum), type: 'spring', stiffness: 260, damping: 20 }}
                  animate={shakingNode === lvl.id
                    ? { x: [0,-8,8,-8,8,0], opacity:1, scale:1, y:0 }
                    : { opacity:1, y:0, scale:1 }}
                  transition={shakingNode === lvl.id
                    ? { duration: 0.5 }
                    : { delay: 0.05 * (levels.length - nodeNum), type:'spring', stiffness:260, damping:20 }}
                  style={{
                    position: 'absolute',
                    left: x - 30,
                    top: y - 30,
                    width: 60, height: 60,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    userSelect: 'none',
                  }}
                  onClick={() => handleNodeClick(lvl, nodeNum)}
                >
                  {/* Pulsing ring for current node */}
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        position: 'absolute', inset: -8,
                        borderRadius: '50%',
                        border: '3px solid #fbbf24',
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  {/* Node circle */}
                  <motion.div
                    whileHover={!isLocked ? { scale: 1.15, boxShadow: `0 0 28px ${DIFF_META[difficulty].glow}` } : {}}
                    style={{
                      width: 60, height: 60, borderRadius: '50%',
                      background: bg,
                      border: `2.5px solid ${borderColor}`,
                      boxShadow: isCompleted
                        ? `0 0 18px ${DIFF_META[difficulty].glow}`
                        : isCurrent
                        ? '0 0 18px rgba(251,191,36,0.5)'
                        : 'none',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {icon ? (
                      <span style={{ fontSize: isLocked ? 18 : 22, lineHeight: 1 }}>{icon}</span>
                    ) : (
                      <span style={{ fontSize: 18, fontWeight: 900, color: textColor }}>{nodeNum + 1}</span>
                    )}
                    {!icon && (
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight:700, letterSpacing:0.5 }}>
                        LVL
                      </span>
                    )}
                  </motion.div>

                  {/* Level title tooltip on hover */}
                  {!isLocked && (
                    <div style={{
                      position: 'absolute',
                      top: '50%', transform: 'translateY(-50%)',
                      ...(reversedIdx % 2 === 0 ? { left: 70 } : { right: 70 }),
                      whiteSpace: 'nowrap',
                      background: 'rgba(15,10,46,0.9)',
                      border: `1px solid ${borderColor}44`,
                      borderRadius: 8, padding: '4px 10px',
                      fontSize: 11, fontWeight: 700,
                      color: isCurrent ? '#fbbf24' : isCompleted ? DIFF_META[difficulty].color : 'rgba(167,139,250,0.6)',
                      pointerEvents: 'none',
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

      {/* ── RIGHT: Difficulty panel (40%) ── */}
      <div style={{
        width: '40%', height: '100%',
        display: 'flex', flexDirection: 'column',
        padding: '72px 32px 32px',
        gap: 24,
      }}>

        {/* Difficulty tabs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 800, letterSpacing: 2, color: 'var(--color-text-dim)', margin: 0 }}>
            DIFFICULTY
          </h2>
          {DIFFICULTIES.map((diff) => {
            const unlocked = isDiffUnlocked(diff);
            const meta = DIFF_META[diff];
            const active = difficulty === diff;
            const isShaking = shakingNode === 'diff_' + diff;

            return (
              <motion.button
                key={diff}
                onClick={() => handleDiffClick(diff)}
                animate={isShaking ? { x: [0,-8,8,-8,8,0] } : {}}
                transition={isShaking ? { duration: 0.5 } : {}}
                whileHover={unlocked ? { scale: 1.03 } : {}}
                whileTap={unlocked ? { scale: 0.97 } : {}}
                style={{
                  background: active
                    ? `linear-gradient(135deg, ${meta.color}22, ${meta.color}11)`
                    : 'rgba(30,20,60,0.5)',
                  border: active
                    ? `2px solid ${meta.color}`
                    : '2px solid rgba(167,139,250,0.15)',
                  borderRadius: 16,
                  padding: '16px 20px',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  opacity: unlocked ? 1 : 0.45,
                  display: 'flex', alignItems: 'center', gap: 14,
                  textAlign: 'left',
                  boxShadow: active ? `0 0 24px ${meta.glow}` : 'none',
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                }}
              >
                <span style={{ fontSize: 28 }}>{meta.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: active ? meta.color : 'var(--color-text)', marginBottom: 3 }}>
                    {unlocked ? meta.label : `🔒 ${meta.label}`}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>
                    {unlocked
                      ? `${progress[diff]} / 10 levels cleared`
                      : diff === 'medium'
                      ? 'Clear all Easy levels to unlock'
                      : 'Clear all Medium levels to unlock'}
                  </div>
                </div>
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: meta.color,
                      boxShadow: `0 0 10px ${meta.glow}`,
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Current difficulty stats card */}
        <motion.div
          key={difficulty}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
          style={{ padding: 20 }}
        >
          <h3 style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.5, color: 'var(--color-text-dim)', margin: '0 0 14px' }}>
            PROGRESS — {DIFF_META[difficulty].label.toUpperCase()}
          </h3>
          {/* Progress bar */}
          <div style={{
            height: 8, borderRadius: 4,
            background: 'rgba(167,139,250,0.1)',
            marginBottom: 10, overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / 10) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              style={{
                height: '100%', borderRadius: 4,
                background: `linear-gradient(90deg, ${DIFF_META[difficulty].color}, ${DIFF_META[difficulty].color}aa)`,
                boxShadow: `0 0 8px ${DIFF_META[difficulty].glow}`,
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-dim)', display: 'flex', justifyContent: 'space-between' }}>
            <span>{completedCount} completed</span>
            <span>{10 - completedCount} remaining</span>
          </div>

          {/* Stars earned */}
          <div style={{ marginTop: 14, display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-dim)', marginRight: 6 }}>Progress:</span>
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} style={{ fontSize: 14, opacity: i < completedCount ? 1 : 0.2 }}>
                {i < completedCount ? '⭐' : '☆'}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          <h3 style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: 'var(--color-text-dim)', margin: 0 }}>
            NODE KEY
          </h3>
          {[
            { icon: '✓', color: DIFF_META[difficulty].color, label: 'Completed' },
            { icon: '●', color: '#fbbf24', label: 'Current level (pulsing)' },
            { icon: '🔒', color: 'rgba(167,139,250,0.3)', label: 'Locked' },
          ].map(item => (
            <div key={item.label} style={{ display:'flex', alignItems:'center', gap:10, fontSize:12 }}>
              <span style={{ color: item.color, fontWeight:700, fontSize:16, width:20, textAlign:'center' }}>{item.icon}</span>
              <span style={{ color:'var(--color-text-dim)' }}>{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* DEV helper — reset progress */}
        {import.meta.env.DEV && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            onClick={() => { saveProgress({ easy: 0, medium: 0, hard: 0 }); setProgress({ easy: 0, medium: 0, hard: 0 }); }}
            style={{
              marginTop: 'auto', background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10,
              padding: '8px 16px', color: 'rgba(248,113,113,0.6)',
              fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: 1,
            }}
          >
            DEV: Reset Progress
          </motion.button>
        )}
      </div>
    </div>
  );
}

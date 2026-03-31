import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api } from '../lib/api';
import EngineScene from '../scene/EngineScene';

const DEBRIS = [
  {
    top: '8%', left: '3%', width: 64, height: 64,
    borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
    bg: 'rgba(199,125,255,0.08)', blur: 10,
    animation: 'debris-1 18s ease-in-out infinite',
  },
  {
    top: '72%', left: '6%', width: 96, height: 96,
    borderRadius: '50%',
    bg: 'rgba(78,205,196,0.06)', blur: 14,
    animation: 'debris-2 22s ease-in-out infinite',
  },
  {
    top: '15%', right: '5%', width: 72, height: 72,
    borderRadius: '50% 20% 50% 20%',
    bg: 'rgba(255,107,107,0.07)', blur: 10,
    animation: 'debris-3 16s ease-in-out infinite',
  },
  {
    top: '78%', right: '9%', width: 52, height: 52,
    borderRadius: '20%',
    bg: 'rgba(255,217,61,0.08)', blur: 8,
    animation: 'debris-4 20s ease-in-out infinite',
  },
  {
    top: '45%', left: '1%', width: 42, height: 42,
    borderRadius: '50% 50% 20% 80%',
    bg: 'rgba(78,205,196,0.09)', blur: 8,
    animation: 'debris-5 15s ease-in-out infinite',
  },
];

// ─── Helpers ────────────────────────────────────────────────
function getInitials(name) {
  if (!name) return '?';
  return name
    .split(/[\s_-]+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function hashColor(str) {
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = ((hash % 360) + 360) % 360;
  return `hsl(${h}, 72%, 58%)`;
}

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }

    const start = performance.now();
    startRef.current = start;

    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(Math.round(eased * target));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
}

// ─── Skeleton Loader ────────────────────────────────────────
function SkeletonBox({ width, height = 20, radius = 8, style }) {
  return (
    <motion.div
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'rgba(167,139,250,0.1)',
        ...style,
      }}
    />
  );
}

function ProfileSkeleton() {
  return (
    <div style={{ display: 'flex', gap: 40, padding: '40px 48px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
      <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <SkeletonBox width={80} height={80} radius={40} />
        <SkeletonBox width={140} height={28} />
        <SkeletonBox width={200} height={16} />
        <SkeletonBox width={120} height={14} />
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBox key={i} width="100%" height={110} radius={18} />
        ))}
      </div>
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────
function StatCard({ icon, label, value, suffix, delay, color, hideValue, children }) {
  const count = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, boxShadow: `0 12px 40px rgba(0,0,0,0.3), 0 0 20px ${color || 'rgba(167,139,250,0.15)'}` }}
      style={{
        background: 'rgba(20,12,48,0.65)',
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(167,139,250,0.12)',
        borderRadius: 18,
        padding: '20px 22px',
        cursor: 'default',
        transition: 'box-shadow 0.25s, transform 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      {!hideValue && (
        <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--color-text)', lineHeight: 1 }}>
          {count}{suffix || ''}
        </div>
      )}
      {children}
    </motion.div>
  );
}

// ─── Difficulty Badge ───────────────────────────────────────
const DIFF_COLORS = {
  none: { label: 'None', color: 'rgba(167,139,250,0.4)', bg: 'rgba(167,139,250,0.08)' },
  easy: { label: 'Easy', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  medium: { label: 'Medium', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  hard: { label: 'Hard', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
};

// ─── Progress Section ───────────────────────────────────────
function ProgressSection({ difficulty, data, navigate }) {
  const [open, setOpen] = useState(false);
  const dm = DIFF_COLORS[difficulty] || DIFF_COLORS.easy;
  const levels = data?.levels || [];

  return (
    <div style={{ marginBottom: 8 }}>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ background: 'rgba(167,139,250,0.08)' }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          background: 'rgba(20,12,48,0.5)',
          border: `1px solid ${dm.color}30`,
          borderRadius: 14,
          cursor: 'pointer',
          color: 'var(--color-text)',
          transition: 'background 0.2s',
        }}
      >
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: dm.color, boxShadow: `0 0 8px ${dm.color}60`,
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, color: dm.color, textTransform: 'uppercase', flex: 1, textAlign: 'left' }}>
          {dm.label}
        </span>
        <span style={{ fontSize: 12, color: 'rgba(167,139,250,0.5)', fontWeight: 600 }}>
          {data?.completed || 0}/10 cleared
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: 14, color: 'rgba(167,139,250,0.4)' }}
        >
          ▼
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
              padding: '12px 8px 8px',
            }}>
              {Array.from({ length: 10 }).map((_, i) => {
                const levelNum = i + 1;
                const levelData = levels.find((l) => l.level === levelNum);
                const stars = levelData?.stars || 0;
                const isCompleted = stars >= 1;

                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.03 * i, type: 'spring', stiffness: 300, damping: 20 }}
                    onClick={() => {
                      if (isCompleted) {
                        navigate(`/game?difficulty=${difficulty}&level=${levelNum}`);
                      }
                    }}
                    title={isCompleted ? `Level ${levelNum} — ${stars}⭐ (click to replay)` : `Level ${levelNum} — not completed`}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      background: isCompleted ? dm.bg : 'rgba(167,139,250,0.04)',
                      border: `1px solid ${isCompleted ? dm.color + '40' : 'rgba(167,139,250,0.08)'}`,
                      cursor: isCompleted ? 'pointer' : 'default',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    whileHover={isCompleted ? { scale: 1.15, boxShadow: `0 0 12px ${dm.color}40` } : {}}
                  >
                    <span style={{ fontSize: 9, fontWeight: 800, color: isCompleted ? dm.color : 'rgba(167,139,250,0.25)', lineHeight: 1 }}>
                      {levelNum}
                    </span>
                    <span style={{ fontSize: 8, lineHeight: 1, display: 'flex', gap: 0.5 }}>
                      {[1, 2, 3].map((s) => (
                        <span key={s} style={{ opacity: s <= stars ? 1 : 0.15, fontSize: 7 }}>⭐</span>
                      ))}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Profile Page ──────────────────────────────────────
export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMobile, isTablet } = useBreakpoint();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Bio editing
  const [editingBio, setEditingBio] = useState(false);
  const [bioValue, setBioValue] = useState('');
  const [savingBio, setSavingBio] = useState(false);
  const bioInputRef = useRef(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getProfile();
      setProfile(data);
      setBioValue(data.bio || '');
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (editingBio && bioInputRef.current) {
      bioInputRef.current.focus();
    }
  }, [editingBio]);

  const saveBio = async () => {
    if (savingBio) return;
    setSavingBio(true);
    try {
      const data = await api.updateProfile({ bio: bioValue });
      setProfile(data);
      setEditingBio(false);
    } catch (err) {
      setError(err.message || 'Failed to save bio');
    } finally {
      setSavingBio(false);
    }
  };

  const displayName = profile?.username || profile?.name || user?.name || 'Player';
  const initials = getInitials(displayName);
  const avatarColor1 = hashColor(displayName);
  const avatarColor2 = hashColor(displayName + 'x');
  const stats = profile?.stats || { totalScore: 0, totalStars: 0, levelsCompleted: 0, highestDifficulty: 'none' };
  const progress = profile?.progress || { easy: {}, medium: {}, hard: {} };
  const diffMeta = DIFF_COLORS[stats.highestDifficulty] || DIFF_COLORS.none;

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #0f0a2e 0%, #1a0e3e 40%, #12082e 100%)',
      fontFamily: 'var(--font-display)',
      color: 'var(--color-text)',
      position: 'relative',
      overflowX: 'hidden',
      overflowY: isMobile ? 'auto' : 'hidden',
    }}>
      {/* ── 3D Background ── */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.25, pointerEvents: 'none', zIndex: 0 }}>
        <Suspense fallback={null}>
          <EngineScene phase="drag" />
        </Suspense>
      </div>

      {/* Ambient radial orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.16, 0.08] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '10%', left: '15%',
            width: 420, height: 420,
            background: 'radial-gradient(circle, rgba(192,132,252,0.22) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.13, 0.06] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            position: 'absolute', bottom: '5%', right: '10%',
            width: 520, height: 520,
            background: 'radial-gradient(circle, rgba(96,165,250,0.16) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.11, 0.05] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 360, height: 360,
            background: 'radial-gradient(circle, rgba(251,191,36,0.13) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
      </div>

      {/* Floating debris shapes */}
      {DEBRIS.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: d.top, left: d.left, right: d.right,
            width: d.width, height: d.height,
            borderRadius: d.borderRadius,
            background: d.bg,
            filter: `blur(${d.blur}px)`,
            animation: d.animation,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ))}

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'relative', zIndex: 20,
          display: 'flex', alignItems: 'center',
          padding: isMobile ? '12px 14px' : '16px 28px',
          borderBottom: '1px solid rgba(167,139,250,0.1)',
          background: 'rgba(15,10,46,0.55)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <motion.button
          onClick={() => navigate('/levels')}
          whileHover={{ scale: 1.06, background: 'rgba(167,139,250,0.18)' }}
          whileTap={{ scale: 0.94 }}
          style={{
            background: 'rgba(167,139,250,0.1)',
            border: '1px solid rgba(167,139,250,0.25)',
            borderRadius: 12,
            padding: '7px 16px',
            color: 'var(--color-text-dim)',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ← Back to Levels
        </motion.button>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <h1 style={{
            fontSize: 18, fontWeight: 900, margin: 0,
            background: 'linear-gradient(135deg, #fbbf24, #f472b6, #c084fc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: -0.5,
          }}>
            Player Profile
          </h1>
        </div>

        <div style={{ width: 110 }} />
      </motion.div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, overflowY: isMobile ? 'visible' : 'auto', height: isMobile ? 'auto' : 'calc(100vh - 57px)' }}>
        {loading ? (
          <ProfileSkeleton />
        ) : error ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ color: '#fca5a5', fontWeight: 700, marginBottom: 12 }}>Failed to load profile</div>
            <div style={{ color: 'var(--color-text-dim)', fontSize: 13, marginBottom: 16 }}>{error}</div>
            <button
              onClick={fetchProfile}
              style={{
                background: 'rgba(167,139,250,0.18)', border: '1px solid rgba(167,139,250,0.35)',
                borderRadius: 10, padding: '8px 14px', color: 'var(--color-text)', fontWeight: 700, cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 24 : 40,
            padding: isMobile ? '20px 16px' : isTablet ? '28px 24px' : '40px 48px',
            maxWidth: 1100,
            margin: '0 auto',
            width: '100%',
          }}>
            {/* ═══ LEFT COLUMN — User Card ═══ */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
              style={{
                flex: isMobile ? '0 0 auto' : '0 0 280px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                width: isMobile ? '100%' : undefined,
              }}
            >
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${avatarColor1}, ${avatarColor2})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  fontWeight: 900,
                  color: '#fff',
                  boxShadow: `0 0 30px ${avatarColor1}50, 0 8px 24px rgba(0,0,0,0.3)`,
                  marginBottom: 8,
                }}
              >
                {initials}
              </motion.div>

              {/* Username */}
              <h2 style={{
                fontSize: 24,
                fontWeight: 900,
                margin: 0,
                background: 'linear-gradient(135deg, #fbbf24, #f472b6, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center',
              }}>
                {displayName}
              </h2>

              {/* Email */}
              <div style={{ fontSize: 12, color: 'rgba(167,139,250,0.5)', fontWeight: 600, marginBottom: 8 }}>
                {profile?.email}
              </div>

              {/* Bio */}
              <div style={{
                width: '100%',
                background: 'rgba(20,12,48,0.5)',
                border: '1px solid rgba(167,139,250,0.1)',
                borderRadius: 14,
                padding: '12px 14px',
                minHeight: 50,
              }}>
                {editingBio ? (
                  <div>
                    <textarea
                      ref={bioInputRef}
                      value={bioValue}
                      onChange={(e) => setBioValue(e.target.value.slice(0, 150))}
                      onBlur={saveBio}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveBio(); } }}
                      rows={3}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--color-text)',
                        fontSize: 13,
                        fontFamily: 'inherit',
                        resize: 'none',
                      }}
                      placeholder="Write something about yourself..."
                    />
                    <div style={{ fontSize: 10, color: 'rgba(167,139,250,0.35)', textAlign: 'right', marginTop: 4 }}>
                      {bioValue.length}/150
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setEditingBio(true)}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                    }}
                  >
                    <span style={{
                      flex: 1,
                      fontSize: 13,
                      color: profile?.bio ? 'var(--color-text-dim)' : 'rgba(167,139,250,0.3)',
                      lineHeight: 1.5,
                    }}>
                      {profile?.bio || 'Click to add a bio...'}
                    </span>
                    <span style={{ fontSize: 12, opacity: 0.4, flexShrink: 0 }}>✏️</span>
                  </div>
                )}
              </div>

              {/* Member since */}
              {memberSince && (
                <div style={{
                  fontSize: 11,
                  color: 'rgba(167,139,250,0.35)',
                  fontWeight: 600,
                  marginTop: 8,
                }}>
                  🕐 Member since {memberSince}
                </div>
              )}

              {/* Back to levels button */}
              <motion.button
                onClick={() => navigate('/levels')}
                whileHover={{ scale: 1.04, background: 'rgba(167,139,250,0.18)' }}
                whileTap={{ scale: 0.96 }}
                style={{
                  marginTop: 20,
                  width: '100%',
                  background: 'rgba(167,139,250,0.1)',
                  border: '1px solid rgba(167,139,250,0.25)',
                  borderRadius: 14,
                  padding: '12px 16px',
                  color: 'var(--color-text)',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  letterSpacing: 0.5,
                }}
              >
                🎮 Back to Levels
              </motion.button>
            </motion.div>

            {/* ═══ RIGHT COLUMN — Stats Dashboard ═══ */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              {/* Stat Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 10 : 16 }}>
                <StatCard
                  icon="🏆"
                  label="Total Score"
                  value={stats.totalScore}
                  delay={0.4}
                  color="rgba(251,191,36,0.15)"
                />

                <StatCard
                  icon="⭐"
                  label="Total Stars"
                  value={stats.totalStars}
                  delay={0.5}
                  color="rgba(251,191,36,0.12)"
                >
                  {stats.levelsCompleted > 0 && (
                    <div style={{ fontSize: 11, color: 'rgba(167,139,250,0.45)', marginTop: 6, fontWeight: 600 }}>
                      out of {stats.levelsCompleted * 3} possible
                    </div>
                  )}
                </StatCard>

                <StatCard
                  icon="🎮"
                  label="Levels Cleared"
                  value={stats.levelsCompleted}
                  suffix=" / 30"
                  delay={0.6}
                  color="rgba(74,222,128,0.12)"
                >
                  <div style={{
                    marginTop: 8, height: 5, borderRadius: 3,
                    background: 'rgba(167,139,250,0.08)', overflow: 'hidden',
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.levelsCompleted / 30) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.8 }}
                      style={{
                        height: '100%', borderRadius: 3,
                        background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                        boxShadow: '0 0 8px rgba(74,222,128,0.4)',
                      }}
                    />
                  </div>
                </StatCard>

                <StatCard
                  icon="🔥"
                  label="Highest Difficulty"
                  value={0}
                  hideValue
                  delay={0.7}
                  color={`${diffMeta.color}20`}
                >
                  <div style={{
                    display: 'inline-flex',
                    padding: '6px 14px',
                    borderRadius: 10,
                    background: diffMeta.bg,
                    border: `1px solid ${diffMeta.color}40`,
                  }}>
                    <span style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: diffMeta.color,
                      letterSpacing: 1,
                    }}>
                      {diffMeta.label}
                    </span>
                  </div>
                </StatCard>
              </div>

              {/* Progress Breakdown */}
              <div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: 2,
                  color: 'rgba(167,139,250,0.5)',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}>
                  Progress Breakdown
                </div>

                <ProgressSection difficulty="easy" data={progress.easy} navigate={navigate} />
                <ProgressSection difficulty="medium" data={progress.medium} navigate={navigate} />
                <ProgressSection difficulty="hard" data={progress.hard} navigate={navigate} />
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

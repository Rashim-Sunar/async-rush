import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../lib/api';

const cardStyle = {
  width: 'min(500px, 92vw)',
  borderRadius: 26,
  border: '1px solid rgba(116, 246, 223, 0.28)',
  background: 'linear-gradient(145deg, rgba(13,25,54,0.95), rgba(17,37,72,0.9))',
  backdropFilter: 'blur(18px)',
  padding: '34px 30px',
  boxShadow: '0 30px 70px rgba(0,0,0,0.45), 0 0 30px rgba(116,246,223,0.14)',
};

const fieldStyle = {
  width: '100%',
  borderRadius: 12,
  border: '1px solid rgba(116,246,223,0.28)',
  background: 'rgba(4,15,35,0.55)',
  color: '#dff6f8',
  padding: '13px 14px',
  outline: 'none',
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: 0.2,
};

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, isAuthenticated, isLoading } = useAuth();

  const nextPath = useMemo(() => searchParams.get('next') || '/levels', [searchParams]);
  const [mode, setMode] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(nextPath, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, nextPath]);

  const isLogin = mode === 'login';

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
      } else {
        await register({ name: form.name, email: form.email, password: form.password });
      }
      navigate(nextPath, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        background: 'radial-gradient(circle at 10% 20%, #0d2e52 0%, transparent 35%), radial-gradient(circle at 90% 80%, #0f725f 0%, transparent 30%), linear-gradient(145deg, #060f24 0%, #07162f 40%, #07192b 100%)',
        display: 'grid',
        placeItems: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <motion.div
        animate={{ y: [0, -10, 0], opacity: [0.18, 0.26, 0.18] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(116,246,223,0.4) 0%, rgba(116,246,223,0.01) 70%)',
          filter: 'blur(10px)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        animate={{ y: [0, 8, 0], opacity: [0.16, 0.22, 0.16] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
        style={{
          position: 'absolute',
          bottom: '-18%',
          left: '-8%',
          width: 360,
          height: 360,
          borderRadius: '40%',
          background: 'radial-gradient(circle, rgba(255,170,84,0.35) 0%, rgba(255,170,84,0) 72%)',
          filter: 'blur(12px)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={cardStyle}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 12, color: '#8ad9d0', letterSpacing: 2, fontWeight: 700 }}>ASYNC RUSH</div>
            <h1 style={{ margin: '8px 0 0', fontSize: 32, lineHeight: 1, color: '#f3fffe' }}>{isLogin ? 'Welcome Back' : 'Join The Rush'}</h1>
          </div>
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.5 }}
            style={{ fontSize: 34 }}
          >
            {isLogin ? '⚡' : '🚀'}
          </motion.div>
        </div>

        <p style={{ margin: '0 0 20px', color: '#8cb7c3', fontSize: 13 }}>
          {isLogin ? 'Log in to continue your progression and unlock levels.' : 'Create your player account to save progression across zones.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setMode('login')}
            style={{
              border: 0,
              borderRadius: 10,
              padding: '10px 12px',
              fontWeight: 700,
              cursor: 'pointer',
              color: mode === 'login' ? '#042c2d' : '#9cd9d9',
              background: mode === 'login' ? '#74f6df' : 'rgba(116,246,223,0.1)',
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            style={{
              border: 0,
              borderRadius: 10,
              padding: '10px 12px',
              fontWeight: 700,
              cursor: 'pointer',
              color: mode === 'register' ? '#2c1804' : '#ffd3ad',
              background: mode === 'register' ? '#ffb56b' : 'rgba(255,181,107,0.1)',
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 11 }}>
          {!isLogin && (
            <input
              placeholder="Display name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              style={fieldStyle}
              minLength={2}
              maxLength={50}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            style={fieldStyle}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            style={fieldStyle}
            minLength={6}
            required
          />

          {error && (
            <div
              style={{
                borderRadius: 10,
                border: '1px solid rgba(255, 131, 131, 0.45)',
                background: 'rgba(85, 13, 13, 0.35)',
                color: '#ffb7b7',
                padding: '8px 10px',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            style={{
              marginTop: 6,
              border: 0,
              borderRadius: 12,
              padding: '13px 14px',
              fontWeight: 800,
              fontSize: 14,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              color: '#041726',
              background: 'linear-gradient(90deg, #74f6df, #9bd9ff)',
              opacity: isSubmitting ? 0.65 : 1,
            }}
          >
            {isSubmitting ? 'Please wait...' : isLogin ? 'Login to Play' : 'Create Account'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

// In dev, requests go to Vite's proxy (/api → localhost:5000) — no CORS needed.
// In production, set VITE_API_BASE_URL to your deployed backend URL.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new ApiError(
      payload.message || `Request failed with status ${response.status}`,
      response.status,
      payload
    );
  }

  return payload.data ?? null;
}

export const api = {
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),
  getProgress: () => request('/api/game/progress'),
  submitLevel: (body) => request('/api/game/submit', { method: 'POST', body: JSON.stringify(body) }),
  getLevelStatus: (difficulty, level) => request(`/api/game/level/${difficulty}/${level}`),

  // User profile
  getProfile: () => request('/api/users/profile'),
  updateProfile: (body) => request('/api/users/profile', { method: 'PATCH', body: JSON.stringify(body) }),
};

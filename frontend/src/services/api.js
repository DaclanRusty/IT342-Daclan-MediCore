const BASE_URL = 'http://localhost:8080/api/v1';

// Helper: get stored token
const getToken = () => localStorage.getItem('accessToken');

// Core fetch wrapper
async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (getToken()) {
    headers['Authorization'] = `Bearer ${getToken()}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    const message =
      data?.error?.message || 'Something went wrong. Please try again.';
    throw new Error(message);
  }

  return data.data;
}

// ─── Auth ────────────────────────────────────────────────
export const authApi = {
  /**
   * Login
   * POST /api/v1/auth/login
   * Body: { email, password }
   * Returns: { user: { email, firstname, lastname, role }, accessToken, refreshToken }
   */
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  /**
   * Register Patient
   * POST /api/v1/auth/register
   * Body: RegisterRequest with role = "PATIENT"
   */
  registerPatient: (formData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...formData, role: 'PATIENT' }),
    }),

  /**
   * Register Doctor
   * POST /api/v1/auth/register
   * Body: RegisterRequest with role = "DOCTOR"
   */
  registerDoctor: (formData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...formData, role: 'DOCTOR' }),
    }),
};

// ─── Token helpers ────────────────────────────────────────
export const tokenStorage = {
  save: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  },
  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  saveUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  },
};
const BASE_URL = 'http://localhost:8081/api/v1';

const getToken = () => localStorage.getItem('accessToken');

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (getToken()) {
    headers['Authorization'] = `Bearer ${getToken()}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch {
    throw new Error('Cannot connect to server. Make sure Spring Boot is running on port 8081.');
  }

  const data = await res.json();

  if (!res.ok) {
    // Pull message from our ApiResponse error shape
    const message =
      data?.error?.message ||
      data?.message ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  // Return data.data if wrapped, otherwise return data directly
  return data?.data !== undefined ? data.data : data;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  registerPatient: (formData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...formData, role: 'PATIENT' }),
    }),

  registerDoctor: (formData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...formData, role: 'DOCTOR' }),
    }),
};

// ─── Token helpers ────────────────────────────────────────────────────────────
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
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  },
};
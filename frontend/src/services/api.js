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
    const message =
      data?.error?.message ||
      data?.message ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data?.data !== undefined ? data.data : data;
}

export const authApi = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  googleLogin: (accessToken) =>
    request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential: accessToken }),
    }),

  registerPatient: (formData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...formData,
        role: 'PATIENT',
        googleVerified: true,  // ← ADDED
      }),
    }),

  registerDoctor: (formData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...formData,
        role: 'DOCTOR',
        googleVerified: true,  // ← ADDED
      }),
    }),

  getAvailableDoctors: () => request('/auth/doctors/available'),

  registerSecretary: (formData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...formData,
        role: 'SECRETARY',
        googleVerified: true,  // ← ADDED
      }),
    }),
};

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

export const adminApi = {
  // ── Users ───────────────────────────────────────────────────────────────
  getAllUsers: () => request('/admin/users'),

  deleteUser: (userId) =>
    request(`/admin/users/${userId}`, { method: 'DELETE' }),

  updateUserRole: (userId, role) =>
    request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  // ── Block / Unblock ─────────────────────────────────────────────────────
  blockUser: (userId) =>
    request(`/admin/users/${userId}/block`, { method: 'PUT' }),

  unblockUser: (userId) =>
    request(`/admin/users/${userId}/unblock`, { method: 'PUT' }),

  // ── Doctors ─────────────────────────────────────────────────────────────
  getAllDoctors: () => request('/admin/doctors'),

  approveDoctor: (doctorId) =>
    request(`/admin/doctors/${doctorId}/approve`, { method: 'PUT' }),

  rejectDoctor: (doctorId) =>
    request(`/admin/doctors/${doctorId}/reject`, { method: 'PUT' }),

  // ── Secretary Assignments ────────────────────────────────────────────────
  getSecretaryAssignments: () => request('/admin/secretary-assignments'),
};

export const doctorApi = {
  getSecretaryRequests: () => request('/doctor/secretary-requests'),

  approveSecretary: (secretaryId) =>
    request(`/doctor/secretary-requests/${secretaryId}/approve`, { method: 'PUT' }),

  rejectSecretary: (secretaryId) =>
    request(`/doctor/secretary-requests/${secretaryId}/reject`, { method: 'PUT' }),

  getAppointments: () => request('/doctor/appointments'),
};
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ─── Auth Feature ─────────────────────────────────────────────────────────────
import { AuthProvider } from './features/auth/AuthContext';
import LoginPage from './features/auth/LoginPage';
import RegisterRolePage from './features/auth/RegisterRolePage';
import PatientRegisterPage from './features/auth/PatientRegisterPage';
import DoctorRegisterPage from './features/auth/DoctorRegisterPage';
import SecretaryRegisterPage from './features/auth/SecretaryRegisterPage';
import AuthCallBackPage from './features/auth/AuthCallBackPage';

// ─── Admin Feature ────────────────────────────────────────────────────────────
import AdminDashboard from './features/admin/AdminDashboard';

// ─── Doctor Feature ───────────────────────────────────────────────────────────
import DoctorDashboard from './features/doctor/DoctorDashboard';

// ─── Patient Feature ──────────────────────────────────────────────────────────
import PatientDashboard from './features/patient/PatientDashboard';

// ─── Secretary Feature ────────────────────────────────────────────────────────
import SecretaryDashboard from './features/secretary/SecretaryDashboard';

// ─── Shared ───────────────────────────────────────────────────────────────────
import LandingPage from './features/shared/LandingPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Shared */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterRolePage />} />
          <Route path="/register/patient" element={<PatientRegisterPage />} />
          <Route path="/register/doctor" element={<DoctorRegisterPage />} />
          <Route path="/register/secretary" element={<SecretaryRegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallBackPage />} />

          {/* Dashboards - both old and new paths */}
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/*" element={<AdminDashboard />} />
          <Route path="/doctor/*" element={<DoctorDashboard />} />
          <Route path="/dashboard/doctor/*" element={<DoctorDashboard />} />
          <Route path="/patient/*" element={<PatientDashboard />} />
          <Route path="/dashboard/patient/*" element={<PatientDashboard />} />
          <Route path="/secretary/*" element={<SecretaryDashboard />} />
          <Route path="/dashboard/secretary/*" element={<SecretaryDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
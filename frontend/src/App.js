import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import PatientRegisterPage from './pages/PatientRegisterPage';
import DoctorRegisterPage from './pages/DoctorRegisterPage';
import SecretaryDashboard from './pages/SecretaryDashboard';

function PatientDashboard() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h2>Patient Dashboard</h2>
      <p>Welcome, {user?.firstname} {user?.lastname}!</p>
      <button onClick={logout} style={{ marginTop: 16, padding: '8px 20px', cursor: 'pointer' }}>Logout</button>
    </div>
  );
}

function DoctorDashboard() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h2>Doctor Dashboard</h2>
      <p>Welcome, Dr. {user?.lastname}!</p>
      <button onClick={logout} style={{ marginTop: 16, padding: '8px 20px', cursor: 'pointer' }}>Logout</button>
    </div>
  );
}


// ── Protected Route ────────────────────────────────────────
function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role?.toLowerCase() !== requiredRole) {
    return <Navigate to={`/dashboard/${user?.role?.toLowerCase()}`} replace />;
  }
  return children;
}

// ── Routes ─────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/patient" element={<PatientRegisterPage />} />
      <Route path="/register/doctor" element={<DoctorRegisterPage />} />

      {/* Protected Dashboards */}
      <Route path="/dashboard/patient" element={
        <ProtectedRoute requiredRole="patient"><PatientDashboard /></ProtectedRoute>
      } />
      <Route path="/dashboard/doctor" element={
        <ProtectedRoute requiredRole="doctor"><DoctorDashboard /></ProtectedRoute>
      } />
      <Route path="/dashboard/secretary" element={
        <ProtectedRoute requiredRole="secretary"><SecretaryDashboard /></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ── App ────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
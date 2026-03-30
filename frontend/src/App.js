import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterRolePage from './pages/RegisterRolePage';
import PatientRegisterPage from './pages/PatientRegisterPage';
import DoctorRegisterPage from './pages/DoctorRegisterPage';
import SecretaryRegisterPage from './pages/SecretaryRegisterPage';
import SecretaryDashboard from './pages/SecretaryDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard'; // ← real dashboard
import AuthCallbackPage from './pages/AuthCallBackPage';

function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role?.toLowerCase() !== requiredRole) {
    return <Navigate to={`/dashboard/${user?.role?.toLowerCase()}`} replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Registration */}
      <Route path="/register" element={<RegisterRolePage />} />
      <Route path="/register/patient" element={<PatientRegisterPage />} />
      <Route path="/register/doctor" element={<DoctorRegisterPage />} />
      <Route path="/register/secretary" element={<SecretaryRegisterPage />} />

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
      <Route path="/dashboard/admin" element={
        <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
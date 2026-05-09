import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { tokenStorage } from '../shared/api';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState('processing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      setErrorMsg(decodeURIComponent(error));
      setStatus('error');
      return;
    }

    if (!token) {
      setErrorMsg('No authentication token received. Please try again.');
      setStatus('error');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      const userData = {
        email:     payload.sub,
        role:      payload.role || 'PATIENT',
        firstname: payload.firstname || '',
        lastname:  payload.lastname  || '',
      };

      login(userData, token, null);

      const role = (payload.role || 'PATIENT').toLowerCase();
      const dashboardMap = {
        patient:   '/dashboard/patient',
        doctor:    '/dashboard/doctor',
        secretary: '/dashboard/secretary',
        admin:     '/dashboard/admin',
      };
      navigate(dashboardMap[role] || '/dashboard/patient', { replace: true });
    } catch {
      setErrorMsg('Invalid authentication token. Please try again.');
      setStatus('error');
    }
  }, [searchParams, login, navigate]);

  if (status === 'processing') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg,#f0f4ff 0%,#e8f0fe 60%,#dbeafe 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            border: '4px solid #e2e8f0', borderTopColor: '#2563eb',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 20px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
            Signing you in…
          </div>
          <div style={{ fontSize: 14, color: '#64748b' }}>
            Please wait while we verify your Google account.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#f0f4ff 0%,#e8f0fe 60%,#dbeafe 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
      padding: '0 20px',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: 36,
        maxWidth: 440, width: '100%',
        boxShadow: '0 24px 64px rgba(37,99,235,.13)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: 'linear-gradient(135deg,#fef2f2,#fee2e2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" width="30" height="30">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
          Sign-In Failed
        </h2>
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 10, padding: '12px 16px', marginBottom: 24,
        }}>
          <p style={{ fontSize: 14, color: '#dc2626', lineHeight: 1.6, margin: 0 }}>
            {errorMsg}
          </p>
        </div>
        <button
          onClick={() => navigate('/login')}
          style={{
            width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
            color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

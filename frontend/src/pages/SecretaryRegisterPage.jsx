import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useGoogleLogin } from '@react-oauth/google';

export default function SecretaryRegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    password: '', confirmPassword: '', phone_number: '', doctor_id: '',
  });

  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading]     = useState(true);
  const [showPw, setShowPw]                     = useState(false);
  const [showCpw, setShowCpw]                   = useState(false);
  const [loading, setLoading]                   = useState(false);
  const [googleLoading, setGoogleLoading]       = useState(false);
  const [error, setError]                       = useState('');
  const [fe, setFe]                             = useState({});
  const [googleVerified, setGoogleVerified]     = useState(false);
  const [googleEmail, setGoogleEmail]           = useState('');

  useEffect(() => {
    authApi.getAvailableDoctors()
      .then(data => setAvailableDoctors(Array.isArray(data) ? data : []))
      .catch(() => setAvailableDoctors([]))
      .finally(() => setDoctorsLoading(false));
  }, []);

  const formatPhone = (val) => {
    const digits = val.replace(/\D/g, '');
    const local = digits.startsWith('63') ? digits.slice(2) : digits.startsWith('0') ? digits.slice(1) : digits;
    const trimmed = local.slice(0, 10);
    if (!trimmed.length) return '';
    if (trimmed.length <= 3) return `+63 ${trimmed}`;
    if (trimmed.length <= 6) return `+63 ${trimmed.slice(0,3)} ${trimmed.slice(3)}`;
    return `+63 ${trimmed.slice(0,3)} ${trimmed.slice(3,6)} ${trimmed.slice(6)}`;
  };

  const upd = (f, v) => {
    setForm(p => ({ ...p, [f]: v }));
    setFe(p => ({ ...p, [f]: '' }));
    setError('');
  };

  const handleGoogleVerify = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();
        setGoogleVerified(true);
        setGoogleEmail(userInfo.email);
        setForm(p => ({
          ...p,
          email:      userInfo.email,
          first_name: userInfo.given_name  || p.first_name,
          last_name:  userInfo.family_name || p.last_name,
        }));
        setFe(p => ({ ...p, email: '' }));
      } catch {
        setError('Failed to verify Google account. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setError('Google verification was cancelled. Please try again.'),
    scope: 'email profile',
  });

  const removeGoogleVerification = () => {
    setGoogleVerified(false);
    setGoogleEmail('');
    setForm(p => ({ ...p, email: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.first_name.trim())  e.first_name  = 'Required';
    if (!form.last_name.trim())   e.last_name   = 'Required';
    if (!form.email.trim())       e.email       = 'Required';
    else if (!googleVerified)     e.email       = 'Please verify your email using Google first';
    if (form.password.length < 8) e.password    = 'Min 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.doctor_id)          e.doctor_id   = 'Please select a doctor';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFe(errs); return; }
    setLoading(true); setError('');
    try {
      const result = await authApi.registerSecretary({
        firstname:   form.first_name,
        lastname:    form.last_name,
        email:       form.email,
        password:    form.password,
        phoneNumber: form.phone_number,
        doctorId:    form.doctor_id,
        role:        'SECRETARY',
      });
      navigate('/login', {
        state: {
          registered: true,
          role: 'secretary',
          message: result?.message || 'Registration submitted! Please wait for the doctor to approve your request.',
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inp = (f, ex = {}) => ({
    width: '100%', padding: '11px 12px 11px 38px', borderRadius: 10,
    border: `1.5px solid ${fe[f] ? '#ef4444' : '#e2e8f0'}`,
    fontSize: 14, color: '#0f172a', background: '#fff', boxSizing: 'border-box', ...ex,
  });
  const lbl = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
  const ic  = { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' };

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", minHeight: '100vh', background: 'linear-gradient(135deg,#faf5ff 0%,#ede9fe 40%,#ddd6fe 100%)' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        .rc { animation: fadeUp .5s ease forwards; }
        input:focus, select:focus { outline: none; border-color: #a855f7 !important; }
        .breg { transition: all .2s; }
        .breg:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(168,85,247,.4) !important; }
        .breg:disabled { opacity: .6; cursor: not-allowed; }
        .gvbtn { transition: all .2s; }
        .gvbtn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.15) !important; }
        .gvbtn:disabled { opacity: .6; cursor: not-allowed; }
      `}</style>

      <nav style={{ padding: '0 5%', height: 60, display: 'flex', alignItems: 'center' }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#a855f7,#9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15 }}>M</div>
          <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 17, color: '#1e293b' }}>Medi<span style={{ color: '#a855f7' }}>Core</span></span>
        </div>
      </nav>

      <div style={{ padding: '20px 5% 60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(168,85,247,.1)', borderRadius: 20, padding: '5px 14px', color: '#9333ea', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Secretary Registration
        </div>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 8 }}>
          Create a <span style={{ color: '#a855f7' }}>Secretary Account</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: 15, marginBottom: 32, textAlign: 'center' }}>
          Register and choose the doctor you'd like to work with — they'll approve your request
        </p>

        <div className="rc" style={{ background: '#fff', borderRadius: 24, boxShadow: '0 24px 64px rgba(168,85,247,.13)', padding: 36, width: '100%', maxWidth: 620 }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 20, color: '#dc2626', fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* ── Google Email Verification ──────────────────────────── */}
            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>
                Verify Email with Google <span style={{ color: '#ef4444' }}>*</span>
              </label>
              {!googleVerified ? (
                <>
                  <button
                    type="button"
                    className="gvbtn"
                    onClick={() => handleGoogleVerify()}
                    disabled={googleLoading}
                    style={{
                      width: '100%', padding: '11px 16px', borderRadius: 10,
                      border: `1.5px solid ${fe.email ? '#ef4444' : '#e2e8f0'}`,
                      background: '#fff', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 10, cursor: 'pointer',
                      fontSize: 14, fontWeight: 600, color: '#374151',
                      boxShadow: '0 1px 4px rgba(0,0,0,.08)',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {googleLoading ? 'Verifying…' : 'Continue with Google to verify email'}
                  </button>
                  {fe.email && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.email}</p>}
                  <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 6 }}>
                    This verifies your email is a real Google account. You'll still set your own password below.
                  </p>
                </>
              ) : (
                <div style={{ background: '#f5f3ff', border: '1.5px solid #c4b5fd', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#5b21b6' }}>Google Email Verified</div>
                      <div style={{ fontSize: 12, color: '#7c3aed' }}>{googleEmail}</div>
                    </div>
                  </div>
                  <button type="button" onClick={removeGoogleVerification} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* ── Name ──────────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>First Name <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input value={form.first_name} onChange={e => upd('first_name', e.target.value)} placeholder="First Name" style={inp('first_name')} />
                </div>
                {fe.first_name && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.first_name}</p>}
              </div>
              <div>
                <label style={lbl}>Last Name <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input value={form.last_name} onChange={e => upd('last_name', e.target.value)} placeholder="Last Name" style={inp('last_name')} />
                </div>
                {fe.last_name && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.last_name}</p>}
              </div>
            </div>

            {/* ── Email (read-only after Google verify) ─────────────── */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input
                  type="email"
                  value={form.email}
                  readOnly={googleVerified}
                  onChange={e => !googleVerified && upd('email', e.target.value)}
                  placeholder={googleVerified ? '' : 'Verify with Google above first'}
                  style={{
                    ...inp('email'),
                    background: googleVerified ? '#f5f3ff' : '#f8fafc',
                    color: googleVerified ? '#5b21b6' : '#94a3b8',
                    cursor: googleVerified ? 'default' : 'not-allowed',
                  }}
                />
                {googleVerified && (
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 700, color: '#7c3aed' }}>✓ Verified</span>
                )}
              </div>
            </div>

            {/* ── Phone ─────────────────────────────────────────────── */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.1a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/></svg>
                <input
                  type="tel"
                  value={form.phone_number}
                  onChange={e => upd('phone_number', formatPhone(e.target.value))}
                  placeholder="+63 900 000 0000"
                  style={inp('phone_number')}
                />
              </div>
            </div>

            {/* ── Passwords ─────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>Password <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => upd('password', e.target.value)} placeholder="Min. 8 characters" style={inp('password', { paddingRight: 38 })} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                {fe.password && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.password}</p>}
              </div>
              <div>
                <label style={lbl}>Confirm Password <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type={showCpw ? 'text' : 'password'} value={form.confirmPassword} onChange={e => upd('confirmPassword', e.target.value)} placeholder="Repeat password" style={inp('confirmPassword', { paddingRight: 38 })} />
                  <button type="button" onClick={() => setShowCpw(!showCpw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                {fe.confirmPassword && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.confirmPassword}</p>}
              </div>
            </div>

            {/* ── Doctor dropdown ───────────────────────────────────── */}
            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>Select Doctor to Work With <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                <select
                  value={form.doctor_id}
                  onChange={e => upd('doctor_id', e.target.value)}
                  disabled={doctorsLoading}
                  style={{ ...inp('doctor_id'), paddingRight: 32, appearance: 'none', cursor: doctorsLoading ? 'wait' : 'pointer' }}
                >
                  <option value="">
                    {doctorsLoading ? 'Loading doctors…' : availableDoctors.length === 0 ? 'No available doctors at this time' : 'Select a doctor'}
                  </option>
                  {availableDoctors.map(doc => (
                    <option key={doc.doctorId} value={doc.doctorId}>
                      Dr. {doc.firstname} {doc.lastname} — {doc.specialization}
                    </option>
                  ))}
                </select>
                <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {fe.doctor_id
                ? <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.doctor_id}</p>
                : <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Only approved doctors without an assigned secretary are shown</p>
              }
            </div>

            {/* ── Info notice ───────────────────────────────────────── */}
            <div style={{ background: 'linear-gradient(135deg,#faf5ff,#ede9fe)', border: '1px solid #ddd6fe', borderRadius: 10, padding: '11px 14px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" width="15" height="15" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontSize: 13, color: '#7c3aed', lineHeight: 1.5 }}>
                After registering, your status will be <strong>PENDING</strong>. The selected doctor must <strong>approve</strong> your request before you can access your dashboard.
              </span>
            </div>

            <button
              className="breg"
              type="submit"
              disabled={loading || !googleVerified || doctorsLoading || availableDoctors.length === 0}
              style={{
                width: '100%', padding: 14, borderRadius: 11, border: 'none',
                background: googleVerified ? 'linear-gradient(135deg,#a855f7,#9333ea)' : '#e2e8f0',
                color: googleVerified ? '#fff' : '#94a3b8',
                fontWeight: 700, fontSize: 15,
                cursor: googleVerified ? 'pointer' : 'not-allowed',
                boxShadow: googleVerified ? '0 6px 20px rgba(168,85,247,.3)' : 'none',
              }}
            >
              {loading ? 'Submitting Request…' : googleVerified ? 'Submit Registration Request →' : 'Verify Google Email First'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#94a3b8' }}>
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#a855f7', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}
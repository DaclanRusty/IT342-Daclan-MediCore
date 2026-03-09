import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useGoogleLogin } from '@react-oauth/google';

const GENDERS = ['Male', 'Female', 'Other'];

const BARANGAYS = [
  'Adlaon','Agsungot','Apas','Babag','Bacayan','Banilad','Basak Pardo','Basak San Nicolas',
  'Binaliw','Bonbon','Budla-an','Buhisan','Bulacao','Buot-Taup Pardo','Busay','Calamba',
  'Cambinocot','Camputhaw','Capitol Site','Carreta','Central Poblacion','Cogon Pardo',
  'Cogon Ramos','Day-as','Duljo','Ermita','Guadalupe','Guba','Hippodromo','Inayawan',
  'Kalubihan','Kalunasan','Kamagayan','Kasambagan','Kinasang-an Pardo','Labangon',
  'Lahug','Lorega San Miguel','Lusaran','Luz','Mabini','Mabolo','Malubog','Mambaling',
  'Mine Hill','Mohon','Moncada','Nivel Hills','Non-oc','Odlot','Pardo','Pari-an',
  'Paril','Pasil','Pit-os','Poblacion Pardo','Pulangbato','Punta Princesa',
  'Quiot Pardo','Sambag I','Sambag II','San Antonio','San Jose','San Nicolas Central',
  'San Roque','Santa Cruz','Santo Niño','Sawang Calero','Sinsin','Sirao','Suba Pasil',
  'Sudlon I','Sudlon II','T. Padilla','Tabunan','Tagbao','Talamban','Taptap','Tejero',
  'Tinago','Tisa','To-ong Pardo','Toong','Zapatera',
].sort();

function formatPHPhone(raw) {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('63')) digits = digits.slice(2);
  if (digits.startsWith('0'))  digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (digits.length === 0) return { display: '+63 ', raw: '' };
  if (digits.length <= 3)  return { display: '+63 ' + digits, raw: digits };
  if (digits.length <= 6)  return { display: `+63 ${digits.slice(0,3)} ${digits.slice(3)}`, raw: digits };
  return { display: `+63 ${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`, raw: digits };
}

export default function PatientRegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstname: '', lastname: '', email: '', password: '', confirmPassword: '',
    phoneNumber: '', dateOfBirth: '', gender: '', street: '', barangay: '',
  });
  const [phoneDisplay, setPhoneDisplay]       = useState('+63 ');
  const [agreed, setAgreed]                   = useState(false);
  const [showPw, setShowPw]                   = useState(false);
  const [showCpw, setShowCpw]                 = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [googleLoading, setGoogleLoading]     = useState(false);
  const [error, setError]                     = useState('');
  const [fe, setFe]                           = useState({});
  // Google verification state
  const [googleVerified, setGoogleVerified]   = useState(false);
  const [googleEmail, setGoogleEmail]         = useState('');

  const upd = (f, v) => { setForm(p => ({ ...p, [f]: v })); setFe(p => ({ ...p, [f]: '' })); setError(''); };

  const handlePhoneChange = (e) => {
    const { display, raw } = formatPHPhone(e.target.value);
    setPhoneDisplay(display);
    const fullNumber = raw.length > 0 ? `+63${raw}` : '';
    setForm(p => ({ ...p, phoneNumber: fullNumber }));
    setFe(p => ({ ...p, phoneNumber: '' }));
    setError('');
  };

  // ── Google verify during registration ──────────────────────────────────
  const handleGoogleVerify = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        // Get user info from Google using the access token
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();
        const verifiedEmail = userInfo.email;

        setGoogleVerified(true);
        setGoogleEmail(verifiedEmail);

        // Pre-fill email and name fields
        setForm(p => ({
          ...p,
          email:     verifiedEmail,
          firstname: userInfo.given_name  || p.firstname,
          lastname:  userInfo.family_name || p.lastname,
        }));
        setFe(p => ({ ...p, email: '' }));
      } catch (err) {
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
    if (!form.firstname.trim())  e.firstname  = 'Required';
    if (!form.lastname.trim())   e.lastname   = 'Required';
    if (!form.email.trim())      e.email      = 'Required';
    else if (!googleVerified)    e.email      = 'Please verify your email using Google first';
    if (form.password.length < 8) e.password  = 'Min 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    const digits = form.phoneNumber.replace(/\D/g,'').replace(/^63/,'');
    if (digits.length !== 10)    e.phoneNumber = 'Enter a valid 10-digit PH number';
    if (!form.dateOfBirth)       e.dateOfBirth = 'Required';
    if (!form.gender)            e.gender      = 'Select a gender';
    if (!form.street.trim())     e.street      = 'Required';
    if (!form.barangay)          e.barangay    = 'Select a barangay';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFe(errs); return; }
    if (!agreed) { setError('Please agree to the Terms & Conditions'); return; }
    setLoading(true); setError('');
    try {
      const address = `${form.street}, ${form.barangay}, Cebu City`;
      await authApi.registerPatient({
        firstname: form.firstname, lastname: form.lastname, email: form.email,
        password: form.password, phoneNumber: form.phoneNumber,
        dateOfBirth: form.dateOfBirth, gender: form.gender.toUpperCase(), address,
      });
      navigate('/login', {
        state: {
          registered: true,
          message: 'Account created! Check your email for a welcome message.',
        },
      });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const inp = (f, ex = {}) => ({
    width: '100%', padding: '11px 12px 11px 38px', borderRadius: 10,
    border: `1.5px solid ${fe[f] ? '#ef4444' : '#e2e8f0'}`, fontSize: 14,
    color: '#0f172a', background: '#fff', boxSizing: 'border-box', ...ex,
  });
  const lbl = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
  const ic  = { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' };

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", minHeight: '100vh', background: 'linear-gradient(135deg,#f0f4ff 0%,#e8f0fe 60%,#dbeafe 100%)' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.rc{animation:fadeUp .5s ease forwards;}input:focus,textarea:focus,select:focus{outline:none;border-color:#2563eb!important;}.breg{transition:all .2s;}.breg:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(37,99,235,.35)!important;}.breg:disabled{opacity:.6;cursor:not-allowed;}.gbtn{transition:border-color .2s,background .2s;cursor:pointer;}.gbtn:hover{border-color:#2563eb!important;}.gvbtn{transition:all .2s;}.gvbtn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.15)!important;}.gvbtn:disabled{opacity:.6;cursor:not-allowed;}`}</style>

      <nav style={{ padding: '0 5%', height: 60, display: 'flex', alignItems: 'center' }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15 }}>M</div>
          <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 17, color: '#1e293b' }}>Medi<span style={{ color: '#2563eb' }}>Core</span></span>
        </div>
      </nav>

      <div style={{ padding: '20px 5% 60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(37,99,235,.1)', borderRadius: 20, padding: '5px 14px', color: '#2563eb', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          Patient Registration
        </div>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 8 }}>
          Create Your <span style={{ color: '#2563eb' }}>Account</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: 15, marginBottom: 32, textAlign: 'center' }}>Healthcare Scheduling Made Easy.</p>

        <div className="rc" style={{ background: '#fff', borderRadius: 24, boxShadow: '0 24px 64px rgba(37,99,235,.13)', padding: 36, width: '100%', maxWidth: 620 }}>
          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 20, color: '#dc2626', fontSize: 13 }}>{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* ── Google Email Verification ──────────────────────────────── */}
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
                    {/* Google G logo */}
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
                // Verified state
                <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>Google Email Verified</div>
                      <div style={{ fontSize: 12, color: '#16a34a' }}>{googleEmail}</div>
                    </div>
                  </div>
                  <button type="button" onClick={removeGoogleVerification} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* ── Name ───────────────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>First Name <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  <input value={form.firstname} onChange={e => upd('firstname', e.target.value)} placeholder="First name" style={inp('firstname')} />
                </div>
                {fe.firstname && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.firstname}</p>}
              </div>
              <div>
                <label style={lbl}>Last Name <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  <input value={form.lastname} onChange={e => upd('lastname', e.target.value)} placeholder="Last name" style={inp('lastname')} />
                </div>
                {fe.lastname && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.lastname}</p>}
              </div>
            </div>

            {/* ── Email (read-only after Google verify) ──────────────────── */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                <input
                  type="email"
                  value={form.email}
                  readOnly={googleVerified}
                  onChange={e => !googleVerified && upd('email', e.target.value)}
                  placeholder={googleVerified ? '' : 'Verify with Google above first'}
                  style={{
                    ...inp('email'),
                    background: googleVerified ? '#f0fdf4' : '#f8fafc',
                    color: googleVerified ? '#166534' : '#94a3b8',
                    cursor: googleVerified ? 'default' : 'not-allowed',
                  }}
                />
                {googleVerified && (
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 700, color: '#16a34a' }}>✓ Verified</span>
                )}
              </div>
            </div>

            {/* ── Passwords ──────────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>Password <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => upd('password', e.target.value)} placeholder="Min. 8 characters" style={inp('password', { paddingRight: 38 })} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  </button>
                </div>
                {fe.password && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.password}</p>}
              </div>
              <div>
                <label style={lbl}>Confirm Password <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  <input type={showCpw ? 'text' : 'password'} value={form.confirmPassword} onChange={e => upd('confirmPassword', e.target.value)} placeholder="Repeat password" style={inp('confirmPassword', { paddingRight: 38 })} />
                  <button type="button" onClick={() => setShowCpw(!showCpw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  </button>
                </div>
                {fe.confirmPassword && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.confirmPassword}</p>}
              </div>
            </div>

            {/* ── Phone + DOB ─────────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.1a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" /></svg>
                  <input type="tel" value={phoneDisplay} onChange={handlePhoneChange} placeholder="+63 9xx xxx xxxx" maxLength={17} style={inp('phoneNumber')} />
                </div>
                {fe.phoneNumber
                  ? <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.phoneNumber}</p>
                  : <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Format: +63 9xx xxx xxxx</p>
                }
              </div>
              <div>
                <label style={lbl}>Date of Birth <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  <input type="date" value={form.dateOfBirth} onChange={e => upd('dateOfBirth', e.target.value)} style={inp('dateOfBirth')} />
                </div>
                {fe.dateOfBirth && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.dateOfBirth}</p>}
              </div>
            </div>

            {/* ── Gender ─────────────────────────────────────────────────── */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Sex <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ display: 'flex', gap: 10 }}>
                {GENDERS.map(g => (
                  <button key={g} type="button" className="gbtn" onClick={() => upd('gender', g)}
                    style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 14, fontWeight: 500, border: `1.5px solid ${form.gender === g ? '#2563eb' : '#e2e8f0'}`, background: form.gender === g ? 'linear-gradient(135deg,#eff6ff,#dbeafe)' : '#f8fafc', color: form.gender === g ? '#2563eb' : '#64748b' }}>
                    {form.gender === g ? '✓ ' : ''}{g}
                  </button>
                ))}
              </div>
              {fe.gender && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{fe.gender}</p>}
            </div>

            {/* ── Address ────────────────────────────────────────────────── */}
            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>Address <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <input value={form.street} onChange={e => upd('street', e.target.value)} placeholder="House No. / Street / Subdivision" style={inp('street')} />
              </div>
              {fe.street && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 6 }}>{fe.street}</p>}

              <div style={{ position: 'relative', marginBottom: 10 }}>
                <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                <select value={form.barangay} onChange={e => upd('barangay', e.target.value)} style={{ ...inp('barangay'), paddingRight: 32, appearance: 'none', cursor: 'pointer' }}>
                  <option value="">Select Barangay</option>
                  {BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
              {fe.barangay && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 6 }}>{fe.barangay}</p>}

              <div style={{ position: 'relative' }}>
                <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
                <input value="Cebu City" readOnly style={{ ...inp('city'), background: '#f1f5f9', color: '#64748b', cursor: 'default' }} />
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: 20 }}>Fixed</span>
              </div>
            </div>

            {/* ── Terms ──────────────────────────────────────────────────── */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 24, cursor: 'pointer' }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ accentColor: '#2563eb', width: 16, height: 16, marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                I agree to the <button type="button" style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0 }}>Terms & Conditions</button>
              </span>
            </label>

            <button className="breg" type="submit" disabled={loading || !googleVerified}
              style={{ width: '100%', padding: 14, borderRadius: 11, border: 'none', background: googleVerified ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : '#e2e8f0', color: googleVerified ? '#fff' : '#94a3b8', fontWeight: 700, fontSize: 15, cursor: googleVerified ? 'pointer' : 'not-allowed', boxShadow: googleVerified ? '0 6px 20px rgba(37,99,235,.3)' : 'none' }}>
              {loading ? 'Creating Account…' : googleVerified ? 'Create Patient Account →' : 'Verify Google Email First'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#94a3b8' }}>
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}
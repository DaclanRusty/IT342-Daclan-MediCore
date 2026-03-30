import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorApi } from '../services/api';

// ── Icons ──────────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
);

// ── Status Badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    PENDING:  { bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
    APPROVED: { bg: '#dcfce7', color: '#166534', border: '#86efac' },
    REJECTED: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  };
  const s = styles[status] || styles.PENDING;
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
      {status}
    </span>
  );
};

// ── Navbar ────────────────────────────────────────────────────────────────
const Navbar = ({ user, onLogout }) => (
  <nav style={{ height: 64, background: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18, fontFamily: 'Georgia,serif' }}>M</div>
      <span style={{ fontWeight: 700, fontSize: 16, color: '#1e293b' }}>Medi<span style={{ color: '#10b981' }}>Core</span></span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#f0fdfb', border: '1px solid #ccfbf1', borderRadius: 10, padding: '6px 12px 6px 6px' }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
          {(user?.firstname || user?.firstName || 'D')[0].toUpperCase()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
            Dr. {user?.firstname || user?.firstName || ''} {user?.lastname || user?.lastName || ''}
          </span>
          {user?.specialty && (
            <span style={{ fontSize: 11, color: '#0d9488', fontWeight: 500 }}>{user.specialty}</span>
          )}
        </div>
      </div>
      <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
        <LogoutIcon /> Logout
      </button>
    </div>
  </nav>
);

// ── Tabs ──────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'dashboard',    label: 'Dashboard' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'secretary',    label: 'Secretary Requests' },
];

const TabBar = ({ active, onChange, pendingCount }) => (
  <div style={{ display: 'flex', gap: 4, background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0 32px' }}>
    {TABS.map(t => (
      <button key={t.key} onClick={() => onChange(t.key)} style={{ padding: '14px 18px', border: 'none', background: 'none', borderBottom: active === t.key ? '2px solid #10b981' : '2px solid transparent', color: active === t.key ? '#10b981' : '#64748b', fontWeight: active === t.key ? 700 : 500, fontSize: 14, cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 6 }}>
        {t.label}
        {t.key === 'secretary' && pendingCount > 0 && (
          <span style={{ background: '#a855f7', color: '#fff', borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{pendingCount}</span>
        )}
      </button>
    ))}
  </div>
);

// ── Dashboard Tab ─────────────────────────────────────────────────────────
const DashboardTab = ({ appointments, secretaryRequests, onGoTo, user }) => {
  const todayStr   = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.requested_date === todayStr).length;
  const pendingSec = secretaryRequests.filter(r => r.status === 'PENDING').length;
  const assignedSec = secretaryRequests.find(r => r.status === 'APPROVED');

  return (
    <div style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
        Welcome, Dr. {user?.lastname || user?.lastName || 'Doctor'} 👋
      </h1>
      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 28 }}>Manage your appointments and secretary</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 36 }}>
        {[
          { label: "Today's Appointments", value: todayAppts,          gradient: 'linear-gradient(135deg,#10b981,#059669)', border: '#bbf7d0' },
          { label: 'Total Appointments',   value: appointments.length, gradient: 'linear-gradient(135deg,#2563eb,#1d4ed8)', border: '#bfdbfe' },
        ].map(({ label, value, gradient, border }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 16, padding: 20, border: `1.5px solid ${border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" width="22" height="22"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>My Secretary</span>
          {pendingSec > 0 && (
            <button onClick={() => onGoTo('secretary')} style={{ fontSize: 12, color: '#a855f7', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              {pendingSec} pending request{pendingSec > 1 ? 's' : ''} →
            </button>
          )}
        </div>
        {assignedSec ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#a855f7,#9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><UserIcon /></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                {assignedSec.firstname} {assignedSec.lastname}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{assignedSec.email}</div>
            </div>
            <span style={{ marginLeft: 'auto', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>● Assigned</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}><UserIcon /></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>No secretary assigned yet</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Secretaries can request to be assigned to you during registration</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>Recent Appointments</span>
          <button onClick={() => onGoTo('appointments')} style={{ fontSize: 12, color: '#10b981', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }}>View all →</button>
        </div>
        {appointments.slice(0, 4).length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No appointments yet</div>
        ) : (
          appointments.slice(0, 4).map(a => (
            <div key={a.appointment_id} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #f8fafc', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}><UserIcon /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>
                  {a.patient?.firstname} {a.patient?.lastname}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><CalendarIcon /> {a.requested_date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><ClockIcon /> {a.requested_time}</span>
                </div>
              </div>
              <StatusBadge status={a.status} />
              <ArrowIcon />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ── Appointments Tab ──────────────────────────────────────────────────────
const AppointmentsTab = ({ appointments }) => {
  const [filter, setFilter] = useState('ALL');
  const filters = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];
  const filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Appointments</h2>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>All your patient appointments</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 20, border: '1.5px solid', borderColor: filter === f ? '#10b981' : '#e2e8f0', background: filter === f ? '#f0fdf4' : '#fff', color: filter === f ? '#059669' : '#64748b', fontWeight: filter === f ? 700 : 500, fontSize: 13, cursor: 'pointer' }}>{f}</button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No appointments found</div>
        ) : (
          filtered.map(a => (
            <div key={a.appointment_id} style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}><UserIcon /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>
                  {a.patient?.firstname} {a.patient?.lastname}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', gap: 10, marginTop: 2 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><CalendarIcon /> {a.requested_date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><ClockIcon /> {a.requested_time}</span>
                </div>
              </div>
              {a.reason_for_visit && (
                <span style={{ fontSize: 13, color: '#64748b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason_for_visit}</span>
              )}
              <StatusBadge status={a.status} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ── Secretary Requests Tab ────────────────────────────────────────────────
// FIX: req.secretary_id → req.secretaryId
//      req.phone_number  → req.phoneNumber
//      req.requested_at  → req.requestedAt
const SecretaryRequestsTab = ({ requests, onApprove, onReject, loading }) => {
  const hasApproved = requests.some(r => r.status === 'APPROVED');

  return (
    <div style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Secretary Requests</h2>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
        Secretaries who selected you during registration — approve one to assign them to you
      </p>

      {hasApproved && (
        <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" width="15" height="15"><polyline points="20 6 9 17 4 12"/></svg>
          <span style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}>
            You already have an assigned secretary. Reject them first before approving another.
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {requests.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            No secretary requests yet
          </div>
        ) : (
          requests.map(req => (
            <div key={req.secretaryId} style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#a855f7,#9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <UserIcon />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>
                  {req.firstname} {req.lastname}
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{req.email}</div>
                {req.phoneNumber && (
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{req.phoneNumber}</div>
                )}
                {req.requestedAt && (
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                    Requested: {new Date(req.requestedAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>

              <StatusBadge status={req.status} />

              {req.status === 'PENDING' && !hasApproved && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => onApprove(req.secretaryId)} disabled={loading} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, opacity: loading ? 0.6 : 1 }}>
                    <CheckIcon /> Approve
                  </button>
                  <button onClick={() => onReject(req.secretaryId)} disabled={loading} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, opacity: loading ? 0.6 : 1 }}>
                    <XIcon /> Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────
export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [tab, setTab]                             = useState('dashboard');
  const [appointments, setAppointments]           = useState([]);
  const [secretaryRequests, setSecretaryRequests] = useState([]);
  const [loadingAction, setLoadingAction]         = useState(false);
  const [toast, setToast]                         = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAppointments = useCallback(async () => {
    try {
      const data = await doctorApi.getAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch { setAppointments([]); }
  }, []);

  const fetchSecretaryRequests = useCallback(async () => {
    try {
      const data = await doctorApi.getSecretaryRequests();
      setSecretaryRequests(Array.isArray(data) ? data : []);
    } catch { setSecretaryRequests([]); }
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchSecretaryRequests();
  }, [fetchAppointments, fetchSecretaryRequests]);

  const handleApproveSecretary = async (secretaryId) => {
    setLoadingAction(true);
    try {
      await doctorApi.approveSecretary(secretaryId);
      showToast('Secretary approved and assigned!');
      fetchSecretaryRequests();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoadingAction(false); }
  };

  const handleRejectSecretary = async (secretaryId) => {
    setLoadingAction(true);
    try {
      await doctorApi.rejectSecretary(secretaryId);
      showToast('Secretary request rejected.');
      fetchSecretaryRequests();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoadingAction(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const pendingSecCount = secretaryRequests.filter(r => r.status === 'PENDING').length;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f0fdf4 0%,#f8faff 100%)', fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <Navbar user={user} onLogout={handleLogout} />
      <TabBar active={tab} onChange={setTab} pendingCount={pendingSecCount} />

      {toast && (
        <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 999, background: toast.type === 'error' ? '#fee2e2' : '#dcfce7', border: `1px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`, color: toast.type === 'error' ? '#991b1b' : '#166534', padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
          {toast.msg}
        </div>
      )}

      {tab === 'dashboard'    && <DashboardTab appointments={appointments} secretaryRequests={secretaryRequests} onGoTo={setTab} user={user} />}
      {tab === 'appointments' && <AppointmentsTab appointments={appointments} />}
      {tab === 'secretary'    && <SecretaryRequestsTab requests={secretaryRequests} onApprove={handleApproveSecretary} onReject={handleRejectSecretary} loading={loadingAction} />}
    </div>
  );
}
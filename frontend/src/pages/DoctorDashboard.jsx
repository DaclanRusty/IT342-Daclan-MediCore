import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorApi } from '../services/api';

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
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const PencilIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const EyeOnIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const Spinner = ({ size = 15, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" style={{ animation: 'spin .7s linear infinite' }}>
    <circle cx="12" cy="12" r="10" strokeOpacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
  </svg>
);

const secFn    = s => s?.firstName || s?.firstname || '';
const secLn    = s => s?.lastName  || s?.lastname  || '';
const secEmail = s => s?.email     || '';
const apptPatFn  = a => a?.patient?.firstName || a?.patient?.firstname || '';
const apptPatLn  = a => a?.patient?.lastName  || a?.patient?.lastname  || '';
const apptDate   = a => a?.requestedDate || a?.requested_date || '';
const apptTime   = a => a?.requestedTime || a?.requested_time || '';
const apptReason = a => a?.reasonForVisit || a?.reason_for_visit || '';

// ── UPDATED: added CONFIRMED, COMPLETED, CANCELLED ────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    PENDING:   { bg: '#fef9c3', color: '#854d0e',  border: '#fde047' },
    CONFIRMED: { bg: '#dcfce7', color: '#166534',  border: '#86efac' },
    COMPLETED: { bg: '#dbeafe', color: '#1e40af',  border: '#93c5fd' },
    CANCELLED: { bg: '#f1f5f9', color: '#475569',  border: '#cbd5e1' },
    REJECTED:  { bg: '#fee2e2', color: '#991b1b',  border: '#fca5a5' },
  };
  const s = styles[status] || styles.PENDING;
  return (
    <span style={{background:s.bg,color:s.color,border:`1px solid ${s.border}`,borderRadius:20,padding:'3px 10px',fontSize:12,fontWeight:600}}>
      {status}
    </span>
  );
};

const Navbar = ({ user, onLogout }) => {
  const fn = user?.firstName || user?.firstname || '';
  const ln = user?.lastName  || user?.lastname  || '';
  return (
    <nav style={{height:64,background:'#fff',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',position:'sticky',top:0,zIndex:100,boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#10b981,#059669)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:18}}>M</div>
        <span style={{fontWeight:700,fontSize:16,color:'#1e293b'}}>Medi<span style={{color:'#10b981'}}>Core</span></span>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:9,background:'#f0fdfb',border:'1px solid #ccfbf1',borderRadius:10,padding:'6px 12px 6px 6px'}}>
          <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#10b981,#059669)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:13,fontWeight:700,flexShrink:0}}>
            {(fn[0] || 'D').toUpperCase()}
          </div>
          <span style={{fontSize:13,fontWeight:600,color:'#0f172a'}}>Dr. {fn} {ln}</span>
        </div>
        <button onClick={onLogout} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:8,border:'1.5px solid #e2e8f0',background:'#fff',color:'#374151',fontSize:12,fontWeight:600,cursor:'pointer'}}>
          <LogoutIcon /> Logout
        </button>
      </div>
    </nav>
  );
};

const TABS = [
  { key: 'dashboard',    label: 'Dashboard' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'secretary',    label: 'Secretary Requests' },
  { key: 'profile',      label: 'My Profile' },
];
const TabBar = ({ active, onChange, pendingCount }) => (
  <div style={{display:'flex',gap:4,background:'#f8fafc',borderBottom:'1px solid #e2e8f0',padding:'0 32px'}}>
    {TABS.map(t => (
      <button key={t.key} onClick={() => onChange(t.key)} style={{padding:'14px 18px',border:'none',background:'none',borderBottom:active===t.key?'2px solid #10b981':'2px solid transparent',color:active===t.key?'#10b981':'#64748b',fontWeight:active===t.key?700:500,fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
        {t.label}
        {t.key==='secretary'&&pendingCount>0&&(
          <span style={{background:'#a855f7',color:'#fff',borderRadius:20,padding:'1px 7px',fontSize:11,fontWeight:700}}>{pendingCount}</span>
        )}
      </button>
    ))}
  </div>
);

// ── UPDATED DashboardTab: show CONFIRMED appointments ─────────────────────
const DashboardTab = ({ appointments, secretaryRequests, onGoTo, user }) => {
  const fn = user?.firstName || user?.firstname || '';
  const ln = user?.lastName  || user?.lastname  || '';
  const todayStr    = new Date().toISOString().split('T')[0];
  const todayAppts  = appointments.filter(a => apptDate(a) === todayStr).length;
  const pendingSec  = secretaryRequests.filter(r => r.status === 'PENDING').length;
  const assignedSec = secretaryRequests.find(r => r.status === 'APPROVED');

  return (
    <div style={{padding:'32px',maxWidth:1000,margin:'0 auto'}}>
      <h1 style={{fontSize:22,fontWeight:700,color:'#0f172a',marginBottom:4}}>Welcome, Dr. {ln} 👋</h1>
      <p style={{color:'#94a3b8',fontSize:13,marginBottom:28}}>Manage your appointments and secretary</p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:36}}>
        {[
          { label:"Today's Appointments", value:todayAppts,  gradient:'linear-gradient(135deg,#10b981,#059669)', border:'#bbf7d0' },
          { label:'Total Appointments',   value:appointments.length, gradient:'linear-gradient(135deg,#2563eb,#1d4ed8)', border:'#bfdbfe' },
          { label:'Completed',            value:appointments.filter(a=>a.status==='COMPLETED').length, gradient:'linear-gradient(135deg,#7c3aed,#6d28d9)', border:'#ddd6fe' },
        ].map(({ label, value, gradient, border }) => (
          <div key={label} style={{background:'#fff',borderRadius:16,padding:20,border:`1.5px solid ${border}`,boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
            <div style={{width:44,height:44,borderRadius:12,background:gradient,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" width="22" height="22"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{fontSize:32,fontWeight:800,color:'#0f172a',marginBottom:4}}>{value}</div>
            <div style={{fontSize:13,color:'#64748b',fontWeight:500}}>{label}</div>
          </div>
        ))}
      </div>

      {/* Secretary card */}
      <div style={{background:'#fff',borderRadius:16,padding:20,boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginBottom:24}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <span style={{fontWeight:700,fontSize:15,color:'#0f172a'}}>My Secretary</span>
          {pendingSec>0&&(
            <button onClick={()=>onGoTo('secretary')} style={{fontSize:12,color:'#a855f7',background:'none',border:'none',fontWeight:700,cursor:'pointer'}}>
              {pendingSec} pending request{pendingSec>1?'s':''} →
            </button>
          )}
        </div>
        {assignedSec ? (
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,#a855f7,#9333ea)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}><UserIcon /></div>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:'#0f172a'}}>{secFn(assignedSec)} {secLn(assignedSec)}</div>
              <div style={{fontSize:12,color:'#94a3b8'}}>{secEmail(assignedSec)}</div>
            </div>
            <span style={{marginLeft:'auto',background:'#dcfce7',color:'#166534',border:'1px solid #86efac',borderRadius:20,padding:'3px 10px',fontSize:12,fontWeight:600}}>● Assigned</span>
          </div>
        ) : (
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:44,height:44,borderRadius:'50%',background:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8'}}><UserIcon /></div>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:'#64748b'}}>No secretary assigned yet</div>
              <div style={{fontSize:12,color:'#94a3b8'}}>Secretaries can request to be assigned during registration</div>
            </div>
          </div>
        )}
      </div>

      {/* Recent appointments */}
      <div style={{background:'#fff',borderRadius:16,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontWeight:700,fontSize:15,color:'#0f172a'}}>Recent Appointments</span>
          <button onClick={()=>onGoTo('appointments')} style={{fontSize:12,color:'#10b981',background:'none',border:'none',fontWeight:700,cursor:'pointer'}}>View all →</button>
        </div>
        {appointments.length===0 ? (
          <div style={{padding:32,textAlign:'center',color:'#94a3b8',fontSize:14}}>No appointments yet</div>
        ) : (
          appointments.slice(0,4).map(a => (
            <div key={a.id} style={{display:'flex',alignItems:'center',padding:'14px 20px',borderBottom:'1px solid #f8fafc',gap:12}}>
              <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#2563eb,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',flexShrink:0}}><UserIcon /></div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14,color:'#0f172a'}}>{apptPatFn(a)} {apptPatLn(a)}</div>
                <div style={{fontSize:12,color:'#94a3b8',display:'flex',gap:8,marginTop:2}}>
                  <span style={{display:'flex',alignItems:'center',gap:3}}><CalendarIcon /> {apptDate(a)}</span>
                  <span style={{display:'flex',alignItems:'center',gap:3}}><ClockIcon /> {apptTime(a)}</span>
                </div>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ── UPDATED AppointmentsTab: Complete + Cancel buttons ────────────────────
const AppointmentsTab = ({ appointments, onComplete, onCancel, loading }) => {
  const [filter, setFilter]         = useState('ALL');
  const [cancelModal, setCancelModal] = useState(null); // holds appt being cancelled
  const [cancelReason, setCancelReason] = useState('');
  const [completeModal, setCompleteModal] = useState(null); // holds appt being completed
  const [doctorNotes, setDoctorNotes]   = useState('');

  const filtered = filter === 'ALL'
    ? appointments
    : appointments.filter(a => a.status === filter);

  const openCancel  = (a) => { setCancelModal(a);   setCancelReason(''); };
  const openComplete = (a) => { setCompleteModal(a); setDoctorNotes(''); };

  return (
    <div style={{padding:'32px',maxWidth:1000,margin:'0 auto'}}>
      <h2 style={{fontSize:22,fontWeight:800,color:'#0f172a',marginBottom:4}}>Appointments</h2>
      <p style={{color:'#64748b',fontSize:13,marginBottom:20}}>
        Manage your appointments ({appointments.length} total)
      </p>

      {/* Filter pills */}
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {['ALL','CONFIRMED','COMPLETED','CANCELLED'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:'6px 14px',borderRadius:20,border:'1.5px solid',
            borderColor:filter===f?'#10b981':'#e2e8f0',
            background:filter===f?'#f0fdf4':'#fff',
            color:filter===f?'#059669':'#64748b',
            fontWeight:filter===f?700:500,fontSize:13,cursor:'pointer',
          }}>{f}</button>
        ))}
      </div>

      <div style={{background:'#fff',borderRadius:16,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
        {filtered.length===0 ? (
          <div style={{padding:40,textAlign:'center',color:'#94a3b8',fontSize:14}}>
            No {filter!=='ALL'?filter.toLowerCase():''} appointments yet
          </div>
        ) : (
          filtered.map(a => (
            <div key={a.id} style={{display:'flex',alignItems:'flex-start',padding:'16px 20px',borderBottom:'1px solid #f1f5f9',gap:12,flexWrap:'wrap'}}>
              <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#2563eb,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',flexShrink:0,marginTop:2}}><UserIcon /></div>
              <div style={{flex:1,minWidth:180}}>
                <div style={{fontWeight:600,fontSize:14,color:'#0f172a'}}>{apptPatFn(a)} {apptPatLn(a)}</div>
                <div style={{fontSize:12,color:'#94a3b8',display:'flex',gap:10,marginTop:2,flexWrap:'wrap'}}>
                  <span style={{display:'flex',alignItems:'center',gap:3}}><CalendarIcon /> {apptDate(a)}</span>
                  <span style={{display:'flex',alignItems:'center',gap:3}}><ClockIcon /> {apptTime(a)}</span>
                </div>
                {apptReason(a)&&<div style={{fontSize:11,color:'#94a3b8',marginTop:2}}>{apptReason(a)}</div>}
                {/* Show doctor notes if completed */}
                {a.status==='COMPLETED'&&a.doctorNotes&&(
                  <div style={{marginTop:6,fontSize:12,color:'#1e40af',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:8,padding:'4px 10px',display:'inline-block'}}>
                    📝 {a.doctorNotes}
                  </div>
                )}
                {/* Show cancel reason */}
                {a.status==='CANCELLED'&&a.cancelReason&&(
                  <div style={{marginTop:6,fontSize:12,color:'#475569',background:'#f1f5f9',border:'1px solid #cbd5e1',borderRadius:8,padding:'4px 10px',display:'inline-block'}}>
                    ✗ {a.cancelReason}
                  </div>
                )}
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8}}>
                <StatusBadge status={a.status} />
                {/* Action buttons — only for CONFIRMED */}
                {a.status==='CONFIRMED'&&(
                  <div style={{display:'flex',gap:6,marginTop:4}}>
                    <button onClick={()=>openComplete(a)} disabled={loading} style={{
                      padding:'6px 12px',borderRadius:8,border:'none',
                      background:'linear-gradient(135deg,#10b981,#059669)',
                      color:'#fff',fontWeight:600,fontSize:12,cursor:'pointer',
                      display:'flex',alignItems:'center',gap:4,opacity:loading?0.6:1,
                    }}><CheckIcon /> Mark Completed</button>
                    <button onClick={()=>openCancel(a)} disabled={loading} style={{
                      padding:'6px 12px',borderRadius:8,border:'none',
                      background:'linear-gradient(135deg,#ef4444,#dc2626)',
                      color:'#fff',fontWeight:600,fontSize:12,cursor:'pointer',
                      display:'flex',alignItems:'center',gap:4,opacity:loading?0.6:1,
                    }}><XIcon /> Cancel</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Complete Modal ──────────────────────────────────────────────── */}
      {completeModal&&(
        <div style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(15,23,42,.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#fff',borderRadius:20,padding:28,maxWidth:460,width:'100%',boxShadow:'0 32px 80px rgba(0,0,0,.2)'}}>
            <h3 style={{fontSize:18,fontWeight:800,color:'#0f172a',marginBottom:6}}>Mark as Completed</h3>
            <p style={{fontSize:13,color:'#64748b',marginBottom:16}}>
              Patient: <strong>{apptPatFn(completeModal)} {apptPatLn(completeModal)}</strong>
            </p>
            <label style={{fontSize:13,fontWeight:600,color:'#374151',display:'block',marginBottom:6}}>
              Doctor Notes <span style={{color:'#94a3b8',fontWeight:400}}>(optional)</span>
            </label>
            <textarea
              rows={3}
              value={doctorNotes}
              onChange={e=>setDoctorNotes(e.target.value)}
              placeholder="e.g. Prescribed medication, follow-up in 2 weeks…"
              style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1.5px solid #e2e8f0',fontSize:14,resize:'vertical',boxSizing:'border-box',fontFamily:'inherit',outline:'none'}}
            />
            <div style={{display:'flex',gap:10,marginTop:18}}>
              <button onClick={()=>setCompleteModal(null)} style={{flex:1,padding:'11px',borderRadius:10,border:'1.5px solid #e2e8f0',background:'#fff',color:'#374151',fontWeight:600,fontSize:14,cursor:'pointer'}}>Cancel</button>
              <button onClick={()=>{onComplete(completeModal.id,doctorNotes||null);setCompleteModal(null);}} disabled={loading} style={{flex:1,padding:'11px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer',opacity:loading?0.6:1}}>
                ✓ Confirm Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Modal ────────────────────────────────────────────────── */}
      {cancelModal&&(
        <div style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(15,23,42,.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#fff',borderRadius:20,padding:28,maxWidth:460,width:'100%',boxShadow:'0 32px 80px rgba(0,0,0,.2)'}}>
            <h3 style={{fontSize:18,fontWeight:800,color:'#0f172a',marginBottom:6}}>Cancel Appointment</h3>
            <p style={{fontSize:13,color:'#64748b',marginBottom:16}}>
              Patient: <strong>{apptPatFn(cancelModal)} {apptPatLn(cancelModal)}</strong>
            </p>
            <label style={{fontSize:13,fontWeight:600,color:'#374151',display:'block',marginBottom:6}}>
              Reason for Cancellation <span style={{color:'#94a3b8',fontWeight:400}}>(optional)</span>
            </label>
            <select
              value={cancelReason}
              onChange={e=>setCancelReason(e.target.value)}
              style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1.5px solid #e2e8f0',fontSize:14,boxSizing:'border-box',fontFamily:'inherit',outline:'none',cursor:'pointer'}}
            >
              <option value="">Select a reason…</option>
              <option value="Doctor unavailable">Doctor unavailable</option>
              <option value="No-show">Patient no-show</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Other">Other</option>
            </select>
            <div style={{display:'flex',gap:10,marginTop:18}}>
              <button onClick={()=>setCancelModal(null)} style={{flex:1,padding:'11px',borderRadius:10,border:'1.5px solid #e2e8f0',background:'#fff',color:'#374151',fontWeight:600,fontSize:14,cursor:'pointer'}}>Back</button>
              <button onClick={()=>{onCancel(cancelModal.id,cancelReason||null);setCancelModal(null);}} disabled={loading} style={{flex:1,padding:'11px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#ef4444,#dc2626)',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer',opacity:loading?0.6:1}}>
                ✗ Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SecretaryRequestsTab = ({ requests, onApprove, onReject, loading }) => {
  const hasApproved = requests.some(r => r.status === 'APPROVED');
  return (
    <div style={{padding:'32px',maxWidth:1000,margin:'0 auto'}}>
      <h2 style={{fontSize:22,fontWeight:800,color:'#0f172a',marginBottom:4}}>Secretary Requests</h2>
      <p style={{color:'#64748b',fontSize:13,marginBottom:20}}>Secretaries who selected you during registration</p>
      {hasApproved&&(
        <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,padding:'12px 16px',marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" width="15" height="15"><polyline points="20 6 9 17 4 12"/></svg>
          <span style={{fontSize:13,color:'#059669',fontWeight:600}}>You already have an assigned secretary.</span>
        </div>
      )}
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {requests.length===0 ? (
          <div style={{background:'#fff',borderRadius:16,padding:40,textAlign:'center',color:'#94a3b8',fontSize:14,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>No secretary requests yet</div>
        ) : (
          requests.map(req => (
            <div key={req.secretaryId} style={{background:'#fff',borderRadius:16,padding:20,boxShadow:'0 2px 12px rgba(0,0,0,0.06)',display:'flex',alignItems:'center',gap:16}}>
              <div style={{width:52,height:52,borderRadius:'50%',flexShrink:0,background:'linear-gradient(135deg,#a855f7,#9333ea)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}><UserIcon /></div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:16,color:'#0f172a'}}>{secFn(req)} {secLn(req)}</div>
                <div style={{fontSize:13,color:'#64748b',marginTop:2}}>{secEmail(req)}</div>
                {req.phoneNumber&&<div style={{fontSize:12,color:'#94a3b8',marginTop:2}}>{req.phoneNumber}</div>}
                {req.requestedAt&&<div style={{fontSize:12,color:'#94a3b8',marginTop:2}}>Requested: {new Date(req.requestedAt).toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'})}</div>}
              </div>
              <StatusBadge status={req.status} />
              {req.status==='PENDING'&&!hasApproved&&(
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>onApprove(req.secretaryId)} disabled={loading} style={{padding:'8px 16px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',fontWeight:600,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:5,opacity:loading?0.6:1}}><CheckIcon /> Approve</button>
                  <button onClick={()=>onReject(req.secretaryId)} disabled={loading} style={{padding:'8px 16px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#ef4444,#dc2626)',color:'#fff',fontWeight:600,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:5,opacity:loading?0.6:1}}><XIcon /> Reject</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

function formatPHPhone(raw) {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('63')) digits = digits.slice(2);
  if (digits.startsWith('0'))  digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (!digits.length)         return { display: '+63 ',     stored: '' };
  if (digits.length <= 3)     return { display: `+63 ${digits}`, stored: `+63${digits}` };
  if (digits.length <= 6)     return { display: `+63 ${digits.slice(0,3)} ${digits.slice(3)}`, stored: `+63${digits}` };
  return { display: `+63 ${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`, stored: `+63${digits}` };
}

const SPECS = ['General Medicine','Cardiology','Dermatology','Endocrinology','Gastroenterology','Neurology','Obstetrics & Gynecology','Oncology','Ophthalmology','Orthopedics','Pediatrics','Psychiatry','Pulmonology','Radiology','Surgery','Urology','Other'];

const ProfileTab = ({ onSaved }) => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveErr, setSaveErr] = useState('');
  const [showPw,  setShowPw]  = useState({ cur: false, new: false, con: false });
  const phoneRef = useRef(null);

  const blankForm = { firstName:'',lastName:'',phoneNumber:'',specialization:'',yearsOfExperience:'',bio:'',currentPassword:'',newPassword:'',confirmPassword:'' };
  const [form, setForm] = useState(blankForm);

  const syncPhone = (phoneNumber) => {
    if (phoneRef.current) phoneRef.current.value = phoneNumber ? formatPHPhone(phoneNumber).display : '+63 ';
  };
  const populateForm = (data) => {
    setForm({ firstName:data.firstName||'',lastName:data.lastName||'',phoneNumber:data.phoneNumber||'',specialization:data.specialization||'',yearsOfExperience:data.yearsOfExperience!=null?String(data.yearsOfExperience):'',bio:data.bio||'',currentPassword:'',newPassword:'',confirmPassword:'' });
    syncPhone(data.phoneNumber);
  };
  useEffect(() => {
    (async () => {
      setLoading(true);
      try { const data = await doctorApi.getProfile(); setProfile(data); populateForm(data); }
      catch (e) { setSaveErr('Failed to load profile: '+e.message); }
      finally { setLoading(false); }
    })();
  }, []);
  useEffect(() => { if (editing) syncPhone(form.phoneNumber); }, [editing]);

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));
  const handlePhoneChange = (e) => {
    const { display, stored } = formatPHPhone(e.target.value);
    e.target.value = display;
    setForm(p => ({ ...p, phoneNumber: stored }));
  };
  const cancelEdit = () => { if (profile) populateForm(profile); setSaveErr(''); setEditing(false); };
  const handleSave = async () => {
    setSaveErr('');
    const isChangingPassword = !!form.newPassword;
    if (isChangingPassword) {
      if (!form.currentPassword) { setSaveErr('Enter your current password to change it.'); return; }
      if (form.newPassword.length < 8) { setSaveErr('New password must be at least 8 characters.'); return; }
      if (form.newPassword !== form.confirmPassword) { setSaveErr('New passwords do not match.'); return; }
    }
    setSaving(true);
    try {
      const payload = { firstName:form.firstName,lastName:form.lastName,phoneNumber:form.phoneNumber,specialization:form.specialization,yearsOfExperience:form.yearsOfExperience!==''?Number(form.yearsOfExperience):null,bio:form.bio,...(isChangingPassword?{currentPassword:form.currentPassword,newPassword:form.newPassword}:{}) };
      const updated = await doctorApi.updateProfile(payload);
      setProfile(updated); setEditing(false);
      setForm(p=>({...p,currentPassword:'',newPassword:'',confirmPassword:''}));
      onSaved('Profile updated successfully!');
    } catch (e) { setSaveErr(e.message||'Failed to save. Please try again.'); }
    finally { setSaving(false); }
  };

  const FieldRow = ({ label, value, last }) => (
    <div style={{display:'flex',alignItems:'flex-start',gap:16,padding:'12px 0',borderBottom:last?'none':'1px solid rgba(226,232,240,.5)'}}>
      <div style={{minWidth:180,fontSize:12.5,fontWeight:600,color:'#94a3b8',paddingTop:1}}>{label}</div>
      <div style={{fontSize:14,color:value?'#0f172a':'#cbd5e1',fontStyle:value?'normal':'italic',flex:1}}>{value||'Not provided'}</div>
    </div>
  );
  const EditField = ({ label, hint, children }) => (
    <div>
      <label style={{display:'block',fontSize:12.5,fontWeight:700,color:'#374151',marginBottom:5}}>{label}</label>
      {children}
      {hint&&<p style={{fontSize:11.5,color:'#94a3b8',marginTop:4}}>{hint}</p>}
    </div>
  );

  const inp  = { width:'100%',padding:'10px 13px',borderRadius:10,border:'1.5px solid #e2e8f0',fontSize:14,color:'#0f172a',background:'#fff',boxSizing:'border-box',fontFamily:'inherit',outline:'none' };
  const lock = { ...inp,background:'rgba(241,245,249,.7)',color:'#94a3b8',cursor:'not-allowed',fontStyle:'italic' };

  if (loading) return (
    <div style={{padding:'80px 32px',display:'flex',flexDirection:'column',alignItems:'center',gap:12,color:'#94a3b8'}}>
      <Spinner size={28} color="#10b981"/><span style={{fontSize:14}}>Loading profile…</span>
    </div>
  );

  const initials = `${profile?.firstName?.[0]||''}${profile?.lastName?.[0]||''}`.toUpperCase()||'DR';

  return (
    <div style={{padding:'28px 32px 56px',maxWidth:780,margin:'0 auto'}}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{background:'#fff',borderRadius:20,boxShadow:'0 2px 16px rgba(0,0,0,0.07)',overflow:'hidden'}}>
        <div style={{background:'linear-gradient(135deg,#10b981,#059669)',padding:'28px 32px 24px'}}>
          <div style={{display:'flex',alignItems:'flex-end',gap:20,flexWrap:'wrap'}}>
            <div style={{width:80,height:80,borderRadius:'50%',background:'rgba(255,255,255,.2)',border:'3px solid rgba(255,255,255,.55)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:900,fontSize:28,flexShrink:0}}>{initials}</div>
            <div style={{flex:1,minWidth:160}}>
              <div style={{color:'rgba(255,255,255,.7)',fontSize:11.5,fontWeight:700,letterSpacing:.7,marginBottom:3}}>DOCTOR PROFILE</div>
              <div style={{color:'#fff',fontSize:22,fontWeight:800}}>Dr. {profile?.firstName} {profile?.lastName}</div>
              <div style={{color:'rgba(255,255,255,.8)',fontSize:13,marginTop:5}}>
                {profile?.specialization||'Specialization not set'}
                {profile?.yearsOfExperience!=null?` · ${profile.yearsOfExperience} yrs experience`:''}
              </div>
              {profile?.bio&&<div style={{color:'rgba(255,255,255,.7)',fontSize:12.5,marginTop:6,fontStyle:'italic',maxWidth:460}}>"{profile.bio}"</div>}
            </div>
            {!editing?(
              <button onClick={()=>{setSaveErr('');setEditing(true);}} style={{display:'flex',alignItems:'center',gap:7,padding:'9px 18px',borderRadius:10,border:'1.5px solid rgba(255,255,255,.5)',background:'rgba(255,255,255,.15)',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                <PencilIcon /> Edit Profile
              </button>
            ):(
              <div style={{display:'flex',gap:8}}>
                <button onClick={cancelEdit} disabled={saving} style={{padding:'9px 16px',borderRadius:10,border:'1.5px solid rgba(255,255,255,.4)',background:'rgba(255,255,255,.1)',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{display:'flex',alignItems:'center',gap:7,padding:'9px 18px',borderRadius:10,border:'none',background:'#fff',color:'#059669',fontSize:13,fontWeight:700,cursor:saving?'not-allowed':'pointer',opacity:saving?0.8:1}}>
                  {saving?<><Spinner size={14} color="#059669"/> Saving…</>:<><SaveIcon /> Save Changes</>}
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{padding:'28px 32px'}}>
          {saveErr&&<div style={{background:'#fef2f2',border:'1.5px solid #fecaca',borderRadius:12,padding:'11px 16px',color:'#991b1b',fontWeight:600,fontSize:13,marginBottom:20}}>⚠️ {saveErr}</div>}
          {!editing&&(
            <>
              <div style={{marginBottom:24}}>
                <div style={{fontSize:11.5,fontWeight:700,color:'#10b981',letterSpacing:.8,marginBottom:12}}>👤 PERSONAL INFORMATION</div>
                <FieldRow label="Full Name"     value={`Dr. ${profile?.firstName||''} ${profile?.lastName||''}`.trim()}/>
                <FieldRow label="Email Address" value={profile?.email}/>
                <FieldRow label="Phone Number"  value={profile?.phoneNumber} last/>
              </div>
              <div style={{borderTop:'1px solid #f1f5f9',paddingTop:20,marginBottom:24}}>
                <div style={{fontSize:11.5,fontWeight:700,color:'#10b981',letterSpacing:.8,marginBottom:12}}>🩺 PROFESSIONAL INFORMATION</div>
                <FieldRow label="Specialization"      value={profile?.specialization}/>
                <FieldRow label="MD License No."      value={profile?.licenseNumber}/>
                <FieldRow label="Years of Experience" value={profile?.yearsOfExperience!=null?`${profile.yearsOfExperience} years`:null}/>
                <FieldRow label="Bio / Description"   value={profile?.bio} last/>
              </div>
            </>
          )}
          {editing&&(
            <div style={{display:'flex',flexDirection:'column',gap:0}}>
              <div style={{marginBottom:24}}>
                <div style={{fontSize:11.5,fontWeight:700,color:'#10b981',letterSpacing:.8,marginBottom:16}}>👤 PERSONAL INFORMATION</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
                  <EditField label="First Name"><input style={inp} value={form.firstName} onChange={set('firstName')} placeholder="First name"/></EditField>
                  <EditField label="Last Name"><input style={inp} value={form.lastName} onChange={set('lastName')} placeholder="Last name"/></EditField>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                  <EditField label="Phone Number" hint="Format: +63 9xx xxx xxxx">
                    <input ref={phoneRef} type="tel" style={inp} defaultValue={form.phoneNumber?formatPHPhone(form.phoneNumber).display:'+63 '} onChange={handlePhoneChange} onFocus={e=>{if(!e.target.value)e.target.value='+63 ';}} placeholder="+63 9xx xxx xxxx" maxLength={17}/>
                  </EditField>
                  <EditField label="Email Address">
                    <input style={lock} value={profile?.email||''} readOnly/>
                    <p style={{fontSize:11.5,color:'#94a3b8',marginTop:4}}>Cannot be changed</p>
                  </EditField>
                </div>
              </div>
              <div style={{borderTop:'1px solid #f1f5f9',paddingTop:20,marginBottom:24}}>
                <div style={{fontSize:11.5,fontWeight:700,color:'#10b981',letterSpacing:.8,marginBottom:16}}>🩺 PROFESSIONAL INFORMATION</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
                  <EditField label="Specialization">
                    <select style={{...inp,appearance:'none',cursor:'pointer'}} value={form.specialization} onChange={set('specialization')}>
                      <option value="">Select specialization</option>
                      {SPECS.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </EditField>
                  <EditField label="MD License No.">
                    <input style={lock} value={profile?.licenseNumber||''} readOnly/>
                    <p style={{fontSize:11.5,color:'#94a3b8',marginTop:4}}>Cannot be changed</p>
                  </EditField>
                </div>
                <div style={{marginBottom:14}}>
                  <EditField label="Years of Experience" hint="Optional — numbers only">
                    <input type="number" min="0" max="70" style={inp} value={form.yearsOfExperience} onChange={set('yearsOfExperience')} placeholder="e.g. 5"/>
                  </EditField>
                </div>
                <EditField label="Short Bio / Description" hint="Optional">
                  <textarea style={{...inp,resize:'vertical',minHeight:88}} rows={3} value={form.bio} onChange={set('bio')} placeholder="e.g. Board-certified cardiologist…"/>
                </EditField>
              </div>
              <div style={{borderTop:'1px solid #f1f5f9',paddingTop:20}}>
                <div style={{fontSize:11.5,fontWeight:700,color:'#10b981',letterSpacing:.8,marginBottom:4}}>🔒 CHANGE PASSWORD</div>
                <p style={{fontSize:12.5,color:'#94a3b8',marginBottom:16}}>Leave blank if you don't want to change your password.</p>
                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  {[{label:'Current Password',key:'currentPassword',vis:'cur'},{label:'New Password',key:'newPassword',vis:'new',hint:'Minimum 8 characters'},{label:'Confirm New Password',key:'confirmPassword',vis:'con'}].map(({label,key,vis,hint})=>(
                    <EditField key={key} label={label} hint={hint}>
                      <div style={{position:'relative'}}>
                        <input type={showPw[vis]?'text':'password'} style={{...inp,paddingRight:42}} value={form[key]} onChange={set(key)} placeholder={label}/>
                        <button type="button" onClick={()=>setShowPw(p=>({...p,[vis]:!p[vis]}))} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94a3b8',display:'flex',alignItems:'center'}}>
                          {showPw[vis]?<EyeOnIcon/>:<EyeOffIcon/>}
                        </button>
                      </div>
                    </EditField>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [tab,               setTab]               = useState('dashboard');
  const [appointments,      setAppointments]      = useState([]);
  const [secretaryRequests, setSecretaryRequests] = useState([]);
  const [loadingAction,     setLoadingAction]     = useState(false);
  const [toast,             setToast]             = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const fetchAppointments = useCallback(async () => {
    try { const data = await doctorApi.getAppointments(); setAppointments(Array.isArray(data)?data:[]); }
    catch { setAppointments([]); }
  }, []);

  const fetchSecretaryRequests = useCallback(async () => {
    try { const data = await doctorApi.getSecretaryRequests(); setSecretaryRequests(Array.isArray(data)?data:[]); }
    catch { setSecretaryRequests([]); }
  }, []);

  useEffect(() => { fetchAppointments(); fetchSecretaryRequests(); }, [fetchAppointments, fetchSecretaryRequests]);

  // ── NEW: complete handler ─────────────────────────────────────────────
  const handleComplete = async (id, doctorNotes) => {
    setLoadingAction(true);
    try {
      await doctorApi.completeAppointment(id, doctorNotes);
      showToast('Appointment marked as completed!');
      fetchAppointments();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoadingAction(false); }
  };

  // ── NEW: cancel handler ───────────────────────────────────────────────
  const handleCancel = async (id, cancelReason) => {
    setLoadingAction(true);
    try {
      await doctorApi.cancelAppointment(id, cancelReason);
      showToast('Appointment cancelled.');
      fetchAppointments();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoadingAction(false); }
  };

  const handleApproveSecretary = async (secretaryId) => {
    setLoadingAction(true);
    try { await doctorApi.approveSecretary(secretaryId); showToast('Secretary approved and assigned!'); fetchSecretaryRequests(); }
    catch (e) { showToast(e.message, 'error'); }
    finally { setLoadingAction(false); }
  };

  const handleRejectSecretary = async (secretaryId) => {
    setLoadingAction(true);
    try { await doctorApi.rejectSecretary(secretaryId); showToast('Secretary request rejected.'); fetchSecretaryRequests(); }
    catch (e) { showToast(e.message, 'error'); }
    finally { setLoadingAction(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const pendingSecCount = secretaryRequests.filter(r => r.status === 'PENDING').length;

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#f0fdf4 0%,#f8faff 100%)',fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <Navbar user={user} onLogout={handleLogout}/>
      <TabBar active={tab} onChange={setTab} pendingCount={pendingSecCount}/>

      {toast&&(
        <div style={{position:'fixed',top:80,right:24,zIndex:999,background:toast.type==='error'?'#fee2e2':'#dcfce7',border:`1px solid ${toast.type==='error'?'#fca5a5':'#86efac'}`,color:toast.type==='error'?'#991b1b':'#166534',padding:'12px 20px',borderRadius:12,fontWeight:600,fontSize:14,boxShadow:'0 4px 16px rgba(0,0,0,0.1)'}}>
          {toast.msg}
        </div>
      )}

      {tab==='dashboard'&&<DashboardTab appointments={appointments} secretaryRequests={secretaryRequests} onGoTo={setTab} user={user}/>}
      {tab==='appointments'&&<AppointmentsTab appointments={appointments} onComplete={handleComplete} onCancel={handleCancel} loading={loadingAction}/>}
      {tab==='secretary'&&<SecretaryRequestsTab requests={secretaryRequests} onApprove={handleApproveSecretary} onReject={handleRejectSecretary} loading={loadingAction}/>}
      {tab==='profile'&&<ProfileTab onSaved={(msg)=>showToast(msg)}/>}
    </div>
  );
}
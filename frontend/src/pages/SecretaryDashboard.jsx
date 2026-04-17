import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { secretaryApi } from "../services/api";

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
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
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const DoctorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

// ── UPDATED: added CONFIRMED, COMPLETED, CANCELLED ────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    PENDING:   { bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
    CONFIRMED: { bg: "#dcfce7", color: "#166534", border: "#86efac" },
    COMPLETED: { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" },
    CANCELLED: { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" },
    REJECTED:  { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
  };
  const s = map[status] || map.PENDING;
  return (
    <span style={{background:s.bg,color:s.color,border:`1px solid ${s.border}`,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600}}>
      {status}
    </span>
  );
};

const Toast = ({ toast }) => toast ? (
  <div style={{position:"fixed",top:80,right:24,zIndex:999,background:toast.type==="error"?"#fee2e2":"#dcfce7",border:`1px solid ${toast.type==="error"?"#fca5a5":"#86efac"}`,color:toast.type==="error"?"#991b1b":"#166534",padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14,boxShadow:"0 4px 16px rgba(0,0,0,0.1)"}}>
    {toast.msg}
  </div>
) : null;

const Navbar = ({ profile, onLogout }) => (
  <nav style={{height:60,background:"#fff",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 32px",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#2563eb,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:15}}>M</div>
      <span style={{fontWeight:700,fontSize:17,color:"#1e293b"}}>Medi<span style={{color:"#2563eb"}}>Core</span></span>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#a855f7,#9333ea)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><UserIcon/></div>
        <span style={{fontSize:14,fontWeight:600,color:"#374151"}}>{profile?`${profile.firstName} ${profile.lastName}`:"Secretary"}</span>
      </div>
      <button onClick={onLogout} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,border:"1.5px solid #e2e8f0",background:"#fff",color:"#374151",fontSize:13,fontWeight:600,cursor:"pointer"}}>Logout</button>
    </div>
  </nav>
);

const TABS = [
  { key:"dashboard",    label:"Dashboard" },
  { key:"appointments", label:"All Appointments" },
  { key:"profile",      label:"Profile" },
];
const TabBar = ({ active, onChange }) => (
  <div style={{display:"flex",gap:4,background:"#f8fafc",borderBottom:"1px solid #e2e8f0",padding:"0 32px"}}>
    {TABS.map(t => (
      <button key={t.key} onClick={()=>onChange(t.key)} style={{padding:"14px 18px",border:"none",background:"none",borderBottom:active===t.key?"2px solid #a855f7":"2px solid transparent",color:active===t.key?"#a855f7":"#64748b",fontWeight:active===t.key?700:500,fontSize:14,cursor:"pointer"}}>
        {t.label}
      </button>
    ))}
  </div>
);

const AppointmentRow = ({ appt, onClick }) => (
  <div onClick={onClick} style={{display:"flex",alignItems:"center",padding:"16px 20px",borderBottom:"1px solid #f1f5f9",cursor:"pointer"}}
    onMouseEnter={e=>e.currentTarget.style.background="#faf5ff"}
    onMouseLeave={e=>e.currentTarget.style.background="transparent"}
  >
    <div style={{flex:1,display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#2563eb,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0}}><UserIcon/></div>
      <div>
        <div style={{fontSize:11,color:"#94a3b8",fontWeight:500}}>Patient</div>
        <div style={{fontSize:14,fontWeight:600,color:"#0f172a"}}>{appt.patient?.firstName} {appt.patient?.lastName}</div>
      </div>
    </div>
    <div style={{flex:1,display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#10b981,#059669)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0}}><DoctorIcon/></div>
      <div>
        <div style={{fontSize:11,color:"#94a3b8",fontWeight:500}}>Doctor</div>
        <div style={{fontSize:14,fontWeight:600,color:"#0f172a"}}>Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}</div>
      </div>
    </div>
    <div style={{flex:1,display:"flex",alignItems:"center",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:5,color:"#475569",fontSize:13}}><CalendarIcon/> {appt.requestedDate}</div>
      <div style={{display:"flex",alignItems:"center",gap:5,color:"#475569",fontSize:13}}><ClockIcon/> {appt.requestedTime}</div>
    </div>
    <StatusBadge status={appt.status}/>
  </div>
);

// ── UPDATED: confirm + reject + cancel buttons ────────────────────────────
const AppointmentDetail = ({ appt, onBack, onConfirm, onReject, onCancel, loading }) => {
  const [rejectReason, setRejectReason]  = useState('');
  const [cancelReason, setCancelReason]  = useState('');
  const [showReject,   setShowReject]    = useState(false);
  const [showCancel,   setShowCancel]    = useState(false);

  return (
    <div style={{maxWidth:680,margin:"32px auto",padding:"0 24px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#64748b",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:24}}>← Back to Appointments</button>

      <div style={{background:"#fff",borderRadius:16,boxShadow:"0 4px 24px rgba(0,0,0,0.07)",padding:28}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{fontSize:22,fontWeight:800,color:"#0f172a",margin:0}}>Appointment Details</h2>
          <StatusBadge status={appt.status}/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          <div style={{background:"#f8fafc",borderRadius:12,padding:16}}>
            <div style={{fontSize:12,color:"#94a3b8",fontWeight:600,marginBottom:8}}>Patient</div>
            <div style={{fontWeight:700,fontSize:15,color:"#0f172a"}}>{appt.patient?.firstName} {appt.patient?.lastName}</div>
            <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{appt.patient?.email}</div>
          </div>
          <div style={{background:"#f8fafc",borderRadius:12,padding:16}}>
            <div style={{fontSize:12,color:"#94a3b8",fontWeight:600,marginBottom:8}}>Doctor</div>
            <div style={{fontWeight:700,fontSize:15,color:"#0f172a"}}>Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}</div>
            <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{appt.doctor?.specialization}</div>
          </div>
          <div style={{background:"#f8fafc",borderRadius:12,padding:16}}>
            <div style={{fontSize:12,color:"#94a3b8",fontWeight:600,marginBottom:8}}>Date</div>
            <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>{appt.requestedDate}</div>
          </div>
          <div style={{background:"#f8fafc",borderRadius:12,padding:16}}>
            <div style={{fontSize:12,color:"#94a3b8",fontWeight:600,marginBottom:8}}>Time</div>
            <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>{appt.requestedTime}</div>
          </div>
        </div>

        {appt.reasonForVisit&&(
          <div style={{background:"#f8fafc",borderRadius:12,padding:16,marginBottom:16}}>
            <div style={{fontSize:12,color:"#94a3b8",fontWeight:600,marginBottom:8}}>Reason for Visit</div>
            <p style={{fontSize:14,color:"#374151",margin:0,lineHeight:1.6}}>{appt.reasonForVisit}</p>
          </div>
        )}

        {/* Cancel reason display */}
        {appt.status==='CANCELLED'&&appt.cancelReason&&(
          <div style={{background:"#f1f5f9",borderRadius:12,padding:16,marginBottom:16}}>
            <div style={{fontSize:12,color:"#94a3b8",fontWeight:600,marginBottom:8}}>Cancellation Reason</div>
            <p style={{fontSize:14,color:"#374151",margin:0}}>{appt.cancelReason}</p>
          </div>
        )}

        {/* Rejection reason display */}
        {appt.status==='REJECTED'&&appt.rejectedReason&&(
          <div style={{background:"#fef2f2",borderRadius:12,padding:16,marginBottom:16}}>
            <div style={{fontSize:12,color:"#94a3b8",fontWeight:600,marginBottom:8}}>Rejection Reason</div>
            <p style={{fontSize:14,color:"#374151",margin:0}}>{appt.rejectedReason}</p>
          </div>
        )}

        {/* Doctor notes display */}
        {appt.status==='COMPLETED'&&appt.doctorNotes&&(
          <div style={{background:"#eff6ff",borderRadius:12,padding:16,marginBottom:16}}>
            <div style={{fontSize:12,color:"#94a3b8",fontWeight:600,marginBottom:8}}>Doctor Notes</div>
            <p style={{fontSize:14,color:"#374151",margin:0}}>{appt.doctorNotes}</p>
          </div>
        )}

        {/* ── PENDING actions: Confirm + Reject ─────────────────────── */}
        {appt.status==="PENDING"&&!showReject&&!showCancel&&(
          <div style={{display:"flex",gap:12}}>
            <button onClick={()=>onConfirm(appt.id)} disabled={loading} style={{flex:1,padding:"12px 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#10b981,#059669)",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:loading?0.6:1}}>
              <CheckIcon/> Confirm
            </button>
            <button onClick={()=>setShowReject(true)} disabled={loading} style={{flex:1,padding:"12px 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#ef4444,#dc2626)",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:loading?0.6:1}}>
              <XIcon/> Reject
            </button>
          </div>
        )}

        {/* Reject reason form */}
        {showReject&&(
          <div>
            <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:6}}>
              Reason for Rejection <span style={{color:"#94a3b8",fontWeight:400}}>(optional)</span>
            </label>
            <textarea rows={3} value={rejectReason} onChange={e=>setRejectReason(e.target.value)} placeholder="e.g. Slot unavailable, doctor on leave…" style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:14,resize:"vertical",boxSizing:"border-box",fontFamily:"inherit",outline:"none"}}/>
            <div style={{display:"flex",gap:10,marginTop:12}}>
              <button onClick={()=>setShowReject(false)} style={{flex:1,padding:"11px",borderRadius:10,border:"1.5px solid #e2e8f0",background:"#fff",color:"#374151",fontWeight:600,fontSize:14,cursor:"pointer"}}>Back</button>
              <button onClick={()=>onReject(appt.id, rejectReason||null)} disabled={loading} style={{flex:1,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#ef4444,#dc2626)",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",opacity:loading?0.6:1}}>
                ✗ Confirm Rejection
              </button>
            </div>
          </div>
        )}

        {/* ── CONFIRMED actions: Cancel ──────────────────────────────── */}
        {appt.status==="CONFIRMED"&&!showCancel&&(
          <button onClick={()=>setShowCancel(true)} disabled={loading} style={{width:"100%",padding:"12px 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:loading?0.6:1}}>
            <XIcon/> Cancel Appointment
          </button>
        )}

        {/* Cancel reason form */}
        {showCancel&&(
          <div>
            <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:6}}>
              Reason for Cancellation <span style={{color:"#94a3b8",fontWeight:400}}>(optional)</span>
            </label>
            <select value={cancelReason} onChange={e=>setCancelReason(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:14,boxSizing:"border-box",fontFamily:"inherit",outline:"none",cursor:"pointer",marginBottom:12}}>
              <option value="">Select a reason…</option>
              <option value="Doctor unavailable">Doctor unavailable</option>
              <option value="No-show">Patient no-show</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Other">Other</option>
            </select>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setShowCancel(false)} style={{flex:1,padding:"11px",borderRadius:10,border:"1.5px solid #e2e8f0",background:"#fff",color:"#374151",fontWeight:600,fontSize:14,cursor:"pointer"}}>Back</button>
              <button onClick={()=>onCancel(appt.id, cancelReason||null)} disabled={loading} style={{flex:1,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",opacity:loading?0.6:1}}>
                ✗ Confirm Cancellation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── UPDATED DashboardTab: CONFIRMED instead of APPROVED ──────────────────
const DashboardTab = ({ appointments, profile, onViewAll, onSelectAppt }) => {
  const pending   = appointments.filter(a => a.status==="PENDING");
  const confirmed = appointments.filter(a => a.status==="CONFIRMED").length;
  const completed = appointments.filter(a => a.status==="COMPLETED").length;
  const cancelled = appointments.filter(a => a.status==="CANCELLED").length;
  const doc = profile?.assignedDoctor;

  return (
    <div style={{padding:"32px",maxWidth:1000,margin:"0 auto"}}>
      <h1 style={{fontSize:28,fontWeight:800,color:"#0f172a",marginBottom:4}}>Welcome, {profile?.firstName}</h1>
      <p style={{color:"#64748b",fontSize:14,marginBottom:28}}>Manage appointments for your assigned doctor</p>

      {doc&&(
        <div style={{background:"#fff",borderRadius:16,padding:20,marginBottom:28,border:"1.5px solid #e0e7ff",boxShadow:"0 2px 8px rgba(99,102,241,.08)",display:"flex",alignItems:"center",gap:16}}>
          <div style={{width:56,height:56,borderRadius:"50%",flexShrink:0,background:"linear-gradient(135deg,#10b981,#059669)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",overflow:"hidden"}}>
            {doc.profilePicture?<img src={doc.profilePicture} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<DoctorIcon/>}
          </div>
          <div>
            <div style={{fontSize:11,color:"#94a3b8",fontWeight:600,marginBottom:2}}>YOUR ASSIGNED DOCTOR</div>
            <div style={{fontWeight:800,fontSize:17,color:"#0f172a"}}>Dr. {doc.firstName} {doc.lastName}</div>
            <div style={{fontSize:13,color:"#10b981",fontWeight:600}}>{doc.specialization}</div>
          </div>
        </div>
      )}

      {/* Stats — updated to include COMPLETED and CANCELLED */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:32}}>
        {[
          { label:"Pending",   value:pending.length, color:"#854d0e", bg:"#fef9c3", border:"#fde047" },
          { label:"Confirmed", value:confirmed,       color:"#166534", bg:"#dcfce7", border:"#86efac" },
          { label:"Completed", value:completed,       color:"#1e40af", bg:"#dbeafe", border:"#93c5fd" },
          { label:"Cancelled", value:cancelled,       color:"#475569", bg:"#f1f5f9", border:"#cbd5e1" },
        ].map(s=>(
          <div key={s.label} style={{background:"#fff",borderRadius:16,padding:20,border:`1.5px solid ${s.border}`}}>
            <div style={{fontSize:32,fontWeight:800,color:"#0f172a"}}>{s.value}</div>
            <div style={{fontSize:13,color:"#64748b",fontWeight:500}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:0}}>Pending Appointments ({pending.length})</h2>
        <button onClick={onViewAll} style={{padding:"8px 18px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#a855f7,#9333ea)",color:"#fff",fontWeight:600,fontSize:13,cursor:"pointer"}}>View All →</button>
      </div>

      <div style={{background:"#fff",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        {pending.length===0?(
          <div style={{padding:40,textAlign:"center",color:"#94a3b8",fontSize:14}}>No pending appointments</div>
        ):(
          pending.slice(0,5).map(a=><AppointmentRow key={a.id} appt={a} onClick={()=>onSelectAppt(a)}/>)
        )}
      </div>
    </div>
  );
};

// ── UPDATED AllAppointmentsTab: filter includes all statuses ──────────────
const AllAppointmentsTab = ({ appointments, onSelect }) => {
  const [filter, setFilter] = useState("ALL");
  const filtered = filter==="ALL" ? appointments : appointments.filter(a=>a.status===filter);

  return (
    <div style={{padding:"32px",maxWidth:1000,margin:"0 auto"}}>
      <h2 style={{fontSize:22,fontWeight:800,color:"#0f172a",marginBottom:4}}>All Appointments</h2>
      <p style={{color:"#64748b",fontSize:13,marginBottom:20}}>{appointments.length} total appointment{appointments.length!==1?"s":""}</p>

      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {["ALL","PENDING","CONFIRMED","COMPLETED","CANCELLED","REJECTED"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${filter===f?"#a855f7":"#e2e8f0"}`,background:filter===f?"#faf5ff":"#fff",color:filter===f?"#a855f7":"#64748b",fontWeight:filter===f?700:500,fontSize:13,cursor:"pointer"}}>
            {f}
          </button>
        ))}
      </div>

      <div style={{background:"#fff",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        {filtered.length===0?(
          <div style={{padding:40,textAlign:"center",color:"#94a3b8",fontSize:14}}>No {filter!=="ALL"?filter.toLowerCase():""} appointments</div>
        ):(
          filtered.map(a=><AppointmentRow key={a.id} appt={a} onClick={()=>onSelect(a)}/>)
        )}
      </div>
    </div>
  );
};

const ProfileTab = ({ profile, onSaved, showToast }) => {
  const [form, setForm]       = useState({ firstName:"", lastName:"", phoneNumber:"" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) setForm({ firstName:profile.firstName||"", lastName:profile.lastName||"", phoneNumber:profile.phoneNumber||"" });
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    try { await secretaryApi.updateProfile(form); showToast("Profile updated successfully!"); onSaved(); }
    catch (e) { showToast(e.message,"error"); }
    finally { setLoading(false); }
  };

  const doc = profile?.assignedDoctor;
  const fieldStyle = { width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:14,color:"#0f172a",background:"#fff",boxSizing:"border-box" };
  const lockedStyle = { ...fieldStyle,background:"#f8fafc",color:"#94a3b8",cursor:"not-allowed" };
  const labelStyle  = { fontSize:13,fontWeight:600,color:"#374151",marginBottom:6,display:"block" };

  return (
    <div style={{padding:"32px",maxWidth:680,margin:"0 auto"}}>
      <h2 style={{fontSize:22,fontWeight:800,color:"#0f172a",marginBottom:4}}>Profile</h2>
      <p style={{color:"#64748b",fontSize:13,marginBottom:24}}>Your account details and assigned doctor</p>
      {doc&&(
        <div style={{background:"#fff",borderRadius:16,padding:20,marginBottom:24,border:"1.5px solid #e0e7ff",display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#10b981,#059669)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",overflow:"hidden",flexShrink:0}}>
            {doc.profilePicture?<img src={doc.profilePicture} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<DoctorIcon/>}
          </div>
          <div>
            <div style={{fontSize:11,color:"#94a3b8",fontWeight:600}}>ASSIGNED DOCTOR</div>
            <div style={{fontWeight:700,fontSize:16,color:"#0f172a"}}>Dr. {doc.firstName} {doc.lastName}</div>
            <div style={{fontSize:13,color:"#10b981",fontWeight:600}}>{doc.specialization}</div>
          </div>
        </div>
      )}
      <div style={{background:"#fff",borderRadius:16,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <h3 style={{fontSize:16,fontWeight:700,color:"#0f172a",marginBottom:20,marginTop:0}}>Personal Information</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          <div>
            <label style={labelStyle}>First Name</label>
            <input value={form.firstName} onChange={e=>setForm(p=>({...p,firstName:e.target.value}))} style={fieldStyle}/>
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input value={form.lastName} onChange={e=>setForm(p=>({...p,lastName:e.target.value}))} style={fieldStyle}/>
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <label style={labelStyle}>Email (cannot be changed)</label>
          <input value={profile?.email||""} readOnly style={lockedStyle}/>
        </div>
        <div style={{marginBottom:16}}>
          <label style={labelStyle}>Phone Number</label>
          <input value={form.phoneNumber} onChange={e=>setForm(p=>({...p,phoneNumber:e.target.value}))} placeholder="+63 900 000 0000" style={fieldStyle}/>
        </div>
        <div style={{marginBottom:24}}>
          <label style={labelStyle}>Account Status</label>
          <div style={{marginTop:4}}><StatusBadge status={profile?.status||"PENDING"}/></div>
        </div>
        <button onClick={handleSave} disabled={loading} style={{padding:"11px 28px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#a855f7,#9333ea)",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",opacity:loading?0.6:1}}>
          {loading?"Saving…":"Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default function SecretaryDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [tab,           setTab]           = useState("dashboard");
  const [appointments,  setAppointments]  = useState([]);
  const [profile,       setProfile]       = useState(null);
  const [selectedAppt,  setSelectedAppt]  = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [toast,         setToast]         = useState(null);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const fetchAppointments = useCallback(async () => {
    try { const data = await secretaryApi.getAppointments(); setAppointments(Array.isArray(data)?data:[]); }
    catch (e) { showToast(e.message,"error"); setAppointments([]); }
  }, []);

  const fetchProfile = useCallback(async () => {
    try { const data = await secretaryApi.getProfile(); setProfile(data); }
    catch { setProfile(null); }
  }, []);

  useEffect(() => { fetchProfile(); fetchAppointments(); }, [fetchProfile, fetchAppointments]);

  // ── RENAMED: approve → confirm ────────────────────────────────────────
  const handleConfirm = async (id) => {
    setLoadingAction(true);
    try { await secretaryApi.confirmAppointment(id); showToast("Appointment confirmed!"); setSelectedAppt(null); fetchAppointments(); }
    catch (e) { showToast(e.message,"error"); }
    finally { setLoadingAction(false); }
  };

  const handleReject = async (id, rejectedReason) => {
    setLoadingAction(true);
    try { await secretaryApi.rejectAppointment(id, rejectedReason); showToast("Appointment rejected."); setSelectedAppt(null); fetchAppointments(); }
    catch (e) { showToast(e.message,"error"); }
    finally { setLoadingAction(false); }
  };

  // ── NEW: cancel handler ───────────────────────────────────────────────
  const handleCancel = async (id, cancelReason) => {
    setLoadingAction(true);
    try { await secretaryApi.cancelAppointment(id, cancelReason); showToast("Appointment cancelled."); setSelectedAppt(null); fetchAppointments(); }
    catch (e) { showToast(e.message,"error"); }
    finally { setLoadingAction(false); }
  };

  return (
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      <Navbar profile={profile} onLogout={()=>{logout();navigate("/login");}}/>
      <TabBar active={tab} onChange={t=>{setTab(t);setSelectedAppt(null);}}/>
      <Toast toast={toast}/>

      {selectedAppt ? (
        <AppointmentDetail
          appt={selectedAppt}
          onBack={()=>setSelectedAppt(null)}
          onConfirm={handleConfirm}
          onReject={handleReject}
          onCancel={handleCancel}
          loading={loadingAction}
        />
      ) : (
        <>
          {tab==="dashboard"&&<DashboardTab appointments={appointments} profile={profile} onViewAll={()=>setTab("appointments")} onSelectAppt={setSelectedAppt}/>}
          {tab==="appointments"&&<AllAppointmentsTab appointments={appointments} onSelect={setSelectedAppt}/>}
          {tab==="profile"&&<ProfileTab profile={profile} onSaved={fetchProfile} showToast={showToast}/>}
        </>
      )}
    </div>
  );
}
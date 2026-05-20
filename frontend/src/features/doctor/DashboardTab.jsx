import { C, getInitials, apptPatFn, apptPatLn, apptDate, apptTime, apptReason, secFn, secLn, secEmail } from './doctorConstants';
import { AvatarImg, StatusBadge, StatApptIcon, StatCheckIcon, StatClockIcon, StatUserIcon, DateIcon, TimeIcon } from './DoctorUI';
import { bookedOn, bookedAgo } from '../shared/appointmentTimingHelpers';

// ── Booked Info ────────────────────────────────────────────────────────────
const BookedInfo = ({ createdAt }) => {
  if (!createdAt) return null;
  return (
    <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#94a3b8",marginTop:5}}>
      🕐 {bookedOn(createdAt)} · {bookedAgo(createdAt)}
    </div>
  );
};

const DashboardTab = ({ user, appointments, secretaryRequests, onGoTo }) => {
  const fn = user?.firstname || user?.firstName || "there";
  const ln = user?.lastname  || user?.lastName  || "";

  const todayStr    = new Date().toISOString().split('T')[0];
  const todayAppts  = appointments.filter(a => apptDate(a) === todayStr).length;
  const assignedSec = secretaryRequests.find(r => r.status === 'APPROVED');
  const pendingSec  = secretaryRequests.filter(r => r.status === 'PENDING').length;

  const statCards = [
    { label:"Today's Appointments", val:todayAppts,                                            grad:`linear-gradient(135deg,${C.green},${C.greenDk})`,  icon:<StatApptIcon/>  },
    { label:"Total Appointments",   val:appointments.length,                                   grad:`linear-gradient(135deg,${C.teal},#0e7490)`,        icon:<StatClockIcon/> },
    { label:"Completed",            val:appointments.filter(a=>a.status==='COMPLETED').length, grad:`linear-gradient(135deg,${C.blue},#1d4ed8)`,        icon:<StatCheckIcon/> },
    { label:"Confirmed",            val:appointments.filter(a=>a.status==='CONFIRMED').length, grad:`linear-gradient(135deg,${C.purple},#6d28d9)`,      icon:<StatUserIcon/>  },
  ];

  const recent = appointments.slice(0, 4);

  return (
    <div className="pw" style={{padding:"0 32px 56px",maxWidth:1120,margin:"0 auto"}}>
      <div className="au1" style={{padding:"36px 0 26px"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:20}}>
          <div>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:"clamp(1.6rem,4vw,2.2rem)",fontWeight:900,color:C.slate,lineHeight:1.15,marginBottom:8}}>
              Welcome, <span className="shimmer-text">Dr. {fn} {ln}!</span>
            </h1>
            <p style={{fontSize:15,color:C.slateL,fontWeight:500,maxWidth:480}}>Here's an overview of your appointments and secretary requests.</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="four-col au2" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
        {statCards.map((s,i) => (
          <div key={i} className="stat-card" style={{animationDelay:`${i*.06}s`}}>
            <div style={{width:44,height:44,borderRadius:13,background:s.grad,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,boxShadow:"0 3px 12px rgba(0,0,0,.12)"}}>
              {s.icon}
            </div>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:32,fontWeight:900,color:C.slate,lineHeight:1,marginBottom:6}}>{s.val}</div>
            <div style={{fontSize:12.5,color:C.slateL,fontWeight:600}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Secretary Card */}
      <div className="au3 glass" style={{padding:"20px 24px",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:900,color:C.slate}}>My Secretary</h2>
            <p style={{fontSize:12.5,color:C.slateL,marginTop:2}}>Secretary assigned to manage your appointments</p>
          </div>
          {pendingSec > 0 && (
            <button onClick={()=>onGoTo("secretary")} style={{fontSize:12,color:C.amber,background:C.amberLt,border:`1px solid ${C.amberBdr}`,padding:"5px 14px",borderRadius:100,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              {pendingSec} pending request{pendingSec>1?"s":""} →
            </button>
          )}
        </div>
        {assignedSec ? (
          <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:14,background:C.greenLt,border:`1px solid ${C.greenBdr}`}}>
            <div style={{width:46,height:46,borderRadius:"50%",background:`linear-gradient(135deg,${C.green},${C.greenDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,flexShrink:0,overflow:"hidden"}}>
              <AvatarImg src={assignedSec.profilePicture} alt=""/>
              {!assignedSec.profilePicture && (getInitials(secFn(assignedSec),secLn(assignedSec))||"S")}
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:C.slate}}>{secFn(assignedSec)} {secLn(assignedSec)}</div>
              <div style={{fontSize:12.5,color:C.slateL,marginTop:2}}>{secEmail(assignedSec)}</div>
            </div>
            <span style={{background:C.greenLt,color:C.green,border:`1px solid ${C.greenBdr}`,borderRadius:100,padding:"4px 12px",fontSize:12,fontWeight:700}}>● Assigned</span>
          </div>
        ) : (
          <div style={{padding:"20px",textAlign:"center",color:C.slateXL,fontSize:13.5}}>
            <div style={{fontSize:32,marginBottom:8}}>👤</div>
            No secretary assigned yet. Secretaries can request to be assigned during registration.
          </div>
        )}
      </div>

      {/* Recent Appointments */}
      <div className="au4">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:17,fontWeight:900,color:C.slate}}>Recent Appointments</h2>
            <p style={{fontSize:12.5,color:C.slateL,marginTop:2}}>Your latest patient appointments</p>
          </div>
          <button onClick={()=>onGoTo("appointments")} style={{fontSize:12,color:C.green,background:C.greenLt,border:`1px solid ${C.greenBdr}`,padding:"5px 14px",borderRadius:100,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>View all →</button>
        </div>
        {recent.length === 0 ? (
          <div className="glass" style={{padding:40,textAlign:"center",color:C.slateXL,fontSize:14}}>
            <div style={{fontSize:36,marginBottom:10}}>📭</div>No appointments yet.
          </div>
        ) : (
          <div className="two-col" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
            {recent.map(a => (
              <div key={a.id} className="appt-card" style={{padding:"18px 20px"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:13,marginBottom:12}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${C.green},${C.greenDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,flexShrink:0,overflow:"hidden"}}>
                    <AvatarImg src={a?.patient?.profilePicture} alt=""/>
                    {!a?.patient?.profilePicture && (getInitials(apptPatFn(a),apptPatLn(a))||"P")}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:C.slate}}>{apptPatFn(a)} {apptPatLn(a)}</div>
                    <div style={{fontSize:12.5,color:C.slateL,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{apptReason(a)||"—"}</div>
                  </div>
                  <StatusBadge status={a.status}/>
                </div>
                <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                  <span style={{fontSize:13,color:C.slateM,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
                    <DateIcon/>{apptDate(a)?new Date(apptDate(a)).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"}):"—"}
                  </span>
                  <span style={{fontSize:13,color:C.slateM,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
                    <TimeIcon/>{apptTime(a)||"—"}
                  </span>
                </div>
                {/* ✅ Booked on indicator */}
                <BookedInfo createdAt={a.createdAt}/>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTab;
import { useState } from 'react';
import { C, docColor, apptDate, apptTime, apptReason, apptStatus, apptDoctorFn, apptDoctorLn, apptDoctorSpec, apptDoctorPic } from './patientConstants';
import { DoctorAvatar, Spinner, ErrBanner, StatusBadge, DateIcon, TimeIcon, NoteIcon, PlusIcon } from './PatientUI';
import AppointmentDetailModal from './AppointmentDetailModal';
import { bookedOn, bookedAgo, expiryLabel, pendingUrgency, urgencyStyle } from '../shared/appointmentTimingHelpers';

// ── Booked Info ────────────────────────────────────────────────────────────
const BookedInfo = ({ createdAt }) => {
  if (!createdAt) return null;
  return (
    <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11.5,color:"#94a3b8",marginTop:4}}>
      🕐 {bookedOn(createdAt)} · {bookedAgo(createdAt)}
    </div>
  );
};

// ── Urgency Badge ──────────────────────────────────────────────────────────
const UrgencyBadge = ({ requestedDate }) => {
  const level = pendingUrgency(requestedDate);
  const label = expiryLabel(requestedDate);
  const s     = urgencyStyle(level);
  if (level === "ok" || !label) return null;
  return (
    <div style={{display:"inline-flex",alignItems:"center",gap:5,background:s.bg,border:`1px solid ${s.border}`,borderRadius:8,padding:"4px 10px",fontSize:11.5,fontWeight:700,color:s.color,marginTop:4}}>
      {label}
    </div>
  );
};

const AppointmentsTab = ({ appts, loading, error, onBook, onRetry }) => {
  const [filter,     setFilter]     = useState("ALL");
  const [detailAppt, setDetailAppt] = useState(null);

  const list = filter==="ALL" ? appts : appts.filter(a => apptStatus(a)===filter);

  return (
    <div className="pw" style={{padding:"24px 32px 56px",maxWidth:1120,margin:"0 auto"}}>

      {detailAppt && (
        <AppointmentDetailModal appt={detailAppt} onClose={()=>setDetailAppt(null)}/>
      )}

      <div className="au2" style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
        {["ALL","PENDING","CONFIRMED","COMPLETED","CANCELLED","REJECTED","EXPIRED"].map(f => (
          <button key={f} className="filter-pill" onClick={()=>setFilter(f)}
            style={{borderColor:filter===f?C.blue:"rgba(226,232,240,.8)",background:filter===f?C.blueLt:"rgba(255,255,255,.72)",color:filter===f?C.blue:C.slateL}}>
            {f}
          </button>
        ))}
        <button className="btn-primary" onClick={()=>onBook(null)} style={{marginLeft:"auto",padding:"8px 18px",fontSize:13}}>
          <PlusIcon/> Book New
        </button>
      </div>

      {error && <ErrBanner msg={error} onRetry={onRetry}/>}

      {loading ? (
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:60,gap:10,color:C.slateL,fontSize:14,fontWeight:600}}>
          <Spinner/> Loading appointments…
        </div>
      ) : list.length===0 ? (
        <div className="glass" style={{padding:56,textAlign:"center",color:C.slateXL,fontSize:14}}>
          <div style={{fontSize:36,marginBottom:10}}>📭</div>
          No {filter==="ALL"?"":filter.toLowerCase()} appointments found.
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {list.map((a,i) => {
            const color = docColor(a.doctor?.doctorId??a.doctor?.id??0);
            const st    = apptStatus(a);
            const accentColor = {
              CONFIRMED: C.green,
              COMPLETED: C.blue,
              CANCELLED: "#94a3b8",
              REJECTED:  C.red,
              PENDING:   C.amber,
              EXPIRED:   "#92400e",
            }[st] || C.slateXL;

            return (
              <div key={a.id} className="appt-card au3"
                onClick={()=>setDetailAppt(a)}
                style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",animationDelay:`${i*.05}s`,cursor:"pointer",borderLeft:`4px solid ${accentColor}`,borderRadius:"0 18px 18px 0"}}>

                <DoctorAvatar firstname={apptDoctorFn(a)} lastname={apptDoctorLn(a)} color={color} size={48} profilePicture={apptDoctorPic(a)}/>

                <div style={{flex:1,minWidth:180}}>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:C.slate}}>
                    Dr. {apptDoctorFn(a)} {apptDoctorLn(a)}
                  </div>
                  <div style={{fontSize:12.5,color:C.slateL,marginTop:1}}>{apptDoctorSpec(a)}</div>
                  <div style={{display:"flex",gap:14,marginTop:5,flexWrap:"wrap"}}>
                    <span style={{fontSize:12,color:C.slateM,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
                      <DateIcon/>{apptDate(a)?new Date(apptDate(a)).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"}):"—"}
                    </span>
                    <span style={{fontSize:12,color:C.slateM,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
                      <TimeIcon/>{apptTime(a)||"—"}
                    </span>
                  </div>

                  {/* ✅ Booked date/time indicator */}
                  <BookedInfo createdAt={a.createdAt}/>

                  {/* ✅ Urgency warning for pending appointments */}
                  {st==="PENDING" && <UrgencyBadge requestedDate={apptDate(a)}/>}

                  {apptReason(a) && (
                    <div style={{fontSize:11.5,color:C.slateXL,marginTop:4,display:"flex",gap:4,alignItems:"flex-start"}}>
                      <NoteIcon/>
                      <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:320}}>{apptReason(a)}</span>
                    </div>
                  )}
                </div>

                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                  <StatusBadge status={a.status}/>
                  {st==="PENDING"   && <span style={{fontSize:11,color:C.amber,fontWeight:600}}>⏳ Awaiting confirmation</span>}
                  {st==="CONFIRMED" && <span style={{fontSize:11,color:C.green,fontWeight:600}}>✓ Confirmed</span>}
                  {st==="COMPLETED" && <span style={{fontSize:11,color:C.blue,fontWeight:600}}>📋 {a.doctorNotes?"Has notes":"View summary"}</span>}
                  {st==="CANCELLED" && <span style={{fontSize:11,color:"#64748b",fontWeight:600}}>✕ {a.cancelReason?"Has reason":"Cancelled"}</span>}
                  {st==="REJECTED"  && <span style={{fontSize:11,color:C.red,fontWeight:600}}>✕ Not approved</span>}
                  {st==="EXPIRED"   && <span style={{fontSize:11,color:"#92400e",fontWeight:600}}>⏰ Auto-expired</span>}
                  <span style={{fontSize:10.5,color:C.slateXL,fontWeight:500}}>Tap to view details →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppointmentsTab;
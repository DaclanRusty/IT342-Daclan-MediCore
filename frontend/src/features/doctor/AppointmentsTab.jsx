import { useState } from 'react';
import { C, getInitials, apptPatFn, apptPatLn, apptDate, apptTime, apptReason } from './doctorConstants';
import { AvatarImg, StatusBadge, Spinner, CheckIcon, XIcon, DateIcon, TimeIcon } from './DoctorUI';
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

const AppointmentsTab = ({ appointments, onComplete, onCancel, loading }) => {
  const [filter,        setFilter]        = useState("ALL");
  const [cancelModal,   setCancelModal]   = useState(null);
  const [cancelReason,  setCancelReason]  = useState("");
  const [completeModal, setCompleteModal] = useState(null);
  const [doctorNotes,   setDoctorNotes]   = useState("");

  const filtered = filter === "ALL" ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div className="pw" style={{padding:"24px 32px 56px",maxWidth:1120,margin:"0 auto"}}>
      <div className="au1" style={{marginBottom:20}}>
        <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:900,color:C.slate,marginBottom:4}}>Appointments</h2>
        <p style={{fontSize:13,color:C.slateL}}>Manage your patient appointments ({appointments.length} total)</p>
      </div>

      <div className="au2" style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
        {["ALL","CONFIRMED","COMPLETED","CANCELLED"].map(f => (
          <button key={f} className="filter-pill" onClick={()=>setFilter(f)} style={{borderColor:filter===f?C.green:"rgba(226,232,240,.8)",background:filter===f?C.greenLt:"rgba(255,255,255,.72)",color:filter===f?C.green:C.slateL}}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass au3" style={{padding:56,textAlign:"center",color:C.slateXL,fontSize:14}}>
          <div style={{fontSize:36,marginBottom:10}}>📭</div>
          No {filter==="ALL"?"":filter.toLowerCase()} appointments found.
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {filtered.map((a,i) => (
            <div key={a.id} className="appt-card au3" style={{padding:"18px 22px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",animationDelay:`${i*.05}s`}}>
              <div style={{width:48,height:48,borderRadius:"50%",background:`linear-gradient(135deg,${C.green},${C.greenDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,flexShrink:0,overflow:"hidden"}}>
                <AvatarImg src={a?.patient?.profilePicture} alt=""/>
                {!a?.patient?.profilePicture && (getInitials(apptPatFn(a),apptPatLn(a))||"P")}
              </div>
              <div style={{flex:1,minWidth:180}}>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15.5,color:C.slate}}>{apptPatFn(a)} {apptPatLn(a)}</div>
                <div style={{display:"flex",gap:16,marginTop:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:12.5,color:C.slateM,fontWeight:600,display:"flex",alignItems:"center",gap:5}}><DateIcon/>{apptDate(a)?new Date(apptDate(a)).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"}):"—"}</span>
                  <span style={{fontSize:12.5,color:C.slateM,fontWeight:600,display:"flex",alignItems:"center",gap:5}}><TimeIcon/>{apptTime(a)||"—"}</span>
                </div>

                {/* ✅ Booked on indicator */}
                <BookedInfo createdAt={a.createdAt}/>

                {apptReason(a) && <div style={{fontSize:12,color:C.slateXL,marginTop:4}}>{apptReason(a)}</div>}
                {a.status==="COMPLETED" && a.doctorNotes && (
                  <div style={{marginTop:6,fontSize:12,color:C.blue,background:C.blueLt,border:`1px solid ${C.blueBdr}`,borderRadius:8,padding:"4px 10px",display:"inline-block"}}>📝 {a.doctorNotes}</div>
                )}
                {a.status==="CANCELLED" && a.cancelReason && (
                  <div style={{marginTop:6,fontSize:12,color:C.slateL,background:"#f1f5f9",border:"1px solid #cbd5e1",borderRadius:8,padding:"4px 10px",display:"inline-block"}}>✗ {a.cancelReason}</div>
                )}
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
                <StatusBadge status={a.status}/>
                {a.status==="CONFIRMED" && (
                  <div style={{display:"flex",gap:6}}>
                    <button className="btn-primary" onClick={()=>{setCompleteModal(a);setDoctorNotes("");}} disabled={loading} style={{padding:"7px 14px",fontSize:12,gap:5}}>
                      <CheckIcon/> Complete
                    </button>
                    <button className="btn-danger" onClick={()=>{setCancelModal(a);setCancelReason("");}} disabled={loading} style={{padding:"7px 14px",fontSize:12,gap:5}}>
                      <XIcon/> Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complete Modal */}
      {completeModal && (
        <div className="modal-bg" style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(15,23,42,.48)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:16}}>
          <div className="modal-box" style={{background:"#fff",borderRadius:24,padding:32,maxWidth:480,width:"100%",boxShadow:"0 32px 80px rgba(0,0,0,.22)"}}>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:900,color:C.slate,marginBottom:6}}>Mark as Completed</h2>
            <p style={{fontSize:13,color:C.slateL,marginBottom:20}}>Patient: <strong>{apptPatFn(completeModal)} {apptPatLn(completeModal)}</strong></p>
            <label style={{fontSize:13,fontWeight:700,color:C.slateM,display:"block",marginBottom:6}}>Doctor Notes <span style={{color:C.slateXL,fontWeight:400}}>(optional)</span></label>
            <textarea className="input-field" rows={3} value={doctorNotes} onChange={e=>setDoctorNotes(e.target.value)} placeholder="e.g. Prescribed medication, follow-up in 2 weeks…"/>
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button className="btn-ghost" onClick={()=>setCompleteModal(null)} style={{flex:1,justifyContent:"center",padding:"11px"}}>Cancel</button>
              <button className="btn-primary" onClick={()=>{onComplete(completeModal.id,doctorNotes||null);setCompleteModal(null);}} disabled={loading} style={{flex:1,justifyContent:"center"}}>
                {loading?<Spinner size={16} color="#fff"/>:<><CheckIcon/> Confirm Completed</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="modal-bg" style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(15,23,42,.48)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:16}}>
          <div className="modal-box" style={{background:"#fff",borderRadius:24,padding:32,maxWidth:480,width:"100%",boxShadow:"0 32px 80px rgba(0,0,0,.22)"}}>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:900,color:C.slate,marginBottom:6}}>Cancel Appointment</h2>
            <p style={{fontSize:13,color:C.slateL,marginBottom:20}}>Patient: <strong>{apptPatFn(cancelModal)} {apptPatLn(cancelModal)}</strong></p>
            <label style={{fontSize:13,fontWeight:700,color:C.slateM,display:"block",marginBottom:6}}>Reason <span style={{color:C.slateXL,fontWeight:400}}>(optional)</span></label>
            <select className="input-field" value={cancelReason} onChange={e=>setCancelReason(e.target.value)}>
              <option value="">Select a reason…</option>
              <option value="Doctor unavailable">Doctor unavailable</option>
              <option value="Patient no-show">Patient no-show</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Other">Other</option>
            </select>
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button className="btn-ghost" onClick={()=>setCancelModal(null)} style={{flex:1,justifyContent:"center",padding:"11px"}}>Back</button>
              <button className="btn-danger" onClick={()=>{onCancel(cancelModal.id,cancelReason||null);setCancelModal(null);}} disabled={loading} style={{flex:1,justifyContent:"center"}}>
                {loading?<Spinner size={16} color="#fff"/>:<><XIcon/> Confirm Cancel</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsTab;
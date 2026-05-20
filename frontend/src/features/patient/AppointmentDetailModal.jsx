import { C, apptDate, apptTime, apptReason, apptDoctorFn, apptDoctorLn, apptDoctorSpec, apptDoctorPic, apptStatus, docColor, docId } from './patientConstants';
import { DoctorAvatar, StatusBadge, DateIcon, TimeIcon, XIcon } from './PatientUI';

// ── Who cancelled helper ──────────────────────────────────────────────────
const getCancelledBy = (a) => {
  if (a.cancelledBy) {
    const b = a.cancelledBy.toUpperCase();
    if (b === "PATIENT")   return { label:"Cancelled by you",       color:"#64748b", bg:"#f1f5f9", border:"#cbd5e1" };
    if (b === "DOCTOR")    return { label:"Cancelled by doctor",     color:"#dc2626", bg:"#fef2f2", border:"#fecaca" };
    if (b === "SECRETARY") return { label:"Cancelled by clinic",     color:"#d97706", bg:"#fffbeb", border:"#fde68a" };
  }
  // fallback — infer from context if cancelledBy not available
  return { label:"Appointment cancelled", color:"#64748b", bg:"#f1f5f9", border:"#cbd5e1" };
};

const AppointmentDetailModal = ({ appt, onClose }) => {
  if (!appt) return null;

  const st     = apptStatus(appt);
  const fn     = apptDoctorFn(appt);
  const ln     = apptDoctorLn(appt);
  const color  = docColor(appt.doctor?.doctorId ?? appt.doctor?.id ?? 0);
  const cancelInfo = getCancelledBy(appt);

  // Header gradient based on status
  const headerGrad = {
    CONFIRMED: `linear-gradient(135deg,${C.green},#047857)`,
    COMPLETED: `linear-gradient(135deg,${C.blue},#1d4ed8)`,
    CANCELLED: `linear-gradient(135deg,#64748b,#475569)`,
    REJECTED:  `linear-gradient(135deg,${C.red},#dc2626)`,
    PENDING:   `linear-gradient(135deg,${C.amber},${C.amberDk})`,
  }[st] || `linear-gradient(135deg,${C.slate},#334155)`;

  return (
    <div className="modal-bg" style={{position:"fixed",inset:0,zIndex:1100,background:"rgba(15,23,42,.52)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(7px)",padding:16}} onClick={onClose}>
      <div className="modal-box" style={{background:"#fff",borderRadius:24,maxWidth:500,width:"100%",boxShadow:"0 32px 80px rgba(0,0,0,.24)",overflow:"hidden",maxHeight:"90vh",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>

        {/* ── Header ── */}
        <div style={{background:headerGrad,padding:"22px 24px 18px",position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"rgba(255,255,255,.2)",border:"none",borderRadius:"50%",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",fontSize:16}}>
            <XIcon/>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:13,marginBottom:12}}>
            <DoctorAvatar firstname={fn} lastname={ln} color={color} size={50} profilePicture={apptDoctorPic(appt)}/>
            <div>
              <div style={{color:"rgba(255,255,255,.75)",fontSize:10.5,fontWeight:700,letterSpacing:.6,marginBottom:2}}>APPOINTMENT DETAILS</div>
              <div style={{color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:17,lineHeight:1.2}}>Dr. {fn} {ln}</div>
              <div style={{color:"rgba(255,255,255,.8)",fontSize:12.5,marginTop:2,fontWeight:600}}>{apptDoctorSpec(appt)||"General Practitioner"}</div>
            </div>
          </div>
          <div style={{display:"inline-flex",background:"rgba(255,255,255,.2)",borderRadius:100,padding:"4px 14px"}}>
            <span style={{color:"#fff",fontSize:12,fontWeight:700,letterSpacing:.3}}>{appt.status}</span>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{padding:"20px 24px",overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:14}}>

          {/* Date & Time */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div style={{background:"#f8fafc",borderRadius:12,padding:"12px 14px",border:"1px solid #e2e8f0"}}>
              <div style={{fontSize:10,fontWeight:700,color:C.slateXL,letterSpacing:.6,marginBottom:5,display:"flex",alignItems:"center",gap:5}}><DateIcon/> DATE</div>
              <div style={{fontSize:14,fontWeight:700,color:C.slate}}>
                {apptDate(appt) ? new Date(apptDate(appt)).toLocaleDateString("en-PH",{weekday:"short",month:"long",day:"numeric",year:"numeric"}) : "—"}
              </div>
            </div>
            <div style={{background:"#f8fafc",borderRadius:12,padding:"12px 14px",border:"1px solid #e2e8f0"}}>
              <div style={{fontSize:10,fontWeight:700,color:C.slateXL,letterSpacing:.6,marginBottom:5,display:"flex",alignItems:"center",gap:5}}><TimeIcon/> TIME</div>
              <div style={{fontSize:14,fontWeight:700,color:C.slate}}>{apptTime(appt)||"—"}</div>
            </div>
          </div>

          {/* Reason for Visit */}
          {apptReason(appt) && (
            <div style={{background:"#f8fafc",borderRadius:12,padding:"13px 16px",border:"1px solid #e2e8f0"}}>
              <div style={{fontSize:10,fontWeight:700,color:C.slateXL,letterSpacing:.6,marginBottom:6}}>REASON FOR VISIT</div>
              <p style={{fontSize:13.5,color:C.slateM,lineHeight:1.65,margin:0}}>{apptReason(appt)}</p>
            </div>
          )}

          {/* ── COMPLETED: Doctor's Notes / Consultation Summary ── */}
          {st === "COMPLETED" && (
            <div style={{background:C.blueLt,borderRadius:14,padding:"16px 18px",border:`1.5px solid ${C.blueBdr}`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue},#1d4ed8)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>📋</div>
                <div>
                  <div style={{fontSize:12,fontWeight:800,color:C.blue}}>CONSULTATION SUMMARY</div>
                  <div style={{fontSize:10.5,color:"#3b82f6",fontWeight:500}}>Doctor's notes from your visit</div>
                </div>
              </div>
              {appt.doctorNotes ? (
                <p style={{fontSize:13.5,color:"#1e3a8a",lineHeight:1.75,margin:0,fontWeight:400}}>{appt.doctorNotes}</p>
              ) : (
                <p style={{fontSize:13,color:"#3b82f6",fontStyle:"italic",margin:0}}>No notes were added for this consultation.</p>
              )}
              {appt.completedAt && (
                <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.blueBdr}`,fontSize:11.5,color:"#3b82f6",fontWeight:600}}>
                  Completed on {new Date(appt.completedAt).toLocaleDateString("en-PH",{month:"long",day:"numeric",year:"numeric"})}
                </div>
              )}
            </div>
          )}

          {/* ── CANCELLED: Cancellation Details ── */}
          {st === "CANCELLED" && (
            <div style={{background:cancelInfo.bg,borderRadius:14,padding:"16px 18px",border:`1.5px solid ${cancelInfo.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(0,0,0,.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>✕</div>
                <div>
                  <div style={{fontSize:12,fontWeight:800,color:cancelInfo.color}}>CANCELLATION DETAILS</div>
                  <div style={{fontSize:11,color:cancelInfo.color,fontWeight:600,opacity:.8}}>{cancelInfo.label}</div>
                </div>
              </div>
              {appt.cancelReason ? (
                <p style={{fontSize:13.5,color:cancelInfo.color,lineHeight:1.7,margin:0}}>{appt.cancelReason}</p>
              ) : (
                <p style={{fontSize:13,color:cancelInfo.color,fontStyle:"italic",margin:0,opacity:.75}}>No reason was provided.</p>
              )}
              {appt.cancelledAt && (
                <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${cancelInfo.border}`,fontSize:11.5,color:cancelInfo.color,fontWeight:600,opacity:.8}}>
                  Cancelled on {new Date(appt.cancelledAt).toLocaleDateString("en-PH",{month:"long",day:"numeric",year:"numeric"})}
                </div>
              )}
            </div>
          )}

          {/* ── REJECTED: Rejection Details ── */}
          {st === "REJECTED" && (
            <div style={{background:C.redLt,borderRadius:14,padding:"16px 18px",border:`1.5px solid ${C.redBdr}`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(239,68,68,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>✕</div>
                <div>
                  <div style={{fontSize:12,fontWeight:800,color:C.red}}>APPOINTMENT NOT APPROVED</div>
                  <div style={{fontSize:11,color:C.red,fontWeight:600,opacity:.75}}>Declined by clinic secretary</div>
                </div>
              </div>
              {appt.rejectedReason ? (
                <p style={{fontSize:13.5,color:"#991b1b",lineHeight:1.7,margin:0}}>{appt.rejectedReason}</p>
              ) : (
                <p style={{fontSize:13,color:"#991b1b",fontStyle:"italic",margin:0,opacity:.75}}>No reason was provided.</p>
              )}
              {appt.rejectedAt && (
                <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.redBdr}`,fontSize:11.5,color:"#991b1b",fontWeight:600,opacity:.8}}>
                  Rejected on {new Date(appt.rejectedAt).toLocaleDateString("en-PH",{month:"long",day:"numeric",year:"numeric"})}
                </div>
              )}
            </div>
          )}

          {/* ── CONFIRMED ── */}
          {st === "CONFIRMED" && (
            <div style={{background:C.greenLt,borderRadius:14,padding:"14px 18px",border:`1.5px solid ${C.greenBdr}`,display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontSize:20}}>✅</div>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:C.green}}>Appointment Confirmed</div>
                <div style={{fontSize:12,color:"#047857",marginTop:2}}>Please arrive on time for your scheduled visit.</div>
              </div>
            </div>
          )}

          {/* ── PENDING ── */}
          {st === "PENDING" && (
            <div style={{background:C.amberLt,borderRadius:14,padding:"14px 18px",border:`1.5px solid ${C.amberBdr}`,display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontSize:20}}>⏳</div>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:C.amberDk}}>Awaiting Confirmation</div>
                <div style={{fontSize:12,color:C.amberDk,marginTop:2,opacity:.8}}>The clinic secretary will review and confirm your appointment.</div>
              </div>
            </div>
          )}

          {/* Close button */}
          <button onClick={onClose} style={{width:"100%",padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",color:C.slateM,fontSize:13.5,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginTop:4}}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
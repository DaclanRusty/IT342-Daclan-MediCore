import { useState, useEffect } from 'react';
import { patientApi } from '../shared/api';
import { C, docColor, docId, ALL_SLOTS, slotToMinutes } from './patientConstants';
import { DoctorAvatar, Spinner, ErrBanner, XIcon, CheckIcon, PlusIcon } from './PatientUI';

const BookModal = ({ doctors, onSuccess, onClose, preselectedDoctor = null }) => {
  const [step,       setStep]       = useState(preselectedDoctor ? 2 : 1);
  const [sel,        setSel]        = useState(preselectedDoctor);
  const [date,       setDate]       = useState("");
  const [time,       setTime]       = useState("");
  const [reason,     setReason]     = useState("");
  const [busy,       setBusy]       = useState(false);
  const [err,        setErr]        = useState("");
  const [takenSlots, setTakenSlots] = useState([]);
  const [loadSlots,  setLoadSlots]  = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const normalize = (s) => s?.trim().replace(/\s+/g," ").toUpperCase() || "";

  useEffect(() => {
    if (!sel || !date) { setTakenSlots([]); return; }
    (async () => {
      setLoadSlots(true);
      try { const taken = await patientApi.getTakenSlots(docId(sel), date); setTakenSlots(Array.isArray(taken) ? taken : []); }
      catch { setTakenSlots([]); }
      finally { setLoadSlots(false); }
    })();
  }, [sel, date]);

  const getSlotState = (slot) => {
    const slotNorm = normalize(slot);
    if (takenSlots.some(t => normalize(t) === slotNorm)) return "taken";
    if (date === today) {
      const now = new Date();
      if (slotToMinutes(slot) <= now.getHours() * 60 + now.getMinutes()) return "past";
    }
    return "available";
  };

  useEffect(() => { if (time && getSlotState(time) !== "available") setTime(""); }, [takenSlots, date]);

  const submit = async () => {
    if (!sel || !date || !time || !reason.trim()) { setErr("Please fill in all required fields."); return; }
    setBusy(true); setErr("");
    try {
      await patientApi.bookAppointment({ 
        doctorId: docId(sel), 
        requestedDate: date, 
        requestedTime: time, 
        reasonForVisit: reason.trim() 
      });
      onSuccess("Appointment submitted! Status: Pending — awaiting secretary approval.");
    } catch(e) { setErr(e.message || "Failed to submit appointment. Please try again."); }
    finally { setBusy(false); }
  };

  return (
    <div className="modal-bg" style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(15,23,42,.48)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:16}}>
      <div className="modal-box" style={{background:"#fff",borderRadius:24,padding:32,maxWidth:540,width:"100%",boxShadow:"0 32px 80px rgba(0,0,0,.22)",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:900,color:C.slate}}>Book an Appointment</h2>
            <p style={{fontSize:12.5,color:C.slateL,marginTop:3}}>Fill in the details below to schedule your appointment</p>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{padding:"7px",flexShrink:0}}><XIcon/></button>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {[1,2].map(s=>(<div key={s} style={{flex:1,height:4,borderRadius:99,background:step>=s?`linear-gradient(90deg,${C.blue},${C.purple})`:"rgba(226,232,240,.7)",transition:"background .3s"}}/>))}
        </div>
        {err && <ErrBanner msg={err}/>}

        {step===1 && (
          <>
            <p style={{fontSize:13.5,fontWeight:700,color:C.slateM,marginBottom:12}}>Select a Doctor</p>
            {doctors.length===0
              ? <div style={{padding:24,textAlign:"center",color:C.slateXL,fontSize:13}}>No doctors available at the moment.</div>
              : <div style={{display:"flex",flexDirection:"column",gap:10,maxHeight:340,overflowY:"auto",paddingRight:4}}>
                  {doctors.map(doc => {
                    const fn=doc.firstName||doc.firstname||""; const ln=doc.lastName||doc.lastname||"";
                    const id=docId(doc); const color=docColor(id); const isSelected=sel&&docId(sel)===id;
                    return (
                      <div key={id} onClick={()=>{setSel(doc);setDate("");setTime("");setTakenSlots([]);}}
                        style={{display:"flex",alignItems:"center",gap:14,padding:"13px 16px",borderRadius:14,border:`2px solid ${isSelected?C.blue:"rgba(226,232,240,.7)"}`,background:isSelected?C.blueLt:"rgba(248,250,252,.8)",cursor:"pointer",transition:"all .18s"}}>
                        <DoctorAvatar firstname={fn} lastname={ln} color={color} size={44} profilePicture={doc.profilePicture}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:14.5,color:C.slate}}>Dr. {fn} {ln}</div>
                          <div style={{fontSize:12.5,color:C.slateL,marginTop:2}}>{doc.specialization}</div>
                        </div>
                        {isSelected&&<div style={{width:22,height:22,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue},${C.blueDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0}}><CheckIcon/></div>}
                      </div>
                    );
                  })}
                </div>
            }
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button className="btn-ghost" onClick={onClose} style={{flex:1,justifyContent:"center",padding:"11px"}}>Cancel</button>
              <button className="btn-primary" onClick={()=>{setErr("");setStep(2);}} disabled={!sel} style={{flex:1,justifyContent:"center"}}>Next →</button>
            </div>
          </>
        )}

        {step===2 && (
          <>
            {sel && (
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:14,background:C.blueLt,border:`1px solid ${C.blueBdr}`,marginBottom:18}}>
                <DoctorAvatar firstname={sel.firstName||sel.firstname||""} lastname={sel.lastName||sel.lastname||""} color={docColor(docId(sel))} size={40} profilePicture={sel.profilePicture}/>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:14,color:C.slate}}>Dr. {sel.firstName||sel.firstname||""} {sel.lastName||sel.lastname||""}</div>
                  <div style={{fontSize:12,color:C.blue,fontWeight:600}}>{sel.specialization}</div>
                </div>
                <button onClick={()=>{setSel(null);setStep(1);setDate("");setTime("");setTakenSlots([]);}} style={{fontSize:12,color:C.blue,background:"none",border:"none",cursor:"pointer",fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Change</button>
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:15}}>
              <div>
                <label style={{fontSize:13,fontWeight:700,color:C.slateM,display:"block",marginBottom:6}}>Requested Date <span style={{color:C.red}}>*</span></label>
                <input type="date" className="input-field" min={today} value={date} onChange={e=>{setDate(e.target.value);setTime("");}}/>
              </div>
              <div>
                <label style={{fontSize:13,fontWeight:700,color:C.slateM,display:"block",marginBottom:8}}>Requested Time <span style={{color:C.red}}>*</span></label>
                {!date ? (
                  <div style={{fontSize:13,color:C.slateXL,padding:"8px 0",fontStyle:"italic"}}>Please select a date first.</div>
                ) : loadSlots ? (
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 0",color:C.slateL,fontSize:13}}><Spinner size={16} color={C.blue}/> Checking availability…</div>
                ) : (
                  <>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                      {ALL_SLOTS.map(slot => {
                        const state=getSlotState(slot); const isSelected=time===slot; const isUnavailable=state==="taken"||state==="past";
                        return (
                          <button key={slot} type="button" disabled={isUnavailable} onClick={()=>!isUnavailable&&setTime(slot)} className={isUnavailable?"":"slot-btn"}
                            style={{padding:"11px 4px",borderRadius:10,border:`1.5px solid ${isSelected?C.blue:isUnavailable?"#e2e8f0":"#d1d5db"}`,background:isSelected?C.blue:isUnavailable?"#f1f5f9":"#fff",color:isSelected?"#fff":isUnavailable?"#cbd5e1":C.slateM,fontSize:12.5,fontWeight:isSelected?700:500,cursor:isUnavailable?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",opacity:isUnavailable?0.45:1,pointerEvents:isUnavailable?"none":"auto"}}>
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                    {!time&&<p style={{fontSize:12,color:C.amber,marginTop:8,fontWeight:600}}>⚠️ Please select an available time slot.</p>}
                  </>
                )}
              </div>
              <div>
                <label style={{fontSize:13,fontWeight:700,color:C.slateM,display:"block",marginBottom:6}}>Reason for Visit <span style={{color:C.red}}>*</span></label>
                <textarea className="input-field" rows={4} maxLength={500} placeholder="Please describe your symptoms or reason for visit…" value={reason} onChange={e=>setReason(e.target.value)}/>
                <p style={{fontSize:11.5,color:reason.length>450?C.amber:C.slateXL,marginTop:4,textAlign:"right"}}>{reason.length}/500</p>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button className="btn-ghost" onClick={()=>{setErr("");setStep(1);}} style={{flex:1,justifyContent:"center",padding:"11px"}}>← Back</button>
              <button className="btn-primary" onClick={submit} disabled={busy||!date||!time||!reason.trim()} style={{flex:1,justifyContent:"center",gap:8}}>
                {busy?<><Spinner size={16} color="#fff"/> Submitting…</>:<>Submit Appointment ✓</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookModal;
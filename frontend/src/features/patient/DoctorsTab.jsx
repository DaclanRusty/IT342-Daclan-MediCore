import { useState } from 'react';
import { C, docColor, docId } from './patientConstants';
import { DoctorAvatar, Spinner, ErrBanner, StatusBadge, XIcon, PlusIcon } from './PatientUI';

// ── Doctor Profile Modal ──────────────────────────────────────────────────
const DoctorProfileModal = ({ doc, onClose, onBook }) => {
  if (!doc) return null;
  const fn    = doc.firstName||doc.firstname||"";
  const ln    = doc.lastName||doc.lastname||"";
  const id    = docId(doc);
  const color = docColor(id);
  const yoe   = doc.yearsOfExperience||doc.years_of_experience;
  const bio   = doc.bio||doc.biography;

  return (
    <div className="modal-bg" style={{position:"fixed",inset:0,zIndex:1001,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:16}}>
      <div className="modal-box" style={{background:"#fff",borderRadius:24,maxWidth:480,width:"100%",boxShadow:"0 32px 80px rgba(0,0,0,.22)",overflow:"hidden",maxHeight:"90vh",display:"flex",flexDirection:"column"}}>
        <div style={{background:`linear-gradient(135deg,${color},${color}cc)`,padding:"28px 28px 24px",position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,.2)",border:"none",borderRadius:"50%",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff"}}><XIcon/></button>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <DoctorAvatar firstname={fn} lastname={ln} color={color} size={68} profilePicture={doc.profilePicture}/>
            <div>
              <div style={{color:"rgba(255,255,255,.75)",fontSize:11,fontWeight:700,letterSpacing:.8,marginBottom:3}}>DOCTOR PROFILE</div>
              <div style={{color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:20,lineHeight:1.2}}>Dr. {fn} {ln}</div>
              <div style={{color:"rgba(255,255,255,.85)",fontSize:13,marginTop:4,fontWeight:600}}>{doc.specialization||"General Practitioner"}</div>
            </div>
          </div>
        </div>
        <div style={{padding:"24px 28px",overflowY:"auto",flex:1}}>
          {yoe && (
            <div style={{display:"flex",gap:12,marginBottom:20}}>
              <div style={{flex:1,background:C.blueLt,borderRadius:12,padding:"12px 16px",border:`1px solid ${C.blueBdr}`}}>
                <div style={{fontSize:11,fontWeight:700,color:C.blue,marginBottom:3}}>EXPERIENCE</div>
                <div style={{fontSize:18,fontWeight:800,color:C.slate}}>{yoe} <span style={{fontSize:13,fontWeight:500,color:C.slateL}}>years</span></div>
              </div>
              <div style={{flex:1,background:C.greenLt,borderRadius:12,padding:"12px 16px",border:`1px solid ${C.greenBdr}`}}>
                <div style={{fontSize:11,fontWeight:700,color:C.green,marginBottom:3}}>SPECIALIZATION</div>
                <div style={{fontSize:13,fontWeight:700,color:C.slate,lineHeight:1.3}}>{doc.specialization||"—"}</div>
              </div>
            </div>
          )}
          {bio ? (
            <div style={{marginBottom:20}}>
              <div style={{fontSize:11.5,fontWeight:700,color:C.slateXL,letterSpacing:.6,marginBottom:8}}>ABOUT</div>
              <p style={{fontSize:14,color:C.slateM,lineHeight:1.75,fontWeight:400}}>{bio}</p>
            </div>
          ) : (
            <div style={{marginBottom:20,padding:"16px",background:"#f8fafc",borderRadius:12,textAlign:"center"}}>
              <p style={{fontSize:13.5,color:C.slateXL,fontStyle:"italic"}}>No biography provided.</p>
            </div>
          )}
          <button className="btn-primary" onClick={()=>{ onClose(); onBook(doc); }} style={{width:"100%",justifyContent:"center",padding:"13px",fontSize:15}}>
            <PlusIcon/> Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Doctors Tab ───────────────────────────────────────────────────────────
const DoctorsTab = ({ doctors, loading, error, onBook, onRetry }) => {
  const [search,  setSearch]  = useState("");
  const [spec,    setSpec]    = useState("All");
  const [viewDoc, setViewDoc] = useState(null);

  const specs = ["All", ...new Set(doctors.map(d=>d.specialization).filter(Boolean))];
  const list  = doctors.filter(d => {
    const fn = d.firstName||d.firstname||"";
    const ln = d.lastName||d.lastname||"";
    return (spec==="All"||d.specialization===spec) && `${fn} ${ln}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      {viewDoc && <DoctorProfileModal doc={viewDoc} onClose={()=>setViewDoc(null)} onBook={doc=>{setViewDoc(null);onBook(doc);}}/>}
      <div className="pw" style={{padding:"24px 32px 56px",maxWidth:1120,margin:"0 auto"}}>
        <div className="au2" style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:"1 1 220px",maxWidth:320}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.slateXL,pointerEvents:"none",fontSize:14}}>🔍</span>
            <input className="input-field" placeholder="Search doctors…" value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:36}}/>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {specs.map(s => (
              <button key={s} className="filter-pill" onClick={()=>setSpec(s)} style={{borderColor:spec===s?C.blue:"rgba(226,232,240,.8)",background:spec===s?C.blueLt:"rgba(255,255,255,.72)",color:spec===s?C.blue:C.slateL,fontSize:12}}>{s}</button>
            ))}
          </div>
        </div>
        {error && <ErrBanner msg={error} onRetry={onRetry}/>}
        {loading ? (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:60,gap:10,color:C.slateL,fontSize:14,fontWeight:600}}><Spinner/> Loading doctors…</div>
        ) : (
          <div className="doc-grid au3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {list.map((doc,i) => {
              const fn    = doc.firstName||doc.firstname||"";
              const ln    = doc.lastName||doc.lastname||"";
              const id    = docId(doc);
              const color = docColor(id);
              const yoe   = doc.yearsOfExperience||doc.years_of_experience;
              const bio   = doc.bio||doc.biography;
              return (
                <div key={id} className="doc-card" style={{animationDelay:`${i*.05}s`}} onClick={()=>setViewDoc(doc)}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:13,marginBottom:12}}>
                    <DoctorAvatar firstname={fn} lastname={ln} color={color} size={50} profilePicture={doc.profilePicture}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:14.5,color:C.slate,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Dr. {fn} {ln}</div>
                      <div style={{fontSize:12.5,color:C.slateL,marginTop:2}}>{doc.specialization||"General Practitioner"}</div>
                      {yoe && <div style={{fontSize:11.5,color:C.slateXL,marginTop:5,display:"flex",alignItems:"center",gap:5}}><svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={11} height={11}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>{yoe} yr{yoe!==1?"s":""} experience</span></div>}
                    </div>
                  </div>
                  {bio ? (<p style={{fontSize:12.5,color:C.slateM,lineHeight:1.65,marginBottom:14,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",flexGrow:1}}>{bio}</p>) : (<div style={{flexGrow:1}}/>)}
                  {doc.status && doc.status!=="APPROVED" && <div style={{marginBottom:10}}><StatusBadge status={doc.status}/></div>}
                  <div style={{display:"flex",gap:8,marginTop:"auto"}}>
                    <button className="btn-ghost" onClick={e=>{e.stopPropagation();setViewDoc(doc);}} style={{flex:1,justifyContent:"center",padding:"9px",fontSize:13}}>View Profile</button>
                    <button className="btn-primary" onClick={e=>{e.stopPropagation();onBook(doc);}} style={{flex:1,justifyContent:"center",padding:"9px",fontSize:13}}>Book</button>
                  </div>
                </div>
              );
            })}
            {list.length===0 && !loading && <div className="glass" style={{gridColumn:"1/-1",padding:40,textAlign:"center",color:C.slateXL,fontSize:14}}><div style={{fontSize:32,marginBottom:8}}>🔍</div>No doctors found.</div>}
          </div>
        )}
      </div>
    </>
  );
};

export default DoctorsTab;
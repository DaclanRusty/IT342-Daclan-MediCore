import { useState } from 'react';
import { C, docColor, apptDate, apptTime, apptStatus, apptDoctorFn, apptDoctorLn, apptDoctorSpec, apptDoctorPic, apptReason } from './patientConstants';
import { DoctorAvatar, Spinner, ErrBanner, StatusBadge, DateIcon, TimeIcon, LightIcon, RefreshIcon, PlusIcon, StatClipboardIcon, StatCheckIcon, StatClockIcon, StatFlagIcon } from './PatientUI';

const HomeTab = ({ user, appts, apptLoad, apptErr, onBook, onGoTo, onRetryAppts, tips, tipsLoad, tipsErr, onRetryTips }) => {
  const [tipIdx, setTipIdx] = useState(0);
  const [tipKey, setTipKey] = useState(0);
  const nextTip = () => { setTipIdx(i=>(i+1)%(tips.length||1)); setTipKey(k=>k+1); };

  const upcoming = appts.filter(a=>["PENDING","CONFIRMED"].includes(apptStatus(a))).slice(0,4);
  const counts = {
    total:     appts.length,
    confirmed: appts.filter(a=>apptStatus(a)==="CONFIRMED").length,
    pending:   appts.filter(a=>apptStatus(a)==="PENDING").length,
    completed: appts.filter(a=>apptStatus(a)==="COMPLETED").length,
  };
  const name = user?.firstname || user?.firstName || "there";

  const statCards = [
    { label:"Total Appointments",     val:counts.total,     grad:`linear-gradient(135deg,${C.blue},${C.blueDk})`,  icon:<StatClipboardIcon/> },
    { label:"Confirmed Appointments", val:counts.confirmed, grad:`linear-gradient(135deg,${C.green},#047857)`,      icon:<StatCheckIcon/>     },
    { label:"Pending Appointments",   val:counts.pending,   grad:`linear-gradient(135deg,${C.amber},${C.amberDk})`, icon:<StatClockIcon/>     },
    { label:"Completed Appointments", val:counts.completed, grad:`linear-gradient(135deg,${C.purple},#7e22ce)`,     icon:<StatFlagIcon/>      },
  ];

  return (
    <div className="pw" style={{padding:"0 32px 56px",maxWidth:1120,margin:"0 auto"}}>
      <div className="au1" style={{padding:"36px 0 26px"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:20}}>
          <div>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:"clamp(1.6rem,4vw,2.2rem)",fontWeight:900,color:C.slate,lineHeight:1.15,marginBottom:8}}>
              Welcome back, <span className="shimmer-text">{name}!</span>
            </h1>
            <p style={{fontSize:15,color:C.slateL,fontWeight:500,maxWidth:480}}>Manage your appointments and explore our network of healthcare professionals.</p>
          </div>
          <button className="btn-primary" onClick={()=>onBook(null)} style={{fontSize:15,padding:"13px 26px",flexShrink:0}}><PlusIcon/> Book Now</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="four-col au2" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
        {statCards.map((s,i) => (
          <div key={i} className="stat-card" style={{animationDelay:`${i*.06}s`}}>
            <div style={{width:44,height:44,borderRadius:13,background:s.grad,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,boxShadow:"0 3px 12px rgba(0,0,0,.12)"}}>{s.icon}</div>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:32,fontWeight:900,color:C.slate,lineHeight:1,marginBottom:6}}>{apptLoad?<Spinner size={22}/>:s.val}</div>
            <div style={{fontSize:12.5,color:C.slateL,fontWeight:600}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="au3" style={{marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:17,fontWeight:900,color:C.slate}}>Appointments</h2>
            <p style={{fontSize:12.5,color:C.slateL,marginTop:2}}>Track and manage your scheduled appointments</p>
          </div>
          <button onClick={()=>onGoTo("appointments")} style={{fontSize:12,color:C.amberDk,background:C.amberLt,border:`1px solid ${C.amberBdr}`,padding:"5px 14px",borderRadius:100,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>View all →</button>
        </div>
        {apptErr && <ErrBanner msg={apptErr} onRetry={onRetryAppts}/>}
        {apptLoad ? (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40,gap:10,color:C.slateL,fontSize:14,fontWeight:600}}><Spinner/> Loading appointments…</div>
        ) : upcoming.length===0 ? (
          <div className="glass" style={{padding:40,textAlign:"center",color:C.slateXL,fontSize:14}}>
            <div style={{fontSize:36,marginBottom:10}}>📭</div>
            No upcoming appointments.{" "}
            <button onClick={()=>onBook(null)} style={{color:C.blue,background:"none",border:"none",cursor:"pointer",fontWeight:700,fontSize:14,fontFamily:"'DM Sans',sans-serif"}}>Book one now →</button>
          </div>
        ) : (
          <div className="two-col" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
            {upcoming.map(a => {
              const color = docColor(a.doctor?.doctorId??a.doctor?.id??0);
              return (
                <div key={a.id} className="appt-card" style={{padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:13,marginBottom:14}}>
                    <DoctorAvatar firstname={apptDoctorFn(a)} lastname={apptDoctorLn(a)} color={color} size={46} profilePicture={apptDoctorPic(a)}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:C.slate}}>Dr. {apptDoctorFn(a)} {apptDoctorLn(a)}</div>
                      <div style={{fontSize:12.5,color:C.slateL,marginTop:2}}>{apptDoctorSpec(a)}</div>
                    </div>
                    <StatusBadge status={a.status}/>
                  </div>
                  <div style={{display:"flex",gap:16,marginBottom:14,flexWrap:"wrap"}}>
                    <span style={{fontSize:13,color:C.slateM,fontWeight:600,display:"flex",alignItems:"center",gap:5}}><DateIcon/>{apptDate(a)?new Date(apptDate(a)).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"}):"—"}</span>
                    <span style={{fontSize:13,color:C.slateM,fontWeight:600,display:"flex",alignItems:"center",gap:5}}><TimeIcon/>{apptTime(a)||"—"}</span>
                  </div>
                  <button className="btn-primary" onClick={()=>onGoTo("appointments")} style={{width:"100%",justifyContent:"center",padding:"9px",fontSize:13}}>View Details</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Health Tips */}
      <div className="au4">
        <div className="glass" style={{padding:"22px 24px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${C.green},#047857)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",boxShadow:`0 4px 14px rgba(5,150,105,.28)`}}><LightIcon/></div>
              <div>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:C.slate}}>Exercise & Fitness Tip</div>
                <div style={{fontSize:12,color:C.slateL}}>Daily exercise and fitness tips</div>
              </div>
            </div>
            {tips.length>0 && <button className="btn-ghost" onClick={nextTip} disabled={tipsLoad} style={{display:"flex",alignItems:"center",gap:6,fontSize:12.5,color:C.green,background:C.greenLt,border:`1px solid ${C.greenBdr}`,padding:"7px 14px"}}><RefreshIcon/> New Exercise</button>}
          </div>
          {tipsLoad ? (
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",color:C.slateL,fontSize:13}}><Spinner size={16} color={C.green}/> Loading tips…</div>
          ) : tipsErr ? (
            <div style={{borderLeft:`3px solid ${C.amber}`,paddingLeft:16}}>
              <p style={{fontSize:13.5,color:C.slateL}}>Unable to load exercise tips right now.</p>
              <button className="btn-ghost" onClick={onRetryTips} style={{marginTop:8,fontSize:12,color:C.amber,borderColor:C.amberBdr,padding:"5px 12px"}}><RefreshIcon/> Retry</button>
            </div>
          ) : tips.length>0 ? (
            <>
              <div className="tip-anim" key={tipKey} style={{borderLeft:`3px solid ${C.green}`,paddingLeft:16}}>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <p style={{fontSize:15,fontWeight:800,color:C.slate,lineHeight:1.5}}>{tips[tipIdx].split("—")[0]}</p>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {tips[tipIdx].split("—")[1]?.split("|")[0]?.split(",").map((detail,i) => (
                      <span key={i} style={{background:i===0?C.blueLt:i===1?C.greenLt:C.purpleLt,color:i===0?C.blue:i===1?C.green:C.purple,border:`1px solid ${i===0?C.blueBdr:i===1?C.greenBdr:C.purpleBdr}`,borderRadius:100,padding:"4px 12px",fontSize:12,fontWeight:700}}>{detail.trim()}</span>
                    ))}
                  </div>
                  {tips[tipIdx].includes("|") && (
                    <div style={{marginTop:6,padding:"14px 16px",background:"#f8fafc",borderRadius:12,border:"1px solid #e2e8f0"}}>
                      <div style={{fontSize:11.5,fontWeight:700,color:C.slateXL,marginBottom:10}}>📋 HOW TO DO IT</div>
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        {tips[tipIdx].split("|")[1]?.trim().split(". ").filter(s=>s.trim().length>0).slice(0,5).map((sentence,i) => (
                          <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                            <div style={{minWidth:22,height:22,borderRadius:"50%",background:`linear-gradient(135deg,${C.green},#047857)`,color:"#fff",fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{i+1}</div>
                            <p style={{fontSize:13,color:C.slateM,lineHeight:1.7,fontWeight:400,margin:0}}>{sentence.trim().endsWith(".")?sentence.trim():sentence.trim()+"."}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div style={{fontSize:11.5,color:C.slateXL,marginTop:10}}>Powered by API Ninjas — Exercise & Fitness API</div>
            </>
          ) : (
            <p style={{fontSize:13.5,color:C.slateXL,fontStyle:"italic"}}>No tips available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
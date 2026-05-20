import { useState, useCallback } from 'react';

// ── Colors (match DoctorDashboard) ───────────────────────────────────────
const C = {
  green:"#059669",  greenDk:"#047857", greenLt:"#f0fdf4", greenBdr:"#bbf7d0",
  teal:"#0891b2",   tealLt:"#ecfeff",  tealBdr:"#a5f3fc",
  amber:"#f59e0b",  amberDk:"#d97706", amberLt:"#fffbeb", amberBdr:"#fde68a",
  blue:"#2563eb",   blueLt:"#eff6ff",  blueBdr:"#bfdbfe",
  purple:"#7c3aed", purpleLt:"#f5f3ff",purpleBdr:"#ddd6fe",
  red:"#ef4444",    redLt:"#fef2f2",   redBdr:"#fecaca",
  slate:"#0f172a",  slateM:"#334155",  slateL:"#64748b",  slateXL:"#94a3b8",
};

// ── Status color map ─────────────────────────────────────────────────────
const STATUS_COLORS = {
  CONFIRMED: { bg:"#dcfce7", border:"#16a34a", text:"#14532d", dot:"#16a34a", pill:"#bbf7d0" },
  COMPLETED: { bg:"#dbeafe", border:"#2563eb", text:"#1e3a8a", dot:"#2563eb", pill:"#bfdbfe" },
  CANCELLED: { bg:"#fee2e2", border:"#dc2626", text:"#7f1d1d", dot:"#dc2626", pill:"#fecaca" },
  PENDING:   { bg:"#fef9c3", border:"#ca8a04", text:"#713f12", dot:"#ca8a04", pill:"#fde68a" },
};

// ── Helpers ──────────────────────────────────────────────────────────────
const getInitials = (fn="", ln="") => `${fn[0]||""}${ln[0]||""}`.toUpperCase();
const apptPatFn  = a => a?.patient?.firstName || a?.patient?.firstname || '';
const apptPatLn  = a => a?.patient?.lastName  || a?.patient?.lastname  || '';
const apptDate   = a => a?.requestedDate || a?.requested_date || '';
const apptTime   = a => a?.requestedTime || a?.requested_time || '';
const apptReason = a => a?.reasonForVisit || a?.reason_for_visit || '';

const toDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
};

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ── Time slots ───────────────────────────────────────────────────────────
const TIME_SLOTS = [
  "08:00 AM","09:00 AM","10:00 AM","11:00 AM",
  "01:00 PM","02:00 PM","03:00 PM","04:00 PM",
];

// ── Avatar with fallback ─────────────────────────────────────────────────
const Avatar = ({ src, initials, size=36, color=C.green }) => {
  const [failed, setFailed] = useState(false);
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${color},${color}cc)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:size*.32,flexShrink:0,overflow:"hidden",boxShadow:`0 2px 8px ${color}40`}}>
      {src && !failed
        ? <img src={src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={()=>setFailed(true)}/>
        : initials
      }
    </div>
  );
};

// ── Appointment Detail Modal ─────────────────────────────────────────────
const ApptModal = ({ appt, onClose }) => {
  // read-only modal — no action views
  if (!appt) return null;

  const sc  = STATUS_COLORS[appt.status] || STATUS_COLORS.PENDING;
  const fn  = apptPatFn(appt);
  const ln  = apptPatLn(appt);
  const src = appt?.patient?.profilePicture;

  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:16}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:24,maxWidth:460,width:"100%",boxShadow:"0 32px 80px rgba(0,0,0,.22)",overflow:"hidden"}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{background:`linear-gradient(135deg,${sc.border},${sc.border}cc)`,padding:"22px 24px 18px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <span style={{background:"rgba(255,255,255,.25)",color:"#fff",fontSize:11,fontWeight:700,padding:"3px 12px",borderRadius:100,letterSpacing:.5}}>{appt.status}</span>
            <button onClick={onClose} style={{background:"rgba(255,255,255,.2)",border:"none",borderRadius:"50%",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",fontSize:16}}>✕</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:13}}>
            <Avatar src={src} initials={getInitials(fn,ln)||"P"} size={52} color={sc.border}/>
            <div>
              <div style={{color:"rgba(255,255,255,.75)",fontSize:10.5,fontWeight:700,letterSpacing:.6,marginBottom:2}}>PATIENT</div>
              <div style={{color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:18}}>{fn} {ln}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{padding:"20px 24px"}}>
          {(
            <>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                {[
                  {label:"DATE", value: apptDate(appt) ? new Date(apptDate(appt)).toLocaleDateString("en-PH",{weekday:"short",month:"short",day:"numeric",year:"numeric"}) : "—"},
                  {label:"TIME", value: apptTime(appt) || "—"},
                ].map(({label,value})=>(
                  <div key={label} style={{background:"#f8fafc",borderRadius:12,padding:"10px 14px",border:"1px solid #e2e8f0"}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.slateXL,letterSpacing:.6,marginBottom:4}}>{label}</div>
                    <div style={{fontSize:13.5,fontWeight:700,color:C.slate}}>{value}</div>
                  </div>
                ))}
              </div>
              {apptReason(appt) && (
                <div style={{background:"#f8fafc",borderRadius:12,padding:"12px 14px",border:"1px solid #e2e8f0",marginBottom:16}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.slateXL,letterSpacing:.6,marginBottom:4}}>REASON FOR VISIT</div>
                  <div style={{fontSize:13,color:C.slateM,lineHeight:1.6}}>{apptReason(appt)}</div>
                </div>
              )}
              {appt.doctorNotes && (
                <div style={{background:C.blueLt,borderRadius:12,padding:"12px 14px",border:`1px solid ${C.blueBdr}`,marginBottom:16}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.blue,letterSpacing:.6,marginBottom:4}}>DOCTOR NOTES</div>
                  <div style={{fontSize:13,color:"#1e3a8a",lineHeight:1.6}}>{appt.doctorNotes}</div>
                </div>
              )}
              {appt.cancelReason && (
                <div style={{background:C.redLt,borderRadius:12,padding:"12px 14px",border:`1px solid ${C.redBdr}`,marginBottom:16}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.red,letterSpacing:.6,marginBottom:4}}>CANCEL REASON</div>
                  <div style={{fontSize:13,color:"#7f1d1d",lineHeight:1.6}}>{appt.cancelReason}</div>
                </div>
              )}
              {appt.status === "CONFIRMED" && (
                <div style={{background:C.greenLt,border:`1px solid ${C.greenBdr}`,borderRadius:10,padding:"10px 14px",fontSize:12.5,color:C.green,fontWeight:600,textAlign:"center"}}>
                  ✓ Confirmed — go to <strong>Appointments</strong> tab to complete or cancel
                </div>
              )}
            </>
          )}


        </div>
      </div>
    </div>
  );
};

// ── Day View ─────────────────────────────────────────────────────────────
const DayView = ({ date, appointments, onSelectAppt }) => {
  const dateStr   = toDateStr(date);
  const dayAppts  = appointments.filter(a => apptDate(a) === dateStr);
  const isToday   = dateStr === toDateStr(new Date());

  return (
    <div style={{flex:1,overflowY:"auto",paddingBottom:20}}>
      <div style={{padding:"14px 20px 10px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:10}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.slateXL,textTransform:"uppercase",letterSpacing:.8}}>{DAYS[date.getDay()]}</div>
          <div style={{fontSize:28,fontWeight:900,fontFamily:"'Sora',sans-serif",color:isToday?C.green:C.slate,lineHeight:1}}>{date.getDate()}</div>
          <div style={{fontSize:11,color:C.slateL,fontWeight:600}}>{MONTHS[date.getMonth()]} {date.getFullYear()}</div>
        </div>
        {isToday && <span style={{background:C.greenLt,color:C.green,border:`1px solid ${C.greenBdr}`,borderRadius:100,padding:"3px 12px",fontSize:11.5,fontWeight:700}}>Today</span>}
        <div style={{marginLeft:"auto",fontSize:12.5,color:C.slateL,fontWeight:600}}>{dayAppts.length} appointment{dayAppts.length!==1?"s":""}</div>
      </div>

      <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:0}}>
        {TIME_SLOTS.map(slot => {
          const slotAppts = dayAppts.filter(a => {
            const t = apptTime(a)?.trim().toUpperCase();
            return t === slot.toUpperCase();
          });
          return (
            <div key={slot} style={{display:"flex",gap:12,minHeight:64,borderBottom:"1px solid #f8fafc"}}>
              {/* Time label */}
              <div style={{width:72,flexShrink:0,paddingTop:12,textAlign:"right"}}>
                <span style={{fontSize:11.5,fontWeight:600,color:C.slateXL}}>{slot}</span>
              </div>
              {/* Slot content */}
              <div style={{flex:1,paddingTop:8,paddingBottom:8,display:"flex",flexDirection:"column",gap:6}}>
                {slotAppts.length === 0
                  ? <div style={{height:40,borderRadius:8,border:"1px dashed #e2e8f0",background:"#fafafa"}}/>
                  : slotAppts.map(a => {
                      const sc = STATUS_COLORS[a.status] || STATUS_COLORS.PENDING;
                      const fn = apptPatFn(a); const ln = apptPatLn(a);
                      return (
                        <div key={a.id} onClick={()=>onSelectAppt(a)} style={{background:sc.bg,border:`1.5px solid ${sc.border}`,borderRadius:10,padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"transform .15s,box-shadow .15s",boxShadow:`0 2px 8px ${sc.border}25`}}
                          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow=`0 6px 18px ${sc.border}35`;}}
                          onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=`0 2px 8px ${sc.border}25`;}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:sc.dot,flexShrink:0}}/>
                          <Avatar src={a?.patient?.profilePicture} initials={getInitials(fn,ln)||"P"} size={30} color={sc.border}/>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:700,color:sc.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{fn} {ln}</div>
                            <div style={{fontSize:11,color:sc.text,opacity:.7,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{apptReason(a)||"—"}</div>
                          </div>
                          <span style={{fontSize:10.5,fontWeight:700,background:"rgba(255,255,255,.6)",color:sc.text,border:`1px solid ${sc.pill}`,borderRadius:100,padding:"2px 9px",flexShrink:0,whiteSpace:"nowrap"}}>{a.status}</span>
                        </div>
                      );
                    })
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Week View ────────────────────────────────────────────────────────────
const WeekView = ({ date, appointments, onSelectAppt, onSelectDay }) => {
  const todayStr  = toDateStr(new Date());
  // Get Monday of the week
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - day); // Sunday start

  const weekDays = Array.from({length:7}, (_,i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate()+i);
    return d;
  });

  return (
    <div style={{flex:1,overflowY:"auto"}}>
      {/* Day headers */}
      <div style={{display:"grid",gridTemplateColumns:"64px repeat(7,1fr)",borderBottom:"1.5px solid #f1f5f9",position:"sticky",top:0,background:"rgba(255,255,255,.95)",backdropFilter:"blur(8px)",zIndex:2}}>
        <div style={{padding:"10px 0"}}/>
        {weekDays.map((d,i) => {
          const ds = toDateStr(d);
          const isToday = ds === todayStr;
          const cnt = appointments.filter(a => apptDate(a) === ds).length;
          return (
            <div key={i} onClick={()=>onSelectDay(d)} style={{textAlign:"center",padding:"8px 4px",cursor:"pointer",borderLeft:"1px solid #f1f5f9",transition:"background .15s",borderRadius:8}}
              onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
              onMouseLeave={e=>e.currentTarget.style.background=""}>
              <div style={{fontSize:10.5,fontWeight:700,color:C.slateXL,textTransform:"uppercase",letterSpacing:.5}}>{DAYS[d.getDay()]}</div>
              <div style={{width:30,height:30,borderRadius:"50%",background:isToday?`linear-gradient(135deg,${C.green},${C.greenDk})`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",margin:"4px auto 2px",transition:"background .2s"}}>
                <span style={{fontSize:15,fontWeight:900,fontFamily:"'Sora',sans-serif",color:isToday?"#fff":C.slate}}>{d.getDate()}</span>
              </div>
              {cnt > 0 && <div style={{width:6,height:6,borderRadius:"50%",background:C.green,margin:"0 auto"}}/>}
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div>
        {TIME_SLOTS.map(slot => (
          <div key={slot} style={{display:"grid",gridTemplateColumns:"64px repeat(7,1fr)",minHeight:68,borderBottom:"1px solid #f8fafc"}}>
            <div style={{padding:"14px 8px 0",textAlign:"right"}}>
              <span style={{fontSize:11,fontWeight:600,color:C.slateXL}}>{slot}</span>
            </div>
            {weekDays.map((d,i) => {
              const ds = toDateStr(d);
              const slotAppts = appointments.filter(a => apptDate(a) === ds && apptTime(a)?.trim().toUpperCase() === slot.toUpperCase());
              return (
                <div key={i} style={{borderLeft:"1px solid #f1f5f9",padding:"6px 4px",display:"flex",flexDirection:"column",gap:3}}>
                  {slotAppts.map(a => {
                    const sc = STATUS_COLORS[a.status] || STATUS_COLORS.PENDING;
                    const fn = apptPatFn(a); const ln = apptPatLn(a);
                    return (
                      <div key={a.id} onClick={()=>onSelectAppt(a)} style={{background:sc.bg,border:`1.5px solid ${sc.border}`,borderRadius:8,padding:"5px 8px",cursor:"pointer",transition:"transform .15s"}}
                        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"}
                        onMouseLeave={e=>e.currentTarget.style.transform=""}>
                        <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:sc.dot,flexShrink:0}}/>
                          <span style={{fontSize:10.5,fontWeight:700,color:sc.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{fn} {ln}</span>
                        </div>
                        <span style={{fontSize:9.5,color:sc.text,opacity:.75}}>{a.status}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Month View ───────────────────────────────────────────────────────────
const MonthView = ({ date, appointments, onSelectDay }) => {
  const todayStr = toDateStr(new Date());
  const year  = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{flex:1,padding:"12px 16px",overflowY:"auto"}}>
      {/* Day headers */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:8}}>
        {DAYS.map(d => (
          <div key={d} style={{textAlign:"center",fontSize:11,fontWeight:700,color:C.slateXL,textTransform:"uppercase",letterSpacing:.5,padding:"4px 0"}}>{d}</div>
        ))}
      </div>
      {/* Calendar grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
        {cells.map((day,i) => {
          if (!day) return <div key={i}/>;
          const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const dayAppts = appointments.filter(a => apptDate(a) === ds);
          const isToday  = ds === todayStr;
          const confirmed = dayAppts.filter(a=>a.status==="CONFIRMED").length;
          const completed = dayAppts.filter(a=>a.status==="COMPLETED").length;
          const cancelled = dayAppts.filter(a=>a.status==="CANCELLED").length;

          return (
            <div key={i} onClick={()=>onSelectDay(new Date(year,month,day))} style={{minHeight:80,borderRadius:12,padding:"8px 8px 6px",border:`1.5px solid ${isToday?C.green:"#f1f5f9"}`,background:isToday?C.greenLt:"rgba(255,255,255,.7)",cursor:"pointer",transition:"all .15s",position:"relative"}}
              onMouseEnter={e=>{e.currentTarget.style.background=isToday?C.greenLt:"#f8fafc";e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,.08)";}}
              onMouseLeave={e=>{e.currentTarget.style.background=isToday?C.greenLt:"rgba(255,255,255,.7)";e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:15,color:isToday?C.green:C.slate,marginBottom:6}}>{day}</div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {confirmed>0 && <div style={{background:"#dcfce7",color:"#14532d",border:"1px solid #16a34a",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:700}}>✓ {confirmed} Confirmed</div>}
                {completed>0 && <div style={{background:"#dbeafe",color:"#1e3a8a",border:"1px solid #2563eb",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:700}}>● {completed} Completed</div>}
                {cancelled>0 && <div style={{background:"#fee2e2",color:"#7f1d1d",border:"1px solid #dc2626",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:700}}>✕ {cancelled} Cancelled</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Main CalendarTab Export ──────────────────────────────────────────────
export default function CalendarTab({ appointments }) {
  const today = new Date();
  const [viewMode,     setViewMode]     = useState("day");    // day | week | month
  const [currentDate,  setCurrentDate]  = useState(today);
  const [selectedAppt, setSelectedAppt] = useState(null);

  // ── Navigation ───────────────────────────────────────────────────────
  const navigate = useCallback((dir) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (viewMode === "day")   d.setDate(d.getDate() + dir);
      if (viewMode === "week")  d.setDate(d.getDate() + dir*7);
      if (viewMode === "month") d.setMonth(d.getMonth() + dir);
      return d;
    });
  }, [viewMode]);

  const goToday = () => setCurrentDate(new Date());

  // ── Header label ─────────────────────────────────────────────────────
  const headerLabel = () => {
    if (viewMode === "day") {
      const isToday = toDateStr(currentDate) === toDateStr(today);
      return `${DAYS[currentDate.getDay()]}, ${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}${isToday?" — Today":""}`;
    }
    if (viewMode === "week") {
      const s = new Date(currentDate); s.setDate(s.getDate()-s.getDay());
      const e = new Date(s); e.setDate(e.getDate()+6);
      if (s.getMonth()===e.getMonth()) return `${MONTHS[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
      return `${MONTHS[s.getMonth()]} ${s.getDate()} – ${MONTHS[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
    }
    return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  // ── Stats for today ───────────────────────────────────────────────────
  const todayStr    = toDateStr(today);
  const todayAppts  = appointments.filter(a => apptDate(a) === todayStr);
  const statCounts  = {
    confirmed: todayAppts.filter(a=>a.status==="CONFIRMED").length,
    completed: todayAppts.filter(a=>a.status==="COMPLETED").length,
    cancelled: todayAppts.filter(a=>a.status==="CANCELLED").length,
  };

  return (
    <div style={{padding:"24px 32px 56px",maxWidth:1120,margin:"0 auto"}}>

      {/* ── Page header ── */}
      <div style={{marginBottom:20}}>
        <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:900,color:"#0f172a",marginBottom:4}}>Calendar</h2>
        <p style={{fontSize:13,color:"#64748b"}}>Manage and view your appointment calendar</p>
      </div>

      {/* ── Today's stats strip ── */}
      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        {[
          {label:"Today's Total",  val:todayAppts.length,      bg:"#f8fafc",  color:"#0f172a",  border:"#e2e8f0"},
          {label:"Confirmed",      val:statCounts.confirmed,   bg:"#dcfce7",  color:"#14532d",  border:"#16a34a"},
          {label:"Completed",      val:statCounts.completed,   bg:"#dbeafe",  color:"#1e3a8a",  border:"#2563eb"},
          {label:"Cancelled",      val:statCounts.cancelled,   bg:"#fee2e2",  color:"#7f1d1d",  border:"#dc2626"},
        ].map(s=>(
          <div key={s.label} style={{background:s.bg,border:`1.5px solid ${s.border}`,borderRadius:14,padding:"12px 20px",display:"flex",alignItems:"center",gap:10,flex:"1 1 120px"}}>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:900,color:s.color,lineHeight:1}}>{s.val}</div>
            <div style={{fontSize:12,fontWeight:700,color:s.color,opacity:.75}}>{s.label}</div>
          </div>
        ))}

        {/* Legend */}
        <div style={{background:"rgba(255,255,255,.8)",border:"1.5px solid rgba(226,232,240,.85)",borderRadius:14,padding:"12px 18px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",flex:"2 1 220px"}}>
          {[
            {label:"Confirmed", color:"#16a34a"},
            {label:"Completed", color:"#2563eb"},
            {label:"Cancelled", color:"#dc2626"},
          ].map(({label,color})=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:color,flexShrink:0}}/>
              <span style={{fontSize:12,fontWeight:600,color:"#334155"}}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Calendar card ── */}
      <div style={{background:"rgba(255,255,255,.85)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",border:"1.5px solid rgba(255,255,255,.95)",borderRadius:20,boxShadow:"0 4px 24px rgba(5,150,105,.08)",display:"flex",flexDirection:"column",minHeight:560,overflow:"hidden"}}>

        {/* Toolbar */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 20px",borderBottom:"1.5px solid #f1f5f9",flexWrap:"wrap"}}>
          {/* Prev / Today / Next */}
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <button onClick={()=>navigate(-1)} style={{width:34,height:34,borderRadius:10,border:"1.5px solid #e2e8f0",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#334155",fontWeight:700,transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="#f1f5f9";}}
              onMouseLeave={e=>{e.currentTarget.style.background="#fff";}}>‹</button>
            <button onClick={goToday} style={{padding:"7px 16px",borderRadius:10,border:"1.5px solid #e2e8f0",background:"#fff",cursor:"pointer",fontSize:12.5,fontWeight:700,color:"#334155",transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=C.greenLt;e.currentTarget.style.borderColor=C.green;e.currentTarget.style.color=C.green;}}
              onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.borderColor="#e2e8f0";e.currentTarget.style.color="#334155";}}>Today</button>
            <button onClick={()=>navigate(1)} style={{width:34,height:34,borderRadius:10,border:"1.5px solid #e2e8f0",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#334155",fontWeight:700,transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="#f1f5f9";}}
              onMouseLeave={e=>{e.currentTarget.style.background="#fff";}}>›</button>
          </div>

          {/* Date label */}
          <div style={{flex:1,fontFamily:"'Sora',sans-serif",fontSize:15,fontWeight:800,color:"#0f172a"}}>{headerLabel()}</div>

          {/* View switcher */}
          <div style={{display:"flex",background:"#f1f5f9",borderRadius:10,padding:3,gap:2}}>
            {["day","week","month"].map(v=>(
              <button key={v} onClick={()=>setViewMode(v)} style={{padding:"6px 14px",borderRadius:8,border:"none",background:viewMode===v?"#fff":"transparent",color:viewMode===v?C.green:"#64748b",fontSize:12.5,fontWeight:700,cursor:"pointer",textTransform:"capitalize",transition:"all .15s",boxShadow:viewMode===v?"0 2px 8px rgba(0,0,0,.08)":"none"}}>{v}</button>
            ))}
          </div>
        </div>

        {/* Calendar body */}
        {viewMode === "day"   && <DayView   date={currentDate} appointments={appointments} onSelectAppt={setSelectedAppt}/>}
        {viewMode === "week"  && <WeekView  date={currentDate} appointments={appointments} onSelectAppt={setSelectedAppt} onSelectDay={d=>{setCurrentDate(d);setViewMode("day");}}/>}
        {viewMode === "month" && <MonthView date={currentDate} appointments={appointments} onSelectDay={d=>{setCurrentDate(d);setViewMode("day");}}/>}
      </div>

      {/* ── Appointment detail modal ── */}
      {selectedAppt && (
        <ApptModal
          appt={selectedAppt}
          onClose={()=>setSelectedAppt(null)}
        />
      )}
    </div>
  );
}
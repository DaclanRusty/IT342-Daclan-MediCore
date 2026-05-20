import { useState, useRef, useEffect } from 'react';
import { C } from './patientConstants';

const NotificationBell = ({ notifications, unreadCount, onMarkAllRead, onMarkRead, onClear, onViewAppt }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const TYPE_COLORS = {
    confirmed: { bg:"#f0fdf4", border:"#bbf7d0", dot:"#059669" },
    completed: { bg:"#eff6ff", border:"#bfdbfe", dot:"#2563eb" },
    cancelled: { bg:"#fef2f2", border:"#fecaca", dot:"#ef4444" },
    rejected:  { bg:"#fef2f2", border:"#fecaca", dot:"#ef4444" },
  };

  const timeAgo = (iso) => {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60)   return "Just now";
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  return (
    <div ref={ref} style={{position:"relative"}}>
      {/* Bell button */}
      <button onClick={()=>{setOpen(o=>!o); if(unreadCount>0) onMarkAllRead();}}
        style={{position:"relative",width:36,height:36,borderRadius:"50%",border:"1.5px solid rgba(226,232,240,.85)",background:"rgba(255,255,255,.8)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .2s",flexShrink:0}}
        onMouseEnter={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.borderColor=C.blue;}}
        onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.8)";e.currentTarget.style.borderColor="rgba(226,232,240,.85)";}}>
        {/* Bell SVG */}
        <svg viewBox="0 0 24 24" fill="none" stroke={open?C.blue:"#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={17} height={17}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span style={{position:"absolute",top:-2,right:-2,minWidth:17,height:17,borderRadius:"50%",background:`linear-gradient(135deg,${C.red},#dc2626)`,color:"#fff",fontSize:9.5,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #fff",padding:"0 3px"}}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{position:"absolute",top:"calc(100% + 10px)",right:0,width:340,background:"#fff",borderRadius:18,boxShadow:"0 20px 60px rgba(0,0,0,.18)",border:"1.5px solid rgba(226,232,240,.85)",zIndex:9999,overflow:"hidden",animation:"fadeUp .2s cubic-bezier(.22,1,.36,1) both"}}>

          {/* Header */}
          <div style={{padding:"14px 18px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontFamily:"'Sora',sans-serif",fontSize:14,fontWeight:800,color:C.slate}}>Notifications</div>
              {notifications.length > 0 && <div style={{fontSize:11,color:C.slateXL,marginTop:1}}>{notifications.length} update{notifications.length!==1?"s":""}</div>}
            </div>
            {notifications.length > 0 && (
              <button onClick={onClear} style={{fontSize:11.5,color:C.slateL,background:"none",border:"none",cursor:"pointer",fontWeight:600,fontFamily:"'DM Sans',sans-serif",padding:"4px 8px",borderRadius:8,transition:"color .15s"}}
                onMouseEnter={e=>e.currentTarget.style.color=C.red}
                onMouseLeave={e=>e.currentTarget.style.color=C.slateL}>
                Clear all
              </button>
            )}
          </div>

          {/* Notification list */}
          <div style={{maxHeight:360,overflowY:"auto"}}>
            {notifications.length === 0 ? (
              <div style={{padding:"36px 20px",textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:8}}>🔔</div>
                <div style={{fontSize:13.5,color:C.slateXL,fontWeight:600}}>No notifications yet</div>
                <div style={{fontSize:12,color:C.slateXL,marginTop:4}}>Updates on your appointments will appear here</div>
              </div>
            ) : (
              notifications.map(n => {
                const tc = TYPE_COLORS[n.type] || TYPE_COLORS.confirmed;
                return (
                  <div key={n.id}
                    onClick={()=>{ onMarkRead(n.id); if(onViewAppt && n.appt) onViewAppt(n.appt); setOpen(false); }}
                    style={{padding:"12px 18px",borderBottom:"1px solid #f8fafc",cursor:"pointer",background:n.read?"#fff":tc.bg,transition:"background .15s",display:"flex",gap:12,alignItems:"flex-start"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                    onMouseLeave={e=>e.currentTarget.style.background=n.read?"#fff":tc.bg}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:tc.bg,border:`1.5px solid ${tc.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>
                      {n.icon}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12.5,fontWeight:700,color:C.slate,marginBottom:2}}>{n.title}</div>
                      <div style={{fontSize:11.5,color:C.slateL,lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{n.message}</div>
                      <div style={{fontSize:10.5,color:C.slateXL,marginTop:4,fontWeight:600}}>{timeAgo(n.timestamp)}</div>
                    </div>
                    {!n.read && <div style={{width:8,height:8,borderRadius:"50%",background:tc.dot,flexShrink:0,marginTop:4}}/>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
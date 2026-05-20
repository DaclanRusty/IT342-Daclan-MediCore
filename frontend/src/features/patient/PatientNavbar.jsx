import { C, TABS, getInitials } from './patientConstants';
import { HomeIcon, CalIcon, DocIcon, UserIcon, LogoutIcon } from './PatientUI';
import NotificationBell from './NotificationBell';

const ICON_MAP = {
  home: <HomeIcon/>,
  cal:  <CalIcon/>,
  doc:  <DocIcon/>,
  user: <UserIcon/>,
};

const PatientNavbar = ({
  active, onTab, onLogout, user, patientProfile,
  notifications, unreadCount, onMarkAllRead, onMarkRead, onClearNotifications, onViewAppt,
}) => {
  const fn = user?.firstname || user?.firstName || "";
  const ln = user?.lastname  || user?.lastName  || "";

  return (
    <>
      <nav style={{position:"sticky",top:0,zIndex:100,height:64,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",background:"rgba(255,255,255,.72)",backdropFilter:"blur(22px)",WebkitBackdropFilter:"blur(22px)",borderBottom:"1px solid rgba(255,255,255,.78)",boxShadow:"0 1px 0 rgba(37,99,235,.06),0 4px 24px rgba(37,99,235,.05)"}}>

        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{width:36,height:36,borderRadius:11,background:`linear-gradient(135deg,${C.blue},${C.blueDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:17,boxShadow:`0 4px 14px rgba(37,99,235,.32)`}}>M</div>
          <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:17,color:C.slate,letterSpacing:"-.3px"}}>Medi<span style={{color:C.blue}}>Core</span></span>
        </div>

        {/* Tabs */}
        <div className="top-tabs" style={{display:"flex",gap:4}}>
          {TABS.map(t => (
            <button key={t.key} className={`tab-btn ${active===t.key?"active":""}`} onClick={()=>onTab(t.key)} style={{color:active===t.key?C.blue:C.slateL}}>
              {ICON_MAP[t.icon]}{t.label}
            </button>
          ))}
        </div>

        {/* Right side — bell + avatar + logout */}
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          {/* Notification Bell */}
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllRead={onMarkAllRead}
            onMarkRead={onMarkRead}
            onClear={onClearNotifications}
            onViewAppt={onViewAppt}
          />

          {/* Avatar */}
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue},${C.blueDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:13,boxShadow:`0 3px 10px rgba(37,99,235,.3)`,overflow:"hidden"}}>
              {patientProfile?.profilePicture
                ? <img src={patientProfile.profilePicture} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : getInitials(fn,ln)||"P"
              }
            </div>
            <div style={{lineHeight:1.2}}>
              <div style={{fontSize:10.5,color:C.slateXL,fontWeight:600}}>Patient</div>
              <div style={{fontSize:13,fontWeight:700,color:C.slate}}>{fn?`${fn} ${ln}`.trim():"Loading…"}</div>
            </div>
          </div>

          <button className="btn-ghost" onClick={onLogout} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 13px",fontSize:13}}>
            <LogoutIcon/> Logout
          </button>
        </div>
      </nav>

      {/* Mobile tabs */}
      <div className="mob-tabs" style={{display:"none",gap:4,padding:"8px 12px",background:"rgba(255,255,255,.72)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.7)",overflowX:"auto"}}>
        {TABS.map(t => (
          <button key={t.key} className={`tab-btn ${active===t.key?"active":""}`} onClick={()=>onTab(t.key)} style={{color:active===t.key?C.blue:C.slateL,fontSize:12,padding:"8px 12px",flexShrink:0}}>
            {ICON_MAP[t.icon]}{t.label}
          </button>
        ))}
      </div>
    </>
  );
};

export default PatientNavbar;
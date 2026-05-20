import { C, TABS, getInitials } from './doctorConstants';
import { AvatarImg, LogoutIcon, CalIcon, HomeIcon, UserIcon, UsersIcon } from './DoctorUI';

const ICON_MAP = {
  home:  <HomeIcon/>,
  cal:   <CalIcon/>,
  user:  <UserIcon/>,
  users: <UsersIcon/>,
};

const DoctorNavbar = ({ active, onTab, onLogout, user, pendingCount, profilePicture }) => {
  const fn = user?.firstname || user?.firstName || "";
  const ln = user?.lastname  || user?.lastName  || "";
  return (
    <>
      <nav style={{position:"sticky",top:0,zIndex:100,height:64,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",background:"rgba(255,255,255,.72)",backdropFilter:"blur(22px)",WebkitBackdropFilter:"blur(22px)",borderBottom:"1px solid rgba(255,255,255,.78)",boxShadow:"0 1px 0 rgba(5,150,105,.06),0 4px 24px rgba(5,150,105,.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{width:36,height:36,borderRadius:11,background:`linear-gradient(135deg,${C.green},${C.greenDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:17,boxShadow:`0 4px 14px rgba(5,150,105,.32)`}}>M</div>
          <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:17,color:C.slate,letterSpacing:"-.3px"}}>Medi<span style={{color:C.green}}>Core</span></span>
        </div>
        <div className="top-tabs" style={{display:"flex",gap:4}}>
          {TABS.map(t => (
            <button key={t.key} className={`tab-btn ${active===t.key?"active":""}`} onClick={()=>onTab(t.key)} style={{color:active===t.key?C.green:C.slateL,position:"relative"}}>
              {ICON_MAP[t.icon]}{t.label}
              {t.key==="secretary" && pendingCount>0 && (
                <span style={{position:"absolute",top:4,right:4,width:8,height:8,borderRadius:"50%",background:C.amber,border:"1.5px solid #fff"}}/>
              )}
            </button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${C.green},${C.greenDk})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:13,boxShadow:`0 3px 10px rgba(5,150,105,.3)`,overflow:"hidden",position:"relative"}}>
              <AvatarImg src={profilePicture} alt="Doctor avatar"/>
              {!profilePicture && (getInitials(fn,ln)||"D")}
            </div>
            <div style={{lineHeight:1.2}}>
              <div style={{fontSize:10.5,color:C.slateXL,fontWeight:600}}>Doctor</div>
              <div style={{fontSize:13,fontWeight:700,color:C.slate}}>{fn?`Dr. ${fn} ${ln}`.trim():"Loading…"}</div>
            </div>
          </div>
          <button className="btn-ghost" onClick={onLogout} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 13px",fontSize:13}}>
            <LogoutIcon/> Logout
          </button>
        </div>
      </nav>
      <div className="mob-tabs" style={{display:"none",gap:4,padding:"8px 12px",background:"rgba(255,255,255,.72)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.7)",overflowX:"auto"}}>
        {TABS.map(t => (
          <button key={t.key} className={`tab-btn ${active===t.key?"active":""}`} onClick={()=>onTab(t.key)} style={{color:active===t.key?C.green:C.slateL,fontSize:12,padding:"8px 12px",flexShrink:0,position:"relative"}}>
            {ICON_MAP[t.icon]}{t.label}
            {t.key==="secretary" && pendingCount>0 && <span style={{position:"absolute",top:4,right:4,width:7,height:7,borderRadius:"50%",background:C.amber}}/>}
          </button>
        ))}
      </div>
    </>
  );
};

export default DoctorNavbar;
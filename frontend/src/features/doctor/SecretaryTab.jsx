import { C, getInitials, secFn, secLn, secEmail } from './doctorConstants';
import { AvatarImg, StatusBadge, CheckIcon, XIcon } from './DoctorUI';

const SecretaryTab = ({ requests, onApprove, onReject, loading }) => {
  const hasApproved = requests.some(r => r.status === "APPROVED");

  return (
    <div className="pw" style={{padding:"24px 32px 56px",maxWidth:1120,margin:"0 auto"}}>
      <div className="au1" style={{marginBottom:20}}>
        <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:900,color:C.slate,marginBottom:4}}>Secretary Requests</h2>
        <p style={{fontSize:13,color:C.slateL}}>Secretaries who selected you during registration</p>
      </div>

      {hasApproved && (
        <div className="au2" style={{background:C.greenLt,border:`1px solid ${C.greenBdr}`,borderRadius:14,padding:"12px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
          <CheckIcon/>
          <span style={{fontSize:13,color:C.green,fontWeight:700}}>You already have an assigned secretary.</span>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {requests.length === 0 ? (
          <div className="glass au3" style={{padding:56,textAlign:"center",color:C.slateXL,fontSize:14}}>
            <div style={{fontSize:36,marginBottom:10}}>👤</div>No secretary requests yet.
          </div>
        ) : requests.map((req, i) => (
          <div key={req.secretaryId} className="appt-card au3" style={{padding:"20px 24px",display:"flex",alignItems:"center",gap:16,animationDelay:`${i*.05}s`}}>
            <div style={{width:52,height:52,borderRadius:"50%",background:`linear-gradient(135deg,${C.purple},#6d28d9)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,flexShrink:0,overflow:"hidden"}}>
              <AvatarImg src={req.profilePicture} alt=""/>
              {!req.profilePicture && (getInitials(secFn(req),secLn(req))||"S")}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15.5,color:C.slate}}>{secFn(req)} {secLn(req)}</div>
              <div style={{fontSize:13,color:C.slateL,marginTop:2}}>{secEmail(req)}</div>
              {req.phoneNumber && <div style={{fontSize:12,color:C.slateXL,marginTop:2}}>{req.phoneNumber}</div>}
              {req.requestedAt && <div style={{fontSize:12,color:C.slateXL,marginTop:2}}>Requested: {new Date(req.requestedAt).toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric"})}</div>}
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
              <StatusBadge status={req.status}/>
              {req.status==="PENDING" && !hasApproved && (
                <div style={{display:"flex",gap:8}}>
                  <button className="btn-primary" onClick={()=>onApprove(req.secretaryId)} disabled={loading} style={{padding:"7px 14px",fontSize:12,gap:5}}>
                    <CheckIcon/> Approve
                  </button>
                  <button className="btn-danger" onClick={()=>onReject(req.secretaryId)} disabled={loading} style={{padding:"7px 14px",fontSize:12,gap:5}}>
                    <XIcon/> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecretaryTab;
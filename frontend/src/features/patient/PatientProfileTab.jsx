import { useState, useEffect } from 'react';
import { patientApi } from '../shared/api';
import { C, getInitials } from './patientConstants';
import { Spinner, PencilIcon, SaveIcon, EyeOnIcon, EyeOffIcon } from './PatientUI';

const PatientProfileTab = ({ user, onPictureUpdate }) => {
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [fetchErr, setFetchErr] = useState("");
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saveErr,  setSaveErr]  = useState("");
  const [saveOk,   setSaveOk]   = useState(false);
  const [form,     setForm]     = useState({ firstName:"", lastName:"", phoneNumber:"", dateOfBirth:"", gender:"", address:"", currentPassword:"", newPassword:"", confirmPassword:"" });
  const [showPw,   setShowPw]   = useState({ cur:false, new:false, con:false });

  useEffect(() => {
    (async () => {
      setLoading(true); setFetchErr("");
      try {
        const data = await patientApi.getProfile();
        setProfile(data);
        setForm({ firstName:data.firstName||"", lastName:data.lastName||"", phoneNumber:data.phoneNumber||"", dateOfBirth:data.dateOfBirth||"", gender:data.gender||"", address:data.address||"", currentPassword:"", newPassword:"", confirmPassword:"" });
      } catch(e) { setFetchErr(e.message||"Failed to load profile."); }
      finally { setLoading(false); }
    })();
  }, []);

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));

  const cancelEdit = () => {
    setSaveErr("");
    setForm(f=>({...f,firstName:profile.firstName||"",lastName:profile.lastName||"",phoneNumber:profile.phoneNumber||"",dateOfBirth:profile.dateOfBirth||"",gender:profile.gender||"",address:profile.address||"",currentPassword:"",newPassword:"",confirmPassword:""}));
    setEditing(false);
  };

  const handleSave = async () => {
    setSaveErr(""); setSaveOk(false);
    if (!form.firstName.trim()||!form.lastName.trim()) { setSaveErr("First name and last name are required."); return; }
    if (form.newPassword&&form.newPassword!==form.confirmPassword) { setSaveErr("New passwords do not match."); return; }
    if (form.newPassword&&form.newPassword.length<8) { setSaveErr("New password must be at least 8 characters."); return; }
    if (form.newPassword&&!form.currentPassword) { setSaveErr("Please enter your current password to set a new one."); return; }
    setSaving(true);
    try {
      const payload = { firstName:form.firstName.trim(), lastName:form.lastName.trim(), phoneNumber:form.phoneNumber.trim(), dateOfBirth:form.dateOfBirth||null, gender:form.gender||null, address:form.address.trim()||null, ...(form.newPassword?{currentPassword:form.currentPassword,newPassword:form.newPassword}:{}) };
      const updated = await patientApi.updateProfile(payload);
      setProfile(updated); setEditing(false); setSaveOk(true);
      setTimeout(()=>setSaveOk(false),3500);
      setForm(f=>({...f,currentPassword:"",newPassword:"",confirmPassword:""}));
    } catch(e) { setSaveErr(e.message||"Failed to save changes."); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:80,gap:10,color:C.slateL,fontSize:14,fontWeight:600}}><Spinner/> Loading profile…</div>;
  if (fetchErr) return (
    <div style={{padding:"32px",maxWidth:760,margin:"0 auto"}}>
      <div style={{background:C.redLt,border:`1.5px solid ${C.redBdr}`,borderRadius:14,padding:"16px 20px",color:"#991b1b",fontWeight:600,fontSize:13.5,display:"flex",alignItems:"center",gap:10}}>
        ⚠️ {fetchErr}<button onClick={()=>window.location.reload()} style={{marginLeft:12,background:"none",border:"none",color:C.blue,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13}}>Retry</button>
      </div>
    </div>
  );

  const fn = profile?.firstName||"";
  const ln = profile?.lastName||"";

  const FieldRow = ({label,value,last=false}) => (
    <div style={{padding:"13px 0",borderBottom:last?"none":"1px solid rgba(226,232,240,.5)"}}>
      <div style={{fontSize:11,fontWeight:700,color:C.slateXL,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>{label}</div>
      <div style={{fontSize:14.5,color:C.slateM,fontWeight:500}}>{value||<span style={{color:C.slateXL,fontStyle:"italic"}}>Not provided</span>}</div>
    </div>
  );

  const EditField = ({label,children,hint}) => (
    <div>
      <label style={{fontSize:12.5,fontWeight:700,color:C.slateM,display:"block",marginBottom:6}}>{label}</label>
      {children}
      {hint&&<p style={{fontSize:11.5,color:C.slateXL,marginTop:4}}>{hint}</p>}
    </div>
  );

  return (
    <div className="pw" style={{padding:"24px 32px 56px",maxWidth:760,margin:"0 auto"}}>
      {saveOk && <div className="au1" style={{background:C.greenLt,border:`1.5px solid ${C.greenBdr}`,borderRadius:14,padding:"12px 18px",display:"flex",alignItems:"center",gap:10,marginBottom:16,color:"#166534",fontWeight:700,fontSize:13.5}}>✅ Profile updated successfully!</div>}
      <div className="glass au2" style={{padding:"28px 32px",marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:24,flexWrap:"wrap"}}>
          <div style={{position:"relative",flexShrink:0}}>
            <div style={{width:78,height:78,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:26,boxShadow:`0 6px 20px rgba(37,99,235,.28)`,overflow:"hidden"}}>
              {profile?.profilePicture
                ? <img src={profile.profilePicture} alt="Profile" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : getInitials(fn,ln)||"P"
              }
            </div>
            <label style={{position:"absolute",bottom:0,right:0,width:26,height:26,borderRadius:"50%",background:C.blue,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,.2)",border:"2px solid #fff"}}>
              <input type="file" accept="image/*" style={{display:"none"}} onChange={async(e)=>{
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 2*1024*1024) { setSaveErr("Image must be under 2MB."); return; }
                const reader = new FileReader();
                reader.onload = async(ev) => {
                  try {
                    const updated = await patientApi.uploadProfilePicture(ev.target.result);
                    setProfile(updated);
                    if (onPictureUpdate) onPictureUpdate();
                    setSaveOk(true); setTimeout(()=>setSaveOk(false),3500);
                  } catch(err) { setSaveErr(err.message||"Failed to upload picture."); }
                };
                reader.readAsDataURL(file);
              }}/>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" width={12} height={12}>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
            </label>
          </div>
          <div style={{flex:1,minWidth:160}}>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:21,fontWeight:900,color:C.slate}}>{fn} {ln}</div>
            <div style={{fontSize:13.5,color:C.slateL,marginTop:2}}>{profile?.email}</div>
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <span style={{background:C.blueLt,color:C.blue,border:`1px solid ${C.blueBdr}`,borderRadius:100,padding:"3px 11px",fontSize:11.5,fontWeight:700}}>Patient</span>
              <span style={{background:profile?.status==="ACTIVE"?C.greenLt:"#f1f5f9",color:profile?.status==="ACTIVE"?C.green:C.slateL,border:`1px solid ${profile?.status==="ACTIVE"?C.greenBdr:"#cbd5e1"}`,borderRadius:100,padding:"3px 11px",fontSize:11.5,fontWeight:700}}>{profile?.status||"ACTIVE"}</span>
            </div>
          </div>
          {!editing ? (
            <button className="btn-primary" onClick={()=>{setSaveErr("");setEditing(true);}} style={{display:"flex",alignItems:"center",gap:7,padding:"10px 20px",fontSize:13.5}}><PencilIcon/> Edit Profile</button>
          ) : (
            <div style={{display:"flex",gap:8}}>
              <button className="btn-ghost" onClick={cancelEdit} disabled={saving} style={{padding:"9px 16px",fontSize:13}}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{display:"flex",alignItems:"center",gap:7,padding:"10px 20px",fontSize:13.5}}>
                {saving?<><Spinner size={15} color="#fff"/> Saving…</>:<><SaveIcon/> Save Changes</>}
              </button>
            </div>
          )}
        </div>
        {saveErr && <div style={{background:C.redLt,border:`1.5px solid ${C.redBdr}`,borderRadius:12,padding:"11px 16px",color:"#991b1b",fontWeight:600,fontSize:13,marginBottom:18,display:"flex",alignItems:"center",gap:8}}>⚠️ {saveErr}</div>}

        {!editing && (
          <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20,marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:700,color:C.slateM,marginBottom:16,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>👤</span> Personal Information</div>
            <FieldRow label="Full Name" value={`${fn} ${ln}`.trim()}/>
            <FieldRow label="Email Address" value={profile?.email}/>
            <FieldRow label="Phone Number" value={profile?.phoneNumber}/>
            <FieldRow label="Member Since" value={profile?.createdAt?new Date(profile.createdAt).toLocaleDateString("en-PH",{year:"numeric",month:"long",day:"numeric"}):null}/>
            <FieldRow label="Date of Birth" value={profile?.dateOfBirth?new Date(profile.dateOfBirth).toLocaleDateString("en-PH",{year:"numeric",month:"long",day:"numeric"}):null}/>
            <FieldRow label="Gender" value={profile?.gender}/>
            <FieldRow label="Address" value={profile?.address} last/>
          </div>
        )}

        {editing && (
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20,marginBottom:24}}>
              <div style={{fontSize:13,fontWeight:700,color:C.slateM,marginBottom:18,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>👤</span> Personal Information</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <EditField label="First Name"><input className="input-field" value={form.firstName} onChange={set("firstName")} placeholder="First name"/></EditField>
                <EditField label="Last Name"><input className="input-field" value={form.lastName} onChange={set("lastName")} placeholder="Last name"/></EditField>
              </div>
              <div style={{marginBottom:14}}>
                <EditField label="Phone Number" hint="Optional — e.g. +63 000 000 0000">
                  <input className="input-field" value={form.phoneNumber} onChange={e=>{let d=e.target.value.replace(/\D/g,"");if(d.startsWith("0"))d="63"+d.slice(1);if(d.startsWith("63")){const l=d.slice(2,12);let f="+63";if(l.length>0)f+=" "+l.slice(0,3);if(l.length>3)f+=" "+l.slice(3,6);if(l.length>6)f+=" "+l.slice(6,10);set("phoneNumber")({target:{value:f}});}else set("phoneNumber")({target:{value:d?"+"+d:""}});}} placeholder="+63 000 000 0000" maxLength={16}/>
                </EditField>
              </div>
              <div>
                <label style={{fontSize:12.5,fontWeight:700,color:C.slateXL,display:"block",marginBottom:6}}>Email Address</label>
                <div style={{padding:"10px 14px",borderRadius:11,border:"1.5px solid rgba(226,232,240,.6)",background:"rgba(241,245,249,.6)",fontSize:14,color:C.slateXL,fontStyle:"italic"}}>{profile?.email} <span style={{fontSize:11.5}}>(cannot be changed)</span></div>
              </div>
            </div>
            <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20,marginBottom:24}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <EditField label="Date of Birth"><input type="date" className="input-field" value={form.dateOfBirth} onChange={set("dateOfBirth")}/></EditField>
                <EditField label="Gender">
                  <select className="input-field" value={form.gender} onChange={set("gender")}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option><option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </EditField>
              </div>
              <EditField label="Address"><textarea className="input-field" rows={3} value={form.address} onChange={set("address")} placeholder="Street, City, Province"/></EditField>
            </div>
            <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20}}>
              <div style={{fontSize:13,fontWeight:700,color:C.slateM,marginBottom:6,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>🔒</span> Change Password</div>
              <p style={{fontSize:12.5,color:C.slateXL,marginBottom:16}}>Leave blank if you don't want to change your password.</p>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {[{label:"Current Password",key:"currentPassword",vis:"cur"},{label:"New Password",key:"newPassword",vis:"new",hint:"Minimum 8 characters"},{label:"Confirm New Password",key:"confirmPassword",vis:"con"}].map(({label,key,vis,hint})=>(
                  <EditField key={key} label={label} hint={hint}>
                    <div style={{position:"relative"}}>
                      <input type={showPw[vis]?"text":"password"} className="input-field" value={form[key]} onChange={set(key)} placeholder={label} style={{paddingRight:42}}/>
                      <button type="button" onClick={()=>setShowPw(p=>({...p,[vis]:!p[vis]}))} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.slateXL,display:"flex",alignItems:"center"}}>
                        {showPw[vis]?<EyeOnIcon/>:<EyeOffIcon/>}
                      </button>
                    </div>
                  </EditField>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {!editing && (
        <div className="glass-sm au3" style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:38,height:38,borderRadius:12,background:C.blueLt,border:`1px solid ${C.blueBdr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>🔒</div>
          <div>
            <div style={{fontSize:13.5,fontWeight:700,color:C.slate,marginBottom:2}}>Account Security</div>
            <div style={{fontSize:12.5,color:C.slateL}}>Your account is secured via Google OAuth or JWT authentication.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfileTab;
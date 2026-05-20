import { useState, useEffect } from 'react';
import { doctorApi } from '../shared/api';
import { C, getInitials, SPECS } from './doctorConstants';
import { AvatarImg, Spinner, ErrBanner, PencilIcon, SaveIcon, EyeOnIcon, EyeOffIcon } from './DoctorUI';

const ProfileTab = ({ onSaved }) => {
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [fetchErr, setFetchErr] = useState("");
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saveErr,  setSaveErr]  = useState("");
  const [form,     setForm]     = useState({
    firstName:"", lastName:"", phoneNumber:"", specialization:"",
    yearsOfExperience:"", bio:"", currentPassword:"", newPassword:"", confirmPassword:"",
  });
  const [showPw, setShowPw] = useState({ cur:false, new:false, con:false });

  useEffect(() => {
    (async () => {
      setLoading(true); setFetchErr("");
      try {
        const d = await doctorApi.getProfile();
        setProfile(d);
        setForm({
          firstName: d.firstName||"", lastName: d.lastName||"",
          phoneNumber: d.phoneNumber||"", specialization: d.specialization||"",
          yearsOfExperience: d.yearsOfExperience != null ? String(d.yearsOfExperience) : "",
          bio: d.bio||"", currentPassword:"", newPassword:"", confirmPassword:"",
        });
      } catch(e) { setFetchErr(e.message||"Failed to load profile."); }
      finally { setLoading(false); }
    })();
  }, []);

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));

  const cancelEdit = () => {
    if (profile) setForm({
      firstName: profile.firstName||"", lastName: profile.lastName||"",
      phoneNumber: profile.phoneNumber||"", specialization: profile.specialization||"",
      yearsOfExperience: profile.yearsOfExperience != null ? String(profile.yearsOfExperience) : "",
      bio: profile.bio||"", currentPassword:"", newPassword:"", confirmPassword:"",
    });
    setSaveErr(""); setEditing(false);
  };

  const handleSave = async () => {
    setSaveErr("");
    if (form.newPassword && !form.currentPassword) { setSaveErr("Enter current password to change it."); return; }
    if (form.newPassword && form.newPassword.length < 8) { setSaveErr("New password must be at least 8 characters."); return; }
    if (form.newPassword && form.newPassword !== form.confirmPassword) { setSaveErr("New passwords do not match."); return; }
    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName, lastName: form.lastName,
        phoneNumber: form.phoneNumber, specialization: form.specialization,
        yearsOfExperience: form.yearsOfExperience !== '' ? Number(form.yearsOfExperience) : null,
        bio: form.bio,
        ...(form.newPassword ? { currentPassword: form.currentPassword, newPassword: form.newPassword } : {}),
      };
      const updated = await doctorApi.updateProfile(payload);
      setProfile(updated);
      setEditing(false);
      setForm(f => ({...f, currentPassword:"", newPassword:"", confirmPassword:""}));
      onSaved("Profile updated successfully!", updated);
    } catch(e) { setSaveErr(e.message||"Failed to save changes."); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:80,gap:10,color:C.slateL,fontSize:14,fontWeight:600}}><Spinner/> Loading profile…</div>;
  if (fetchErr) return <div style={{padding:"32px",maxWidth:760,margin:"0 auto"}}><ErrBanner msg={fetchErr}/></div>;

  const fn = profile?.firstName || "";
  const ln = profile?.lastName  || "";

  const FieldRow = ({label, value, last=false}) => (
    <div style={{padding:"13px 0",borderBottom:last?"none":"1px solid rgba(226,232,240,.5)"}}>
      <div style={{fontSize:11,fontWeight:700,color:C.slateXL,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>{label}</div>
      <div style={{fontSize:14.5,color:C.slateM,fontWeight:500}}>{value||<span style={{color:C.slateXL,fontStyle:"italic"}}>Not provided</span>}</div>
    </div>
  );

  const EditField = ({label, children, hint}) => (
    <div>
      <label style={{fontSize:12.5,fontWeight:700,color:C.slateM,display:"block",marginBottom:6}}>{label}</label>
      {children}
      {hint && <p style={{fontSize:11.5,color:C.slateXL,marginTop:4}}>{hint}</p>}
    </div>
  );

  return (
    <div className="pw" style={{padding:"24px 32px 56px",maxWidth:760,margin:"0 auto"}}>
      <div className="glass au2" style={{padding:"28px 32px",marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:24,flexWrap:"wrap"}}>
          <div style={{position:"relative",flexShrink:0}}>
            <div style={{width:78,height:78,borderRadius:"50%",background:`linear-gradient(135deg,${C.green},${C.teal})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:900,fontSize:26,boxShadow:`0 6px 20px rgba(5,150,105,.28)`,overflow:"hidden"}}>
              <AvatarImg src={profile?.profilePicture} alt="Profile"/>
              {!profile?.profilePicture && (getInitials(fn,ln)||"D")}
            </div>
            <label style={{position:"absolute",bottom:0,right:0,width:26,height:26,borderRadius:"50%",background:C.green,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,.2)",border:"2px solid #fff"}}>
              <input type="file" accept="image/*" style={{display:"none"}} onChange={async(e)=>{
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 2*1024*1024) { setSaveErr("Image must be under 2MB."); return; }
                const reader = new FileReader();
                reader.onload = async(ev) => {
                  try {
                    await doctorApi.uploadProfilePicture(ev.target.result);
                    const updated = await doctorApi.getProfile();
                    setProfile(updated);
                    onSaved("Profile picture updated!", updated);
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
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:21,fontWeight:900,color:C.slate}}>Dr. {fn} {ln}</div>
            <div style={{fontSize:13.5,color:C.slateL,marginTop:2}}>{profile?.email}</div>
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <span style={{background:C.greenLt,color:C.green,border:`1px solid ${C.greenBdr}`,borderRadius:100,padding:"3px 11px",fontSize:11.5,fontWeight:700}}>Doctor</span>
              {profile?.specialization && <span style={{background:C.tealLt,color:C.teal,border:`1px solid ${C.tealBdr}`,borderRadius:100,padding:"3px 11px",fontSize:11.5,fontWeight:700}}>{profile.specialization}</span>}
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
          <>
            <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20,marginBottom:24}}>
              <div style={{fontSize:13,fontWeight:700,color:C.slateM,marginBottom:16,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>👤</span> Personal Information</div>
              <FieldRow label="Full Name" value={`Dr. ${fn} ${ln}`.trim()}/>
              <FieldRow label="Email Address" value={profile?.email}/>
              <FieldRow label="Phone Number" value={profile?.phoneNumber}/>
            </div>
            <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20,marginBottom:24}}>
              <div style={{fontSize:13,fontWeight:700,color:C.slateM,marginBottom:16,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>🩺</span> Professional Information</div>
              <FieldRow label="Specialization" value={profile?.specialization}/>
              <FieldRow label="Years of Experience" value={profile?.yearsOfExperience!=null?`${profile.yearsOfExperience} years`:null}/>
              <FieldRow label="Bio / Description" value={profile?.bio} last/>
            </div>
          </>
        )}

        {editing && (
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20,marginBottom:24}}>
              <div style={{fontSize:13,fontWeight:700,color:C.slateM,marginBottom:18,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>👤</span> Personal Information</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <EditField label="First Name"><input className="input-field" value={form.firstName} onChange={set("firstName")} placeholder="First name"/></EditField>
                <EditField label="Last Name"><input className="input-field" value={form.lastName} onChange={set("lastName")} placeholder="Last name"/></EditField>
              </div>
              <EditField label="Phone Number" hint="Optional — e.g. +63 000 000 0000">
                <input className="input-field" value={form.phoneNumber} onChange={set("phoneNumber")} placeholder="+63 000 000 0000"/>
              </EditField>
            </div>
            <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20,marginBottom:24}}>
              <div style={{fontSize:13,fontWeight:700,color:C.slateM,marginBottom:18,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>🩺</span> Professional Information</div>
              <div style={{marginBottom:14}}>
                <EditField label="Specialization">
                  <select className="input-field" value={form.specialization} onChange={set("specialization")}>
                    <option value="">Select specialization</option>
                    {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </EditField>
              </div>
              <div style={{marginBottom:14}}>
                <EditField label="Years of Experience" hint="Optional">
                  <input type="number" min="0" max="70" className="input-field" value={form.yearsOfExperience} onChange={set("yearsOfExperience")} placeholder="e.g. 5"/>
                </EditField>
              </div>
              <EditField label="Bio / Description" hint="Optional">
                <textarea className="input-field" rows={3} value={form.bio} onChange={set("bio")} placeholder="e.g. Board-certified cardiologist…"/>
              </EditField>
            </div>
            <div style={{borderTop:"1.5px solid rgba(226,232,240,.6)",paddingTop:20}}>
              <div style={{fontSize:13,fontWeight:700,color:C.slateM,marginBottom:6,display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>🔒</span> Change Password</div>
              <p style={{fontSize:12.5,color:C.slateXL,marginBottom:16}}>Leave blank if you don't want to change your password.</p>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {[
                  {label:"Current Password",    key:"currentPassword", vis:"cur"},
                  {label:"New Password",         key:"newPassword",     vis:"new", hint:"Minimum 8 characters"},
                  {label:"Confirm New Password", key:"confirmPassword", vis:"con"},
                ].map(({label,key,vis,hint}) => (
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
          <div style={{width:38,height:38,borderRadius:12,background:C.greenLt,border:`1px solid ${C.greenBdr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>🔒</div>
          <div>
            <div style={{fontSize:13.5,fontWeight:700,color:C.slate,marginBottom:2}}>Account Security</div>
            <div style={{fontSize:12.5,color:C.slateL}}>Your account is secured via Google OAuth or JWT authentication.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;
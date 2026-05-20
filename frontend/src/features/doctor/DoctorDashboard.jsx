import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { doctorApi } from '../shared/api';

// ── Feature tabs ──────────────────────────────────────────────────────────
import DashboardTab    from './DashboardTab';
import AppointmentsTab from './AppointmentsTab';
import CalendarTab     from './CalendarTab';
import SecretaryTab    from './SecretaryTab';
import ProfileTab      from './ProfileTab';

// ── Shared UI ─────────────────────────────────────────────────────────────
import DoctorNavbar          from './DoctorNavbar';
import { GlobalStyles, Toast, Cloud } from './DoctorUI';
import { C } from './doctorConstants';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const [tab,               setTab]               = useState("dashboard");
  const [toast,             setToast]             = useState(null);
  const [appointments,      setAppointments]      = useState([]);
  const [secretaryRequests, setSecretaryRequests] = useState([]);
  const [loadingAction,     setLoadingAction]     = useState(false);
  const [doctorProfile,     setDoctorProfile]     = useState(null);

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchAppointments = useCallback(async () => {
    try { const d = await doctorApi.getAppointments(); setAppointments(Array.isArray(d) ? d : []); }
    catch { setAppointments([]); }
  }, []);

  const fetchSecretaryRequests = useCallback(async () => {
    try { const d = await doctorApi.getSecretaryRequests(); setSecretaryRequests(Array.isArray(d) ? d : []); }
    catch { setSecretaryRequests([]); }
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchSecretaryRequests();
    doctorApi.getProfile()
      .then(d => {
        setDoctorProfile(d);
        if (d?.profilePicture !== undefined) updateUser({ profilePicture: d.profilePicture });
      })
      .catch(() => {});
  }, [fetchAppointments, fetchSecretaryRequests]);

  const handleComplete = async (id, doctorNotes) => {
    setLoadingAction(true);
    try { await doctorApi.completeAppointment(id, doctorNotes); showToast("Appointment marked as completed!"); fetchAppointments(); }
    catch(e) { showToast(e.message, "error"); }
    finally { setLoadingAction(false); }
  };

  const handleCancel = async (id, cancelReason) => {
    setLoadingAction(true);
    try { await doctorApi.cancelAppointment(id, cancelReason); showToast("Appointment cancelled."); fetchAppointments(); }
    catch(e) { showToast(e.message, "error"); }
    finally { setLoadingAction(false); }
  };

  const handleApproveSecretary = async (secretaryId) => {
    setLoadingAction(true);
    try { await doctorApi.approveSecretary(secretaryId); showToast("Secretary approved and assigned!"); fetchSecretaryRequests(); }
    catch(e) { showToast(e.message, "error"); }
    finally { setLoadingAction(false); }
  };

  const handleRejectSecretary = async (secretaryId) => {
    setLoadingAction(true);
    try { await doctorApi.rejectSecretary(secretaryId); showToast("Secretary request rejected."); fetchSecretaryRequests(); }
    catch(e) { showToast(e.message, "error"); }
    finally { setLoadingAction(false); }
  };

  const handleLogout = async () => { try { await logout(); } catch {} finally { navigate("/login"); } };

  const handleProfileSaved = (msg) => {
    showToast(msg);
    doctorApi.getProfile()
      .then(d => {
        setDoctorProfile(d);
        if (d?.profilePicture !== undefined) updateUser({ profilePicture: d.profilePicture });
      })
      .catch(() => {});
  };

  const pendingCount = secretaryRequests.filter(r => r.status === "PENDING").length;

  return (
    <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",minHeight:"100vh",background:"linear-gradient(160deg,#ecfdf5 0%,#d1fae5 30%,#ccfbf1 65%,#e0f2fe 100%)",position:"relative",overflow:"hidden"}}>
      <GlobalStyles/>

      {/* Background decorations */}
      <div aria-hidden style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div style={{position:"absolute",width:700,height:700,borderRadius:"50%",background:"rgba(5,150,105,.09)",filter:"blur(72px)",top:-220,right:-120}}/>
        <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"rgba(8,145,178,.07)",filter:"blur(62px)",bottom:-160,left:-100}}/>
        <div style={{position:"absolute",width:380,height:380,borderRadius:"50%",background:"rgba(16,185,129,.06)",filter:"blur(55px)",bottom:"22%",right:"17%"}}/>
        <div style={{position:"absolute",width:260,height:260,borderRadius:"50%",background:"rgba(245,158,11,.05)",filter:"blur(45px)",top:"38%",left:"8%"}}/>
        <div className="cloud-a" style={{position:"absolute",top:80,left:"6%",opacity:.45}}><Cloud style={{width:240,height:96}}/></div>
        <div className="cloud-b" style={{position:"absolute",top:160,right:"22%",opacity:.28}}><Cloud style={{width:180,height:72}}/></div>
        <div className="cloud-c" style={{position:"absolute",top:50,right:"5%",opacity:.22}}><Cloud style={{width:200,height:80}}/></div>
        <div className="cloud-a" style={{position:"absolute",bottom:"20%",left:"26%",opacity:.18}}><Cloud style={{width:220,height:88}}/></div>
        <div className="float-a" style={{position:"absolute",width:90,height:90,borderRadius:"50%",background:"linear-gradient(135deg,rgba(5,150,105,.18),rgba(8,145,178,.12))",top:"22%",right:"12%",border:"1px solid rgba(255,255,255,.5)"}}/>
        <div className="float-b" style={{position:"absolute",width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,rgba(16,185,129,.2),rgba(5,150,105,.1))",top:"62%",right:"30%",border:"1px solid rgba(255,255,255,.4)"}}/>
        <div className="float-a" style={{position:"absolute",width:36,height:36,borderRadius:"50%",background:"rgba(8,145,178,.15)",top:"42%",left:"4%",border:"1px solid rgba(255,255,255,.35)",animationDelay:"3s"}}/>
      </div>

      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
        <DoctorNavbar
          active={tab}
          onTab={setTab}
          onLogout={handleLogout}
          user={user}
          pendingCount={pendingCount}
          profilePicture={doctorProfile?.profilePicture}
        />
        <Toast toast={toast}/>
        <div style={{flex:1}}>
          {tab==="dashboard"    && <DashboardTab    user={user} appointments={appointments} secretaryRequests={secretaryRequests} onGoTo={setTab}/>}
          {tab==="schedule"     && <CalendarTab     appointments={appointments}/>}
          {tab==="appointments" && <AppointmentsTab appointments={appointments} onComplete={handleComplete} onCancel={handleCancel} loading={loadingAction}/>}
          {tab==="secretary"    && <SecretaryTab    requests={secretaryRequests} onApprove={handleApproveSecretary} onReject={handleRejectSecretary} loading={loadingAction}/>}
          {tab==="profile"      && <ProfileTab      onSaved={handleProfileSaved}/>}
        </div>
      </div>
    </div>
  );
}
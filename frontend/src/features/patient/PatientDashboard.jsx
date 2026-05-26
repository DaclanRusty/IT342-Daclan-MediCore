import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { patientApi, healthTipsApi } from "../shared/api";


// ── Feature components ────────────────────────────────────────────────────
import HomeTab            from "./HomeTab";
import AppointmentsTab    from "./AppointmentsTab";
import DoctorsTab         from "./DoctorsTab";
import PatientProfileTab  from "./PatientProfileTab";
import BookModal          from "./BookModal";
import PatientNavbar      from "./PatientNavbar";
import AppointmentDetailModal from "./AppointmentDetailModal";

// ── Notifications ─────────────────────────────────────────────────────────
import useNotifications from "./useNotifications";

// ── Shared UI ─────────────────────────────────────────────────────────────
import { GlobalStyles, Toast, Cloud } from "./PatientUI";
import { C } from "./patientConstants";

export default function PatientDashboard() {
  const navigate         = useNavigate();
  const { user, logout } = useAuth();

  const [tab,            setTab]            = useState("home");
  const [toast,          setToast]          = useState(null);
  const [bookDoctor,     setBookDoctor]     = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [detailAppt,     setDetailAppt]     = useState(null); // for notif → detail modal

  const [appts,    setAppts]    = useState([]);
  const [apptLoad, setApptLoad] = useState(true);
  const [apptErr,  setApptErr]  = useState("");

  const [doctors,  setDoctors]  = useState([]);
  const [docLoad,  setDocLoad]  = useState(true);
  const [docErr,   setDocErr]   = useState("");

  const [tips,     setTips]     = useState([]);
  const [tipsLoad, setTipsLoad] = useState(true);
  const [tipsErr,  setTipsErr]  = useState("");

  // ── Notifications ──────────────────────────────────────────────────────
  const {
    notifications,
    unreadCount,
    markAllRead,
    markRead,
    clearAll,
  } = useNotifications();

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchAppts = useCallback(async () => {
    setApptLoad(true); setApptErr("");
    try { const d = await patientApi.getMyAppointments(); setAppts(Array.isArray(d)?d:[]); }
    catch(e) { setApptErr(e.message||"Failed to load appointments."); }
    finally { setApptLoad(false); }
  }, []);

  const fetchDoctors = useCallback(async () => {
    setDocLoad(true); setDocErr("");
    try { const d = await patientApi.getAllDoctors(); setDoctors(Array.isArray(d)?d:[]); }
    catch(e) { setDocErr(e.message||"Failed to load doctors."); }
    finally { setDocLoad(false); }
  }, []);

  const fetchTips = useCallback(async () => {
    setTipsLoad(true); setTipsErr("");
    try { setTips(await healthTipsApi.getTips()); }
    catch(e) { setTipsErr(e.message||"Failed to load health tips."); }
    finally { setTipsLoad(false); }
  }, []);

  const fetchPatientProfile = useCallback(async () => {
    try { const d = await patientApi.getProfile(); setPatientProfile(d); }
    catch { setPatientProfile(null); }
  }, []);

  useEffect(() => {
    fetchAppts(); fetchDoctors(); fetchTips(); fetchPatientProfile();
  }, [fetchAppts, fetchDoctors, fetchTips, fetchPatientProfile]);

  const handleBookSuccess = (msg) => { setBookDoctor(null); showToast(msg); fetchAppts(); };
  const handleLogout      = async () => { try { await logout(); } catch {} finally { navigate("/login"); } };
  const openBook          = (doc=null) => setBookDoctor(doc ?? true);
  const closeBook         = () => setBookDoctor(null);

  // When user clicks a notification → open detail modal for that appointment
  const handleViewApptFromNotif = (appt) => {
    setDetailAppt(appt);
  };

  return (
    <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",minHeight:"100vh",background:"linear-gradient(160deg,#eef2ff 0%,#e0e7ff 35%,#dbeafe 65%,#ede9fe 100%)",position:"relative",overflow:"hidden"}}>
      <GlobalStyles/>

      {/* Background decorations */}
      <div aria-hidden style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div style={{position:"absolute",width:700,height:700,borderRadius:"50%",background:"rgba(37,99,235,.09)",filter:"blur(72px)",top:-220,right:-120}}/>
        <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"rgba(124,58,237,.07)",filter:"blur(62px)",bottom:-160,left:-100}}/>
        <div style={{position:"absolute",width:380,height:380,borderRadius:"50%",background:"rgba(16,185,129,.06)",filter:"blur(55px)",bottom:"22%",right:"17%"}}/>
        <div style={{position:"absolute",width:260,height:260,borderRadius:"50%",background:"rgba(245,158,11,.05)",filter:"blur(45px)",top:"38%",left:"8%"}}/>
        <div className="cloud-a" style={{position:"absolute",top:80,left:"6%",opacity:.45}}><Cloud style={{width:240,height:96}}/></div>
        <div className="cloud-b" style={{position:"absolute",top:160,right:"22%",opacity:.28}}><Cloud style={{width:180,height:72}}/></div>
        <div className="cloud-c" style={{position:"absolute",top:50,right:"5%",opacity:.22}}><Cloud style={{width:200,height:80}}/></div>
        <div className="cloud-a" style={{position:"absolute",bottom:"20%",left:"26%",opacity:.18}}><Cloud style={{width:220,height:88}}/></div>
        <div className="cloud-b" style={{position:"absolute",bottom:"6%",right:"9%",opacity:.15}}><Cloud style={{width:160,height:64}}/></div>
        <div className="float-a" style={{position:"absolute",width:90,height:90,borderRadius:"50%",background:"linear-gradient(135deg,rgba(37,99,235,.18),rgba(124,58,237,.12))",top:"22%",right:"12%",border:"1px solid rgba(255,255,255,.5)"}}/>
        <div className="float-b" style={{position:"absolute",width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,rgba(16,185,129,.2),rgba(37,99,235,.1))",top:"62%",right:"30%",border:"1px solid rgba(255,255,255,.4)"}}/>
        <div className="float-a" style={{position:"absolute",width:36,height:36,borderRadius:"50%",background:"rgba(124,58,237,.15)",top:"42%",left:"4%",border:"1px solid rgba(255,255,255,.35)",animationDelay:"3s"}}/>
      </div>

      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
        <PatientNavbar
          active={tab}
          onTab={setTab}
          onLogout={handleLogout}
          user={user}
          patientProfile={patientProfile}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={markAllRead}
          onMarkRead={markRead}
          onClearNotifications={clearAll}
          onViewAppt={handleViewApptFromNotif}
        />
        <Toast toast={toast}/>

        {/* Book modal */}
        {bookDoctor !== null && (
          <BookModal
            doctors={doctors}
            preselectedDoctor={bookDoctor===true ? null : bookDoctor}
            onSuccess={handleBookSuccess}
            onClose={closeBook}
          />
        )}

        {/* Appointment detail modal (from notification click) */}
        {detailAppt && (
          <AppointmentDetailModal appt={detailAppt} onClose={()=>setDetailAppt(null)}/>
        )}

        <div style={{flex:1}}>
          {tab==="home"         && <HomeTab user={user} appts={appts} apptLoad={apptLoad} apptErr={apptErr} onBook={openBook} onGoTo={setTab} onRetryAppts={fetchAppts} tips={tips} tipsLoad={tipsLoad} tipsErr={tipsErr} onRetryTips={fetchTips}/>}
          {tab==="appointments" && <AppointmentsTab appts={appts} loading={apptLoad} error={apptErr} onBook={openBook} onRetry={fetchAppts}/>}
          {tab==="doctors"      && <DoctorsTab doctors={doctors} loading={docLoad} error={docErr} onBook={openBook} onRetry={fetchDoctors}/>}
          {tab==="profile"      && <PatientProfileTab user={user} onPictureUpdate={fetchPatientProfile}/>}
        </div>
      </div>
    </div>
  );
}
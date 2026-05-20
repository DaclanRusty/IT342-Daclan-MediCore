import { useState, useEffect, useRef, useCallback } from 'react';
import { patientApi } from '../shared/api';

const POLL_INTERVAL = 30000;
const STORAGE_KEY   = "medicore_notifications";
const SEEN_KEY      = "medicore_appt_statuses";
const NOTIFY_STATUSES = ["CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED", "EXPIRED"];

const getMessage = (appt, status) => {
  const fn     = appt.doctor?.firstName || "";
  const ln     = appt.doctor?.lastName  || "";
  const doctor = `Dr. ${fn} ${ln}`.trim();
  const date   = appt.requestedDate || appt.requested_date || "";
  const dateStr = date ? new Date(date).toLocaleDateString("en-PH",{month:"short",day:"numeric"}) : "";

  switch(status) {
    case "CONFIRMED":
      return { type:"confirmed", title:"Appointment Confirmed ✓",   icon:"✅", message:`Your appointment with ${doctor}${dateStr?` on ${dateStr}`:""} has been confirmed.` };
    case "COMPLETED":
      return { type:"completed", title:"Consultation Completed",     icon:"📋", message:`Your consultation with ${doctor} is complete.${appt.doctorNotes?" Doctor's notes are available.":""}` };
    case "CANCELLED":
      return { type:"cancelled", title:"Appointment Cancelled",      icon:"❌", message:`Your appointment with ${doctor}${dateStr?` on ${dateStr}`:""} was cancelled.${appt.cancelReason?` Reason: ${appt.cancelReason}`:""}` };
    case "REJECTED":
      return { type:"rejected",  title:"Appointment Not Approved",   icon:"✕",  message:`Your request with ${doctor} was not approved.${appt.rejectedReason?` Reason: ${appt.rejectedReason}`:""}` };
    case "EXPIRED":
      return { type:"expired", title:"Appointment Expired ⏰", icon:"⏰", message:`Your pending appointment with ${doctor}${dateStr?` on ${dateStr}`:""} was automatically expired. Please book a new appointment.` };
    default: return null;
  }
};

// ── Store only tiny fields — NO profile pictures, NO large objects ────────
const toStorable = (notif) => ({
  id:        notif.id,
  apptId:    notif.apptId,
  type:      notif.type,
  title:     notif.title,
  message:   notif.message,
  icon:      notif.icon,
  read:      notif.read,
  timestamp: notif.timestamp,
  // Store only minimal appt info needed for detail modal
  appt: {
    id:            notif.appt?.id,
    status:        notif.appt?.status,
    requestedDate: notif.appt?.requestedDate || notif.appt?.requested_date,
    requestedTime: notif.appt?.requestedTime || notif.appt?.requested_time,
    reasonForVisit:notif.appt?.reasonForVisit || notif.appt?.reason_for_visit,
    doctorNotes:   notif.appt?.doctorNotes,
    cancelReason:  notif.appt?.cancelReason,
    rejectedReason:notif.appt?.rejectedReason,
    doctor: {
      firstName:    notif.appt?.doctor?.firstName,
      lastName:     notif.appt?.doctor?.lastName,
      specialization: notif.appt?.doctor?.specialization,
      // ❌ deliberately omit profilePicture — too large
    },
  },
});

const safeSave = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // If quota exceeded, keep only the 10 most recent
    try {
      const trimmed = Array.isArray(value) ? value.slice(0, 10) : value;
      localStorage.setItem(key, JSON.stringify(trimmed));
    } catch {
      // Give up silently — notifications will still work in memory
    }
  }
};

const loadStored = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
};

const useNotifications = () => {
  const [notifications, setNotifications] = useState(() => loadStored(STORAGE_KEY, []));
  const [unreadCount,   setUnreadCount]   = useState(0);
  const prevStatusesRef = useRef(loadStored(SEEN_KEY, {}));
  const isFirstRun      = useRef(true);

  useEffect(() => {
    safeSave(STORAGE_KEY, notifications.map(toStorable));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const poll = useCallback(async () => {
    try {
      const appts = await patientApi.getMyAppointments();
      if (!Array.isArray(appts)) return;

      const prevStatuses = prevStatusesRef.current;
      const newStatuses  = {};
      const newNotifs    = [];

      appts.forEach(a => {
        const id        = String(a.id);
        const newStatus = (a.status || "").toUpperCase();
        newStatuses[id] = newStatus;

        const shouldNotify = NOTIFY_STATUSES.includes(newStatus);

        if (isFirstRun.current) {
          // Never seen this appointment before → notify if it's in a notable status
          if (!prevStatuses[id] && shouldNotify) {
            const msg = getMessage(a, newStatus);
            if (msg) newNotifs.push({ id:`${id}-${newStatus}-init`, apptId:id, read:false, timestamp:new Date().toISOString(), appt:a, ...msg });
          }
          // Seen before but status changed
          if (prevStatuses[id] && prevStatuses[id] !== newStatus && shouldNotify) {
            const msg = getMessage(a, newStatus);
            if (msg) newNotifs.push({ id:`${id}-${newStatus}-${Date.now()}`, apptId:id, read:false, timestamp:new Date().toISOString(), appt:a, ...msg });
          }
        } else {
          // Polling: only notify on actual status changes
          if (prevStatuses[id] && prevStatuses[id] !== newStatus && shouldNotify) {
            const msg = getMessage(a, newStatus);
            if (msg) newNotifs.push({ id:`${id}-${newStatus}-${Date.now()}`, apptId:id, read:false, timestamp:new Date().toISOString(), appt:a, ...msg });
          }
        }
      });

      prevStatusesRef.current = newStatuses;
      safeSave(SEEN_KEY, newStatuses);
      isFirstRun.current = false;

      if (newNotifs.length > 0) {
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const fresh = newNotifs.filter(n => !existingIds.has(n.id));
          return [...fresh, ...prev].slice(0, 20); // keep max 20
        });
      }
    } catch {
      // fail silently
    }
  }, []);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [poll]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({...n, read:true})));
  const markRead    = (id) => setNotifications(prev => prev.map(n => n.id===id ? {...n,read:true} : n));
  const clearAll    = () => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SEEN_KEY);
    prevStatusesRef.current = {};
  };

  return { notifications, unreadCount, markAllRead, markRead, clearAll, poll };
};

export default useNotifications;
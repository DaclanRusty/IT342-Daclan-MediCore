// ── Colors ────────────────────────────────────────────────────────────────
export const C = {
  blue:"#2563eb",  blueDk:"#1d4ed8", blueLt:"#eff6ff", blueBdr:"#bfdbfe",
  amber:"#f59e0b", amberDk:"#d97706",amberLt:"#fffbeb",amberBdr:"#fde68a",
  green:"#059669", greenLt:"#f0fdf4",greenBdr:"#bbf7d0",
  purple:"#7c3aed",purpleLt:"#f5f3ff",purpleBdr:"#ddd6fe",
  red:"#ef4444",   redLt:"#fef2f2",  redBdr:"#fecaca",
  slate:"#0f172a", slateM:"#334155", slateL:"#64748b", slateXL:"#94a3b8",
};

// ── Tabs ──────────────────────────────────────────────────────────────────
export const TABS = [
  { key:"home",         label:"Home",         icon:"home" },
  { key:"appointments", label:"Appointments", icon:"cal"  },
  { key:"doctors",      label:"Doctors",      icon:"doc"  },
  { key:"profile",      label:"Profile",      icon:"user" },
];

// ── Status badge map ──────────────────────────────────────────────────────
export const SB = {
  PENDING:   ["#fef9c3","#854d0e","#fde047"],
  CONFIRMED: ["#f0fdf4","#059669","#bbf7d0"],
  APPROVED:  ["#f0fdf4","#059669","#bbf7d0"],
  COMPLETED: ["#eff6ff","#2563eb","#bfdbfe"],
  REJECTED:  ["#fef2f2","#991b1b","#fecaca"],
  CANCELLED: ["#f1f5f9","#64748b","#cbd5e1"],
  EXPIRED:   ["#fef9c3","#854d0e","#fde047"],
};

// ── Helpers ───────────────────────────────────────────────────────────────
export const getInitials  = (fn="",ln="") => `${fn[0]||""}${ln[0]||""}`.toUpperCase();
export const DOC_COLORS   = ["#2563eb","#7c3aed","#059669","#f59e0b","#ef4444","#0891b2","#db2777","#16a34a"];
export const docColor     = (id) => DOC_COLORS[(typeof id==="number"?id:0) % DOC_COLORS.length];
export const docId        = (doc) => doc?.doctorId ?? doc?.id ?? 0;

export const apptDate     = a => a?.requested_date  || a?.requestedDate  || "";
export const apptTime     = a => a?.requested_time  || a?.requestedTime  || "";
export const apptReason   = a => a?.reason_for_visit || a?.reasonForVisit || "";
export const apptStatus   = a => (a?.status||"").toUpperCase();
export const apptDoctorFn = a => a?.doctor?.firstName || a?.doctor?.firstname || "";
export const apptDoctorLn = a => a?.doctor?.lastName  || a?.doctor?.lastname  || "";
export const apptDoctorSpec = a => a?.doctor?.specialization || "";
export const apptDoctorPic  = a => a?.doctor?.profilePicture || null;

// ── Time slot helpers ─────────────────────────────────────────────────────
export const ALL_SLOTS = [
  "08:00 AM","09:00 AM","10:00 AM","11:00 AM",
  "01:00 PM","02:00 PM","03:00 PM","04:00 PM",
];

export function slotToMinutes(slot) {
  const parts = slot.trim().split(" ");
  const meridiem = parts[1]?.toUpperCase();
  let [h, m] = parts[0].split(":").map(Number);
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return h * 60 + m;
}
// ── Colors ───────────────────────────────────────────────────────────────
export const C = {
  green:"#059669",  greenDk:"#047857", greenLt:"#f0fdf4", greenBdr:"#bbf7d0",
  teal:"#0891b2",   tealLt:"#ecfeff",  tealBdr:"#a5f3fc",
  amber:"#f59e0b",  amberDk:"#d97706", amberLt:"#fffbeb", amberBdr:"#fde68a",
  blue:"#2563eb",   blueLt:"#eff6ff",  blueBdr:"#bfdbfe",
  purple:"#7c3aed", purpleLt:"#f5f3ff",purpleBdr:"#ddd6fe",
  red:"#ef4444",    redLt:"#fef2f2",   redBdr:"#fecaca",
  slate:"#0f172a",  slateM:"#334155",  slateL:"#64748b",  slateXL:"#94a3b8",
};

// ── Tabs ─────────────────────────────────────────────────────────────────
export const TABS = [
  { key:"dashboard",    label:"Dashboard",    icon:"home"    },
  { key:"appointments", label:"Appointments", icon:"cal"     },
  { key:"schedule",     label:"Calendar",     icon:"cal"     },
  { key:"secretary",    label:"Secretary",    icon:"users"   },
  { key:"profile",      label:"My Profile",   icon:"user"    },
];

// ── Helpers ───────────────────────────────────────────────────────────────
export const getInitials = (fn="", ln="") => `${fn[0]||""}${ln[0]||""}`.toUpperCase();
export const apptPatFn   = a => a?.patient?.firstName || a?.patient?.firstname || '';
export const apptPatLn   = a => a?.patient?.lastName  || a?.patient?.lastname  || '';
export const apptDate    = a => a?.requestedDate || a?.requested_date || '';
export const apptTime    = a => a?.requestedTime || a?.requested_time || '';
export const apptReason  = a => a?.reasonForVisit || a?.reason_for_visit || '';
export const secFn       = s => s?.firstName || s?.firstname || '';
export const secLn       = s => s?.lastName  || s?.lastname  || '';
export const secEmail    = s => s?.email || '';

// ── Status badge map ──────────────────────────────────────────────────────
export const SB = {
  PENDING:   ["#fef9c3","#854d0e","#fde047"],
  CONFIRMED: ["#f0fdf4", "#059669", "#bbf7d0"],
  COMPLETED: ["#eff6ff", "#2563eb", "#bfdbfe"],
  REJECTED:  ["#fef2f2","#991b1b","#fecaca"],
  CANCELLED: ["#f1f5f9","#64748b","#cbd5e1"],
  APPROVED:  ["#f0fdf4", "#059669", "#bbf7d0"],
  EXPIRED:   ["#fef9c3","#854d0e","#fde047"],
};

// ── Specializations ───────────────────────────────────────────────────────
export const SPECS = [
  'General Medicine','Cardiology','Dermatology','Endocrinology',
  'Gastroenterology','Neurology','Obstetrics & Gynecology','Oncology',
  'Ophthalmology','Orthopedics','Pediatrics','Psychiatry','Pulmonology',
  'Radiology','Surgery','Urology','Other',
];
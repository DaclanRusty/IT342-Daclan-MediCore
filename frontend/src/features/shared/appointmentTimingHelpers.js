// ── Appointment timing helpers ────────────────────────────────────────────

/**
 * Returns how long ago an appointment was booked.
 * e.g. "Booked 2 days ago", "Booked just now"
 */
export const bookedAgo = (createdAt) => {
  if (!createdAt) return null;
  const diff = Math.floor((Date.now() - new Date(createdAt)) / 1000);
  if (diff < 60)     return "Booked just now";
  if (diff < 3600)   return `Booked ${Math.floor(diff/60)}m ago`;
  if (diff < 86400)  return `Booked ${Math.floor(diff/3600)}h ago`;
  const days = Math.floor(diff/86400);
  return `Booked ${days} day${days!==1?"s":""} ago`;
};

/**
 * Returns the exact formatted booked date/time.
 * e.g. "May 17, 2026 at 3:45 PM"
 */
export const bookedOn = (createdAt) => {
  if (!createdAt) return null;
  return new Date(createdAt).toLocaleString("en-PH", {
    month:"long", day:"numeric", year:"numeric",
    hour:"numeric", minute:"2-digit", hour12:true,
  });
};

/**
 * Parses a time string like "08:00 AM", "8:00 AM", "08:00" into
 * { hours, minutes } in 24-hour format.
 */
const parseAppointmentTime = (timeStr) => {
  if (!timeStr) return { hours: 0, minutes: 0 };
  const upper = timeStr.trim().toUpperCase();
  const ampm  = upper.includes("AM") || upper.includes("PM");

  if (ampm) {
    const [timePart, period] = upper.split(" ");
    let [h, m] = timePart.split(":").map(Number);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return { hours: h, minutes: m || 0 };
  } else {
    const [h, m] = upper.split(":").map(Number);
    return { hours: h || 0, minutes: m || 0 };
  }
};

/**
 * Returns hours until appointment expires.
 * Rule: expires exactly 24 hours before the appointment datetime.
 * Negative = already past expiry.
 */
export const hoursUntilExpiry = (requestedDate, requestedTime) => {
  if (!requestedDate) return null;
  const { hours, minutes } = parseAppointmentTime(requestedTime);
  const apptDateTime = new Date(requestedDate + "T00:00:00");
  apptDateTime.setHours(hours, minutes, 0, 0);
  const expiryTime = new Date(apptDateTime.getTime() - 24 * 60 * 60 * 1000);
  return Math.floor((expiryTime - Date.now()) / (1000 * 60 * 60));
};

/**
 * Returns urgency level for a PENDING appointment.
 * "critical" = expiring within 6 hours
 * "warning"  = expiring within 24 hours
 * "ok"       = more than 24 hours left
 * "expired"  = already past expiry
 */
export const pendingUrgency = (requestedDate, requestedTime) => {
  const hrs = hoursUntilExpiry(requestedDate, requestedTime);
  if (hrs === null) return "ok";
  if (hrs < 0)   return "expired";
  if (hrs < 6)   return "critical";
  if (hrs < 24)  return "warning";
  return "ok";
};

/**
 * Human-readable expiry label for PENDING appointments.
 */
export const expiryLabel = (requestedDate, requestedTime) => {
  const hrs = hoursUntilExpiry(requestedDate, requestedTime);
  if (hrs === null) return null;
  if (hrs < 0)   return "⚠️ Past confirmation deadline";
  if (hrs === 0) return "⚠️ Expires within the hour!";
  if (hrs < 24)  return `⚠️ Must confirm within ${hrs}h`;
  if (hrs < 48)  return "Confirmation deadline: tomorrow";
  const days = Math.floor(hrs / 24);
  return `Confirm within ${days} days`;
};

/**
 * Urgency color scheme.
 */
export const urgencyStyle = (level) => ({
  critical: { bg:"#fef2f2", color:"#dc2626", border:"#fecaca" },
  warning:  { bg:"#fffbeb", color:"#d97706", border:"#fde68a" },
  ok:       { bg:"#f0fdf4", color:"#059669", border:"#bbf7d0" },
  expired:  { bg:"#fef9c3", color:"#854d0e", border:"#fde047" },
}[level] || { bg:"#f8fafc", color:"#64748b", border:"#e2e8f0" });
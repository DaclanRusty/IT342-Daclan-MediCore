import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://localhost:8081/api/v1";
const getToken = () => localStorage.getItem("accessToken");

async function apiFetch(endpoint, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (getToken()) headers["Authorization"] = `Bearer ${getToken()}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || data?.message || "Request failed");
  return data?.data !== undefined ? data.data : data;
}

// ── Icons ──────────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const DoctorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

// ── Status Badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    PENDING:  { bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
    APPROVED: { bg: "#dcfce7", color: "#166534", border: "#86efac" },
    REJECTED: { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
  };
  const s = styles[status] || styles.PENDING;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600,
    }}>
      {status}
    </span>
  );
};

// ── Nav ───────────────────────────────────────────────────────────────────
const Navbar = ({ onLogout }) => (
  <nav style={{
    height: 60, background: "#fff", borderBottom: "1px solid #f1f5f9",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 32px", position: "sticky", top: 0, zIndex: 100,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "Georgia,serif",
      }}>M</div>
      <span style={{ fontWeight: 700, fontSize: 17, color: "#1e293b" }}>
        Medi<span style={{ color: "#2563eb" }}>Core</span>
      </span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "linear-gradient(135deg,#a855f7,#9333ea)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
        }}>
          <UserIcon />
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Secretary</span>
      </div>
      <button onClick={onLogout} style={{
        display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
        borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff",
        color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer",
      }}>
        <LogoutIcon /> Logout
      </button>
    </div>
  </nav>
);

// ── Tabs ──────────────────────────────────────────────────────────────────
const TABS = [
  { key: "dashboard",        label: "Dashboard" },
  { key: "appointments",     label: "All Appointments" },
  { key: "doctors-pending",  label: "Doctor Registrations" },
  { key: "doctors-approved", label: "Browse Doctors" },
];

const TabBar = ({ active, onChange }) => (
  <div style={{
    display: "flex", gap: 4, background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0", padding: "0 32px",
  }}>
    {TABS.map(t => (
      <button key={t.key} onClick={() => onChange(t.key)} style={{
        padding: "14px 18px", border: "none", background: "none",
        borderBottom: active === t.key ? "2px solid #a855f7" : "2px solid transparent",
        color: active === t.key ? "#a855f7" : "#64748b",
        fontWeight: active === t.key ? 700 : 500,
        fontSize: 14, cursor: "pointer", transition: "all .15s",
      }}>
        {t.label}
      </button>
    ))}
  </div>
);

// ── Appointment Row ────────────────────────────────────────────────────────
const AppointmentRow = ({ appt, onClick }) => (
  <div onClick={onClick} style={{
    display: "flex", alignItems: "center", padding: "16px 20px",
    borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background .15s",
  }}
    onMouseEnter={e => e.currentTarget.style.background = "#faf5ff"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
  >
    {/* Patient */}
    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0,
      }}><UserIcon /></div>
      <div>
        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Patient</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
          {appt.patient?.firstname} {appt.patient?.lastname}
        </div>
      </div>
    </div>
    {/* Doctor */}
    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: "linear-gradient(135deg,#10b981,#059669)",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0,
      }}><DoctorIcon /></div>
      <div>
        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Doctor</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
          Dr. {appt.doctor?.firstname} {appt.doctor?.lastname}
        </div>
      </div>
    </div>
    {/* Date & Time */}
    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#475569", fontSize: 13 }}>
        <CalendarIcon /> {appt.requested_date}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#475569", fontSize: 13 }}>
        <ClockIcon /> {appt.requested_time}
      </div>
    </div>
    {/* Status */}
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <StatusBadge status={appt.status} />
      <ArrowIcon />
    </div>
  </div>
);

// ── Appointment Detail ────────────────────────────────────────────────────
const AppointmentDetail = ({ appt, onBack, onApprove, onReject, loading }) => (
  <div style={{ maxWidth: 680, margin: "32px auto", padding: "0 24px" }}>
    <button onClick={onBack} style={{
      display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
      color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 24,
    }}>
      <BackIcon /> Back to Appointments
    </button>

    <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>
      Appointment <span style={{ color: "#a855f7" }}>Details</span>
    </h2>
    <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>Review and manage this appointment request</p>

    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <StatusBadge status={appt.status} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Patient */}
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 10 }}>Patient Name</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            }}><UserIcon /></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                {appt.patient?.firstname} {appt.patient?.lastname}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Patient</div>
            </div>
          </div>
        </div>
        {/* Doctor */}
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 10 }}>Requested Doctor</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg,#10b981,#059669)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            }}><DoctorIcon /></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                Dr. {appt.doctor?.firstname} {appt.doctor?.lastname}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Doctor</div>
            </div>
          </div>
        </div>
        {/* Date */}
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 10 }}>Requested Date</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: "#ede9fe",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" width="18" height="18">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{appt.requested_date}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Appointment Date</div>
            </div>
          </div>
        </div>
        {/* Time */}
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 10 }}>Requested Time</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: "#ede9fe",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" width="18" height="18">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{appt.requested_time}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Scheduled Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reason */}
      {appt.reason_for_visit && (
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Reason for Visit</div>
          <div style={{ display: "flex", gap: 10 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" width="16" height="16" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
            <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, margin: 0 }}>{appt.reason_for_visit}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      {appt.status === "PENDING" && (
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onApprove} disabled={loading} style={{
            flex: 1, padding: "12px 20px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff",
            fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", gap: 6,
            opacity: loading ? 0.6 : 1,
          }}>
            <CheckIcon /> Approve
          </button>
          <button onClick={onReject} disabled={loading} style={{
            flex: 1, padding: "12px 20px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff",
            fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", gap: 6,
            opacity: loading ? 0.6 : 1,
          }}>
            <XIcon /> Reject
          </button>
        </div>
      )}
    </div>
  </div>
);

// ── Dashboard Tab ─────────────────────────────────────────────────────────
const DashboardTab = ({ appointments, onViewAll, onSelectAppt }) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const approvedToday = appointments.filter(a => a.status === "APPROVED" && a.updated_at?.startsWith(todayStr)).length;
  const totalRejected = appointments.filter(a => a.status === "REJECTED").length;
  const pending = appointments.filter(a => a.status === "PENDING").slice(0, 5);

  return (
    <div style={{ padding: "32px", maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Welcome</h1>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>Manage appointment requests and scheduling</p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 36, maxWidth: 600 }}>
        <div style={{
          background: "#fff", borderRadius: 16, padding: 20,
          border: "1.5px solid #d1fae5", boxShadow: "0 2px 8px rgba(16,185,129,.08)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg,#10b981,#059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" width="22" height="22">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span style={{
              background: "#dcfce7", color: "#166534", fontSize: 11,
              fontWeight: 700, padding: "2px 8px", borderRadius: 20,
            }}>Today</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{approvedToday}</div>
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Total Approved Today</div>
        </div>

        <div style={{
          background: "#fff", borderRadius: 16, padding: 20,
          border: "1.5px solid #fecaca", boxShadow: "0 2px 8px rgba(239,68,68,.08)",
        }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg,#ef4444,#dc2626)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" width="22" height="22">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{totalRejected}</div>
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Total Rejected</div>
        </div>
      </div>

      {/* Pending */}
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Pending Appointments</h2>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>Recent appointment requests awaiting review</p>

      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24 }}>
        {pending.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
            No pending appointments
          </div>
        ) : (
          pending.map(a => <AppointmentRow key={a.id} appt={a} onClick={() => onSelectAppt(a)} />)
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button onClick={onViewAll} style={{
          padding: "13px 32px", borderRadius: 12, border: "none",
          background: "linear-gradient(135deg,#a855f7,#9333ea)", color: "#fff",
          fontWeight: 700, fontSize: 15, cursor: "pointer",
          boxShadow: "0 6px 20px rgba(168,85,247,.3)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          View All Appointments →
        </button>
      </div>
    </div>
  );
};

// ── All Appointments Tab ──────────────────────────────────────────────────
const AllAppointmentsTab = ({ appointments, onSelect }) => {
  const [filter, setFilter] = useState("ALL");
  const filters = ["ALL", "PENDING", "APPROVED", "REJECTED"];
  const filtered = filter === "ALL" ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div style={{ padding: "32px", maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>All Appointments</h2>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>View and manage all appointment requests</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 14px", borderRadius: 20, border: "1.5px solid",
            borderColor: filter === f ? "#a855f7" : "#e2e8f0",
            background: filter === f ? "#faf5ff" : "#fff",
            color: filter === f ? "#a855f7" : "#64748b",
            fontWeight: filter === f ? 700 : 500, fontSize: 13, cursor: "pointer",
          }}>{f}</button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No appointments found</div>
        ) : (
          filtered.map(a => <AppointmentRow key={a.id} appt={a} onClick={() => onSelect(a)} />)
        )}
      </div>
    </div>
  );
};

// ── Doctor Registrations Tab ───────────────────────────────────────────────
// FIX: use doc.doctorId (camelCase) everywhere — matches DoctorSummaryResponse DTO
const DoctorRegistrationsTab = ({ doctors, onApprove, onReject, loading }) => (
  <div style={{ padding: "32px", maxWidth: 1000, margin: "0 auto" }}>
    <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Doctor Registrations</h2>
    <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Review and approve pending doctor registrations</p>

    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {doctors.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: 16, padding: 40,
          textAlign: "center", color: "#94a3b8", fontSize: 14,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          No pending doctor registrations
        </div>
      ) : (
        doctors.map(doc => (
          // FIX: was doc.doctor_id → now doc.doctorId
          <div key={doc.doctorId} style={{
            background: "#fff", borderRadius: 16, padding: 20,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            {/* Avatar */}
            <div style={{
              width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg,#10b981,#059669)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
              overflow: "hidden",
            }}>
              {/* FIX: was doc.profile_picture / doc.profilePicture mismatch → now consistent doc.profilePicture */}
              {doc.profilePicture
                ? <img src={doc.profilePicture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <DoctorIcon />}
            </div>

            {/* Info — all fields are camelCase from DTO */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                Dr. {doc.firstName} {doc.lastName}
              </div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                {doc.specialization} · License: {doc.licenseNumber}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                {doc.email} · {doc.phoneNumber}
              </div>
            </div>

            <StatusBadge status={doc.status} />

            {/* Actions */}
            {doc.status === "PENDING" && (
              <div style={{ display: "flex", gap: 8 }}>
                {/* FIX: was doc.doctor_id → now doc.doctorId */}
                <button onClick={() => onApprove(doc.doctorId)} disabled={loading} style={{
                  padding: "8px 16px", borderRadius: 8, border: "none",
                  background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff",
                  fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex",
                  alignItems: "center", gap: 5, opacity: loading ? 0.6 : 1,
                }}>
                  <CheckIcon /> Approve
                </button>
                <button onClick={() => onReject(doc.doctorId)} disabled={loading} style={{
                  padding: "8px 16px", borderRadius: 8, border: "none",
                  background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff",
                  fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex",
                  alignItems: "center", gap: 5, opacity: loading ? 0.6 : 1,
                }}>
                  <XIcon /> Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  </div>
);

// ── Browse Doctors Tab ────────────────────────────────────────────────────
// FIX: removed all doc.user?.* references — DTO is flat, not nested
const BrowseDoctorsTab = ({ doctors }) => {
  const approved = doctors.filter(d => d.status === "APPROVED");
  return (
    <div style={{ padding: "32px", maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Browse Doctors</h2>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>All approved doctors in the system</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
        {approved.length === 0 ? (
          <div style={{
            background: "#fff", borderRadius: 16, padding: 40, gridColumn: "1/-1",
            textAlign: "center", color: "#94a3b8", fontSize: 14,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}>
            No approved doctors yet
          </div>
        ) : (
          approved.map(doc => (
            // FIX: was doc.doctor_id → now doc.doctorId
            <div key={doc.doctorId} style={{
              background: "#fff", borderRadius: 16, padding: 20,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: "1.5px solid #f1f5f9",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "linear-gradient(135deg,#10b981,#059669)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", overflow: "hidden", flexShrink: 0,
                }}>
                  {/* FIX: was doc.profile_picture → now doc.profilePicture */}
                  {doc.profilePicture
                    ? <img src={doc.profilePicture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <DoctorIcon />}
                </div>
                <div>
                  {/* FIX: was doc.user?.firstname / doc.user?.lastname → now doc.firstName / doc.lastName */}
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                    Dr. {doc.firstName} {doc.lastName}
                  </div>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: "#f0fdf4", color: "#059669", fontSize: 12,
                    fontWeight: 600, padding: "2px 8px", borderRadius: 20, marginTop: 4,
                  }}>
                    <DoctorIcon /> {doc.specialization}
                  </div>
                </div>
              </div>
              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
                  {/* FIX: was doc.license_number → now doc.licenseNumber */}
                  License: <span style={{ color: "#374151", fontWeight: 600 }}>{doc.licenseNumber}</span>
                </div>
                {/* FIX: was doc.user?.email → now doc.email */}
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{doc.email}</div>
              </div>
              <div style={{ marginTop: 10 }}>
                <span style={{
                  background: "#dcfce7", color: "#166534", fontSize: 11,
                  fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: "1px solid #86efac",
                }}>● Available</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────
export default function SecretaryDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [tab, setTab] = useState("dashboard");
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAppointments = useCallback(async () => {
    try {
      const data = await apiFetch("/appointments/pending");
      setAppointments(Array.isArray(data) ? data : []);
    } catch {
      try {
        const data = await apiFetch("/appointments");
        setAppointments(Array.isArray(data) ? data : []);
      } catch { setAppointments([]); }
    }
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      const data = await apiFetch("/secretary/doctors");
      setDoctors(Array.isArray(data) ? data : []);
    } catch { setDoctors([]); }
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, [fetchAppointments, fetchDoctors]);

  const handleApproveAppt = async () => {
    if (!selectedAppt) return;
    setLoadingAction(true);
    try {
      await apiFetch(`/appointments/${selectedAppt.id}/approve`, { method: "PUT" });
      showToast("Appointment approved successfully!");
      setSelectedAppt(null);
      fetchAppointments();
    } catch (e) {
      showToast(e.message, "error");
    } finally { setLoadingAction(false); }
  };

  const handleRejectAppt = async () => {
    if (!selectedAppt) return;
    setLoadingAction(true);
    try {
      await apiFetch(`/appointments/${selectedAppt.id}/reject`, { method: "PUT" });
      showToast("Appointment rejected.");
      setSelectedAppt(null);
      fetchAppointments();
    } catch (e) {
      showToast(e.message, "error");
    } finally { setLoadingAction(false); }
  };

  // FIX: was PATCH /secretary/doctors/{id}/status?status=APPROVED
  //      now PUT /secretary/doctors/{id}/approve  (matches backend)
  const handleApproveDoctor = async (doctorId) => {
    setLoadingAction(true);
    try {
      await apiFetch(`/secretary/doctors/${doctorId}/approve`, { method: "PUT" });
      showToast("Doctor approved successfully!");
      fetchDoctors();
    } catch (e) {
      showToast(e.message, "error");
    } finally { setLoadingAction(false); }
  };

  // FIX: was PATCH /secretary/doctors/{id}/status?status=REJECTED
  //      now PUT /secretary/doctors/{id}/reject  (matches backend)
  const handleRejectDoctor = async (doctorId) => {
    setLoadingAction(true);
    try {
      await apiFetch(`/secretary/doctors/${doctorId}/reject`, { method: "PUT" });
      showToast("Doctor registration rejected.");
      fetchDoctors();
    } catch (e) {
      showToast(e.message, "error");
    } finally { setLoadingAction(false); }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8faff 0%,#f0f4ff 100%)", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <Navbar onLogout={handleLogout} />
      <TabBar active={tab} onChange={(t) => { setTab(t); setSelectedAppt(null); }} />

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 80, right: 24, zIndex: 999,
          background: toast.type === "error" ? "#fee2e2" : "#dcfce7",
          border: `1px solid ${toast.type === "error" ? "#fca5a5" : "#86efac"}`,
          color: toast.type === "error" ? "#991b1b" : "#166534",
          padding: "12px 20px", borderRadius: 12, fontWeight: 600,
          fontSize: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        }}>
          {toast.msg}
        </div>
      )}

      {selectedAppt ? (
        <AppointmentDetail
          appt={selectedAppt}
          onBack={() => setSelectedAppt(null)}
          onApprove={handleApproveAppt}
          onReject={handleRejectAppt}
          loading={loadingAction}
        />
      ) : (
        <>
          {tab === "dashboard" && (
            <DashboardTab
              appointments={appointments}
              onViewAll={() => setTab("appointments")}
              onSelectAppt={setSelectedAppt}
            />
          )}
          {tab === "appointments" && (
            <AllAppointmentsTab appointments={appointments} onSelect={setSelectedAppt} />
          )}
          {tab === "doctors-pending" && (
            <DoctorRegistrationsTab
              doctors={doctors}
              onApprove={handleApproveDoctor}
              onReject={handleRejectDoctor}
              loading={loadingAction}
            />
          )}
          {tab === "doctors-approved" && (
            <BrowseDoctorsTab doctors={doctors} />
          )}
        </>
      )}
    </div>
  );
}
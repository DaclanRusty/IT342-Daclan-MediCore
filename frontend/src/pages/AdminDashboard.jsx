import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminApi } from "../services/api";

// ── Icons ──────────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
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
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const StatsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const LinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
// NEW: Block/Unblock icon
const BlockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
    <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);
const UnblockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
    <circle cx="12" cy="12" r="10" /><polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── Status Badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    PENDING:   { bg: "#fef9c3", color: "#854d0e",  border: "#fde047" },
    APPROVED:  { bg: "#dcfce7", color: "#166534",  border: "#86efac" },
    REJECTED:  { bg: "#fee2e2", color: "#991b1b",  border: "#fca5a5" },
    ACTIVE:    { bg: "#dcfce7", color: "#166534",  border: "#86efac" },
    // NEW: BLOCKED badge
    BLOCKED:   { bg: "#fee2e2", color: "#991b1b",  border: "#fca5a5" },
    INACTIVE:  { bg: "#f1f5f9", color: "#64748b",  border: "#cbd5e1" },
    ADMIN:     { bg: "#fff7ed", color: "#c2410c",  border: "#fdba74" },   // orange
    DOCTOR:    { bg: "#f0fdf4", color: "#166534",  border: "#86efac" },   // green
    SECRETARY: { bg: "#f5f3ff", color: "#6d28d9",  border: "#c4b5fd" },   // violet
    PATIENT:   { bg: "#eff6ff", color: "#1d4ed8",  border: "#93c5fd" },   // blue
  };
  const s = styles[status] || styles.INACTIVE;
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
      {status}
    </span>
  );
};

// ── Navbar ────────────────────────────────────────────────────────────────
const Navbar = ({ onLogout }) => (
  <nav style={{ height: 60, background: "#fff", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#2563eb,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "Georgia,serif" }}>M</div>
      <span style={{ fontWeight: 700, fontSize: 17, color: "#1e293b" }}>Medi<span style={{ color: "#2563eb" }}>Core</span></span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <ShieldIcon />
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Admin</span>
      </div>
      <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
        <LogoutIcon /> Logout
      </button>
    </div>
  </nav>
);

// ── Tabs ──────────────────────────────────────────────────────────────────
const TABS = [
  { key: "dashboard",   label: "Dashboard" },
  { key: "doctors",     label: "Doctor Registrations" },
  { key: "secretaries", label: "Secretary Assignments" },
  { key: "users",       label: "Manage Users" },
];

const TabBar = ({ active, onChange }) => (
  <div style={{ display: "flex", gap: 4, background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "0 32px" }}>
    {TABS.map(t => (
      <button key={t.key} onClick={() => onChange(t.key)} style={{ padding: "14px 18px", border: "none", background: "none", borderBottom: active === t.key ? "2px solid #f59e0b" : "2px solid transparent", color: active === t.key ? "#f59e0b" : "#64748b", fontWeight: active === t.key ? 700 : 500, fontSize: 14, cursor: "pointer", transition: "all .15s" }}>
        {t.label}
      </button>
    ))}
  </div>
);

// ── Dashboard Tab ─────────────────────────────────────────────────────────
const DashboardTab = ({ users, doctors, assignments, onGoTo }) => {
  const totalUsers   = users.length;
  const totalDoctors = doctors.length;
  const pendingDocs  = doctors.filter(d => d.status === "PENDING").length;
  const approvedDocs = doctors.filter(d => d.status === "APPROVED").length;

  const StatCard = ({ label, value, gradient, border, shadow, icon, tag }) => (
    <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: `1.5px solid ${border}`, boxShadow: shadow }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
        {tag && <span style={{ background: border, color: "#374151", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{tag}</span>}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ padding: "32px", maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Admin Dashboard</h1>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>System overview and management</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 36 }}>
        <StatCard label="Total Users" value={totalUsers} gradient="linear-gradient(135deg,#2563eb,#1d4ed8)" border="#bfdbfe" shadow="0 2px 8px rgba(37,99,235,.08)" icon={<UsersIcon stroke="#fff" />} />
        <StatCard label="Total Doctors" value={totalDoctors} gradient="linear-gradient(135deg,#10b981,#059669)" border="#bbf7d0" shadow="0 2px 8px rgba(16,185,129,.08)" icon={<DoctorIcon stroke="#fff" />} tag="All" />
        <StatCard label="Pending Registrations" value={pendingDocs} gradient="linear-gradient(135deg,#f59e0b,#d97706)" border="#fde68a" shadow="0 2px 8px rgba(245,158,11,.08)" icon={<StatsIcon stroke="#fff" />} tag="Review" />
        <StatCard label="Approved Doctors" value={approvedDocs} gradient="linear-gradient(135deg,#a855f7,#9333ea)" border="#e9d5ff" shadow="0 2px 8px rgba(168,85,247,.08)" icon={<CheckIcon stroke="#fff" />} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Pending doctors preview */}
        <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Pending Doctor Registrations</span>
            <button onClick={() => onGoTo("doctors")} style={{ fontSize: 12, color: "#f59e0b", background: "none", border: "none", fontWeight: 700, cursor: "pointer" }}>View all →</button>
          </div>
          {doctors.filter(d => d.status === "PENDING").slice(0, 3).length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No pending registrations</div>
          ) : (
            doctors.filter(d => d.status === "PENDING").slice(0, 3).map(doc => (
              <div key={doc.doctorId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "1px solid #f8fafc" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><DoctorIcon /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>Dr. {doc.firstName} {doc.lastName}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{doc.specialization}</div>
                </div>
                <StatusBadge status="PENDING" />
              </div>
            ))
          )}
        </div>

        {/* Secretary assignments preview */}
        <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Secretary Assignments</span>
            <button onClick={() => onGoTo("secretaries")} style={{ fontSize: 12, color: "#f59e0b", background: "none", border: "none", fontWeight: 700, cursor: "pointer" }}>View all →</button>
          </div>
          {assignments.slice(0, 3).length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No secretary assignments yet</div>
          ) : (
            assignments.slice(0, 3).map(a => (
              <div key={a.secretaryId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "1px solid #f8fafc" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#9333ea)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><UserIcon /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{a.secretaryName}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{a.doctorName}</div>
                </div>
                <span style={{ background: "#dcfce7", color: "#166534", border: "1px solid #86efac", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>● Assigned</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent users preview */}
      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Recent Users</span>
          <button onClick={() => onGoTo("users")} style={{ fontSize: 12, color: "#f59e0b", background: "none", border: "none", fontWeight: 700, cursor: "pointer" }}>View all →</button>
        </div>
        {users.slice(0, 3).length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No users found</div>
        ) : (
          users.slice(0, 3).map(user => (
            <div key={user.userId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "1px solid #f8fafc" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><UserIcon /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{user.firstName} {user.lastName}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{user.email}</div>
              </div>
              <StatusBadge status={user.role || "PATIENT"} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ── Doctor Registrations Tab ──────────────────────────────────────────────
const DoctorRegistrationsTab = ({ doctors, onApprove, onReject, loading }) => {
  const [filter, setFilter] = useState("ALL");
  const filters = ["ALL", "PENDING", "APPROVED", "REJECTED"];
  const filtered = filter === "ALL" ? doctors : doctors.filter(d => d.status === filter);

  return (
    <div style={{ padding: "32px", maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Doctor Registrations</h2>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Review and approve pending doctor registration requests</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid", borderColor: filter === f ? "#f59e0b" : "#e2e8f0", background: filter === f ? "#fffbeb" : "#fff", color: filter === f ? "#d97706" : "#64748b", fontWeight: filter === f ? 700 : 500, fontSize: 13, cursor: "pointer" }}>{f}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>No doctor registrations found</div>
        ) : (
          filtered.map(doc => (
            <div key={doc.doctorId} style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", overflow: "hidden" }}>
                {doc.profilePicture ? <img src={doc.profilePicture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <DoctorIcon />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>Dr. {doc.firstName} {doc.lastName}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{doc.specialization} · License: {doc.licenseNumber}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{doc.email} · {doc.phoneNumber}</div>
              </div>
              <StatusBadge status={doc.status} />
              {doc.status === "PENDING" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => onApprove(doc.doctorId)} disabled={loading} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, opacity: loading ? 0.6 : 1 }}>
                    <CheckIcon /> Approve
                  </button>
                  <button onClick={() => onReject(doc.doctorId)} disabled={loading} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, opacity: loading ? 0.6 : 1 }}>
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
};

// ── Secretary Assignments Tab ─────────────────────────────────────────────
const SecretaryAssignmentsTab = ({ assignments }) => (
  <div style={{ padding: "32px", maxWidth: 1000, margin: "0 auto" }}>
    <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Secretary Assignments</h2>
    <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>
      All approved secretary–doctor relationships in the system
    </p>

    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {assignments.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 16, padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          No secretary assignments yet
        </div>
      ) : (
        assignments.map(a => (
          <div key={a.secretaryId} style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Secretary */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#9333ea)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                  <UserIcon />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>SECRETARY</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{a.secretaryName}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{a.secretaryEmail}</div>
                </div>
              </div>
              {/* Arrow */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 8px" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LinkIcon stroke="#fff" />
                </div>
                <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>ASSIGNED TO</span>
              </div>
              {/* Doctor */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                  <DoctorIcon />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>DOCTOR</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{a.doctorName}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{a.specialization}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{a.doctorEmail}</div>
                </div>
              </div>
              {/* Status */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <span style={{ background: "#dcfce7", color: "#166534", border: "1px solid #86efac", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>● Active</span>
                {a.assignedSince && (
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>
                    Since {new Date(a.assignedSince).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// ── Block Confirmation Modal ──────────────────────────────────────────────
const BlockConfirmModal = ({ user, onConfirm, onCancel }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 420, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
      {/* Icon */}
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#fef2f2,#fee2e2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" width="28" height="28">
          <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
      </div>
      {/* Title */}
      <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", textAlign: "center", marginBottom: 10 }}>
        Block Account
      </h3>
      {/* Message */}
      <p style={{ fontSize: 14, color: "#475569", textAlign: "center", lineHeight: 1.6, marginBottom: 8 }}>
        You are about to block the account of <strong style={{ color: "#0f172a" }}>{user.firstName} {user.lastName}</strong>.
      </p>
      <p style={{ fontSize: 13, color: "#64748b", textAlign: "center", lineHeight: 1.6, marginBottom: 28, background: "#fef9c3", border: "1px solid #fde047", borderRadius: 10, padding: "10px 14px" }}>
        This user will be <strong>immediately denied access</strong> to the MediCore system. They will see a formal notice informing them that their account has been suspended by the administrator.
      </p>
      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={onConfirm} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Yes, Block Account
        </button>
      </div>
    </div>
  </div>
);

// ── Delete Confirmation Modal ─────────────────────────────────────────────
const DeleteConfirmModal = ({ user, onConfirm, onCancel }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 420, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
      {/* Icon */}
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#fef2f2,#fee2e2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" width="28" height="28">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </div>
      {/* Title */}
      <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", textAlign: "center", marginBottom: 10 }}>
        Remove User
      </h3>
      {/* Message */}
      <p style={{ fontSize: 14, color: "#475569", textAlign: "center", lineHeight: 1.6, marginBottom: 8 }}>
        You are about to permanently remove <strong style={{ color: "#0f172a" }}>{user.firstName} {user.lastName}</strong> from the system.
      </p>
      <p style={{ fontSize: 13, color: "#64748b", textAlign: "center", lineHeight: 1.6, marginBottom: 28, background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px 14px" }}>
        This action is <strong>permanent and cannot be undone</strong>. The user's account and all associated data will be deleted from the MediCore system.
      </p>
      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={onConfirm} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Yes, Remove User
        </button>
      </div>
    </div>
  </div>
);
const ManageUsersTab = ({ users, onDelete, onBlock, onUnblock, loading }) => {
  const [filter, setFilter] = useState("ALL");
  const [blockTarget, setBlockTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // user object pending delete confirmation
  const roles = ["ALL", "ADMIN", "DOCTOR", "SECRETARY", "PATIENT"];
  const filtered = filter === "ALL" ? users : users.filter(u => (u.role || "").toUpperCase() === filter);

  return (
    <div style={{ padding: "32px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Block confirmation modal */}
      {blockTarget && (
        <BlockConfirmModal
          user={blockTarget}
          onConfirm={() => { onBlock(blockTarget.userId); setBlockTarget(null); }}
          onCancel={() => setBlockTarget(null)}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          user={deleteTarget}
          onConfirm={() => { onDelete(deleteTarget.userId); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Manage Users</h2>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>View, block/unblock, and remove users from the system</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {roles.map(r => (
          <button key={r} onClick={() => setFilter(r)} style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid", borderColor: filter === r ? "#f59e0b" : "#e2e8f0", background: filter === r ? "#fffbeb" : "#fff", color: filter === r ? "#d97706" : "#64748b", fontWeight: filter === r ? 700 : 500, fontSize: 13, cursor: "pointer" }}>{r}</button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        {/* Table header — added extra column for Block action */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1fr auto auto", padding: "12px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", gap: 12 }}>
          {["Name", "Email", "Role", "Status", "Block", "Remove"].map((h) => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No users found</div>
        ) : (
          filtered.map(user => {
            // FIX: AdminController always returns userId (not id), use it directly
            const userId = user.userId;
            const isBlocked = (user.status || "ACTIVE").toUpperCase() === "BLOCKED";

            return (
              <div
                key={userId}
                style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1fr auto auto", padding: "14px 20px", borderBottom: "1px solid #f1f5f9", alignItems: "center", gap: 12, transition: "background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {/* Name */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: isBlocked ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#2563eb,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><UserIcon /></div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{user.firstName} {user.lastName}</div>
                </div>

                {/* Email */}
                <div style={{ fontSize: 13, color: "#475569" }}>{user.email}</div>

                {/* Role — read-only badge, fixed at registration */}
                <StatusBadge status={(user.role || "PATIENT").toUpperCase()} />

                {/* Status — now reads real status from API */}
                <StatusBadge status={user.status || "ACTIVE"} />

                {/* Block / Unblock button */}
                {isBlocked ? (
                  <button
                    onClick={() => onUnblock(userId)}
                    disabled={loading}
                    title="Restore access for this user"
                    style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #bbf7d0", background: "#fff", color: "#059669", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, opacity: loading ? 0.6 : 1 }}
                  >
                    <UnblockIcon /> Unblock
                  </button>
                ) : (
                  <button
                    onClick={() => setBlockTarget(user)}
                    disabled={loading}
                    title="Block this user's access to the system"
                    style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #fed7aa", background: "#fff", color: "#ea580c", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, opacity: loading ? 0.6 : 1 }}
                  >
                    <BlockIcon /> Block
                  </button>
                )}

                {/* Remove button — opens confirmation modal */}
                <button
                  onClick={() => setDeleteTarget(user)}
                  disabled={loading}
                  style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fff", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, opacity: loading ? 0.6 : 1 }}
                >
                  <TrashIcon /> Remove
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [tab, setTab]                     = useState("dashboard");
  const [users, setUsers]                 = useState([]);
  const [doctors, setDoctors]             = useState([]);
  const [assignments, setAssignments]     = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [toast, setToast]                 = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async () => {
    try { const data = await adminApi.getAllUsers(); setUsers(Array.isArray(data) ? data : []); }
    catch { setUsers([]); }
  }, []);

  const fetchDoctors = useCallback(async () => {
    try { const data = await adminApi.getAllDoctors(); setDoctors(Array.isArray(data) ? data : []); }
    catch { setDoctors([]); }
  }, []);

  const fetchAssignments = useCallback(async () => {
    try { const data = await adminApi.getSecretaryAssignments(); setAssignments(Array.isArray(data) ? data : []); }
    catch { setAssignments([]); }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchDoctors();
    fetchAssignments();
  }, [fetchUsers, fetchDoctors, fetchAssignments]);

  const handleApproveDoctor = async (doctorId) => {
    setLoadingAction(true);
    try { await adminApi.approveDoctor(doctorId); showToast("Doctor approved successfully!"); fetchDoctors(); }
    catch (e) { showToast(e.message, "error"); }
    finally { setLoadingAction(false); }
  };

  const handleRejectDoctor = async (doctorId) => {
    setLoadingAction(true);
    try { await adminApi.rejectDoctor(doctorId); showToast("Doctor registration rejected."); fetchDoctors(); }
    catch (e) { showToast(e.message, "error"); }
    finally { setLoadingAction(false); }
  };

  const handleDeleteUser = async (userId) => {
    setLoadingAction(true);
    try { await adminApi.deleteUser(userId); showToast("User removed successfully."); fetchUsers(); }
    catch (e) { showToast(e.message, "error"); }
    finally { setLoadingAction(false); }
  };

  const handleRoleChange = async (userId, role) => {
    setLoadingAction(true);
    try { await adminApi.updateUserRole(userId, role); showToast(`Role updated to ${role}.`); fetchUsers(); }
    catch (e) { showToast(e.message, "error"); }
    finally { setLoadingAction(false); }
  };

  // Block handler — confirmation is handled by BlockConfirmModal
  const handleBlockUser = async (userId) => {
    setLoadingAction(true);
    try { await adminApi.blockUser(userId); showToast("Account has been blocked."); fetchUsers(); }
    catch (e) { showToast(e.message, "error"); }
    finally { setLoadingAction(false); }
  };

  // NEW: Unblock handler
  const handleUnblockUser = async (userId) => {
    setLoadingAction(true);
    try { await adminApi.unblockUser(userId); showToast("User has been unblocked."); fetchUsers(); }
    catch (e) { showToast(e.message, "error"); }
    finally { setLoadingAction(false); }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8faff 0%,#f0f4ff 100%)", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <Navbar onLogout={handleLogout} />
      <TabBar active={tab} onChange={setTab} />

      {toast && (
        <div style={{ position: "fixed", top: 80, right: 24, zIndex: 999, background: toast.type === "error" ? "#fee2e2" : "#dcfce7", border: `1px solid ${toast.type === "error" ? "#fca5a5" : "#86efac"}`, color: toast.type === "error" ? "#991b1b" : "#166534", padding: "12px 20px", borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
          {toast.msg}
        </div>
      )}

      {tab === "dashboard"   && <DashboardTab users={users} doctors={doctors} assignments={assignments} onGoTo={setTab} />}
      {tab === "doctors"     && <DoctorRegistrationsTab doctors={doctors} onApprove={handleApproveDoctor} onReject={handleRejectDoctor} loading={loadingAction} />}
      {tab === "secretaries" && <SecretaryAssignmentsTab assignments={assignments} />}
      {tab === "users"       && (
        <ManageUsersTab
          users={users}
          onDelete={handleDeleteUser}
          onBlock={handleBlockUser}
          onUnblock={handleUnblockUser}
          loading={loadingAction}
        />
      )}
    </div>
  );
}
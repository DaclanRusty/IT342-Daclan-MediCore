package edu.cit.daclan.medicore.feature.appointment.service;

import edu.cit.daclan.medicore.feature.appointment.entity.Appointment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class AppointmentEmailService {

    private final JavaMailSender mailSender;

    public AppointmentEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // ── Public triggers ───────────────────────────────────────────────────

    public void sendConfirmed(Appointment a) {
        String doctor = "Dr. " + a.getDoctor().getUser().getFirstName()
                + " " + a.getDoctor().getUser().getLastName();
        send(
                a.getPatient().getUser().getEmail(),
                "✅ Appointment Confirmed — MediCore",
                buildConfirmedHtml(
                        a.getPatient().getUser().getFirstName(),
                        doctor,
                        a.getDoctor().getSpecialization(),
                        a.getRequestedDate(),
                        a.getRequestedTime()
                )
        );
    }

    public void sendCompleted(Appointment a) {
        String doctor = "Dr. " + a.getDoctor().getUser().getFirstName()
                + " " + a.getDoctor().getUser().getLastName();
        send(
                a.getPatient().getUser().getEmail(),
                "📋 Consultation Completed — MediCore",
                buildCompletedHtml(
                        a.getPatient().getUser().getFirstName(),
                        doctor,
                        a.getRequestedDate(),
                        a.getDoctorNotes()
                )
        );
    }

    public void sendRejected(Appointment a) {
        String doctor = "Dr. " + a.getDoctor().getUser().getFirstName()
                + " " + a.getDoctor().getUser().getLastName();
        send(
                a.getPatient().getUser().getEmail(),
                "❌ Appointment Not Approved — MediCore",
                buildRejectedHtml(
                        a.getPatient().getUser().getFirstName(),
                        doctor,
                        a.getDoctor().getSpecialization(),
                        a.getRequestedDate(),
                        a.getRequestedTime(),
                        a.getRejectedReason()
                )
        );
    }

    public void sendCancelled(Appointment a) {
        String doctor = "Dr. " + a.getDoctor().getUser().getFirstName()
                + " " + a.getDoctor().getUser().getLastName();
        send(
                a.getPatient().getUser().getEmail(),
                "❌ Appointment Cancelled — MediCore",
                buildCancelledHtml(
                        a.getPatient().getUser().getFirstName(),
                        doctor,
                        a.getRequestedDate(),
                        a.getRequestedTime(),
                        a.getCancelReason()
                )
        );
    }

    public void sendExpired(Appointment a) {
        String doctor = "Dr. " + a.getDoctor().getUser().getFirstName()
                + " " + a.getDoctor().getUser().getLastName();
        send(
                a.getPatient().getUser().getEmail(),
                "⏰ Appointment Expired — MediCore",
                buildExpiredHtml(
                        a.getPatient().getUser().getFirstName(),
                        doctor,
                        a.getDoctor().getSpecialization(),
                        a.getRequestedDate(),
                        a.getRequestedTime()
                )
        );
    }

    // ── Email sender ──────────────────────────────────────────────────────

    private void send(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setFrom("noreply@medicore.app");
            helper.setText(html, true);
            mailSender.send(msg);
        } catch (MessagingException e) {
            System.err.println("[AppointmentEmailService] Failed to send email to " + to + ": " + e.getMessage());
        }
    }

    // ── HTML templates ────────────────────────────────────────────────────

    private String buildConfirmedHtml(String patient, String doctor, String spec, String date, String time) {
        return wrap("Your Appointment is Confirmed ✅",
                "<p style='margin:0 0 16px'>Hi <strong>" + patient + "</strong>,</p>" +
                        "<p style='margin:0 0 20px'>Your appointment has been confirmed by the clinic. Here are your details:</p>" +
                        infoBox(row("Doctor", doctor), row("Specialization", spec), row("Date", date), row("Time", time)) +
                        tipBox("Please arrive 10–15 minutes before your scheduled time and bring any relevant medical records.")
        );
    }

    private String buildCompletedHtml(String patient, String doctor, String date, String notes) {
        String notesSection = (notes != null && !notes.isBlank())
                ? "<div style='background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;margin-top:20px'>" +
                "<div style='font-size:12px;font-weight:700;color:#2563eb;letter-spacing:0.5px;margin-bottom:8px'>DOCTOR'S NOTES</div>" +
                "<p style='margin:0;color:#1e3a8a;font-size:14px;line-height:1.7'>" + notes + "</p></div>"
                : "<p style='color:#64748b;font-style:italic;margin-top:16px'>No notes were added for this consultation.</p>";

        return wrap("Consultation Completed 📋",
                "<p style='margin:0 0 16px'>Hi <strong>" + patient + "</strong>,</p>" +
                        "<p style='margin:0 0 20px'>Your consultation with <strong>" + doctor + "</strong> on <strong>" + date + "</strong> has been completed.</p>" +
                        notesSection +
                        tipBox("If you have follow-up concerns, please book a new appointment through the MediCore app.")
        );
    }

    private String buildRejectedHtml(String patient, String doctor, String spec, String date, String time, String reason) {
        return wrap("Appointment Not Approved ❌",
                "<p style='margin:0 0 16px'>Hi <strong>" + patient + "</strong>,</p>" +
                        "<p style='margin:0 0 20px'>Unfortunately, your appointment request was <strong>not approved</strong> by the clinic secretary. Here are the details:</p>" +
                        infoBox(row("Doctor", doctor), row("Specialization", spec), row("Date", date), row("Time", time),
                                row("Reason", reason != null && !reason.isBlank() ? reason : "No reason provided")) +
                        "<div style='background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;margin-top:20px;font-size:13px;color:#991b1b'>" +
                        "❌ Your appointment was reviewed and could not be accommodated at the requested schedule.</div>" +
                        tipBox("Please book a new appointment at a different date or time. We apologize for the inconvenience.")
        );
    }

    private String buildCancelledHtml(String patient, String doctor, String date, String time, String reason) {
        return wrap("Appointment Cancelled ❌",
                "<p style='margin:0 0 16px'>Hi <strong>" + patient + "</strong>,</p>" +
                        "<p style='margin:0 0 20px'>Unfortunately, your appointment has been cancelled. Details below:</p>" +
                        infoBox(row("Doctor", doctor), row("Date", date), row("Time", time),
                                row("Reason", reason != null && !reason.isBlank() ? reason : "No reason provided")) +
                        tipBox("You can book a new appointment anytime through the MediCore app.")
        );
    }

    private String buildExpiredHtml(String patient, String doctor, String spec, String date, String time) {
        return wrap("Appointment Expired ⏰",
                "<p style='margin:0 0 16px'>Hi <strong>" + patient + "</strong>,</p>" +
                        "<p style='margin:0 0 20px'>Your pending appointment was <strong>automatically expired</strong> because it was not confirmed by the clinic before the scheduled date.</p>" +
                        infoBox(row("Doctor", doctor), row("Specialization", spec), row("Date", date), row("Time", time)) +
                        "<div style='background:#fef9c3;border:1px solid #fde047;border-radius:10px;padding:14px 16px;margin-top:20px;font-size:13px;color:#854d0e'>" +
                        "⏰ This appointment was automatically expired because it remained unconfirmed one day before the scheduled date.</div>" +
                        tipBox("Please book a new appointment at a different date or contact the clinic directly.")
        );
    }

    // ── HTML helpers ──────────────────────────────────────────────────────

    private String wrap(String title, String content) {
        return "<!DOCTYPE html><html><body style='margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif'>" +
                "<div style='max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)'>" +
                "<div style='background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:28px 32px'>" +
                "<div style='font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.3px'>MediCore</div>" +
                "<div style='font-size:13px;color:rgba(255,255,255,.75);margin-top:4px'>Patient Management System</div></div>" +
                "<div style='padding:28px 32px 0'>" +
                "<h2 style='margin:0 0 8px;font-size:20px;font-weight:800;color:#0f172a'>" + title + "</h2>" +
                "<div style='height:2px;width:48px;background:#2563eb;border-radius:2px;margin-bottom:20px'></div></div>" +
                "<div style='padding:0 32px 28px'>" + content + "</div>" +
                "<div style='background:#f8fafc;padding:18px 32px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center'>" +
                "This email was sent by MediCore Patient Management System. Please do not reply to this email.</div>" +
                "</div></body></html>";
    }

    private String infoBox(String... rows) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div style='background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:4px 0;margin:16px 0'>");
        for (String r : rows) sb.append(r);
        sb.append("</div>");
        return sb.toString();
    }

    private String row(String label, String value) {
        return "<div style='display:flex;padding:11px 16px;border-bottom:1px solid #f1f5f9'>" +
                "<div style='font-size:12px;font-weight:700;color:#94a3b8;width:130px;flex-shrink:0;text-transform:uppercase;letter-spacing:0.4px;padding-top:1px'>" + label + "</div>" +
                "<div style='font-size:13.5px;color:#0f172a;font-weight:500'>" + (value != null ? value : "—") + "</div></div>";
    }

    private String tipBox(String tip) {
        return "<div style='background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;margin-top:20px;font-size:13px;color:#92400e'>" +
                "💡 " + tip + "</div>";
    }
}
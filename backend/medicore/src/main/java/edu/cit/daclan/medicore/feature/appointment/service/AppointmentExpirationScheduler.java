package edu.cit.daclan.medicore.feature.appointment.service;

import edu.cit.daclan.medicore.feature.appointment.entity.Appointment;
import edu.cit.daclan.medicore.feature.appointment.entity.AppointmentStatus;
import edu.cit.daclan.medicore.feature.appointment.repository.AppointmentRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class AppointmentExpirationScheduler {

    private final AppointmentRepository   appointmentRepository;
    private final AppointmentEmailService emailService;

    public AppointmentExpirationScheduler(
            AppointmentRepository appointmentRepository,
            AppointmentEmailService emailService) {
        this.appointmentRepository = appointmentRepository;
        this.emailService          = emailService;
    }


    @Scheduled(cron = "0 0 * * * *")
    public void expirePendingAppointments() {
        LocalDateTime now = LocalDateTime.now();

        List<Appointment> toExpire = appointmentRepository
                .findAllByStatus(AppointmentStatus.PENDING)
                .stream()
                .filter(a -> isExpired(a, now))
                .toList();

        if (toExpire.isEmpty()) return;

        System.out.println("[Scheduler] Expiring " + toExpire.size() + " pending appointment(s).");

        toExpire.forEach(a -> {
            a.setStatus(AppointmentStatus.EXPIRED);
            a.setExpiredAt(LocalDateTime.now());
            appointmentRepository.save(a);
            try { emailService.sendExpired(a); }
            catch (Exception e) {
                System.err.println("[Scheduler] Email failed for appointment " + a.getId() + ": " + e.getMessage());
            }
        });

        System.out.println("[Scheduler] Done — " + toExpire.size() + " appointment(s) marked EXPIRED.");
    }


    private boolean isExpired(Appointment a, LocalDateTime now) {
        try {
            String dateStr = a.getRequestedDate();
            String timeStr = a.getRequestedTime(); // e.g. "08:00 AM" or "08:00"

            if (dateStr == null) return false;

            LocalDate date = LocalDate.parse(dateStr); // "yyyy-MM-dd"
            LocalTime time = parseTime(timeStr);        // parse time flexibly
            LocalDateTime apptDateTime = LocalDateTime.of(date, time);

            // Expire if we are within 24 hours of the appointment
            return now.isAfter(apptDateTime.minusHours(24));

        } catch (Exception e) {
            System.err.println("[Scheduler] Could not parse appointment " + a.getId() + ": " + e.getMessage());
            return false;
        }
    }

    private LocalTime parseTime(String timeStr) {
        if (timeStr == null || timeStr.isBlank()) return LocalTime.MIDNIGHT;
        try {
            // Try "hh:mm a" (12-hour with AM/PM)
            return LocalTime.parse(timeStr.trim().toUpperCase(),
                    DateTimeFormatter.ofPattern("hh:mm a"));
        } catch (DateTimeParseException e1) {
            try {
                // Try "HH:mm" (24-hour)
                return LocalTime.parse(timeStr.trim(),
                        DateTimeFormatter.ofPattern("HH:mm"));
            } catch (DateTimeParseException e2) {
                return LocalTime.MIDNIGHT;
            }
        }
    }
}
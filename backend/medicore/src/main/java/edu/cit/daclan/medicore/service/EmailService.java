package edu.cit.daclan.medicore.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendWelcomeEmail(String toEmail, String firstName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("your-gmail@gmail.com"); // ← replace with your Gmail
            helper.setTo(toEmail);
            helper.setSubject("Welcome to MediCore 🏥");
            helper.setText(buildWelcomeHtml(firstName), true); // true = HTML

            mailSender.send(message);
        } catch (Exception e) {
            // Don't fail registration if email fails — just log it
            System.err.println("Failed to send welcome email to " + toEmail + ": " + e.getMessage());
        }
    }

    private String buildWelcomeHtml(String firstName) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8"/>
              <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4ff; margin: 0; padding: 0; }
                .container { max-width: 560px; margin: 40px auto; background: #ffffff;
                             border-radius: 16px; overflow: hidden;
                             box-shadow: 0 8px 32px rgba(37,99,235,0.12); }
                .header { background: linear-gradient(135deg, #2563eb, #1d4ed8);
                          padding: 36px 40px; text-align: center; }
                .logo { font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
                .logo span { color: #93c5fd; }
                .badge { display: inline-block; background: rgba(255,255,255,0.2);
                         color: #fff; font-size: 12px; font-weight: 600;
                         padding: 4px 14px; border-radius: 20px; margin-top: 10px; }
                .body { padding: 36px 40px; }
                .greeting { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
                .text { font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 20px; }
                .highlight { background: #eff6ff; border-left: 4px solid #2563eb;
                             border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;
                             font-size: 14px; color: #1e40af; font-weight: 500; }
                .btn { display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8);
                       color: #ffffff; text-decoration: none; padding: 14px 32px;
                       border-radius: 10px; font-weight: 700; font-size: 15px;
                       box-shadow: 0 4px 14px rgba(37,99,235,0.35); }
                .btn-wrap { text-align: center; margin-bottom: 28px; }
                .footer { background: #f8fafc; padding: 20px 40px; text-align: center;
                          font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">Medi<span>Core</span></div>
                  <div class="badge">Patient Portal</div>
                </div>
                <div class="body">
                  <div class="greeting">Welcome, %s! 👋</div>
                  <p class="text">
                    Your MediCore account has been successfully created. You can now book
                    appointments with our trusted doctors anytime, anywhere.
                  </p>
                  <div class="highlight">
                    ✅ Your account is active and ready to use.
                  </div>
                  <p class="text">Here's what you can do with MediCore:</p>
                  <p class="text">
                    📅 <strong>Book appointments</strong> with verified doctors<br/>
                    📋 <strong>Manage your health records</strong> securely<br/>
                    🔔 <strong>Get notified</strong> on appointment updates
                  </p>
                  <div class="btn-wrap">
                    <a href="http://localhost:3000/login" class="btn">Go to MediCore →</a>
                  </div>
                  <p class="text" style="font-size:13px; color:#94a3b8;">
                    If you didn't create this account, please ignore this email.
                  </p>
                </div>
                <div class="footer">
                  © 2026 MediCore. All rights reserved.<br/>
                  Cebu City, Philippines
                </div>
              </div>
            </body>
            </html>
            """.formatted(firstName);
    }
}
package tech.ouss.backend.services;

import jakarta.mail.internet.MimeMessage; // Import MimeMessage
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper; // Import MimeMessageHelper
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends an email, optionally with HTML content.
     *
     * @param to The recipient's email address.
     * @param subject The subject of the email.
     * @param body The body/content of the email (can be HTML).
     * @param isHtml Set to true if the body contains HTML.
     */
    public void sendEmail(String to, String subject, String body, boolean isHtml) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8"); // true enables multipart message (for HTML)

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, isHtml); // Set the body and specify if it's HTML

            // Set the sender with a personal name
            helper.setFrom("Job Maroc <" + senderEmail + ">");

            mailSender.send(message);
            System.out.println("Email sent successfully to " + to);
        } catch (MailException e) {
            System.err.println("Error sending email to " + to + ": " + e.getMessage());
            e.printStackTrace();
        } catch (jakarta.mail.MessagingException e) { // Catch MessagingException for MimeMessageHelper issues
            System.err.println("Error preparing email message for " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    // You can keep the simpleSendEmail or just use the new sendEmail method
    // public void sendSimpleEmail(String to, String subject, String body) {
    //     sendEmail(to, subject, body, false); // Call the new method with isHtml = false
    // }
}

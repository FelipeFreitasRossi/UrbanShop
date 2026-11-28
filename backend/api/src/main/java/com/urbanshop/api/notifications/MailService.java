package com.urbanshop.api.notifications;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.urbanshop.api.config.AppProperties;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Envio de e-mails transacionais.
 * Sem servidor de e-mail configurado (MAIL_HOST vazio), o link aparece no console
 * da API — útil para testar o cadastro no computador.
 */
@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final String mailHost;
    private final String from;

    public MailService(ObjectProvider<JavaMailSender> mailSender,
            @Value("${spring.mail.host:}") String mailHost,
            AppProperties properties) {
        this.mailSender = mailSender;
        this.mailHost = mailHost;
        this.from = properties.mail() == null ? "no-reply@urbanshop.com" : properties.mail().from();
    }

    @Async
    public void sendEmailVerification(String to, String name, String link) {
        send(to, "Confirme seu e-mail — UrbanShop",
                layout("Olá, " + escape(firstName(name)) + "!",
                        "Falta só um passo para ativar sua conta UrbanShop e o seu cartão fidelidade.",
                        "Confirmar e-mail", link,
                        "O link vale por 24 horas. Se você não criou esta conta, ignore este e-mail."),
                "Confirmação de e-mail", link);
    }

    @Async
    public void sendPasswordReset(String to, String name, String link) {
        send(to, "Redefinição de senha — UrbanShop",
                layout("Olá, " + escape(firstName(name)) + "!",
                        "Recebemos um pedido para criar uma nova senha para a sua conta.",
                        "Criar nova senha", link,
                        "O link vale por 30 minutos e só pode ser usado uma vez. "
                                + "Se não foi você, ignore este e-mail: sua senha continua a mesma."),
                "Redefinição de senha", link);
    }

    private void send(String to, String subject, String html, String devLabel, String link) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (mailHost == null || mailHost.isBlank() || sender == null) {
            log.warn("[DEV] E-mail não configurado. {} para {}: {}", devLabel, to, link);
            return;
        }
        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            sender.send(message);
        } catch (MessagingException | RuntimeException e) {
            log.error("Falha ao enviar e-mail '{}' para {}", subject, to, e);
        }
    }

    private static String layout(String title, String text, String button, String link, String footer) {
        return """
                <div style="background:#000;padding:40px 16px;font-family:Arial,Helvetica,sans-serif">
                  <div style="max-width:520px;margin:0 auto;background:#0f0f0f;border:1px solid #2a2a2a;border-radius:14px;padding:32px;color:#f4f3ef">
                    <div style="font-size:22px;font-weight:900;letter-spacing:.5px">Urban<span style="font-weight:300">Shop</span><span style="color:#c8a75e">.</span></div>
                    <h1 style="font-size:22px;margin:28px 0 8px">%s</h1>
                    <p style="color:#bdbcb8;line-height:1.6;margin:0 0 24px">%s</p>
                    <a href="%s" style="display:inline-block;background:#c8a75e;color:#000;text-decoration:none;font-weight:700;padding:14px 26px;border-radius:999px">%s</a>
                    <p style="color:#8a8986;font-size:12px;line-height:1.6;margin:28px 0 0">%s</p>
                  </div>
                </div>
                """.formatted(title, text, link, button, footer);
    }

    private static String firstName(String name) {
        return name == null ? "" : name.trim().split("\\s+")[0];
    }

    private static String escape(String value) {
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}

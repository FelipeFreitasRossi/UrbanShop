package com.urbanshop.api.newsletter;

import java.time.Instant;
import java.util.Locale;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** POST /api/newsletter — inscrição com consentimento explícito (LGPD). */
@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {

    public record SubscribeRequest(
            @NotBlank(message = "Informe seu e-mail.") @Email(message = "Informe um e-mail válido.")
            @Size(max = 160) String email,
            @AssertTrue(message = "Para continuar, autorize o envio de comunicações.") boolean consent,
            @Size(max = 40) String source) {
    }

    private final NewsletterRepository repository;

    public NewsletterController(NewsletterRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<Void> subscribe(@Valid @RequestBody SubscribeRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        Instant now = Instant.now();
        NewsletterSubscriber subscriber = repository.findByEmail(email).orElseGet(() -> {
            NewsletterSubscriber s = new NewsletterSubscriber();
            s.setEmail(email);
            s.setCreatedAt(now);
            return s;
        });
        subscriber.setActive(true);
        subscriber.setConsentedAt(now);
        subscriber.setSource(request.source() == null ? "site" : request.source());
        repository.save(subscriber);
        // Mesma resposta para e-mail novo ou já inscrito.
        return ResponseEntity.noContent().build();
    }
}

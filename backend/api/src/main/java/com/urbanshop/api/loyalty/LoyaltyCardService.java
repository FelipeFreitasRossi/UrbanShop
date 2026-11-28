package com.urbanshop.api.loyalty;

import java.security.SecureRandom;
import java.time.Instant;

import org.springframework.stereotype.Service;

/** Criação do cartão fidelidade. Pontuação e resgates chegam na Etapa 7. */
@Service
public class LoyaltyCardService {

    private final LoyaltyCardRepository repository;
    private final SecureRandom random = new SecureRandom();

    public LoyaltyCardService(LoyaltyCardRepository repository) {
        this.repository = repository;
    }

    /** Cria o cartão do cliente (chamado dentro da transação de cadastro). */
    public LoyaltyCard createFor(String userId) {
        LoyaltyCard card = new LoyaltyCard();
        card.setUserId(userId);
        card.setCardNumber(newCardNumber());
        card.setTier(LoyaltyTier.URBAN_BASIC);
        card.setPointsBalance(0);
        card.setLifetimePoints(0);
        card.setCreatedAt(Instant.now());
        card.setUpdatedAt(Instant.now());
        return repository.save(card);
    }

    private String newCardNumber() {
        String number;
        do {
            number = "URB-%04d-%04d-%04d".formatted(
                    random.nextInt(10_000), random.nextInt(10_000), random.nextInt(10_000));
        } while (repository.existsByCardNumber(number));
        return number;
    }
}

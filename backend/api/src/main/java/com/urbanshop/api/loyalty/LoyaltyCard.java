package com.urbanshop.api.loyalty;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Cartão fidelidade digital (coleção "loyalty_cards"). Cada cliente tem exatamente um,
 * criado automaticamente no cadastro.
 *
 * O saldo de pontos só é alterado pelo backend, por meio de movimentações
 * registradas em "loyalty_transactions" (Etapa 7). O app nunca define pontos.
 */
@Document(collection = "loyalty_cards")
public class LoyaltyCard {

    @Id
    private String id;

    @Indexed(name = "userId_1", unique = true)
    private String userId;

    /** Número exibido no cartão (ex.: URB-4821-9930-1174). */
    @Indexed(name = "cardNumber_1", unique = true)
    private String cardNumber;

    private LoyaltyTier tier = LoyaltyTier.URBAN_BASIC;

    private long pointsBalance;

    /** Total de pontos já recebidos (usado na progressão de nível). */
    private long lifetimePoints;

    private Instant createdAt;

    private Instant updatedAt;

    @Version
    private Long version;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public LoyaltyTier getTier() {
        return tier;
    }

    public void setTier(LoyaltyTier tier) {
        this.tier = tier;
    }

    public long getPointsBalance() {
        return pointsBalance;
    }

    public void setPointsBalance(long pointsBalance) {
        this.pointsBalance = pointsBalance;
    }

    public long getLifetimePoints() {
        return lifetimePoints;
    }

    public void setLifetimePoints(long lifetimePoints) {
        this.lifetimePoints = lifetimePoints;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }
}

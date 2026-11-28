package com.urbanshop.api.auth;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Token de uso único enviado por e-mail (confirmação de conta ou redefinição de senha).
 * Só o hash SHA-256 fica no banco; o MongoDB apaga o registro sozinho quando expira.
 */
@Document(collection = "auth_tokens")
public class AuthToken {

    public enum Type { EMAIL_VERIFICATION, PASSWORD_RESET }

    @Id
    private String id;

    @Indexed(name = "userId_1")
    private String userId;

    private Type type;

    @Indexed(name = "tokenHash_1", unique = true)
    private String tokenHash;

    /** Índice TTL: o documento é removido automaticamente após esta data. */
    @Indexed(name = "expiresAt_1", expireAfterSeconds = 0)
    private Instant expiresAt;

    private Instant usedAt;

    private Instant createdAt;

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

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(Instant usedAt) {
        this.usedAt = usedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

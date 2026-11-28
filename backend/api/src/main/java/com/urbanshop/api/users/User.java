package com.urbanshop.api.users;

import java.time.Instant;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.Set;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Cliente ou administrador (coleção "users").
 *
 * Dados sensíveis:
 * - passwordHash: senha em BCrypt (a senha real nunca é guardada).
 * - cpfEncrypted: CPF criptografado (AES-256-GCM).
 * - cpfFingerprint: impressão digital do CPF, só para impedir cadastro duplicado.
 */
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String phone;

    private String cpfEncrypted;

    @Indexed(unique = true, sparse = true)
    private String cpfFingerprint;

    private LocalDate birthDate;

    private String passwordHash;

    private Set<Role> roles = EnumSet.of(Role.CUSTOMER);

    private boolean emailVerified;

    private boolean active = true;

    private Consents consents;

    /** Tentativas de login erradas seguidas (bloqueio temporário após 5). */
    private int failedLoginAttempts;

    private Instant lockedUntil;

    private Instant lastLoginAt;

    @Indexed
    private Instant createdAt;

    private Instant updatedAt;

    @Version
    private Long version;

    /** Registro dos consentimentos (LGPD): o que foi aceito e quando. */
    public record Consents(
            Instant termsAcceptedAt,
            boolean marketing,
            Instant marketingUpdatedAt,
            boolean birthdayCampaigns,
            Instant birthdayCampaignsUpdatedAt) {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCpfEncrypted() {
        return cpfEncrypted;
    }

    public void setCpfEncrypted(String cpfEncrypted) {
        this.cpfEncrypted = cpfEncrypted;
    }

    public String getCpfFingerprint() {
        return cpfFingerprint;
    }

    public void setCpfFingerprint(String cpfFingerprint) {
        this.cpfFingerprint = cpfFingerprint;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Consents getConsents() {
        return consents;
    }

    public void setConsents(Consents consents) {
        this.consents = consents;
    }

    public int getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public void setFailedLoginAttempts(int failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public Instant getLockedUntil() {
        return lockedUntil;
    }

    public void setLockedUntil(Instant lockedUntil) {
        this.lockedUntil = lockedUntil;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(Instant lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
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

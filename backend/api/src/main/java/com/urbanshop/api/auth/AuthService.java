package com.urbanshop.api.auth;

import java.time.Duration;
import java.time.Instant;
import java.util.EnumSet;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.urbanshop.api.addresses.Address;
import com.urbanshop.api.addresses.AddressRepository;
import com.urbanshop.api.addresses.ViaCepClient;
import com.urbanshop.api.auth.dto.AuthDtos.AddressRequest;
import com.urbanshop.api.auth.dto.AuthDtos.LoginRequest;
import com.urbanshop.api.auth.dto.AuthDtos.LoginResponse;
import com.urbanshop.api.auth.dto.AuthDtos.RegisterRequest;
import com.urbanshop.api.auth.dto.AuthDtos.UserResponse;
import com.urbanshop.api.common.error.ApiException;
import com.urbanshop.api.common.security.CryptoService;
import com.urbanshop.api.common.validation.BrazilianDocuments;
import com.urbanshop.api.config.AppProperties;
import com.urbanshop.api.loyalty.LoyaltyCardService;
import com.urbanshop.api.notifications.MailService;
import com.urbanshop.api.users.Role;
import com.urbanshop.api.users.User;
import com.urbanshop.api.users.UserMapper;
import com.urbanshop.api.users.UserRepository;

/**
 * Regras de cadastro, login, confirmação de e-mail e redefinição de senha.
 */
@Service
public class AuthService {

    private static final int MAX_FAILED_LOGINS = 5;
    private static final Duration LOCK_DURATION = Duration.ofMinutes(15);
    private static final Duration EMAIL_TOKEN_TTL = Duration.ofHours(24);
    private static final Duration RESET_TOKEN_TTL = Duration.ofMinutes(30);

    private final UserRepository users;
    private final AddressRepository addresses;
    private final AuthTokenRepository tokens;
    private final LoyaltyCardService loyaltyCards;
    private final PasswordEncoder passwordEncoder;
    private final CryptoService crypto;
    private final JwtService jwt;
    private final MailService mail;
    private final ViaCepClient viaCep;
    private final UserMapper mapper;
    private final AppProperties properties;
    private final TransactionTemplate transaction;
    /** Hash usado quando o e-mail não existe, para o login demorar o mesmo tempo (evita descobrir e-mails). */
    private final String dummyHash;

    public AuthService(UserRepository users, AddressRepository addresses, AuthTokenRepository tokens,
            LoyaltyCardService loyaltyCards, PasswordEncoder passwordEncoder, CryptoService crypto,
            JwtService jwt, MailService mail, ViaCepClient viaCep, UserMapper mapper,
            AppProperties properties, PlatformTransactionManager transactionManager) {
        this.users = users;
        this.addresses = addresses;
        this.tokens = tokens;
        this.loyaltyCards = loyaltyCards;
        this.passwordEncoder = passwordEncoder;
        this.crypto = crypto;
        this.jwt = jwt;
        this.mail = mail;
        this.viaCep = viaCep;
        this.mapper = mapper;
        this.properties = properties;
        this.transaction = new TransactionTemplate(transactionManager);
        this.dummyHash = passwordEncoder.encode("urbanshop-dummy-password");
    }

    // =====================================================================
    // Cadastro
    // =====================================================================

    public void register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        String cpf = BrazilianDocuments.onlyDigits(request.cpf());
        String cpfFingerprint = crypto.fingerprint(cpf);

        if (users.existsByEmail(email)) {
            throw ApiException.conflict("email", "Este e-mail já está cadastrado. Tente entrar ou recuperar a senha.");
        }
        if (users.existsByCpfFingerprint(cpfFingerprint)) {
            throw ApiException.conflict("cpf", "Este CPF já está cadastrado em outra conta.");
        }

        AddressRequest addressRequest = request.address();
        boolean zipVerified = verifyZipCode(addressRequest);

        // Cliente + endereço + cartão fidelidade + token: tudo ou nada.
        record Created(User user, String rawToken) {
        }
        Created created = transaction.execute(status -> {
            Instant now = Instant.now();

            User user = new User();
            user.setName(request.name().trim().replaceAll("\\s+", " "));
            user.setEmail(email);
            user.setPhone(BrazilianDocuments.onlyDigits(request.phone()));
            user.setCpfEncrypted(crypto.encrypt(cpf));
            user.setCpfFingerprint(cpfFingerprint);
            user.setBirthDate(request.birthDate());
            user.setPasswordHash(passwordEncoder.encode(request.password()));
            user.setRoles(EnumSet.of(Role.CUSTOMER));
            user.setEmailVerified(false);
            user.setActive(true);
            boolean birthday = request.birthDate() != null && request.consents().birthdayCampaigns();
            user.setConsents(new User.Consents(now, request.consents().marketing(), now, birthday, now));
            user.setCreatedAt(now);
            user.setUpdatedAt(now);
            user = users.save(user);

            Address address = toAddress(addressRequest, user.getId(), zipVerified, now);
            address.setDefault(true);
            addresses.save(address);

            loyaltyCards.createFor(user.getId());

            String rawToken = createToken(user.getId(), AuthToken.Type.EMAIL_VERIFICATION, EMAIL_TOKEN_TTL);
            return new Created(user, rawToken);
        });

        // E-mail só depois que tudo foi salvo com sucesso.
        mail.sendEmailVerification(created.user().getEmail(), created.user().getName(),
                apiUrl() + "/api/auth/verify-email?token=" + created.rawToken());
    }

    /**
     * Confere o CEP no ViaCEP e se o estado informado bate com ele.
     * Se o ViaCEP estiver fora do ar, aceita o endereço marcado como "não verificado".
     */
    private boolean verifyZipCode(AddressRequest address) {
        String uf = address.state().toUpperCase(Locale.ROOT);
        if (!BrazilianDocuments.UFS.contains(uf)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Confira os campos destacados.",
                    Map.of("state", "Use a sigla do estado (ex.: SP)."));
        }
        ViaCepClient.Result result = viaCep.lookup(address.zipCode());
        return switch (result.status()) {
            case FOUND -> {
                if (result.state() != null && !result.state().equalsIgnoreCase(uf)) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Confira os campos destacados.",
                            Map.of("state", "Este CEP pertence a " + result.state() + "."));
                }
                yield true;
            }
            case NOT_FOUND -> throw new ApiException(HttpStatus.BAD_REQUEST, "Confira os campos destacados.",
                    Map.of("cep", "CEP não encontrado. Confira os números."));
            case UNAVAILABLE -> false;
        };
    }

    private static Address toAddress(AddressRequest r, String userId, boolean zipVerified, Instant now) {
        Address a = new Address();
        a.setUserId(userId);
        a.setLabel(r.label() == null || r.label().isBlank() ? "Principal" : r.label().trim());
        a.setZipCode(BrazilianDocuments.onlyDigits(r.zipCode()));
        a.setStreet(r.street().trim());
        a.setNumber(r.number().trim());
        a.setComplement(r.complement() == null || r.complement().isBlank() ? null : r.complement().trim());
        a.setNeighborhood(r.neighborhood().trim());
        a.setCity(r.city().trim());
        a.setState(r.state().toUpperCase(Locale.ROOT));
        a.setCountry("BR");
        a.setZipVerified(zipVerified);
        a.setCreatedAt(now);
        a.setUpdatedAt(now);
        return a;
    }

    // =====================================================================
    // Login
    // =====================================================================

    public LoginResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        User user = users.findByEmail(email).orElse(null);

        if (user == null) {
            passwordEncoder.matches(request.password(), dummyHash);
            throw ApiException.unauthorized("E-mail ou senha incorretos.");
        }

        Instant now = Instant.now();
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(now)) {
            throw ApiException.tooManyRequests(
                    "Muitas tentativas erradas. Por segurança, aguarde 15 minutos ou redefina sua senha.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= MAX_FAILED_LOGINS) {
                user.setLockedUntil(now.plus(LOCK_DURATION));
                user.setFailedLoginAttempts(0);
            }
            users.save(user);
            throw ApiException.unauthorized("E-mail ou senha incorretos.");
        }

        if (!user.isActive()) {
            throw ApiException.forbidden("Esta conta está desativada. Fale com o atendimento.");
        }
        if (!user.isEmailVerified()) {
            throw ApiException.forbidden("Confirme seu e-mail para entrar.");
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(now);
        users.save(user);

        return new LoginResponse(jwt.createToken(user), jwt.expiresInSeconds(), toResponse(user));
    }

    public UserResponse me(String userId) {
        User user = users.findById(userId)
                .filter(User::isActive)
                .orElseThrow(() -> ApiException.unauthorized("Sessão inválida. Entre novamente."));
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        return mapper.toResponse(user, addresses.findByUserIdOrderByCreatedAtAsc(user.getId()));
    }

    // =====================================================================
    // Confirmação de e-mail
    // =====================================================================

    /** @return true se o e-mail foi confirmado agora (ou já estava confirmado). */
    public boolean verifyEmail(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return false;
        }
        AuthToken token = tokens.findByTokenHashAndType(crypto.sha256(rawToken), AuthToken.Type.EMAIL_VERIFICATION)
                .orElse(null);
        if (token == null || token.getUsedAt() != null || token.getExpiresAt().isBefore(Instant.now())) {
            return false;
        }
        User user = users.findById(token.getUserId()).orElse(null);
        if (user == null) {
            return false;
        }
        user.setEmailVerified(true);
        user.setUpdatedAt(Instant.now());
        users.save(user);
        tokens.deleteByUserIdAndType(user.getId(), AuthToken.Type.EMAIL_VERIFICATION);
        return true;
    }

    /** Reenvia a confirmação. Responde igual exista ou não o e-mail (não revela cadastros). */
    public void resendVerification(String email) {
        users.findByEmail(normalizeEmail(email))
                .filter(u -> !u.isEmailVerified() && u.isActive())
                .ifPresent(user -> {
                    tokens.deleteByUserIdAndType(user.getId(), AuthToken.Type.EMAIL_VERIFICATION);
                    String raw = createToken(user.getId(), AuthToken.Type.EMAIL_VERIFICATION, EMAIL_TOKEN_TTL);
                    mail.sendEmailVerification(user.getEmail(), user.getName(),
                            apiUrl() + "/api/auth/verify-email?token=" + raw);
                });
    }

    // =====================================================================
    // Recuperação de senha
    // =====================================================================

    /** Envia o link de nova senha. Responde igual exista ou não o e-mail. */
    public void forgotPassword(String email) {
        users.findByEmail(normalizeEmail(email))
                .filter(User::isActive)
                .ifPresent(user -> {
                    tokens.deleteByUserIdAndType(user.getId(), AuthToken.Type.PASSWORD_RESET);
                    String raw = createToken(user.getId(), AuthToken.Type.PASSWORD_RESET, RESET_TOKEN_TTL);
                    mail.sendPasswordReset(user.getEmail(), user.getName(),
                            frontendUrl() + "/redefinir-senha?token=" + raw);
                });
    }

    public void resetPassword(String rawToken, String newPassword) {
        AuthToken token = tokens.findByTokenHashAndType(crypto.sha256(rawToken), AuthToken.Type.PASSWORD_RESET)
                .filter(t -> t.getUsedAt() == null && t.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> ApiException.badRequest(
                        "Este link expirou ou já foi usado. Peça um novo em \"Esqueci minha senha\"."));
        User user = users.findById(token.getUserId())
                .orElseThrow(() -> ApiException.badRequest("Este link não é mais válido."));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        // Quem recebeu o link no e-mail comprovou ser dono dele.
        user.setEmailVerified(true);
        user.setUpdatedAt(Instant.now());
        users.save(user);
        tokens.deleteByUserIdAndType(user.getId(), AuthToken.Type.PASSWORD_RESET);
    }

    // =====================================================================
    // Auxiliares
    // =====================================================================

    private String createToken(String userId, AuthToken.Type type, Duration ttl) {
        String raw = crypto.newUrlToken();
        AuthToken token = new AuthToken();
        token.setUserId(userId);
        token.setType(type);
        token.setTokenHash(crypto.sha256(raw));
        token.setCreatedAt(Instant.now());
        token.setExpiresAt(Instant.now().plus(ttl));
        tokens.save(token);
        return raw;
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    public String frontendUrl() {
        return trimSlash(properties.frontendUrl());
    }

    private String apiUrl() {
        return trimSlash(properties.apiUrl());
    }

    private static String trimSlash(String url) {
        return url == null ? "" : url.replaceAll("/+$", "");
    }
}

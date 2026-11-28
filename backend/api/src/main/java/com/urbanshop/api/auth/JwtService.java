package com.urbanshop.api.auth;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.urbanshop.api.config.AppProperties;
import com.urbanshop.api.users.User;

/** Gera o token de acesso (JWT) depois do login. */
@Service
public class JwtService {

    private final JwtEncoder encoder;
    private final Duration expiration;
    private final String issuer;

    public JwtService(JwtEncoder encoder, AppProperties properties) {
        this.encoder = encoder;
        this.expiration = properties.jwt().expiration() == null ? Duration.ofHours(2) : properties.jwt().expiration();
        this.issuer = properties.jwt().issuer() == null ? "urbanshop-api" : properties.jwt().issuer();
    }

    public String createToken(User user) {
        Instant now = Instant.now();
        List<String> roles = user.getRoles().stream().map(Enum::name).toList();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(now)
                .expiresAt(now.plus(expiration))
                .subject(user.getId())
                .claim("email", user.getEmail())
                .claim("roles", roles)
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public long expiresInSeconds() {
        return expiration.toSeconds();
    }
}

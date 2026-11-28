package com.urbanshop.api.config;

import java.util.Base64;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.nimbusds.jose.proc.SecurityContext;

/**
 * Tokens JWT assinados com HMAC-SHA256 (chave secreta de 256 bits do .env).
 * Usa a implementação oficial do Spring Security (Nimbus).
 */
@Configuration
public class JwtConfig {

    @Bean
    SecretKey jwtSecretKey(AppProperties properties) {
        String secret = properties.jwt() == null ? null : properties.jwt().secret();
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET não configurado. Rode o setup-env.ps1 para gerar o arquivo .env.");
        }
        byte[] key = Base64.getDecoder().decode(secret.trim());
        if (key.length < 32) {
            throw new IllegalStateException("JWT_SECRET precisa ter pelo menos 32 bytes (256 bits) em Base64.");
        }
        return new SecretKeySpec(key, "HmacSHA256");
    }

    @Bean
    JwtEncoder jwtEncoder(SecretKey jwtSecretKey) {
        return new NimbusJwtEncoder(new ImmutableSecret<SecurityContext>(jwtSecretKey));
    }

    @Bean
    JwtDecoder jwtDecoder(SecretKey jwtSecretKey) {
        return NimbusJwtDecoder.withSecretKey(jwtSecretKey).macAlgorithm(MacAlgorithm.HS256).build();
    }
}

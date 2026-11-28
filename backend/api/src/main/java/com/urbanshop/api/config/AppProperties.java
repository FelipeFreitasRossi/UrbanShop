package com.urbanshop.api.config;

import java.time.Duration;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configurações próprias da UrbanShop (prefixo "app." no application.properties).
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Jwt jwt,
        Security security,
        String frontendUrl,
        String apiUrl,
        Cors cors,
        Mail mail) {

    public record Jwt(String secret, Duration expiration, String issuer) {
    }

    public record Security(String dataKey) {
    }

    public record Cors(List<String> allowedOrigins) {
    }

    public record Mail(String from) {
    }
}

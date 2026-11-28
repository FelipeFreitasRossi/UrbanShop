package com.urbanshop.api.common.error;

import java.time.Instant;
import java.util.Map;

/**
 * Formato padrão de erro da API:
 * { "status": 400, "message": "...", "fieldErrors": { "cpf": "CPF inválido." }, "timestamp": "..." }
 */
public record ErrorResponse(int status, String message, Map<String, String> fieldErrors, Instant timestamp) {

    public static ErrorResponse of(int status, String message, Map<String, String> fieldErrors) {
        return new ErrorResponse(status, message, fieldErrors, Instant.now());
    }
}

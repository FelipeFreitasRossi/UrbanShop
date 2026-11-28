package com.urbanshop.api.common.error;

import java.util.Map;

import org.springframework.http.HttpStatus;

/**
 * Erro de negócio com status HTTP e mensagem amigável (em português) para o cliente.
 * Opcionalmente informa erros por campo, que o app mostra embaixo de cada input.
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final Map<String, String> fieldErrors;

    public ApiException(HttpStatus status, String message) {
        this(status, message, null);
    }

    public ApiException(HttpStatus status, String message, Map<String, String> fieldErrors) {
        super(message);
        this.status = status;
        this.fieldErrors = fieldErrors;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }

    public static ApiException badRequest(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }

    public static ApiException unauthorized(String message) {
        return new ApiException(HttpStatus.UNAUTHORIZED, message);
    }

    public static ApiException forbidden(String message) {
        return new ApiException(HttpStatus.FORBIDDEN, message);
    }

    public static ApiException notFound(String message) {
        return new ApiException(HttpStatus.NOT_FOUND, message);
    }

    public static ApiException conflict(String field, String message) {
        return new ApiException(HttpStatus.CONFLICT, message, Map.of(field, message));
    }

    public static ApiException tooManyRequests(String message) {
        return new ApiException(HttpStatus.TOO_MANY_REQUESTS, message);
    }
}

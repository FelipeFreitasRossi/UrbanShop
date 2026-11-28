package com.urbanshop.api.common.security;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Limite de tentativas por IP nas rotas sensíveis (login, cadastro, senha, newsletter).
 * Protege contra robôs que testam senhas em massa.
 *
 * Funciona em memória — suficiente para um servidor. Ao rodar várias instâncias
 * da API, trocar por um limitador compartilhado (ex.: Redis).
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RateLimitFilter extends OncePerRequestFilter {

    private record Rule(int maxRequests, Duration window) {
    }

    private static final Map<String, Rule> RULES = Map.of(
            "/api/auth/login", new Rule(10, Duration.ofMinutes(5)),
            "/api/auth/register", new Rule(5, Duration.ofMinutes(15)),
            "/api/auth/forgot-password", new Rule(5, Duration.ofMinutes(15)),
            "/api/auth/reset-password", new Rule(10, Duration.ofMinutes(15)),
            "/api/auth/resend-verification", new Rule(5, Duration.ofMinutes(15)),
            "/api/newsletter", new Rule(5, Duration.ofMinutes(15)));

    private final Map<String, Deque<Instant>> hits = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !"POST".equalsIgnoreCase(request.getMethod()) || !RULES.containsKey(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        Rule rule = RULES.get(path);
        String key = path + "|" + request.getRemoteAddr();
        Instant now = Instant.now();

        Deque<Instant> window = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        boolean blocked;
        synchronized (window) {
            while (!window.isEmpty() && window.peekFirst().isBefore(now.minus(rule.window()))) {
                window.pollFirst();
            }
            blocked = window.size() >= rule.maxRequests();
            if (!blocked) {
                window.addLast(now);
            }
        }

        if (blocked) {
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.setHeader("Retry-After", String.valueOf(rule.window().toSeconds()));
            response.getWriter().write(
                    "{\"status\":429,\"message\":\"Muitas tentativas. Aguarde um pouco e tente novamente.\"}");
            return;
        }

        // Limpeza ocasional para a memória não crescer sem limite.
        if (hits.size() > 10_000) {
            Instant cutoff = now.minus(Duration.ofHours(1));
            hits.entrySet().removeIf(e -> {
                synchronized (e.getValue()) {
                    Instant last = e.getValue().peekLast();
                    return last == null || last.isBefore(cutoff);
                }
            });
        }
        chain.doFilter(request, response);
    }
}

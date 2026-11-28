package com.urbanshop.api.auth;

import java.net.URI;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.urbanshop.api.auth.dto.AuthDtos.EmailRequest;
import com.urbanshop.api.auth.dto.AuthDtos.LoginRequest;
import com.urbanshop.api.auth.dto.AuthDtos.LoginResponse;
import com.urbanshop.api.auth.dto.AuthDtos.MessageResponse;
import com.urbanshop.api.auth.dto.AuthDtos.RegisterRequest;
import com.urbanshop.api.auth.dto.AuthDtos.ResetPasswordRequest;
import com.urbanshop.api.auth.dto.AuthDtos.UserResponse;

import jakarta.validation.Valid;

/**
 * Rotas de autenticação usadas pelo app:
 *
 * POST /api/auth/register             cadastro (envia e-mail de confirmação)
 * POST /api/auth/login                login → token JWT
 * GET  /api/auth/me                   dados do cliente logado
 * POST /api/auth/logout               encerra a sessão
 * GET  /api/auth/verify-email         link do e-mail de confirmação
 * POST /api/auth/resend-verification  reenvia a confirmação
 * POST /api/auth/forgot-password      envia link de nova senha
 * POST /api/auth/reset-password       define a nova senha
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest request) {
        auth.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new MessageResponse("Conta criada. Enviamos um link para confirmar seu e-mail."));
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return auth.login(request);
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal Jwt jwt) {
        return auth.me(jwt.getSubject());
    }

    /**
     * O token JWT expira sozinho (2h). O app apaga o token no logout;
     * aqui apenas confirmamos a saída.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }

    /** Aberto pelo link do e-mail: confirma e leva o cliente para a tela de login do app. */
    @GetMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestParam(required = false) String token) {
        boolean ok = auth.verifyEmail(token);
        URI target = URI.create(auth.frontendUrl() + "/entrar?verificado=" + (ok ? "ok" : "erro"));
        return ResponseEntity.status(HttpStatus.FOUND).location(target).build();
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Void> resendVerification(@Valid @RequestBody EmailRequest request) {
        auth.resendVerification(request.email());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody EmailRequest request) {
        auth.forgotPassword(request.email());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        auth.resetPassword(request.token(), request.password());
        return ResponseEntity.noContent().build();
    }
}

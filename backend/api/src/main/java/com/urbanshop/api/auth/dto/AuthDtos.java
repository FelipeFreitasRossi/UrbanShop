package com.urbanshop.api.auth.dto;

import java.time.LocalDate;
import java.util.List;

import com.urbanshop.api.common.validation.Cpf;
import com.urbanshop.api.common.validation.Phone;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Formatos de entrada e saída da autenticação (o mesmo contrato usado pelo app).
 */
public final class AuthDtos {

    private AuthDtos() {
    }

    /** Senha forte: 8+ caracteres, maiúscula, minúscula, número e símbolo. */
    public static final String STRONG_PASSWORD =
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,72}$";
    public static final String STRONG_PASSWORD_MESSAGE =
            "A senha precisa ter 8 caracteres ou mais, com maiúscula, minúscula, número e símbolo.";

    // ---------------- Entrada ----------------

    public record RegisterRequest(
            @NotBlank(message = "Informe seu nome completo.")
            @Size(max = 120, message = "Nome muito longo.")
            @Pattern(regexp = "^\\s*\\S{2,}(\\s+\\S{2,})+\\s*$", message = "Informe nome e sobrenome.")
            String name,

            @NotBlank(message = "Informe seu e-mail.")
            @Email(message = "Informe um e-mail válido.")
            @Size(max = 160, message = "E-mail muito longo.")
            String email,

            @NotBlank(message = "Informe seu celular.")
            @Phone
            String phone,

            @NotBlank(message = "Informe seu CPF.")
            @Cpf
            String cpf,

            @Past(message = "A data de nascimento precisa estar no passado.")
            LocalDate birthDate,

            @NotBlank(message = "Crie uma senha.")
            @Pattern(regexp = STRONG_PASSWORD, message = STRONG_PASSWORD_MESSAGE)
            String password,

            @NotNull(message = "Informe o endereço.")
            @Valid
            AddressRequest address,

            @NotNull(message = "Informe os consentimentos.")
            @Valid
            ConsentsRequest consents) {
    }

    public record AddressRequest(
            @Size(max = 40) String label,

            @NotBlank(message = "Informe o CEP.")
            @Pattern(regexp = "^\\d{5}-?\\d{3}$", message = "Informe os 8 números do CEP.")
            String zipCode,

            @NotBlank(message = "Informe a rua.") @Size(max = 160) String street,
            @NotBlank(message = "Informe o número (ou \"S/N\").") @Size(max = 20) String number,
            @Size(max = 80) String complement,
            @NotBlank(message = "Informe o bairro.") @Size(max = 100) String neighborhood,
            @NotBlank(message = "Informe a cidade.") @Size(max = 100) String city,

            @NotBlank(message = "Informe o estado.")
            @Pattern(regexp = "^[A-Za-z]{2}$", message = "Use a sigla do estado (ex.: SP).")
            String state,

            @Pattern(regexp = "^BR$", message = "No momento entregamos apenas no Brasil.")
            String country,

            Boolean isDefault) {
    }

    public record ConsentsRequest(
            @AssertTrue(message = "É preciso aceitar os Termos e a Política de privacidade.")
            boolean termsAndPrivacy,
            boolean marketing,
            boolean birthdayCampaigns) {
    }

    public record LoginRequest(
            @NotBlank(message = "Informe seu e-mail.") @Email(message = "Informe um e-mail válido.") String email,
            @NotBlank(message = "Informe sua senha.") @Size(max = 72) String password) {
    }

    public record EmailRequest(
            @NotBlank(message = "Informe seu e-mail.") @Email(message = "Informe um e-mail válido.") String email) {
    }

    public record ResetPasswordRequest(
            @NotBlank(message = "Link inválido.") String token,
            @NotBlank(message = "Crie uma senha.")
            @Pattern(regexp = STRONG_PASSWORD, message = STRONG_PASSWORD_MESSAGE)
            String password) {
    }

    // ---------------- Saída ----------------

    public record MessageResponse(String message) {
    }

    public record AddressResponse(
            String id,
            String label,
            String zipCode,
            String street,
            String number,
            String complement,
            String neighborhood,
            String city,
            String state,
            String country,
            boolean isDefault) {
    }

    public record UserResponse(
            String id,
            String name,
            String email,
            String phone,
            String cpfMasked,
            LocalDate birthDate,
            boolean emailVerified,
            List<String> roles,
            List<AddressResponse> addresses) {
    }

    public record LoginResponse(String accessToken, long expiresIn, UserResponse user) {
    }
}

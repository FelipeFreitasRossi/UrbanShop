package com.urbanshop.api.common.validation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

/** Valida CPF pelos dígitos verificadores. */
@Documented
@Constraint(validatedBy = Cpf.Validator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT })
@Retention(RetentionPolicy.RUNTIME)
public @interface Cpf {

    String message() default "CPF inválido. Confira os números digitados.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    class Validator implements ConstraintValidator<Cpf, String> {
        @Override
        public boolean isValid(String value, ConstraintValidatorContext context) {
            // Campo vazio é tratado por @NotBlank.
            return value == null || value.isBlank() || BrazilianDocuments.isValidCpf(value);
        }
    }
}

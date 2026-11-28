package com.urbanshop.api.common.validation;

import java.util.Set;

/**
 * Regras de documentos e formatos brasileiros (mesmas regras usadas no app).
 */
public final class BrazilianDocuments {

    public static final Set<String> UFS = Set.of(
            "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
            "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO");

    private BrazilianDocuments() {
    }

    public static String onlyDigits(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }

    /**
     * CPF válido pelos dígitos verificadores (algoritmo oficial da Receita Federal).
     * Rejeita sequências repetidas como 111.111.111-11.
     */
    public static boolean isValidCpf(String value) {
        String cpf = onlyDigits(value);
        if (cpf.length() != 11 || cpf.chars().distinct().count() == 1) {
            return false;
        }
        return checkDigit(cpf, 9) == cpf.charAt(9) - '0'
                && checkDigit(cpf, 10) == cpf.charAt(10) - '0';
    }

    private static int checkDigit(String cpf, int length) {
        int sum = 0;
        for (int i = 0; i < length; i++) {
            sum += (cpf.charAt(i) - '0') * (length + 1 - i);
        }
        int rest = (sum * 10) % 11;
        return rest == 10 ? 0 : rest;
    }

    /** Celular (11 dígitos, começa com 9 após o DDD) ou fixo (10 dígitos). */
    public static boolean isValidPhone(String value) {
        String phone = onlyDigits(value);
        if (phone.length() != 10 && phone.length() != 11) {
            return false;
        }
        if (Integer.parseInt(phone.substring(0, 2)) < 11) {
            return false;
        }
        return phone.length() == 10 || phone.charAt(2) == '9';
    }

    /** 12345678909 → ***.456.789-** (para exibir sem expor o documento completo). */
    public static String maskCpf(String cpfDigits) {
        String cpf = onlyDigits(cpfDigits);
        if (cpf.length() != 11) {
            return null;
        }
        return "***." + cpf.substring(3, 6) + "." + cpf.substring(6, 9) + "-**";
    }
}

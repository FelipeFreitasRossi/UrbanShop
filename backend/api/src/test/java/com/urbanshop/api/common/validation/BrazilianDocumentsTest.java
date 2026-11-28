package com.urbanshop.api.common.validation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class BrazilianDocumentsTest {

    @Test
    void cpfValido() {
        assertTrue(BrazilianDocuments.isValidCpf("529.982.247-25"));
        assertTrue(BrazilianDocuments.isValidCpf("11144477735"));
    }

    @Test
    void cpfInvalido() {
        assertFalse(BrazilianDocuments.isValidCpf("529.982.247-24"));
        assertFalse(BrazilianDocuments.isValidCpf("111.111.111-11"));
        assertFalse(BrazilianDocuments.isValidCpf("123"));
        assertFalse(BrazilianDocuments.isValidCpf(null));
    }

    @Test
    void telefone() {
        assertTrue(BrazilianDocuments.isValidPhone("(11) 98765-4321"));
        assertTrue(BrazilianDocuments.isValidPhone("1133334444"));
        assertFalse(BrazilianDocuments.isValidPhone("(11) 88765-4321"));
        assertFalse(BrazilianDocuments.isValidPhone("(05) 98765-4321"));
    }

    @Test
    void mascaraCpf() {
        assertEquals("***.982.247-**", BrazilianDocuments.maskCpf("52998224725"));
    }
}

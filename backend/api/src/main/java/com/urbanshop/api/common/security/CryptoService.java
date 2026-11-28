package com.urbanshop.api.common.security;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Service;

import com.urbanshop.api.config.AppProperties;

/**
 * Criptografia de dados pessoais (LGPD).
 *
 * - CPF é guardado criptografado com AES-256-GCM: só a API consegue ler,
 *   e só quando precisa (nota fiscal, transportadora).
 * - Para verificar "CPF já cadastrado" sem descriptografar ninguém, guardamos
 *   também um HMAC (impressão digital) do CPF.
 * - Tokens de e-mail e de senha são guardados apenas como hash SHA-256.
 */
@Service
public class CryptoService {

    private static final int GCM_IV_BYTES = 12;
    private static final int GCM_TAG_BITS = 128;

    private final SecretKeySpec encryptionKey;
    private final SecretKeySpec hmacKey;
    private final SecureRandom random = new SecureRandom();

    public CryptoService(AppProperties properties) {
        String configured = properties.security() == null ? null : properties.security().dataKey();
        if (configured == null || configured.isBlank()) {
            throw new IllegalStateException(
                    "DATA_ENCRYPTION_KEY não configurada. Rode o setup-env.ps1 para gerar o arquivo .env.");
        }
        byte[] key = Base64.getDecoder().decode(configured.trim());
        if (key.length != 32) {
            throw new IllegalStateException("DATA_ENCRYPTION_KEY precisa ter 32 bytes em Base64.");
        }
        this.encryptionKey = new SecretKeySpec(key, "AES");
        // Chave separada para o HMAC, derivada da chave principal.
        this.hmacKey = new SecretKeySpec(rawHmac(key, "urbanshop-lookup-key"), "HmacSHA256");
    }

    /** Criptografa um texto. Resultado em Base64 (IV + texto cifrado). */
    public String encrypt(String plain) {
        try {
            byte[] iv = new byte[GCM_IV_BYTES];
            random.nextBytes(iv);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, encryptionKey, new GCMParameterSpec(GCM_TAG_BITS, iv));
            byte[] encrypted = cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(ByteBuffer.allocate(iv.length + encrypted.length)
                    .put(iv).put(encrypted).array());
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Falha ao criptografar dado", e);
        }
    }

    public String decrypt(String encoded) {
        try {
            byte[] data = Base64.getDecoder().decode(encoded);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, encryptionKey, new GCMParameterSpec(GCM_TAG_BITS, data, 0, GCM_IV_BYTES));
            byte[] plain = cipher.doFinal(data, GCM_IV_BYTES, data.length - GCM_IV_BYTES);
            return new String(plain, StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            throw new IllegalStateException("Falha ao descriptografar dado", e);
        }
    }

    /** Impressão digital determinística (para buscas/unicidade sem expor o valor). */
    public String fingerprint(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(hmacKey);
            return HexFormat.of().formatHex(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Falha ao gerar impressão digital", e);
        }
    }

    /** Token aleatório seguro para links de e-mail (enviado ao cliente). */
    public String newUrlToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /** Hash SHA-256 do token (é isso que fica no banco). */
    public String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }

    private static byte[] rawHmac(byte[] key, String label) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key, "HmacSHA256"));
            return mac.doFinal(label.getBytes(StandardCharsets.UTF_8));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }
}

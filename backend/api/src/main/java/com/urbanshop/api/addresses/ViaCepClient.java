package com.urbanshop.api.addresses;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.urbanshop.api.common.validation.BrazilianDocuments;

/**
 * Consulta de CEP no ViaCEP feita PELO SERVIDOR.
 * O app também consulta, mas o servidor confere de novo: não confiamos em
 * dados que chegam do cliente sem verificar.
 */
@Component
public class ViaCepClient {

    private static final Logger log = LoggerFactory.getLogger(ViaCepClient.class);

    public enum Status { FOUND, NOT_FOUND, UNAVAILABLE }

    public record Result(Status status, String state, String city) {
    }

    private final RestClient client;

    public ViaCepClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(4));
        factory.setReadTimeout(Duration.ofSeconds(6));
        this.client = RestClient.builder()
                .baseUrl("https://viacep.com.br/ws")
                .requestFactory(factory)
                .build();
    }

    public Result lookup(String zipCode) {
        String cep = BrazilianDocuments.onlyDigits(zipCode);
        if (cep.length() != 8) {
            return new Result(Status.NOT_FOUND, null, null);
        }
        try {
            Map<String, Object> body = client.get()
                    .uri("/{cep}/json/", cep)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {
                    });
            if (body == null) {
                return new Result(Status.UNAVAILABLE, null, null);
            }
            Object erro = body.get("erro");
            if (Boolean.TRUE.equals(erro) || "true".equals(String.valueOf(erro))) {
                return new Result(Status.NOT_FOUND, null, null);
            }
            String uf = Optional.ofNullable(body.get("uf")).map(String::valueOf).orElse(null);
            String city = Optional.ofNullable(body.get("localidade")).map(String::valueOf).orElse(null);
            return new Result(Status.FOUND, uf, city);
        } catch (RestClientException e) {
            log.warn("ViaCEP indisponível para o CEP {}: {}", cep, e.getMessage());
            return new Result(Status.UNAVAILABLE, null, null);
        }
    }
}

package com.urbanshop.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * API principal da UrbanShop.
 * Autoridade para clientes, produtos, pedidos, estoque, pagamentos e fidelidade.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
@EnableAsync
public class ApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiApplication.class, args);
    }

}

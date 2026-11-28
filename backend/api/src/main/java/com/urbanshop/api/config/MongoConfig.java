package com.urbanshop.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.MongoTransactionManager;

/**
 * Transações no MongoDB Atlas.
 * Operações que mexem em várias coleções (ex.: criar cliente + endereço + cartão
 * fidelidade) acontecem por inteiro ou não acontecem.
 */
@Configuration
public class MongoConfig {

    @Bean
    MongoTransactionManager transactionManager(MongoDatabaseFactory factory) {
        return new MongoTransactionManager(factory);
    }
}

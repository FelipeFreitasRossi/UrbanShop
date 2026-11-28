package com.urbanshop.api.config;

import java.time.Duration;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.index.IndexField;
import org.springframework.data.mongodb.core.index.IndexInfo;
import org.springframework.data.mongodb.core.index.IndexOperations;
import org.springframework.stereotype.Component;

import com.urbanshop.api.addresses.Address;
import com.urbanshop.api.auth.AuthToken;
import com.urbanshop.api.loyalty.LoyaltyCard;
import com.urbanshop.api.newsletter.NewsletterSubscriber;
import com.urbanshop.api.users.User;

/**
 * Cria os índices do banco ao iniciar a API.
 *
 * Se já existir um índice no mesmo campo (criado antes, com qualquer nome),
 * ele é reaproveitado — a API não trava por causa disso. Se o índice existente
 * tiver regras diferentes (ex.: não é único), aparece um aviso no console
 * explicando o que ajustar no Atlas.
 */
@Component
public class MongoIndexes implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(MongoIndexes.class);

    private final MongoTemplate mongo;

    public MongoIndexes(MongoTemplate mongo) {
        this.mongo = mongo;
    }

    @Override
    public void run(ApplicationArguments args) {
        // Clientes: e-mail e CPF únicos.
        ensure(User.class, "email", true, false, null);
        ensure(User.class, "cpfFingerprint", true, true, null);
        ensure(User.class, "createdAt", false, false, null);

        // Endereços por cliente.
        ensure(Address.class, "userId", false, false, null);

        // Um cartão por cliente; número do cartão único.
        ensure(LoyaltyCard.class, "userId", true, false, null);
        ensure(LoyaltyCard.class, "cardNumber", true, false, null);

        // Tokens de e-mail: busca pelo hash e remoção automática ao expirar (TTL).
        ensure(AuthToken.class, "userId", false, false, null);
        ensure(AuthToken.class, "tokenHash", true, false, null);
        ensure(AuthToken.class, "expiresAt", false, false, Duration.ZERO);

        // Newsletter: um registro por e-mail.
        ensure(NewsletterSubscriber.class, "email", true, false, null);

        log.info("Índices do MongoDB verificados.");
    }

    private void ensure(Class<?> entity, String field, boolean unique, boolean sparse, Duration ttl) {
        IndexOperations ops = mongo.indexOps(entity);
        String collection = mongo.getCollectionName(entity);

        for (IndexInfo existing : ops.getIndexInfo()) {
            List<IndexField> fields = existing.getIndexFields();
            if (fields.size() == 1 && field.equals(fields.get(0).getKey())) {
                if (unique && !existing.isUnique()) {
                    log.warn("O índice '{}' da coleção '{}' existe mas NÃO é único. "
                            + "No Atlas, apague esse índice (Indexes > Drop Index) e reinicie a API para recriá-lo corretamente.",
                            existing.getName(), collection);
                }
                return; // já existe um índice neste campo: reaproveita
            }
        }

        Index index = new Index().on(field, Sort.Direction.ASC).named(field + "_1");
        if (unique) {
            index.unique();
        }
        if (sparse) {
            index.sparse();
        }
        if (ttl != null) {
            index.expire(ttl);
        }
        ops.createIndex(index);
        log.info("Índice criado: {}.{}", collection, field + "_1");
    }
}

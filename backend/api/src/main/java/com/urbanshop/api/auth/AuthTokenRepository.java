package com.urbanshop.api.auth;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface AuthTokenRepository extends MongoRepository<AuthToken, String> {

    Optional<AuthToken> findByTokenHashAndType(String tokenHash, AuthToken.Type type);

    void deleteByUserIdAndType(String userId, AuthToken.Type type);
}

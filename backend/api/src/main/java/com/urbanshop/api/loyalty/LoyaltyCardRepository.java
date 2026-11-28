package com.urbanshop.api.loyalty;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface LoyaltyCardRepository extends MongoRepository<LoyaltyCard, String> {

    Optional<LoyaltyCard> findByUserId(String userId);

    boolean existsByCardNumber(String cardNumber);
}

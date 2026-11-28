package com.urbanshop.api.newsletter;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface NewsletterRepository extends MongoRepository<NewsletterSubscriber, String> {

    Optional<NewsletterSubscriber> findByEmail(String email);
}

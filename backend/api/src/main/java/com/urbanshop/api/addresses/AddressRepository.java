package com.urbanshop.api.addresses;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface AddressRepository extends MongoRepository<Address, String> {

    List<Address> findByUserIdOrderByCreatedAtAsc(String userId);
}

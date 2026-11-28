package com.urbanshop.api.users;

import java.util.List;

import org.springframework.stereotype.Component;

import com.urbanshop.api.addresses.Address;
import com.urbanshop.api.auth.dto.AuthDtos.AddressResponse;
import com.urbanshop.api.auth.dto.AuthDtos.UserResponse;
import com.urbanshop.api.common.security.CryptoService;
import com.urbanshop.api.common.validation.BrazilianDocuments;

/** Converte documentos do banco no formato enviado ao app (sem dados sensíveis). */
@Component
public class UserMapper {

    private final CryptoService crypto;

    public UserMapper(CryptoService crypto) {
        this.crypto = crypto;
    }

    public UserResponse toResponse(User user, List<Address> addresses) {
        String cpfMasked = null;
        if (user.getCpfEncrypted() != null) {
            cpfMasked = BrazilianDocuments.maskCpf(crypto.decrypt(user.getCpfEncrypted()));
        }
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                cpfMasked,
                user.getBirthDate(),
                user.isEmailVerified(),
                user.getRoles().stream().map(Enum::name).sorted().toList(),
                addresses.stream().map(UserMapper::toAddressResponse).toList());
    }

    public static AddressResponse toAddressResponse(Address a) {
        return new AddressResponse(
                a.getId(),
                a.getLabel(),
                a.getZipCode(),
                a.getStreet(),
                a.getNumber(),
                a.getComplement(),
                a.getNeighborhood(),
                a.getCity(),
                a.getState(),
                a.getCountry(),
                a.isDefault());
    }
}

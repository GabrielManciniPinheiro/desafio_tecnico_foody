package br.com.foody.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.Locale;

public record DeliveryAddressRequest(
        @NotBlank(message = "Informe a rua.")
        @Size(max = 150, message = "A rua deve ter no máximo 150 caracteres.")
        String street,

        @NotBlank(message = "Informe o número.")
        @Size(max = 10, message = "O número deve ter no máximo 10 caracteres.")
        String number,

        @Size(max = 100, message = "O complemento deve ter no máximo 100 caracteres.")
        String complement,

        @NotBlank(message = "Informe o bairro.")
        @Size(max = 100, message = "O bairro deve ter no máximo 100 caracteres.")
        String neighborhood,

        @NotBlank(message = "Informe a cidade.")
        @Size(max = 100, message = "A cidade deve ter no máximo 100 caracteres.")
        String city,

        @NotBlank(message = "Informe a UF.")
        @Pattern(regexp = "[A-Za-z]{2}", message = "Informe a UF com 2 letras.")
        String state,

        @NotBlank(message = "Informe o CEP.")
        @Pattern(regexp = "\\d{5}-?\\d{3}", message = "Informe um CEP válido.")
        String zipCode) {

    public DeliveryAddressRequest {
        street = strip(street);
        number = strip(number);
        complement = strip(complement);
        neighborhood = strip(neighborhood);
        city = strip(city);
        state = strip(state);
        zipCode = strip(zipCode);
    }

    DeliveryAddress toEntity() {
        String zipDigits = zipCode.replace("-", "");
        return new DeliveryAddress(
                street,
                number,
                complement == null || complement.isEmpty() ? null : complement,
                neighborhood,
                city,
                state.toUpperCase(Locale.ROOT),
                zipDigits.substring(0, 5) + "-" + zipDigits.substring(5));
    }

    private static String strip(String value) {
        return value != null ? value.strip() : null;
    }
}

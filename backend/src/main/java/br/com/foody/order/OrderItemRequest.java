package br.com.foody.order;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record OrderItemRequest(
        @NotBlank(message = "Informe o produto.")
        @Size(max = 120, message = "O produto deve ter no máximo 120 caracteres.")
        String productName,

        @NotNull(message = "Informe a quantidade.")
        @Positive(message = "A quantidade deve ser maior que zero.")
        @Max(value = 999, message = "A quantidade deve ser no máximo 999.")
        Integer quantity,

        @NotNull(message = "Informe o preço unitário.")
        @DecimalMin(value = "0.01", message = "O preço unitário deve ser maior que zero.")
        @Digits(integer = 6, fraction = 2, message = "O preço unitário deve ter no máximo 2 casas decimais.")
        BigDecimal unitPrice) {

    public OrderItemRequest {
        productName = productName != null ? productName.strip() : null;
    }
}

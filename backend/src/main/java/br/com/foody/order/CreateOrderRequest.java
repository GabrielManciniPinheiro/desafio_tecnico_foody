package br.com.foody.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateOrderRequest(
        @NotBlank(message = "Informe o nome do cliente.")
        @Size(max = 120, message = "O nome do cliente deve ter no máximo 120 caracteres.")
        String customerName,

        @Size(max = 20, message = "O telefone deve ter no máximo 20 caracteres.")
        String customerPhone,

        @NotNull(message = "Informe o endereço de entrega.")
        @Valid
        DeliveryAddressRequest deliveryAddress,

        @NotEmpty(message = "O pedido deve ter pelo menos um item.")
        List<@Valid @NotNull(message = "Item inválido.") OrderItemRequest> items) {

    public CreateOrderRequest {
        customerName = customerName != null ? customerName.strip() : null;
        customerPhone = customerPhone == null || customerPhone.isBlank() ? null : customerPhone.strip();
    }
}

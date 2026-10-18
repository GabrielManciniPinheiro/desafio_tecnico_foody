package br.com.foody.order;

import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
        @NotNull(message = "Informe o novo status.")
        OrderStatus status) {
}

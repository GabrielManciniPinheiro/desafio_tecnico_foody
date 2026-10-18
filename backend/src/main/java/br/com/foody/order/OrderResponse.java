package br.com.foody.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        String customerName,
        String customerPhone,
        Address deliveryAddress,
        OrderStatus status,
        BigDecimal totalAmount,
        List<Item> items,
        Instant createdAt,
        Instant updatedAt) {

    public record Address(String street, String number, String complement, String neighborhood,
                          String city, String state, String zipCode) {
    }

    public record Item(Long id, String productName, int quantity, BigDecimal unitPrice, BigDecimal subtotal) {
    }

    public static OrderResponse from(Order order) {
        DeliveryAddress address = order.getDeliveryAddress();
        return new OrderResponse(
                order.getId(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                new Address(address.getStreet(), address.getNumber(), address.getComplement(),
                        address.getNeighborhood(), address.getCity(), address.getState(), address.getZipCode()),
                order.getStatus(),
                order.getTotalAmount(),
                order.getItems().stream()
                        .map(item -> new Item(item.getId(), item.getProductName(), item.getQuantity(),
                                item.getUnitPrice(), item.getSubtotal()))
                        .toList(),
                order.getCreatedAt(),
                order.getUpdatedAt());
    }
}

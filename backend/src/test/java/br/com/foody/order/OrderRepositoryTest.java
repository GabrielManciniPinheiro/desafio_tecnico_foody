package br.com.foody.order;

import br.com.foody.user.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void shouldPersistOrderWithItemsAndCalculatedTotal() {
        User user = entityManager.persist(new User("Maria Silva", "maria@foody.com", "hash"));
        DeliveryAddress address = new DeliveryAddress(
                "Rua das Flores", "123", "Apto 4", "Centro", "São Paulo", "SP", "01000-000");

        Order order = new Order("João Souza", "11999999999", address, user);
        order.addItem("Pizza Margherita", 2, new BigDecimal("45.90"));
        order.addItem("Refrigerante 2L", 1, new BigDecimal("12.00"));

        Long id = orderRepository.saveAndFlush(order).getId();
        entityManager.clear();

        Order saved = orderRepository.findById(id).orElseThrow();
        assertThat(saved.getStatus()).isEqualTo(OrderStatus.RECEBIDO);
        assertThat(saved.getTotalAmount()).isEqualByComparingTo("103.80");
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getItems())
                .extracting(OrderItem::getProductName)
                .containsExactly("Pizza Margherita", "Refrigerante 2L");
    }
}

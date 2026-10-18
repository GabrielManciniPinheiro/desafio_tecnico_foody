package br.com.foody.order;

import br.com.foody.user.User;
import br.com.foody.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Test
    void shouldPersistOrderWithItemsAndCalculatedTotal() {
        User user = entityManager.persist(new User("Maria Silva", "maria@foody.com", "hash"));

        Order order = new Order("João Souza", "11999999999", address(), user);
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

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void shouldRejectUpdateBasedOnStaleVersion() {
        TransactionTemplate tx = new TransactionTemplate(transactionManager);
        Long id = tx.execute(status -> {
            User user = userRepository.save(new User("Operador", "concorrencia@foody.com", "hash"));
            Order order = new Order("Cliente", null, address(), user);
            order.addItem("Pizza", 1, new BigDecimal("40.00"));
            return orderRepository.save(order).getId();
        });

        // Dois operadores abrem o mesmo pedido
        Order staleCopy = tx.execute(status -> orderRepository.findById(id).orElseThrow());

        // O primeiro coloca em preparo e salva
        tx.executeWithoutResult(status ->
                orderRepository.findById(id).orElseThrow().changeStatus(OrderStatus.EM_PREPARO));

        // O segundo tenta cancelar a partir da versão que já ficou desatualizada
        staleCopy.changeStatus(OrderStatus.CANCELADO);
        assertThatThrownBy(() -> tx.executeWithoutResult(status -> orderRepository.save(staleCopy)))
                .isInstanceOf(OptimisticLockingFailureException.class);

        Order current = tx.execute(status -> orderRepository.findById(id).orElseThrow());
        assertThat(current.getStatus()).isEqualTo(OrderStatus.EM_PREPARO);
    }

    private static DeliveryAddress address() {
        return new DeliveryAddress("Rua das Flores", "123", "Apto 4", "Centro", "São Paulo", "SP", "01000-000");
    }
}

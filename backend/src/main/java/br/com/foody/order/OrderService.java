package br.com.foody.order;

import br.com.foody.user.User;
import br.com.foody.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse create(CreateOrderRequest request, Long userId) {
        User createdBy = userRepository.getReferenceById(userId);
        Order order = new Order(
                request.customerName(),
                request.customerPhone(),
                request.deliveryAddress().toEntity(),
                createdBy);
        request.items().forEach(item -> order.addItem(item.productName(), item.quantity(), item.unitPrice()));

        return OrderResponse.from(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> findAll() {
        return orderRepository.findAllWithItems().stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse findById(Long id) {
        return OrderResponse.from(getOrder(id));
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus newStatus) {
        Order order = getOrder(id);
        order.changeStatus(newStatus);

        // flush antecipado: atualiza updatedAt/version antes de montar a resposta
        // e faz um eventual conflito de concorrência estourar aqui dentro
        orderRepository.flush();
        return OrderResponse.from(order);
    }

    private Order getOrder(Long id) {
        return orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
    }
}

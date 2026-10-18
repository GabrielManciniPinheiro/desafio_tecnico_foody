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
        return orderRepository.findByIdWithItems(id)
                .map(OrderResponse::from)
                .orElseThrow(() -> new OrderNotFoundException(id));
    }
}

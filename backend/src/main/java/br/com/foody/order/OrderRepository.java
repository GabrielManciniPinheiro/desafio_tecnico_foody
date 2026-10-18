package br.com.foody.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // join fetch carrega os itens na mesma consulta, evitando o problema de N+1
    @Query("select o from Order o left join fetch o.items order by o.createdAt desc, o.id desc")
    List<Order> findAllWithItems();

    @Query("select o from Order o left join fetch o.items where o.id = :id")
    Optional<Order> findByIdWithItems(Long id);
}

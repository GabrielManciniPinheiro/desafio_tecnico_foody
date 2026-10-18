package br.com.foody.order;

import br.com.foody.shared.ApiException;
import org.springframework.http.HttpStatus;

public class InvalidStatusTransitionException extends ApiException {

    public InvalidStatusTransitionException(OrderStatus current, OrderStatus next) {
        super(HttpStatus.CONFLICT, "Não é possível alterar o status do pedido de %s para %s.".formatted(current, next));
    }
}

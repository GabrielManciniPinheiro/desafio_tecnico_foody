package br.com.foody.order;

import br.com.foody.shared.ApiException;
import org.springframework.http.HttpStatus;

public class OrderNotFoundException extends ApiException {

    public OrderNotFoundException(Long id) {
        super(HttpStatus.NOT_FOUND, "Pedido " + id + " não encontrado.");
    }
}

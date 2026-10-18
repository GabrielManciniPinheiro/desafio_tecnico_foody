package br.com.foody.order;

import java.util.EnumSet;
import java.util.Set;

/**
 * Fluxo do pedido: RECEBIDO → EM_PREPARO → SAIU_PARA_ENTREGA → ENTREGUE.
 * O cancelamento só é permitido antes de o pedido sair para entrega.
 * ENTREGUE e CANCELADO são status finais.
 */
public enum OrderStatus {
    RECEBIDO,
    EM_PREPARO,
    SAIU_PARA_ENTREGA,
    ENTREGUE,
    CANCELADO;

    public Set<OrderStatus> nextStatuses() {
        return switch (this) {
            case RECEBIDO -> EnumSet.of(EM_PREPARO, CANCELADO);
            case EM_PREPARO -> EnumSet.of(SAIU_PARA_ENTREGA, CANCELADO);
            case SAIU_PARA_ENTREGA -> EnumSet.of(ENTREGUE);
            case ENTREGUE, CANCELADO -> EnumSet.noneOf(OrderStatus.class);
        };
    }

    public boolean canTransitionTo(OrderStatus next) {
        return nextStatuses().contains(next);
    }
}

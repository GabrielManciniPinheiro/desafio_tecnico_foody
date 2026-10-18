package br.com.foody.order;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class OrderStatusTest {

    private static final Set<String> ALLOWED = Set.of(
            "RECEBIDO -> EM_PREPARO",
            "RECEBIDO -> CANCELADO",
            "EM_PREPARO -> SAIU_PARA_ENTREGA",
            "EM_PREPARO -> CANCELADO",
            "SAIU_PARA_ENTREGA -> ENTREGUE");

    static Stream<Arguments> allTransitions() {
        return Arrays.stream(OrderStatus.values())
                .flatMap(from -> Arrays.stream(OrderStatus.values())
                        .map(to -> Arguments.of(from, to, ALLOWED.contains(from + " -> " + to))));
    }

    @ParameterizedTest(name = "{0} -> {1}: permitido = {2}")
    @MethodSource("allTransitions")
    void shouldOnlyAllowTransitionsOfTheDeliveryFlow(OrderStatus from, OrderStatus to, boolean allowed) {
        assertThat(from.canTransitionTo(to)).isEqualTo(allowed);
    }
}

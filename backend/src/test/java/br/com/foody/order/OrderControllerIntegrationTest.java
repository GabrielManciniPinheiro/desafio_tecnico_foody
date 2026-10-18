package br.com.foody.order;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerIntegrationTest {

    private static final String VALID_ORDER = """
            {
              "customerName": "João Souza",
              "customerPhone": "(11) 99999-9999",
              "deliveryAddress": {
                "street": "Rua das Flores",
                "number": "123",
                "complement": "Apto 4",
                "neighborhood": "Centro",
                "city": "São Paulo",
                "state": "sp",
                "zipCode": "01000000"
              },
              "items": [
                {"productName": "Pizza Margherita", "quantity": 2, "unitPrice": 45.90},
                {"productName": "Refrigerante 2L", "quantity": 1, "unitPrice": 12.00}
              ]
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    private String token;

    @BeforeEach
    void authenticate() throws Exception {
        String email = "operador-" + UUID.randomUUID() + "@foody.com";
        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Operador", "email": "%s", "password": "senha1234"}
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        token = JsonPath.read(response, "$.accessToken");
    }

    @Test
    void shouldCreateOrderWithReceivedStatusAndCalculatedTotal() throws Exception {
        MvcResult result = createOrder(VALID_ORDER)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("RECEBIDO"))
                .andExpect(jsonPath("$.totalAmount").value(103.80))
                .andExpect(jsonPath("$.deliveryAddress.state").value("SP"))
                .andExpect(jsonPath("$.deliveryAddress.zipCode").value("01000-000"))
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.items[0].subtotal").value(91.80))
                .andExpect(jsonPath("$.createdAt").isNotEmpty())
                .andReturn();

        Integer id = JsonPath.read(result.getResponse().getContentAsString(), "$.id");
        assertThat(result.getResponse().getHeader(HttpHeaders.LOCATION)).endsWith("/api/orders/" + id);
    }

    @Test
    void shouldReturnFieldErrorsWhenOrderIsInvalid() throws Exception {
        createOrder("""
                {
                  "customerName": "",
                  "deliveryAddress": {"street": "Rua A", "number": "1", "neighborhood": "Centro",
                                      "city": "São Paulo", "state": "SP", "zipCode": "123"},
                  "items": [{"productName": "Pizza", "quantity": 0, "unitPrice": 10.00}]
                }
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.customerName").value("Informe o nome do cliente."))
                .andExpect(jsonPath("$.errors['deliveryAddress.zipCode']").value("Informe um CEP válido."))
                .andExpect(jsonPath("$.errors['items[0].quantity']").value("A quantidade deve ser maior que zero."));
    }

    @Test
    void shouldRejectOrderWithoutItems() throws Exception {
        createOrder("""
                {
                  "customerName": "Maria",
                  "deliveryAddress": {"street": "Rua A", "number": "1", "neighborhood": "Centro",
                                      "city": "São Paulo", "state": "SP", "zipCode": "01000-000"},
                  "items": []
                }
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.items").value("O pedido deve ter pelo menos um item."));
    }

    @Test
    void shouldListOrdersFromMostRecent() throws Exception {
        Integer firstId = JsonPath.read(createOrder(VALID_ORDER).andReturn().getResponse().getContentAsString(), "$.id");
        Integer secondId = JsonPath.read(createOrder(VALID_ORDER).andReturn().getResponse().getContentAsString(), "$.id");

        mockMvc.perform(get("/api/orders").header(HttpHeaders.AUTHORIZATION, bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(secondId))
                .andExpect(jsonPath("$[1].id").value(firstId))
                .andExpect(jsonPath("$[0].items.length()").value(2));
    }

    @Test
    void shouldFindOrderById() throws Exception {
        Integer id = JsonPath.read(createOrder(VALID_ORDER).andReturn().getResponse().getContentAsString(), "$.id");

        mockMvc.perform(get("/api/orders/{id}", id).header(HttpHeaders.AUTHORIZATION, bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.customerName").value("João Souza"))
                .andExpect(jsonPath("$.items[0].productName").value("Pizza Margherita"))
                .andExpect(jsonPath("$.items[1].productName").value("Refrigerante 2L"));
    }

    @Test
    void shouldReturnNotFoundForUnknownOrder() throws Exception {
        mockMvc.perform(get("/api/orders/{id}", 999999).header(HttpHeaders.AUTHORIZATION, bearer()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Pedido 999999 não encontrado."));
    }

    @Test
    void shouldRejectNonNumericId() throws Exception {
        mockMvc.perform(get("/api/orders/abc").header(HttpHeaders.AUTHORIZATION, bearer()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Valor inválido para o parâmetro 'id': abc"));
    }

    @Test
    void shouldRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON).content(VALID_ORDER))
                .andExpect(status().isUnauthorized());
    }

    private ResultActions createOrder(String body) throws Exception {
        return mockMvc.perform(post("/api/orders")
                .header(HttpHeaders.AUTHORIZATION, bearer())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body));
    }

    private String bearer() {
        return "Bearer " + token;
    }
}

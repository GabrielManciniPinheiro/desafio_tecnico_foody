package br.com.foody.auth;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldRegisterUserAndReturnToken() throws Exception {
        register("Ana Lima", "  Ana@Foody.com ", "senha1234")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.name").value("Ana Lima"))
                .andExpect(jsonPath("$.user.email").value("ana@foody.com"));
    }

    @Test
    void shouldRejectDuplicatedEmail() throws Exception {
        register("Bruno", "bruno@foody.com", "senha1234").andExpect(status().isCreated());

        register("Outro Bruno", "BRUNO@foody.com", "outrasenha")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Já existe um usuário cadastrado com este e-mail."));
    }

    @Test
    void shouldReturnFieldErrorsWhenRegisterIsInvalid() throws Exception {
        register("", "email-invalido", "123")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").value("Informe o nome."))
                .andExpect(jsonPath("$.errors.email").value("Informe um e-mail válido."))
                .andExpect(jsonPath("$.errors.password").value("A senha deve ter entre 8 e 72 caracteres."));
    }

    @Test
    void shouldLoginWithValidCredentials() throws Exception {
        register("Carla", "carla@foody.com", "senha1234").andExpect(status().isCreated());

        login("carla@foody.com", "senha1234")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.name").value("Carla"));
    }

    @Test
    void shouldRejectWrongPassword() throws Exception {
        register("Diego", "diego@foody.com", "senha1234").andExpect(status().isCreated());

        login("diego@foody.com", "senhaerrada")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("E-mail ou senha inválidos."));
    }

    @Test
    void shouldRejectUnknownEmail() throws Exception {
        login("ninguem@foody.com", "senha1234")
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRequireTokenForProtectedEndpoints() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/auth/me").header(HttpHeaders.AUTHORIZATION, "Bearer token-invalido"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturnAuthenticatedUser() throws Exception {
        String response = register("Elisa", "elisa@foody.com", "senha1234")
                .andReturn().getResponse().getContentAsString();
        String token = JsonPath.read(response, "$.accessToken");

        mockMvc.perform(get("/api/auth/me").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Elisa"))
                .andExpect(jsonPath("$.email").value("elisa@foody.com"));
    }

    private ResultActions register(String name, String email, String password) throws Exception {
        return mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"name": "%s", "email": "%s", "password": "%s"}
                        """.formatted(name, email, password)));
    }

    private ResultActions login(String email, String password) throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"email": "%s", "password": "%s"}
                        """.formatted(email, password)));
    }
}

package br.com.foody.auth;

import br.com.foody.shared.ApiException;
import org.springframework.http.HttpStatus;

public class InvalidCredentialsException extends ApiException {

    public InvalidCredentialsException() {
        super(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos.");
    }
}

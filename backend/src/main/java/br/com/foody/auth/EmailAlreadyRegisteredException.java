package br.com.foody.auth;

import br.com.foody.shared.ApiException;
import org.springframework.http.HttpStatus;

public class EmailAlreadyRegisteredException extends ApiException {

    public EmailAlreadyRegisteredException() {
        super(HttpStatus.CONFLICT, "Já existe um usuário cadastrado com este e-mail.");
    }
}

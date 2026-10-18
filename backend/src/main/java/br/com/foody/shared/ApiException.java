package br.com.foody.shared;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponseException;

/**
 * Base para erros de negócio. O Spring converte automaticamente para uma
 * resposta no formato Problem Details (RFC 9457) com o status informado.
 */
public abstract class ApiException extends ErrorResponseException {

    protected ApiException(HttpStatus status, String detail) {
        super(status, ProblemDetail.forStatusAndDetail(status, detail), null);
    }
}

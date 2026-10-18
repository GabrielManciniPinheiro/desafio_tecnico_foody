package br.com.foody.auth;

import br.com.foody.user.UserResponse;

public record AuthResponse(String accessToken, String tokenType, long expiresIn, UserResponse user) {
}

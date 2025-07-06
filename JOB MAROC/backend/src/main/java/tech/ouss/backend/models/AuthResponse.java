package tech.ouss.backend.models;

public  class AuthResponse {
    private final String jwt;
    private final userEntity user;

    public AuthResponse(String jwt, userEntity user) {
        this.jwt = jwt;
        this.user = user;
    }

    public String getJwt() {
        return jwt;
    }

    public userEntity getUser() {
        return user;
    }
}
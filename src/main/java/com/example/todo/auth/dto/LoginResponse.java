package com.example.todo.auth.dto;

public class LoginResponse {

    private Long id;
    private String email;
    private String name;
    private String token;

    public LoginResponse(
            Long id,
            String email,
            String name,
            String token
    ) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.token = token;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public String getToken() {
        return token;
    }
}
package com.example.todo.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UpdateUserRequest {

    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    public UpdateUserRequest() {
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
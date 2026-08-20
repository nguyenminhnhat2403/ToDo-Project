package com.example.todo.todo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateTodoRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private Long userId;

    public CreateTodoRequest() {
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Long getUserId() {
        return userId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
package com.example.todo.todo.dto;

import java.time.LocalDateTime;

public class TodoResponse {

    private Long id;
    private String title;
    private String description;
    private boolean completed;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public TodoResponse(
            Long id,
            String title,
            String description,
            boolean completed,
            Long userId,
            LocalDateTime createdAt,
            LocalDateTime completedAt
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.completed = completed;
        this.userId = userId;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public boolean isCompleted() {
        return completed;
    }

    public Long getUserId() {
        return userId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
}
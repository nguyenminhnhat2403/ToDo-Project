package com.example.todo.todo.dto;

import com.example.todo.todo.Todo;

public class TodoDTOMapper {

    private TodoDTOMapper() {
    }

    public static TodoResponse toResponse(Todo todo) {

        Long userId = null;

        if (todo.getUser() != null) {
            userId = todo.getUser().getId();
        }

        return new TodoResponse(
                todo.getId(),
                todo.getTitle(),
                todo.getDescription(),
                todo.isCompleted(),
                userId,
                todo.getCreatedAt(),
                todo.getCompletedAt()
        );
    }
}
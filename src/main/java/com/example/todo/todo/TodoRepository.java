package com.example.todo.todo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface TodoRepository
        extends JpaRepository<Todo, Long> {

    List<Todo> findByUserId(Long userId);

    List<Todo> findByCompleted(boolean completed);

    List<Todo> findByUserIdAndCompleted(
            Long userId,
            boolean completed
    );

    List<Todo> findByUserIdAndCreatedAtBetween(
            Long userId,
            LocalDateTime start,
            LocalDateTime end
    );
    List<Todo> findByUserIdAndCompletedTrue(Long userId);
}
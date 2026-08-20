package com.example.todo.todo.dto;

public record StreakResponse(
        int currentStreak,
        int longestStreak,
        boolean completedToday
) {
}
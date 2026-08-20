package com.example.todo.todo;

import com.example.todo.todo.dto.StreakResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
public class StreakService {

    private final TodoRepository todoRepository;

    public StreakService(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    public StreakResponse getStreak(Long userId) {

        List<Todo> completedTodos =
                todoRepository.findByUserIdAndCompletedTrue(userId);

        List<LocalDate> completedDates =
                completedTodos.stream()
                        .filter(todo -> todo.getCompletedAt() != null)
                        .map(todo -> todo.getCompletedAt().toLocalDate())
                        .distinct()
                        .sorted(Comparator.reverseOrder())
                        .toList();

        if (completedDates.isEmpty()) {
            return new StreakResponse(
                    0,
                    0,
                    false
            );
        }

        LocalDate today = LocalDate.now();

        boolean completedToday =
                completedDates.contains(today);

        // =========================
        // CURRENT STREAK
        // =========================

        int currentStreak = 0;

        LocalDate expectedDate = today;

        for (LocalDate date : completedDates) {

            if (date.equals(expectedDate)) {

                currentStreak++;

                expectedDate =
                        expectedDate.minusDays(1);

            } else if (date.isBefore(expectedDate)) {

                break;
            }
        }

        // =========================
        // LONGEST STREAK
        // =========================

        int longestStreak = 1;
        int currentRun = 1;

        for (int i = 1; i < completedDates.size(); i++) {

            LocalDate previous =
                    completedDates.get(i - 1);

            LocalDate current =
                    completedDates.get(i);

            if (previous.minusDays(1)
                    .equals(current)) {

                currentRun++;

                longestStreak =
                        Math.max(
                                longestStreak,
                                currentRun
                        );

            } else {

                currentRun = 1;
            }
        }

        return new StreakResponse(
                currentStreak,
                longestStreak,
                completedToday
        );
    }
}
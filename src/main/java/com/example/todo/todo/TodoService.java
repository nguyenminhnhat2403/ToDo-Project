package com.example.todo.todo;

import com.example.todo.todo.dto.CreateTodoRequest;
import com.example.todo.todo.dto.TodoDTOMapper;
import com.example.todo.todo.dto.TodoResponse;
import com.example.todo.todo.dto.UpdateTodoRequest;
import com.example.todo.user.User;
import com.example.todo.user.UserRepository;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class TodoService {

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    public TodoService(
            TodoRepository todoRepository,
            UserRepository userRepository
    ) {
        this.todoRepository = todoRepository;
        this.userRepository = userRepository;
    }

    // =====================================================
    // CREATE TODO
    // =====================================================

    public TodoResponse createTodo(
            CreateTodoRequest request
    ) {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Todo todo = new Todo(
                request.getTitle(),
                request.getDescription(),
                user
        );

        Todo savedTodo =
                todoRepository.save(todo);

        return TodoDTOMapper.toResponse(
                savedTodo
        );
    }

    // =====================================================
    // GET CURRENT USER'S TODOS
    // =====================================================

    @Transactional(readOnly = true)
    public List<TodoResponse> getTodosForUser(
            String email
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        return todoRepository
                .findByUserId(user.getId())
                .stream()
                .map(TodoDTOMapper::toResponse)
                .toList();
    }

    // =====================================================
    // GET ALL TODOS
    // =====================================================

    @Transactional(readOnly = true)
    public List<TodoResponse> getTodos() {

        return todoRepository.findAll()
                .stream()
                .map(TodoDTOMapper::toResponse)
                .toList();
    }

    // =====================================================
    // GET TODO BY ID
    // =====================================================

    @Transactional(readOnly = true)
    public TodoResponse getTodoById(Long id) {

        Todo todo = todoRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Todo with id "
                                        + id
                                        + " not found"
                        )
                );

        return TodoDTOMapper.toResponse(todo);
    }

    // =====================================================
    // GET TODOS BY USER
    // =====================================================

    @Transactional(readOnly = true)
    public List<TodoResponse> getTodosByUser(
            Long userId
    ) {

        if (!userRepository.existsById(userId)) {
            throw new RuntimeException(
                    "User with id "
                            + userId
                            + " not found"
            );
        }

        return todoRepository
                .findByUserId(userId)
                .stream()
                .map(TodoDTOMapper::toResponse)
                .toList();
    }

    // =====================================================
    // HISTORY
    // =====================================================

    @Transactional(readOnly = true)
    public List<TodoResponse> getTodosByDate(
            Long userId,
            LocalDate date
    ) {

        if (!userRepository.existsById(userId)) {

            throw new RuntimeException(
                    "User with id "
                            + userId
                            + " not found"
            );
        }

        LocalDateTime start =
                date.atStartOfDay();

        LocalDateTime end =
                date.atTime(LocalTime.MAX);

        List<Todo> todos =
                todoRepository
                        .findByUserIdAndCreatedAtBetween(
                                userId,
                                start,
                                end
                        );

        return todos
                .stream()
                .map(TodoDTOMapper::toResponse)
                .toList();
    }

    // =====================================================
    // UPDATE TODO
    // =====================================================

    public TodoResponse updateTodo(
            Long id,
            UpdateTodoRequest request
    ) {

        Todo todo = todoRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Todo with id "
                                        + id
                                        + " not found"
                        )
                );

        boolean wasCompleted =
                todo.isCompleted();

        boolean isCompleted =
                request.isCompleted();

        todo.setTitle(
                request.getTitle()
        );

        todo.setDescription(
                request.getDescription()
        );

        todo.setCompleted(
                isCompleted
        );

        if (!wasCompleted && isCompleted) {

            todo.setCompletedAt(
                    LocalDateTime.now()
            );
        }

        if (wasCompleted && !isCompleted) {

            todo.setCompletedAt(null);
        }

        Todo updatedTodo =
                todoRepository.save(todo);

        return TodoDTOMapper.toResponse(
                updatedTodo
        );
    }

    // =====================================================
    // DELETE TODO
    // =====================================================

    public void deleteTodo(Long id) {

        if (!todoRepository.existsById(id)) {

            throw new RuntimeException(
                    "Todo with id "
                            + id
                            + " not found"
            );
        }

        todoRepository.deleteById(id);
    }
}
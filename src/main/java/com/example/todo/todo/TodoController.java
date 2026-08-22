package com.example.todo.todo;

import com.example.todo.todo.dto.CreateTodoRequest;
import com.example.todo.todo.dto.TodoResponse;
import com.example.todo.todo.dto.UpdateTodoRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/todos")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class TodoController {

    private final TodoService todoService;

    public TodoController(
            TodoService todoService
    ) {
        this.todoService = todoService;
    }

    // =====================================================
    // GET CURRENT USER'S TODOS
    // =====================================================

    @GetMapping
    public List<TodoResponse> getMyTodos(
            Authentication authentication
    ) {
        return todoService.getTodosForUser(
                authentication.getName()
        );
    }

    // =====================================================
    // GET BY ID
    // =====================================================

    @GetMapping("/{id}")
    public TodoResponse getTodoById(
            @PathVariable Long id
    ) {
        return todoService.getTodoById(id);
    }

    // =====================================================
    // GET BY USER
    // =====================================================

    @GetMapping("/user/{userId}")
    public List<TodoResponse> getTodosByUser(
            @PathVariable Long userId
    ) {
        return todoService.getTodosByUser(
                userId
        );
    }

    // =====================================================
    // HISTORY
    // =====================================================

    @GetMapping("/user/{userId}/history")
    public List<TodoResponse> getTodosByDate(
            @PathVariable Long userId,
            @RequestParam LocalDate date
    ) {
        return todoService.getTodosByDate(
                userId,
                date
        );
    }

    // =====================================================
    // CREATE
    // =====================================================

    @PostMapping
    public TodoResponse createTodo(
            @Valid
            @RequestBody
            CreateTodoRequest request
    ) {
        return todoService.createTodo(
                request
        );
    }

    // =====================================================
    // UPDATE
    // =====================================================

    @PutMapping("/{id}")
    public TodoResponse updateTodo(
            @PathVariable Long id,
            @Valid
            @RequestBody
            UpdateTodoRequest request
    ) {
        return todoService.updateTodo(
                id,
                request
        );
    }

    // =====================================================
    // DELETE
    // =====================================================

    @DeleteMapping("/{id}")
    public void deleteTodo(
            @PathVariable Long id
    ) {
        todoService.deleteTodo(id);
    }
}
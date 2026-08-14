package com.example.todo;
import com.example.todo.todo.Todo;
import com.example.todo.todo.TodoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "api/v1/todos")
public class TodoController {

    private final TodoService todoService;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @GetMapping
    public List<Todo> getTodos() {
        return todoService.getTodos();
    }

    @PostMapping
    public void addTodo(@RequestBody Todo todo) {
        todoService.addTodo(todo);
    }

    @DeleteMapping(path = "{todoId}")
    public void deleteTodo(
            @PathVariable("todoId") Long todoId
    ) {
        todoService.deleteTodo(todoId);
    }
}
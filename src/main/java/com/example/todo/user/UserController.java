package com.example.todo.user;

import com.example.todo.todo.StreakService;
import com.example.todo.todo.dto.StreakResponse;
import com.example.todo.user.dto.*;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;
    private final StreakService streakService;

    public UserController(
            UserService userService,
            StreakService streakService
    ) {
        this.userService = userService;
        this.streakService = streakService;
    }

    @PostMapping
    public UserResponse createUser(
            @Valid @RequestBody CreateUserRequest request
    ) {
        return userService.createUser(request);
    }

    @GetMapping
    public List<UserResponse> getUsers() {
        return userService.getUsers();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(
            @PathVariable Long id
    ) {
        return userService.getUserById(id);
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return userService.updateUser(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(
            @PathVariable Long id
    ) {
        userService.deleteUser(id);
    }

    // STREAK
    @GetMapping("/{userId}/streak")
    public StreakResponse getStreak(
            @PathVariable Long userId
    ) {
        return streakService.getStreak(userId);
    }

    // Login



}
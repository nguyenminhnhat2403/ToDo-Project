package com.example.todo.auth;


import com.example.todo.auth.dto.LoginRequest;
import com.example.todo.auth.dto.LoginResponse;
import com.example.todo.auth.dto.RegisterRequest;
import com.example.todo.user.User;
import com.example.todo.user.dto.UserResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request
    ) {
        return authService.login(
                request.getEmail(),
                request.getPassword()
        );
    }

    @PostMapping("/register")
    public User register(
            @RequestBody RegisterRequest request
    ) {
        return authService.register(request);
    }
}
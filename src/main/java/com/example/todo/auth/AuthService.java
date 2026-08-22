package com.example.todo.auth;

import com.example.todo.auth.dto.LoginResponse;
import com.example.todo.auth.dto.RegisterRequest;
import com.example.todo.security.JwtService;
import com.example.todo.user.User;
import com.example.todo.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(
            String email,
            String password
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid email or password"
                        )
                );

        if (!passwordEncoder.matches(
                password,
                user.getPassword()
        )) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        String token =
                jwtService.generateToken(
                        user.getEmail()
                );

        return new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                token
        );
    }

    public User register(RegisterRequest request) {

        User user = new User();
        if(userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already exist");
        }
        user.setEmail(request.getEmail());
        user.setName(request.getName());

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        return userRepository.save(user);
    }
}

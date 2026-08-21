package com.example.todo.user;

import com.example.todo.user.dto.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserDTOMapper userDTOMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;


    public UserService(
            UserRepository userRepository,
            UserDTOMapper userDTOMapper,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.userDTOMapper = userDTOMapper;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    public UserResponse createUser(CreateUserRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User(
                request.getName(),
                request.getEmail()
        );

        User savedUser = userRepository.save(user);

        return userDTOMapper.apply(savedUser);
    }

    public List<UserResponse> getUsers() {

        return userRepository.findAll()
                .stream()
                .map(userDTOMapper)
                .toList();
    }

    public UserResponse getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User with id " + id + " not found"
                        )
                );

        return userDTOMapper.apply(user);
    }

    public UserResponse updateUser(
            Long id,
            UpdateUserRequest request
    ) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User with id " + id + " not found"
                        )
                );

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        User updatedUser = userRepository.save(user);

        return userDTOMapper.apply(updatedUser);
    }

    @Transactional
    public void deleteUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User with id " + id + " not found"
                        )
                );

        userRepository.delete(user);
    }
    public LoginResponse login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        return new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getName()
        );
    }
    public User register(RegisterRequest request) {

        User user = new User();

        user.setEmail(request.getEmail());
        user.setName(request.getName());

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        return userRepository.save(user);
    }

//    private UserResponse toResponse(User user) {
//
//        return new UserResponse(
//                user.getId(),
//                user.getName(),
//                user.getEmail()
//        );
//    }
}
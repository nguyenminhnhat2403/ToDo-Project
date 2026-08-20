package com.example.todo.user;

import com.example.todo.user.dto.CreateUserRequest;
import com.example.todo.user.dto.UpdateUserRequest;
import com.example.todo.user.dto.UserDTOMapper;
import com.example.todo.user.dto.UserResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserDTOMapper userDTOMapper;
    public UserService(
            UserRepository userRepository,
            UserDTOMapper userDTOMapper
    ) {
        this.userRepository = userRepository;
        this.userDTOMapper = userDTOMapper;
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

//    private UserResponse toResponse(User user) {
//
//        return new UserResponse(
//                user.getId(),
//                user.getName(),
//                user.getEmail()
//        );
//    }
}
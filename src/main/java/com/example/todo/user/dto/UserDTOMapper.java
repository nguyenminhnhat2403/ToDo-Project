package com.example.todo.user.dto;

import com.example.todo.user.User;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
public class UserDTOMapper implements Function<User, UserResponse> {

    @Override
    public UserResponse apply(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }
}
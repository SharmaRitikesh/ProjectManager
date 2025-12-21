package com.projectmanager.service;

import com.projectmanager.dto.UserResponse;
import com.projectmanager.model.User;
import com.projectmanager.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserResponse getCurrentUserResponse() {
        return UserResponse.fromEntity(getCurrentUser());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return UserResponse.fromEntity(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .toList();
    }

    public List<UserResponse> searchUsers(String query) {
        return userRepository.findAll().stream()
                .filter(user -> user.getUsername().toLowerCase().contains(query.toLowerCase()) ||
                        user.getEmail().toLowerCase().contains(query.toLowerCase()) ||
                        (user.getFullName() != null && user.getFullName().toLowerCase().contains(query.toLowerCase())))
                .map(UserResponse::fromEntity)
                .toList();
    }

    public UserResponse updateProfile(String fullName, String avatarUrl) {
        User user = getCurrentUser();
        if (fullName != null) {
            user.setFullName(fullName);
        }
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }
        userRepository.save(user);
        return UserResponse.fromEntity(user);
    }
}

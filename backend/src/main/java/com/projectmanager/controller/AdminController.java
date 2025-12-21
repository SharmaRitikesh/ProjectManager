package com.projectmanager.controller;

import com.projectmanager.dto.AdminUserResponse;
import com.projectmanager.dto.AdminUserUpdateRequest;
import com.projectmanager.dto.MemberRequest;
import com.projectmanager.dto.ProjectAssignmentRequest;
import com.projectmanager.dto.ProjectResponse;
import com.projectmanager.dto.RoleUpdateRequest;
import com.projectmanager.model.ProjectMember;
import com.projectmanager.model.User;
import com.projectmanager.model.User.SystemRole;
import com.projectmanager.repository.UserRepository;
import com.projectmanager.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final ProjectService projectService;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepository,
            ProjectService projectService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.projectService = projectService;
        this.passwordEncoder = passwordEncoder;
    }

    // Get all users
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<AdminUserResponse> responses = users.stream()
                .map(this::mapToAdminUserResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    // Get user by ID
    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserResponse> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(mapToAdminUserResponse(user));
    }

    // Update user credentials
    @PutMapping("/users/{id}")
    public ResponseEntity<AdminUserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getUsername() != null && !request.getUsername().isEmpty()) {
            user.setUsername(request.getUsername());
        }
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            user.setEmail(request.getEmail());
        }
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(mapToAdminUserResponse(savedUser));
    }

    // Update user system role
    @PutMapping("/users/{id}/role")
    public ResponseEntity<AdminUserResponse> updateUserRole(
            @PathVariable Long id,
            @RequestBody RoleUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setSystemRole(SystemRole.valueOf(request.getRole()));
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(mapToAdminUserResponse(savedUser));
    }

    // Get all projects with details
    @GetMapping("/projects")
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    // Assign multiple users to a project
    @PostMapping("/projects/{projectId}/assign")
    public ResponseEntity<Void> assignUsersToProject(
            @PathVariable Long projectId,
            @RequestBody ProjectAssignmentRequest request) {
        for (Long userId : request.getUserIds()) {
            MemberRequest memberRequest = new MemberRequest();
            memberRequest.setUserId(userId);
            memberRequest.setRole(ProjectMember.MemberRole.valueOf(request.getRole()));
            try {
                projectService.addMember(projectId, memberRequest);
            } catch (Exception ignored) {
                // User might already be a member, skip
            }
        }
        return ResponseEntity.ok().build();
    }

    private AdminUserResponse mapToAdminUserResponse(User user) {
        AdminUserResponse response = new AdminUserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setSystemRole(user.getSystemRole().name());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}

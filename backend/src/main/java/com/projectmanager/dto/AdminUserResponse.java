package com.projectmanager.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AdminUserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String systemRole;
    private LocalDateTime createdAt;
}

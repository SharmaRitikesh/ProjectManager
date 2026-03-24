package com.projectmanager.dto;

import lombok.Data;

@Data
public class AdminUserUpdateRequest {
    private String username;
    private String email;
    private String fullName;
    private String password;
}

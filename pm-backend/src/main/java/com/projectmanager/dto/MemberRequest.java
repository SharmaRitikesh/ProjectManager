package com.projectmanager.dto;

import com.projectmanager.model.ProjectMember;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    private ProjectMember.MemberRole role;
}

package com.projectmanager.dto;

import com.projectmanager.model.ProjectMember;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberResponse {
    private Long id;
    private Long projectId;
    private UserResponse user;
    private ProjectMember.MemberRole role;
    private LocalDateTime joinedAt;

    public static MemberResponse fromEntity(ProjectMember member) {
        MemberResponse response = new MemberResponse();
        response.setId(member.getId());
        response.setRole(member.getRole());
        response.setJoinedAt(member.getJoinedAt());

        if (member.getProject() != null) {
            response.setProjectId(member.getProject().getId());
        }

        if (member.getUser() != null) {
            response.setUser(UserResponse.fromEntity(member.getUser()));
        }

        return response;
    }
}

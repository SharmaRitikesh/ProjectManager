package com.projectmanager.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProjectAssignmentRequest {
    private List<Long> userIds;
    private String role;
}

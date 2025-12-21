package com.projectmanager.service;

import com.projectmanager.dto.MemberRequest;
import com.projectmanager.dto.MemberResponse;
import com.projectmanager.dto.ProjectRequest;
import com.projectmanager.dto.ProjectResponse;
import com.projectmanager.model.Project;
import com.projectmanager.model.ProjectMember;
import com.projectmanager.model.User;
import com.projectmanager.repository.ProjectMemberRepository;
import com.projectmanager.repository.ProjectRepository;
import com.projectmanager.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public ProjectService(ProjectRepository projectRepository,
            ProjectMemberRepository memberRepository,
            UserRepository userRepository,
            UserService userService) {
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects() {
        User currentUser = userService.getCurrentUser();
        List<Project> projects = projectRepository.findAllByUserAccess(currentUser);

        return projects.stream()
                .map(this::enrichProjectResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        checkProjectAccess(project);
        return enrichProjectResponse(project);
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        User currentUser = userService.getCurrentUser();

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setOwner(currentUser);
        project.setStatus(request.getStatus() != null ? request.getStatus() : Project.ProjectStatus.ACTIVE);
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());

        project = projectRepository.save(project);

        // Add owner as a member with OWNER role
        ProjectMember ownerMember = new ProjectMember();
        ownerMember.setProject(project);
        ownerMember.setUser(currentUser);
        ownerMember.setRole(ProjectMember.MemberRole.OWNER);
        memberRepository.save(ownerMember);

        return enrichProjectResponse(project);
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        checkProjectEditAccess(project);

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());

        project = projectRepository.save(project);
        return enrichProjectResponse(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        User currentUser = userService.getCurrentUser();
        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Only the project owner can delete this project");
        }

        projectRepository.delete(project);
    }

    // Member management
    @Transactional(readOnly = true)
    public List<MemberResponse> getProjectMembers(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        checkProjectAccess(project);

        return memberRepository.findByProjectId(projectId).stream()
                .map(MemberResponse::fromEntity)
                .toList();
    }

    @Transactional
    public MemberResponse addMember(Long projectId, MemberRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        checkProjectEditAccess(project);

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

        if (memberRepository.existsByProjectAndUser(project, user)) {
            throw new RuntimeException("User is already a member of this project");
        }

        ProjectMember member = new ProjectMember();
        member.setProject(project);
        member.setUser(user);
        member.setRole(request.getRole() != null ? request.getRole() : ProjectMember.MemberRole.MEMBER);

        member = memberRepository.save(member);
        return MemberResponse.fromEntity(member);
    }

    @Transactional
    public void removeMember(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        checkProjectEditAccess(project);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (project.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Cannot remove the project owner");
        }

        memberRepository.deleteByProjectAndUser(project, user);
    }

    private ProjectResponse enrichProjectResponse(Project project) {
        ProjectResponse response = ProjectResponse.fromEntity(project);
        response.setTaskCount(projectRepository.countTasksByProjectId(project.getId()));
        response.setCompletedTaskCount(projectRepository.countCompletedTasksByProjectId(project.getId()));
        response.setMemberCount(memberRepository.findByProjectId(project.getId()).size());
        return response;
    }

    private void checkProjectAccess(Project project) {
        User currentUser = userService.getCurrentUser();
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = memberRepository.existsByProjectAndUser(project, currentUser);

        if (!isOwner && !isMember) {
            throw new RuntimeException("You don't have access to this project");
        }
    }

    private void checkProjectEditAccess(Project project) {
        User currentUser = userService.getCurrentUser();
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());

        ProjectMember membership = memberRepository.findByProjectAndUser(project, currentUser).orElse(null);
        boolean isAdmin = membership != null &&
                (membership.getRole() == ProjectMember.MemberRole.OWNER ||
                        membership.getRole() == ProjectMember.MemberRole.ADMIN);

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("You don't have permission to edit this project");
        }
    }
}

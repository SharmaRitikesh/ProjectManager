package com.projectmanager.service;

import com.projectmanager.dto.TaskRequest;
import com.projectmanager.dto.TaskResponse;
import com.projectmanager.model.Project;
import com.projectmanager.model.Task;
import com.projectmanager.model.User;
import com.projectmanager.repository.ProjectMemberRepository;
import com.projectmanager.repository.ProjectRepository;
import com.projectmanager.repository.TaskRepository;
import com.projectmanager.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserService userService;

    public TaskService(TaskRepository taskRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            ProjectMemberRepository memberRepository,
            UserService userService) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        checkProjectAccess(project);

        return taskRepository.findByProjectIdOrderByPositionAsc(projectId).stream()
                .map(TaskResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getMyTasks() {
        User currentUser = userService.getCurrentUser();
        return taskRepository.findActiveTasksByAssignee(currentUser).stream()
                .map(TaskResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getOverdueTasks() {
        return taskRepository.findOverdueTasks(LocalDate.now()).stream()
                .map(TaskResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        checkProjectAccess(task.getProject());
        return TaskResponse.fromEntity(task);
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + request.getProjectId()));

        checkProjectAccess(project);

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setProject(project);
        task.setStatus(request.getStatus() != null ? request.getStatus() : Task.TaskStatus.TODO);
        task.setPriority(request.getPriority() != null ? request.getPriority() : Task.TaskPriority.MEDIUM);
        task.setDeadline(request.getDeadline());

        // Set position
        Integer maxPosition = taskRepository.findMaxPositionByProjectAndStatus(project, task.getStatus());
        task.setPosition(maxPosition != null ? maxPosition + 1 : 0);

        // Set assignee if provided
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getAssigneeId()));
            task.setAssignee(assignee);
        }

        task = taskRepository.save(task);
        return TaskResponse.fromEntity(task);
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        checkProjectAccess(task.getProject());

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());

        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        task.setDeadline(request.getDeadline());

        if (request.getPosition() != null) {
            task.setPosition(request.getPosition());
        }

        // Update assignee
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getAssigneeId()));
            task.setAssignee(assignee);
        } else {
            task.setAssignee(null);
        }

        task = taskRepository.save(task);
        return TaskResponse.fromEntity(task);
    }

    @Transactional
    public TaskResponse updateTaskStatus(Long id, Task.TaskStatus status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        checkProjectAccess(task.getProject());

        task.setStatus(status);
        task = taskRepository.save(task);
        return TaskResponse.fromEntity(task);
    }

    @Transactional
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        checkProjectAccess(task.getProject());
        taskRepository.delete(task);
    }

    private void checkProjectAccess(Project project) {
        User currentUser = userService.getCurrentUser();
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = memberRepository.existsByProjectAndUser(project, currentUser);

        if (!isOwner && !isMember) {
            throw new RuntimeException("You don't have access to this project");
        }
    }
}

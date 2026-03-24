package com.projectmanager.repository;

import com.projectmanager.model.Project;
import com.projectmanager.model.Task;
import com.projectmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    List<Task> findByProjectOrderByPositionAsc(Project project);
    
    List<Task> findByProjectIdOrderByPositionAsc(Long projectId);
    
    List<Task> findByAssignee(User assignee);
    
    List<Task> findByAssigneeOrderByDeadlineAsc(User assignee);
    
    @Query("SELECT t FROM Task t WHERE t.assignee = :user AND t.status != 'DONE' ORDER BY t.deadline ASC")
    List<Task> findActiveTasksByAssignee(@Param("user") User user);
    
    @Query("SELECT t FROM Task t WHERE t.deadline = :date AND t.status != 'DONE'")
    List<Task> findTasksDueOn(@Param("date") LocalDate date);
    
    @Query("SELECT t FROM Task t WHERE t.deadline < :date AND t.status != 'DONE'")
    List<Task> findOverdueTasks(@Param("date") LocalDate date);
    
    @Query("SELECT MAX(t.position) FROM Task t WHERE t.project = :project AND t.status = :status")
    Integer findMaxPositionByProjectAndStatus(@Param("project") Project project, @Param("status") Task.TaskStatus status);
    
    List<Task> findByProjectAndStatusOrderByPositionAsc(Project project, Task.TaskStatus status);
}

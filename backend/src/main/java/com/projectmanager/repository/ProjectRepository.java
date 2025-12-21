package com.projectmanager.repository;

import com.projectmanager.model.Project;
import com.projectmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    List<Project> findByOwner(User owner);
    
    List<Project> findByOwnerOrderByCreatedAtDesc(User owner);
    
    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members m WHERE p.owner = :user OR m.user = :user ORDER BY p.createdAt DESC")
    List<Project> findAllByUserAccess(@Param("user") User user);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId")
    Long countTasksByProjectId(@Param("projectId") Long projectId);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.status = 'DONE'")
    Long countCompletedTasksByProjectId(@Param("projectId") Long projectId);
}

package com.projectmanager.repository;

import com.projectmanager.model.Project;
import com.projectmanager.model.ProjectMember;
import com.projectmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    
    List<ProjectMember> findByProject(Project project);
    
    List<ProjectMember> findByProjectId(Long projectId);
    
    List<ProjectMember> findByUser(User user);
    
    Optional<ProjectMember> findByProjectAndUser(Project project, User user);
    
    Boolean existsByProjectAndUser(Project project, User user);
    
    void deleteByProjectAndUser(Project project, User user);
}

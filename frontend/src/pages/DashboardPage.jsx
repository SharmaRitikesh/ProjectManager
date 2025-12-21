import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI, taskAPI, userAPI, adminAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import './DashboardPage.css';

function DashboardPage() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Admin panel state
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedRole, setSelectedRole] = useState('MEMBER');
    const [assignLoading, setAssignLoading] = useState(false);

    const isAdmin = user?.systemRole === 'ADMIN' || user?.systemRole === 'MANAGER';

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [projectsRes, tasksRes] = await Promise.all([
                projectAPI.getAll(),
                taskAPI.getMyTasks()
            ]);
            setProjects(projectsRes.data);
            setMyTasks(tasksRes.data);

            // Load users for admin
            if (isAdmin) {
                try {
                    const usersRes = await adminAPI.getAllUsers();
                    setAllUsers(usersRes.data);
                } catch (e) {
                    console.log('Could not load users');
                }
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAssign = async () => {
        if (!selectedProject || selectedUsers.length === 0) return;

        setAssignLoading(true);
        try {
            await adminAPI.assignUsersToProject(selectedProject, {
                userIds: selectedUsers,
                role: selectedRole
            });
            setShowAssignModal(false);
            setSelectedProject('');
            setSelectedUsers([]);
            loadDashboardData();
        } catch (error) {
            console.error('Failed to assign users:', error);
        } finally {
            setAssignLoading(false);
        }
    };

    const toggleUserSelection = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            TODO: 'badge-todo',
            IN_PROGRESS: 'badge-progress',
            REVIEW: 'badge-review',
            DONE: 'badge-done'
        };
        return statusMap[status] || 'badge-todo';
    };

    const formatStatus = (status) => {
        return status.replace('_', ' ');
    };

    const getPriorityBadge = (priority) => {
        const priorityMap = {
            LOW: 'badge-low',
            MEDIUM: 'badge-medium',
            HIGH: 'badge-high',
            URGENT: 'badge-urgent'
        };
        return priorityMap[priority] || 'badge-medium';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const isOverdue = (deadline) => {
        if (!deadline) return false;
        return new Date(deadline) < new Date();
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    const totalTasks = projects.reduce((sum, p) => sum + (p.taskCount || 0), 0);
    const completedTasks = projects.reduce((sum, p) => sum + (p.completedTaskCount || 0), 0);
    const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;

    return (
        <div className="dashboard animate-fade-in">
            <div className="page-header">
                <h1>Welcome back, {user?.fullName || user?.username}! 👋</h1>
                <p>Here's an overview of your projects and tasks</p>
            </div>

            {/* Admin Quick Actions */}
            {isAdmin && (
                <div className="admin-quick-actions">
                    <div className="quick-action-header">
                        <span className="admin-badge">ADMIN</span>
                        <h3>Quick Actions</h3>
                    </div>
                    <div className="quick-action-buttons">
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowAssignModal(true)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="20" y1="8" x2="20" y2="14" />
                                <line x1="23" y1="11" x2="17" y2="11" />
                            </svg>
                            Assign Team Members
                        </button>
                        <Link to="/admin" className="btn btn-secondary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
                            Full Admin Panel
                        </Link>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon projects">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{projects.length}</span>
                        <span className="stat-label">Total Projects</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon active">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{activeProjects}</span>
                        <span className="stat-label">Active Projects</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon tasks">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 11l3 3L22 4" />
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{myTasks.length}</span>
                        <span className="stat-label">My Active Tasks</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon completed">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{completedTasks}/{totalTasks}</span>
                        <span className="stat-label">Tasks Completed</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Recent Projects */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>Recent Projects</h2>
                        <Link to="/projects" className="btn btn-ghost btn-sm">View All</Link>
                    </div>

                    {projects.length === 0 ? (
                        <div className="empty-state">
                            <p>No projects yet</p>
                            <Link to="/projects" className="btn btn-primary mt-md">Create Project</Link>
                        </div>
                    ) : (
                        <div className="project-list">
                            {projects.slice(0, 5).map(project => (
                                <Link to={`/projects/${project.id}`} key={project.id} className="project-item">
                                    <div className="project-info">
                                        <h4>{project.name}</h4>
                                        <p className="text-muted text-sm">{project.description || 'No description'}</p>
                                    </div>
                                    <div className="project-meta">
                                        <span className={`badge badge-${project.status?.toLowerCase()}`}>
                                            {project.status}
                                        </span>
                                        <span className="task-count">{project.taskCount || 0} tasks</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* My Tasks */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>My Tasks</h2>
                    </div>

                    {myTasks.length === 0 ? (
                        <div className="empty-state">
                            <p>No active tasks assigned to you</p>
                        </div>
                    ) : (
                        <div className="task-list">
                            {myTasks.slice(0, 5).map(task => (
                                <Link to={`/projects/${task.projectId}`} key={task.id} className="task-item">
                                    <div className="task-info">
                                        <h4>{task.title}</h4>
                                        <p className="text-muted text-sm">{task.projectName}</p>
                                    </div>
                                    <div className="task-meta">
                                        <span className={`badge ${getStatusBadge(task.status)}`}>
                                            {formatStatus(task.status)}
                                        </span>
                                        <span className={`badge ${getPriorityBadge(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                        {task.deadline && (
                                            <span className={`deadline ${isOverdue(task.deadline) ? 'overdue' : ''}`}>
                                                {formatDate(task.deadline)}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Assign Modal */}
            <Modal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                title="Quick Team Assignment"
            >
                <div className="quick-assign-form">
                    <div className="form-group">
                        <label className="form-label">Select Project</label>
                        <select
                            className="form-input form-select"
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                        >
                            <option value="">Choose a project...</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Select Team Members</label>
                        <div className="user-checkbox-list">
                            {allUsers.map(u => (
                                <label key={u.id} className="user-checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(u.id)}
                                        onChange={() => toggleUserSelection(u.id)}
                                    />
                                    <div className="user-checkbox-info">
                                        <span className="user-checkbox-name">{u.fullName || u.username}</span>
                                        <span className="user-checkbox-role">{u.systemRole}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Assign Role</label>
                        <select
                            className="form-input form-select"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            <option value="MEMBER">Member</option>
                            <option value="MENTOR">Mentor</option>
                            <option value="ADMIN">Project Admin</option>
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleQuickAssign}
                            disabled={!selectedProject || selectedUsers.length === 0 || assignLoading}
                        >
                            {assignLoading ? <span className="spinner"></span> : `Assign ${selectedUsers.length} Member(s)`}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default DashboardPage;

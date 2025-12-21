import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI, taskAPI, userAPI } from '../api/axios';
import Modal from '../components/common/Modal';
import './ProjectDetailPage.css';

const TASK_STATUSES = [
    { key: 'TODO', label: 'To Do', color: '#6b7280' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: '#f59e0b' },
    { key: 'REVIEW', label: 'Review', color: '#8b5cf6' },
    { key: 'DONE', label: 'Done', color: '#10b981' }
];

function ProjectDetailPage() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [taskFormData, setTaskFormData] = useState({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        deadline: '',
        assigneeId: ''
    });
    const [selectedUserId, setSelectedUserId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadProjectData();
    }, [id]);

    const loadProjectData = async () => {
        try {
            const [projectRes, tasksRes, membersRes, usersRes] = await Promise.all([
                projectAPI.getById(id),
                taskAPI.getByProject(id),
                projectAPI.getMembers(id),
                userAPI.getAllUsers()
            ]);
            setProject(projectRes.data);
            setTasks(tasksRes.data);
            setMembers(membersRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error('Failed to load project:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenTaskModal = (task = null) => {
        if (task) {
            setEditingTask(task);
            setTaskFormData({
                title: task.title,
                description: task.description || '',
                status: task.status,
                priority: task.priority,
                deadline: task.deadline || '',
                assigneeId: task.assignee?.id || ''
            });
        } else {
            setEditingTask(null);
            setTaskFormData({
                title: '',
                description: '',
                status: 'TODO',
                priority: 'MEDIUM',
                deadline: '',
                assigneeId: ''
            });
        }
        setShowTaskModal(true);
    };

    const handleCloseTaskModal = () => {
        setShowTaskModal(false);
        setEditingTask(null);
    };

    const handleTaskChange = (e) => {
        setTaskFormData({ ...taskFormData, [e.target.name]: e.target.value });
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const data = {
                ...taskFormData,
                projectId: parseInt(id),
                assigneeId: taskFormData.assigneeId ? parseInt(taskFormData.assigneeId) : null
            };

            if (editingTask) {
                await taskAPI.update(editingTask.id, data);
            } else {
                await taskAPI.create(data);
            }
            await loadProjectData();
            handleCloseTaskModal();
        } catch (error) {
            console.error('Failed to save task:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            await taskAPI.delete(taskId);
            await loadProjectData();
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await taskAPI.updateStatus(taskId, newStatus);
            await loadProjectData();
        } catch (error) {
            console.error('Failed to update task status:', error);
        }
    };

    const handleAddMember = async () => {
        if (!selectedUserId) return;
        setSubmitting(true);

        try {
            await projectAPI.addMember(id, { userId: parseInt(selectedUserId) });
            await loadProjectData();
            setShowMemberModal(false);
            setSelectedUserId('');
        } catch (error) {
            console.error('Failed to add member:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!confirm('Remove this member from the project?')) return;

        try {
            await projectAPI.removeMember(id, userId);
            await loadProjectData();
        } catch (error) {
            console.error('Failed to remove member:', error);
        }
    };

    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status);
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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

    const availableUsers = users.filter(
        user => !members.some(m => m.user.id === user.id)
    );

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!project) {
        return <div className="empty-state">Project not found</div>;
    }

    return (
        <div className="project-detail animate-fade-in">
            {/* Header */}
            <div className="project-header">
                <div className="header-left">
                    <Link to="/projects" className="back-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back to Projects
                    </Link>
                    <h1>{project.name}</h1>
                    <p className="text-secondary">{project.description || 'No description'}</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => setShowMemberModal(true)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                        Add Member
                    </button>
                    <button className="btn btn-primary" onClick={() => handleOpenTaskModal()}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Task
                    </button>
                </div>
            </div>

            {/* Team Members */}
            <div className="team-section">
                <h3>Team Members</h3>
                <div className="member-list">
                    {members.map(member => (
                        <div key={member.id} className="member-chip">
                            <div className="avatar avatar-sm">
                                {getInitials(member.user.fullName || member.user.username)}
                            </div>
                            <span>{member.user.fullName || member.user.username}</span>
                            <span className="member-role">{member.role}</span>
                            {member.role !== 'OWNER' && (
                                <button className="remove-member" onClick={() => handleRemoveMember(member.user.id)}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Task Board */}
            <div className="task-board">
                {TASK_STATUSES.map(status => (
                    <div key={status.key} className="task-column">
                        <div className="column-header" style={{ '--status-color': status.color }}>
                            <span className="column-title">{status.label}</span>
                            <span className="column-count">{getTasksByStatus(status.key).length}</span>
                        </div>
                        <div className="column-content">
                            {getTasksByStatus(status.key).map(task => (
                                <div key={task.id} className="task-card">
                                    <div className="task-card-header">
                                        <h4 className="task-title" onClick={() => handleOpenTaskModal(task)}>
                                            {task.title}
                                        </h4>
                                        <button className="task-delete" onClick={() => handleDeleteTask(task.id)}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>

                                    {task.description && (
                                        <p className="task-description">{task.description}</p>
                                    )}

                                    <div className="task-card-footer">
                                        <div className="task-meta">
                                            <span className={`badge badge-${task.priority?.toLowerCase()}`}>
                                                {task.priority}
                                            </span>
                                            {task.deadline && (
                                                <span className={`task-deadline ${isOverdue(task.deadline) ? 'overdue' : ''}`}>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}>
                                                        <circle cx="12" cy="12" r="10" />
                                                        <polyline points="12 6 12 12 16 14" />
                                                    </svg>
                                                    {formatDate(task.deadline)}
                                                </span>
                                            )}
                                        </div>
                                        {task.assignee && (
                                            <div className="avatar avatar-sm" title={task.assignee.fullName || task.assignee.username}>
                                                {getInitials(task.assignee.fullName || task.assignee.username)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Quick Change */}
                                    <div className="task-status-bar">
                                        {TASK_STATUSES.map(s => (
                                            <button
                                                key={s.key}
                                                className={`status-dot ${task.status === s.key ? 'active' : ''}`}
                                                style={{ '--dot-color': s.color }}
                                                onClick={() => handleStatusChange(task.id, s.key)}
                                                title={s.label}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {getTasksByStatus(status.key).length === 0 && (
                                <div className="column-empty">
                                    No tasks
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Task Modal */}
            <Modal
                isOpen={showTaskModal}
                onClose={handleCloseTaskModal}
                title={editingTask ? 'Edit Task' : 'Create New Task'}
            >
                <form onSubmit={handleTaskSubmit}>
                    <div className="form-group">
                        <label className="form-label">Task Title *</label>
                        <input
                            type="text"
                            name="title"
                            className="form-input"
                            placeholder="Enter task title"
                            value={taskFormData.title}
                            onChange={handleTaskChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            className="form-input form-textarea"
                            placeholder="Enter task description"
                            value={taskFormData.description}
                            onChange={handleTaskChange}
                        />
                    </div>

                    <div className="grid grid-2 gap-md">
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                name="status"
                                className="form-input form-select"
                                value={taskFormData.status}
                                onChange={handleTaskChange}
                            >
                                {TASK_STATUSES.map(s => (
                                    <option key={s.key} value={s.key}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select
                                name="priority"
                                className="form-input form-select"
                                value={taskFormData.priority}
                                onChange={handleTaskChange}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-2 gap-md">
                        <div className="form-group">
                            <label className="form-label">Deadline</label>
                            <input
                                type="date"
                                name="deadline"
                                className="form-input"
                                value={taskFormData.deadline}
                                onChange={handleTaskChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Assignee</label>
                            <select
                                name="assigneeId"
                                className="form-input form-select"
                                value={taskFormData.assigneeId}
                                onChange={handleTaskChange}
                            >
                                <option value="">Unassigned</option>
                                {members.map(m => (
                                    <option key={m.user.id} value={m.user.id}>
                                        {m.user.fullName || m.user.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleCloseTaskModal}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? <span className="spinner"></span> : (editingTask ? 'Save Changes' : 'Create Task')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Add Member Modal */}
            <Modal
                isOpen={showMemberModal}
                onClose={() => setShowMemberModal(false)}
                title="Add Team Member"
                size="small"
            >
                <div className="form-group">
                    <label className="form-label">Select User</label>
                    <select
                        className="form-input form-select"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                        <option value="">Choose a user...</option>
                        {availableUsers.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.fullName || user.username} ({user.email})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleAddMember} disabled={!selectedUserId || submitting}>
                        {submitting ? <span className="spinner"></span> : 'Add Member'}
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default ProjectDetailPage;

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, projectAPI } from '../api/axios';
import Modal from '../components/common/Modal';
import './AdminDashboardPage.css';

function AdminDashboardPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullName: '',
        password: '',
        systemRole: ''
    });
    const [assignData, setAssignData] = useState({
        userIds: [],
        role: 'MEMBER'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersRes, projectsRes] = await Promise.all([
                adminAPI.getAllUsers(),
                adminAPI.getAllProjects()
            ]);
            setUsers(usersRes.data);
            setProjects(projectsRes.data);
        } catch (error) {
            console.error('Failed to load admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            fullName: user.fullName || '',
            password: '',
            systemRole: user.systemRole
        });
        setShowEditModal(true);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.updateUser(editingUser.id, {
                username: formData.username,
                email: formData.email,
                fullName: formData.fullName,
                password: formData.password || undefined
            });

            if (formData.systemRole !== editingUser.systemRole) {
                await adminAPI.updateUserRole(editingUser.id, { role: formData.systemRole });
            }

            await loadData();
            setShowEditModal(false);
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    const handleAssignProject = (project) => {
        setSelectedProject(project);
        setAssignData({ userIds: [], role: 'MEMBER' });
        setShowAssignModal(true);
    };

    const handleAssignUsers = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.assignUsersToProject(selectedProject.id, assignData);
            await loadData();
            setShowAssignModal(false);
        } catch (error) {
            console.error('Failed to assign users:', error);
        }
    };

    const toggleUserSelection = (userId) => {
        setAssignData(prev => ({
            ...prev,
            userIds: prev.userIds.includes(userId)
                ? prev.userIds.filter(id => id !== userId)
                : [...prev.userIds, userId]
        }));
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard animate-fade-in">
            <div className="page-header">
                <h1>Admin Dashboard</h1>
                <p>Manage users, projects, and team assignments</p>
            </div>

            {/* Stats Cards */}
            <div className="admin-stats">
                <div className="stat-card">
                    <div className="stat-value">{users.length}</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{projects.length}</div>
                    <div className="stat-label">Total Projects</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{users.filter(u => u.systemRole === 'ADMIN').length}</div>
                    <div className="stat-label">Admins</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{users.filter(u => u.systemRole === 'MANAGER').length}</div>
                    <div className="stat-label">Managers</div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="admin-tabs">
                <button
                    className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
                <button
                    className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
                    onClick={() => setActiveTab('projects')}
                >
                    Projects
                </button>
            </div>

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar avatar-sm">
                                                {(u.fullName || u.username || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="user-name">{u.fullName || u.username}</div>
                                                <div className="user-username">@{u.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`role-badge role-${u.systemRole.toLowerCase()}`}>
                                            {u.systemRole}
                                        </span>
                                    </td>
                                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => handleEditUser(u)}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Project</th>
                                <th>Status</th>
                                <th>Tasks</th>
                                <th>Members</th>
                                <th>Progress</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div className="project-name">{p.name}</div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${p.status?.toLowerCase()}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td>{p.taskCount || 0}</td>
                                    <td>{p.memberCount || 1}</td>
                                    <td>
                                        <div className="progress-cell">
                                            <div className="progress-bar-mini">
                                                <div
                                                    className="progress-fill-mini"
                                                    style={{
                                                        width: `${p.taskCount ? Math.round((p.completedTaskCount / p.taskCount) * 100) : 0}%`
                                                    }}
                                                />
                                            </div>
                                            <span>{p.taskCount ? Math.round((p.completedTaskCount / p.taskCount) * 100) : 0}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => handleAssignProject(p)}
                                        >
                                            Assign
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit User Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit User"
            >
                <form onSubmit={handleSaveUser}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">New Password (leave blank to keep current)</label>
                        <input
                            type="password"
                            className="form-input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Enter new password"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">System Role</label>
                        <select
                            className="form-input form-select"
                            value={formData.systemRole}
                            onChange={(e) => setFormData({ ...formData, systemRole: e.target.value })}
                        >
                            <option value="USER">User</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Save Changes
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Assign Users Modal */}
            <Modal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                title={`Assign Users to ${selectedProject?.name}`}
            >
                <form onSubmit={handleAssignUsers}>
                    <div className="form-group">
                        <label className="form-label">Select Users</label>
                        <div className="user-selection-list">
                            {users.map(u => (
                                <label key={u.id} className="user-selection-item">
                                    <input
                                        type="checkbox"
                                        checked={assignData.userIds.includes(u.id)}
                                        onChange={() => toggleUserSelection(u.id)}
                                    />
                                    <span className="user-select-name">
                                        {u.fullName || u.username}
                                    </span>
                                    <span className="user-select-email">{u.email}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Project Role</label>
                        <select
                            className="form-input form-select"
                            value={assignData.role}
                            onChange={(e) => setAssignData({ ...assignData, role: e.target.value })}
                        >
                            <option value="MEMBER">Member</option>
                            <option value="MENTOR">Mentor</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={assignData.userIds.length === 0}>
                            Assign {assignData.userIds.length} User(s)
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default AdminDashboardPage;

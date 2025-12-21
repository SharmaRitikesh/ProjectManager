import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../api/axios';
import Modal from '../components/common/Modal';
import './ProjectsPage.css';

function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'ACTIVE',
        startDate: '',
        endDate: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const response = await projectAPI.getAll();
            setProjects(response.data);
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (project = null) => {
        if (project) {
            setEditingProject(project);
            setFormData({
                name: project.name,
                description: project.description || '',
                status: project.status,
                startDate: project.startDate || '',
                endDate: project.endDate || ''
            });
        } else {
            setEditingProject(null);
            setFormData({
                name: '',
                description: '',
                status: 'ACTIVE',
                startDate: '',
                endDate: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProject(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingProject) {
                await projectAPI.update(editingProject.id, formData);
            } else {
                await projectAPI.create(formData);
            }
            await loadProjects();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save project:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            await projectAPI.delete(id);
            await loadProjects();
        } catch (error) {
            console.error('Failed to delete project:', error);
        }
    };

    const getProgress = (project) => {
        if (!project.taskCount || project.taskCount === 0) return 0;
        return Math.round((project.completedTaskCount / project.taskCount) * 100);
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="projects-page animate-fade-in">
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1>Projects</h1>
                    <p>Manage your projects and track progress</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Project
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="empty-state card">
                    <div className="empty-state-icon">📁</div>
                    <h3>No projects yet</h3>
                    <p>Create your first project to get started</p>
                    <button className="btn btn-primary mt-lg" onClick={() => handleOpenModal()}>
                        Create Project
                    </button>
                </div>
            ) : (
                <div className="projects-grid">
                    {projects.map(project => (
                        <div key={project.id} className="project-card card">
                            <div className="project-card-header">
                                <Link to={`/projects/${project.id}`} className="project-title">
                                    {project.name}
                                </Link>
                                <div className="project-actions">
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleOpenModal(project)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(project.id)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, color: '#ef4444' }}>
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <p className="project-description">{project.description || 'No description'}</p>

                            <div className="project-progress">
                                <div className="progress-header">
                                    <span className="text-sm text-muted">Progress</span>
                                    <span className="text-sm font-medium">{getProgress(project)}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${getProgress(project)}%` }}></div>
                                </div>
                            </div>

                            <div className="project-card-footer">
                                <div className="project-stats">
                                    <span className="stat">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                                            <path d="M9 11l3 3L22 4" />
                                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                        </svg>
                                        {project.taskCount || 0} tasks
                                    </span>
                                    <span className="stat">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                        {project.memberCount || 1} members
                                    </span>
                                </div>
                                <span className={`badge badge-${project.status?.toLowerCase()}`}>
                                    {project.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Project Modal */}
            <Modal
                isOpen={showModal}
                onClose={handleCloseModal}
                title={editingProject ? 'Edit Project' : 'Create New Project'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Project Name *</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            placeholder="Enter project name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            className="form-input form-textarea"
                            placeholder="Enter project description"
                            value={formData.description}
                            onChange={handleChange}
                            maxLength={500}
                        />
                        <div className="char-counter" style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: '0.5rem',
                            fontSize: '0.75rem',
                            color: formData.description.length >= 450 ? '#f87171' : 'var(--text-muted)'
                        }}>
                            {formData.description.length}/500
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select
                            name="status"
                            className="form-input form-select"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="ON_HOLD">On Hold</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>
                    </div>

                    <div className="grid grid-2 gap-md">
                        <div className="form-group">
                            <label className="form-label">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                className="form-input"
                                value={formData.startDate}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                className="form-input"
                                value={formData.endDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? <span className="spinner"></span> : (editingProject ? 'Save Changes' : 'Create Project')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default ProjectsPage;

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
};

// User API
export const userAPI = {
    getCurrentUser: () => api.get('/users/me'),
    getUserById: (id) => api.get(`/users/${id}`),
    getAllUsers: () => api.get('/users'),
    searchUsers: (query) => api.get(`/users/search?query=${query}`),
    updateProfile: (data) => api.put('/users/me', data),
};

// Project API
export const projectAPI = {
    getAll: () => api.get('/projects'),
    getById: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
    getMembers: (id) => api.get(`/projects/${id}/members`),
    addMember: (id, data) => api.post(`/projects/${id}/members`, data),
    removeMember: (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`),
};

// Task API
export const taskAPI = {
    getByProject: (projectId) => api.get(`/tasks/project/${projectId}`),
    getMyTasks: () => api.get('/tasks/my-tasks'),
    getOverdue: () => api.get('/tasks/overdue'),
    getById: (id) => api.get(`/tasks/${id}`),
    create: (data) => api.post('/tasks', data),
    update: (id, data) => api.put(`/tasks/${id}`, data),
    updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
    delete: (id) => api.delete(`/tasks/${id}`),
};

// Admin API
export const adminAPI = {
    getAllUsers: () => api.get('/admin/users'),
    getUserById: (id) => api.get(`/admin/users/${id}`),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    updateUserRole: (id, data) => api.put(`/admin/users/${id}/role`, data),
    getAllProjects: () => api.get('/admin/projects'),
    assignUsersToProject: (projectId, data) => api.post(`/admin/projects/${projectId}/assign`, data),
};

export default api;


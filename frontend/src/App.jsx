import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/common/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function PrivateRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/login" />;
    if (user?.systemRole !== 'ADMIN' && user?.systemRole !== 'MANAGER') {
        return <Navigate to="/dashboard" />;
    }

    return children;
}

function PublicRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    return !isAuthenticated ? children : <Navigate to="/dashboard" />;
}

import { useState } from 'react';
import AbstractBackground from './components/common/AbstractBackground';

function AppLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="app-layout">
            <AbstractBackground />

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Mobile Header */}
            <div className="mobile-header">
                <button
                    className="menu-btn"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12h18M3 6h18M3 18h18" />
                    </svg>
                </button>
                <span className="mobile-logo-text">Project Manager</span>
            </div>

            <main className="main-content">
                {children}
            </main>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}

function App() {
    return (
        <Routes>
            <Route path="/login" element={
                <PublicRoute>
                    <LoginPage />
                </PublicRoute>
            } />
            <Route path="/register" element={
                <PublicRoute>
                    <RegisterPage />
                </PublicRoute>
            } />
            <Route path="/dashboard" element={
                <PrivateRoute>
                    <AppLayout>
                        <DashboardPage />
                    </AppLayout>
                </PrivateRoute>
            } />
            <Route path="/projects" element={
                <PrivateRoute>
                    <AppLayout>
                        <ProjectsPage />
                    </AppLayout>
                </PrivateRoute>
            } />
            <Route path="/projects/:id" element={
                <PrivateRoute>
                    <AppLayout>
                        <ProjectDetailPage />
                    </AppLayout>
                </PrivateRoute>
            } />
            <Route path="/admin" element={
                <AdminRoute>
                    <AppLayout>
                        <AdminDashboardPage />
                    </AppLayout>
                </AdminRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
    );
}

export default App;


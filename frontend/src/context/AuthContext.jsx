import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isNewUser, setIsNewUser] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            // Verify token is still valid
            userAPI.getCurrentUser()
                .then(response => {
                    setUser(response.data);
                    localStorage.setItem('user', JSON.stringify(response.data));
                })
                .catch(() => {
                    logout();
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        const response = await authAPI.login({ username, password });
        const { token, id, username: name, email, fullName, systemRole } = response.data;

        localStorage.setItem('token', token);
        const userData = { id, username: name, email, fullName, systemRole };
        localStorage.setItem('user', JSON.stringify(userData));

        // Check if this is a returning user
        const hasLoggedBefore = localStorage.getItem(`user_${id}_visited`);
        if (hasLoggedBefore) {
            setIsNewUser(false);
        } else {
            localStorage.setItem(`user_${id}_visited`, 'true');
            setIsNewUser(false); // Returning login, not new signup
        }

        setUser(userData);
        return response.data;
    };

    const register = async (userData) => {
        const response = await authAPI.register(userData);
        const { token, id, username, email, fullName, systemRole } = response.data;

        localStorage.setItem('token', token);
        const user = { id, username, email, fullName, systemRole };
        localStorage.setItem('user', JSON.stringify(user));

        // Mark as new user for welcome message
        setIsNewUser(true);
        localStorage.setItem(`user_${id}_visited`, 'true');

        setUser(user);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const clearNewUserFlag = () => setIsNewUser(false);

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isNewUser,
        clearNewUserFlag,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

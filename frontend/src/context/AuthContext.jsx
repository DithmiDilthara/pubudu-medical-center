import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create Auth Context
const AuthContext = createContext(null);

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if available
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

// Handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedToken = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // Login function
    const login = async (username, password) => {
        try {
            setError(null);
            setLoading(true);

            const response = await api.post('/auth/login', { username, password });

            if (response.data.success) {
                const { user: userData, token: authToken } = response.data.data;

                // Store in localStorage
                localStorage.setItem('token', authToken);
                localStorage.setItem('user', JSON.stringify(userData));

                // Update state
                setToken(authToken);
                setUser(userData);

                return { success: true, user: userData };
            } else {
                throw new Error(response.data.message);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Login failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            setError(null);
            setLoading(true);

            const response = await api.post('/auth/register', userData);

            if (response.data.success) {
                const { user: newUser, token: authToken } = response.data.data;

                // Store in localStorage
                localStorage.setItem('token', authToken);
                localStorage.setItem('user', JSON.stringify(newUser));

                // Update state
                setToken(authToken);
                setUser(newUser);

                return { success: true, user: newUser };
            } else {
                throw new Error(response.data.message);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setError(null);
    };

    // Get user profile
    const getProfile = async () => {
        try {
            const response = await api.get('/auth/profile');
            if (response.data.success) {
                return { success: true, data: response.data.data };
            }
            throw new Error(response.data.message);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch profile';
            return { success: false, error: errorMessage };
        }
    };

    // Check if user has specific role
    const hasRole = (requiredRoles) => {
        if (!user) return false;
        if (typeof requiredRoles === 'string') {
            return user.role === requiredRoles;
        }
        return requiredRoles.includes(user.role);
    };

    // Check if user is authenticated
    const isAuthenticated = () => {
        return !!token && !!user;
    };

    // Context value
    const value = {
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        getProfile,
        hasRole,
        isAuthenticated,
        api
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const token = localStorage.getItem('token');
        const userRoles = localStorage.getItem('userRoles');
        
        if (token && userRoles) {
            setUser({
                token,
                roles: JSON.parse(userRoles)
            });
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRoles');
        setUser(null);
    };

    const isAuthenticated = () => {
        return !!user;
    };

    const hasRole = (role) => {
        return user?.roles?.includes(role) || false;
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 
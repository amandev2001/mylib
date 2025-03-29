import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './components/AdminDashboard';
import PasswordReset from './components/PasswordReset';
import { AuthProvider } from './contexts/AuthContext';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        
                        {/* Admin Routes */}
                        <Route path="/admin" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><AdminDashboard /></ProtectedRoute>}>
                            <Route path="users" element={<div>User Management</div>} />
                            <Route path="reset-password" element={<PasswordReset />} />
                            <Route path="settings" element={<div>System Settings</div>} />
                        </Route>
                        
                        {/* Other protected routes */}
                        <Route path="/dashboard" element={<ProtectedRoute><div>Dashboard</div></ProtectedRoute>} />
                    </Routes>
                </Router>
                <ToastContainer />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App; 
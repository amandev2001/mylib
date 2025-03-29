import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Link,
    Container
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

// Create axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    }
});

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            console.log('Attempting login with credentials:', {
                email: formData.email,
                hasPassword: !!formData.password,
                passwordLength: formData.password.length
            });

            const response = await api.post('/api/users/login', formData);
            console.log('Login response:', response.data);

            if (response.data && response.data.token) {
                // Store token and user info
                localStorage.setItem('token', response.data.token);
                if (response.data.roles) {
                    localStorage.setItem('userRoles', JSON.stringify(response.data.roles));
                }
                
                // Update auth context
                login(response.data);

                // Show success message
                toast.success('Login successful!');

                // Redirect based on role
                if (response.data.roles && response.data.roles.includes('ROLE_ADMIN')) {
                    navigate('/admin/users');
                } else {
                    navigate('/dashboard');
                }
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Login error:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });

            const errorMessage = err.response?.data || err.message || 'Login failed. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%'
                    }}
                >
                    <Typography component="h1" variant="h5" gutterBottom>
                        MyLib
                    </Typography>
                    <Typography component="h2" variant="h6" gutterBottom color="textSecondary">
                        Welcome Back!
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Please sign in to your account
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={formData.email}
                            onChange={handleChange}
                            error={!!error}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            error={!!error}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Don't have an account?{' '}
                                <Link component={RouterLink} to="/register" variant="body2">
                                    Register here
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login; 
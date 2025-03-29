import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    CircularProgress,
    Alert
} from '@mui/material';

const PasswordReset = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password strength
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post('/api/users/reset-password', {
                email,
                newPassword
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            toast.success('Password reset successfully');
            // Clear form
            setEmail('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            const errorMessage = err.response?.data || 'Failed to reset password';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                bgcolor: '#f5f5f5'
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    width: '100%',
                    maxWidth: 400,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                <Typography variant="h5" component="h1" gutterBottom>
                    Reset User Password
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="User Email"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        margin="normal"
                    />

                    <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        variant="outlined"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        margin="normal"
                        helperText="Password must be at least 8 characters long"
                    />

                    <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        variant="outlined"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        margin="normal"
                        helperText="Re-enter the new password"
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loading}
                        sx={{ mt: 3 }}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Reset Password'
                        )}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default PasswordReset; 
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import api from '../services/api';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dateExtensions';
import { useDarkMode } from '../context/DarkModeContext';

// Role constants matching backend
const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  LIBRARIAN: 'ROLE_LIBRARIAN'
};

const BorrowManagement = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Create a custom theme based on dark mode
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      background: {
        default: isDarkMode ? '#1a202c' : '#ffffff',
        paper: isDarkMode ? '#2d3748' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#f7fafc' : '#000000',
        secondary: isDarkMode ? '#a0aec0' : '#718096',
      },
    },
  });

  useEffect(() => {
    // Debug: Log user roles and token
    const userRoles = authService.getUserRoles();
    const token = authService.getCurrentToken();
    console.log('Current user roles:', userRoles);
    console.log('Current token:', token);
    console.log('Has admin role:', authService.hasRole(ROLES.ADMIN));
    console.log('Has librarian role:', authService.hasRole(ROLES.LIBRARIAN));

    // Check if user has required role
    if (!userRoles.some(role => [ROLES.ADMIN, ROLES.LIBRARIAN].includes(role))) {
      console.log('User does not have required role, redirecting to home');
      navigate('/');
      return;
    }
    fetchBorrows();
  }, [navigate]);

  const fetchBorrows = async () => {
    try {
      // Debug: Log request headers
      const token = authService.getCurrentToken();
      console.log('Making request with token:', token);
      
      const response = await api.get('/borrow/admin/all');
      setBorrows(response.data);
      setError(null);
      setSuccess(null);
    } catch (err) {
      setError('Failed to fetch borrow records');
      console.error('Error fetching borrows:', err);
      // Debug: Log error details
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
        console.error('Error headers:', err.response.headers);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBorrow = async (borrowRequestId) => {
    try {
      setError(null);
      await api.put(`/borrow/admin/approve/${borrowRequestId}`);
      setSuccess('Borrow request approved successfully');
      fetchBorrows();
    } catch (err) {
      // Set a more specific error message from the API response
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to approve borrow request');
      }
      console.error('Error approving borrow:', err);
    }
  };

  const handleApproveReturn = async (borrowRecordId) => {
    try {
      setError(null);
      await api.put(`/borrow/admin/return/approve/${borrowRecordId}`);
      setSuccess('Return request approved successfully');
      fetchBorrows();
    } catch (err) {
      // Set a more specific error message from the API response
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to approve return request');
      }
      console.error('Error approving return:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'RETURNED':
        return 'info';
      case 'RETURN_REQUESTED':
        return 'secondary';
      default:
        return 'default';
    }
  };

  useEffect(() => {
    return () => {
      setError(null);
      setSuccess(null);
    };
  }, []);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"
             sx={{ color: theme.palette.text.primary }}>
          <CircularProgress color={isDarkMode ? "info" : "primary"} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-lg rounded-lg overflow-hidden transition-colors duration-200`}>
            <div className={`px-6 py-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b flex justify-between items-center`}>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Borrow Management</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>User</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Book</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                  {borrows.map((borrow) => (
                    <tr key={borrow.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{borrow.userName}</td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{borrow.bookTitle}</td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Typography color={getStatusColor(borrow.status)}>
                          {borrow.status}
                        </Typography>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {borrow.status === 'PENDING' && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleApproveBorrow(borrow.id)}
                          >
                            Approve Borrow
                          </Button>
                        )}
                        {borrow.status === 'RETURN_REQUESTED' && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleApproveReturn(borrow.id)}
                          >
                            Approve Return
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default BorrowManagement; 
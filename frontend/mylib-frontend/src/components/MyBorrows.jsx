import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  ThemeProvider,
  createTheme,
  Chip,
} from '@mui/material';
import { authService } from '../services/authService';
import { loanService } from '../services/loanService';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dateExtensions';
import { useDarkMode } from '../context/DarkModeContext';
import { 
  ArrowPathIcon, 
  CheckIcon, 
  XMarkIcon,
  ClockIcon,
  BookOpenIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import FormattedDate from './common/FormattedDate';

const MyBorrows = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalBorrows: 0,
    activeBorrows: 0,
    pendingBorrows: 0,
    overdueBorrows: 0
  });

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
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchMyBorrows();
  }, [navigate]);

  const fetchMyBorrows = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        setError('User data not found');
        return;
      }
      console.log('Fetching borrows for user:', user);
      const response = await loanService.getUserLoans(user.id);
      console.log('Raw borrow response:', JSON.stringify(response, null, 2));
      
      // Transform the response data if needed
      const formattedBorrows = response.map(borrow => {
        console.log('Processing borrow record:', JSON.stringify(borrow, null, 2));
        return {
          id: borrow.id,
          bookTitle: borrow.book?.title || borrow.bookTitle || 'Unknown Book',
          issueDate: borrow.issueDate || borrow.borrowDate || borrow.createdAt,
          dueDate: borrow.dueDate || borrow.returnDate,
          status: borrow.status,
          book: borrow.book,
          fineAmount: borrow.fineAmount
        };
      });
      
      console.log('Formatted borrows:', JSON.stringify(formattedBorrows, null, 2));
      setBorrows(formattedBorrows);
      calculateStats(formattedBorrows);
      setError(null);
    } catch (err) {
      setError('Failed to fetch your borrow records');
      console.error('Error fetching borrows:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (loansData) => {
    const totalBorrows = loansData.length;
    const activeBorrows = loansData.filter(loan => loan.status === 'BORROWED').length;
    const pendingBorrows = loansData.filter(loan => loan.status === 'PENDING').length;
    const overdueBorrows = loansData.filter(loan => 
      loan.status === 'BORROWED' && new Date(loan.dueDate) < new Date()
    ).length;

    setStats({
      totalBorrows,
      activeBorrows,
      pendingBorrows,
      overdueBorrows
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning'; // Orange for pending/awaiting approval
      case 'APPROVED':
        return 'success'; // Green for active/approved
      case 'RETURNED':
        return 'info'; // Blue for completed/returned
      case 'RETURN_REQUESTED':
        return 'secondary'; // Grey for return requested
      case 'OVERDUE':
        return 'error'; // Red for overdue items
      case 'REJECTED':
        return 'error'; // Red for rejected items
      default:
        return 'default';
    }
  };

  const getStatusStyle = (status) => {
    // Define styles similar to LoanTableRow but adapted for Material-UI
    switch (status) {
      case 'PENDING':
        return {
          fontWeight: 600,
          borderRadius: '9999px',
          padding: '2px 0',
          '& .MuiChip-label': {
            px: 1.5,
          },
          bgcolor: isDarkMode ? '#854d0e' : '#fef9c3',  // yellow-900 : yellow-100
          color: isDarkMode ? '#fef08a' : '#854d0e',  // yellow-200 : yellow-800
        };
      case 'APPROVED':
      case 'BORROWED':
        return {
          fontWeight: 600,
          borderRadius: '9999px',
          padding: '2px 0',
          '& .MuiChip-label': {
            px: 1.5,
          },
          bgcolor: isDarkMode ? '#1e3a8a' : '#dbeafe',  // blue-900 : blue-100
          color: isDarkMode ? '#bfdbfe' : '#1e40af',  // blue-200 : blue-800
        };
      case 'RETURNED':
        return {
          fontWeight: 600,
          borderRadius: '9999px',
          padding: '2px 0',
          '& .MuiChip-label': {
            px: 1.5,
          },
          bgcolor: isDarkMode ? '#14532d' : '#dcfce7',  // green-900 : green-100
          color: isDarkMode ? '#86efac' : '#166534',  // green-200 : green-800
        };
      case 'RETURN_REQUESTED':
      case 'RETURN_PENDING':
        return {
          fontWeight: 600,
          borderRadius: '9999px',
          padding: '2px 0',
          '& .MuiChip-label': {
            px: 1.5,
          },
          bgcolor: isDarkMode ? '#9a3412' : '#ffedd5',  // orange-900 : orange-100
          color: isDarkMode ? '#fed7aa' : '#9a3412',  // orange-200 : orange-800
        };
      case 'OVERDUE':
      case 'REJECTED':
        return {
          fontWeight: 600,
          borderRadius: '9999px',
          padding: '2px 0',
          '& .MuiChip-label': {
            px: 1.5,
          },
          bgcolor: isDarkMode ? '#7f1d1d' : '#fee2e2',  // red-900 : red-100
          color: isDarkMode ? '#fecaca' : '#991b1b',  // red-200 : red-800
        };
      default:
        return {
          fontWeight: 600,
          borderRadius: '9999px',
          padding: '2px 0',
          '& .MuiChip-label': {
            px: 1.5,
          },
          bgcolor: isDarkMode ? '#374151' : '#f3f4f6',  // gray-700 : gray-100
          color: isDarkMode ? '#d1d5db' : '#374151',  // gray-300 : gray-700
        };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Awaiting Approval';
      case 'APPROVED':
        return 'Borrowed';
      case 'RETURNED':
        return 'Returned';
      case 'RETURN_REQUESTED':
        return 'Return Requested';
      default:
        return status;
    }
  };

  const formatBorrowDate = (date, status) => {
    if (status === 'PENDING') {
      return (
        <Typography variant="body2" color="text.secondary">
          Not yet issued
        </Typography>
      );
    }
    if (!date) return 'N/A';
    return formatDate(date);
  };

  const formatDueDate = (date, status) => {
    if (status === 'PENDING') {
      return (
        <Typography variant="body2" color="text.secondary">
          Not yet set
        </Typography>
      );
    }
    if (!date) return 'N/A';
    return formatDate(date);
  };

  const handleReturn = async (loanId) => {
    try {
      await loanService.requestReturn(loanId);
      await fetchMyBorrows();
    } catch (err) {
      console.error('Error requesting return:', err);
      setError('Failed to request return. Please try again later.');
    }
  };

  const handleCancelBorrow = async (loanId) => {
    try {
      await loanService.cancelBorrowRequest(loanId);
      await fetchMyBorrows();
    } catch (err) {
      console.error('Error canceling borrow request:', err);
      setError('Failed to cancel borrow request. Please try again later.');
    }
  };

  const handleCancelReturn = async (loanId) => {
    try {
      await loanService.cancelReturnRequest(loanId);
      await fetchMyBorrows();
    } catch (err) {
      console.error('Error canceling return request:', err);
      setError('Failed to cancel return request. Please try again later.');
    }
  };

  const getActionButtons = (loan) => {
    const buttons = [];

    if (loan.status === 'BORROWED') {
      buttons.push(
        <button 
          key="return"
          className={`${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-900"} flex items-center`}
          onClick={() => handleReturn(loan.id)}
        >
          <ArrowPathIcon className="h-5 w-5 mr-1" />
          Request Return
        </button>
      );
    }

    if (loan.status === 'PENDING') {
      buttons.push(
        <button 
          key="cancel-borrow"
          className={`${isDarkMode ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-900"} flex items-center`}
          onClick={() => handleCancelBorrow(loan.id)}
        >
          <XMarkIcon className="h-5 w-5 mr-1" />
          Cancel Request
        </button>
      );
    }

    if (loan.status === 'RETURN_PENDING') {
      buttons.push(
        <button 
          key="cancel-return"
          className={`${isDarkMode ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-900"} flex items-center`}
          onClick={() => handleCancelReturn(loan.id)}
        >
          <XMarkIcon className="h-5 w-5 mr-1" />
          Cancel Return
        </button>
      );
    }

    return <div className="flex space-x-4">{buttons}</div>;
  };

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
      <Box sx={{ 
        p: 3, 
        color: theme.palette.text.primary,
        bgcolor: theme.palette.background.default,
        borderRadius: 1,
      }}>
        <Typography variant="h4" gutterBottom sx={{ color: theme.palette.text.primary }}>
          My Borrow Records
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {borrows.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            You don't have any borrow records yet.
          </Alert>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: theme.palette.background.paper }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: theme.palette.text.secondary }}>Book</TableCell>
                  <TableCell sx={{ color: theme.palette.text.secondary }}>Borrow Date</TableCell>
                  <TableCell sx={{ color: theme.palette.text.secondary }}>Due Date</TableCell>
                  <TableCell sx={{ color: theme.palette.text.secondary }}>Status</TableCell>
                  <TableCell sx={{ color: theme.palette.text.secondary }}>Fine</TableCell>
                  <TableCell sx={{ color: theme.palette.text.secondary }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {borrows.map((borrow) => {
                  console.log('Rendering borrow record:', JSON.stringify(borrow, null, 2));
                  return (
                    <TableRow key={borrow.id} 
                              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {borrow.bookTitle}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {formatBorrowDate(borrow.issueDate, borrow.status)}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {formatDueDate(borrow.dueDate, borrow.status)}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(borrow.status)}
                          color={getStatusColor(borrow.status)}
                          size="small"
                          sx={getStatusStyle(borrow.status)}
                        />
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {borrow.fineAmount > 0 ? `$${borrow.fineAmount.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        {getActionButtons(borrow)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default MyBorrows; 
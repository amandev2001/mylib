import { useState, useEffect, memo } from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { loanService } from '../services/loanService';
import { authService } from '../services/authService';
import { formatDateForInput } from '../utils/dateExtensions';
import LoanTableRow from '../components/LoanTableRow';
import { useDarkMode } from '../context/DarkModeContext';

const Loans = memo(function Loans() {
  const { isDarkMode } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [editForm, setEditForm] = useState({
    issueDate: '',
    dueDate: '',
    returnDate: '',
    fineAmount: ''
  });

  useEffect(() => {
    console.log('Loans component mounted');
    const initialize = async () => {
      console.log('Starting initialization...');
      try {
        await checkUserRole();
        console.log('Role check completed');
        await fetchLoans();
        console.log('Loans fetched');
      } catch (error) {
        console.error('Error during initialization:', error);
      }
    };
    initialize();
  }, []);

  const checkUserRole = async () => {
    try {
      console.log('Checking user role...');
      const roles = authService.getUserRoles();
      console.log('User roles:', roles);
      const hasAdminRole = roles.includes('ROLE_ADMIN');
      console.log('Has admin role:', hasAdminRole);
      setIsAdmin(hasAdminRole);
      return hasAdminRole;
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsAdmin(false);
      return false;
    }
  };

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const data = await loanService.getAllLoans();
      console.log('Raw loan data:', JSON.stringify(data, null, 2));
      setLoans(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch loans. Please try again later.');
      console.error('Error fetching loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    setSearchQuery(e.target.value);
    try {
      if (e.target.value.trim()) {
        const data = await loanService.searchLoans(e.target.value);
        setLoans(data);
      } else {
        fetchLoans();
      }
    } catch (err) {
      console.error('Error searching loans:', err);
    }
  };

  const handleReturn = async (id) => {
    try {
      await loanService.requestReturn(id);
      fetchLoans();
    } catch (err) {
      console.error('Error returning book:', err);
      alert('Failed to return book. Please try again.');
    }
  };

  const handleApproveBorrow = async (id) => {
    try {
      await loanService.approveLoan(id);
      fetchLoans();
    } catch (err) {
      console.error('Error approving borrow:', err);
      
      // Show a more specific error message based on the error from the server
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to approve borrow request. Please try again.');
      }
    }
  };

  const handleApproveReturn = async (id) => {
    try {
      await loanService.approveReturn(id);
      fetchLoans();
    } catch (err) {
      console.error('Error approving return:', err);
      alert('Failed to approve return request. Please try again.');
    }
  };

  const handleCancelBorrowRequest = async (id) => {
    try {
      await loanService.cancelBorrowRequest(id);
      fetchLoans();
    } catch (err) {
      console.error('Error canceling borrow request:', err);
      alert('Failed to cancel borrow request. Please try again.');
    }
  };

  const handleCancelReturnRequest = async (id) => {
    try {
      await loanService.cancelReturnRequest(id);
      fetchLoans();
    } catch (err) {
      console.error('Error canceling return request:', err);
      alert('Failed to cancel return request. Please try again.');
    }
  };

  const handleEditClick = (loan) => {
    setEditingLoan(loan);
    setEditForm({
      issueDate: formatDateForInput(loan.issueDate),
      dueDate: formatDateForInput(loan.dueDate),
      returnDate: formatDateForInput(loan.returnDate),
      fineAmount: loan.fineAmount || ''
    });
  };

  const handleEditSubmit = async (id) => {
    try {
      await loanService.updateBorrowRecord(id, editForm);
      setEditingLoan(null);
      fetchLoans();
    } catch (err) {
      console.error('Error updating borrow record:', err);
      alert('Failed to update borrow record. Please try again.');
    }
  };

  const handleEditCancel = () => {
    setEditingLoan(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-blue-400' : 'border-blue-600'}`}></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {error && (
        <div className="bg-[#1a1a1a] text-[#ff4444] p-4 mb-4 rounded flex items-center">
          <span className="mr-2">⚠</span>
          {error}
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : ''}`}>{isAdmin ? 'Loan Management' : 'My Loans'}</h2>
          {isAdmin && (
            <button className={`btn-primary flex items-center ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>
              <PlusIcon className="h-5 w-5 mr-2" />
              New Loan
            </button>
          )}
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search loans by book title or member name..."
                className={`input-field pl-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                value={searchQuery}
                onChange={handleSearch}
              />
              <MagnifyingGlassIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} absolute left-3 top-1/2 transform -translate-y-1/2`} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>ID</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Book Title</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Member</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Borrow Date</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Due Date</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Return Date</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Fine Amount</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}`}>
                {loans.map((loan) => (
                  <LoanTableRow
                    key={loan.id}
                    loan={loan}
                    isAdmin={isAdmin}
                    editingLoan={editingLoan}
                    editForm={editForm}
                    onEditFormChange={setEditForm}
                    onEditSubmit={handleEditSubmit}
                    onEditCancel={handleEditCancel}
                    onReturn={handleReturn}
                    onApproveBorrow={handleApproveBorrow}
                    onApproveReturn={handleApproveReturn}
                    onCancelBorrowRequest={handleCancelBorrowRequest}
                    onCancelReturnRequest={handleCancelReturnRequest}
                    onEditClick={handleEditClick}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
});

Loans.displayName = 'Loans';

export default Loans; 
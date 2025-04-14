import { useState, useEffect } from 'react';
import { ClipboardDocumentCheckIcon, ExclamationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useDarkMode } from "../context/DarkModeContext";
import { authService } from '../services/authService';
import { loanService } from '../services/loanService';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dateExtensions';

function ReturnBook() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchBorrowedBooks();
  }, [navigate]);

  const fetchBorrowedBooks = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        setError('User data not found');
        return;
      }
      // console.log('Fetching borrows for user:', user);
      const response = await loanService.getUserLoans(user.id);
      // console.log('Raw borrow response:', JSON.stringify(response, null, 2));
      
      // Only show books that are actually borrowed or pending return
      const activeLoans = response.filter(loan => 
        loan.status === 'BORROWED' || loan.status === 'RETURN_REQUESTED'
      );
      
      // Transform the response data
      const formattedBorrows = activeLoans.map(borrow => ({
        id: borrow.id,
        book: borrow.book,
        issueDate: borrow.issueDate || borrow.borrowDate || borrow.createdAt,
        dueDate: borrow.dueDate,
        status: borrow.status,
        fineAmount: borrow.fineAmount
      }));
      
      // console.log('Formatted borrows:', JSON.stringify(formattedBorrows, null, 2));
      setBorrowedBooks(formattedBorrows);
    } catch (err) {
      console.error('Error fetching borrows:', err);
      setError('Failed to fetch your borrow records');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (borrowId) => {
    try {
      await loanService.requestReturn(borrowId);
      await fetchBorrowedBooks(); // Refresh the list
    } catch (err) {
      console.error('Error requesting return:', err);
      setError('Failed to request return. Please try again later.');
    }
  };

  const handleCancelReturn = async (borrowId) => {
    try {
      await loanService.cancelReturnRequest(borrowId);
      await fetchBorrowedBooks();
    } catch (err) {
      console.error('Error canceling return request:', err);
      setError('Failed to cancel return request');
    }
  };

  const getReturnButton = (borrow) => {
    if (borrow.status === 'RETURN_REQUESTED') {
      return (
        <div className="flex flex-col items-end gap-2">
          <span className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
            Return Requested
          </span>
          <button
            onClick={() => handleCancelReturn(borrow.id)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 mr-2" />
            Cancel Request
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => handleReturn(borrow.id)}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
        Request Return
      </button>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className={`p-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      <h1 className="text-2xl font-bold mb-6">Return Books</h1>
      
      {borrowedBooks.length === 0 ? (
        <div className="text-center py-8">
          <p>You have no books to return</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {borrowedBooks.map((borrow) => (
            <div 
              key={borrow.id} 
              className={`p-4 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{borrow.book?.title || 'Unknown Book'}</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Due: {formatDate(borrow.dueDate)}
                  </p>
                  {new Date(borrow.dueDate) < new Date() && (
                    <p className="text-red-500 text-sm flex items-center mt-1">
                      <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                      Overdue
                    </p>
                  )}
                </div>
                {getReturnButton(borrow)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReturnBook;

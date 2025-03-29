import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import { bookService } from '../services/bookService';
import { authService } from '../services/authService';
import { loanService } from '../services/loanService';
import { formatDate } from '../utils/dateExtensions';
import EditBookModal from '../components/EditBookModal';
import BookDetailsModal from '../components/BookDetailsModal';
import { useDarkMode } from '../context/DarkModeContext';
import ImagePreview from '../components/common/ImagePreview';
import { reserveService } from '../services/reserveService';

// Default book cover images for different categories
const DEFAULT_COVERS = {
  Fiction: '/book-covers/fiction-default.jpg.webp',
  'Non-Fiction': '/book-covers/non-fiction-default.jpg.webp',
  'Science Fiction': '/book-covers/sci-fi-default.jpg.webp',
  Mystery: '/book-covers/mystery-default.jpg.webp',
  Romance: '/book-covers/romance-default.jpg.webp',
  default: '/book-covers/default.jpg.webp'
};

// Role constants
const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  LIBRARIAN: 'ROLE_LIBRARIAN'
};

function Books() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowLoading, setBorrowLoading] = useState({});
  const [borrowError, setBorrowError] = useState({});
  const [borrowSuccess, setBorrowSuccess] = useState({});
  const [activeBorrows, setActiveBorrows] = useState([]);
  const [returnLoading, setReturnLoading] = useState({});
  const [returnError, setReturnError] = useState({});
  const [returnSuccess, setReturnSuccess] = useState({});
  const [userBorrowHistory, setUserBorrowHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [reserveLoading, setReserveLoading] = useState({});
  const [reserveError, setReserveError] = useState({});
  const [reserveSuccess, setReserveSuccess] = useState({});
  
  // Image error handling
  const handleImageError = (e, category) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = DEFAULT_COVERS[category] || DEFAULT_COVERS.default;
  };

  useEffect(() => {
    fetchBooks();
    fetchActiveBorrows();
    fetchUserBorrowHistory();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const token = authService.getCurrentToken();
      console.log('Current token:', token);
      
      const data = await bookService.getAllBooks();
      console.log('Fetched books:', data);
      setBooks(data);
      setError(null);
    } catch (err) {
      console.error('Detailed error:', {
        message: err.message,
        response: err.response?.data,
        available: err.response?.available
      });
      setError('Failed to fetch books. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveBorrows = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser && currentUser.id) {
        const activeBorrowsData = await loanService.getActiveBorrows(currentUser.id);
        setActiveBorrows(activeBorrowsData);
      }
    } catch (err) {
      console.error('Error fetching active borrows:', err);
    }
  };

  const fetchUserBorrowHistory = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser && currentUser.id) {
        const history = await loanService.getUserLoans(currentUser.id);
        setUserBorrowHistory(history);
      }
    } catch (err) {
      console.error('Error fetching user borrow history:', err);
    }
  };

  const handleSearch = async (e) => {
    setSearchQuery(e.target.value);
    try {
      if (e.target.value.trim()) {
        const data = await bookService.searchBooks(e.target.value);
        setBooks(data);
      } else {
        fetchBooks();
      }
    } catch (err) {
      console.error('Error searching books:', err);
    }
  };

  const handleEditBook = async (bookId, bookData) => {
    try {
      setLoading(true);
      await bookService.updateBook(bookId, bookData);
      await fetchBooks();
      setIsEditModalOpen(false);
      setSelectedBook(null);
    } catch (err) {
      console.error('Error updating book:', err);
      setError('Failed to update book. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (book) => {
    navigate(`/books/${book.id}`);
  };

  const handleEditClick = (book) => {
    setSelectedBook(book);
    setIsEditModalOpen(true);
  };

  const handleBorrow = async (bookId) => {
    try {
      setBorrowLoading(prev => ({ ...prev, [bookId]: true }));
      setBorrowError(prev => ({ ...prev, [bookId]: null }));
      setBorrowSuccess(prev => ({ ...prev, [bookId]: null }));

      console.log('Starting borrow process for book:', bookId);
      const currentUser = await authService.getCurrentUser();
      console.log('Current user data:', currentUser);

      if (!currentUser) {
        console.log('No current user found');
        setBorrowError(prev => ({ ...prev, [bookId]: 'Please login to borrow books' }));
        return;
      }

      if (!currentUser.id) {
        console.log('Current user has no ID:', currentUser);
        setBorrowError(prev => ({ ...prev, [bookId]: 'Unable to get user information. Please try logging in again.' }));
        return;
      }

      console.log('Attempting to create loan with userId:', currentUser.id, 'bookId:', bookId);
      await loanService.createLoan(currentUser.id, bookId);
      console.log('Loan created successfully');
      
      setBorrowSuccess(prev => ({ ...prev, [bookId]: 'Borrow request submitted successfully. Waiting for admin approval.' }));
      
      // Clear success message after 2 seconds
      setTimeout(() => {
        setBorrowSuccess(prev => ({ ...prev, [bookId]: null }));
      }, 2000);
    } catch (err) {
      console.error('Error borrowing book:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setBorrowError(prev => ({ 
        ...prev, 
        [bookId]: err.response?.data || 'Failed to borrow book. Please try again.' 
      }));

      // Clear error message after 3 seconds
      setTimeout(() => {
        setBorrowError(prev => ({ ...prev, [bookId]: null }));
      }, 3000);
    } finally {
      setBorrowLoading(prev => ({ ...prev, [bookId]: false }));
    }
  };

  const handleReturn = async (borrowRecordId) => {
    try {
      setReturnLoading(prev => ({ ...prev, [borrowRecordId]: true }));
      setReturnError(prev => ({ ...prev, [borrowRecordId]: null }));
      setReturnSuccess(prev => ({ ...prev, [borrowRecordId]: null }));

      await loanService.requestReturn(borrowRecordId);
      setReturnSuccess(prev => ({ ...prev, [borrowRecordId]: 'Return request submitted successfully. Waiting for admin approval.' }));
      
      // Refresh active borrows
      await fetchActiveBorrows();
      
      // Clear success message after 2 seconds
      setTimeout(() => {
        setReturnSuccess(prev => ({ ...prev, [borrowRecordId]: null }));
      }, 2000);
    } catch (err) {
      console.error('Error returning book:', err);
      setReturnError(prev => ({ 
        ...prev, 
        [borrowRecordId]: err.response?.data || 'Failed to return book. Please try again.' 
      }));

      // Clear error message after 3 seconds
      setTimeout(() => {
        setReturnError(prev => ({ ...prev, [borrowRecordId]: null }));
      }, 3000);
    } finally {
      setReturnLoading(prev => ({ ...prev, [borrowRecordId]: false }));
    }
  };

  const handleReserve = async (bookId) => {
    try {
      setReserveLoading(prev => ({ ...prev, [bookId]: true }));
      setReserveError(prev => ({ ...prev, [bookId]: null }));
      setReserveSuccess(prev => ({ ...prev, [bookId]: null }));

      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        setReserveError(prev => ({ ...prev, [bookId]: 'Please login to reserve books' }));
        return;
      }

      // Check if user already has active reservations for this book
      const userReservations = await reserveService.getReservesByUser(currentUser.id);
      const existingReservation = userReservations.find(
        r => r.bookId === bookId && r.status === 'PENDING'
      );
      
      if (existingReservation) {
        setReserveError(prev => ({ 
          ...prev, 
          [bookId]: 'You already have an active reservation for this book' 
        }));
        
        // Clear error message after 3 seconds
        setTimeout(() => {
          setReserveError(prev => ({ ...prev, [bookId]: null }));
        }, 3000);
        return;
      }

      // Call the reserveService to create a reservation
      await reserveService.createReserve(currentUser.id, bookId);
      setReserveSuccess(prev => ({ 
        ...prev, 
        [bookId]: 'Book reserved successfully. You will be notified when it becomes available.' 
      }));
      
      // Clear success message after 2 seconds and navigate to reservations
      setTimeout(() => {
        setReserveSuccess(prev => ({ ...prev, [bookId]: null }));
        
        // Ask user if they want to view their reservations
        if (window.confirm('Reservation successful! Would you like to view your reservations?')) {
          navigate('/my-reservations');
        }
      }, 2000);
      
    } catch (err) {
      console.error('Error reserving book:', err);
      setReserveError(prev => ({ 
        ...prev, 
        [bookId]: err.response?.data || err.message || 'Failed to reserve book. Please try again.' 
      }));

      // Clear error message after 3 seconds
      setTimeout(() => {
        setReserveError(prev => ({ ...prev, [bookId]: null }));
      }, 3000);
    } finally {
      setReserveLoading(prev => ({ ...prev, [bookId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
        <button onClick={fetchBooks} className="mt-2 text-blue-600 hover:text-blue-800">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Library Books</h2>
        {(authService.hasRole(ROLES.ADMIN) || authService.hasRole(ROLES.LIBRARIAN)) && (
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            onClick={() => navigate('/books/add')}
          >
            <PlusIcon className="h-5 w-5" />
            Add New Book
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search books by title, author, or category..."
            className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
            } focus:ring-blue-500 transition-colors`}
            value={searchQuery}
            onChange={handleSearch}
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {/* Borrow History Section */}
      {/* <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Your Borrow History</h3>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>
        
        {showHistory && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
            {userBorrowHistory.length === 0 ? (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center py-4`}>No borrow history found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Book</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Borrow Date</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Due Date</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Fine</th>
                    </tr>
                  </thead>
                  <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {userBorrowHistory.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{record.book.title}</div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{record.book.author}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status === 'BORROWED' ? 
                              isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800' :
                            record.status === 'RETURNED' ? 
                              isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800' :
                            record.status === 'PENDING' ? 
                              isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800' :
                              isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDate(record.issueDate)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDate(record.dueDate)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {record.fineAmount ? `$${record.fineAmount.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div> */}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
        {books.map((book) => {
          const activeBorrow = activeBorrows.find(borrow => borrow.book.id === book.id);
          
          return (
            <div 
              key={book.id} 
              className={`${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } rounded-lg overflow-hidden cursor-pointer transform transition duration-200 hover:scale-[1.02] flex flex-col shadow-sm`}
              onClick={() => handleViewDetails(book)}
            >
              {/* Book Cover Image */}
              <div className="relative aspect-[2/3] overflow-hidden mx-auto w-full p-2">
                <div className="w-full h-full relative mx-auto">
                  <ImagePreview
                  src={book.coverUrl || DEFAULT_COVERS[book.category] || DEFAULT_COVERS.default}
                  alt={`${book.title} cover`}
                    fallbackSrc={DEFAULT_COVERS[book.category] || DEFAULT_COVERS.default}
                    withShadow={true}
                    withMultiLayer={true}
                    aspectRatio="2/3"
                    containerClassName="w-full h-full rounded-lg overflow-hidden"
                  onError={(e) => handleImageError(e, book.category)}
                />
                  
                  {/* Admin edit button */}
                {authService.hasRole('ROLE_ADMIN') && (
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(book);
                      }}
                      className={`absolute top-1 right-1 p-1 ${
                        isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
                      } rounded-full hover:bg-opacity-100 transition-colors shadow-sm z-10`}
                    >
                      <PencilIcon className="h-4 w-4 text-blue-600" />
                  </button>
                )}
                </div>
              </div>

              {/* Book Info Section */}
              <div className={`p-3 flex-1 flex flex-col`}>
                <h3 className={`text-sm font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                } mb-0.5 line-clamp-2`}>{book.title}</h3>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                } mb-0.5 line-clamp-1`}>{book.author}</p>
                
                {/* Book Rating */}
                <div className="flex items-center mb-1">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <span className={`ml-1 text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>4.0</span>
                  </div>
                  
                  <span className={`mx-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>•</span>
                  
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                    Book {book.id}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mt-auto">
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    book.available
                      ? isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                      : isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                  }`}>
                    {book.available ? 'Available' : 'Not Available'}
                  </span>
                  <span className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {book.quantity} copies
                  </span>
                </div>
                
                {/* Error and Success Messages */}
                {(borrowError[book.id] || borrowSuccess[book.id] || 
                  returnError[activeBorrow?.id] || returnSuccess[activeBorrow?.id] ||
                  reserveError[book.id] || reserveSuccess[book.id]) && (
                  <div className={`my-1 p-1.5 rounded-md text-xs ${
                    (borrowError[book.id] || returnError[activeBorrow?.id] || reserveError[book.id])
                      ? isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-50 text-red-700'
                      : isDarkMode ? 'bg-green-900/50 text-green-200' : 'bg-green-50 text-green-700'
                  }`}>
                    {borrowError[book.id] || borrowSuccess[book.id] || 
                     returnError[activeBorrow?.id] || returnSuccess[activeBorrow?.id] ||
                     reserveError[book.id] || reserveSuccess[book.id]}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-2 flex gap-1.5">
                  {activeBorrow ? (
                    <button 
                      className={`flex-1 px-2 py-1.5 rounded-md transition-colors text-xs ${
                        !returnLoading[activeBorrow.id]
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-500'
                      }`}
                      disabled={returnLoading[activeBorrow.id]}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReturn(activeBorrow.id);
                      }}
                    >
                      {returnLoading[activeBorrow.id] ? 'Processing...' : 'Return Book'}
                    </button>
                  ) : book.available && book.quantity > 0 ? (
                    <button 
                      className={`flex-1 px-2 py-1.5 rounded-md transition-colors text-xs ${
                        !borrowLoading[book.id]
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-500'
                      }`}
                      disabled={borrowLoading[book.id]}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBorrow(book.id);
                      }}
                    >
                      {borrowLoading[book.id] ? 'Processing...' : 'Borrow'}
                    </button>
                  ) : (
                    <button 
                      className={`flex-1 px-2 py-1.5 rounded-md transition-colors text-xs ${
                        !reserveLoading[book.id]
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-500'
                      }`}
                      disabled={reserveLoading[book.id]}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReserve(book.id);
                      }}
                    >
                      {reserveLoading[book.id] ? 'Processing...' : 'Reserve'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {books.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No books found
          </p>
        </div>
      )}

      <EditBookModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBook(null);
        }}
        onSubmit={handleEditBook}
        book={selectedBook}
      />

      <BookDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedBook(null);
        }}
        book={selectedBook}
      />
    </div>
  );
}

export default Books; 
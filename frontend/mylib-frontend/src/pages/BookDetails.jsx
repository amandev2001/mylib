import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { loanService } from '../services/loanService';
import { authService } from '../services/authService';
import { reserveService } from '../services/reserveService';
import { formatDate } from '../utils/dateExtensions';
import { useDarkMode } from '../context/DarkModeContext';
import ImagePreview from '../components/common/ImagePreview';
import { 
  ArrowLeftIcon,
  BookOpenIcon,
  UserGroupIcon,
  CalendarIcon,
  TagIcon,
  ClockIcon,
  IdentificationIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

// Default book cover images for different categories
const DEFAULT_COVERS = {
  Fiction: '/book-covers/fiction-default.jpg.webp',
  'Non-Fiction': '/book-covers/non-fiction-default.jpg.webp',
  'Science Fiction': '/book-covers/sci-fi-default.jpg.webp',
  Mystery: '/book-covers/mystery-default.jpg.webp',
  Romance: '/book-covers/romance-default.jpg.webp',
  default: '/book-covers/default.jpg.webp'
};

function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [borrowError, setBorrowError] = useState(null);
  const [borrowSuccess, setBorrowSuccess] = useState(null);
  const [activeBorrow, setActiveBorrow] = useState(null);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveError, setReserveError] = useState(null);
  const [reserveSuccess, setReserveSuccess] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchBookDetails();
    fetchBorrowHistory();
    checkActiveBorrow();
    checkUserRole();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const data = await bookService.getBookById(id);
      setBook(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch book details. Please try again later.');
      console.error('Error fetching book details:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkUserRole = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser && currentUser.roles) {
        // Check if roles is an array and handle appropriately
        if (Array.isArray(currentUser.roles)) {
          const hasAdminRole = currentUser.roles.includes('ROLE_ADMIN');
          setIsAdmin(hasAdminRole);
          setUserRole(hasAdminRole ? 'ADMIN' : 'USER');
        } else {
          // If it's not an array (e.g., a string), handle that case
          const hasAdminRole = currentUser.roles === 'ROLE_ADMIN';
          setIsAdmin(hasAdminRole);
          setUserRole(hasAdminRole ? 'ADMIN' : 'USER');
        }
      }
    } catch (err) {
      console.error('Error checking user role:', err);
    }
  };
  
  const fetchBorrowHistory = async () => {
    try {
      setHistoryLoading(true);
      // console.log("Fetching current user...");
      const currentUser = await authService.getCurrentUser();
      console.log("Current user:", currentUser);
  
      let history;
  
      if (currentUser && currentUser.roles) {
        // console.log("Checking roles...");
        const hasAdminRole = Array.isArray(currentUser.roles)
          ? currentUser.roles.includes('ROLE_ADMIN')
          : currentUser.roles === 'ROLE_ADMIN';
  
        // console.log("Has admin role:", hasAdminRole);
  
        if (hasAdminRole) {
          // console.log("Fetching admin history...");
          history = await loanService.getBookBorrowHistory(id);
          // console.log("Admin history:", history);
  
        } else {
          // console.log("Fetching user loan history...");
          history = await loanService.getUserLoans(currentUser.id);
          history = history.filter(record => record.bookId === parseInt(id));
        }
  
        setBorrowHistory(history);
      } else {
        console.warn("User or roles are missing.");
      }
  
    } catch (err) {
      console.error('❌ Error fetching borrow history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };
  

  const checkActiveBorrow = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser && currentUser.id) {
        const activeBorrows = await loanService.getActiveBorrows(currentUser.id);
        const active = activeBorrows.find(borrow => borrow.bookId === parseInt(id));
        setActiveBorrow(active);
      }
    } catch (err) {
      console.error('Error checking active borrow:', err);
    }
  };

  const handleBorrow = async () => {
    try {
      setBorrowLoading(true);
      setBorrowError(null);
      setBorrowSuccess(null);

      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        setBorrowError('Please login to borrow books');
        return;
      }

      await loanService.createLoan(currentUser.id, id);
      setBorrowSuccess('Borrow request submitted successfully. Waiting for admin approval.');
      fetchBookDetails();
      checkActiveBorrow();
    } catch (err) {
      setBorrowError(err.response?.data || 'Failed to borrow book. Please try again.');
    } finally {
      setBorrowLoading(false);
    }
  };

  const handleReturn = async () => {
    try {
      setBorrowLoading(true);
      setBorrowError(null);
      setBorrowSuccess(null);

      if (!activeBorrow) {
        setBorrowError('No active borrow found for this book');
        return;
      }

      await loanService.requestReturn(activeBorrow.id);
      setBorrowSuccess('Return request submitted successfully. Waiting for admin approval.');
      
      // Refresh the book details and active borrow status
      await Promise.all([
        fetchBookDetails(),
        checkActiveBorrow(),
        fetchBorrowHistory()
      ]);

      // Reset the active borrow since the return request was successful
      setActiveBorrow(null);
    } catch (err) {
      console.error('Error returning book:', err);
      setBorrowError(err.response?.data?.message || 'Failed to return book. Please try again.');
    } finally {
      setBorrowLoading(false);
    }
  };

  const handleReserve = async () => {
    try {
      setReserveLoading(true);
      setReserveError(null);
      setReserveSuccess(null);

      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        setReserveError('Please login to reserve books');
        return;
      }

      // Check if user already has active reservations for this book
      const userReservations = await reserveService.getReservesByUser(currentUser.id);
      const existingReservation = userReservations.find(
        r => r.bookId === parseInt(id) && r.status === 'PENDING'
      );
      
      if (existingReservation) {
        setReserveError('You already have an active reservation for this book');
        return;
      }

      // Call the reserveService to create a reservation
      await reserveService.createReserve(currentUser.id, id);
      setReserveSuccess('Book reserved successfully. Check My Reservations to view status.');

      // Refresh book details to update availability status
      await fetchBookDetails();

    } catch (err) {
      console.error('Error reserving book:', err);
      setReserveError(err.response?.data || err.message || 'Failed to reserve book. Please try again.');
    } finally {
      setReserveLoading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_COVERS[book?.category] || DEFAULT_COVERS.default;
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className={`${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error || 'Book not found'}</p>
            <button 
              onClick={() => navigate('/books')} 
              className={`mt-4 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
            >
              Back to Books
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Top Navigation Bar */}
      <div className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/books')}
              className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} flex items-center`}
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Books
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Main Content Section */}
        <div className="max-w-6xl mx-auto">
          {/* Google Play Books style layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side - Book Cover Section */}
            <div className="lg:w-1/3">
              {/* Main Book Cover Display */}
              <div className="sticky top-24 mb-6">
                <div className="w-64 mx-auto">
                  <div className="relative">
                    <ImagePreview
                      src={book.coverUrl || DEFAULT_COVERS[book.category] || DEFAULT_COVERS.default}
                      alt={`${book.title} cover`}
                      fallbackSrc={DEFAULT_COVERS[book.category] || DEFAULT_COVERS.default}
                      aspectRatio="2/3"
                      withShadow={true}
                      withMultiLayer={true}
                      containerClassName="rounded-lg overflow-hidden"
                      onError={handleImageError}
                    />
                  </div>
                  
                  {/* Book price/free section - similar to Google Play */}
                  <div className="mt-5">
                    {book.quantity > 0 ? (
                      <button 
                        className={`w-full ${
                          book.available && !borrowLoading
                            ? activeBorrow
                              ? isDarkMode 
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                              : isDarkMode 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            : isDarkMode 
                              ? 'bg-gray-700 text-gray-400' 
                              : 'bg-gray-300 text-gray-500'
                        } py-3 px-4 rounded-lg font-medium text-center transition-colors`}
                        disabled={!book.available || borrowLoading}
                        onClick={activeBorrow ? handleReturn : handleBorrow}
                      >
                        {borrowLoading 
                          ? 'Processing...' 
                          : activeBorrow
                            ? 'Return Book'
                            : book.available 
                              ? 'Borrow Now' 
                              : 'Not Available'
                        }
                      </button>
                    ) : (
                      <button 
                        className={`w-full ${
                          !reserveLoading
                            ? isDarkMode 
                              ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                              : 'bg-amber-600 hover:bg-amber-700 text-white'
                            : isDarkMode 
                              ? 'bg-gray-700 text-gray-400' 
                              : 'bg-gray-300 text-gray-500'
                        } py-3 px-4 rounded-lg font-medium text-center transition-colors`}
                        disabled={reserveLoading}
                        onClick={handleReserve}
                      >
                        {reserveLoading ? 'Processing...' : 'Reserve Book'}
                      </button>
                    )}
                    
                    {/* Error and Success Messages for Reserve */}
                    {(reserveError || reserveSuccess) && (
                      <div className={`mt-3 p-4 rounded-md ${
                        reserveError
                          ? isDarkMode 
                            ? 'bg-red-900/50 text-red-200' 
                            : 'bg-red-50 text-red-700'
                          : isDarkMode 
                            ? 'bg-green-900/50 text-green-200' 
                            : 'bg-green-50 text-green-700'
                      }`}>
                        {reserveError || reserveSuccess}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Book Info Section */}
            <div className="lg:w-2/3">
              {/* Book Header */}
              <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-2">{book.title}</h1>
                <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>{book.author}</p>
                
                {/* Book metadata */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{book.category}</span>
                  <span className={`hidden sm:inline ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>•</span>
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{book.quantity} copies</span>
                  <span className={`hidden sm:inline ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>•</span>
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{book.publicationDate || 'Unknown date'}</span>
                </div>
                
                {/* Book status */}
                <div className="mb-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    book.available 
                      ? isDarkMode 
                        ? 'bg-green-900 text-green-200' 
                        : 'bg-green-100 text-green-800'
                      : isDarkMode 
                        ? 'bg-red-900 text-red-200' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {book.available ? 'Available' : 'Not Available'}
                  </span>
                </div>
                
                {/* Error and Success Messages */}
                {(borrowError || borrowSuccess) && (
                  <div className={`p-4 rounded-md mb-6 ${
                    borrowError
                      ? isDarkMode 
                        ? 'bg-red-900/50 text-red-200' 
                        : 'bg-red-50 text-red-700'
                      : isDarkMode 
                        ? 'bg-green-900/50 text-green-200' 
                        : 'bg-green-50 text-green-700'
                  }`}>
                    {borrowError || borrowSuccess}
                  </div>
                )}
              </div>
              
              {/* Book Details Grid */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 mb-6 rounded-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-sm`}>
                {/* ISBN */}
                <div className="flex items-start gap-2">
                  <IdentificationIcon className={`h-5 w-5 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>ISBN</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{book.isbn || 'Not available'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <TagIcon className={`h-5 w-5 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Category</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{book.category}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <BookOpenIcon className={`h-5 w-5 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Publisher</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{book.publisher}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CalendarIcon className={`h-5 w-5 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Publication Date</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{book.publicationDate || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <ClockIcon className={`h-5 w-5 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Edition</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{book.edition || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPinIcon className={`h-5 w-5 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Shelf Location</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{book.location || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              
              {/* Description Section */}
              <div className={`p-6 mb-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>About this book</h2>
                <div className={`prose max-w-none ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <p>{book.description || 'No description available for this book.'}</p>
                </div>
              </div>
              
              {/* Borrow History Section */}
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {isAdmin ? 'All Borrow History' : 'My Borrow History'}
                </h2>
                
                {historyLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : borrowHistory.length === 0 ? (
                  <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {isAdmin ? 'No borrow history found for this book' : 'You have not borrowed this book yet'}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      <thead className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                        <tr>
                          {isAdmin && (
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>User Id</th>
                          )}
                          <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Borrow Date</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Due Date</th>
                        </tr>
                      </thead>
                      <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {borrowHistory.map((record) => (
                          <tr key={record.id}>
                            {isAdmin && (
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                {record.userId}
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetails;
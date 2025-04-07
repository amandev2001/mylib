import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  PencilIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  ArrowPathIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import { bookService } from '../../services/bookService';
import { loanService } from '../../services/loanService';
import { reserveService } from '../../services/reserveService';
import { useDarkMode } from '../../context/DarkModeContext';
import EditBookModal from '../EditBookModal';
import { formatDateForInput } from '../../utils/dateExtensions';

export default function ManageBooks() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    reservedBooks: 0,
    totalCategories: 0
  });
  const [selectedBook, setSelectedBook] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (books.length > 0) {
      fetchStats();
    }
  }, [books]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getAllBooks();
      setBooks(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to fetch books. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get all loans and reservations for admin view
      const [allLoans, activeReservations] = await Promise.all([
        loanService.getAllLoans().catch(() => []),
        reserveService.getAllReservations().catch(() => [])
      ]);

      // Filter active loans (not returned)
      const activeLoans = allLoans.filter(loan => !loan.returnDate && loan.status === "PENDING");

      const categories = new Set(books.map(book => book.category));

      setStats({
        totalBooks: books.length,
        availableBooks: books.filter(book => book.available).length,
        borrowedBooks: activeLoans.length,
        reservedBooks: activeReservations.length,
        totalCategories: categories.size
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Set default values if API calls fail
      setStats({
        totalBooks: books.length,
        availableBooks: books.filter(book => book.available).length,
        borrowedBooks: 0,
        reservedBooks: 0,
        totalCategories: new Set(books.map(book => book.category)).size
      });
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

  const handleEdit = (book) => {
    setSelectedBook(book);
    setIsEditModalOpen(true);
  };

  const handleUpdateBook = async (bookId, formData) => {
    await bookService.updateBook(bookId, formData);
    await fetchBooks(); // Refresh the books list
    setIsEditModalOpen(false);
    setSelectedBook(null);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedBooks = [...books].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    if (sortConfig.key === 'title') {
      return sortConfig.direction === 'asc' 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    
    if (sortConfig.key === 'quantity') {
      return sortConfig.direction === 'asc'
        ? a.quantity - b.quantity
        : b.quantity - a.quantity;
    }
    
    if (sortConfig.key === 'category') {
      return sortConfig.direction === 'asc'
        ? a.category.localeCompare(b.category)
        : b.category.localeCompare(a.category);
    }
    
    return 0;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchBooks}
          className="mt-4 text-blue-500 hover:text-blue-600 flex items-center justify-center mx-auto"
        >
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Manage Books
        </h2>
        <button
          onClick={() => navigate('/books/add')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Book
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Books</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalBooks}</p>
            </div>
            <BookOpenIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Available</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.availableBooks}</p>
            </div>
            <ArrowUpIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Borrowed</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.borrowedBooks}</p>
            </div>
            <ArrowDownIcon className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Reserved</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.reservedBooks}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Categories</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalCategories}</p>
            </div>
            <FolderIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search books..."
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

      {/* Books Table */}
      <div className={`rounded-lg shadow overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-1"
                >
                  Title
                  {sortConfig.key === 'title' && (
                    sortConfig.direction === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center gap-1"
                >
                  Category
                  {sortConfig.key === 'category' && (
                    sortConfig.direction === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <button
                  onClick={() => handleSort('quantity')}
                  className="flex items-center gap-1"
                >
                  Quantity
                  {sortConfig.key === 'quantity' && (
                    sortConfig.direction === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {sortedBooks.map((book) => (
              <tr key={book.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{book.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{book.author}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{book.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{book.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    book.available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {book.available ? 'Available' : 'Not Available'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(book)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {books.length === 0 && (
        <div className="text-center py-12">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No books found
          </p>
        </div>
      )}

      {/* Edit Book Modal */}
      {selectedBook && (
        <EditBookModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedBook(null);
          }}
          onSubmit={handleUpdateBook}
          book={selectedBook}
        >
          <input
            type="date"
            value={formatDateForInput(selectedBook.publicationDate)}
            onChange={(e) => handleBookChange('publicationDate', e.target.value)}
          />
        </EditBookModal>
      )}
    </div>
  );
}
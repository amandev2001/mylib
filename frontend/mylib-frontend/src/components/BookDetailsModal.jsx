import { Fragment, useState, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  BookOpenIcon, 
  HeartIcon, 
  ShareIcon, 
  BookmarkIcon,
  CalendarIcon,
  LanguageIcon,
  BuildingOfficeIcon,
  TagIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { loanService } from '../services/loanService';
import { authService } from '../services/authService';
import { reserveService } from '../services/reserveService';
import { formatDate } from '../utils/dateExtensions';
import ImagePreview from './common/ImagePreview';

// Default book cover images for different categories
const DEFAULT_COVERS = {
  Fiction: '/book-covers/fiction-default.jpg.webp',
  'Non-Fiction': '/book-covers/non-fiction-default.jpg.webp',
  'Science Fiction': '/book-covers/sci-fi-default.jpg.webp',
  Mystery: '/book-covers/mystery-default.jpg.webp',
  Romance: '/book-covers/romance-default.jpg.webp',
  default: '/book-covers/default.jpg.webp'
};

export default function BookDetailsModal({ isOpen, onClose, book, borrowHistory = [], isLoadingHistory = false }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Memoize the borrow history table to prevent unnecessary re-renders
  const BorrowHistoryTable = useMemo(() => {
    if (!borrowHistory || borrowHistory.length === 0) {
      return <p className="text-gray-500 text-center py-4">No borrow history found</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrow Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {borrowHistory.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.userName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    record.status === 'BORROWED' ? 'bg-green-100 text-green-800' :
                    record.status === 'RETURNED' ? 'bg-gray-100 text-gray-800' :
                    record.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(record.issueDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(record.dueDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [borrowHistory]);

  if (!book) return null;

  const handleBorrow = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        setError('Please login to borrow books');
        return;
      }

      if (!currentUser.id) {
        setError('Unable to get user information. Please try logging in again.');
        return;
      }

      await loanService.createLoan(currentUser.id, book.id);
      setSuccess('Borrow request submitted successfully. Waiting for admin approval.');
      
      // Close modal after successful request
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error borrowing book:', err);
      setError(err.response?.data || 'Failed to borrow book. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReserve = async () => {
    try {
      setIsReserving(true);
      setError(null);
      setSuccess(null);

      const currentUser = await authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        setError('Unable to get user information. Please try logging in again.');
        return;
      }

      await reserveService.createReserve(currentUser.id, book.id);
      setSuccess('Book reserved successfully. You will be notified when it becomes available.');
      
      // Close modal after successful reservation
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error reserving book:', err);
      setError(err.message || 'Failed to reserve book. Please try again.');
    } finally {
      setIsReserving(false);
    }
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Sharing book:', book.id);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // Implement wishlist functionality
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Implement bookmark functionality
  };

  // Image error handling
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = DEFAULT_COVERS[book.category] || DEFAULT_COVERS.default;
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                {/* Header with Close and Share buttons */}
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:flex sm:items-center sm:gap-2">
                  <button
                    onClick={handleShare}
                    className="rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <span className="sr-only">Share</span>
                    <ShareIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Book Cover Section */}
                      <div className="w-full md:w-1/3">
                        <div className="relative bg-gray-200 rounded-lg overflow-hidden">
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
                          {/* Quick Action Buttons */}
                          <div className="absolute top-2 right-2 flex gap-2">
                            <button
                              onClick={toggleWishlist}
                              className={`p-2 rounded-full bg-white/90 hover:bg-white transition-colors ${
                                isWishlisted ? 'text-red-500' : 'text-gray-600'
                              }`}
                            >
                              <HeartIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={toggleBookmark}
                              className={`p-2 rounded-full bg-white/90 hover:bg-white transition-colors ${
                                isBookmarked ? 'text-blue-500' : 'text-gray-600'
                              }`}
                            >
                              <BookmarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Book Details Section */}
                      <div className="w-full md:w-2/3">
                        <Dialog.Title as="h3" className="text-3xl font-bold text-gray-900 mb-2">
                          {book.title}
                        </Dialog.Title>

                        <p className="text-xl text-gray-600 mb-6">{book.author}</p>

                        {/* Status Badge */}
                        <div className="mb-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            book.available 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {book.available ? 'Available' : 'Not Available'}
                          </span>
                        </div>

                        {/* Book Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                          <div className="flex items-center gap-2">
                            <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Publisher</p>
                              <p className="font-medium">{book.publisher}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <TagIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Category</p>
                              <p className="font-medium">{book.category}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <LanguageIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Language</p>
                              <p className="font-medium">{book.language || 'Not specified'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Edition</p>
                              <p className="font-medium">{book.edition || 'Not specified'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Additional Information */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                          <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Publication Date</p>
                              <p className="font-medium">{book.publicationDate || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Quantity</p>
                              <p className="font-medium">{book.quantity} copies</p>
                            </div>
                          </div>
                        </div>

                        {/* Borrow History Section */}
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Borrow History</h3>
                          {isLoadingHistory ? (
                            <div className="flex justify-center items-center py-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                          ) : (
                            BorrowHistoryTable
                          )}
                        </div>

                        {/* Add error and success messages */}
                        {(error || success) && (
                          <div className={`mb-4 p-4 rounded-md ${
                            error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                          }`}>
                            {error || success}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            type="button"
                            onClick={handleBorrow}
                            disabled={!book.available || isLoading}
                            className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm ${
                              book.available && !isLoading
                                ? 'bg-blue-600 hover:bg-blue-500'
                                : 'bg-gray-300 cursor-not-allowed'
                            }`}
                          >
                            {isLoading ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </span>
                            ) : book.available ? (
                              'Borrow Now'
                            ) : (
                              'Not Available'
                            )}
                          </button>
                          {(!book.available || book.quantity <= 0) && (
                            <button
                              type="button"
                              onClick={handleReserve}
                              disabled={isReserving}
                              className={`flex-1 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-blue-600 shadow-sm ring-1 ring-inset ring-blue-600 hover:bg-blue-50 ${
                                isReserving ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {isReserving ? (
                                <span className="flex items-center justify-center">
                                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Reserving...
                                </span>
                              ) : (
                                'Reserve'
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 
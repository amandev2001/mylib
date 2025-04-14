import { useState, useEffect } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import ImagePreview from './common/ImagePreview';
import { useDarkMode } from '../context/DarkModeContext';
import { formatDateForInput } from '../utils/dateExtensions';  // Add this import

export default function BookForm({ 
  initialData = {}, 
  onSubmit, 
  submitButtonText = 'Save',
  isEditMode = false 
}) {
  const { isDarkMode } = useDarkMode();
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    category: '',
    available: true,
    publisher: '',
    edition: '',
    language: '',
    publicationDate: '',
    quantity: 1,
    isbn: '',
    coverUrl: ''
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoadingCover, setIsLoadingCover] = useState(false);

  // Pre-fill form data for edit mode
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Use the utility function for date formatting
      const formattedPublicationDate = formatDateForInput(initialData.publicationDate);

      setBookData({
        title: initialData.title || '',
        author: initialData.author || '',
        category: initialData.category || '',
        available: initialData.available ?? true,
        publisher: initialData.publisher || '',
        edition: initialData.edition || new Date().getFullYear(),
        language: initialData.language || '',
        publicationDate: formattedPublicationDate,
        quantity: initialData.quantity || 1,
        isbn: initialData.isbn || '',
        coverUrl: initialData.coverUrl || ''
      });
      setImagePreview(initialData.coverUrl || null);
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!bookData.title?.toString().trim()) newErrors.title = 'Title is required';
    if (!bookData.author?.toString().trim()) newErrors.author = 'Author is required';
    if (!bookData.publisher?.toString().trim()) newErrors.publisher = 'Publisher is required';
    if (!bookData.category?.toString().trim()) newErrors.category = 'Category is required';
    
    // Validate quantity
    if (isNaN(bookData.quantity) || parseInt(bookData.quantity) < 1) {
      newErrors.quantity = 'Must be at least 1';
    }

    // Validate publication date
    if (!bookData.publicationDate) {
      newErrors.publicationDate = 'Publication date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchBookCover = async (isbn) => {
    if (!isbn) {
      // Clear image and coverUrl when ISBN is empty
      setImagePreview(null);
      if (!isEditMode) {
        setBookData(prev => ({
          ...prev,
          coverUrl: '',
          title: '',
          author: '',
          publisher: '',
          publicationDate: '',
          category: '',
          description: ''
        }));
      }
      return;
    }
    
    setIsLoadingCover(true);
    try {
      // Clean the ISBN by removing hyphens and spaces
      const cleanIsbn = isbn.replace(/[-\s]/g, '');
      
      // Use Open Library API
      const openLibraryResponse = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
      
      const bookKey = `ISBN:${cleanIsbn}`;
      const openLibraryData = openLibraryResponse.data[bookKey];
      
      if (openLibraryData) {
        let coverUrl = '';
        if (openLibraryData.cover) {
          // Try to get the highest quality image available
          coverUrl = openLibraryData.cover.large || 
                    openLibraryData.cover.medium || 
                    openLibraryData.cover.small;
          
          // Ensure HTTPS
          if (coverUrl) {
            coverUrl = coverUrl.replace('http://', 'https://');
          }
        }

        // Extract and format book data from Open Library response
        const authors = openLibraryData.authors || [];
        const authorNames = authors.map(author => 
          typeof author === 'object' ? author.name : author
        ).join(', ');

        // Extract publication date using utility function
        let publicationDate = '';
        if (openLibraryData.publish_date) {
          const dateStr = Array.isArray(openLibraryData.publish_date) 
            ? openLibraryData.publish_date[0] 
            : openLibraryData.publish_date;
          
          if (dateStr.match(/^\d{4}$/)) {
            // If we only have a year, use January 1st of that year
            publicationDate = `${dateStr}-01-01`;
          } else {
            publicationDate = formatDateForInput(dateStr);
          }
        }

        // Extract publisher
        const publishers = openLibraryData.publishers || [];
        const publisher = Array.isArray(publishers) 
          ? publishers[0]?.name || publishers[0] || ''
          : publishers?.name || publishers || '';

        // Extract language
        let language = determineLanguage(openLibraryData);

        // Don't override existing data in edit mode
        if (!isEditMode) {
          setBookData(prev => ({
            ...prev,
            title: authorNames ? openLibraryData.title : prev.title,
            author: authorNames || prev.author,
            publisher: publisher || prev.publisher,
            publicationDate: publicationDate || prev.publicationDate,
            coverUrl: coverUrl || prev.coverUrl,
            language: language || prev.language,
            category: determineCategory(openLibraryData) || prev.category
          }));
        }

        if (coverUrl) {
          setImagePreview(coverUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching book data:', error);
    } finally {
      setIsLoadingCover(false);
    }
  };

  const determineLanguage = (openLibraryData) => {
    // Implementation to be added if needed
    // console.log('Determining language from:', openLibraryData);
    return '';
  };

  const determineCategory = (openLibraryData) => {
    // Implementation to be added if needed
    // console.log('Determining category from:', openLibraryData);
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'isbn' && !isEditMode && value.length >= 10) {
      // Only auto-fetch when ISBN is at least 10 characters
      fetchBookCover(value);
    }
    
    setBookData(prev => ({
      ...prev,
      [name]: name === 'available' ? e.target.checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, coverUrl: 'Please upload an image file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, coverUrl: 'Image size should be less than 5MB' }));
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setSelectedFile(file);
    setErrors(prev => ({ ...prev, coverUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setSubmitError('');
        
        // Create FormData to send both book data and file
        const formData = new FormData();
        
        // Prepare book data
        const bookDataToSend = {
          ...(isEditMode && initialData.id ? { id: initialData.id } : {}),
          title: bookData.title,
          author: bookData.author,
          category: bookData.category,
          available: bookData.available,
          publisher: bookData.publisher,
          language: bookData.language,
          quantity: parseInt(bookData.quantity),
          isbn: bookData.isbn,
          coverUrl: imagePreview || (isEditMode ? initialData.coverUrl : ''),
          edition: parseInt(bookData.edition),
          publicationDate: bookData.publicationDate 
        };

        // Append book data as JSON string
        formData.append('bookDTO', new Blob([JSON.stringify(bookDataToSend)], {
          type: 'application/json'
        }));

        // Append file if selected
        if (selectedFile) {
          formData.append('file', selectedFile);
        }

        // Log FormData contents
        // console.log('FormData contents:');
        // for (let pair of formData.entries()) {
        //   if (pair[0] === 'bookDTO') {
        //     console.log('bookDTO:', JSON.parse(await pair[1].text()));
        //   } else {
        //     console.log(pair[0], pair[1]);
        //   }
        // }

        await onSubmit(formData);
      } catch (error) {
        console.error(`Error ${isEditMode ? 'updating' : 'adding'} book:`, error);
        let errorMessage;
        
        // Handle specific error cases
        if (error.response?.status === 409) {
          // Conflict error - likely duplicate ISBN
          errorMessage = error.response.data || 'A book with this ISBN already exists.';
          setErrors(prev => ({
            ...prev,
            isbn: errorMessage
          }));
        } else {
          errorMessage = error.response?.data?.message || 
                       error.response?.data || 
                       `Failed to ${isEditMode ? 'update' : 'add'} book. Please try again later.`;
        }
        
        setSubmitError(errorMessage);
        throw error; // Re-throw to let parent components handle the error state
      }
    }
  };

  const categories = [
    'Fiction',
    'Non-Fiction',
    'Science Fiction',
    'Mystery',
    'Romance',
    'Thriller',
    'Horror',
    'Biography',
    'History',
    'Science',
    'Technology',
    'Business',
    'Self-Help',
    'Poetry',
    'Drama',
    'Children'
  ];

  const languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Chinese',
    'Japanese',
    'Korean',
    'Russian',
    'Arabic',
    'Other'
  ];

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Book Cover Image Upload */}
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Book Cover Image
          </label>
          <div className="mt-1 flex items-center space-x-4">
            <div className={`relative w-32 h-48 border-2 border-dashed ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg overflow-hidden`}>
              {imagePreview ? (
                <ImagePreview
                  src={imagePreview}
                  alt="Book cover preview"
                  aspectRatio="2/3"
                  withShadow={true}
                  className="w-full h-full"
                  containerClassName="h-full"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <PhotoIcon className={`h-12 w-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
              )}
              {isLoadingCover && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className={`block w-full text-sm ${isDarkMode ? 'text-gray-400 file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600' : 'text-gray-500 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'} 
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold`}
              />
              {errors.coverUrl && (
                <p className="mt-1 text-sm text-red-500">{errors.coverUrl}</p>
              )}
              <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Upload a cover image for the book (Max: 5MB). Recommended ratio is 2:3 (like book covers).
              </p>
            </div>
          </div>
        </div>

        {/* ISBN Field - shown in both add and edit modes */}
        <div>
          <label htmlFor="isbn" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            ISBN
          </label>
          <input
            type="text"
            name="isbn"
            id="isbn"
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-4 py-2.5 border-2 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            value={bookData.isbn}
            onChange={handleChange}
            placeholder="Enter ISBN to auto-fill"
          />
          {!isEditMode && (
            <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Enter ISBN-10 or ISBN-13 to auto-fill details
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-4 py-2.5 border-2
              ${errors.title 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'}`}
            value={bookData.title}
            onChange={handleChange}
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>

        {/* Author */}
        <div>
          <label htmlFor="author" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Author <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="author"
            id="author"
            required
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-4 py-2.5 border-2
              ${errors.author 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
            value={bookData.author}
            onChange={handleChange}
          />
          {errors.author && <p className="mt-1 text-sm text-red-500">{errors.author}</p>}
        </div>

        {/* Publisher */}
        <div>
          <label htmlFor="publisher" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Publisher <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="publisher"
            id="publisher"
            required
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-4 py-2.5 border-2
              ${errors.publisher 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
            value={bookData.publisher}
            onChange={handleChange}
          />
          {errors.publisher && <p className="mt-1 text-sm text-red-500">{errors.publisher}</p>}
        </div>

        {/* Publication Date */}
        <div>
          <label htmlFor="publicationDate" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Publication Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="publicationDate"
            id="publicationDate"
            required
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-4 py-2.5 border-2
              ${errors.publicationDate 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
            value={bookData.publicationDate}
            onChange={handleChange}
          />
          {errors.publicationDate && <p className="mt-1 text-sm text-red-500">{errors.publicationDate}</p>}
        </div>

        {/* Edition Year */}
        <div>
          <label htmlFor="edition" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Edition
          </label>
          <input
            type="text"
            name="edition"
            id="edition"
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-4 py-2.5 border-2
              ${errors.edition 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
            value={bookData.edition}
            onChange={handleChange}
            placeholder="Enter edition"
          />
          <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enter a 4-digit year (1800-present)</p>
          {errors.edition && <p className="mt-1 text-sm text-red-500">{errors.edition}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            id="category"
            required
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-4 py-2.5 border-2
              ${errors.category 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
            value={bookData.category}
            onChange={handleChange}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
        </div>

        {/* Language */}
        <div>
          <label htmlFor="language" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Language
          </label>
          <select
            name="language"
            id="language"
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-4 py-2.5 border-2
              ${isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
            value={bookData.language}
            onChange={handleChange}
          >
            <option value="">Select a language</option>
            {languages.map(language => (
              <option key={language} value={language}>{language}</option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="quantity" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="quantity"
            id="quantity"
            required
            min="1"
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-4 py-2.5 border-2
              ${errors.quantity 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
            value={bookData.quantity}
            onChange={handleChange}
          />
          {errors.quantity && <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>}
        </div>

        {/* Available */}
        <div>
          <label htmlFor="available" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Available
          </label>
          <div className="mt-2">
            <input
              type="checkbox"
              name="available"
              id="available"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={bookData.available}
              onChange={handleChange}
            />
            <label htmlFor="available" className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              Book is available for borrowing
            </label>
          </div>
        </div>
      </div>

      <div className="mt-5 sm:mt-6 flex justify-end gap-2">
        {submitError && (
          <div className={`text-sm ${isDarkMode ? 'text-red-400 bg-red-900/50' : 'text-red-600 bg-red-50'} p-3 rounded-md w-full`}>
            {submitError}
          </div>
        )}
        <button
          type="submit"
          className={`inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm ${
            isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          {submitButtonText}
        </button>
      </div>
    </form>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhotoIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import ImagePreview from '../components/common/ImagePreview';
import { bookService } from '../services/bookService';
import { useDarkMode } from '../context/DarkModeContext';

export default function AddBook() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    category: '',
    available: 'true',
    publisher: '',
    edition: '',
    language: '',
    publicationDate: '',
    quantity: 1,
    isbn: '',
    coverUrl: '',
    description: '',
    pageCount: '',
    price: '',
    location: ''
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoadingCover, setIsLoadingCover] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [languages, setLanguages] = useState([
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
  ]);

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validations
    const requiredFields = {
      title: 'Title is required',
      author: 'Author is required',
      publisher: 'Publisher is required',
      category: 'Category is required',
      publicationDate: 'Publication date is required'
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!bookData[field]?.toString().trim()) {
        newErrors[field] = message;
      }
    });
    
    // Edition year validation
    if (bookData.edition) {
      const year = parseInt(bookData.edition);
      const currentYear = new Date().getFullYear();
      const isValidYear = !isNaN(year) && 
                         year.toString().length === 4 && 
                         year >= 1800 && 
                         year <= currentYear;
                         
      if (!isValidYear) {
        newErrors.edition = `Must be a valid year between 1800 and ${currentYear}`;
      }
    }

    // Quantity validation
    const quantity = parseInt(bookData.quantity);
    if (isNaN(quantity) || quantity < 1) {
      newErrors.quantity = 'Must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchBookCover = async (isbn) => {
    if (!isbn) {
      setImagePreview(null);
      setBookData(prev => ({
        ...prev,
        coverUrl: '',
        title: '',
        author: '',
        publisher: '',
        publicationDate: '',
        category: '',
        description: '',
        pageCount: '',
        price: '',
        location: ''
      }));
      setAutoFilledFields(new Set());
      return;
    }
    
    setIsLoadingCover(true);
    try {
      const cleanIsbn = isbn.replace(/[-\s]/g, '');
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
          
          console.log('Selected cover URL from Open Library:', coverUrl);
        }

        // Extract and format book data from Open Library response
        const authors = openLibraryData.authors || [];
        const authorNames = authors.map(author => 
          typeof author === 'object' ? author.name : author
        ).join(', ');

        // Extract publication date
        let publicationDate = '';
        if (openLibraryData.publish_date) {
          // Handle different date formats
          const dateStr = Array.isArray(openLibraryData.publish_date) 
            ? openLibraryData.publish_date[0] 
            : openLibraryData.publish_date;
          
          // Try to parse the date
          const date = new Date(dateStr);
          if (!isNaN(date)) {
            // Format the date as yyyy-MM-dd
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            publicationDate = `${year}-${month}-${day}`;
          } else if (dateStr.match(/^\d{4}$/)) {
            // If we only have a year, use January 1st of that year
            publicationDate = `${dateStr}-01-01`;
          }
        }

        // Extract publisher
        const publishers = openLibraryData.publishers || [];
        const publisher = Array.isArray(publishers) 
          ? publishers[0]?.name || publishers[0] || ''
          : publishers?.name || publishers || '';

        // Extract language from subjects or classifications
        let language = '';
        
        // First try to find language in subjects
        if (openLibraryData.subjects) {
          const languageSubjects = openLibraryData.subjects
            .map(subject => typeof subject === 'object' ? subject.name : subject)
            .filter(subject => {
              const subjectLower = subject.toLowerCase();
              return subjectLower.includes('language') || 
                     subjectLower.includes('literature') ||
                     subjectLower.includes('english') ||
                     subjectLower.includes('spanish') ||
                     subjectLower.includes('french') ||
                     subjectLower.includes('german') ||
                     subjectLower.includes('chinese') ||
                     subjectLower.includes('japanese') ||
                     subjectLower.includes('korean') ||
                     subjectLower.includes('russian') ||
                     subjectLower.includes('arabic');
            });

          if (languageSubjects.length > 0) {
            // Try to match with our predefined languages
            const subjectLower = languageSubjects[0].toLowerCase();
            const matchedLanguage = languages.find(lang => 
              subjectLower.includes(lang.toLowerCase())
            );

            if (matchedLanguage) {
              language = matchedLanguage;
            } else {
              // If no match found, use the subject as a new language
              language = languageSubjects[0];
              addNewLanguage(language);
            }
          }
        }

        // If no language found in subjects, try LC classifications
        if (!language && openLibraryData.classifications?.lc_classifications) {
          const lcClass = openLibraryData.classifications.lc_classifications[0];
          if (lcClass) {
            // Map LC classification prefixes to languages
            const languageMap = {
              'P': 'English',
              'PC': 'Spanish',
              'PQ': 'French',
              'PT': 'German',
              'PL': 'Chinese',
              'PK': 'Japanese',
              'PK1': 'Korean',
              'PG': 'Russian',
              'PJ': 'Arabic'
            };
            
            for (const [prefix, lang] of Object.entries(languageMap)) {
              if (lcClass.startsWith(prefix)) {
                language = lang;
                addNewLanguage(lang);
                break;
              }
            }
          }
        }

        // If still no language found, try to infer from other data
        if (!language) {
          // Check if the book has English-specific identifiers
          if (openLibraryData.identifiers?.isbn_10 || openLibraryData.identifiers?.isbn_13) {
            // Most books with ISBN-10/13 are in English
            language = 'English';
          }
        }

        // If we found a language but it's not in our list, add it
        if (language && !languages.includes(language)) {
          addNewLanguage(language);
        }

        // Extract subjects for category matching
        const subjects = openLibraryData.subjects || [];
        const subjectNames = subjects.map(subject => 
          typeof subject === 'object' ? subject.name : subject
        );

        // Try to match category with our predefined categories
        let matchedCategory = '';
        if (subjectNames.length > 0) {
          // First try to find an exact match
          matchedCategory = categories.find(cat => 
            subjectNames.some(subject => 
              subject.toLowerCase() === cat.toLowerCase()
            )
          );

          // If no exact match, try partial matches
          if (!matchedCategory) {
            matchedCategory = categories.find(cat => 
              subjectNames.some(subject => {
                const subjectLower = subject.toLowerCase();
                const catLower = cat.toLowerCase();
                return subjectLower.includes(catLower) || catLower.includes(subjectLower);
              })
            );
          }

          // If still no match, try to map common subject terms to categories
          if (!matchedCategory) {
            const subjectMap = {
              'fantasy': 'Fiction',
              'fiction': 'Fiction',
              'non-fiction': 'Non-Fiction',
              'science fiction': 'Science Fiction',
              'mystery': 'Mystery',
              'romance': 'Romance',
              'thriller': 'Thriller',
              'horror': 'Horror',
              'biography': 'Biography',
              'history': 'History',
              'science': 'Science',
              'technology': 'Technology',
              'business': 'Business',
              'self-help': 'Self-Help',
              'poetry': 'Poetry',
              'drama': 'Drama',
              'children': 'Children',
              'computer': 'Technology',
              'programming': 'Technology',
              'software': 'Technology'
            };

            for (const [key, value] of Object.entries(subjectMap)) {
              if (subjectNames.some(subject => 
                subject.toLowerCase().includes(key)
              )) {
                matchedCategory = value;
                break;
              }
            }
          }

          // If still no match, use the first subject as fallback
          if (!matchedCategory) {
            matchedCategory = subjectNames[0];
          }
        }

        if (coverUrl) {
          // Extract additional book details
          const newAutoFilledFields = new Set();
          const updatedBookData = {
            title: openLibraryData.title || '',
            author: authorNames || '',
            publisher: publisher || '',
            publicationDate: publicationDate || '',
            category: matchedCategory || '',
            description: openLibraryData.description || '',
            pageCount: openLibraryData.number_of_pages || '',
            price: openLibraryData.price || '',
            location: openLibraryData.location || ''
          };

          // Track which fields were auto-filled
          Object.entries(updatedBookData).forEach(([key, value]) => {
            if (value && value !== '') {
              newAutoFilledFields.add(key);
            }
          });

          setBookData(prev => ({
            ...prev,
            coverUrl: coverUrl,
            ...updatedBookData
          }));
          setAutoFilledFields(newAutoFilledFields);
          
          // Test if the image URL is valid before setting it
          try {
            const img = new Image();
            img.onload = () => {
              setImagePreview(coverUrl);
              // Clear any previous errors
              setErrors(prev => ({
                ...prev,
                coverUrl: ''
              }));
            };
            img.onerror = () => {
              console.log('Image failed to load:', coverUrl);
              setErrors(prev => ({
                ...prev,
                coverUrl: 'Failed to load book cover image.'
              }));
            };
            img.src = coverUrl;
          } catch (error) {
            console.error('Error testing image URL:', error);
            setErrors(prev => ({
              ...prev,
              coverUrl: 'Invalid book cover image URL.'
            }));
          }
        } else {
          console.log('No cover image found in Open Library');
          setErrors(prev => ({
            ...prev,
            coverUrl: 'No cover image found for this ISBN.'
          }));
        }
      } else {
        console.log('No book data found in Open Library');
        setErrors(prev => ({
          ...prev,
          coverUrl: 'No book data found for this ISBN.'
        }));
      }
    } catch (error) {
      console.error('Error fetching book data:', error);
      if (error.response && error.response.status === 429) {
        setErrors(prev => ({
          ...prev,
          coverUrl: 'API rate limit exceeded. Please try again later.'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          coverUrl: 'Failed to fetch book data. Please try again.'
        }));
      }
    } finally {
      setIsLoadingCover(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'edition') {
      // Only allow 4-digit years
      const yearValue = value.slice(0, 4);
      if (!yearValue || (parseInt(yearValue) >= 1800 && parseInt(yearValue) <= new Date().getFullYear())) {
        setBookData(prev => ({
          ...prev,
          [name]: yearValue
        }));
      }
    } else if (name === 'isbn') {
      // Clear previous data when ISBN changes
      setBookData(prev => ({
        ...prev,
        [name]: value,
        title: '',
        author: '',
        publisher: '',
        publicationDate: '',
        category: '',
        description: '',
        pageCount: '',
        price: '',
        location: ''
      }));
      setImagePreview(null);
      setAutoFilledFields(new Set());
      
      // Fetch book cover when ISBN is entered
      if (value.length >= 10) {
        fetchBookCover(value);
      }
    } else {
      setBookData(prev => ({
        ...prev,
        [name]: name === 'available' ? e.target.checked : value
      }));
    }
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
        setIsSubmitting(true);
        
        // Create FormData to send both book data and file
        const formData = new FormData();
        
        // Create book data with ONLY the fields defined in BookDTO
        const bookDataToSend = {
          isbn: bookData.isbn,
          title: bookData.title,
          author: bookData.author,
          category: bookData.category,
          available: bookData.available,
          publisher: bookData.publisher,
          edition: bookData.edition ? parseInt(bookData.edition) : null,
          language: bookData.language,
          publicationDate: bookData.publicationDate,
          quantity: parseInt(bookData.quantity),
          coverUrl: bookData.coverUrl,
          pageCount: bookData.pageCount ? parseInt(bookData.pageCount) : null,
          price: bookData.price,
          location: bookData.location
        };
        
        // Append book data as JSON string
        formData.append('bookDTO', new Blob([JSON.stringify(bookDataToSend)], {
          type: 'application/json'
        }));

        // Append file if selected
        if (selectedFile) {
          formData.append('file', selectedFile);
        }

        // Send the request
        await bookService.createBook(formData);
        
        // Show success message
        setSubmitError('success:Book added successfully!');
        
        // Navigate after a delay
        setTimeout(() => {
          setSubmitError(''); // Clear the message
          // navigate('/books'); // Navigate after clearing the message
        }, 1500);
        
      } catch (error) {
        console.error('Error adding book:', error);
        setSubmitError(error.response?.data || 'Failed to add book. Please try again.');
      } finally {
        setIsSubmitting(false);
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

  // Function to add a new language if it doesn't exist
  const addNewLanguage = (newLanguage) => {
    if (newLanguage && !languages.includes(newLanguage)) {
      setLanguages(prev => [...prev, newLanguage]);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Add New Book
            </h1>
            <button
              onClick={() => navigate('/books')}
              className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Column - ISBN and Cover Image */}
              <div className="w-full md:w-1/3">
                <div className="space-y-4">
                  {/* ISBN Field */}
                  <div>
                    <label htmlFor="isbn" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      ISBN
                    </label>
                    <input
                      type="text"
                      name="isbn"
                      id="isbn"
                      className={`block w-full rounded-md shadow-sm text-sm px-3 py-2 border
                        ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                      value={bookData.isbn}
                      onChange={handleChange}
                      placeholder="Enter ISBN to fetch details"
                    />
                    {isLoadingCover && (
                      <p className="mt-1 text-xs text-blue-500">Fetching book details...</p>
                    )}
                  </div>

                  {/* Book Cover Image Upload - Modified to show actual image size */}
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Cover Image
                    </label>
                    <div className="flex flex-col items-center">
                      <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-md overflow-hidden mb-2 p-2 flex justify-center">
                        {imagePreview ? (
                          <img 
                            src={imagePreview}
                            alt="Book cover"
                            className="max-h-[240px] object-contain"
                          />
                        ) : (
                          <div className={`w-full h-48 flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <PhotoIcon className={`h-12 w-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="w-full text-xs text-gray-500
                          file:mr-2 file:py-1 file:px-3
                          file:rounded-md file:border-0
                          file:text-xs file:font-medium
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                      {errors.coverUrl && (
                        <p className="mt-1 text-xs text-red-500">{errors.coverUrl}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Book Details */}
              <div className="w-full md:w-2/3">
                {/* Basic Information Section */}
                <div className="mb-6">
                  <h2 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} border-b pb-2 mb-3 border-gray-200 dark:border-gray-700`}>
                    Basic Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="relative">
                      <label htmlFor="title" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        className={`block w-full rounded-md shadow-sm text-sm px-3 py-2 border
                          ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 Pagestext-white focus:border-blue-500 focus:ring-blue-500' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                        value={bookData.title}
                        onChange={handleChange}
                      />
                      {autoFilledFields.has('title') && (
                        <div className="absolute right-2 top-8 text-green-500">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                    </div>

                    {/* Author */}
                    <div className="relative">
                      <label htmlFor="author" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Author <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="author"
                        id="author"
                        required
                        className={`block w-full rounded-md shadow-sm text-sm px-3 py-2 border
                          ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                        value={bookData.author}
                        onChange={handleChange}
                      />
                      {autoFilledFields.has('author') && (
                        <div className="absolute right-2 top-8 text-green-500">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {errors.author && <p className="mt-1 text-xs text-red-500">{errors.author}</p>}
                    </div>

                    {/* Category */}
                    <div className="relative">
                      <label htmlFor="category" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        id="category"
                        required
                        className={`block w-full rounded-md shadow-sm text-sm px-3 py-2 border
                          ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                        value={bookData.category}
                        onChange={handleChange}
                      >
                        <option value="">Select category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      {autoFilledFields.has('category') && (
                        <div className="absolute right-2 top-8 text-green-500">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                    </div>

                    {/* Publisher */}
                    <div className="relative">
                      <label htmlFor="publisher" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Publisher <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="publisher"
                        id="publisher"
                        required
                        className={`block w-full rounded-md shadow-sm text-sm px-3 py-2 border
                          ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                        value={bookData.publisher}
                        onChange={handleChange}
                      />
                      {autoFilledFields.has('publisher') && (
                        <div className="absolute right-2 top-8 text-green-500">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {errors.publisher && <p className="mt-1 text-xs text-red-500">{errors.publisher}</p>}
                    </div>

                    {/* Publication Date */}
                    <div className="relative">
                      <label htmlFor="publicationDate" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Publication Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="publicationDate"
                        id="publicationDate"
                        required
                        className={`block w-full rounded-md shadow-sm text-sm px-3 py-2 border
                          ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                        value={bookData.publicationDate}
                        onChange={handleChange}
                      />
                      {autoFilledFields.has('publicationDate') && (
                        <div className="absolute right-2 top-8 text-green-500">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {errors.publicationDate && <p className="mt-1 text-xs text-red-500">{errors.publicationDate}</p>}
                    </div>

                    {/* Quantity */}
                    <div>
                      <label htmlFor="quantity" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        id="quantity"
                        required
                        min="1"
                        className={`block w-full rounded-md shadow-sm text-sm px-3 py-2 border
                          ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                        value={bookData.quantity}
                        onChange={handleChange}
                      />
                      {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>}
                    </div>
                  </div>
                </div>

                {/* Additional Details Section */}
                <div>
                  <h2 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} border-b pb-2 mb-3 border-gray-200 dark:border-gray-700`}>
                    Additional Details
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Edition Year */}
                    <div>
                      <label htmlFor="edition" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Edition Year
                      </label>
                      <input
                        type="number"
                        name="edition"
                        id="edition"
                        className={`block w-full rounded-md shadow-sm text-sm px-3 py-2 border
                          ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                        value={bookData.edition}
                        onChange={handleChange}
                        min="1800"
                        max={new Date().getFullYear()}
                        placeholder="YYYY"
                      />
                      {errors.edition && <p className="mt-1 text-xs text-red-500">{errors.edition}</p>}
                    </div>

                    {/* Language */}
                    <div className="relative">
                      <label htmlFor="language" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Language
                      </label>
                      <input
                        type="text"
                        name="language"
                        id="language"
                        className={`block w-full rounded-md shadow-sm text-sm px-3 py-2 border
                          ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                        value={bookData.language}
                        onChange={handleChange}
                        placeholder="Enter language"
                      />
                      {autoFilledFields.has('language') && (
                        <div className="absolute right-2 top-8 text-green-500">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Page Count */}
                    <div className="relative">
                      <label htmlFor="pageCount" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Pages
                      </label>
                      <input
                        type="number"
                        name="pageCount"
                        id="pageCount"
                        className={`block w-full rounded-md shadow-sm text-sm px-3 py-2 border
                          ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                        value={bookData.pageCount}
                        onChange={handleChange}
                        min="1"
                      />
                      {autoFilledFields.has('pageCount') && (
                        <div className="absolute right-2 top-8 text-green-500">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Location */}
                    <div>
                      <label htmlFor="location" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        id="location"
                        className={`block w-full rounded-md shadow-sm text-sm px-3 py-2 border
                          ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                        value={bookData.location}
                        onChange={handleChange}
                        placeholder="e.g., Shelf A-1"
                      />
                    </div>
                    
                    {/* Price */}
                    <div>
                      <label htmlFor="price" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Price
                      </label>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        className={`block w-full rounded-md shadow-sm text-sm px-3 py-2 border
                          ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                        value={bookData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="Enter price"
                      />
                    </div>

                    {/* Available */}
                    <div className="flex items-center">
                      <div className="mt-1">
                        <input
                          type="checkbox"
                          name="available"
                          id="available"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={bookData.available}
                          onChange={handleChange}
                        />
                        <label htmlFor="available" className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Available for borrowing
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {submitError && (
              <div className={`mt-4 text-sm p-3 rounded-md ${
                submitError.startsWith('success:')
                  ? isDarkMode 
                    ? 'text-green-400 bg-green-900/50' 
                    : 'text-green-600 bg-green-50'
                  : isDarkMode
                    ? 'text-red-400 bg-red-900/50'
                    : 'text-red-600 bg-red-50'
              }`}>
                {submitError.startsWith('success:') ? submitError.substring(8) : submitError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate('/books')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Adding...' : 'Add Book'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

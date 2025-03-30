import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useDarkMode } from '../context/DarkModeContext';

const faqs = [
  {
    question: 'How do I borrow a book?',
    answer: 'To borrow a book, first log in to your account, search for the book you want, and click the "Borrow" button. The request will be processed by our librarians.'
  },
  {
    question: 'What is the loan period?',
    answer: 'The standard loan period is 14 days. You can check the due date in your "My Borrows" section.'
  },
  {
    question: 'How do I renew a book?',
    answer: 'You can renew a book through your "My Borrows" section up to 2 times, as long as no one else has reserved it.'
  },
  {
    question: 'What are the late fees?',
    answer: 'Late fees are $0.50 per day per book. You can view any outstanding fees in the "Fines & Payments" section.'
  },
  {
    question: 'How do I reserve a book?',
    answer: 'If a book is currently borrowed, you can place a reservation by clicking the "Reserve" button on the book details page.'
  }
];

function Help() {
  const { isDarkMode } = useDarkMode();
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center ${isDarkMode ? 'text-red-400' : 'text-red-600'} p-4`}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={`mt-2 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <div className="flex justify-between items-start mb-6">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Help Center</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} overflow-hidden`}
            >
              <button
                className={`w-full px-6 py-4 text-left flex justify-between items-center ${
                  isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </button>
              {openIndex === index && (
                <div className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Need More Help?
          </h2>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            If you couldn't find the answer you're looking for, please visit our{' '}
            <a href="/support" className="text-blue-500 hover:text-blue-600">
              Support Page
            </a>{' '}
            to contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Help;

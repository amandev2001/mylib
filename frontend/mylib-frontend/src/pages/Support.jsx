import { useState } from 'react';
import { EnvelopeIcon, PhoneIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { useDarkMode } from '../context/DarkModeContext';
import  usePageTitle  from "../utils/useTitle";

function Support() {
  usePageTitle("Help", "Support");
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      <div className={`text-center ${isDarkMode ? 'text-red-400' : 'text-red-600'} p-4`}>
        <p>{error}</p>
        <button onClick={() => setError(null)} className={`mt-2 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <div className="flex justify-between items-start mb-6">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Contact Support</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Information Section */}
          <div className="md:col-span-1">
            <div className={`rounded-lg p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <EnvelopeIcon className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mr-2`} />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>support@mylib.com</span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mr-2`} />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>+1 (555) 123-4567</span>
                </div>
                {/* <div className="flex items-center">
                  <ChatBubbleLeftIcon className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mr-2`} />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Live chat available 24/7</span>
                </div> */}
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="md:col-span-2">
            <div className={`rounded-lg p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Send us a Message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className={`w-full px-3 py-2 rounded-md ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } border focus:ring-2 focus:ring-blue-500`}
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className={`w-full px-3 py-2 rounded-md ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } border focus:ring-2 focus:ring-blue-500`}
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    className={`w-full px-3 py-2 rounded-md ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:ring-2 focus:ring-blue-500`}
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Message
                  </label>
                  <textarea
                    name="message"
                    required
                    rows="4"
                    className={`w-full px-3 py-2 rounded-md ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:ring-2 focus:ring-blue-500`}
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
              {submitted && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;

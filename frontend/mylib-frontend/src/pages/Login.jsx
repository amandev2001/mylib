import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useDarkMode } from '../context/DarkModeContext';

function Login() {
  const { isDarkMode } = useDarkMode();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(credentials);
      navigate('/'); // Redirect to dashboard after successful login
    } catch (err) {
      const errorMessage = err.message || 'Failed to login. Please try again.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-gradient-to-r from-blue-100 to-blue-50'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className={`max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl p-8 space-y-8`}>
        <div className="text-center">
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>MyLib</h1>
          <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Welcome Back!</h2>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Please sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`mt-1 block w-full px-3 py-2 border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 placeholder-gray-400'} rounded-md shadow-sm 
                         focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Enter your email"
                value={credentials.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`mt-1 block w-full px-3 py-2 border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 placeholder-gray-400'} rounded-md shadow-sm 
                         focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className={`p-4 rounded-md ${isDarkMode ? 'bg-red-900 text-red-100' : 'bg-red-50 text-red-700'}`}>
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                       bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                       disabled:bg-blue-300 disabled:cursor-not-allowed transform transition duration-100 hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Don't have an account? </span>
            <Link 
              to="/register" 
              className={`font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} hover:underline`}
            >
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login; 
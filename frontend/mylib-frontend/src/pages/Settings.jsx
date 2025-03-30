import { useState, useEffect } from 'react';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useDarkMode } from '../context/DarkModeContext';
import { authService } from '../services/authService';

function Settings() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      inApp: true,
      sms: false
    },
    privacy: {
      showProfile: true,
      showHistory: false,
      showActivity: true
    },
    preferences: {
      language: 'English',
      theme: 'system',
      timezone: 'UTC'
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { isDarkMode } = useDarkMode();
  const userRoles = authService.getUserRoles();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app, fetch actual settings from backend
      setError(null);
    } catch (err) {
      setError('Failed to fetch settings. Please try again later.');
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggle = (section, setting) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [setting]: !prev[section][setting]
      }
    }));
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
        <button onClick={fetchSettings} className={`mt-2 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {!isEditing && (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex justify-between items-start mb-6">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Settings</h2>
            <button 
              onClick={() => setIsEditing(true)}
              className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'}`}
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-8">
            {/* Notifications Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Notifications
              </h3>
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} capitalize`}>
                      {key === 'inApp' ? 'In-App' : key} Notifications
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      value
                        ? isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                        : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {value ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Privacy
              </h3>
              <div className="space-y-4">
                {Object.entries(settings.privacy).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} capitalize`}>
                      Show {key}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      value
                        ? isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                        : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {value ? 'Public' : 'Private'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferences Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Preferences
              </h3>
              <div className="space-y-4">
                {Object.entries(settings.preferences).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} capitalize`}>
                      {key}
                    </span>
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex justify-between items-start mb-6">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Edit Settings</h2>
            <button 
              onClick={() => setIsEditing(false)}
              className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form className="space-y-8">
            {/* Notifications Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Notifications
              </h3>
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={value}
                          onChange={() => handleToggle('notifications', key)}
                        />
                        <div className={`w-10 h-6 rounded-full ${
                          value
                            ? 'bg-blue-600'
                            : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                        }`}>
                          <div className={`absolute w-4 h-4 rounded-full transition-transform ${
                            value ? 'translate-x-5 bg-white' : 'translate-x-1 bg-white'
                          }`} />
                        </div>
                      </div>
                      <span className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} capitalize`}>
                        {key === 'inApp' ? 'In-App' : key} Notifications
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Settings;

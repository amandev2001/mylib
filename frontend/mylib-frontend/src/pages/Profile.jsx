import { useState, useEffect } from 'react';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useDarkMode } from '../context/DarkModeContext';
import { memberService } from '../services/memberService';
import { authService } from '../services/authService';
import MemberEditForm from '../components/MemberEditForm';

const DEFAULT_PROFILE = '/book-covers/fiction-default.jpg.webp';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { isDarkMode } = useDarkMode();
  const userRoles = authService.getUserRoles();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const currentUser = await memberService.getCurrentMember();
      setProfile(currentUser);
      setError(null);
    } catch (err) {
      setError('Failed to fetch profile. Please try again later.');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_PROFILE;
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
        <button onClick={fetchProfile} className={`mt-2 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {!isEditing && profile && (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex justify-between items-start mb-6">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>My Profile</h2>
            <button 
              onClick={() => setIsEditing(true)}
              className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'}`}
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <img
                src={profile.profilePic || DEFAULT_PROFILE}
                alt={profile.name}
                className="w-32 h-32 rounded-full object-cover"
                onError={handleImageError}
              />
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Name</h3>
                <p className={`mt-1 text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{profile.name}</p>
              </div>

              <div>
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</h3>
                <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{profile.email}</p>
              </div>

              <div>
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone Number</h3>
                <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{profile.phoneNumber}</p>
              </div>

              <div>
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Roles</h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {profile.roleList.map(role => {
                    const roleName = role.replace('ROLE_', '');
                    return (
                      <span
                        key={role}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          role === 'ROLE_ADMIN' 
                            ? isDarkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'
                            : role === 'ROLE_LIBRARIAN'
                              ? isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                              : isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {roleName}
                      </span>
                    );
                  })}
                </div>
              </div>

              {profile.about && (
                <div>
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>About</h3>
                  <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{profile.about}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isEditing && profile && (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex justify-between items-start mb-4">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Edit Profile</h2>
            <button 
              onClick={() => setIsEditing(false)}
              className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <XMarkIcon className="h-6 w-6" />
          </button>
          </div>

          <MemberEditForm
            member={profile}  
            onSave={async (updatedProfile) => {
              setProfile(updatedProfile);
              setIsEditing(false);
              await fetchProfile(); // Refresh data from server
            }}
            onCancel={() => setIsEditing(false)}
            isDarkMode={isDarkMode}
            isProfile={true} // This will prevent role editing for regular users
            userRoles={userRoles} // Pass user roles to control edit permissions
          />
        </div>
      )}
    </div>
  );
}

export default Profile;

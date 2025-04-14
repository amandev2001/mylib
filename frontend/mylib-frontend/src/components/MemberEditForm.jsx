import { useState, useEffect } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { memberService } from '../services/memberService';
import { ROLES } from '../utils/roleUtils';
import Cookies from 'js-cookie';

const DEFAULT_PROFILE = '/book-covers/fiction-default.jpg.webp';

const MemberEditForm = ({ 
  member, 
  onSave, 
  onCancel, 
  isDarkMode,
  isProfile = false,
  userRoles = [] 
}) => {
  const [formData, setFormData] = useState({
    id: member.id,
    name: member.name || '',
    email: member.email || '',
    phoneNumber: member.phoneNumber || '',
    about: member.about || '',
    enabled: member.enabled,
    roleList: member.roleList || [],
    profilePic: member.profilePic || DEFAULT_PROFILE
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(member.profilePic || DEFAULT_PROFILE);
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoleToggle = (role) => {
    setFormData(prev => {
      const newRoles = [...prev.roleList];
      const roleIndex = newRoles.indexOf(role);
      
      if (roleIndex === -1) {
        newRoles.push(role);
      } else {
        newRoles.splice(roleIndex, 1);
      }
      
      return {
        ...prev,
        roleList: newRoles
      };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let updatedProfileUrl = formData.profilePic;
      
      // If we have a new image, upload it first
      if (imageFile) {
        const formDataImg = new FormData();
        formDataImg.append('file', imageFile);
        const response = await memberService.uploadProfileImage(formData.id, formDataImg);
        
        // Get profile URL from response
        updatedProfileUrl = response.user?.profilePic || response.profilePic || response;
        
        // Update token if received
        if (response.token) {
          Cookies.set('token', response.token, { expires: 7 }); // Store token in cookies
          memberService.setAuthToken(response.token);
        }
      }

      // Update the user data
      const userData = {
        id: String(formData.id),
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber || '',
        about: formData.about || '',
        enabled: formData.enabled,
        roleList: formData.roleList,
        profilePic: updatedProfileUrl
      };

      // Update user with new data
      const updatedUser = await memberService.updateMember(formData.id, userData);

      // Update local preview
      setPreviewImage(updatedProfileUrl);
      setFormData(prev => ({
        ...prev,
        profilePic: updatedProfileUrl
      }));

      onSave(updatedUser);
    } catch (err) {
      console.error('Error saving member:', err);
      setError('Failed to save member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = DEFAULT_PROFILE;
  };

  const availableRoles = Object.values(ROLES);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className={`${isDarkMode ? 'bg-red-900/50 border-red-800 text-red-200' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded-lg`}>
          {error}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Image */}
        <div className="flex-shrink-0 mb-4 md:mb-0">
          <div className="relative mx-auto md:mx-0">
            <img
              src={previewImage}
              alt={formData.name}
              className="w-36 h-36 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700 shadow-md"
              onError={handleImageError}
            />
            <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-2.5 rounded-full cursor-pointer hover:bg-blue-700 shadow-lg transition-colors duration-150">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <PhotoIcon className="h-5 w-5" />
            </label>
          </div>
        </div>
        
        {/* Form Fields */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="mb-2">
            <label htmlFor="name" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-3 rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'border-gray-300 focus:border-blue-500'
              } shadow-sm focus:ring-blue-500 sm:text-sm`}
              required
            />
          </div>
          
          {/* Email */}
          <div className="mb-2">
            <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Email
            </label>
            <input
              type="email"
              id="email"
              disabled
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`cursor-not-allowed mt-1 block w-full px-4 py-3 rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'border-gray-300 focus:border-blue-500'
              } shadow-sm focus:ring-blue-500 sm:text-sm`}
              required
            />
          </div>
          
          {/* Phone */}
          <div className="mb-2">
            <label htmlFor="phoneNumber" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-3 rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'border-gray-300 focus:border-blue-500'
              } shadow-sm focus:ring-blue-500 sm:text-sm`}
            />
          </div>
          
          {/* Status */}
          {!isProfile && userRoles.includes('ROLE_ADMIN') && (
            <div className="mb-2">
              <div className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Account Status
              </div>
              <div className="flex items-center mt-2 p-2">
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="enabled"
                    id="toggle"
                    checked={formData.enabled}
                    onChange={handleChange}
                    className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer focus:outline-none transition-transform duration-200 ease-in-out"
                    style={{
                      transform: formData.enabled ? 'translateX(100%)' : 'translateX(0)',
                      borderColor: formData.enabled 
                        ? isDarkMode ? '#4ADE80' : '#10B981' 
                        : isDarkMode ? '#EF4444' : '#F87171'
                    }}
                  />
                  <label
                    htmlFor="toggle"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                      formData.enabled 
                        ? isDarkMode ? 'bg-green-900' : 'bg-green-500' 
                        : isDarkMode ? 'bg-red-900' : 'bg-red-500'
                    }`}
                  />
                </div>
                <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formData.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save and Cancel buttons */}
      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={loading}
          className={`w-full md:w-auto mt-4 md:mt-0 py-3 px-6 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full md:w-auto mt-4 md:mt-0 py-3 px-6 text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 ease-in-out"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default MemberEditForm;

import { useState, useEffect } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { memberService } from '../services/memberService';
import { ROLES } from '../utils/roleUtils';

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
      let updatedUser;
      
      // Check if this is a new user or an existing one
      if (!formData.id) {
        // Create a new user
        const newUser = await memberService.createMember({
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: "temp123", // Default password that should be changed on first login
          roleList: formData.roleList
        });
        
        // If we have a new image, upload it
        if (imageFile) {
          const formDataImg = new FormData();
          formDataImg.append('file', imageFile);
          await memberService.uploadProfileImage(newUser.id, formDataImg);
        }
        
        updatedUser = newUser;
      } else {
        // Upload image if a new one is selected
        let updatedProfilePic = formData.profilePic;
        if (imageFile) {
          const formDataImg = new FormData();
          formDataImg.append('file', imageFile);
          updatedProfilePic = await memberService.uploadProfileImage(formData.id, formDataImg);
        }
        
        // Update the existing user data
        updatedUser = await memberService.updateMember(formData.id, {
          ...formData,
          profilePic: updatedProfilePic
        });
      }
      
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
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-3 rounded-md ${
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
                <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formData.enabled ? 'Active' : 'Inactive'}
                </span>
                <span className={`px-3 py-1 ml-3 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  formData.enabled 
                    ? isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                    : isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                }`}>
                  {formData.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {formData.enabled 
                  ? 'User can login and access the system.' 
                  : 'User cannot login or access the system.'}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* About */}
      <div className="col-span-1 md:col-span-2 mb-4">
        <label htmlFor="about" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
          About / Notes
        </label>
        <textarea
          id="about"
          name="about"
          rows="3"
          value={formData.about}
          onChange={handleChange}
          className={`mt-1 block w-full px-4 py-3 rounded-md ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
              : 'border-gray-300 focus:border-blue-500'
          } shadow-sm focus:ring-blue-500 sm:text-sm`}
        />
      </div>
      
      {/* User Roles */}
      {!isProfile && userRoles.includes('ROLE_ADMIN') && (
        <div className="col-span-1 md:col-span-2 mb-4">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            User Roles
          </label>
          <div className="flex flex-wrap gap-2 p-2">
            {availableRoles.map(role => {
              const isActive = formData.roleList.includes(role);
              const roleLabel = role.replace('ROLE_', '');
              
              let bgColor, textColor;
              if (role === 'ROLE_ADMIN') {
                bgColor = isActive 
                  ? isDarkMode ? 'bg-indigo-800' : 'bg-indigo-600' 
                  : isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
                textColor = isActive 
                  ? 'text-white' 
                  : isDarkMode ? 'text-gray-300' : 'text-gray-700';
              } else if (role === 'ROLE_LIBRARIAN') {
                bgColor = isActive 
                  ? isDarkMode ? 'bg-blue-800' : 'bg-blue-600' 
                  : isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
                textColor = isActive 
                  ? 'text-white' 
                  : isDarkMode ? 'text-gray-300' : 'text-gray-700';
              } else {
                bgColor = isActive 
                  ? isDarkMode ? 'bg-green-800' : 'bg-green-600' 
                  : isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
                textColor = isActive 
                  ? 'text-white' 
                  : isDarkMode ? 'text-gray-300' : 'text-gray-700';
              }
              
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleToggle(role)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor} transition-colors duration-150`}
                >
                  {roleLabel}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className={`px-5 py-2.5 rounded-md text-sm font-medium ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } transition-colors duration-150`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-5 py-2.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors duration-150`}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default MemberEditForm;
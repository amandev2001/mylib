import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ROLES } from '../utils/roleUtils';
import { useDarkMode } from '../context/DarkModeContext';
import { useNavigate } from 'react-router-dom';

const RoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users/all');
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users');
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, userRoles, role, isActive) => {
    try {
      // Create a new roles array based on the current state
      let newRoles = [...userRoles];
      
      if (isActive) {
        // Add the role if it doesn't exist
        if (!newRoles.includes(role)) {
          newRoles.push(role);
        }
      } else {
        // Remove the role
        newRoles = newRoles.filter(r => r !== role);
      }
      
      await api.put(`/api/users/${userId}/roles`, { roles: newRoles });
      setSuccess('Roles updated successfully');
      fetchUsers(); // Refresh the user list
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update roles');
      setTimeout(() => setError(null), 3000);
    }
  };

  const availableRoles = Object.values(ROLES);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <div className={`mb-4 ${isDarkMode ? 'bg-red-900/50 border-red-800 text-red-200' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded-lg`} role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className={`mb-4 ${isDarkMode ? 'bg-green-900/50 border-green-800 text-green-200' : 'bg-green-50 border-green-200 text-green-700'} border px-4 py-3 rounded-lg`}>
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg overflow-hidden`}>
        <div className={`px-6 py-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b flex justify-between items-center`}>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Role Management</h2>
          <button 
            onClick={() => navigate(-1)} 
            className={`px-3 py-1 rounded-md text-sm font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors duration-200`}
          >
            Back
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
              <tr>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                  Name
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                  Email
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                  Current Roles
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                  Manage Roles
                </th>
              </tr>
            </thead>
            <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {users.map((user) => (
                <tr key={user.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roleList && user.roleList.length > 0 ? (
                        user.roleList.map((role) => (
                          <span
                            key={role}
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              role === 'ROLE_ADMIN' ? 
                                isDarkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800' :
                              role === 'ROLE_LIBRARIAN' ? 
                                isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800' :
                                isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                            } transition-colors duration-200`}
                          >
                            {role.replace('ROLE_', '')}
                          </span>
                        ))
                      ) : (
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No roles assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      {availableRoles.map((role) => {
                        const isActive = user.roleList && user.roleList.includes(role);
                        const roleLabel = role.replace('ROLE_', '');
                        
                        let bgColor, textColor, hoverColor;
                        
                        if (role === 'ROLE_ADMIN') {
                          bgColor = isActive 
                            ? isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100' 
                            : isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
                          textColor = isActive 
                            ? isDarkMode ? 'text-indigo-200' : 'text-indigo-800'
                            : isDarkMode ? 'text-gray-300' : 'text-gray-700';
                          hoverColor = isDarkMode ? 'hover:bg-indigo-800' : 'hover:bg-indigo-200';
                        } else if (role === 'ROLE_LIBRARIAN') {
                          bgColor = isActive 
                            ? isDarkMode ? 'bg-blue-900' : 'bg-blue-100' 
                            : isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
                          textColor = isActive 
                            ? isDarkMode ? 'text-blue-200' : 'text-blue-800'
                            : isDarkMode ? 'text-gray-300' : 'text-gray-700';
                          hoverColor = isDarkMode ? 'hover:bg-blue-800' : 'hover:bg-blue-200';
                        } else {
                          bgColor = isActive 
                            ? isDarkMode ? 'bg-green-900' : 'bg-green-100' 
                            : isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
                          textColor = isActive 
                            ? isDarkMode ? 'text-green-200' : 'text-green-800'
                            : isDarkMode ? 'text-gray-300' : 'text-gray-700';
                          hoverColor = isDarkMode ? 'hover:bg-green-800' : 'hover:bg-green-200';
                        }
                        
                        return (
                          <button
                            key={role}
                            onClick={() => handleRoleChange(user.id, user.roleList || [], role, !isActive)}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${bgColor} ${textColor} ${hoverColor} transition-colors duration-200 flex items-center justify-between`}
                          >
                            <span>{roleLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement; 
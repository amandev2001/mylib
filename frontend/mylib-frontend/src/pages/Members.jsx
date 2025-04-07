import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react';
import { memberService } from '../services/memberService';
import { useDarkMode } from '../context/DarkModeContext';
import MemberEditForm from '../components/MemberEditForm';

// Default profile image
const DEFAULT_PROFILE = '/book-covers/fiction-default.jpg.webp';

function Members() {
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await memberService.getAllMembers();
      setMembers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch members. Please try again later.');
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    setSearchQuery(e.target.value);
    try {
      if (e.target.value.trim()) {
        const data = await memberService.searchMembers(e.target.value);
        setMembers(data);
      } else {
        fetchMembers();
      }
    } catch (err) {
      console.error('Error searching members:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await memberService.deleteMember(id);
        setMembers(members.filter(member => member.id !== id));
      } catch (err) {
        console.error('Error deleting member:', err);
        alert('Failed to delete member. Please try again.');
      }
    }
  };

  const handleDetailsClick = (member) => {
    setSelectedMember(member);
    setIsDetailsModalOpen(true);
  };

  const handleToggleStatus = async (member) => {
    try {
      const updatedMember = await memberService.updateMember(member.id, {
        ...member,
        enabled: !member.enabled
      });
      
      setMembers(members.map(m => 
        m.id === member.id ? updatedMember : m
      ));
    } catch (err) {
      console.error('Error updating member status:', err);
      alert('Failed to update member status. Please try again.');
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
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
        <button onClick={fetchMembers} className={`mt-2 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Members</h2>
        <button 
          onClick={() => {
            setSelectedMember({
              id: null,
              name: '',
              email: '',
              phoneNumber: '',
              about: '',
              enabled: true,
              roleList: ['ROLE_STUDENT'],
              profilePic: null
            });
            setIsDetailsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Member
        </button>
      </div>

      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search members by name, email, or ID..."
              className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:ring-blue-500 transition-colors`}
              value={searchQuery}
              onChange={handleSearch}
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Member</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Email</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Phone</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {members.map((member) => (
                <tr key={member.id} className={`${isDarkMode ? 'hover:bg-gray-700 transition-colors duration-200' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={member.profilePic || DEFAULT_PROFILE}
                          alt={member.name}
                          onError={handleImageError}
                        />
                      </div>
                      <div className="ml-4">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{member.name}</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {member.email}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {member.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={member.enabled}
                        onChange={() => handleToggleStatus(member)}
                        className={`${
                          member.enabled 
                            ? isDarkMode ? 'bg-green-900' : 'bg-green-600'
                            : isDarkMode ? 'bg-red-900' : 'bg-red-600'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                      >
                        <span className="sr-only">Enable user</span>
                        <span
                          className={`${
                            member.enabled ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </Switch>
                      <span className={`text-xs font-semibold ${
                        member.enabled 
                          ? isDarkMode ? 'text-green-400' : 'text-green-700'
                          : isDarkMode ? 'text-red-400' : 'text-red-700'
                      }`}>
                        {member.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'}`}
                        onClick={() => handleDetailsClick(member)}
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button 
                        className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}`}
                        onClick={() => handleDelete(member.id)}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Details Modal */}
      {isDetailsModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedMember.id ? 'Edit Member' : 'Add New Member'}
              </h3>
              <button 
                onClick={() => setIsDetailsModalOpen(false)} 
                className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <MemberEditForm 
              member={selectedMember} 
              onSave={(updatedMember) => {
                // Update the local members list to immediately reflect changes
                setMembers(prevMembers => prevMembers.map(member => 
                  member.id === updatedMember.id ? updatedMember : member
                ));
                
                // Close modal
                setIsDetailsModalOpen(false);
                
                // Also refresh from server to ensure data consistency
                fetchMembers();
              }}
              onCancel={() => setIsDetailsModalOpen(false)}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Members;
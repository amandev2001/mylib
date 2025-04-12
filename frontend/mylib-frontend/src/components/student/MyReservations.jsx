import { useState, useEffect, useCallback } from 'react';
import { reserveService } from '../../services/reserveService';
import { formatDate } from '../../utils/dateExtensions';
import { authService } from '../../services/authService';
import { useDarkMode } from '../../context/DarkModeContext';
import  usePageTitle  from "../../utils/useTitle";

export default function MyReservations() {

  usePageTitle("My Reservations");

  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useDarkMode();

  // Create a reusable function for loading reservations
  const loadUserReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentUser = await authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        setError('User not authenticated');
        return;
      }
      const response = await reserveService.getReservesByUser(currentUser.id);
      setReservations(response);
    } catch (err) {
      setError('Failed to load your reservations');
      console.error('Error loading reservations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserReservations();
  }, [loadUserReservations]);

  const handleCancelReservation = async (reservationId) => {
    try {
      await reserveService.cancelReserve(reservationId);
      // Refresh the list after cancellation
      loadUserReservations();
    } catch (err) {
      setError('Failed to cancel reservation');
      console.error('Error canceling reservation:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${isDarkMode ? 'bg-red-900/50 border-red-800 text-red-200' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded relative`} role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg overflow-hidden`}>
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>My Reservations</h2>
        </div>
        
        {reservations.length === 0 ? (
          <div className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            You don't have any active reservations.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <tr>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Book</th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Reserved On</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reservation.bookTitle}</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{reservation.bookAuthor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        reservation.status === 'PENDING' ? 
                          isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800' :
                        reservation.status === 'CONFIRMED' ? 
                          isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800' :
                        reservation.status === 'COMPLETED' ? 
                          isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800' :
                          isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                      }`}>
                        {reservation.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDate(reservation.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {reservation.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelReservation(reservation.id)}
                          className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}`}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 
import { createContext, useContext, useState, useEffect } from 'react';
import { memberService } from '../services/memberService';
import { authService } from '../services/authService';

const UserContext = createContext(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          const user = await memberService.getCurrentMember();
          setCurrentUser(user);
          if (user?.roleList) {
            const formattedRoles = user.roleList.map(role => 
              role.replace('ROLE_', '').charAt(0).toUpperCase() + 
              role.replace('ROLE_', '').slice(1).toLowerCase()
            );
            setUserRoles(formattedRoles);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setIsLoading(false);
    };
    fetchUserData();
  }, [isAuthenticated]);

  const value = {
    currentUser,
    setCurrentUser,
    userRoles,
    setUserRoles,
    isLoading
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
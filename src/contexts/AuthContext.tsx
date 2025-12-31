import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { jwtDecode } from 'jwt-decode';
import { setLogoutCallback } from '../services/api';

interface DecodedToken {
  sub: string;
  name?: string;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
    
    // Register global logout callback for API errors
    setLogoutCallback(() => {
      setUser(null);
    });
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        
        // Decode token to get latest user info
        try {
          const decoded: DecodedToken = jwtDecode(token);
          if (decoded.name) {
            parsedUser.name = decoded.name;
          }
        } catch (e) {
          console.error('Error decoding token:', e);
        }

        setUser({ ...parsedUser, token });
      }
    } catch (error) {
      console.error('Failed to load user from storage', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User) => {
    try {
      // Decode token to get latest user info immediately on login
      if (userData.token) {
        try {
          const decoded: DecodedToken = jwtDecode(userData.token);
          if (decoded.name) {
            userData.name = decoded.name;
          }
        } catch (e) {
          console.error('Error decoding token during login:', e);
        }
      }

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', userData.token);
      setUser(userData);
    } catch (error) {
      console.error('Failed to save user to storage', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  const updateUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      if (userData.token) {
        await AsyncStorage.setItem('token', userData.token);
      }
      setUser(userData);
    } catch (error) {
      console.error('Failed to update user', error);
      throw error;
    }
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

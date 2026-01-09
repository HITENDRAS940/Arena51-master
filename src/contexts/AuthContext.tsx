import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { jwtDecode } from 'jwt-decode';
import { setLogoutCallback, authAPI, userAPI } from '../services/api';

interface DecodedToken {
  sub: string;
  name?: string;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => Promise<void>;
  requestOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, otp: string) => Promise<boolean>;
  updateProfile: (name: string) => Promise<void>;
  isLoading: boolean;
  redirectData: any | null;
  setRedirectData: (data: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectData, setRedirectData] = useState<any | null>(null);

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

  const requestOTP = async (phone: string) => {
    try {
      await authAPI.sendOTP(phone);
    } catch (error) {
      console.error('Failed to request OTP', error);
      throw error;
    }
  };

  const verifyOTP = async (phone: string, otp: string) => {
    try {
      const response = await authAPI.verifyOTP(phone, otp);
      const responseData = response.data;
      
      if (responseData.token) {
        const token = responseData.token;
        await AsyncStorage.setItem('token', token);

        try {
          const decoded: DecodedToken = jwtDecode(token);
          
          const userObj: User = {
            id: (decoded as any).userId, // Type assertion as DecodedToken interface might need update
            phone: decoded.sub,
            role: (decoded as any).role || 'ROLE_USER',
            token: token,
            name: decoded.name,
          };

          if (decoded.name) {
            // Registered user
            await login(userObj);
            return false; // Name is present
          } else {
            // New user - name missing
            setUser(userObj);
            await AsyncStorage.setItem('user', JSON.stringify(userObj));
            return true; // Name is missing
          }
        } catch (decodeError) {
          console.error('Failed to decode token', decodeError);
          // Fallback if decoding fails but we have a token? 
          // Better to throw or treat as failed auth if we rely on token payload
          throw new Error('Invalid token received');
        }
      }
      return false;
    } catch (error) {
      console.error('Failed to verify OTP', error);
      throw error;
    }
  };

  const updateProfile = async (name: string) => {
    try {
      const response = await userAPI.setName(name);
      const updatedUser = { ...user, ...response.data, name };
      await login(updatedUser);
    } catch (error) {
      console.error('Failed to update profile', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user && !!user.token && !!user.name,
      login, 
      logout, 
      updateUser, 
      requestOTP,
      verifyOTP,
      updateProfile,
      isLoading,
      redirectData,
      setRedirectData 
    }}>
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

import React, { createContext, useContext, ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';

export const ACTIVITY_THEMES: Record<string, { colors: readonly [string, string], icon: keyof typeof Ionicons.glyphMap, iconColor?: string }> = {
  'Football': { colors: ['#EF5350', '#D32F2F'], icon: 'football', iconColor: '#FFCDD2' },
  'Cricket': { colors: ['#5C6BC0', '#3F51B5'], icon: 'baseball', iconColor: '#C5CAE9' }, 
  'Bowling': { colors: ['#78909C', '#546E7A'], icon: 'radio-button-on', iconColor: '#CFD8DC' },
  'Padel Ball': { colors: ['#26A69A', '#00796B'], icon: 'tennisball', iconColor: '#B2DFDB' },
  'Badminton': { colors: ['#AB47BC', '#8E24AA'], icon: 'bicycle', iconColor: '#E1BEE7' },
  'Tennis': { colors: ['#9CCC65', '#7CB342'], icon: 'tennisball', iconColor: '#DCEDC8' },
  'Swimming': { colors: ['#29B6F6', '#039BE5'], icon: 'water', iconColor: '#B3E5FC' },
  'Basketball': { colors: ['#FF7043', '#F4511E'], icon: 'basketball', iconColor: '#FFCCBC' },
  'Arcade': { colors: ['#EC407A', '#D81B60'], icon: 'game-controller', iconColor: '#F8BBD0' },
  'Gym': { colors: ['#616161', '#424242'], icon: 'barbell', iconColor: '#F5F5F5' },
  'Spa': { colors: ['#FFE000', '#799F0C'], icon: 'leaf' },
  'Studio': { colors: ['#DA22FF', '#9733EE'], icon: 'musical-notes' },
  'Conference': { colors: ['#2C3E50', '#4CA1AF'], icon: 'people' },
  'Party Hall': { colors: ['#DA4453', '#89216B'], icon: 'wine' },
};

export const DEFAULT_THEME = { colors: ['#000000', '#333333'] as const, icon: 'trophy' as keyof typeof Ionicons.glyphMap };


export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    navy: string;
    gray: string;
    lightGray: string;
    red: string;
    shadow: string;
  };
  fonts: {
    regular: string;
    medium: string;
    semiBold: string;
    bold: string;
  };
}

export const theme: Theme = {
  id: 'premium-black',
  name: 'Premium Black',
  colors: {
    primary: '#000000',    
    secondary: '#333333',  
    accent: '#1F2937',     
    background: '#f3f4f6', 
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#1F2937',       
    textSecondary: '#6B7280', 
    border: '#E5E7EB',     
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    navy: '#000000',       
    gray: '#9CA3AF',
    lightGray: '#F3F4F6',
    red: '#DC2626',
    shadow: '#000000',
  },
  fonts: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
};

interface ThemeContextType {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType>({ theme });

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  return useContext(ThemeContext);
};


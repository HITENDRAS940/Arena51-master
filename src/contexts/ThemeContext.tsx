import React, { createContext, useContext, ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';

export const ACTIVITY_THEMES: Record<string, { colors: readonly [string, string], icon: keyof typeof Ionicons.glyphMap }> = {
  'Football': { colors: ['#FF416C', '#FF4B2B'], icon: 'football' },
  'Cricket': { colors: ['#4776E6', '#8E54E9'], icon: 'baseball' }, // baseball as proxy
  'Bowling': { colors: ['#00B4DB', '#0083B0'], icon: 'radio-button-on' }, // generic ball
  'Padel Ball': { colors: ['#56ab2f', '#a8e063'], icon: 'tennisball' },
  'Badminton': { colors: ['#F2994A', '#F2C94C'], icon: 'bicycle' }, // proxy
  'Tennis': { colors: ['#11998e', '#38ef7d'], icon: 'tennisball' },
  'Swimming': { colors: ['#2193b0', '#6dd5ed'], icon: 'water' },
  'Basketball': { colors: ['#f12711', '#f5af19'], icon: 'basketball' },
  'Arcade': { colors: ['#834d9b', '#d04ed6'], icon: 'game-controller' },
  'Gym': { colors: ['#000000', '#434343'], icon: 'barbell' },
  'Spa': { colors: ['#FFE000', '#799F0C'], icon: 'leaf' },
  'Studio': { colors: ['#DA22FF', '#9733EE'], icon: 'musical-notes' },
  'Conference': { colors: ['#2C3E50', '#4CA1AF'], icon: 'people' },
  'Party Hall': { colors: ['#DA4453', '#89216B'], icon: 'wine' },
};

export const DEFAULT_THEME = { colors: ['#1E1B4B', '#312E81'] as const, icon: 'trophy' as keyof typeof Ionicons.glyphMap };


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
}

export const theme: Theme = {
  id: 'premium-navy',
  name: 'Premium Navy',
  colors: {
    primary: '#1E1B4B',    // Navy 950
    secondary: '#312E81',  // Indigo 900 (Deep Navy)
    accent: '#3730A3',     // Indigo 800
    background: '#F9FAFB', 
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#1F2937',       
    textSecondary: '#6B7280', 
    border: '#E5E7EB',     
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    navy: '#1E1B4B',       
    gray: '#9CA3AF',
    lightGray: '#F3F4F6',
    red: '#DC2626',
    shadow: '#000000',
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


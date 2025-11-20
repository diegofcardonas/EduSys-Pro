
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  secondaryBg: string;
  hover: string;
  danger: string;
  success: string;
  warning: string;
  inputBg: string;
}

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const lightColors: ThemeColors = {
  background: '#F0F4F8',
  card: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  primary: '#004AAD',
  secondaryBg: '#F8FAFC',
  hover: '#F1F5F9',
  danger: '#DC2626',
  success: '#059669',
  warning: '#D97706',
  inputBg: '#FFFFFF',
};

const darkColors: ThemeColors = {
  background: '#0F172A', // Slate 900
  card: '#1E293B',       // Slate 800
  text: '#F8FAFC',       // Slate 50
  textSecondary: '#94A3B8', // Slate 400
  border: '#334155',     // Slate 700
  primary: '#3B82F6',    // Blue 500 (lighter for contrast)
  secondaryBg: '#1E293B',
  hover: '#334155',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  inputBg: '#0F172A',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as ThemeMode) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    // Update body background immediately to avoid flashes
    document.body.style.backgroundColor = theme === 'light' ? lightColors.background : darkColors.background;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

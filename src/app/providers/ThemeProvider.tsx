'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isChanging?: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isChanging, setIsChanging] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Kiểm tra theme từ localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    // Kiểm tra system preference
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    document.documentElement.className = initialTheme;
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setIsChanging(true);
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // Delay theme change slightly to ensure smooth transition
    requestAnimationFrame(() => {
      setTheme(newTheme);
      document.documentElement.className = newTheme;
      localStorage.setItem('theme', newTheme);
      
      // Reset changing state after transition
      setTimeout(() => {
        setIsChanging(false);
      }, 200); // Match with CSS transition duration
    });
  };

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isChanging }}>
      <div className="theme-transition-wrapper text-[var(--foreground)]">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

import { useContext } from 'react';
import { ThemeProviderContext } from '../components/theme-provider';

export const useTheme = () => {
  const context = useContext(ThemeProviderContext as any);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context as { theme: string; setTheme: (t: string) => void };
};

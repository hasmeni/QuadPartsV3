import { create } from 'zustand';

interface ThemeState {
  theme: string;
  setTheme: (theme: string) => void;
}

// Get initial theme from localStorage
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  console.log('Initial theme from localStorage:', savedTheme);
  return savedTheme || 'dark';
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    console.log('Setting theme to:', theme);
    console.log('Previous theme was:', get().theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    console.log('Theme saved to localStorage:', theme);
    
    // Update document attribute
    document.documentElement.setAttribute('data-theme', theme);
    console.log('Document data-theme attribute set to:', theme);
    
    // Update meta theme-color
    const themeColors = {
      light: '#ffffff',
      dark: '#131419',
      midnight: '#30413d',
      cyberpunk: '#18181b',
      matrix: '#0c0c0c',
      blackOrange: '#000000',
      sunset: '#dad9d7',
      summer: '#85d5a4'
    };
    
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColors[theme as keyof typeof themeColors] || '#131419');
      console.log('Meta theme-color updated to:', themeColors[theme as keyof typeof themeColors] || '#131419');
    }
    
    // Force a re-render by updating the store
    set({ theme });
    
    console.log('Theme updated to:', theme);
    console.log('Current document data-theme:', document.documentElement.getAttribute('data-theme'));
    console.log('Current localStorage theme:', localStorage.getItem('theme'));
  },
}));
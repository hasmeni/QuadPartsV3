import { create } from 'zustand';

interface ThemeState {
  theme: string;
  customColors: {
    bgPrimary: string;
    bgSecondary: string;
    textPrimary: string;
    textSecondary: string;
    borderColor: string;
    accentPrimary: string;
    accentSecondary: string;
  };
  setTheme: (theme: string) => void;
  setCustomColors: (colors: Partial<ThemeState['customColors']>) => void;
}

// Get initial theme from localStorage
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  console.log('Initial theme from localStorage:', savedTheme);
  return savedTheme || 'dark';
};

// Get initial custom colors from localStorage
const getInitialCustomColors = () => {
  const savedColors = localStorage.getItem('customThemeColors');
  if (savedColors) {
    try {
      return JSON.parse(savedColors);
    } catch (error) {
      console.error('Error parsing custom colors:', error);
    }
  }
  return {
    bgPrimary: '#1a1a1a',
    bgSecondary: '#2d2d2d',
    textPrimary: '#ffffff',
    textSecondary: '#b0b0b0',
    borderColor: '#404040',
    accentPrimary: '#3b82f6',
    accentSecondary: '#10b981'
  };
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  customColors: getInitialCustomColors(),
  setTheme: (theme) => {
    console.log('Setting theme to:', theme);
    console.log('Previous theme was:', get().theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    console.log('Theme saved to localStorage:', theme);
    
    // Update document attribute
    document.documentElement.setAttribute('data-theme', theme);
    console.log('Document data-theme attribute set to:', theme);
    
    // If custom theme, apply custom colors
    if (theme === 'custom') {
      const { customColors } = get();
      applyCustomColors(customColors);
    }
    
    // Update meta theme-color
    const themeColors = {
      light: '#ffffff',
      dark: '#131419',
      midnight: '#1a2f1a',
      cyberpunk: '#18181b',
      matrix: '#0c0c0c',
      blackOrange: '#000000',
      sunset: '#2d1b3d',
      summer: '#ff6b6b',
      custom: get().customColors.bgPrimary
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
  setCustomColors: (colors) => {
    const currentColors = get().customColors;
    const newColors = { ...currentColors, ...colors };
    
    // Save to localStorage
    localStorage.setItem('customThemeColors', JSON.stringify(newColors));
    
    // Update store
    set({ customColors: newColors });
    
    // If custom theme is active, apply the new colors immediately
    if (get().theme === 'custom') {
      applyCustomColors(newColors);
    }
    
    console.log('Custom colors updated:', newColors);
  },
}));

// Helper function to apply custom colors to CSS custom properties
const applyCustomColors = (colors: ThemeState['customColors']) => {
  const root = document.documentElement;
  
  // Convert hex colors to RGB for rgba usage
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  const accentPrimaryRgb = hexToRgb(colors.accentPrimary);
  
  // Set CSS custom properties
  root.style.setProperty('--bg-primary', colors.bgPrimary);
  root.style.setProperty('--bg-secondary', colors.bgSecondary);
  root.style.setProperty('--text-primary', colors.textPrimary);
  root.style.setProperty('--text-secondary', colors.textSecondary);
  root.style.setProperty('--border-color', colors.borderColor);
  root.style.setProperty('--accent-primary', colors.accentPrimary);
  root.style.setProperty('--accent-secondary', colors.accentSecondary);
  
  // Set RGB values for rgba usage in liquid glass effects
  if (accentPrimaryRgb) {
    root.style.setProperty('--accent-primary-rgb', `${accentPrimaryRgb.r}, ${accentPrimaryRgb.g}, ${accentPrimaryRgb.b}`);
  }
  
  console.log('Custom colors applied to CSS:', colors);
};
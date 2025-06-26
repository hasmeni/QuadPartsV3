import { create } from 'zustand';

const STORAGE_KEY = 'quadparts_settings';

interface Settings {
  lowStockThreshold: number;
  defaultCategory: string;
  currencyFormat: string;
  backupLocation: string;
  enableAutoBackup: boolean;
  autoBackupFrequency: string;
}

interface SettingsState {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

// Default settings
const defaultSettings: Settings = {
  lowStockThreshold: 3,
  defaultCategory: 'Uncategorized',
  currencyFormat: 'USD',
  backupLocation: 'Downloads',
  enableAutoBackup: true,
  autoBackupFrequency: '7',
};

// Load saved settings from localStorage
const loadSavedSettings = (): Settings => {
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Error loading settings from localStorage:', error);
  }
  return defaultSettings;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: loadSavedSettings(),
  
  updateSettings: (newSettings) => {
    set((state) => {
      const updatedSettings = { ...state.settings, ...newSettings };
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
      return { settings: updatedSettings };
    });
  },
})); 
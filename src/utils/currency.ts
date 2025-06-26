import { useSettingsStore } from '../store/settingsStore';

// Get currency symbol based on currency code
export const getCurrencySymbol = (currencyCode: string): string => {
  const symbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$',
  };
  return symbols[currencyCode] || '$';
};

// Format currency using the settings store
export const formatCurrency = (value: number, currencyCode?: string): string => {
  const { settings } = useSettingsStore.getState();
  const currency = currencyCode || settings.currencyFormat;
  
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currency 
  }).format(value);
};

// Get currency display text (e.g., "USD ($)")
export const getCurrencyDisplay = (currencyCode?: string): string => {
  const { settings } = useSettingsStore.getState();
  const currency = currencyCode || settings.currencyFormat;
  const symbol = getCurrencySymbol(currency);
  
  return `${currency} (${symbol})`;
}; 
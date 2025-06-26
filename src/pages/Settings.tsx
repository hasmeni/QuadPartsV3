import React, { useState } from 'react';
import { useToaster } from '../components/ui/Toaster';
import { useThemeStore } from '../store/themeStore';
import { useInventoryStore } from '../store/inventoryStore';
import { useStorageLocationStore } from '../store/storageLocationStore';
import { useBuildStore } from '../store/buildStore';
import { useGalleryStore } from '../store/galleryStore';
import { useLinkStore } from '../store/linkStore';
import { useTodoStore } from '../store/todoStore';
import { useSettingsStore } from '../store/settingsStore';
import { Download, Upload, AlertTriangle } from 'lucide-react';

const Settings: React.FC = () => {
  const { addToast } = useToaster();
  const { theme, setTheme } = useThemeStore();
  const { settings, updateSettings } = useSettingsStore();
  
  // Get all current data from stores
  const { parts, categories } = useInventoryStore();
  const { locations } = useStorageLocationStore();
  const { builds } = useBuildStore();
  const { items: galleryItems } = useGalleryStore();
  const { links } = useLinkStore();
  const { todos } = useTodoStore();
  
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name === 'theme') {
      console.log('Theme change requested:', value);
      console.log('Current theme before change:', theme);
      
      // Handle theme change immediately
      setTheme(value);
      
      console.log('Theme change completed. New theme:', value);
      console.log('Document data-theme attribute:', document.documentElement.getAttribute('data-theme'));
      
      addToast('success', `Theme changed to ${value.charAt(0).toUpperCase() + value.slice(1)}`);
      return;
    }
    
    // Update settings in the store
    updateSettings({
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // Settings are already saved in the store when changed
    addToast('success', 'Settings saved successfully');
  };
  
  // Create comprehensive backup data with all current state
  const createBackupData = () => {
    const backupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      appInfo: {
        name: 'Drone Parts Inventory',
        version: '1.0.0',
        description: 'Complete backup of all inventory data'
      },
      data: {
        // Inventory data
        parts: parts || [],
        categories: categories || [],
        
        // Storage locations
        storageLocations: locations || [],
        
        // Build notes
        builds: builds || [],
        
        // Gallery items
        galleryItems: galleryItems || [],
        
        // Links
        links: links || [],
        
        // Todo items
        todos: todos || [],
        
        // Application settings
        settings: {
          theme: theme || 'dark',
          ...settings
        },
        
        // Metadata
        metadata: {
          totalParts: parts?.length || 0,
          totalCategories: categories?.length || 0,
          totalLocations: locations?.length || 0,
          totalBuilds: builds?.length || 0,
          totalGalleryItems: galleryItems?.length || 0,
          totalLinks: links?.length || 0,
          totalTodos: todos?.length || 0,
          exportDate: new Date().toISOString(),
          exportedBy: 'QuadParts Inventory System'
        }
      }
    };
    
    return backupData;
  };
  
  // Enhanced backup download with multiple methods
  const handleBackupData = async () => {
    setBackupInProgress(true);
    
    try {
      const backupData = createBackupData();
      const dataStr = JSON.stringify(backupData, null, 2);
      
      // Create filename with current date and time
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS format
      const filename = `quadparts-backup-${dateStr}-${timeStr}.json`;
      
      console.log('Backup data size:', dataStr.length, 'characters');
      console.log('Filename:', filename);
      
      // Method 1: Try using the modern File System Access API if available
      if ('showSaveFilePicker' in window) {
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: filename,
            types: [{
              description: 'JSON backup files',
              accept: { 'application/json': ['.json'] }
            }]
          });
          
          const writable = await fileHandle.createWritable();
          await writable.write(dataStr);
          await writable.close();
          
          setBackupInProgress(false);
          addToast('success', `Backup saved successfully as "${filename}"!`);
          return;
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            console.log('File System Access API failed:', err);
          }
          // User cancelled or API failed, fall back to traditional method
        }
      }
      
      // Method 2: Traditional blob download method
      const dataBlob = new Blob([dataStr], { 
        type: 'application/json;charset=utf-8' 
      });
      
      // Create download URL
      const url = URL.createObjectURL(dataBlob);
      
      // Create and trigger download link
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = filename;
      downloadLink.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up the URL object
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      setBackupInProgress(false);
      addToast('success', `Backup file "${filename}" downloaded successfully!`);
      
    } catch (error) {
      console.error('Backup error:', error);
      setBackupInProgress(false);
      addToast('error', 'Failed to create backup. Please try again or check your browser settings.');
    }
  };
  
  // Alternative backup method using data URI
  const handleBackupDataAlternative = () => {
    setBackupInProgress(true);
    
    try {
      const backupData = createBackupData();
      const dataStr = JSON.stringify(backupData, null, 2);
      
      // Create filename
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `quadparts-backup-${dateStr}-${timeStr}.json`;
      
      // Create data URI
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      // Create and trigger download
      const link = document.createElement('a');
      link.setAttribute('href', dataUri);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        setBackupInProgress(false);
        addToast('success', `Backup file "${filename}" downloaded successfully!`);
      }, 500);
      
    } catch (error) {
      console.error('Alternative backup error:', error);
      setBackupInProgress(false);
      addToast('error', 'Failed to create backup. Please try again.');
    }
  };
  
  // Handle file selection for restore
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        addToast('error', 'Please select a valid JSON backup file');
        e.target.value = ''; // Clear the input
        return;
      }
      setSelectedFile(file);
      setShowRestoreConfirm(true);
    }
  };
  
  // Enhanced backup data validation
  const validateBackupData = (data: any): boolean => {
    console.log('Validating backup data:', data);
    
    if (!data || typeof data !== 'object') {
      console.error('Invalid backup data: not an object');
      return false;
    }
    
    // Handle different backup formats from earlier iterations
    let dataToValidate = data;
    
    // If it's the new format with version, timestamp, and data wrapper
    if (data.version && data.timestamp && data.data) {
      dataToValidate = data.data;
      console.log('Detected new backup format');
    } else if (Array.isArray(data.parts) || Array.isArray(data.categories)) {
      // If it's an older format with direct data arrays
      dataToValidate = data;
      console.log('Detected older backup format');
    } else {
      console.error('Invalid backup data: unrecognized format');
      return false;
    }
    
    // Check for at least some valid data arrays (more flexible validation)
    const validFields = ['parts', 'categories', 'storageLocations', 'builds', 'galleryItems', 'links', 'todos'];
    const hasValidData = validFields.some(field => Array.isArray(dataToValidate[field]) && dataToValidate[field].length > 0);
    
    if (!hasValidData) {
      console.error('Invalid backup data: no valid data arrays found');
      return false;
    }
    
    console.log('Backup data validation passed');
    return true;
  };
  
  // Enhanced restore data functionality with backward compatibility
  const handleRestoreData = async () => {
    if (!selectedFile) {
      addToast('error', 'No file selected');
      return;
    }
    
    setRestoreInProgress(true);
    
    try {
      const fileContent = await selectedFile.text();
      console.log('File content length:', fileContent.length);
      
      const backupData = JSON.parse(fileContent);
      console.log('Parsed backup data structure:', {
        hasVersion: !!backupData.version,
        hasTimestamp: !!backupData.timestamp,
        hasData: !!backupData.data,
        hasParts: !!backupData.parts,
        hasCategories: !!backupData.categories,
        hasSettings: !!backupData.settings,
        keys: Object.keys(backupData)
      });
      
      // Validate backup data
      if (!validateBackupData(backupData)) {
        throw new Error('Invalid backup file format or corrupted data');
      }
      
      // Determine the data structure based on backup format
      let dataToRestore = backupData;
      let settingsToRestore = null;
      
      // If it's the new format with version, timestamp, and data wrapper
      if (backupData.version && backupData.timestamp && backupData.data) {
        dataToRestore = backupData.data;
        settingsToRestore = backupData.data.settings;
        console.log('Processing new backup format (v1.0.0+)');
      } else {
        // If it's an older format, check for settings at the root level
        settingsToRestore = backupData.settings;
        console.log('Processing legacy backup format');
      }
      
      // Restore data to localStorage with proper keys
      const restoreDataArray = (data: any[], key: string) => {
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(key, JSON.stringify(data));
          console.log(`Restored ${key}:`, data.length, 'items');
          return data.length;
        }
        return 0;
      };
      
      // Restore all data types
      const restoredCounts = {
        parts: restoreDataArray(dataToRestore.parts, 'droneParts'),
        categories: restoreDataArray(dataToRestore.categories, 'droneCategories'),
        storageLocations: restoreDataArray(dataToRestore.storageLocations, 'storageLocations'),
        builds: restoreDataArray(dataToRestore.builds, 'droneBuilds'),
        galleryItems: restoreDataArray(dataToRestore.galleryItems, 'galleryItems'),
        links: restoreDataArray(dataToRestore.links, 'droneLinks'),
        todos: restoreDataArray(dataToRestore.todos, 'droneTodos')
      };
      
      // Handle theme restoration with backward compatibility
      if (settingsToRestore?.theme) {
        const themeToRestore = settingsToRestore.theme;
        console.log('Attempting to restore theme:', themeToRestore);
        
        // Map old theme names to new ones for compatibility
        const themeMapping: { [key: string]: string } = {
          'midnight-blue': 'midnight',
          'midnightBlue': 'midnight',
          'black-orange': 'blackOrange',
          'blackOrange': 'blackOrange',
          'matrix-green': 'matrix',
          'matrixGreen': 'matrix',
          'midnight': 'midnight', // Handle case where it was already correct
          'dark': 'dark',
          'light': 'light',
          'cyberpunk': 'cyberpunk',
          'matrix': 'matrix'
        };
        
        const mappedTheme = themeMapping[themeToRestore] || themeToRestore;
        
        // Validate that the theme exists in current version
        const validThemes = ['dark', 'light', 'midnight', 'cyberpunk', 'matrix', 'blackOrange', 'sunset', 'summer'];
        
        if (validThemes.includes(mappedTheme)) {
          localStorage.setItem('theme', mappedTheme);
          setTheme(mappedTheme);
          console.log('Successfully restored theme:', mappedTheme);
        } else {
          console.warn('Unknown theme in backup, using default:', mappedTheme);
          localStorage.setItem('theme', 'dark');
          setTheme('dark');
        }
      } else {
        console.log('No theme found in backup, keeping current theme');
      }
      
      // Restore other settings if available
      if (settingsToRestore) {
        // Filter out theme from settings to avoid conflicts
        const { theme, ...otherSettings } = settingsToRestore;
        if (Object.keys(otherSettings).length > 0) {
          updateSettings(otherSettings);
          console.log('Restored additional settings:', otherSettings);
        }
      }
      
      // Validate and fix image links in restored data
      const fixImageLinks = (items: any[], itemType: string) => {
        if (!Array.isArray(items)) return;
        
        let fixedCount = 0;
        items.forEach((item, index) => {
          if (item.imageUrl && typeof item.imageUrl === 'string') {
            // Ensure image URLs are properly formatted
            if (!item.imageUrl.startsWith('http') && !item.imageUrl.startsWith('data:')) {
              console.warn(`Fixing image URL in ${itemType}[${index}]:`, item.imageUrl);
              // If it's a relative path, make it absolute or remove it
              if (item.imageUrl.startsWith('/')) {
                item.imageUrl = window.location.origin + item.imageUrl;
                fixedCount++;
              } else {
                // Remove invalid image URLs
                delete item.imageUrl;
                fixedCount++;
              }
            }
          }
        });
        if (fixedCount > 0) {
          console.log(`Fixed ${fixedCount} image URLs in ${itemType}`);
        }
      };
      
      // Migrate and fix part data structure for compatibility
      const migratePartData = (items: any[], itemType: string) => {
        if (!Array.isArray(items)) return;
        
        let migratedCount = 0;
        items.forEach((item, index) => {
          if (itemType === 'parts') {
            // Ensure all required fields exist with proper defaults
            const migratedItem = {
              ...item,
              id: item.id || `migrated-${Date.now()}-${index}`,
              name: item.name || 'Unnamed Part',
              category: item.category || 'Uncategorized',
              subcategory: item.subcategory || '',
              quantity: typeof item.quantity === 'number' ? item.quantity : 1,
              price: typeof item.price === 'number' ? item.price : 0,
              location: item.location || '',
              description: item.description || '',
              imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : 
                        (item.imageUrl ? [item.imageUrl] : ['https://images.unsplash.com/photo-1579829215132-9b20155a2c7c?q=80&w=300']),
              manufacturer: item.manufacturer || '',
              modelNumber: item.modelNumber || '',
              notes: item.notes || '',
              inUse: typeof item.inUse === 'number' ? item.inUse : 0,
              status: item.status || 'in-stock',
              condition: item.condition || 'new',
              dateAdded: item.dateAdded || new Date().toISOString(),
              lastModified: item.lastModified || ''
            };
            
            // Replace the original item with migrated version
            items[index] = migratedItem;
            migratedCount++;
          }
        });
        if (migratedCount > 0) {
          console.log(`Migrated ${migratedCount} ${itemType} for compatibility`);
        }
      };
      
      // Fix image links in all data types that might have images
      if (dataToRestore.parts) {
        fixImageLinks(dataToRestore.parts, 'parts');
        migratePartData(dataToRestore.parts, 'parts');
      }
      if (dataToRestore.galleryItems) fixImageLinks(dataToRestore.galleryItems, 'galleryItems');
      if (dataToRestore.builds) fixImageLinks(dataToRestore.builds, 'builds');
      
      setTimeout(() => {
        setRestoreInProgress(false);
        setShowRestoreConfirm(false);
        setSelectedFile(null);
        
        // Clear the file input
        const fileInput = document.getElementById('restore-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        // Show detailed restore summary
        const totalRestored = Object.values(restoredCounts).reduce((sum, count) => sum + count, 0);
        const restoreSummary = Object.entries(restoredCounts)
          .filter(([_, count]) => count > 0)
          .map(([type, count]) => `${count} ${type}`)
          .join(', ');
        
        addToast('success', `Data restored successfully! Restored: ${restoreSummary} (${totalRestored} total items).`);
        
        // Show manual refresh option instead of automatic refresh
        setTimeout(() => {
          const shouldRefresh = window.confirm(
            'Data has been restored successfully!\n\n' +
            'To see your restored data, you need to refresh the page.\n\n' +
            'Would you like to refresh the page now?\n\n' +
            'Note: If you experience any issues after refresh, you can use the "Clear Data & Reload" option in the error screen.'
          );
          
          if (shouldRefresh) {
            // Add a small delay to ensure all data is properly saved
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }
        }, 1000);
      }, 2000);
      
    } catch (error) {
      console.error('Restore error:', error);
      setRestoreInProgress(false);
      addToast('error', `Failed to restore data: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your backup file and try again.`);
    }
  };
  
  // Calculate total items for backup info
  const getTotalItems = () => {
    return (parts?.length || 0) + 
           (categories?.length || 0) + 
           (locations?.length || 0) + 
           (builds?.length || 0) + 
           (galleryItems?.length || 0) + 
           (links?.length || 0) + 
           (todos?.length || 0);
  };
  
  return (
    <div className="relative min-h-screen">
      {/* Background Video */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <iframe
          src="https://www.youtube.com/embed/ORWrf5w4yS0?autoplay=1&mute=1&loop=1&playlist=ORWrf5w4yS0&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=window.location.origin"
          title="Settings Background Video"
          className="absolute top-0 left-0 w-full h-full min-w-full min-h-full object-cover pointer-events-none"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        {/* Video Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 space-y-6 animate-fade-in max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-neutral-200">Settings</h2>
        
        <div className="liquid-glass rounded-lg p-6 border border-white/10 backdrop-blur-sm">
          <h3 className="text-lg font-medium text-white mb-4">Application Settings</h3>
          
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-neutral-300 mb-1">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  min="0"
                  value={settings.lowStockThreshold}
                  onChange={handleSettingChange}
                  className="w-full px-3 py-2 liquid-glass border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 backdrop-blur-sm transition-all duration-300"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Items with quantity below or equal to this threshold will show as "Low Stock"
                </p>
              </div>
              
              <div>
                <label htmlFor="defaultCategory" className="block text-sm font-medium text-neutral-300 mb-1">
                  Default Category
                </label>
                <input
                  type="text"
                  id="defaultCategory"
                  name="defaultCategory"
                  value={settings.defaultCategory}
                  onChange={handleSettingChange}
                  className="w-full px-3 py-2 liquid-glass border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 backdrop-blur-sm transition-all duration-300"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Default category for new parts
                </p>
              </div>
              
              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-neutral-300 mb-1">
                  Application Theme
                </label>
                <select
                  id="theme"
                  name="theme"
                  value={theme}
                  onChange={handleSettingChange}
                  className="w-full px-3 py-2 liquid-glass border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 backdrop-blur-sm transition-all duration-300"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="midnight">Midnight Forest</option>
                  <option value="cyberpunk">Cyberpunk</option>
                  <option value="matrix">Matrix Green</option>
                  <option value="blackOrange">Black & Orange</option>
                  <option value="sunset">Sunset</option>
                  <option value="summer">Summer</option>
                </select>
                <p className="text-xs text-neutral-500 mt-1">
                  Current theme: {theme} | Document attribute: {document.documentElement.getAttribute('data-theme')}
                </p>
              </div>
              
              <div>
                <label htmlFor="currencyFormat" className="block text-sm font-medium text-neutral-300 mb-1">
                  Currency Format
                </label>
                <select
                  id="currencyFormat"
                  name="currencyFormat"
                  value={settings.currencyFormat}
                  onChange={handleSettingChange}
                  className="w-full px-3 py-2 liquid-glass border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 backdrop-blur-sm transition-all duration-300"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 liquid-glass border border-white/20 text-white rounded-lg transition-all duration-300 hover:border-white/30 backdrop-blur-sm hover:shadow-lg"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
        
        <div className="liquid-glass rounded-lg p-6 border border-white/10 backdrop-blur-sm">
          <h3 className="text-lg font-medium text-white mb-4">Data Management</h3>
          
          <div className="space-y-6">
            {/* Backup Section */}
            <div>
              <h4 className="text-md font-medium text-neutral-300 mb-2">Backup Data</h4>
              <p className="text-neutral-400 text-sm mb-4">
                Download a complete backup of your inventory data including parts, categories, storage locations, builds, gallery items, links, and todos.
              </p>
              
              <div className="liquid-glass border border-white/20 rounded-lg p-4 mb-4 backdrop-blur-sm">
                <h5 className="text-sm font-medium text-neutral-300 mb-2">Current Data Summary:</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-400">Parts:</span>
                    <span className="text-white ml-2">{parts?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Categories:</span>
                    <span className="text-white ml-2">{categories?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Locations:</span>
                    <span className="text-white ml-2">{locations?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Builds:</span>
                    <span className="text-white ml-2">{builds?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Gallery:</span>
                    <span className="text-white ml-2">{galleryItems?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Links:</span>
                    <span className="text-white ml-2">{links?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Todos:</span>
                    <span className="text-white ml-2">{todos?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Total:</span>
                    <span className="text-white ml-2 font-medium">{getTotalItems()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleBackupData}
                  disabled={backupInProgress}
                  className="flex items-center gap-2 px-4 py-2 liquid-glass border border-white/20 text-white rounded-lg transition-all duration-300 hover:border-white/30 backdrop-blur-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={16} />
                  {backupInProgress ? 'Creating Backup...' : 'Download Backup'}
                </button>
                
                <button
                  onClick={handleBackupDataAlternative}
                  disabled={backupInProgress}
                  className="flex items-center gap-2 px-4 py-2 liquid-glass border border-white/20 text-white rounded-lg transition-all duration-300 hover:border-white/30 backdrop-blur-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Download size={14} />
                  {backupInProgress ? 'Creating...' : 'Alternative Download'}
                </button>
              </div>
              
              <p className="text-xs text-neutral-500 mt-2">
                If the main download doesn't work, try the alternative download method or check your browser's download settings.
              </p>
            </div>
            
            {/* Restore Section */}
            <div className="border-t border-white/20 pt-6">
              <h4 className="text-md font-medium text-neutral-300 mb-2">Restore Data</h4>
              <p className="text-neutral-400 text-sm mb-4">
                Restore your inventory data from a previously downloaded backup file. This will replace all current data.
              </p>
              
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="file"
                  id="restore-file"
                  accept=".json,application/json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="restore-file"
                  className="flex items-center gap-2 px-4 py-2 liquid-glass border border-white/20 text-white rounded-lg transition-all duration-300 hover:border-white/30 backdrop-blur-sm hover:shadow-lg cursor-pointer"
                >
                  <Upload size={16} />
                  Choose Backup File
                </label>
                
                {selectedFile && (
                  <div className="text-sm text-neutral-300">
                    Selected: {selectedFile.name}
                  </div>
                )}
              </div>
              
              <div className="liquid-glass border border-yellow-500/30 rounded-lg p-3 mb-4 backdrop-blur-sm">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="text-yellow-400 text-sm">
                    <strong>Warning:</strong> Restoring data will completely replace all your current inventory data including parts, categories, storage locations, builds, gallery items, links, and todos. This action cannot be undone.
                  </div>
                </div>
              </div>
            </div>
            
            {/* Clear Data Section */}
            <div className="border-t border-white/20 pt-6">
              <h4 className="text-md font-medium text-red-400">Danger Zone</h4>
              <p className="text-neutral-400 text-sm mb-4">
                Permanently delete all inventory data. This action cannot be undone.
              </p>
              <button
                onClick={() => {
                  addToast('error', 'This feature is disabled in the demo version');
                }}
                className="px-4 py-2 liquid-glass border border-red-500/30 text-red-400 rounded-lg transition-all duration-300 hover:border-red-500/50 backdrop-blur-sm hover:shadow-lg"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
        
        <div className="liquid-glass rounded-lg p-6 border border-white/10 backdrop-blur-sm">
          <h3 className="text-lg font-medium text-white mb-4">Theme Debug Info</h3>
          <div className="space-y-2 text-sm">
            <div>Current theme from store: <span className="text-primary-400">{theme}</span></div>
            <div>Document data-theme: <span className="text-primary-400">{document.documentElement.getAttribute('data-theme')}</span></div>
            <div>localStorage theme: <span className="text-primary-400">{localStorage.getItem('theme')}</span></div>
            <div>CSS Variables:</div>
            <div className="ml-4">
              <div>--bg-primary: <span className="text-primary-400">{getComputedStyle(document.documentElement).getPropertyValue('--bg-primary')}</span></div>
              <div>--text-primary: <span className="text-primary-400">{getComputedStyle(document.documentElement).getPropertyValue('--text-primary')}</span></div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="font-medium text-neutral-300 mb-2">Backup Compatibility Info:</div>
              <div className="text-xs space-y-1">
                <div>• Supports legacy backup formats (direct arrays)</div>
                <div>• Supports new backup format (v1.0.0+ with wrapper)</div>
                <div>• Theme mapping: midnight-blue → midnight, black-orange → blackOrange</div>
                <div>• Image URL validation and fixing</div>
                <div>• Flexible validation (doesn't require all fields)</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <h4 className="text-md font-medium text-neutral-300">Test Theme Switching:</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTheme('dark')}
                className="px-3 py-1 liquid-glass border border-white/20 text-white rounded text-sm transition-all duration-300 hover:border-white/30 backdrop-blur-sm hover:shadow-lg"
              >
                Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                className="px-3 py-1 liquid-glass border border-white/20 text-white rounded text-sm transition-all duration-300 hover:border-white/30 backdrop-blur-sm hover:shadow-lg"
              >
                Light
              </button>
              <button
                onClick={() => setTheme('cyberpunk')}
                className="px-3 py-1 liquid-glass border border-white/20 text-white rounded text-sm transition-all duration-300 hover:border-white/30 backdrop-blur-sm hover:shadow-lg"
              >
                Cyberpunk
              </button>
              <button
                onClick={() => setTheme('matrix')}
                className="px-3 py-1 liquid-glass border border-white/20 text-white rounded text-sm transition-all duration-300 hover:border-white/30 backdrop-blur-sm hover:shadow-lg"
              >
                Matrix
              </button>
              <button
                onClick={() => setTheme('sunset')}
                className="px-3 py-1 liquid-glass border border-white/20 text-white rounded text-sm transition-all duration-300 hover:border-white/30 backdrop-blur-sm hover:shadow-lg"
              >
                Sunset
              </button>
              <button
                onClick={() => setTheme('summer')}
                className="px-3 py-1 liquid-glass border border-white/20 text-white rounded text-sm transition-all duration-300 hover:border-white/30 backdrop-blur-sm hover:shadow-lg"
              >
                Summer
              </button>
            </div>
          </div>
        </div>
        
        {/* Restore Confirmation Modal */}
        {showRestoreConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="liquid-glass p-6 rounded-lg shadow-xl w-full max-w-md animate-fade-in border border-white/10 backdrop-blur-sm">
              <h3 className="text-lg font-medium text-white mb-4">Confirm Data Restore</h3>
              
              <div className="liquid-glass border border-yellow-500/30 rounded-lg p-3 mb-4 backdrop-blur-sm">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="text-yellow-400 text-sm">
                    This will replace all your current data with the backup file. Make sure you have a current backup if you want to keep your existing data.
                  </div>
                </div>
              </div>
              
              {selectedFile && (
                <div className="liquid-glass border border-white/20 rounded-lg p-3 mb-4 backdrop-blur-sm">
                  <div className="text-sm">
                    <div className="text-neutral-400">File:</div>
                    <div className="text-white font-medium">{selectedFile.name}</div>
                    <div className="text-neutral-400 mt-1">Size:</div>
                    <div className="text-white">{(selectedFile.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRestoreConfirm(false);
                    setSelectedFile(null);
                    // Clear the file input
                    const fileInput = document.getElementById('restore-file') as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                  }}
                  disabled={restoreInProgress}
                  className="px-4 py-2 liquid-glass border border-white/20 rounded-lg text-white transition-all duration-300 hover:border-white/30 backdrop-blur-sm hover:shadow-lg disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestoreData}
                  disabled={restoreInProgress}
                  className="px-4 py-2 liquid-glass border border-red-500/30 text-red-400 rounded-lg transition-all duration-300 hover:border-red-500/50 backdrop-blur-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {restoreInProgress ? 'Restoring...' : 'Restore Data'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
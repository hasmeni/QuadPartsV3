import React, { useState } from 'react';
import { useToaster } from '../components/ui/Toaster';
import { useThemeStore } from '../store/themeStore';
import { useInventoryStore } from '../store/inventoryStore';
import { useStorageLocationStore } from '../store/storageLocationStore';
import { useBuildStore } from '../store/buildStore';
import { useGalleryStore } from '../store/galleryStore';
import { useLinkStore } from '../store/linkStore';
import { useTodoStore } from '../store/todoStore';
import { useFlightLogStore } from '../store/flightLogStore';
import { useSettingsStore } from '../store/settingsStore';
import ColorPicker from '../components/ColorPicker';
import { Download, Upload, AlertTriangle } from 'lucide-react';

const Settings: React.FC = () => {
  const { addToast } = useToaster();
  const { theme, setTheme, customColors, setCustomColors } = useThemeStore();
  const { settings, updateSettings } = useSettingsStore();
  
  // Get all current data from stores
  const { parts, categories } = useInventoryStore();
  const { locations } = useStorageLocationStore();
  const { builds } = useBuildStore();
  const { items: galleryItems, addItem: addGalleryItem } = useGalleryStore();
  const { links, addLink } = useLinkStore();
  const { todos, addTodo } = useTodoStore();
  const { flightLogs, addFlightLog } = useFlightLogStore();
  
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCustomColors, setShowCustomColors] = useState(theme === 'custom');
  
  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name === 'theme') {
      console.log('Theme change requested:', value);
      console.log('Current theme before change:', theme);
      
      // Handle theme change immediately
      setTheme(value);
      
      // Show/hide custom color pickers
      setShowCustomColors(value === 'custom');
      
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
  
  const handleCustomColorChange = (colorKey: keyof typeof customColors, value: string) => {
    setCustomColors({ [colorKey]: value });
    addToast('success', `${colorKey} color updated`);
  };
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // Settings are already saved in the store when changed
    addToast('success', 'Settings saved successfully');
  };
  
  // Create comprehensive backup data with all current state
  const createBackupData = () => {
    // Helper function to get data from localStorage for backward compatibility
    const getDataFromStorage = (key: string, defaultValue: any[] = []) => {
      try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultValue;
      } catch (error) {
        console.error(`Error reading ${key} from localStorage:`, error);
        return defaultValue;
      }
    };

    // Helper function to check multiple possible keys for backward compatibility
    const getDataFromMultipleKeys = (keys: string[], defaultValue: any[] = []) => {
      for (const key of keys) {
        try {
          const saved = localStorage.getItem(key);
          if (saved) {
            const data = JSON.parse(saved);
            if (Array.isArray(data) && data.length > 0) {
              console.log(`Found data in ${key}:`, data.length, 'items');
              return data;
            }
            // Handle case where data might be wrapped in an object
            if (typeof data === 'object' && data !== null) {
              // Check for common property names
              const possibleArrays = ['items', 'galleryItems', 'builds', 'links', 'todos', 'data'];
              for (const prop of possibleArrays) {
                if (Array.isArray(data[prop]) && data[prop].length > 0) {
                  console.log(`Found data in ${key}.${prop}:`, data[prop].length, 'items');
                  return data[prop];
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error reading ${key} from localStorage:`, error);
        }
      }
      return defaultValue;
    };

    // Get data from both stores and localStorage for maximum compatibility
    const galleryData = galleryItems?.length > 0 ? galleryItems : getDataFromMultipleKeys(['quadparts_gallery_data', 'galleryItems', 'gallery']);
    const buildsData = builds?.length > 0 ? builds : getDataFromMultipleKeys(['quadparts_builds_data', 'builds', 'buildNotes', 'build-notes', 'droneBuilds']);
    const linksData = links?.length > 0 ? links : getDataFromMultipleKeys(['quadparts_links_data', 'links', 'bookmarks']);
    const todosData = todos?.length > 0 ? todos : getDataFromMultipleKeys(['quadparts_todos_data', 'todos', 'todo', 'tasks']);

    // Debug logging to help identify data sources
    console.log('Export data sources:', {
      galleryFromStore: galleryItems?.length || 0,
      galleryFromStorage: getDataFromMultipleKeys(['quadparts_gallery_data', 'galleryItems', 'gallery']).length,
      buildsFromStore: builds?.length || 0,
      buildsFromStorage: getDataFromMultipleKeys(['quadparts_builds_data', 'builds', 'buildNotes', 'build-notes', 'droneBuilds']).length,
      linksFromStore: links?.length || 0,
      linksFromStorage: getDataFromMultipleKeys(['quadparts_links_data', 'links', 'bookmarks']).length,
      todosFromStore: todos?.length || 0,
      todosFromStorage: getDataFromMultipleKeys(['quadparts_todos_data', 'todos', 'todo', 'tasks']).length
    });

    // Additional debug info for build notes specifically
    console.log('Build notes debug info:', {
      buildsFromStore: builds,
      buildsFromStorageKeys: ['quadparts_builds_data', 'builds', 'buildNotes', 'build-notes', 'droneBuilds'],
      finalBuildsData: buildsData,
      buildsDataLength: buildsData?.length || 0
    });

    // Additional debug info for links specifically
    console.log('Links debug info:', {
      linksFromStore: links,
      linksFromStorageKeys: ['quadparts_links_data', 'links', 'bookmarks'],
      finalLinksData: linksData,
      linksDataLength: linksData?.length || 0
    });

    // Additional debug info for todos specifically
    console.log('Todos debug info:', {
      todosFromStore: todos,
      todosFromStorageKeys: ['quadparts_todos_data', 'todos', 'todo', 'tasks'],
      finalTodosData: todosData,
      todosDataLength: todosData?.length || 0
    });

    // Additional debug info for gallery specifically
    console.log('Gallery debug info:', {
      galleryFromStore: galleryItems,
      galleryFromStorageKeys: ['quadparts_gallery_data', 'galleryItems', 'gallery'],
      finalGalleryData: galleryData,
      galleryDataLength: galleryData?.length || 0
    });

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
        builds: buildsData || [],
        
        // Gallery items
        galleryItems: galleryData || [],
        
        // Links
        links: linksData || [],
        
        // Todo items
        todos: todosData || [],
        
        // Flight logs
        flightLogs: flightLogs || [],
        
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
          totalBuilds: buildsData?.length || 0,
          totalGalleryItems: galleryData?.length || 0,
          totalLinks: linksData?.length || 0,
          totalTodos: todosData?.length || 0,
          totalFlightLogs: flightLogs?.length || 0,
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
    const validFields = ['parts', 'categories', 'storageLocations', 'builds', 'galleryItems', 'links', 'todos', 'flightLogs'];
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
        builds: restoreDataArray(dataToRestore.builds, 'quadparts_builds_data'),
        galleryItems: restoreDataArray(dataToRestore.galleryItems, 'quadparts_gallery_data'),
        links: restoreDataArray(dataToRestore.links, 'quadparts_links_data'),
        todos: restoreDataArray(dataToRestore.todos, 'quadparts_todos_data'),
        flightLogs: restoreDataArray(dataToRestore.flightLogs, 'flightLogs')
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
           (todos?.length || 0) + 
           (flightLogs?.length || 0);
  };

  // Debug function to check localStorage contents
  const debugLocalStorage = () => {
    console.log('=== LocalStorage Debug Info ===');
    const allKeys = Object.keys(localStorage);
    console.log('All localStorage keys:', allKeys);
    
    const relevantKeys = allKeys.filter(key => 
      key.includes('gallery') || 
      key.includes('build') || 
      key.includes('link') || 
      key.includes('todo') ||
      key.includes('quadparts')
    );
    
    console.log('Relevant localStorage keys:', relevantKeys);
    
    relevantKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          console.log(`${key}:`, {
            type: typeof parsed,
            isArray: Array.isArray(parsed),
            length: Array.isArray(parsed) ? parsed.length : 'N/A',
            keys: typeof parsed === 'object' && parsed !== null ? Object.keys(parsed) : 'N/A'
          });
        }
      } catch (error) {
        console.error(`Error parsing ${key}:`, error);
      }
    });
    
    console.log('=== End Debug Info ===');
  };

  // Function to migrate old build notes data
  const migrateBuildNotesData = () => {
    console.log('=== Migrating Build Notes Data ===');
    
    const oldKeys = ['builds', 'buildNotes', 'build-notes', 'droneBuilds'];
    const currentKey = 'quadparts_builds_data';
    
    // Check if current key already has data
    const currentData = localStorage.getItem(currentKey);
    if (currentData) {
      console.log('Current builds data already exists, skipping migration');
      return;
    }
    
    // Look for data in old keys
    for (const oldKey of oldKeys) {
      try {
        const oldData = localStorage.getItem(oldKey);
        if (oldData) {
          const parsed = JSON.parse(oldData);
          let builds;
          
          if (Array.isArray(parsed)) {
            builds = parsed;
          } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.builds)) {
            builds = parsed.builds;
          } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.data)) {
            builds = parsed.data;
          }
          
          if (builds && builds.length > 0) {
            // Migrate to current format
            const migratedData = { builds };
            localStorage.setItem(currentKey, JSON.stringify(migratedData));
            console.log(`Migrated ${builds.length} builds from ${oldKey} to ${currentKey}`);
            addToast('success', `Migrated ${builds.length} build notes from old storage`);
            return;
          }
        }
      } catch (error) {
        console.error(`Error migrating from ${oldKey}:`, error);
      }
    }
    
    console.log('No old build notes data found to migrate');
    addToast('info', 'No old build notes data found to migrate');
  };

  // Function to migrate old links data
  const migrateLinksData = () => {
    console.log('=== Migrating Links Data ===');
    
    const oldKeys = ['links', 'bookmarks', 'favorites', 'droneLinks'];
    const currentKey = 'quadparts_links_data';
    
    // Check if current key already has data
    const currentData = localStorage.getItem(currentKey);
    if (currentData) {
      console.log('Current links data already exists, skipping migration');
      return;
    }
    
    // Look for data in old keys
    for (const oldKey of oldKeys) {
      try {
        const oldData = localStorage.getItem(oldKey);
        if (oldData) {
          const parsed = JSON.parse(oldData);
          let links, customTags;
          
          if (Array.isArray(parsed)) {
            links = parsed;
            customTags = ['tutorial', 'review', 'education', 'guide', 'build'];
          } else if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed.links)) {
              links = parsed.links;
              customTags = parsed.customTags || ['tutorial', 'review', 'education', 'guide', 'build'];
            } else if (Array.isArray(parsed.data)) {
              links = parsed.data;
              customTags = parsed.customTags || ['tutorial', 'review', 'education', 'guide', 'build'];
            }
          }
          
          if (links && links.length > 0) {
            // Migrate to current format
            const migratedData = { links, customTags };
            localStorage.setItem(currentKey, JSON.stringify(migratedData));
            console.log(`Migrated ${links.length} links from ${oldKey} to ${currentKey}`);
            addToast('success', `Migrated ${links.length} links from old storage`);
            return;
          }
        }
      } catch (error) {
        console.error(`Error migrating from ${oldKey}:`, error);
      }
    }
    
    console.log('No old links data found to migrate');
    addToast('info', 'No old links data found to migrate');
  };

  // Function to migrate old todos data
  const migrateTodosData = () => {
    console.log('=== Migrating Todos Data ===');
    
    const oldKeys = ['todos', 'todo', 'tasks', 'droneTodos'];
    const currentKey = 'quadparts_todos_data';
    
    // Check if current key already has data
    const currentData = localStorage.getItem(currentKey);
    if (currentData) {
      console.log('Current todos data already exists, skipping migration');
      return;
    }
    
    // Look for data in old keys
    for (const oldKey of oldKeys) {
      try {
        const oldData = localStorage.getItem(oldKey);
        if (oldData) {
          const parsed = JSON.parse(oldData);
          let todos;
          
          if (Array.isArray(parsed)) {
            todos = parsed;
          } else if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed.todos)) {
              todos = parsed.todos;
            } else if (parsed && typeof parsed === 'object') {
              if (Array.isArray(parsed.data)) {
                todos = parsed.data;
              }
            }
          }
          
          if (todos && todos.length > 0) {
            // Migrate to current format
            const migratedData = { todos };
            localStorage.setItem(currentKey, JSON.stringify(migratedData));
            console.log(`Migrated ${todos.length} todos from ${oldKey} to ${currentKey}`);
            addToast('success', `Migrated ${todos.length} todos from old storage`);
            return;
          }
        }
      } catch (error) {
        console.error(`Error migrating from ${oldKey}:`, error);
      }
    }
    
    console.log('No old todos data found to migrate');
    addToast('info', 'No old todos data found to migrate');
  };

  // Function to migrate old gallery data
  const migrateGalleryData = () => {
    console.log('Starting gallery data migration...');
    
    // Check multiple possible keys for backward compatibility
    const possibleKeys = [
      'galleryItems',
      'quadparts_gallery_data',
      'gallery_data',
      'gallery'
    ];
    
    let migratedCount = 0;
    let totalFound = 0;
    
    possibleKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          console.log(`Found data in key "${key}":`, parsed);
          
          if (Array.isArray(parsed)) {
            totalFound += parsed.length;
            // Use the store's addItem method to add the data
            parsed.forEach((item: any) => {
              if (item && typeof item === 'object') {
                // Ensure the item has required fields
                const validItem = {
                  title: item.title || item.name || 'Untitled',
                  description: item.description || item.desc || '',
                  imageUrls: item.imageUrls || (item.imageUrl ? [item.imageUrl] : []),
                  tags: item.tags || [],
                  specs: item.specs || {}
                };
                addGalleryItem(validItem);
                migratedCount++;
              }
            });
            localStorage.removeItem(key);
            console.log(`Migrated ${parsed.length} items from key "${key}"`);
          } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.data)) {
            totalFound += parsed.data.length;
            parsed.data.forEach((item: any) => {
              if (item && typeof item === 'object') {
                const validItem = {
                  title: item.title || item.name || 'Untitled',
                  description: item.description || item.desc || '',
                  imageUrls: item.imageUrls || (item.imageUrl ? [item.imageUrl] : []),
                  tags: item.tags || [],
                  specs: item.specs || {}
                };
                addGalleryItem(validItem);
                migratedCount++;
              }
            });
            localStorage.removeItem(key);
            console.log(`Migrated ${parsed.data.length} items from key "${key}"`);
          }
        } catch (error) {
          console.error(`Error parsing data from key "${key}":`, error);
        }
      }
    });
    
    if (migratedCount > 0) {
      addToast('success', `Successfully migrated ${migratedCount} gallery items from old storage`);
      console.log(`Migration completed: ${migratedCount} items migrated out of ${totalFound} found`);
    } else {
      addToast('info', 'No old gallery data found to migrate');
      console.log('No gallery data found to migrate');
    }
  };

  const migrateFlightLogsData = () => {
    console.log('Starting flight logs data migration...');
    
    // Check multiple possible keys for backward compatibility
    const possibleKeys = [
      'quadparts_flight_logs',
      'flightLogs',
      'flight_logs',
      'flight-logs'
    ];
    
    let migratedCount = 0;
    let totalFound = 0;
    
    possibleKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          console.log(`Found data in key "${key}":`, parsed);
          
          if (Array.isArray(parsed)) {
            totalFound += parsed.length;
            // Use the store's addFlightLog method to add the data
            parsed.forEach((item: any) => {
              if (item && typeof item === 'object') {
                // Ensure the item has required fields
                const validItem = {
                  date: item.date || new Date().toISOString().split('T')[0],
                  drone: item.drone || 'Unknown Drone',
                  location: item.location || 'Unknown Location',
                  duration: item.duration || '',
                  notes: item.notes || '',
                  issues: item.issues || ''
                };
                addFlightLog(validItem);
                migratedCount++;
              }
            });
            localStorage.removeItem(key);
            console.log(`Migrated ${parsed.length} items from key "${key}"`);
          } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.data)) {
            totalFound += parsed.data.length;
            parsed.data.forEach((item: any) => {
              if (item && typeof item === 'object') {
                const validItem = {
                  date: item.date || new Date().toISOString().split('T')[0],
                  drone: item.drone || 'Unknown Drone',
                  location: item.location || 'Unknown Location',
                  duration: item.duration || '',
                  notes: item.notes || '',
                  issues: item.issues || ''
                };
                addFlightLog(validItem);
                migratedCount++;
              }
            });
            localStorage.removeItem(key);
            console.log(`Migrated ${parsed.data.length} items from key "${key}"`);
          }
        } catch (error) {
          console.error(`Error parsing data from key "${key}":`, error);
        }
      }
    });
    
    if (migratedCount > 0) {
      addToast('success', `Successfully migrated ${migratedCount} flight log entries from old storage`);
      console.log(`Migration completed: ${migratedCount} items migrated out of ${totalFound} found`);
    } else {
      addToast('info', 'No old flight logs data found to migrate');
      console.log('No flight logs data found to migrate');
    }
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
                  <option value="custom">Custom</option>
                </select>
                <p className="text-xs text-neutral-500 mt-1">
                  Current theme: {theme} | Document attribute: {document.documentElement.getAttribute('data-theme')}
                </p>
              </div>
              
              {/* Custom Color Picker Section */}
              {showCustomColors && (
                <div className="liquid-glass border border-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <h4 className="text-md font-medium text-neutral-300 mb-3">Custom Theme Colors</h4>
                  
                  {/* Preset Color Schemes */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Quick Presets</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setCustomColors({
                            bgPrimary: '#1a1a1a',
                            bgSecondary: '#2d2d2d',
                            textPrimary: '#ffffff',
                            textSecondary: '#b0b0b0',
                            borderColor: '#404040',
                            accentPrimary: '#3b82f6',
                            accentSecondary: '#10b981'
                          });
                          addToast('success', 'Applied Dark Blue preset');
                        }}
                        className="px-3 py-1 liquid-glass border border-white/20 text-white rounded text-sm transition-all duration-300 hover:border-white/30 backdrop-blur-sm hover:shadow-lg"
                      >
                        Dark Blue
                      </button>
                      <button
                        onClick={() => {
                          setCustomColors({
                            bgPrimary: '#2d1b3d',
                            bgSecondary: '#4a2c5a',
                            textPrimary: '#f4e4c1',
                            textSecondary: '#d4b483',
                            borderColor: '#c17817',
                            accentPrimary: '#ff6b35',
                            accentSecondary: '#f7931e'
                          });
                          addToast('success', 'Applied Sunset preset');
                        }}
                        className="px-3 py-1 liquid-glass border border-white/20 text-white rounded text-sm transition-all duration-300 hover:border-white/30 backdrop-blur-sm hover:shadow-lg"
                      >
                        Sunset
                      </button>
                      <button
                        onClick={() => {
                          setCustomColors({
                            bgPrimary: '#1a2f1a',
                            bgSecondary: '#2d4a2d',
                            textPrimary: '#e8f5e8',
                            textSecondary: '#b8d4b8',
                            borderColor: '#7a9c7a',
                            accentPrimary: '#4a7c59',
                            accentSecondary: '#8fbc8f'
                          });
                          addToast('success', 'Applied Forest preset');
                        }}
                        className="px-3 py-1 liquid-glass border border-white/20 text-white rounded text-sm transition-all duration-300 hover:border-white/30 backdrop-blur-sm hover:shadow-lg"
                      >
                        Forest
                      </button>
                      <button
                        onClick={() => {
                          setCustomColors({
                            bgPrimary: '#ff6b6b',
                            bgSecondary: '#4ecdc4',
                            textPrimary: '#2c3e50',
                            textSecondary: '#34495e',
                            borderColor: '#f39c12',
                            accentPrimary: '#e74c3c',
                            accentSecondary: '#f1c40f'
                          });
                          addToast('success', 'Applied Tropical preset');
                        }}
                        className="px-3 py-1 liquid-glass border border-white/20 text-white rounded text-sm transition-all duration-300 hover:border-white/30 backdrop-blur-sm hover:shadow-lg"
                      >
                        Tropical
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPicker
                      label="Background Primary"
                      value={customColors.bgPrimary}
                      onChange={(value) => handleCustomColorChange('bgPrimary', value)}
                    />
                    <ColorPicker
                      label="Background Secondary"
                      value={customColors.bgSecondary}
                      onChange={(value) => handleCustomColorChange('bgSecondary', value)}
                    />
                    <ColorPicker
                      label="Text Primary"
                      value={customColors.textPrimary}
                      onChange={(value) => handleCustomColorChange('textPrimary', value)}
                    />
                    <ColorPicker
                      label="Text Secondary"
                      value={customColors.textSecondary}
                      onChange={(value) => handleCustomColorChange('textSecondary', value)}
                    />
                    <ColorPicker
                      label="Border Color"
                      value={customColors.borderColor}
                      onChange={(value) => handleCustomColorChange('borderColor', value)}
                    />
                    <ColorPicker
                      label="Accent Primary"
                      value={customColors.accentPrimary}
                      onChange={(value) => handleCustomColorChange('accentPrimary', value)}
                    />
                    <ColorPicker
                      label="Accent Secondary"
                      value={customColors.accentSecondary}
                      onChange={(value) => handleCustomColorChange('accentSecondary', value)}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-3">
                    Changes are applied immediately. The liquid glass effect will use your accent colors.
                  </p>
                </div>
              )}
              
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
                    <span className="text-neutral-400">Flight Logs:</span>
                    <span className="text-white ml-2">{flightLogs?.length || 0}</span>
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

                <button
                  onClick={debugLocalStorage}
                  className="flex items-center gap-2 px-4 py-2 liquid-glass border border-blue-500/30 text-blue-400 rounded-lg transition-all duration-300 hover:border-blue-500/50 backdrop-blur-sm hover:shadow-lg text-sm"
                >
                  Debug Storage
                </button>

                <button
                  onClick={migrateBuildNotesData}
                  className="flex items-center gap-2 px-4 py-2 liquid-glass border border-green-500/30 text-green-400 rounded-lg transition-all duration-300 hover:border-green-500/50 backdrop-blur-sm hover:shadow-lg text-sm"
                >
                  Migrate Build Notes
                </button>

                <button
                  onClick={migrateLinksData}
                  className="flex items-center gap-2 px-4 py-2 liquid-glass border border-purple-500/30 text-purple-400 rounded-lg transition-all duration-300 hover:border-purple-500/50 backdrop-blur-sm hover:shadow-lg text-sm"
                >
                  Migrate Links
                </button>

                <button
                  onClick={migrateTodosData}
                  className="flex items-center gap-2 px-4 py-2 liquid-glass border border-pink-500/30 text-pink-400 rounded-lg transition-all duration-300 hover:border-pink-500/50 backdrop-blur-sm hover:shadow-lg text-sm"
                >
                  Migrate Todos
                </button>

                <button
                  onClick={migrateGalleryData}
                  className="flex items-center gap-2 px-4 py-2 liquid-glass border border-teal-500/30 text-teal-400 rounded-lg transition-all duration-300 hover:border-teal-500/50 backdrop-blur-sm hover:shadow-lg text-sm"
                >
                  Migrate Gallery
                </button>

                <button
                  onClick={migrateFlightLogsData}
                  className="flex items-center gap-2 px-4 py-2 liquid-glass border border-teal-500/30 text-teal-400 rounded-lg transition-all duration-300 hover:border-teal-500/50 backdrop-blur-sm hover:shadow-lg text-sm"
                >
                  Migrate Flight Logs
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
              <button
                onClick={() => setTheme('custom')}
                className="px-3 py-1 liquid-glass border border-white/20 text-white rounded text-sm transition-all duration-300 hover:border-white/30 backdrop-blur-sm hover:shadow-lg"
              >
                Custom
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
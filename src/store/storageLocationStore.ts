import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { StorageLocation } from '../models/types';

// Load saved data from localStorage
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Save data to localStorage
const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Initial sample data
const sampleLocations: StorageLocation[] = [
  {
    id: '1',
    name: 'Shelf A1',
    description: 'Top shelf, left side - Motors and ESCs',
    type: 'shelf',
    capacity: 50,
    currentItems: 12,
    dateAdded: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Drawer B2',
    description: 'Second drawer - Small electronics',
    type: 'drawer',
    capacity: 30,
    currentItems: 8,
    dateAdded: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Box C3',
    description: 'Storage box - Flight controllers',
    type: 'box',
    capacity: 20,
    currentItems: 5,
    dateAdded: new Date().toISOString()
  }
];

// Load initial data from localStorage or use sample data
const initialLocations = loadFromStorage('storageLocations', sampleLocations);

interface StorageLocationState {
  locations: StorageLocation[];
  filteredLocations: StorageLocation[];
  filterOptions: {
    searchTerm: string;
    types: ('shelf' | 'drawer' | 'box' | 'cabinet' | 'room' | 'other')[];
    sortBy: 'name' | 'type' | 'capacity' | 'dateAdded';
    sortDirection: 'asc' | 'desc';
  };
  
  // Actions
  addLocation: (location: Omit<StorageLocation, 'id' | 'dateAdded'>) => void;
  updateLocation: (id: string, locationData: Partial<StorageLocation>) => void;
  deleteLocation: (id: string) => void;
  getLocation: (id: string) => StorageLocation | undefined;
  updateLocationItemCount: (locationName: string, change: number) => void;
  
  setFilterOptions: (options: Partial<StorageLocationState['filterOptions']>) => void;
  applyFilters: () => void;
}

export const useStorageLocationStore = create<StorageLocationState>((set, get) => ({
  locations: initialLocations,
  filteredLocations: initialLocations,
  filterOptions: {
    searchTerm: '',
    types: ['shelf', 'drawer', 'box', 'cabinet', 'room', 'other'],
    sortBy: 'name',
    sortDirection: 'asc'
  },

  // Actions
  addLocation: (location) => {
    const newLocation: StorageLocation = {
      ...location,
      id: uuidv4(),
      dateAdded: new Date().toISOString(),
      currentItems: 0
    };
    set((state) => {
      const newLocations = [...state.locations, newLocation];
      saveToStorage('storageLocations', newLocations);
      return { locations: newLocations };
    });
    get().applyFilters();
  },

  updateLocation: (id, locationData) => {
    set((state) => {
      const newLocations = state.locations.map((location) => 
        location.id === id 
          ? { ...location, ...locationData, lastModified: new Date().toISOString() } 
          : location
      );
      saveToStorage('storageLocations', newLocations);
      return { locations: newLocations };
    });
    get().applyFilters();
  },

  deleteLocation: (id) => {
    set((state) => {
      const newLocations = state.locations.filter((location) => location.id !== id);
      saveToStorage('storageLocations', newLocations);
      return { locations: newLocations };
    });
    get().applyFilters();
  },

  getLocation: (id) => {
    return get().locations.find((location) => location.id === id);
  },

  updateLocationItemCount: (locationName, change) => {
    set((state) => {
      const newLocations = state.locations.map((location) => 
        location.name === locationName
          ? { 
              ...location, 
              currentItems: Math.max(0, (location.currentItems || 0) + change),
              lastModified: new Date().toISOString()
            }
          : location
      );
      saveToStorage('storageLocations', newLocations);
      return { locations: newLocations };
    });
    get().applyFilters();
  },

  setFilterOptions: (options) => {
    set((state) => ({
      filterOptions: { ...state.filterOptions, ...options }
    }));
    get().applyFilters();
  },

  applyFilters: () => {
    const { locations, filterOptions } = get();
    
    let filtered = [...locations];
    
    // Apply search term filter
    if (filterOptions.searchTerm) {
      const term = filterOptions.searchTerm.toLowerCase();
      filtered = filtered.filter((location) => 
        location.name.toLowerCase().includes(term) ||
        location.description?.toLowerCase().includes(term)
      );
    }
    
    // Apply type filter
    if (filterOptions.types.length > 0) {
      filtered = filtered.filter((location) => 
        filterOptions.types.includes(location.type)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      switch (filterOptions.sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'type':
          valueA = a.type.toLowerCase();
          valueB = b.type.toLowerCase();
          break;
        case 'capacity':
          valueA = a.capacity || 0;
          valueB = b.capacity || 0;
          break;
        case 'dateAdded':
          valueA = new Date(a.dateAdded).getTime();
          valueB = new Date(b.dateAdded).getTime();
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }
      
      if (filterOptions.sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    set({ filteredLocations: filtered });
  }
}));
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Part, Category, FilterOptions } from '../models/types';

// Load saved data from localStorage with enhanced error handling
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) {
      console.log(`No saved data found for ${key}, using defaults`);
      return defaultValue;
    }
    
    const parsed = JSON.parse(saved);
    
    // Validate that the parsed data is an array (for parts, categories, etc.)
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      console.error(`Invalid data format for ${key}: expected array, got ${typeof parsed}`);
      return defaultValue;
    }
    
    // Additional validation for parts array
    if (key === 'droneParts' && Array.isArray(parsed)) {
      const validParts = parsed.filter((part, index) => {
        if (!part || typeof part !== 'object') {
          console.warn(`Invalid part at index ${index}: not an object`);
          return false;
        }
        if (!part.id || !part.name) {
          console.warn(`Invalid part at index ${index}: missing required fields (id: ${!!part.id}, name: ${!!part.name})`);
          return false;
        }
        return true;
      });
      
      if (validParts.length !== parsed.length) {
        console.warn(`Filtered out ${parsed.length - validParts.length} invalid parts from ${key}`);
        return validParts as T;
      }
    }
    
    // Additional validation for categories array
    if (key === 'droneCategories' && Array.isArray(parsed)) {
      const validCategories = parsed.filter((category, index) => {
        if (!category || typeof category !== 'object') {
          console.warn(`Invalid category at index ${index}: not an object`);
          return false;
        }
        if (!category.id || !category.name) {
          console.warn(`Invalid category at index ${index}: missing required fields (id: ${!!category.id}, name: ${!!category.name})`);
          return false;
        }
        return true;
      });
      
      if (validCategories.length !== parsed.length) {
        console.warn(`Filtered out ${parsed.length - validCategories.length} invalid categories from ${key}`);
        return validCategories as T;
      }
    }
    
    console.log(`Successfully loaded ${key}:`, Array.isArray(parsed) ? `${parsed.length} items` : 'data');
    return parsed;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    console.warn(`Using default data for ${key}`);
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
const sampleCategories: Category[] = [
  {
    id: '1',
    name: 'Motors',
    description: 'Propulsion systems for drones',
    color: '#3B82F6',
    subcategories: [
      { id: '1-1', name: 'Brushless', description: 'Standard brushless motors', parentId: '1' },
      { id: '1-2', name: 'Brushed', description: 'Standard brushed motors', parentId: '1' }
    ],
    dateAdded: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Frames',
    description: 'Structural components',
    color: '#10B981',
    subcategories: [
      { id: '2-1', name: 'Carbon Fiber', description: 'Lightweight and strong', parentId: '2' },
      { id: '2-2', name: 'Plastic', description: 'Affordable and flexible', parentId: '2' }
    ],
    dateAdded: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Electronics',
    description: 'Controllers and circuit boards',
    color: '#F59E0B',
    subcategories: [
      { id: '3-1', name: 'Flight Controllers', description: 'Main drone CPU', parentId: '3' },
      { id: '3-2', name: 'ESCs', description: 'Electronic Speed Controllers', parentId: '3' }
    ],
    dateAdded: new Date().toISOString()
  }
];

const sampleParts: Part[] = [
  {
    id: '1',
    name: 'Emax ECO II 2306',
    category: 'Motors',
    subcategory: 'Brushless',
    quantity: 8,
    price: 24.99,
    location: 'Shelf A2',
    description: 'High-performance 2306 size brushless motor for 5-inch props',
    imageUrls: ['https://images.unsplash.com/photo-1579829215132-9b20155a2c7c?q=80&w=300'],
    manufacturer: 'Emax',
    modelNumber: 'ECO II 2306-2400KV',
    dateAdded: new Date().toISOString(),
    notes: 'Good durability, standard for 5-inch builds',
    inUse: 4,
    status: 'in-stock',
    condition: 'new'
  },
  {
    id: '2',
    name: 'TBS Source One v5',
    category: 'Frames',
    subcategory: 'Carbon Fiber',
    quantity: 3,
    price: 39.99,
    location: 'Drawer B1',
    description: '5-inch freestyle frame, very durable with multiple mounting options',
    imageUrls: ['https://images.unsplash.com/photo-1468078809804-4c7b3e60a478?q=80&w=300'],
    manufacturer: 'Team BlackSheep',
    modelNumber: 'Source One v5',
    dateAdded: new Date().toISOString(),
    notes: 'Favorite frame for freestyle builds',
    inUse: 1,
    status: 'in-stock',
    condition: 'good'
  },
  {
    id: '3',
    name: 'Matek F405-CTR',
    category: 'Electronics',
    subcategory: 'Flight Controllers',
    quantity: 4,
    price: 42.99,
    location: 'Box C3',
    description: 'F4 flight controller with integrated PDB and OSD',
    imageUrls: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=300'],
    manufacturer: 'Matek',
    modelNumber: 'F405-CTR',
    dateAdded: new Date().toISOString(),
    notes: 'Good for compact builds',
    inUse: 2,
    status: 'in-use',
    condition: 'fair'
  }
];

// Load initial data from localStorage or use sample data
const initialParts = loadFromStorage('droneParts', sampleParts);
const initialCategories = loadFromStorage('droneCategories', sampleCategories);

interface InventoryState {
  parts: Part[];
  categories: Category[];
  filteredParts: Part[];
  filterOptions: FilterOptions;
  
  // Actions
  addPart: (part: Omit<Part, 'id' | 'dateAdded'>) => void;
  updatePart: (id: string, partData: Partial<Part>) => void;
  deletePart: (id: string) => void;
  getPart: (id: string) => Part | undefined;
  
  addCategory: (category: Omit<Category, 'id' | 'dateAdded' | 'subcategories'>) => void;
  updateCategory: (id: string, categoryData: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getCategory: (id: string) => Category | undefined;
  
  addSubcategory: (categoryId: string, name: string, description?: string) => void;
  updateSubcategory: (categoryId: string, subcategoryId: string, name: string, description?: string) => void;
  deleteSubcategory: (categoryId: string, subcategoryId: string) => void;
  
  setFilterOptions: (options: Partial<FilterOptions>) => void;
  applyFilters: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  parts: initialParts,
  categories: initialCategories,
  filteredParts: initialParts,
  filterOptions: {
    categories: [],
    searchTerm: '',
    inStock: true,
    sortBy: 'name',
    sortDirection: 'asc',
    status: ['in-stock', 'in-use'],
    conditions: ['new', 'good', 'fair', 'poor', 'broken', 'needs-repair']
  },

  // Part actions
  addPart: (part) => {
    const newPart: Part = {
      ...part,
      id: uuidv4(),
      dateAdded: new Date().toISOString()
    };
    set((state) => {
      const newParts = [...state.parts, newPart];
      saveToStorage('droneParts', newParts);
      return { 
        parts: newParts
      };
    });
    get().applyFilters();
  },

  updatePart: (id, partData) => {
    set((state) => {
      const newParts = state.parts.map((part) => 
        part.id === id 
          ? { ...part, ...partData, lastModified: new Date().toISOString() } 
          : part
      );
      saveToStorage('droneParts', newParts);
      return {
        parts: newParts
      };
    });
    get().applyFilters();
  },

  deletePart: (id) => {
    set((state) => {
      const newParts = state.parts.filter((part) => part.id !== id);
      saveToStorage('droneParts', newParts);
      return {
        parts: newParts
      };
    });
    get().applyFilters();
  },

  getPart: (id) => {
    return get().parts.find((part) => part.id === id);
  },

  // Category actions
  addCategory: (category) => {
    const newCategory: Category = {
      ...category,
      id: uuidv4(),
      subcategories: [],
      dateAdded: new Date().toISOString()
    };
    set((state) => {
      const newCategories = [...state.categories, newCategory];
      saveToStorage('droneCategories', newCategories);
      return { categories: newCategories };
    });
  },

  updateCategory: (id, categoryData) => {
    set((state) => {
      const newCategories = state.categories.map((category) => 
        category.id === id 
          ? { ...category, ...categoryData, lastModified: new Date().toISOString() } 
          : category
      );
      saveToStorage('droneCategories', newCategories);
      return { categories: newCategories };
    });
  },

  deleteCategory: (id) => {
    set((state) => {
      const newCategories = state.categories.filter((category) => category.id !== id);
      const newParts = state.parts.map(part => 
        part.category === state.categories.find(c => c.id === id)?.name
          ? { ...part, category: 'Uncategorized' }
          : part
      );
      saveToStorage('droneCategories', newCategories);
      saveToStorage('droneParts', newParts);
      return {
        categories: newCategories,
        parts: newParts
      };
    });
  },

  getCategory: (id) => {
    return get().categories.find((category) => category.id === id);
  },

  // Subcategory actions
  addSubcategory: (categoryId, name, description) => {
    const subcategoryId = uuidv4();
    set((state) => {
      const newCategories = state.categories.map((category) => 
        category.id === categoryId
          ? { 
              ...category, 
              subcategories: [
                ...category.subcategories, 
                { id: subcategoryId, name, description, parentId: categoryId }
              ],
              lastModified: new Date().toISOString()
            }
          : category
      );
      saveToStorage('droneCategories', newCategories);
      return { categories: newCategories };
    });
  },

  updateSubcategory: (categoryId, subcategoryId, name, description) => {
    set((state) => {
      const newCategories = state.categories.map((category) => 
        category.id === categoryId
          ? { 
              ...category, 
              subcategories: category.subcategories.map(sub => 
                sub.id === subcategoryId
                  ? { ...sub, name, description }
                  : sub
              ),
              lastModified: new Date().toISOString()
            }
          : category
      );
      saveToStorage('droneCategories', newCategories);
      return { categories: newCategories };
    });
  },

  deleteSubcategory: (categoryId, subcategoryId) => {
    set((state) => {
      const newCategories = state.categories.map((category) => 
        category.id === categoryId
          ? { 
              ...category, 
              subcategories: category.subcategories.filter(sub => sub.id !== subcategoryId),
              lastModified: new Date().toISOString()
            }
          : category
      );
      const newParts = state.parts.map(part => {
        const categoryName = state.categories.find(c => c.id === categoryId)?.name;
        const subcategoryName = state.categories
          .find(c => c.id === categoryId)?.subcategories
          .find(s => s.id === subcategoryId)?.name;
        
        if (part.category === categoryName && part.subcategory === subcategoryName) {
          return { ...part, subcategory: undefined };
        }
        return part;
      });
      saveToStorage('droneCategories', newCategories);
      saveToStorage('droneParts', newParts);
      return {
        categories: newCategories,
        parts: newParts
      };
    });
  },

  // Search and filtering
  setFilterOptions: (options) => {
    set((state) => ({
      filterOptions: { ...state.filterOptions, ...options },
    }));
    get().applyFilters();
  },

  applyFilters: () => {
    const { parts, filterOptions } = get();
    
    let filtered = [...parts];
    
    // Apply search term filter
    if (filterOptions.searchTerm) {
      const term = filterOptions.searchTerm.toLowerCase();
      filtered = filtered.filter((part) => 
        part.name.toLowerCase().includes(term) ||
        part.description.toLowerCase().includes(term) ||
        part.manufacturer?.toLowerCase().includes(term) ||
        part.modelNumber?.toLowerCase().includes(term) ||
        part.notes?.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (filterOptions.categories.length > 0) {
      filtered = filtered.filter((part) => 
        filterOptions.categories.includes(part.category)
      );
    }
    
    // Apply status filter
    if (filterOptions.status && filterOptions.status.length > 0) {
      filtered = filtered.filter((part) => 
        filterOptions.status.includes(part.status)
      );
    }
    
    // Apply condition filter
    if (filterOptions.conditions && filterOptions.conditions.length > 0) {
      filtered = filtered.filter((part) => 
        filterOptions.conditions.includes(part.condition)
      );
    }
    
    // Apply in-stock filter
    if (filterOptions.inStock) {
      filtered = filtered.filter((part) => part.quantity > 0);
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
        case 'category':
          valueA = a.category.toLowerCase();
          valueB = b.category.toLowerCase();
          break;
        case 'quantity':
          valueA = a.quantity;
          valueB = b.quantity;
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
    
    set({ filteredParts: filtered });
  }
}));
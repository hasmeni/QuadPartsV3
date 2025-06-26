import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { GalleryItem } from '../models/types';

const STORAGE_KEY = 'quadparts_gallery_data';

interface GalleryState {
  items: GalleryItem[];
  filteredItems: GalleryItem[];
  customTags: string[];
  filterOptions: {
    searchTerm: string;
    tags: string[];
  };
  
  // Actions
  addItem: (item: Omit<GalleryItem, 'id' | 'dateAdded'>) => void;
  updateItem: (id: string, itemData: Partial<GalleryItem>) => void;
  deleteItem: (id: string) => void;
  getItem: (id: string) => GalleryItem | undefined;
  
  addCustomTag: (tag: string) => void;
  removeCustomTag: (tag: string) => void;
  
  setFilterOptions: (options: Partial<GalleryState['filterOptions']>) => void;
  applyFilters: () => void;
}

// Sample data
const sampleItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Freestyle Beast',
    description: 'My favorite 5" freestyle quad with amazing handling',
    imageUrls: [
      'https://images.pexels.com/photos/442587/pexels-photo-442587.jpeg?auto=compress&cs=tinysrgb&w=1280',
      'https://images.pexels.com/photos/442589/pexels-photo-442589.jpeg?auto=compress&cs=tinysrgb&w=1280'
    ],
    dateAdded: new Date().toISOString(),
    tags: ['freestyle', '5inch', 'analog'],
    specs: {
      weight: 650,
      size: '5 inch',
      motorKv: 1900,
      batteryConfig: '6S 1300mAh',
      flightController: 'Matek F722-SE',
      vtx: 'Rush Tank Ultimate'
    }
  },
  {
    id: '2',
    title: 'Micro Ripper',
    description: 'Ultra-light 3" build for indoor and outdoor fun',
    imageUrls: [
      'https://images.pexels.com/photos/744366/pexels-photo-744366.jpeg?auto=compress&cs=tinysrgb&w=1280'
    ],
    dateAdded: new Date().toISOString(),
    tags: ['micro', '3inch', 'digital'],
    specs: {
      weight: 180,
      size: '3 inch',
      motorKv: 4500,
      batteryConfig: '3S 450mAh',
      flightController: 'HGLRC Zeus F722 Mini',
      vtx: 'Caddx Vista'
    }
  }
];

// Initial custom tags
const initialCustomTags = ['freestyle', '5inch', '3inch', 'micro', 'analog', 'digital'];

// Load saved data from localStorage
const loadSavedData = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      
      // Handle different data structures
      let items, customTags;
      if (Array.isArray(parsed)) {
        // If the data is directly an array
        items = parsed;
        customTags = initialCustomTags;
      } else if (parsed && typeof parsed === 'object') {
        // If the data is wrapped in an object
        if (Array.isArray(parsed.items)) {
          items = parsed.items;
          customTags = parsed.customTags || initialCustomTags;
        } else if (Array.isArray(parsed.galleryItems)) {
          items = parsed.galleryItems;
          customTags = parsed.customTags || initialCustomTags;
        } else if (Array.isArray(parsed.data)) {
          items = parsed.data;
          customTags = parsed.customTags || initialCustomTags;
        } else {
          console.warn('Unexpected gallery data structure:', parsed);
          return { items: sampleItems, customTags: initialCustomTags };
        }
      } else {
        console.warn('Unexpected gallery data structure:', parsed);
        return { items: sampleItems, customTags: initialCustomTags };
      }
      
      // Ensure dates are properly parsed
      const parsedItems = items.map((item: any) => ({
        ...item,
        dateAdded: new Date(item.dateAdded).toISOString()
      }));
      
      console.log(`Loaded ${parsedItems.length} gallery items from localStorage`);
      return { items: parsedItems, customTags };
    }
  } catch (error) {
    console.error('Error loading gallery data from localStorage:', error);
  }
  return { items: sampleItems, customTags: initialCustomTags };
};

const { items: savedItems, customTags: savedCustomTags } = loadSavedData();

export const useGalleryStore = create<GalleryState>((set, get) => ({
  items: savedItems,
  filteredItems: savedItems,
  customTags: savedCustomTags,
  filterOptions: {
    searchTerm: '',
    tags: []
  },
  
  // Actions
  addItem: (item) => {
    const newItem: GalleryItem = {
      ...item,
      id: uuidv4(),
      dateAdded: new Date().toISOString()
    };
    
    // Add any new tags to customTags
    const newTags = item.tags.filter(tag => !get().customTags.includes(tag));
    if (newTags.length > 0) {
      set(state => ({
        customTags: [...state.customTags, ...newTags]
      }));
    }
    
    set((state) => ({ 
      items: [...state.items, newItem]
    }));
    get().applyFilters();
    
    // Save to localStorage
    const { items, customTags } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, customTags }));
  },
  
  updateItem: (id, itemData) => {
    // Add any new tags to customTags
    if (itemData.tags) {
      const newTags = itemData.tags.filter(tag => !get().customTags.includes(tag));
      if (newTags.length > 0) {
        set(state => ({
          customTags: [...state.customTags, ...newTags]
        }));
      }
    }
    
    set((state) => ({
      items: state.items.map((item) => 
        item.id === id 
          ? { ...item, ...itemData } 
          : item
      )
    }));
    get().applyFilters();
    
    // Save to localStorage
    const { items, customTags } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, customTags }));
  },
  
  deleteItem: (id) => {
    // Remove unused tags
    const remainingItems = get().items.filter(item => item.id !== id);
    const usedTags = new Set(remainingItems.flatMap(item => item.tags));
    
    set((state) => ({
      items: remainingItems,
      customTags: state.customTags.filter(tag => usedTags.has(tag))
    }));
    get().applyFilters();
    
    // Save to localStorage
    const { items, customTags } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, customTags }));
  },
  
  getItem: (id) => {
    return get().items.find((item) => item.id === id);
  },
  
  addCustomTag: (tag) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (!get().customTags.includes(normalizedTag)) {
      set((state) => ({
        customTags: [...state.customTags, normalizedTag]
      }));
      
      // Save to localStorage
      const { items, customTags } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, customTags }));
    }
  },
  
  removeCustomTag: (tag) => {
    // Only remove if no items are using this tag
    const isTagInUse = get().items.some(item => item.tags.includes(tag));
    if (!isTagInUse) {
      set((state) => ({
        customTags: state.customTags.filter(t => t !== tag),
        filterOptions: {
          ...state.filterOptions,
          tags: state.filterOptions.tags.filter(t => t !== tag)
        }
      }));
      get().applyFilters();
      
      // Save to localStorage
      const { items, customTags } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, customTags }));
    }
  },
  
  setFilterOptions: (options) => {
    set((state) => ({
      filterOptions: { ...state.filterOptions, ...options }
    }));
    get().applyFilters();
  },
  
  applyFilters: () => {
    const { items, filterOptions } = get();
    
    let filtered = [...items];
    
    // Filter by search term
    if (filterOptions.searchTerm) {
      const term = filterOptions.searchTerm.toLowerCase().trim();
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.tags.some(tag => tag.toLowerCase().includes(term)) ||
        (item.specs?.size && item.specs.size.toLowerCase().includes(term)) ||
        (item.specs?.flightController && item.specs.flightController.toLowerCase().includes(term))
      );
    }
    
    // Filter by tags (show items that have ANY of the selected tags)
    if (filterOptions.tags.length > 0) {
      filtered = filtered.filter((item) =>
        filterOptions.tags.some(selectedTag => 
          item.tags.some(itemTag => 
            itemTag.toLowerCase() === selectedTag.toLowerCase()
          )
        )
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) =>
      new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    );
    
    set({ filteredItems: filtered });
  }
}));
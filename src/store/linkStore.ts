import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Link } from '../models/types';

const STORAGE_KEY = 'quadparts_links_data';

interface LinkState {
  links: Link[];
  filteredLinks: Link[];
  customTags: string[];
  filterOptions: {
    searchTerm: string;
    categories: ('website' | 'youtube' | 'blog' | 'store' | 'other')[];
    tags: string[];
    favoritesOnly: boolean;
  };
  
  // Actions
  addLink: (link: Omit<Link, 'id' | 'dateAdded' | 'isFavorite'>) => void;
  updateLink: (id: string, linkData: Partial<Link>) => void;
  deleteLink: (id: string) => void;
  toggleFavorite: (id: string) => void;
  updateLastVisited: (id: string) => void;
  
  addCustomTag: (tag: string) => void;
  removeCustomTag: (tag: string) => void;
  
  setFilterOptions: (options: Partial<LinkState['filterOptions']>) => void;
  applyFilters: () => void;
}

// Sample data
const sampleLinks: Link[] = [
  {
    id: '1',
    title: 'Joshua Bardwell',
    url: 'https://www.youtube.com/@JoshuaBardwell',
    description: 'The best FPV drone tutorials and reviews',
    category: 'youtube',
    tags: ['tutorial', 'review', 'education'],
    dateAdded: new Date().toISOString(),
    isFavorite: true
  },
  {
    id: '2',
    title: 'Oscar Liang',
    url: 'https://oscarliang.com',
    description: 'Comprehensive FPV drone guides and build logs',
    category: 'blog',
    tags: ['guide', 'tutorial', 'build'],
    dateAdded: new Date().toISOString(),
    isFavorite: true
  }
];

// Initial custom tags
const initialCustomTags = ['tutorial', 'review', 'education', 'guide', 'build'];

// Load saved data from localStorage
const loadSavedData = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const { links, customTags } = JSON.parse(savedData);
      return { links, customTags };
    }
  } catch (error) {
    console.error('Error loading links data from localStorage:', error);
  }
  return { links: sampleLinks, customTags: initialCustomTags };
};

const { links: savedLinks, customTags: savedCustomTags } = loadSavedData();

export const useLinkStore = create<LinkState>((set, get) => ({
  links: savedLinks,
  filteredLinks: savedLinks,
  customTags: savedCustomTags,
  filterOptions: {
    searchTerm: '',
    categories: ['website', 'youtube', 'blog', 'store', 'other'],
    tags: [],
    favoritesOnly: false
  },
  
  // Actions
  addLink: (link) => {
    const newLink: Link = {
      ...link,
      id: uuidv4(),
      dateAdded: new Date().toISOString(),
      isFavorite: false
    };
    
    // Add any new tags to customTags
    const newTags = link.tags.filter(tag => !get().customTags.includes(tag));
    if (newTags.length > 0) {
      set(state => ({
        customTags: [...state.customTags, ...newTags]
      }));
    }
    
    set((state) => ({ 
      links: [...state.links, newLink]
    }));
    get().applyFilters();
    
    // Save to localStorage
    const { links, customTags } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ links, customTags }));
  },
  
  updateLink: (id, linkData) => {
    // Add any new tags to customTags
    if (linkData.tags) {
      const newTags = linkData.tags.filter(tag => !get().customTags.includes(tag));
      if (newTags.length > 0) {
        set(state => ({
          customTags: [...state.customTags, ...newTags]
        }));
      }
    }
    
    set((state) => ({
      links: state.links.map((link) => 
        link.id === id 
          ? { ...link, ...linkData } 
          : link
      )
    }));
    get().applyFilters();
    
    // Save to localStorage
    const { links, customTags } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ links, customTags }));
  },
  
  deleteLink: (id) => {
    // Remove unused tags
    const remainingLinks = get().links.filter(link => link.id !== id);
    const usedTags = new Set(remainingLinks.flatMap(link => link.tags));
    
    set((state) => ({
      links: remainingLinks,
      customTags: state.customTags.filter(tag => usedTags.has(tag))
    }));
    get().applyFilters();
    
    // Save to localStorage
    const { links, customTags } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ links, customTags }));
  },
  
  toggleFavorite: (id) => {
    set((state) => ({
      links: state.links.map((link) =>
        link.id === id
          ? { ...link, isFavorite: !link.isFavorite }
          : link
      )
    }));
    get().applyFilters();
    
    // Save to localStorage
    const { links, customTags } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ links, customTags }));
  },
  
  updateLastVisited: (id) => {
    set((state) => ({
      links: state.links.map((link) =>
        link.id === id
          ? { ...link, lastVisited: new Date().toISOString() }
          : link
      )
    }));
    get().applyFilters();
    
    // Save to localStorage
    const { links, customTags } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ links, customTags }));
  },
  
  addCustomTag: (tag) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (!get().customTags.includes(normalizedTag)) {
      set((state) => ({
        customTags: [...state.customTags, normalizedTag]
      }));
      
      // Save to localStorage
      const { links, customTags } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ links, customTags }));
    }
  },
  
  removeCustomTag: (tag) => {
    // Only remove if no links are using this tag
    const isTagInUse = get().links.some(link => link.tags.includes(tag));
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
      const { links, customTags } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ links, customTags }));
    }
  },
  
  setFilterOptions: (options) => {
    set((state) => ({
      filterOptions: { ...state.filterOptions, ...options }
    }));
    get().applyFilters();
  },
  
  applyFilters: () => {
    const { links, filterOptions } = get();
    
    let filtered = [...links];
    
    // Filter by search term
    if (filterOptions.searchTerm) {
      const term = filterOptions.searchTerm.toLowerCase();
      filtered = filtered.filter((link) =>
        link.title.toLowerCase().includes(term) ||
        link.description?.toLowerCase().includes(term) ||
        link.url.toLowerCase().includes(term) ||
        link.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Filter by categories
    if (filterOptions.categories.length > 0) {
      filtered = filtered.filter((link) =>
        filterOptions.categories.includes(link.category)
      );
    }
    
    // Filter by tags
    if (filterOptions.tags.length > 0) {
      filtered = filtered.filter((link) =>
        filterOptions.tags.some(tag => link.tags.includes(tag))
      );
    }
    
    // Filter favorites
    if (filterOptions.favoritesOnly) {
      filtered = filtered.filter((link) => link.isFavorite);
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) =>
      new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    );
    
    set({ filteredLinks: filtered });
  }
}));
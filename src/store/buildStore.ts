import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { BuildNote, BuildNoteEntry } from '../models/types';

const STORAGE_KEY = 'quadparts_builds_data';

interface BuildState {
  builds: BuildNote[];
  filteredBuilds: BuildNote[];
  filterOptions: {
    status: ('planning' | 'in-progress' | 'completed' | 'archived')[];
    searchTerm: string;
  };
  
  // Actions
  addBuild: (build: Omit<BuildNote, 'id' | 'dateCreated' | 'notes' | 'totalCost'>) => void;
  updateBuild: (id: string, buildData: Partial<BuildNote>) => void;
  deleteBuild: (id: string) => void;
  getBuild: (id: string) => BuildNote | undefined;
  
  addBuildNote: (buildId: string, note: Omit<BuildNoteEntry, 'id' | 'dateAdded'>) => void;
  updateBuildNote: (buildId: string, noteId: string, noteData: Partial<BuildNoteEntry>) => void;
  deleteBuildNote: (buildId: string, noteId: string) => void;
  
  setFilterOptions: (options: Partial<BuildState['filterOptions']>) => void;
  applyFilters: () => void;
}

// Sample data
const sampleBuilds: BuildNote[] = [
  {
    id: '1',
    title: '5" Freestyle Build',
    description: 'Custom 5-inch freestyle quad with DJI digital system',
    status: 'completed',
    imageUrls: ['https://images.pexels.com/photos/442587/pexels-photo-442587.jpeg?auto=compress&cs=tinysrgb&w=1280'],
    dateCreated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    partsUsed: [],
    totalCost: 549.99,
    notes: [
      {
        id: '1-1',
        content: 'Initial build complete. Maiden flight successful!',
        imageUrls: ['https://images.pexels.com/photos/442589/pexels-photo-442589.jpeg?auto=compress&cs=tinysrgb&w=1280'],
        dateAdded: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'achievement'
      }
    ],
    specs: {
      weight: 650,
      size: '5 inch',
      motorKv: 1900,
      batteryConfig: '6S 1300mAh',
      flightController: 'Matek F722-SE',
      vtx: 'DJI Air Unit'
    }
  },
  {
    id: '2',
    title: 'Micro Long Range',
    description: 'Ultra-efficient 3" LR build for maximum flight time',
    status: 'in-progress',
    imageUrls: ['https://images.pexels.com/photos/744366/pexels-photo-744366.jpeg?auto=compress&cs=tinysrgb&w=1280'],
    dateCreated: new Date().toISOString(),
    partsUsed: [],
    totalCost: 299.99,
    notes: [],
    specs: {
      weight: 180,
      size: '3 inch',
      motorKv: 1404,
      batteryConfig: '4S 850mAh',
      flightController: 'HGLRC Zeus F722',
      vtx: 'RushFPV Tank Ultimate'
    }
  }
];

// Load saved data from localStorage
const loadSavedData = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      
      // Handle different data structures
      let builds;
      if (Array.isArray(parsed)) {
        // If the data is directly an array
        builds = parsed;
      } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.builds)) {
        // If the data is wrapped in an object with 'builds' property
        builds = parsed.builds;
      } else {
        console.warn('Unexpected builds data structure:', parsed);
        return { builds: sampleBuilds };
      }
      
      // Ensure dates are properly parsed
      const parsedBuilds = builds.map((build: any) => ({
        ...build,
        dateCreated: new Date(build.dateCreated).toISOString(),
        lastModified: build.lastModified ? new Date(build.lastModified).toISOString() : undefined,
        notes: Array.isArray(build.notes) ? build.notes.map((note: any) => ({
          ...note,
          dateAdded: new Date(note.dateAdded).toISOString()
        })) : []
      }));
      
      console.log(`Loaded ${parsedBuilds.length} builds from localStorage`);
      return { builds: parsedBuilds };
    }
  } catch (error) {
    console.error('Error loading builds data from localStorage:', error);
  }
  return { builds: sampleBuilds };
};

const { builds: savedBuilds } = loadSavedData();

export const useBuildStore = create<BuildState>((set, get) => ({
  builds: savedBuilds,
  filteredBuilds: savedBuilds,
  filterOptions: {
    status: ['planning', 'in-progress', 'completed', 'archived'],
    searchTerm: ''
  },
  
  // Actions
  addBuild: (build) => {
    const newBuild: BuildNote = {
      ...build,
      id: uuidv4(),
      dateCreated: new Date().toISOString(),
      notes: [],
      totalCost: 0
    };
    set((state) => ({ 
      builds: [...state.builds, newBuild]
    }));
    get().applyFilters();
    
    // Save to localStorage
    const { builds } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ builds }));
  },
  
  updateBuild: (id, buildData) => {
    set((state) => ({
      builds: state.builds.map((build) => 
        build.id === id 
          ? { 
              ...build, 
              ...buildData,
              lastModified: new Date().toISOString()
            } 
          : build
      )
    }));
    get().applyFilters();
    
    // Save to localStorage
    const { builds } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ builds }));
  },
  
  deleteBuild: (id) => {
    set((state) => ({
      builds: state.builds.filter((build) => build.id !== id)
    }));
    get().applyFilters();
    
    // Save to localStorage
    const { builds } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ builds }));
  },
  
  getBuild: (id) => {
    return get().builds.find((build) => build.id === id);
  },
  
  addBuildNote: (buildId, note) => {
    const newNote: BuildNoteEntry = {
      ...note,
      id: uuidv4(),
      dateAdded: new Date().toISOString()
    };
    
    set((state) => ({
      builds: state.builds.map((build) =>
        build.id === buildId
          ? {
              ...build,
              notes: [...build.notes, newNote],
              lastModified: new Date().toISOString()
            }
          : build
      )
    }));
    
    // Save to localStorage
    const { builds } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ builds }));
  },
  
  updateBuildNote: (buildId, noteId, noteData) => {
    set((state) => ({
      builds: state.builds.map((build) =>
        build.id === buildId
          ? {
              ...build,
              notes: build.notes.map((note) =>
                note.id === noteId
                  ? { ...note, ...noteData }
                  : note
              ),
              lastModified: new Date().toISOString()
            }
          : build
      )
    }));
    
    // Save to localStorage
    const { builds } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ builds }));
  },
  
  deleteBuildNote: (buildId, noteId) => {
    set((state) => ({
      builds: state.builds.map((build) =>
        build.id === buildId
          ? {
              ...build,
              notes: build.notes.filter((note) => note.id !== noteId),
              lastModified: new Date().toISOString()
            }
          : build
      )
    }));
    
    // Save to localStorage
    const { builds } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ builds }));
  },
  
  setFilterOptions: (options) => {
    set((state) => ({
      filterOptions: { ...state.filterOptions, ...options }
    }));
    get().applyFilters();
  },
  
  applyFilters: () => {
    const { builds, filterOptions } = get();
    
    let filtered = [...builds];
    
    // Filter by status
    filtered = filtered.filter((build) =>
      filterOptions.status.includes(build.status)
    );
    
    // Filter by search term
    if (filterOptions.searchTerm) {
      const term = filterOptions.searchTerm.toLowerCase();
      filtered = filtered.filter((build) =>
        build.title.toLowerCase().includes(term) ||
        build.description.toLowerCase().includes(term)
      );
    }
    
    // Sort by date
    filtered.sort((a, b) =>
      new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
    );
    
    set({ filteredBuilds: filtered });
  }
}));
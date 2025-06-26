// Types for the inventory system

export interface Part {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  quantity: number;
  price: number;
  location: string;
  description: string;
  imageUrls: string[];
  manufacturer?: string;
  modelNumber?: string;
  dateAdded: string;
  lastModified?: string;
  notes?: string;
  inUse: number;
  status: 'in-stock' | 'in-use';
  condition: 'new' | 'good' | 'fair' | 'poor' | 'broken' | 'needs-repair';
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  subcategories: Subcategory[];
  dateAdded: string;
  lastModified?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  description?: string;
  parentId: string;
}

export interface StorageLocation {
  id: string;
  name: string;
  description?: string;
  type: 'shelf' | 'drawer' | 'box' | 'cabinet' | 'room' | 'other';
  capacity?: number;
  currentItems?: number;
  dateAdded: string;
  lastModified?: string;
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dateCreated: string;
  dateDue?: string;
  dateCompleted?: string;
  relatedPartIds?: string[];
}

export interface FilterOptions {
  categories: string[];
  searchTerm: string;
  inStock: boolean;
  sortBy: 'name' | 'category' | 'quantity' | 'dateAdded';
  sortDirection: 'asc' | 'desc';
  status: ('in-stock' | 'in-use')[];
  conditions: ('new' | 'good' | 'fair' | 'poor' | 'broken' | 'needs-repair')[];
}

export interface BuildNote {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'archived';
  imageUrls: string[];
  dateCreated: string;
  lastModified?: string;
  partsUsed: BuildPart[];
  totalCost: number;
  notes: BuildNoteEntry[];
  specs?: {
    weight?: number;
    size?: string;
    motorKv?: number;
    batteryConfig?: string;
    flightController?: string;
    vtx?: string;
    [key: string]: string | number | undefined;
  };
}

export interface BuildPart {
  partId: string;
  quantity: number;
  notes?: string;
}

export interface BuildNoteEntry {
  id: string;
  content: string;
  imageUrls: string[];
  dateAdded: string;
  type: 'note' | 'issue' | 'modification' | 'achievement';
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrls: string[];
  dateAdded: string;
  tags: string[];
  specs?: {
    weight?: number;
    size?: string;
    motorKv?: number;
    batteryConfig?: string;
    flightController?: string;
    vtx?: string;
    [key: string]: string | number | undefined;
  };
}

export interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: 'website' | 'youtube' | 'blog' | 'store' | 'other';
  tags: string[];
  dateAdded: string;
  lastVisited?: string;
  isFavorite: boolean;
}
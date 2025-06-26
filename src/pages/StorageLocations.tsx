import React, { useState } from 'react';
import { useStorageLocationStore } from '../store/storageLocationStore';
import { Plus, Edit, Trash2, Search, Package, Archive, Box, Home, Grid, SlidersHorizontal } from 'lucide-react';
import { StorageLocation } from '../models/types';
import { useToaster } from '../components/ui/Toaster';

const StorageLocations: React.FC = () => {
  const { 
    filteredLocations, 
    locations,
    addLocation, 
    updateLocation, 
    deleteLocation,
    filterOptions,
    setFilterOptions
  } = useStorageLocationStore();
  const { addToast } = useToaster();
  
  const [newLocation, setNewLocation] = useState({ 
    name: '', 
    description: '', 
    type: 'shelf' as StorageLocation['type'],
    capacity: 0
  });
  const [editingLocation, setEditingLocation] = useState<StorageLocation | null>(null);
  const [showNewLocationForm, setShowNewLocationForm] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // Get type icon
  const getTypeIcon = (type: StorageLocation['type']) => {
    switch (type) {
      case 'shelf':
        return <Grid size={16} />;
      case 'drawer':
        return <Archive size={16} />;
      case 'box':
        return <Box size={16} />;
      case 'cabinet':
        return <Package size={16} />;
      case 'room':
        return <Home size={16} />;
      default:
        return <Package size={16} />;
    }
  };
  
  // Get type color
  const getTypeColor = (type: StorageLocation['type']) => {
    switch (type) {
      case 'shelf':
        return 'bg-blue-500/20 text-blue-400';
      case 'drawer':
        return 'bg-green-500/20 text-green-400';
      case 'box':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'cabinet':
        return 'bg-purple-500/20 text-purple-400';
      case 'room':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-neutral-500/20 text-neutral-400';
    }
  };
  
  // Submit new location
  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLocation.name.trim()) {
      addToast('error', 'Location name is required');
      return;
    }
    
    // Check if location name already exists
    const existingLocation = locations.find(loc => 
      loc.name.toLowerCase() === newLocation.name.toLowerCase()
    );
    
    if (existingLocation) {
      addToast('error', 'A storage location with this name already exists');
      return;
    }
    
    try {
      addLocation({
        name: newLocation.name.trim(),
        description: newLocation.description.trim(),
        type: newLocation.type,
        capacity: newLocation.capacity > 0 ? newLocation.capacity : undefined
      });
      
      setNewLocation({ name: '', description: '', type: 'shelf', capacity: 0 });
      setShowNewLocationForm(false);
      addToast('success', `Storage location "${newLocation.name}" created successfully`);
    } catch (error) {
      console.error('Error creating storage location:', error);
      addToast('error', 'Failed to create storage location. Please try again.');
    }
  };
  
  // Submit edit location
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingLocation || !editingLocation.name.trim()) {
      addToast('error', 'Location name is required');
      return;
    }
    
    // Check if location name already exists (excluding current location)
    const existingLocation = locations.find(loc => 
      loc.id !== editingLocation.id && 
      loc.name.toLowerCase() === editingLocation.name.toLowerCase()
    );
    
    if (existingLocation) {
      addToast('error', 'A storage location with this name already exists');
      return;
    }
    
    try {
      updateLocation(editingLocation.id, {
        name: editingLocation.name.trim(),
        description: editingLocation.description?.trim(),
        type: editingLocation.type,
        capacity: editingLocation.capacity && editingLocation.capacity > 0 ? editingLocation.capacity : undefined
      });
      
      setEditingLocation(null);
      addToast('success', `Storage location "${editingLocation.name}" updated successfully`);
    } catch (error) {
      console.error('Error updating storage location:', error);
      addToast('error', 'Failed to update storage location. Please try again.');
    }
  };
  
  // Delete a location
  const handleDeleteLocation = (location: StorageLocation) => {
    try {
      deleteLocation(location.id);
      addToast('success', `Storage location "${location.name}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting storage location:', error);
      addToast('error', 'Failed to delete storage location. Please try again.');
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate capacity percentage
  const getCapacityPercentage = (location: StorageLocation) => {
    if (!location.capacity || location.capacity === 0) return 0;
    return Math.min(100, ((location.currentItems || 0) / location.capacity) * 100);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-200">Storage Locations</h2>
          <p className="text-neutral-400">Manage where you store your drone parts</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFilterPanel(!showFilterPanel)} 
            className="liquid-glass flex items-center gap-2 px-4 py-2 hover:bg-neutral-700 rounded-lg transition-all duration-300 text-neutral-200"
          >
            <SlidersHorizontal size={16} />
            <span>Filter</span>
          </button>
          
          <button
            onClick={() => {
              setEditingLocation(null);
              setShowNewLocationForm(!showNewLocationForm);
            }}
            className="liquid-glass flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-300"
          >
            <Plus size={16} />
            <span>New Location</span>
          </button>
        </div>
      </div>
      
      {/* Filter panel */}
      {showFilterPanel && (
        <div className="liquid-glass bg-neutral-800 p-4 rounded-lg shadow-lg animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-neutral-200">Filter & Sort</h3>
            <button 
              onClick={() => setShowFilterPanel(false)}
              className="liquid-glass p-1.5 text-neutral-400 hover:text-neutral-300 rounded transition-all duration-300"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={filterOptions.searchTerm}
                  onChange={(e) => setFilterOptions({ searchTerm: e.target.value })}
                  className="liquid-glass w-full pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Types</label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {['shelf', 'drawer', 'box', 'cabinet', 'room', 'other'].map(type => (
                  <div key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`type-${type}`}
                      checked={filterOptions.types.includes(type as any)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...filterOptions.types, type as any]
                          : filterOptions.types.filter(t => t !== type);
                        setFilterOptions({ types: newTypes });
                      }}
                      className="mr-2"
                    />
                    <label 
                      htmlFor={`type-${type}`}
                      className="text-neutral-300 text-sm cursor-pointer capitalize"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Sort By</label>
              <select
                value={`${filterOptions.sortBy}-${filterOptions.sortDirection}`}
                onChange={(e) => {
                  const [sortBy, sortDirection] = e.target.value.split('-');
                  setFilterOptions({ 
                    sortBy: sortBy as any,
                    sortDirection: sortDirection as 'asc' | 'desc'
                  });
                }}
                className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="type-asc">Type (A-Z)</option>
                <option value="type-desc">Type (Z-A)</option>
                <option value="capacity-asc">Capacity (Low to High)</option>
                <option value="capacity-desc">Capacity (High to Low)</option>
                <option value="dateAdded-desc">Newest First</option>
                <option value="dateAdded-asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* New Location Form */}
      {showNewLocationForm && (
        <div className="liquid-glass bg-neutral-800 p-6 rounded-lg shadow-lg animate-fade-in">
          <h3 className="text-lg font-medium text-white mb-4">Add New Storage Location</h3>
          
          <form onSubmit={handleLocationSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  placeholder="e.g., Shelf A1, Drawer B2"
                  required
                  maxLength={50}
                />
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-neutral-300 mb-1">
                  Type
                </label>
                <select
                  id="type"
                  value={newLocation.type}
                  onChange={(e) => setNewLocation({ 
                    ...newLocation, 
                    type: e.target.value as StorageLocation['type']
                  })}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                >
                  <option value="shelf">Shelf</option>
                  <option value="drawer">Drawer</option>
                  <option value="box">Box</option>
                  <option value="cabinet">Cabinet</option>
                  <option value="room">Room</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={newLocation.description}
                onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
                className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                placeholder="Description of what's stored here (optional)"
                rows={2}
                maxLength={200}
              />
            </div>
            
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-neutral-300 mb-1">
                Capacity (optional)
              </label>
              <input
                type="number"
                id="capacity"
                min="0"
                value={newLocation.capacity}
                onChange={(e) => setNewLocation({ 
                  ...newLocation, 
                  capacity: parseInt(e.target.value) || 0
                })}
                className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                placeholder="Maximum number of items"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Leave empty or 0 for unlimited capacity
              </p>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowNewLocationForm(false);
                  setNewLocation({ name: '', description: '', type: 'shelf', capacity: 0 });
                }}
                className="liquid-glass px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newLocation.name.trim()}
                className="liquid-glass px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Location
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Edit Location Modal */}
      {editingLocation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="liquid-glass bg-neutral-800 p-6 rounded-lg shadow-xl w-full max-w-md animate-fade-in">
            <h3 className="text-lg font-medium text-white mb-4">Edit Storage Location</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-neutral-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="edit-name"
                  value={editingLocation.name}
                  onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  required
                  maxLength={50}
                />
              </div>
              
              <div>
                <label htmlFor="edit-type" className="block text-sm font-medium text-neutral-300 mb-1">
                  Type
                </label>
                <select
                  id="edit-type"
                  value={editingLocation.type}
                  onChange={(e) => setEditingLocation({ 
                    ...editingLocation, 
                    type: e.target.value as StorageLocation['type']
                  })}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                >
                  <option value="shelf">Shelf</option>
                  <option value="drawer">Drawer</option>
                  <option value="box">Box</option>
                  <option value="cabinet">Cabinet</option>
                  <option value="room">Room</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  value={editingLocation.description || ''}
                  onChange={(e) => setEditingLocation({ 
                    ...editingLocation, 
                    description: e.target.value 
                  })}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  rows={2}
                  maxLength={200}
                />
              </div>
              
              <div>
                <label htmlFor="edit-capacity" className="block text-sm font-medium text-neutral-300 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  id="edit-capacity"
                  min="0"
                  value={editingLocation.capacity || 0}
                  onChange={(e) => setEditingLocation({ 
                    ...editingLocation, 
                    capacity: parseInt(e.target.value) || undefined
                  })}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLocation(null)}
                  className="liquid-glass px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="liquid-glass px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white transition-all duration-300"
                >
                  Update Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Locations Grid */}
      {filteredLocations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package size={64} className="text-neutral-600 mb-4" />
          <h3 className="text-xl font-medium text-neutral-300 mb-2">No storage locations found</h3>
          <p className="text-neutral-400 max-w-md">
            Create storage locations to organize where you keep your drone parts.
          </p>
          <button
            onClick={() => setShowNewLocationForm(true)}
            className="mt-4 px-4 py-2 liquid-glass bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-300"
          >
            Add Your First Location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              className="liquid-glass bg-neutral-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`p-2 rounded-lg ${getTypeColor(location.type)}`}>
                    {getTypeIcon(location.type)}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium text-white">{location.name}</h3>
                    <span className="text-sm text-neutral-400 capitalize">{location.type}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingLocation(location)}
                    className="liquid-glass p-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-white transition-all duration-300"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteLocation(location)}
                    className="liquid-glass p-1.5 bg-red-500/80 hover:bg-red-600 rounded text-white transition-all duration-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {location.description && (
                <p className="text-neutral-300 text-sm mb-4">{location.description}</p>
              )}
              
              {location.capacity && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Capacity</span>
                    <span className="text-neutral-300">
                      {location.currentItems || 0} / {location.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        getCapacityPercentage(location) > 80 
                          ? 'bg-red-500' 
                          : getCapacityPercentage(location) > 60 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${getCapacityPercentage(location)}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="text-sm text-neutral-500">
                Created {formatDate(location.dateAdded)}
                {location.lastModified && (
                  <>
                    <br />
                    Updated {formatDate(location.lastModified)}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StorageLocations;
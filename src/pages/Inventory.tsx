import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Filter, ArrowUpDown, Trash2, Edit, Image, 
  AlignJustify, Grid, SlidersHorizontal, Package, CheckCircle, Clock,
  Star, AlertTriangle, Wrench, XCircle
} from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';
import { Part, FilterOptions } from '../models/types';
import { useToaster } from '../components/ui/Toaster';

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const { addToast } = useToaster();
  
  const { 
    filteredParts, 
    filterOptions, 
    setFilterOptions,
    categories,
    deletePart
  } = useInventoryStore();
  
  // Function to handle sorting
  const handleSort = (sortBy: FilterOptions['sortBy']) => {
    if (filterOptions.sortBy === sortBy) {
      // Toggle direction if same sort field
      setFilterOptions({ 
        sortDirection: filterOptions.sortDirection === 'asc' ? 'desc' : 'asc' 
      });
    } else {
      // Set new sort field with default direction
      setFilterOptions({ sortBy, sortDirection: 'asc' });
    }
  };
  
  // Function to handle part deletion
  const handleDeletePart = (id: string, name: string) => {
    // In a real app, we might want to show a confirmation dialog here
    deletePart(id);
    addToast('success', `Part "${name}" deleted successfully`);
  };
  
  // Helper function to show stock status
  const getStockStatus = (quantity: number, inUse: number) => {
    if (quantity === 0) {
      return <span className="text-red-500">Out of stock</span>;
    } else if (quantity <= 3) {
      return <span className="text-yellow-500">Low stock ({quantity})</span>;
    } else {
      return (
        <span className="text-green-500">
          In stock ({quantity})
          {inUse > 0 && <span className="text-neutral-400 ml-1">({inUse} in use)</span>}
        </span>
      );
    }
  };

  // Get status badge
  const getStatusBadge = (status: Part['status']) => {
    switch (status) {
      case 'in-stock':
        return (
          <span className="liquid-glass inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
            <CheckCircle size={12} />
            In Stock
          </span>
        );
      case 'in-use':
        return (
          <span className="liquid-glass inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
            <Clock size={12} />
            In Use
          </span>
        );
    }
  };

  // Get condition badge
  const getConditionBadge = (condition: Part['condition']) => {
    switch (condition) {
      case 'new':
        return (
          <span className="liquid-glass inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
            <Star size={12} />
            New
          </span>
        );
      case 'good':
        return (
          <span className="liquid-glass inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
            <CheckCircle size={12} />
            Good
          </span>
        );
      case 'fair':
        return (
          <span className="liquid-glass inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
            <AlertTriangle size={12} />
            Fair
          </span>
        );
      case 'poor':
        return (
          <span className="liquid-glass inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
            <AlertTriangle size={12} />
            Poor
          </span>
        );
      case 'broken':
        return (
          <span className="liquid-glass inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
            <XCircle size={12} />
            Broken
          </span>
        );
      case 'needs-repair':
        return (
          <span className="liquid-glass inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
            <Wrench size={12} />
            Needs Repair
          </span>
        );
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-200">Inventory</h2>
          <p className="text-neutral-400">Manage your drone parts collection</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFilterPanel(!showFilterPanel)} 
            className="liquid-glass flex items-center gap-2 px-4 py-2 hover:bg-neutral-700 rounded-lg transition-all duration-300 text-neutral-200"
          >
            <Filter size={16} />
            <span>Filter</span>
          </button>
          
          <div className="liquid-glass flex bg-neutral-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-neutral-700 text-white' : 'text-neutral-400'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-neutral-700 text-white' : 'text-neutral-400'}`}
            >
              <AlignJustify size={18} />
            </button>
          </div>
          
          <button 
            onClick={() => navigate('/parts/new')}
            className="liquid-glass flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-300 ml-2"
          >
            <Plus size={16} />
            <span>New Part</span>
          </button>
        </div>
      </div>
      
      {/* Filter panel */}
      {showFilterPanel && (
        <div className="liquid-glass p-4 rounded-lg shadow-lg animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-neutral-200">Filter & Sort</h3>
            <button 
              onClick={() => setShowFilterPanel(false)}
              className="liquid-glass p-1.5 text-neutral-400 hover:text-neutral-300 rounded transition-all duration-300"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Categories</label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={filterOptions.categories.includes(category.name)}
                      onChange={(e) => {
                        const newCategories = e.target.checked
                          ? [...filterOptions.categories, category.name]
                          : filterOptions.categories.filter(c => c !== category.name);
                        setFilterOptions({ categories: newCategories });
                      }}
                      className="mr-2"
                    />
                    <label 
                      htmlFor={`category-${category.id}`}
                      className="text-neutral-300 text-sm cursor-pointer"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Status</label>
              <div className="space-y-1">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="status-in-stock"
                    checked={filterOptions.status?.includes('in-stock') ?? true}
                    onChange={(e) => {
                      const currentStatus = filterOptions.status || ['in-stock', 'in-use'];
                      const newStatus = e.target.checked
                        ? [...currentStatus.filter(s => s !== 'in-stock'), 'in-stock'] as ('in-stock' | 'in-use')[]
                        : currentStatus.filter(s => s !== 'in-stock') as ('in-stock' | 'in-use')[];
                      setFilterOptions({ status: newStatus });
                    }}
                    className="mr-2"
                  />
                  <label htmlFor="status-in-stock" className="text-neutral-300 text-sm cursor-pointer">
                    In Stock
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="status-in-use"
                    checked={filterOptions.status?.includes('in-use') ?? true}
                    onChange={(e) => {
                      const currentStatus = filterOptions.status || ['in-stock', 'in-use'];
                      const newStatus = e.target.checked
                        ? [...currentStatus.filter(s => s !== 'in-use'), 'in-use'] as ('in-stock' | 'in-use')[]
                        : currentStatus.filter(s => s !== 'in-use') as ('in-stock' | 'in-use')[];
                      setFilterOptions({ status: newStatus });
                    }}
                    className="mr-2"
                  />
                  <label htmlFor="status-in-use" className="text-neutral-300 text-sm cursor-pointer">
                    In Use
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Condition</label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {(['new', 'good', 'fair', 'poor', 'broken', 'needs-repair'] as const).map(condition => (
                  <div key={condition} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`condition-${condition}`}
                      checked={filterOptions.conditions.includes(condition)}
                      onChange={(e) => {
                        const newConditions = e.target.checked
                          ? [...filterOptions.conditions, condition]
                          : filterOptions.conditions.filter(c => c !== condition);
                        setFilterOptions({ conditions: newConditions });
                      }}
                      className="mr-2"
                    />
                    <label 
                      htmlFor={`condition-${condition}`}
                      className="text-neutral-300 text-sm cursor-pointer"
                    >
                      {condition === 'needs-repair' ? 'Needs Repair' : condition.charAt(0).toUpperCase() + condition.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Stock Status</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="in-stock"
                  checked={filterOptions.inStock}
                  onChange={(e) => setFilterOptions({ inStock: e.target.checked })}
                  className="mr-2"
                />
                <label 
                  htmlFor="in-stock"
                  className="text-neutral-300 text-sm cursor-pointer"
                >
                  In Stock Only
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Sort By</label>
              <select
                value={`${filterOptions.sortBy}-${filterOptions.sortDirection}`}
                onChange={(e) => {
                  const [sortBy, sortDirection] = e.target.value.split('-');
                  setFilterOptions({ 
                    sortBy: sortBy as FilterOptions['sortBy'],
                    sortDirection: sortDirection as 'asc' | 'desc'
                  });
                }}
                className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="category-asc">Category (A-Z)</option>
                <option value="category-desc">Category (Z-A)</option>
                <option value="quantity-asc">Quantity (Low to High)</option>
                <option value="quantity-desc">Quantity (High to Low)</option>
                <option value="dateAdded-desc">Newest First</option>
                <option value="dateAdded-asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Grid View */}
      {viewMode === 'grid' && (
        <>
          {filteredParts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package size={64} className="text-neutral-600 mb-4" />
              <h3 className="text-xl font-medium text-neutral-300 mb-2">No parts found</h3>
              <p className="text-neutral-400 max-w-md">
                Try adjusting your filters or add some new parts to your inventory.
              </p>
              <button
                onClick={() => navigate('/parts/new')}
                className="mt-4 px-4 py-2 liquid-glass bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-300"
              >
                Add Your First Part
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredParts.map((part) => (
                <div 
                  key={part.id}
                  className="liquid-glass rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div 
                    className="h-48 bg-neutral-700 relative cursor-pointer"
                    onClick={() => navigate(`/parts/${part.id}`)}
                  >
                    {part.imageUrls && part.imageUrls.length > 0 ? (
                      <img 
                        src={part.imageUrls[0]} 
                        alt={part.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image size={48} className="text-neutral-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                      <div className="p-3 w-full">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/parts/${part.id}`);
                            }}
                            className="liquid-glass p-1.5 bg-neutral-800/80 rounded-full hover:bg-neutral-700 text-white transition-all duration-300"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePart(part.id, part.name);
                            }}
                            className="liquid-glass p-1.5 bg-red-500/80 rounded-full hover:bg-red-600 text-white transition-all duration-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div 
                      className="mb-2 cursor-pointer"
                      onClick={() => navigate(`/parts/${part.id}`)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-white truncate hover:text-primary-400 transition-colors">
                          {part.name}
                        </h3>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(part.status)}
                          {getConditionBadge(part.condition)}
                        </div>
                      </div>
                      <p className="text-neutral-400 text-sm">
                        {part.category} {part.subcategory ? `/ ${part.subcategory}` : ''}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">{getStockStatus(part.quantity, part.inUse)}</div>
                      <div className="text-white font-medium">
                        ${part.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* List View */}
      {viewMode === 'list' && (
        <div className="liquid-glass rounded-lg overflow-hidden shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-700">
                  <th className="py-3 px-4 text-left font-medium text-neutral-300">
                    <button 
                      className="liquid-glass flex items-center gap-2 px-2 py-1 rounded transition-all duration-300"
                      onClick={() => handleSort('name')}
                    >
                      Part 
                      <ArrowUpDown size={14} className="text-neutral-400" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-neutral-300">
                    <button 
                      className="liquid-glass flex items-center gap-2 px-2 py-1 rounded transition-all duration-300"
                      onClick={() => handleSort('category')}
                    >
                      Category 
                      <ArrowUpDown size={14} className="text-neutral-400" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-neutral-300">Status</th>
                  <th className="py-3 px-4 text-left font-medium text-neutral-300">Condition</th>
                  <th className="py-3 px-4 text-left font-medium text-neutral-300">
                    <button 
                      className="liquid-glass flex items-center gap-2 px-2 py-1 rounded transition-all duration-300"
                      onClick={() => handleSort('quantity')}
                    >
                      Quantity 
                      <ArrowUpDown size={14} className="text-neutral-400" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-neutral-300">Price</th>
                  <th className="py-3 px-4 text-left font-medium text-neutral-300">Location</th>
                  <th className="py-3 px-4 text-right font-medium text-neutral-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-neutral-400">
                      No parts found. Try adjusting filters or add new parts.
                    </td>
                  </tr>
                ) : (
                  filteredParts.map((part) => (
                    <tr key={part.id} className="liquid-glass border-t border-neutral-700 hover:bg-neutral-700/30 transition-all duration-300">
                      <td className="py-3 px-4">
                        <div 
                          className="flex items-center cursor-pointer" 
                          onClick={() => navigate(`/parts/${part.id}`)}
                        >
                          {part.imageUrls && part.imageUrls.length > 0 ? (
                            <img
                              src={part.imageUrls[0]}
                              alt={part.name}
                              className="w-10 h-10 mr-3 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 mr-3 bg-neutral-700 rounded flex items-center justify-center">
                              <Package size={18} className="text-neutral-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white hover:text-primary-400 transition-colors">{part.name}</p>
                            {part.manufacturer && (
                              <p className="text-xs text-neutral-400">{part.manufacturer}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-300">
                        {part.category}
                        {part.subcategory && <span className="text-neutral-500 text-sm ml-1">/ {part.subcategory}</span>}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(part.status)}</td>
                      <td className="py-3 px-4">{getConditionBadge(part.condition)}</td>
                      <td className="py-3 px-4">{getStockStatus(part.quantity, part.inUse)}</td>
                      <td className="py-3 px-4 text-neutral-300">${part.price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-neutral-300">{part.location}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/parts/${part.id}`)}
                            className="liquid-glass p-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-white transition-all duration-300"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePart(part.id, part.name)}
                            className="liquid-glass p-1.5 bg-red-500/80 hover:bg-red-600 rounded text-white transition-all duration-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
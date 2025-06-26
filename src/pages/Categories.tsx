import React, { useState } from 'react';
import { useInventoryStore } from '../store/inventoryStore';
import { Plus, Edit, Trash2, ChevronRight, Package } from 'lucide-react';
import { Category, Subcategory } from '../models/types';
import { useToaster } from '../components/ui/Toaster';

const Categories: React.FC = () => {
  const { categories, parts, addCategory, updateCategory, deleteCategory, addSubcategory, deleteSubcategory } = useInventoryStore();
  const { addToast } = useToaster();
  
  const [newCategory, setNewCategory] = useState({ name: '', description: '', color: '#3B82F6' });
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [newSubcategory, setNewSubcategory] = useState({ name: '', description: '', categoryId: '' });
  const [showNewSubcategoryForm, setShowNewSubcategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Toggle category expansion
  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };
  
  // Submit new category
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.name.trim()) {
      addToast('error', 'Category name is required');
      return;
    }
    
    // Check if category name already exists
    const existingCategory = categories.find(cat => 
      cat.name.toLowerCase() === newCategory.name.toLowerCase()
    );
    
    if (existingCategory) {
      addToast('error', 'A category with this name already exists');
      return;
    }
    
    try {
      addCategory({
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
        color: newCategory.color
      });
      
      setNewCategory({ name: '', description: '', color: '#3B82F6' });
      setShowNewCategoryForm(false);
      addToast('success', `Category "${newCategory.name}" created successfully`);
    } catch (error) {
      console.error('Error creating category:', error);
      addToast('error', 'Failed to create category. Please try again.');
    }
  };
  
  // Handle category edit
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description || '',
      color: category.color
    });
    setShowNewCategoryForm(true);
  };
  
  // Handle category update
  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCategory || !newCategory.name.trim()) {
      addToast('error', 'Category name is required');
      return;
    }
    
    // Check if category name already exists (excluding the current category)
    const existingCategory = categories.find(cat => 
      cat.id !== editingCategory.id && 
      cat.name.toLowerCase() === newCategory.name.toLowerCase()
    );
    
    if (existingCategory) {
      addToast('error', 'A category with this name already exists');
      return;
    }
    
    try {
      updateCategory(editingCategory.id, {
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
        color: newCategory.color
      });
      
      setNewCategory({ name: '', description: '', color: '#3B82F6' });
      setShowNewCategoryForm(false);
      setEditingCategory(null);
      addToast('success', `Category "${newCategory.name}" updated successfully`);
    } catch (error) {
      console.error('Error updating category:', error);
      addToast('error', 'Failed to update category. Please try again.');
    }
  };
  
  // Submit new subcategory
  const handleSubcategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcategory.name.trim() || !newSubcategory.categoryId) {
      addToast('error', 'Subcategory name and parent category are required');
      return;
    }
    
    // Check if subcategory name already exists in this category
    const parentCategory = categories.find(cat => cat.id === newSubcategory.categoryId);
    if (parentCategory) {
      const existingSubcategory = parentCategory.subcategories.find(sub => 
        sub.name.toLowerCase() === newSubcategory.name.toLowerCase()
      );
      
      if (existingSubcategory) {
        addToast('error', 'A subcategory with this name already exists in this category');
        return;
      }
    }
    
    try {
      addSubcategory(
        newSubcategory.categoryId,
        newSubcategory.name.trim(),
        newSubcategory.description.trim()
      );
      
      setNewSubcategory({ name: '', description: '', categoryId: '' });
      setShowNewSubcategoryForm(false);
      addToast('success', `Subcategory "${newSubcategory.name}" created successfully`);
    } catch (error) {
      console.error('Error creating subcategory:', error);
      addToast('error', 'Failed to create subcategory. Please try again.');
    }
  };
  
  // Delete a category
  const handleDeleteCategory = (category: Category) => {
    // Check if parts are using this category
    const partsUsingCategory = parts.filter(part => part.category === category.name);
    
    if (partsUsingCategory.length > 0) {
      addToast('error', `Cannot delete category "${category.name}" because it's in use by ${partsUsingCategory.length} parts`);
      return;
    }
    
    try {
      deleteCategory(category.id);
      addToast('success', `Category "${category.name}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting category:', error);
      addToast('error', 'Failed to delete category. Please try again.');
    }
  };
  
  // Delete a subcategory
  const handleDeleteSubcategory = (categoryId: string, subcategory: Subcategory) => {
    // Check if parts are using this subcategory
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    const partsUsingSubcategory = parts.filter(
      part => part.category === category.name && part.subcategory === subcategory.name
    );
    
    if (partsUsingSubcategory.length > 0) {
      addToast('error', `Cannot delete subcategory "${subcategory.name}" because it's in use by ${partsUsingSubcategory.length} parts`);
      return;
    }
    
    try {
      deleteSubcategory(categoryId, subcategory.id);
      addToast('success', `Subcategory "${subcategory.name}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      addToast('error', 'Failed to delete subcategory. Please try again.');
    }
  };
  
  // Count parts in category and subcategories
  const countPartsInCategory = (categoryName: string, subcategoryName?: string) => {
    if (subcategoryName) {
      return parts.filter(
        part => part.category === categoryName && part.subcategory === subcategoryName
      ).length;
    }
    
    return parts.filter(part => part.category === categoryName).length;
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-200">Categories</h2>
          <p className="text-neutral-400">Organize your drone parts by category</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setShowNewSubcategoryForm(false);
              setShowNewCategoryForm(!showNewCategoryForm);
              if (!showNewCategoryForm) {
                setEditingCategory(null);
                setNewCategory({ name: '', description: '', color: '#3B82F6' });
              }
            }}
            className="liquid-glass flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-300"
          >
            <Plus size={16} />
            <span>New Category</span>
          </button>
          
          <button
            onClick={() => {
              setShowNewCategoryForm(false);
              setShowNewSubcategoryForm(!showNewSubcategoryForm);
            }}
            className="liquid-glass flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-all duration-300"
          >
            <Plus size={16} />
            <span>New Subcategory</span>
          </button>
        </div>
      </div>
      
      {/* New/Edit Category Form */}
      {showNewCategoryForm && (
        <div className="liquid-glass bg-neutral-800 p-4 rounded-lg shadow-lg animate-fade-in">
          <h3 className="text-lg font-medium text-white mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h3>
          
          <form onSubmit={editingCategory ? handleUpdateCategory : handleCategorySubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                placeholder="Category name"
                required
                maxLength={50}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                placeholder="Category description (optional)"
                rows={2}
                maxLength={200}
              />
            </div>
            
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-neutral-300 mb-1">
                Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="h-10 w-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="liquid-glass w-32 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  placeholder="#RRGGBB"
                  pattern="^#([A-Fa-f0-9]{6})$"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowNewCategoryForm(false);
                  setEditingCategory(null);
                  setNewCategory({ name: '', description: '', color: '#3B82F6' });
                }}
                className="liquid-glass px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="liquid-glass px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-300"
              >
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* New Subcategory Form */}
      {showNewSubcategoryForm && (
        <div className="liquid-glass bg-neutral-800 p-4 rounded-lg shadow-lg animate-fade-in">
          <h3 className="text-lg font-medium text-white mb-4">Add New Subcategory</h3>
          
          <form onSubmit={handleSubcategorySubmit} className="space-y-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-neutral-300 mb-1">
                Parent Category *
              </label>
              <select
                id="category"
                value={newSubcategory.categoryId}
                onChange={(e) => setNewSubcategory({ ...newSubcategory, categoryId: e.target.value })}
                className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="subcategory-name" className="block text-sm font-medium text-neutral-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="subcategory-name"
                value={newSubcategory.name}
                onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
                className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                placeholder="Subcategory name"
                required
                maxLength={50}
              />
            </div>
            
            <div>
              <label htmlFor="subcategory-description" className="block text-sm font-medium text-neutral-300 mb-1">
                Description
              </label>
              <textarea
                id="subcategory-description"
                value={newSubcategory.description}
                onChange={(e) => setNewSubcategory({ ...newSubcategory, description: e.target.value })}
                className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                placeholder="Subcategory description (optional)"
                rows={2}
                maxLength={200}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowNewSubcategoryForm(false);
                  setNewSubcategory({ name: '', description: '', categoryId: '' });
                }}
                className="liquid-glass px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="liquid-glass px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-300"
              >
                Create Subcategory
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Categories List */}
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="liquid-glass bg-neutral-800 rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleExpand(category.id)}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <ChevronRight
                      size={20}
                      className={`transform transition-transform ${
                        expandedCategories.includes(category.id) ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="text-lg font-medium text-white">{category.name}</h3>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400">
                    {countPartsInCategory(category.name)} parts
                  </span>
                  
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="liquid-glass p-1.5 text-neutral-400 hover:text-white transition-all duration-300"
                  >
                    <Edit size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="liquid-glass p-1.5 text-neutral-400 hover:text-red-400 transition-all duration-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {category.description && (
                <p className="mt-1 text-sm text-neutral-400 ml-8">
                  {category.description}
                </p>
              )}
            </div>
            
            {expandedCategories.includes(category.id) && (
              <div className="border-t border-neutral-700">
                {category.subcategories.length === 0 ? (
                  <div className="p-4 text-center text-neutral-400">
                    No subcategories yet
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-700">
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.id} className="p-4 pl-12">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">{subcategory.name}</h4>
                            {subcategory.description && (
                              <p className="text-sm text-neutral-400 mt-1">
                                {subcategory.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-neutral-400">
                              {countPartsInCategory(category.name, subcategory.name)} parts
                            </span>
                            
                            <button
                              onClick={() => handleDeleteSubcategory(category.id, subcategory)}
                              className="liquid-glass p-1.5 text-neutral-400 hover:text-red-400 transition-all duration-300"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
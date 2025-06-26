import React, { useState } from 'react';
import { 
  Plus, Search, Link as LinkIcon, Star, Youtube, Globe, 
  BookOpen, ShoppingBag, Tag, ExternalLink, Trash2, Edit 
} from 'lucide-react';
import { useLinkStore } from '../store/linkStore';
import { Link } from '../models/types';
import { useToaster } from '../components/ui/Toaster';

const Links: React.FC = () => {
  const { 
    filteredLinks, 
    filterOptions, 
    setFilterOptions,
    customTags,
    addLink,
    updateLink,
    deleteLink,
    toggleFavorite,
    updateLastVisited
  } = useLinkStore();
  const { addToast } = useToaster();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: 'website' as Link['category'],
    tags: [] as string[]
  });
  
  // New tag input
  const [newTag, setNewTag] = useState('');
  
  // Get category icon
  const getCategoryIcon = (category: Link['category']) => {
    switch (category) {
      case 'youtube':
        return <Youtube size={16} />;
      case 'blog':
        return <BookOpen size={16} />;
      case 'store':
        return <ShoppingBag size={16} />;
      default:
        return <Globe size={16} />;
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
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.url.trim()) {
      addToast('error', 'Title and URL are required');
      return;
    }
    
    if (editingLink) {
      updateLink(editingLink.id, formData);
      setEditingLink(null);
      addToast('success', 'Link updated successfully');
    } else {
      addLink(formData);
      addToast('success', 'Link added successfully');
    }
    
    setFormData({
      title: '',
      url: '',
      description: '',
      category: 'website',
      tags: []
    });
    setShowAddForm(false);
  };
  
  // Handle link deletion
  const handleDelete = (id: string, title: string) => {
    deleteLink(id);
    addToast('success', `"${title}" deleted successfully`);
  };
  
  // Handle link click
  const handleLinkClick = (id: string, url: string) => {
    updateLastVisited(id);
    window.open(url, '_blank');
  };
  
  // Add tag
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    
    const tag = newTag.toLowerCase().trim();
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setNewTag('');
  };
  
  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-200">Links</h2>
          <p className="text-neutral-400">Organize your drone-related resources</p>
        </div>
        
        <button
          onClick={() => {
            setEditingLink(null);
            setShowAddForm(!showAddForm);
          }}
          className="liquid-glass flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-300"
        >
          <Plus size={16} />
          <span>Add Link</span>
        </button>
      </div>
      
      {/* Add/Edit Form */}
      {(showAddForm || editingLink) && (
        <div className="liquid-glass bg-neutral-800 p-6 rounded-lg animate-fade-in">
          <h3 className="text-lg font-medium text-white mb-4">
            {editingLink ? 'Edit Link' : 'Add New Link'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-neutral-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  placeholder="Link title"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-neutral-300 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  placeholder="https://example.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                placeholder="Brief description"
                rows={2}
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-neutral-300 mb-1">
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  category: e.target.value as Link['category']
                })}
                className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
              >
                <option value="website">Website</option>
                <option value="youtube">YouTube</option>
                <option value="blog">Blog</option>
                <option value="store">Store</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="liquid-glass px-2 py-1 bg-neutral-700 text-neutral-300 rounded-lg text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="liquid-glass text-neutral-400 hover:text-red-400 transition-all duration-300"
                    >
                      <Trash2 size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddTag} className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="liquid-glass flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  placeholder="Add a tag"
                />
                <button
                  type="submit"
                  className="liquid-glass px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-all duration-300"
                >
                  Add
                </button>
              </form>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingLink(null);
                  setFormData({
                    title: '',
                    url: '',
                    description: '',
                    category: 'website',
                    tags: []
                  });
                }}
                className="liquid-glass px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="liquid-glass px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white transition-all duration-300"
              >
                {editingLink ? 'Save Changes' : 'Add Link'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search links..."
            value={filterOptions.searchTerm}
            onChange={(e) => setFilterOptions({ searchTerm: e.target.value })}
            className="liquid-glass w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const newCategories = filterOptions.categories.includes('website')
                ? filterOptions.categories.filter(c => c !== 'website')
                : [...filterOptions.categories, 'website'] as ('website' | 'youtube' | 'blog' | 'store' | 'other')[];
              setFilterOptions({ categories: newCategories });
            }}
            className={`liquid-glass px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-2 ${
              filterOptions.categories.includes('website')
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            <Globe size={16} />
            <span>Websites</span>
          </button>
          
          <button
            onClick={() => {
              const newCategories = filterOptions.categories.includes('youtube')
                ? filterOptions.categories.filter(c => c !== 'youtube')
                : [...filterOptions.categories, 'youtube'] as ('website' | 'youtube' | 'blog' | 'store' | 'other')[];
              setFilterOptions({ categories: newCategories });
            }}
            className={`liquid-glass px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-2 ${
              filterOptions.categories.includes('youtube')
                ? 'bg-red-500/20 text-red-400'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            <Youtube size={16} />
            <span>YouTube</span>
          </button>
          
          <button
            onClick={() => {
              const newCategories = filterOptions.categories.includes('blog')
                ? filterOptions.categories.filter(c => c !== 'blog')
                : [...filterOptions.categories, 'blog'] as ('website' | 'youtube' | 'blog' | 'store' | 'other')[];
              setFilterOptions({ categories: newCategories });
            }}
            className={`liquid-glass px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-2 ${
              filterOptions.categories.includes('blog')
                ? 'bg-green-500/20 text-green-400'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            <BookOpen size={16} />
            <span>Blogs</span>
          </button>
          
          <button
            onClick={() => {
              const newCategories = filterOptions.categories.includes('store')
                ? filterOptions.categories.filter(c => c !== 'store')
                : [...filterOptions.categories, 'store'] as ('website' | 'youtube' | 'blog' | 'store' | 'other')[];
              setFilterOptions({ categories: newCategories });
            }}
            className={`liquid-glass px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-2 ${
              filterOptions.categories.includes('store')
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            <ShoppingBag size={16} />
            <span>Stores</span>
          </button>
        </div>
        
        <button
          onClick={() => setFilterOptions({ 
            favoritesOnly: !filterOptions.favoritesOnly 
          })}
          className={`liquid-glass px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-2 ${
            filterOptions.favoritesOnly
              ? 'bg-primary-500/20 text-primary-400'
              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
          }`}
        >
          <Star size={16} />
          <span>Favorites</span>
        </button>
      </div>
      
      {/* Tags Filter */}
      {customTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customTags.map(tag => (
            <button
              key={tag}
              onClick={() => {
                const newTags = filterOptions.tags.includes(tag)
                  ? filterOptions.tags.filter(t => t !== tag)
                  : [...filterOptions.tags, tag];
                setFilterOptions({ tags: newTags });
              }}
              className={`liquid-glass px-2 py-1 rounded-lg transition-all duration-300 flex items-center gap-1.5 text-sm ${
                filterOptions.tags.includes(tag)
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              <Tag size={14} />
              <span>{tag}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Links List */}
      {filteredLinks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <LinkIcon size={64} className="text-neutral-600 mb-4" />
          <h3 className="text-xl font-medium text-neutral-300 mb-2">No links found</h3>
          <p className="text-neutral-400 max-w-md">
            Add some links to keep track of your favorite drone-related resources.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 px-4 py-2 liquid-glass bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-300"
          >
            Add Your First Link
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLinks.map((link) => (
            <div
              key={link.id}
              className="liquid-glass bg-neutral-800 rounded-lg p-4 hover:bg-neutral-700/80 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={() => toggleFavorite(link.id)}
                      className={`liquid-glass text-neutral-400 hover:text-yellow-400 transition-all duration-300 ${
                        link.isFavorite ? 'text-yellow-400' : ''
                      }`}
                    >
                      <Star size={18} fill={link.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                    
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <span className={`liquid-glass p-1 rounded ${
                        link.category === 'youtube'
                          ? 'bg-red-500/20 text-red-400'
                          : link.category === 'blog'
                            ? 'bg-green-500/20 text-green-400'
                            : link.category === 'store'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {getCategoryIcon(link.category)}
                      </span>
                      {link.title}
                    </h3>
                  </div>
                  
                  {link.description && (
                    <p className="text-neutral-300 mb-3">{link.description}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => handleLinkClick(link.id, link.url)}
                      className="liquid-glass text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1 transition-all duration-300"
                    >
                      <ExternalLink size={14} />
                      <span>{link.url}</span>
                    </button>
                    
                    <div className="flex flex-wrap gap-2">
                      {link.tags.map(tag => (
                        <span
                          key={tag}
                          className="liquid-glass px-2 py-0.5 bg-neutral-700/50 text-neutral-300 rounded text-xs flex items-center gap-1"
                        >
                          <Tag size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-neutral-500">
                    Added {formatDate(link.dateAdded)}
                    {link.lastVisited && (
                      <>
                        <span className="mx-2">•</span>
                        Last visited {formatDate(link.lastVisited)}
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setFormData({
                        title: link.title,
                        url: link.url,
                        description: link.description || '',
                        category: link.category,
                        tags: [...link.tags]
                      });
                      setEditingLink(link);
                      setShowAddForm(false);
                    }}
                    className="liquid-glass p-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-white transition-all duration-300"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(link.id, link.title)}
                    className="liquid-glass p-1.5 bg-red-500/80 hover:bg-red-600 rounded text-white transition-all duration-300"
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
  );
};

export default Links;
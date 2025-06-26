import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit, Image, Tag, ChevronDown } from 'lucide-react';
import { useGalleryStore } from '../store/galleryStore';
import { GalleryItem } from '../models/types';
import { useToaster } from '../components/ui/Toaster';

const GalleryItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getItem, addItem, updateItem, deleteItem, customTags } = useGalleryStore();
  const { addToast } = useToaster();
  
  const [item, setItem] = useState<GalleryItem | null>(
    id && id !== 'new' ? getItem(id) || null : null
  );
  
  const [isEditing, setIsEditing] = useState(id === 'new');
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrls: [''],
    tags: [] as string[],
    specs: {
      weight: '',
      size: '',
      motorKv: '',
      batteryConfig: '',
      flightController: '',
      vtx: ''
    }
  });
  
  // New tag input
  const [newTag, setNewTag] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  
  // Initialize form data when component mounts or item changes
  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description,
        imageUrls: [...item.imageUrls],
        tags: [...item.tags],
        specs: {
          weight: item.specs?.weight?.toString() || '',
          size: item.specs?.size || '',
          motorKv: item.specs?.motorKv?.toString() || '',
          batteryConfig: item.specs?.batteryConfig || '',
          flightController: item.specs?.flightController || '',
          vtx: item.specs?.vtx || ''
        }
      });
    }
  }, [item]);
  
  // Filter tag suggestions based on input
  useEffect(() => {
    console.log('Tag suggestions effect triggered:', {
      newTag,
      customTagsLength: customTags.length,
      customTags,
      formDataTags: formData.tags
    });

    if (newTag.trim()) {
      // Show suggestions even if input doesn't match exactly
      const filtered = customTags
        .filter(tag => 
          tag.toLowerCase().includes(newTag.toLowerCase()) && 
          !formData.tags.includes(tag)
        )
        .slice(0, 5); // Limit to 5 suggestions
      
      console.log('Filtered suggestions:', filtered);
      setFilteredSuggestions(filtered);
      setShowTagSuggestions(filtered.length > 0);
    } else {
      // When input is empty, show all available tags (excluding already added ones)
      const availableTags = customTags
        .filter(tag => !formData.tags.includes(tag))
        .slice(0, 5);
      console.log('Available tags when empty:', availableTags);
      setFilteredSuggestions(availableTags);
      setShowTagSuggestions(availableTags.length > 0);
    }
  }, [newTag, customTags, formData.tags]);
  
  // Handle form change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith('specs.')) {
      const specName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specs: {
          ...prev.specs,
          [specName]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle image URL change
  const handleImageUrlChange = (index: number, value: string) => {
    const newImageUrls = [...formData.imageUrls];
    newImageUrls[index] = value;
    setFormData({ ...formData, imageUrls: newImageUrls });
  };
  
  // Add new image URL field
  const addImageUrlField = () => {
    setFormData({ 
      ...formData, 
      imageUrls: [...formData.imageUrls, ''] 
    });
  };
  
  // Remove image URL field
  const removeImageUrlField = (index: number) => {
    if (formData.imageUrls.length <= 1) return;
    const newImageUrls = [...formData.imageUrls];
    newImageUrls.splice(index, 1);
    setFormData({ ...formData, imageUrls: newImageUrls });
    
    if (selectedImage >= newImageUrls.length) {
      setSelectedImage(newImageUrls.length - 1);
    }
  };
  
  // Add tag
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    
    const tag = newTag.toLowerCase().trim().replace(/\s+/g, '-');
    
    // Validate tag format
    if (!/^[a-z0-9-]+$/.test(tag)) {
      addToast('error', 'Tags can only contain letters, numbers, and hyphens');
      return;
    }
    
    // Check for duplicates
    if (formData.tags.includes(tag)) {
      addToast('error', 'Tag already exists');
      return;
    }
    
    // Check minimum length
    if (tag.length < 2) {
      addToast('error', 'Tags must be at least 2 characters long');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tag]
    }));
    setNewTag('');
    addToast('success', `Tag "${tag}" added`);
  };
  
  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  // Add tag from suggestions
  const handleAddTagFromSuggestion = (suggestedTag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, suggestedTag]
    }));
    setNewTag('');
    setShowTagSuggestions(false);
    addToast('success', `Tag "${suggestedTag}" added`);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      addToast('error', 'Title is required');
      return;
    }
    
    const itemData = {
      title: formData.title,
      description: formData.description,
      imageUrls: formData.imageUrls.filter(url => url.trim()),
      tags: formData.tags,
      specs: {
        weight: formData.specs.weight ? parseInt(formData.specs.weight) : undefined,
        size: formData.specs.size || undefined,
        motorKv: formData.specs.motorKv ? parseInt(formData.specs.motorKv) : undefined,
        batteryConfig: formData.specs.batteryConfig || undefined,
        flightController: formData.specs.flightController || undefined,
        vtx: formData.specs.vtx || undefined
      }
    };
    
    if (id && id !== 'new') {
      updateItem(id, itemData);
      setItem(getItem(id) || null);
      setIsEditing(false);
      addToast('success', 'Gallery item updated successfully');
    } else {
      addItem(itemData);
      addToast('success', 'Gallery item added successfully');
      navigate('/gallery');
    }
  };
  
  // Handle delete
  const handleDelete = () => {
    if (!id || id === 'new' || !item) return;
    
    deleteItem(id);
    addToast('success', `"${item.title}" deleted from gallery`);
    navigate('/gallery');
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (isEditing || id === 'new') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-neutral-400 hover:text-white transition-colors mr-4"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span>Back</span>
          </button>
          
          <h2 className="text-2xl font-bold text-neutral-200">
            {id === 'new' ? 'Add to Gallery' : `Edit ${item?.title}`}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="liquid-glass bg-neutral-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-neutral-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  placeholder="Build name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  placeholder="Build description"
                  rows={3}
                />
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
                      <Tag size={12} />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="liquid-glass text-neutral-400 hover:text-red-400 transition-all duration-300"
                      >
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                
                <div className="relative">
                  <form onSubmit={handleAddTag} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onFocus={() => {
                          // Show suggestions when input is focused
                          const availableTags = customTags
                            .filter(tag => !formData.tags.includes(tag))
                            .slice(0, 5);
                          setFilteredSuggestions(availableTags);
                          setShowTagSuggestions(availableTags.length > 0);
                        }}
                        onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                        className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                        placeholder="Add a tag (letters, numbers, hyphens only)"
                      />
                      {showTagSuggestions && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 liquid-glass border border-white/20 rounded-lg shadow-xl backdrop-blur-sm max-h-48 overflow-y-auto">
                          <div className="p-2">
                            <div className="text-xs text-neutral-400 mb-2 px-2">Suggestions:</div>
                            {filteredSuggestions.length > 0 ? (
                              filteredSuggestions.map(suggestion => (
                                <button
                                  key={suggestion}
                                  type="button"
                                  onClick={() => handleAddTagFromSuggestion(suggestion)}
                                  className="w-full text-left px-2 py-1 text-sm text-neutral-300 hover:bg-neutral-600 rounded transition-colors flex items-center gap-2"
                                >
                                  <Tag size={12} />
                                  {suggestion}
                                </button>
                              ))
                            ) : (
                              <div className="px-2 py-1 text-xs text-neutral-500">
                                No matching tags found. Type to create a new tag.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="liquid-glass px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-all duration-300 flex items-center gap-2"
                    >
                      <Plus size={14} />
                      Add
                    </button>
                  </form>
                  
                  <div className="mt-2 flex items-center justify-between">
                    {customTags.length > 0 && (
                      <div className="text-xs text-neutral-500">
                        Available tags: {customTags.slice(0, 10).join(', ')}
                        {customTags.length > 10 && ` and ${customTags.length - 10} more...`}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const availableTags = customTags
                          .filter(tag => !formData.tags.includes(tag))
                          .slice(0, 5);
                        setFilteredSuggestions(availableTags);
                        setShowTagSuggestions(!showTagSuggestions);
                      }}
                      className="text-xs text-neutral-400 hover:text-neutral-300 transition-colors flex items-center gap-1"
                    >
                      <Tag size={10} />
                      {showTagSuggestions ? 'Hide' : 'Show'} suggestions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="liquid-glass bg-neutral-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Specifications</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="specs.size" className="block text-sm font-medium text-neutral-300 mb-1">
                  Size
                </label>
                <input
                  type="text"
                  id="specs.size"
                  name="specs.size"
                  value={formData.specs.size}
                  onChange={handleChange}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  placeholder="e.g., 5 inch"
                />
              </div>
              
              <div>
                <label htmlFor="specs.weight" className="block text-sm font-medium text-neutral-300 mb-1">
                  Weight (g)
                </label>
                <input
                  type="number"
                  id="specs.weight"
                  name="specs.weight"
                  value={formData.specs.weight}
                  onChange={handleChange}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  placeholder="Weight in grams"
                />
              </div>
              
              <div>
                <label htmlFor="specs.motorKv" className="block text-sm font-medium text-neutral-300 mb-1">
                  Motor KV
                </label>
                <input
                  type="number"
                  id="specs.motorKv"
                  name="specs.motorKv"
                  value={formData.specs.motorKv}
                  onChange={handleChange}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  placeholder="Motor KV rating"
                />
              </div>
              
              <div>
                <label htmlFor="specs.batteryConfig" className="block text-sm font-medium text-neutral-300 mb-1">
                  Battery Config
                </label>
                <input
                  type="text"
                  id="specs.batteryConfig"
                  name="specs.batteryConfig"
                  value={formData.specs.batteryConfig}
                  onChange={handleChange}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  placeholder="e.g., 6S 1300mAh"
                />
              </div>
              
              <div>
                <label htmlFor="specs.flightController" className="block text-sm font-medium text-neutral-300 mb-1">
                  Flight Controller
                </label>
                <input
                  type="text"
                  id="specs.flightController"
                  name="specs.flightController"
                  value={formData.specs.flightController}
                  onChange={handleChange}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  placeholder="FC model"
                />
              </div>
              
              <div>
                <label htmlFor="specs.vtx" className="block text-sm font-medium text-neutral-300 mb-1">
                  VTX
                </label>
                <input
                  type="text"
                  id="specs.vtx"
                  name="specs.vtx"
                  value={formData.specs.vtx}
                  onChange={handleChange}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  placeholder="VTX model"
                />
              </div>
            </div>
          </div>
          
          <div className="liquid-glass bg-neutral-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Images</h3>
            
            <div className="space-y-3">
              {formData.imageUrls.map((url, index) => (
                <div key={index} className="flex items-start gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    className="liquid-glass flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                    placeholder="Image URL"
                  />
                  
                  <button
                    type="button"
                    onClick={() => removeImageUrlField(index)}
                    className="liquid-glass p-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded-lg transition-all duration-300"
                    disabled={formData.imageUrls.length <= 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addImageUrlField}
                className="liquid-glass flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded-lg transition-all duration-300"
              >
                <Plus size={16} />
                <span>Add Image URL</span>
              </button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            {id !== 'new' && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="liquid-glass px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-all duration-300"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="liquid-glass px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white transition-all duration-300"
            >
              {id === 'new' ? 'Add to Gallery' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  }
  
  if (!item) return null;
  
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} className="mr-1" />
          <span>Back to Gallery</span>
        </button>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="liquid-glass flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-all duration-300"
          >
            <Edit size={16} />
            <span>Edit</span>
          </button>
          
          <button
            onClick={handleDelete}
            className="liquid-glass flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {/* Main Image */}
          <div className="liquid-glass bg-neutral-800 rounded-lg overflow-hidden shadow-lg">
            {item.imageUrls && item.imageUrls.length > 0 ? (
              <div className="aspect-w-16 aspect-h-9">
                <img 
                  src={item.imageUrls[selectedImage]} 
                  alt={item.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
            ) : (
              <div className="aspect-w-16 aspect-h-9 bg-neutral-900 flex items-center justify-center">
                <Image size={48} className="text-neutral-700" />
              </div>
            )}
          </div>
          
          {/* Image Thumbnails */}
          {item.imageUrls.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {item.imageUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  <img
                    src={url}
                    alt={`${item.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
          
          {/* Specifications */}
          {item.specs && Object.keys(item.specs).length > 0 && (
            <div className="liquid-glass bg-neutral-800 rounded-lg p-6 mt-6">
              <h3 className="font-medium text-lg text-white mb-4">Specifications</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {item.specs.size && (
                  <div>
                    <span className="text-neutral-400">Size:</span>
                    <span className="text-white ml-2">{item.specs.size}</span>
                  </div>
                )}
                {item.specs.weight && (
                  <div>
                    <span className="text-neutral-400">Weight:</span>
                    <span className="text-white ml-2">{item.specs.weight}g</span>
                  </div>
                )}
                {item.specs.motorKv && (
                  <div>
                    <span className="text-neutral-400">Motor KV:</span>
                    <span className="text-white ml-2">{item.specs.motorKv}</span>
                  </div>
                )}
                {item.specs.batteryConfig && (
                  <div>
                    <span className="text-neutral-400">Battery:</span>
                    <span className="text-white ml-2">{item.specs.batteryConfig}</span>
                  </div>
                )}
                {item.specs.flightController && (
                  <div>
                    <span className="text-neutral-400">FC:</span>
                    <span className="text-white ml-2">{item.specs.flightController}</span>
                  </div>
                )}
                {item.specs.vtx && (
                  <div>
                    <span className="text-neutral-400">VTX:</span>
                    <span className="text-white ml-2">{item.specs.vtx}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Build Info */}
          <div className="liquid-glass bg-neutral-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-2">{item.title}</h2>
            <p className="text-neutral-300 whitespace-pre-line">{item.description}</p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {item.tags.map(tag => (
                <span
                  key={tag}
                  className="liquid-glass px-2 py-1 bg-neutral-700/50 text-neutral-300 rounded text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-neutral-500">
              Added on {formatDate(item.dateAdded)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryItemDetail;
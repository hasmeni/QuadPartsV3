import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Edit, Image, Save,
  AlertTriangle, Trophy, Wrench, MessageSquare, CheckCircle
} from 'lucide-react';
import { useBuildStore } from '../store/buildStore';
import { useSettingsStore } from '../store/settingsStore';
import { BuildNote, BuildNoteEntry } from '../models/types';
import { useToaster } from '../components/ui/Toaster';
import { formatCurrency } from '../utils/currency';

const BuildNoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBuild, addBuild, updateBuild, addBuildNote, deleteBuildNote } = useBuildStore();
  const { settings } = useSettingsStore();
  const { addToast } = useToaster();
  
  const [build, setBuild] = useState<BuildNote | null>(
    id && id !== 'new' ? getBuild(id) || null : null
  );
  
  const [isEditing, setIsEditing] = useState(id === 'new');
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'planning' as BuildNote['status'],
    imageUrls: [''],
    specs: {
      weight: '',
      size: '',
      motorKv: '',
      batteryConfig: '',
      flightController: '',
      vtx: ''
    }
  });
  
  // New note form state
  const [newNote, setNewNote] = useState({
    content: '',
    type: 'note' as BuildNoteEntry['type'],
    imageUrls: ['']
  });
  
  // Initialize form data when component mounts or build changes
  useEffect(() => {
    if (build) {
      setFormData({
        title: build.title,
        description: build.description,
        status: build.status,
        imageUrls: [...build.imageUrls],
        specs: {
          weight: build.specs?.weight?.toString() || '',
          size: build.specs?.size || '',
          motorKv: build.specs?.motorKv?.toString() || '',
          batteryConfig: build.specs?.batteryConfig || '',
          flightController: build.specs?.flightController || '',
          vtx: build.specs?.vtx || ''
        }
      });
    }
  }, [build]);
  
  // Handle form change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
  };
  
  // Handle new note image URL change
  const handleNoteImageUrlChange = (index: number, value: string) => {
    const newImageUrls = [...newNote.imageUrls];
    newImageUrls[index] = value;
    setNewNote({ ...newNote, imageUrls: newImageUrls });
  };
  
  // Add new note image URL field
  const addNoteImageUrlField = () => {
    setNewNote({ 
      ...newNote, 
      imageUrls: [...newNote.imageUrls, ''] 
    });
  };
  
  // Remove note image URL field
  const removeNoteImageUrlField = (index: number) => {
    if (newNote.imageUrls.length <= 1) return;
    const newImageUrls = [...newNote.imageUrls];
    newImageUrls.splice(index, 1);
    setNewNote({ ...newNote, imageUrls: newImageUrls });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      addToast('error', 'Title is required');
      return;
    }
    
    const buildData = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      imageUrls: formData.imageUrls.filter(url => url.trim()),
      partsUsed: [],
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
      updateBuild(id, buildData);
      setBuild(getBuild(id) || null);
      setIsEditing(false);
      addToast('success', 'Build updated successfully');
    } else {
      addBuild(buildData);
      addToast('success', 'Build created successfully');
      navigate('/builds');
    }
  };
  
  // Handle new note submission
  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNote.content.trim()) {
      addToast('error', 'Note content is required');
      return;
    }
    
    if (!id || id === 'new') return;
    
    addBuildNote(id, {
      content: newNote.content,
      type: newNote.type,
      imageUrls: newNote.imageUrls.filter(url => url.trim())
    });
    
    setNewNote({
      content: '',
      type: 'note',
      imageUrls: ['']
    });
    setShowNewNoteForm(false);
    setBuild(getBuild(id) || null);
    addToast('success', 'Note added successfully');
  };
  
  // Handle note deletion
  const handleDeleteNote = (noteId: string) => {
    if (!id || id === 'new') return;
    
    deleteBuildNote(id, noteId);
    setBuild(getBuild(id) || null);
    addToast('success', 'Note deleted successfully');
  };
  
  // Get note type icon
  const getNoteTypeIcon = (type: BuildNoteEntry['type']) => {
    switch (type) {
      case 'note':
        return <MessageSquare size={16} />;
      case 'issue':
        return <AlertTriangle size={16} />;
      case 'modification':
        return <Wrench size={16} />;
      case 'achievement':
        return <Trophy size={16} />;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
            {id === 'new' ? 'New Build' : `Edit ${build?.title}`}
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
                <label htmlFor="status" className="block text-sm font-medium text-neutral-300 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                >
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
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
              {id === 'new' ? 'Create Build' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  }
  
  if (!build) return null;
  
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} className="mr-1" />
          <span>Back to Builds</span>
        </button>
        
        <button
          onClick={() => setIsEditing(true)}
          className="liquid-glass flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-all duration-300"
        >
          <Edit size={16} />
          <span>Edit Build</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {/* Build Images */}
          <div className="liquid-glass bg-neutral-800 rounded-lg overflow-hidden shadow-lg">
            {build.imageUrls && build.imageUrls.length > 0 ? (
              <div className="aspect-w-16 aspect-h-9">
                <img 
                  src={build.imageUrls[0]} 
                  alt={build.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
            ) : (
              <div className="aspect-w-16 aspect-h-9 bg-neutral-900 flex items-center justify-center">
                <Image size={48} className="text-neutral-700" />
              </div>
            )}
          </div>
          
          {/* Additional Images */}
          {build.imageUrls.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {build.imageUrls.slice(1).map((url, index) => (
                <div key={index} className="aspect-w-1 aspect-h-1">
                  <img
                    src={url}
                    alt={`${build.title} ${index + 2}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Specifications */}
          {build.specs && Object.keys(build.specs).length > 0 && (
            <div className="liquid-glass bg-neutral-800 rounded-lg p-6 mt-4">
              <h3 className="font-medium text-lg text-white mb-4">Specifications</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {build.specs.size && (
                  <div>
                    <span className="text-neutral-400">Size:</span>
                    <span className="text-white ml-2">{build.specs.size}</span>
                  </div>
                )}
                {build.specs.weight && (
                  <div>
                    <span className="text-neutral-400">Weight:</span>
                    <span className="text-white ml-2">{build.specs.weight}g</span>
                  </div>
                )}
                {build.specs.motorKv && (
                  <div>
                    <span className="text-neutral-400">Motor KV:</span>
                    <span className="text-white ml-2">{build.specs.motorKv}</span>
                  </div>
                )}
                {build.specs.batteryConfig && (
                  <div>
                    <span className="text-neutral-400">Battery:</span>
                    <span className="text-white ml-2">{build.specs.batteryConfig}</span>
                  </div>
                )}
                {build.specs.flightController && (
                  <div>
                    <span className="text-neutral-400">FC:</span>
                    <span className="text-white ml-2">{build.specs.flightController}</span>
                  </div>
                )}
                {build.specs.vtx && (
                  <div>
                    <span className="text-neutral-400">VTX:</span>
                    <span className="text-white ml-2">{build.specs.vtx}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Build Info */}
          <div className="liquid-glass bg-neutral-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-2">{build.title}</h2>
            <p className="text-neutral-300">{build.description}</p>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm">
                <p className="text-neutral-400">Created on</p>
                <p className="text-white">{formatDate(build.dateCreated)}</p>
              </div>
              
              <div className="text-sm text-right">
                <p className="text-neutral-400">Total Cost</p>
                <p className="text-white">{formatCurrency(build.totalCost)}</p>
              </div>
            </div>
          </div>
          
          {/* Build Notes */}
          <div className="liquid-glass bg-neutral-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Build Notes</h3>
              
              <button
                onClick={() => setShowNewNoteForm(!showNewNoteForm)}
                className="liquid-glass flex items-center gap-2 px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-all duration-300 text-sm"
              >
                <Plus size={16} />
                <span>Add Note</span>
              </button>
            </div>
            
            {/* New Note Form */}
            {showNewNoteForm && (
              <form onSubmit={handleNoteSubmit} className="mb-6 animate-fade-in">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="note-type" className="block text-sm font-medium text-neutral-300 mb-1">
                      Type
                    </label>
                    <select
                      id="note-type"
                      value={newNote.type}
                      onChange={(e) => setNewNote({ 
                        ...newNote, 
                        type: e.target.value as BuildNoteEntry['type']
                      })}
                      className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                    >
                      <option value="note">Note</option>
                      <option value="issue">Issue</option>
                      <option value="modification">Modification</option>
                      <option value="achievement">Achievement</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="note-content" className="block text-sm font-medium text-neutral-300 mb-1">
                      Content
                    </label>
                    <textarea
                      id="note-content"
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                      rows={3}
                      placeholder="Add your note here..."
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    {newNote.imageUrls.map((url, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <input
                          type="text"
                          value={url}
                          onChange={(e) => handleNoteImageUrlChange(index, e.target.value)}
                          className="liquid-glass flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                          placeholder="Image URL"
                        />
                        
                        <button
                          type="button"
                          onClick={() => removeNoteImageUrlField(index)}
                          className="liquid-glass p-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded-lg transition-all duration-300"
                          disabled={newNote.imageUrls.length <= 1}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addNoteImageUrlField}
                      className="liquid-glass flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded-lg transition-all duration-300"
                    >
                      <Plus size={16} />
                      <span>Add Image URL</span>
                    </button>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowNewNoteForm(false)}
                      className="liquid-glass px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="liquid-glass px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white transition-all duration-300"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              </form>
            )}
            
            {/* Notes List */}
            <div className="space-y-4">
              {build.notes.length === 0 ? (
                <p className="text-neutral-400 text-center py-4">
                  No notes yet. Add your first note to track progress.
                </p>
              ) : (
                build.notes.map((note) => (
                  <div key={note.id} className="liquid-glass bg-neutral-700/50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <div className={`liquid-glass p-1.5 rounded ${
                          note.type === 'issue' 
                            ? 'bg-red-500/20 text-red-400'
                            : note.type === 'modification'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : note.type === 'achievement'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {getNoteTypeIcon(note.type)}
                        </div>
                        <div>
                          <p className="text-white whitespace-pre-line">{note.content}</p>
                          <p className="text-sm text-neutral-400 mt-1">
                            {formatDate(note.dateAdded)}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="liquid-glass p-1.5 text-neutral-400 hover:text-red-400 transition-all duration-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    {note.imageUrls.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {note.imageUrls.map((url, index) => (
                          <div key={index} className="aspect-w-16 aspect-h-9">
                            <img
                              src={url}
                              alt={`Note image ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildNoteDetail;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Wrench, Clock, CheckCircle, Archive, Search } from 'lucide-react';
import { useBuildStore } from '../store/buildStore';
import { useSettingsStore } from '../store/settingsStore';
import { BuildNote } from '../models/types';
import { useToaster } from '../components/ui/Toaster';
import { formatCurrency } from '../utils/currency';

const BuildNotes: React.FC = () => {
  const navigate = useNavigate();
  const { builds, filteredBuilds, filterOptions, setFilterOptions } = useBuildStore();
  const { settings } = useSettingsStore();
  const { addToast } = useToaster();
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status icon
  const getStatusIcon = (status: BuildNote['status']) => {
    switch (status) {
      case 'planning':
        return <Clock className="h-5 w-5 text-blue-400" />;
      case 'in-progress':
        return <Wrench className="h-5 w-5 text-yellow-400" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'archived':
        return <Archive className="h-5 w-5 text-neutral-400" />;
    }
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: BuildNote['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-500/20 text-blue-400';
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'archived':
        return 'bg-neutral-500/20 text-neutral-400';
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-200">Build Notes</h2>
          <p className="text-neutral-400">Document and track your drone builds</p>
        </div>
        
        <button
          onClick={() => navigate('/builds/new')}
          className="liquid-glass flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-300"
        >
          <Plus size={16} />
          <span>New Build</span>
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search builds..."
            value={filterOptions.searchTerm}
            onChange={(e) => setFilterOptions({ searchTerm: e.target.value })}
            className="liquid-glass w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const newStatus = filterOptions.status.includes('planning')
                ? filterOptions.status.filter(s => s !== 'planning')
                : [...filterOptions.status, 'planning'] as ('planning' | 'in-progress' | 'completed' | 'archived')[];
              setFilterOptions({ status: newStatus });
            }}
            className={`liquid-glass px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-2 ${
              filterOptions.status.includes('planning')
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            <Clock size={16} />
            <span>Planning</span>
          </button>
          
          <button
            onClick={() => {
              const newStatus = filterOptions.status.includes('in-progress')
                ? filterOptions.status.filter(s => s !== 'in-progress')
                : [...filterOptions.status, 'in-progress'] as ('planning' | 'in-progress' | 'completed' | 'archived')[];
              setFilterOptions({ status: newStatus });
            }}
            className={`liquid-glass px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-2 ${
              filterOptions.status.includes('in-progress')
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            <Wrench size={16} />
            <span>In Progress</span>
          </button>
          
          <button
            onClick={() => {
              const newStatus = filterOptions.status.includes('completed')
                ? filterOptions.status.filter(s => s !== 'completed')
                : [...filterOptions.status, 'completed'] as ('planning' | 'in-progress' | 'completed' | 'archived')[];
              setFilterOptions({ status: newStatus });
            }}
            className={`liquid-glass px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-2 ${
              filterOptions.status.includes('completed')
                ? 'bg-green-500/20 text-green-400'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            <CheckCircle size={16} />
            <span>Completed</span>
          </button>
          
          <button
            onClick={() => {
              const newStatus = filterOptions.status.includes('archived')
                ? filterOptions.status.filter(s => s !== 'archived')
                : [...filterOptions.status, 'archived'] as ('planning' | 'in-progress' | 'completed' | 'archived')[];
              setFilterOptions({ status: newStatus });
            }}
            className={`liquid-glass px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-2 ${
              filterOptions.status.includes('archived')
                ? 'bg-neutral-500/20 text-neutral-400'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            <Archive size={16} />
            <span>Archived</span>
          </button>
        </div>
      </div>
      
      {/* Builds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuilds.map((build) => (
          <div
            key={build.id}
            className="liquid-glass bg-neutral-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => navigate(`/builds/${build.id}`)}
          >
            <div className="aspect-w-16 aspect-h-9 bg-neutral-900">
              {build.imageUrls[0] ? (
                <img
                  src={build.imageUrls[0]}
                  alt={build.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Wrench size={48} className="text-neutral-700" />
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-medium text-white group-hover:text-primary-400 transition-colors">
                  {build.title}
                </h3>
                <span className={`liquid-glass px-2 py-1 text-xs rounded-full flex items-center gap-1.5 ${getStatusBadgeClass(build.status)}`}>
                  {getStatusIcon(build.status)}
                  <span>{build.status.replace('-', ' ')}</span>
                </span>
              </div>
              
              <p className="text-neutral-400 text-sm line-clamp-2 mb-4">
                {build.description}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">
                  {formatDate(build.dateCreated)}
                </span>
                <span className="text-primary-400 font-medium">
                  {formatCurrency(build.totalCost)}
                </span>
              </div>
              
              {build.specs && (
                <div className="mt-4 pt-4 border-t border-neutral-700">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {build.specs.size && (
                      <div>
                        <span className="text-neutral-500">Size:</span>
                        <span className="text-neutral-300 ml-2">{build.specs.size}</span>
                      </div>
                    )}
                    {build.specs.weight && (
                      <div>
                        <span className="text-neutral-500">Weight:</span>
                        <span className="text-neutral-300 ml-2">{build.specs.weight}g</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuildNotes;
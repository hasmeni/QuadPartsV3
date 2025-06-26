import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Settings } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { setFilterOptions } = useInventoryStore();
  
  // Get the page title based on the current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/inventory':
        return 'Inventory';
      case '/categories':
        return 'Categories';
      case '/storage':
        return 'Storage Locations';
      case '/builds':
        return 'Build Notes';
      case '/gallery':
        return 'Gallery';
      case '/links':
        return 'Links';
      case '/todo':
        return 'Things to Do';
      case '/liquid-demo':
        return 'Liquid Glass Demo';
      case '/settings':
        return 'Settings';
      default:
        if (location.pathname.startsWith('/parts/')) {
          return 'Part Details';
        }
        if (location.pathname.startsWith('/builds/')) {
          return 'Build Details';
        }
        if (location.pathname.startsWith('/gallery/')) {
          return 'Gallery Details';
        }
        return 'Drone Parts Inventory';
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update the search filter in the inventory store
    setFilterOptions({ searchTerm });
    
    // Navigate to inventory page if not already there
    if (location.pathname !== '/inventory') {
      navigate('/inventory');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Real-time search - update filter as user types
    setFilterOptions({ searchTerm: value });
    
    // Navigate to inventory if searching and not already there
    if (value && location.pathname !== '/inventory') {
      navigate('/inventory');
    }
  };

  return (
    <header className="liquid-header py-4 px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-white lg:ml-0 ml-8">{getPageTitle()}</h1>
      
      <div className="flex items-center space-x-4">
        <form onSubmit={handleSearch} className="relative hidden sm:block">
          <input
            type="text"
            placeholder="Search parts..."
            className="liquid-input text-white px-4 py-2 rounded-full pl-10 w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
        </form>
        
        <button className="p-2 rounded-full liquid-glass hover:bg-neutral-800 transition-colors">
          <Bell className="h-5 w-5 text-neutral-300" />
        </button>
        
        <button className="p-2 rounded-full liquid-glass hover:bg-neutral-800 transition-colors">
          <Settings className="h-5 w-5 text-neutral-300" />
        </button>
      </div>
    </header>
  );
};

export default Header;
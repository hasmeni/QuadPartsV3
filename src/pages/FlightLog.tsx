import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Download, ChevronUp, ChevronDown, Search } from 'lucide-react';

interface FlightLogEntry {
  id: string;
  date: string;
  drone: string;
  location: string;
  duration: string;
  notes: string;
  issues: string;
}

const STORAGE_KEY = 'quadparts_flight_logs';

const FlightLog: React.FC = () => {
  const [flightLogs, setFlightLogs] = useState<FlightLogEntry[]>(() => {
    const savedLogs = localStorage.getItem(STORAGE_KEY);
    return savedLogs ? JSON.parse(savedLogs) : [];
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentLog, setCurrentLog] = useState<FlightLogEntry>({
    id: '',
    date: '',
    drone: '',
    location: '',
    duration: '',
    notes: '',
    issues: ''
  });
  const [sortConfig, setSortConfig] = useState<{ key: keyof FlightLogEntry; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc'
  });
  const [filters, setFilters] = useState({
    drone: '',
    location: '',
    search: ''
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flightLogs));
  }, [flightLogs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentLog.id) {
      setFlightLogs(flightLogs.map(log => 
        log.id === currentLog.id ? currentLog : log
      ));
    } else {
      setFlightLogs([...flightLogs, { ...currentLog, id: Date.now().toString() }]);
    }
    setIsFormOpen(false);
    setCurrentLog({
      id: '',
      date: '',
      drone: '',
      location: '',
      duration: '',
      notes: '',
      issues: ''
    });
  };

  const handleDelete = (id: string) => {
    setFlightLogs(flightLogs.filter(log => log.id !== id));
  };

  const handleEdit = (log: FlightLogEntry) => {
    setCurrentLog(log);
    setIsFormOpen(true);
  };

  const handleSort = (key: keyof FlightLogEntry) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Drone', 'Location', 'Duration', 'Notes', 'Issues'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedLogs.map(log => [
        log.date,
        log.drone,
        log.location,
        log.duration,
        `"${log.notes.replace(/"/g, '""')}"`,
        `"${log.issues.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `flight_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAndSortedLogs = React.useMemo(() => {
    let filtered = [...flightLogs];

    // Apply filters
    if (filters.drone) {
      filtered = filtered.filter(log => 
        log.drone.toLowerCase().includes(filters.drone.toLowerCase())
      );
    }
    if (filters.location) {
      filtered = filtered.filter(log => 
        log.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(log => 
        Object.values(log).some(value => 
          value.toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [flightLogs, sortConfig, filters]);

  // Get unique drones and locations for filter dropdowns
  const uniqueDrones = React.useMemo(() => 
    Array.from(new Set(flightLogs.map(log => log.drone))).sort(),
    [flightLogs]
  );
  const uniqueLocations = React.useMemo(() => 
    Array.from(new Set(flightLogs.map(log => log.location))).sort(),
    [flightLogs]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Flight Log</h1>
        <div className="flex space-x-3">
          <button
            onClick={exportToCSV}
            className="liquid-glass flex items-center space-x-2 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-all duration-300"
          >
            <Download size={20} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="liquid-glass flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300"
          >
            <Plus size={20} />
            <span>Add Flight Log</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
          <input
            type="text"
            placeholder="Search all fields..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="liquid-glass w-full pl-10 pr-4 py-2 bg-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
          />
        </div>
        <select
          value={filters.drone}
          onChange={(e) => handleFilterChange('drone', e.target.value)}
          className="liquid-glass px-4 py-2 bg-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
        >
          <option value="">All Drones</option>
          {uniqueDrones.map(drone => (
            <option key={drone} value={drone}>{drone}</option>
          ))}
        </select>
        <select
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          className="liquid-glass px-4 py-2 bg-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
        >
          <option value="">All Locations</option>
          {uniqueLocations.map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="liquid-glass bg-neutral-800 rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              {currentLog.id ? 'Edit Flight Log' : 'Add Flight Log'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={currentLog.date}
                    onChange={(e) => setCurrentLog({ ...currentLog, date: e.target.value })}
                    className="liquid-glass w-full px-3 py-2 bg-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Drone</label>
                  <input
                    type="text"
                    value={currentLog.drone}
                    onChange={(e) => setCurrentLog({ ...currentLog, drone: e.target.value })}
                    className="liquid-glass w-full px-3 py-2 bg-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={currentLog.location}
                    onChange={(e) => setCurrentLog({ ...currentLog, location: e.target.value })}
                    className="liquid-glass w-full px-3 py-2 bg-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Duration</label>
                  <input
                    type="text"
                    value={currentLog.duration}
                    onChange={(e) => setCurrentLog({ ...currentLog, duration: e.target.value })}
                    placeholder="e.g., 15 minutes"
                    className="liquid-glass w-full px-3 py-2 bg-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Notes</label>
                <textarea
                  value={currentLog.notes}
                  onChange={(e) => setCurrentLog({ ...currentLog, notes: e.target.value })}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Issues</label>
                <textarea
                  value={currentLog.issues}
                  onChange={(e) => setCurrentLog({ ...currentLog, issues: e.target.value })}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  rows={3}
                  placeholder="Any issues or problems encountered during the flight"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="liquid-glass px-4 py-2 text-neutral-400 hover:text-white transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="liquid-glass px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300"
                >
                  {currentLog.id ? 'Update' : 'Add'} Flight Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="liquid-glass bg-neutral-800 rounded-lg overflow-hidden shadow-lg">
        <table className="w-full">
          <thead>
            <tr className="liquid-glass bg-neutral-900">
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {sortConfig.key === 'date' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('drone')}
              >
                <div className="flex items-center space-x-1">
                  <span>Drone</span>
                  {sortConfig.key === 'drone' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('location')}
              >
                <div className="flex items-center space-x-1">
                  <span>Location</span>
                  {sortConfig.key === 'location' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('duration')}
              >
                <div className="flex items-center space-x-1">
                  <span>Duration</span>
                  {sortConfig.key === 'duration' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Notes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Issues</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700">
            {filteredAndSortedLogs.map((log) => (
              <tr key={log.id} className="liquid-glass hover:bg-neutral-700/50 transition-all duration-300">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{log.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{log.drone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{log.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{log.duration}</td>
                <td className="px-6 py-4 text-sm text-white max-w-xs truncate">{log.notes}</td>
                <td className="px-6 py-4 text-sm text-white max-w-xs truncate">{log.issues}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(log)}
                    className="liquid-glass text-neutral-400 hover:text-white mr-3 transition-all duration-300"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="liquid-glass text-neutral-400 hover:text-red-500 transition-all duration-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FlightLog; 
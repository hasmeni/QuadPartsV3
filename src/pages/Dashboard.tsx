import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../store/inventoryStore';
import { useTodoStore } from '../store/todoStore';
import { useSettingsStore } from '../store/settingsStore';
import { AlertTriangle, Package, CheckCircle, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { parts, categories } = useInventoryStore();
  const { todos } = useTodoStore();
  const { settings } = useSettingsStore();
  
  // Calculate statistics
  const totalParts = parts.length;
  const totalQuantity = parts.reduce((sum, part) => sum + part.quantity, 0);
  const lowStockThreshold = 3;
  const lowStockParts = parts.filter(part => part.quantity <= lowStockThreshold);
  const totalCategories = categories.length;
  const pendingTodos = todos.filter(todo => !todo.completed).length;
  
  // Calculate total inventory value
  const totalValue = parts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-neutral-200">Dashboard</h2>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="liquid-card p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Total Parts</p>
              <p className="text-2xl font-bold text-white">{totalParts}</p>
            </div>
            <div className="rounded-full bg-primary-900/40 p-3 text-primary-400">
              <Package size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-neutral-500">
            <span>Total Quantity: {totalQuantity} items</span>
          </div>
        </div>
        
        <div className="liquid-card p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Inventory Value</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</p>
            </div>
            <div className="rounded-full bg-secondary-900/40 p-3 text-secondary-400">
              <ShoppingCart size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-neutral-500">
            <span>Across {totalCategories} categories</span>
          </div>
        </div>
        
        <div className="liquid-card p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Low Stock</p>
              <p className="text-2xl font-bold text-white">{lowStockParts.length}</p>
            </div>
            <div className="rounded-full bg-accent-900/40 p-3 text-accent-400">
              <AlertTriangle size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-neutral-500">
            <span>Items below threshold ({lowStockThreshold})</span>
          </div>
        </div>
        
        <div className="liquid-card p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Tasks</p>
              <p className="text-2xl font-bold text-white">{pendingTodos}</p>
            </div>
            <div className="rounded-full bg-primary-900/40 p-3 text-primary-400">
              <CheckCircle size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-neutral-500">
            <span>Pending tasks to complete</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent parts */}
        <div className="liquid-card shadow-lg lg:col-span-2">
          <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
            <h3 className="font-medium text-lg text-white">Recent Parts</h3>
            <button 
              onClick={() => navigate('/inventory')}
              className="text-primary-400 hover:text-primary-300 text-sm"
            >
              View All
            </button>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-neutral-400 text-left">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Category</th>
                  <th className="pb-2 font-medium">Quantity</th>
                  <th className="pb-2 font-medium">Price</th>
                </tr>
              </thead>
              <tbody>
                {parts
                  .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
                  .slice(0, 5)
                  .map((part) => (
                    <tr key={part.id} className="liquid-glass border-t border-neutral-700 hover:bg-neutral-700/30 transition-all duration-300">
                      <td className="py-3">
                        <div 
                          className="flex items-center cursor-pointer" 
                          onClick={() => navigate(`/parts/${part.id}`)}
                        >
                          {part.imageUrls[0] && (
                            <img 
                              src={part.imageUrls[0]} 
                              alt={part.name} 
                              className="w-8 h-8 object-cover rounded mr-2" 
                            />
                          )}
                          <span className="text-white hover:text-primary-300 transition-colors">{part.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-neutral-300">{part.category}</td>
                      <td className="py-3">
                        <span className={part.quantity <= lowStockThreshold ? 'text-red-400' : 'text-green-400'}>
                          {part.quantity}
                        </span>
                      </td>
                      <td className="py-3 text-neutral-300">{formatCurrency(part.price)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Recent tasks */}
        <div className="liquid-card shadow-lg">
          <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
            <h3 className="font-medium text-lg text-white">Pending Tasks</h3>
            <button 
              onClick={() => navigate('/todo')}
              className="text-primary-400 hover:text-primary-300 text-sm"
            >
              View All
            </button>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              {todos
                .filter(todo => !todo.completed)
                .slice(0, 5)
                .map((todo) => (
                  <li 
                    key={todo.id}
                    className="p-3 rounded-lg liquid-glass hover:bg-neutral-700/50 transition-all duration-300 cursor-pointer"
                    onClick={() => navigate('/todo')}
                  >
                    <div className="flex items-start">
                      <span 
                        className={`inline-block w-2 h-2 rounded-full mt-2 mr-2 ${
                          todo.priority === 'high' 
                            ? 'bg-red-500' 
                            : todo.priority === 'medium' 
                              ? 'bg-yellow-500' 
                              : 'bg-green-500'
                        }`}
                      />
                      <div>
                        <p className="text-white font-medium">{todo.title}</p>
                        {todo.description && (
                          <p className="text-neutral-400 text-sm line-clamp-1">{todo.description}</p>
                        )}
                        {todo.dateDue && (
                          <p className="text-neutral-500 text-xs mt-1">
                            Due: {new Date(todo.dateDue).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              
              {todos.filter(todo => !todo.completed).length === 0 && (
                <li className="p-4 text-center text-neutral-400">
                  No pending tasks. Good job!
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
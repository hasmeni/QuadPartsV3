import React, { useState } from 'react';
import { useTodoStore } from '../store/todoStore';
import { Plus, Trash2, Edit, CheckSquare, Square, ClipboardList } from 'lucide-react';
import { TodoItem } from '../models/types';
import { useToaster } from '../components/ui/Toaster';

const TodoList: React.FC = () => {
  const { 
    filteredTodos, 
    todos, 
    addTodo, 
    updateTodo, 
    deleteTodo, 
    toggleTodoComplete, 
    setFilterOptions, 
    filterOptions, 
    clearCompleted 
  } = useTodoStore();
  
  const { addToast } = useToaster();
  
  const [newTodo, setNewTodo] = useState({ title: '', description: '', priority: 'medium' as const });
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);
  const [showNewTodoForm, setShowNewTodoForm] = useState(false);
  
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTodo.title.trim()) {
      addToast('error', 'Task title is required');
      return;
    }
    
    addTodo({
      title: newTodo.title,
      description: newTodo.description,
      priority: newTodo.priority
    });
    
    setNewTodo({ title: '', description: '', priority: 'medium' });
    setShowNewTodoForm(false);
    addToast('success', 'Task added successfully');
  };
  
  const handleUpdateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTodo) return;
    
    updateTodo(selectedTodo.id, selectedTodo);
    setSelectedTodo(null);
    addToast('success', 'Task updated successfully');
  };
  
  const handleDelete = (id: string, title: string) => {
    deleteTodo(id);
    addToast('success', `Task "${title}" deleted successfully`);
  };
  
  // Get priority badge
  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">High</span>;
      case 'medium':
        return <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded">Medium</span>;
      case 'low':
        return <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">Low</span>;
    }
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-200">Things to Do</h2>
          <p className="text-neutral-400">Track tasks and reminders for your drone projects</p>
        </div>
        
        <button 
          onClick={() => setShowNewTodoForm(!showNewTodoForm)}
          className="liquid-glass flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-300"
        >
          <Plus size={16} />
          <span>Add Task</span>
        </button>
      </div>
      
      {/* New Todo Form */}
      {showNewTodoForm && (
        <div className="liquid-glass bg-neutral-800 p-4 rounded-lg shadow-lg animate-fade-in">
          <h3 className="text-lg font-medium text-white mb-4">Add New Task</h3>
          
          <form onSubmit={handleAddTodo} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-neutral-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                placeholder="Task title"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={newTodo.description}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                placeholder="Task description (optional)"
                rows={3}
              />
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-neutral-300 mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={newTodo.priority}
                onChange={(e) => setNewTodo({ 
                  ...newTodo, 
                  priority: e.target.value as 'low' | 'medium' | 'high'
                })}
                className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewTodoForm(false)}
                className="liquid-glass px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="liquid-glass px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white transition-all duration-300"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Edit Todo Modal */}
      {selectedTodo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="liquid-glass bg-neutral-800 p-6 rounded-lg shadow-xl w-full max-w-md animate-fade-in">
            <h3 className="text-lg font-medium text-white mb-4">Edit Task</h3>
            
            <form onSubmit={handleUpdateTodo} className="space-y-4">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-neutral-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="edit-title"
                  value={selectedTodo.title}
                  onChange={(e) => setSelectedTodo({ ...selectedTodo, title: e.target.value })}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  value={selectedTodo.description || ''}
                  onChange={(e) => setSelectedTodo({ ...selectedTodo, description: e.target.value })}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                  rows={3}
                />
              </div>
              
              <div>
                <label htmlFor="edit-priority" className="block text-sm font-medium text-neutral-300 mb-1">
                  Priority
                </label>
                <select
                  id="edit-priority"
                  value={selectedTodo.priority}
                  onChange={(e) => setSelectedTodo({ 
                    ...selectedTodo, 
                    priority: e.target.value as 'low' | 'medium' | 'high'
                  })}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="edit-due-date" className="block text-sm font-medium text-neutral-300 mb-1">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  id="edit-due-date"
                  value={selectedTodo.dateDue?.slice(0, 16) || ''}
                  onChange={(e) => setSelectedTodo({ 
                    ...selectedTodo, 
                    dateDue: e.target.value ? new Date(e.target.value).toISOString() : undefined
                  })}
                  className="liquid-glass w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTodo(null)}
                  className="liquid-glass px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="liquid-glass px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white transition-all duration-300"
                >
                  Update Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterOptions({ completed: null })}
            className={`liquid-glass px-3 py-1.5 rounded-lg transition-all duration-300 ${
              filterOptions.completed === null
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterOptions({ completed: false })}
            className={`liquid-glass px-3 py-1.5 rounded-lg transition-all duration-300 ${
              filterOptions.completed === false
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterOptions({ completed: true })}
            className={`liquid-glass px-3 py-1.5 rounded-lg transition-all duration-300 ${
              filterOptions.completed === true
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            Completed
          </button>
        </div>
        
        <div className="flex items-center space-x-2 ml-auto">
          <span className="text-neutral-400 text-sm">Filter by priority:</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                const newPriorities = filterOptions.priority.includes('high')
                  ? filterOptions.priority.filter(p => p !== 'high')
                  : [...filterOptions.priority, 'high'];
                setFilterOptions({ priority: newPriorities as ('low' | 'medium' | 'high')[] });
              }}
              className={`liquid-glass px-2 py-1 text-xs rounded-lg transition-all duration-300 ${
                filterOptions.priority.includes('high')
                  ? 'bg-red-500/30 text-red-400'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              High
            </button>
            <button
              onClick={() => {
                const newPriorities = filterOptions.priority.includes('medium')
                  ? filterOptions.priority.filter(p => p !== 'medium')
                  : [...filterOptions.priority, 'medium'];
                setFilterOptions({ priority: newPriorities as ('low' | 'medium' | 'high')[] });
              }}
              className={`liquid-glass px-2 py-1 text-xs rounded-lg transition-all duration-300 ${
                filterOptions.priority.includes('medium')
                  ? 'bg-yellow-500/30 text-yellow-400'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => {
                const newPriorities = filterOptions.priority.includes('low')
                  ? filterOptions.priority.filter(p => p !== 'low')
                  : [...filterOptions.priority, 'low'];
                setFilterOptions({ priority: newPriorities as ('low' | 'medium' | 'high')[] });
              }}
              className={`liquid-glass px-2 py-1 text-xs rounded-lg transition-all duration-300 ${
                filterOptions.priority.includes('low')
                  ? 'bg-green-500/30 text-green-400'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              Low
            </button>
          </div>
        </div>
        
        <div>
          <button
            onClick={clearCompleted}
            className="liquid-glass text-neutral-400 hover:text-neutral-300 text-sm underline transition-all duration-300"
            disabled={!todos.some(todo => todo.completed)}
          >
            Clear completed
          </button>
        </div>
      </div>
      
      {/* Todo List */}
      {filteredTodos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ClipboardList size={64} className="text-neutral-600 mb-4" />
          <h3 className="text-xl font-medium text-neutral-300 mb-2">No tasks found</h3>
          <p className="text-neutral-400 max-w-md">
            {filterOptions.completed === null
              ? "You don't have any tasks yet. Add a new task to get started."
              : filterOptions.completed
                ? "You don't have any completed tasks."
                : "You don't have any active tasks."}
          </p>
          {filterOptions.completed !== true && (
            <button
              onClick={() => setShowNewTodoForm(true)}
              className="mt-4 px-4 py-2 liquid-glass bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-300"
            >
              Add Your First Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTodos.map(todo => (
            <div 
              key={todo.id}
              className={`liquid-glass group p-4 rounded-lg transition-all duration-300 ${
                todo.completed 
                  ? 'bg-neutral-800/50 hover:bg-neutral-800' 
                  : 'bg-neutral-800 hover:bg-neutral-700/80'
              }`}
            >
              <div className="flex items-start">
                <button 
                  onClick={() => toggleTodoComplete(todo.id)}
                  className="liquid-glass flex-shrink-0 mt-1 text-neutral-400 hover:text-primary-400 transition-all duration-300"
                >
                  {todo.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>
                
                <div className="ml-3 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`font-medium text-lg ${
                        todo.completed ? 'text-neutral-500 line-through' : 'text-white'
                      }`}>
                        {todo.title}
                      </h4>
                      {todo.description && (
                        <p className={`mt-1 ${
                          todo.completed ? 'text-neutral-600 line-through' : 'text-neutral-400'
                        }`}>
                          {todo.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">{getPriorityBadge(todo.priority)}</div>
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-sm text-neutral-500">
                      {todo.completed ? (
                        <>
                          Completed: {formatDate(todo.dateCompleted)}
                        </>
                      ) : todo.dateDue ? (
                        <>
                          Due: {formatDate(todo.dateDue)}
                        </>
                      ) : (
                        <>
                          Created: {formatDate(todo.dateCreated)}
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedTodo(todo)}
                        className="liquid-glass p-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-white transition-all duration-300"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id, todo.title)}
                        className="liquid-glass p-1.5 bg-red-500/80 hover:bg-red-600 rounded text-white transition-all duration-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoList;
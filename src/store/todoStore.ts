import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { TodoItem } from '../models/types';

const STORAGE_KEY = 'quadparts_todos_data';

interface TodoState {
  todos: TodoItem[];
  filteredTodos: TodoItem[];
  filterOptions: {
    completed: boolean | null;
    priority: ('low' | 'medium' | 'high')[];
    searchTerm: string;
  };
  
  // Actions
  addTodo: (todo: Omit<TodoItem, 'id' | 'dateCreated' | 'completed'>) => void;
  updateTodo: (id: string, todoData: Partial<TodoItem>) => void;
  deleteTodo: (id: string) => void;
  toggleTodoComplete: (id: string) => void;
  
  setFilterOptions: (options: Partial<typeof TodoState.prototype.filterOptions>) => void;
  applyFilters: () => void;
  clearCompleted: () => void;
}

// Sample data
const sampleTodos: TodoItem[] = [
  {
    id: '1',
    title: 'Order more 1106 motors',
    description: 'Need at least 10 more for upcoming micro builds',
    completed: false,
    priority: 'high',
    dateCreated: new Date().toISOString(),
    dateDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Test new flight controller',
    description: 'Set up the new Matek F722 and test all outputs',
    completed: false,
    priority: 'medium',
    dateCreated: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Organize storage area',
    description: 'Add more bins and label everything',
    completed: true,
    priority: 'low',
    dateCreated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    dateCompleted: new Date().toISOString()
  }
];

// Load saved data from localStorage
const loadSavedData = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      
      // Handle different data structures
      let todos;
      if (Array.isArray(parsed)) {
        // If the data is directly an array
        todos = parsed;
      } else if (parsed && typeof parsed === 'object') {
        // If the data is wrapped in an object
        if (Array.isArray(parsed.todos)) {
          todos = parsed.todos;
        } else if (Array.isArray(parsed.data)) {
          todos = parsed.data;
        } else {
          console.warn('Unexpected todos data structure:', parsed);
          return { todos: sampleTodos };
        }
      } else {
        console.warn('Unexpected todos data structure:', parsed);
        return { todos: sampleTodos };
      }
      
      console.log(`Loaded ${todos.length} todos from localStorage`);
      return { todos };
    }
  } catch (error) {
    console.error('Error loading todos data from localStorage:', error);
  }
  return { todos: sampleTodos };
};

const { todos: savedTodos } = loadSavedData();

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: savedTodos,
  filteredTodos: savedTodos,
  filterOptions: {
    completed: null, // null means show all, true means show completed only, false means show incomplete only
    priority: ['low', 'medium', 'high'],
    searchTerm: '',
  },
  
  // Actions
  addTodo: (todo) => {
    const newTodo: TodoItem = {
      ...todo,
      id: uuidv4(),
      completed: false,
      dateCreated: new Date().toISOString()
    };
    set((state) => ({ 
      todos: [...state.todos, newTodo]
    }));
    get().applyFilters();
    
    // Save to localStorage
    const { todos } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ todos }));
  },
  
  updateTodo: (id, todoData) => {
    set((state) => ({
      todos: state.todos.map((todo) => 
        todo.id === id 
          ? { ...todo, ...todoData } 
          : todo
      )
    }));
    get().applyFilters();
    
    // Save to localStorage
    const { todos } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ todos }));
  },
  
  deleteTodo: (id) => {
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id)
    }));
    get().applyFilters();
    
    // Save to localStorage
    const { todos } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ todos }));
  },
  
  toggleTodoComplete: (id) => {
    set((state) => ({
      todos: state.todos.map((todo) => 
        todo.id === id 
          ? { 
              ...todo, 
              completed: !todo.completed,
              dateCompleted: !todo.completed ? new Date().toISOString() : undefined
            } 
          : todo
      )
    }));
    get().applyFilters();
    
    // Save to localStorage
    const { todos } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ todos }));
  },
  
  setFilterOptions: (options) => {
    set((state) => ({
      filterOptions: { ...state.filterOptions, ...options }
    }));
    get().applyFilters();
  },
  
  applyFilters: () => {
    const { todos, filterOptions } = get();
    
    let filtered = [...todos];
    
    // Filter by completion status
    if (filterOptions.completed !== null) {
      filtered = filtered.filter((todo) => todo.completed === filterOptions.completed);
    }
    
    // Filter by priority
    filtered = filtered.filter((todo) => 
      filterOptions.priority.includes(todo.priority)
    );
    
    // Filter by search term
    if (filterOptions.searchTerm) {
      const term = filterOptions.searchTerm.toLowerCase();
      filtered = filtered.filter((todo) => 
        todo.title.toLowerCase().includes(term) ||
        (todo.description && todo.description.toLowerCase().includes(term))
      );
    }
    
    // Sort by priority and due date
    filtered.sort((a, b) => {
      const priorityMap = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityMap[a.priority] - priorityMap[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, sort by due date (if available)
      if (a.dateDue && b.dateDue) {
        return new Date(a.dateDue).getTime() - new Date(b.dateDue).getTime();
      } else if (a.dateDue) {
        return -1;
      } else if (b.dateDue) {
        return 1;
      }
      
      // Otherwise sort by creation date
      return new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
    });
    
    set({ filteredTodos: filtered });
  },
  
  clearCompleted: () => {
    set((state) => ({
      todos: state.todos.filter((todo) => !todo.completed)
    }));
    get().applyFilters();
    
    // Save to localStorage
    const { todos } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ todos }));
  }
}));
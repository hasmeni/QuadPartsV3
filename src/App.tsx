import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Categories from './pages/Categories';
import StorageLocations from './pages/StorageLocations';
import BuildNotes from './pages/BuildNotes';
import BuildNoteDetail from './pages/BuildNoteDetail';
import Gallery from './pages/Gallery';
import GalleryItemDetail from './pages/GalleryItemDetail';
import Links from './pages/Links';
import TodoList from './pages/TodoList';
import PartDetails from './pages/PartDetails';
import Settings from './pages/Settings';
import FlightLog from './pages/FlightLog';
import LiquidGlassDemo from './pages/LiquidGlassDemo';
import { useThemeStore } from './store/themeStore';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h1>
            <p className="text-neutral-300 mb-4">
              The application encountered an error. This might be due to corrupted data from a recent import.
            </p>
            <div className="space-y-2 text-sm text-neutral-400 mb-6">
              <p>Error: {this.state.error?.message}</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  // Clear potentially corrupted data
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Clear Data & Reload
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const { theme, setTheme } = useThemeStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Initialize theme on app startup
      const savedTheme = localStorage.getItem('theme') || 'dark';
      console.log('Initializing theme:', savedTheme);
      
      // Set the theme attribute immediately
      document.documentElement.setAttribute('data-theme', savedTheme);
      
      // Update the store if needed
      if (theme !== savedTheme) {
        setTheme(savedTheme);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error during app initialization:', error);
      setIsLoading(false);
    }
  }, []); // Run only on mount

  useEffect(() => {
    try {
      console.log('App theme changed to:', theme);
      document.documentElement.setAttribute('data-theme', theme);
      
      // Force a re-render by updating body class
      document.body.className = `theme-${theme}`;
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  }, [theme]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="flex min-h-screen bg-neutral-950 text-white overflow-hidden">
          {/* Liquid background effect */}
          <div className="liquid-bg"></div>
          
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden lg:pl-0 pl-16">
            <Header />
            <main className="flex-1 overflow-auto p-4">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/storage" element={<StorageLocations />} />
                <Route path="/builds" element={<BuildNotes />} />
                <Route path="/builds/:id" element={<BuildNoteDetail />} />
                <Route path="/flight-log" element={<FlightLog />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/gallery/:id" element={<GalleryItemDetail />} />
                <Route path="/links" element={<Links />} />
                <Route path="/todo" element={<TodoList />} />
                <Route path="/parts/:id" element={<PartDetails />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/liquid-demo" element={<LiquidGlassDemo />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App
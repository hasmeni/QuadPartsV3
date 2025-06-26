import React, { useState } from 'react';
import LiquidGlass from '../components/LiquidGlass';
import { Plus, Search, Settings, Bell, Package, CheckCircle, AlertTriangle } from 'lucide-react';

const LiquidGlassDemo: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8 p-6">
      <div className="liquid-card p-6">
        <h1 className="text-3xl font-bold text-white mb-4">Liquid Glass Effects Demo</h1>
        <p className="text-neutral-300">
          This page showcases all the liquid glass effects available in the QuadParts application.
          Hover over elements to see the liquid animations in action!
        </p>
      </div>

      {/* Basic Liquid Glass */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Basic Liquid Glass</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="liquid-glass p-6">
            <h3 className="text-lg font-medium text-white mb-2">Default Effect</h3>
            <p className="text-neutral-300">Basic liquid glass with hover animations</p>
          </div>
          
          <div className="liquid-glass p-6">
            <h3 className="text-lg font-medium text-white mb-2">With Content</h3>
            <p className="text-neutral-300">Content is properly layered above the effect</p>
          </div>
          
          <div className="liquid-glass p-6">
            <h3 className="text-lg font-medium text-white mb-2">Interactive</h3>
            <p className="text-neutral-300">Hover to see the liquid shine effect</p>
          </div>
        </div>
      </section>

      {/* Liquid Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Liquid Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="liquid-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-neutral-400 text-sm">Total Parts</p>
                <p className="text-2xl font-bold text-white">156</p>
              </div>
              <div className="rounded-full bg-primary-900/40 p-3 text-primary-400">
                <Package size={24} />
              </div>
            </div>
            <p className="text-sm text-neutral-500">Across 12 categories</p>
          </div>

          <div className="liquid-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-neutral-400 text-sm">Tasks</p>
                <p className="text-2xl font-bold text-white">8</p>
              </div>
              <div className="rounded-full bg-green-900/40 p-3 text-green-400">
                <CheckCircle size={24} />
              </div>
            </div>
            <p className="text-sm text-neutral-500">Pending completion</p>
          </div>

          <div className="liquid-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-neutral-400 text-sm">Alerts</p>
                <p className="text-2xl font-bold text-white">3</p>
              </div>
              <div className="rounded-full bg-red-900/40 p-3 text-red-400">
                <AlertTriangle size={24} />
              </div>
            </div>
            <p className="text-sm text-neutral-500">Low stock items</p>
          </div>

          <div className="liquid-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-neutral-400 text-sm">Value</p>
                <p className="text-2xl font-bold text-white">$2,450</p>
              </div>
              <div className="rounded-full bg-blue-900/40 p-3 text-blue-400">
                <Package size={24} />
              </div>
            </div>
            <p className="text-sm text-neutral-500">Total inventory</p>
          </div>
        </div>
      </section>

      {/* Liquid Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Liquid Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <LiquidGlass variant="button" className="px-6 py-3 text-white">
            <span>Primary Button</span>
          </LiquidGlass>
          
          <LiquidGlass variant="button" className="px-6 py-3 text-white">
            <span>Secondary Button</span>
          </LiquidGlass>
          
          <LiquidGlass variant="button" className="px-6 py-3 text-white">
            <span>Action Button</span>
          </LiquidGlass>
          
          <button className="liquid-button px-6 py-3 text-white rounded-lg">
            <span>Direct Class Button</span>
          </button>
        </div>
      </section>

      {/* Liquid Inputs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Liquid Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-neutral-300">Search Input</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search parts..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="liquid-input w-full px-4 py-3 text-white rounded-lg pl-10 focus:outline-none"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-neutral-300">Text Input</label>
            <input
              type="text"
              placeholder="Enter text..."
              className="liquid-input w-full px-4 py-3 text-white rounded-lg focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Liquid Icons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Liquid Icons</h2>
        <div className="flex flex-wrap gap-4">
          <button className="p-3 rounded-full liquid-glass hover:bg-neutral-800 transition-colors">
            <Bell className="h-5 w-5 text-neutral-300" />
          </button>
          
          <button className="p-3 rounded-full liquid-glass hover:bg-neutral-800 transition-colors">
            <Settings className="h-5 w-5 text-neutral-300" />
          </button>
          
          <button className="p-3 rounded-full liquid-glass hover:bg-neutral-800 transition-colors">
            <Plus className="h-5 w-5 text-neutral-300" />
          </button>
          
          <button className="p-3 rounded-full liquid-glass hover:bg-neutral-800 transition-colors">
            <Search className="h-5 w-5 text-neutral-300" />
          </button>
        </div>
      </section>

      {/* Liquid Modal */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Liquid Modal</h2>
        <LiquidGlass variant="button" className="px-6 py-3 text-white" onClick={() => setIsModalOpen(true)}>
          <span>Open Modal</span>
        </LiquidGlass>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="liquid-modal p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-white mb-4">Liquid Modal</h3>
              <p className="text-neutral-300 mb-6">
                This modal uses the liquid glass effect with a smooth entrance animation.
              </p>
              <div className="flex gap-3">
                <LiquidGlass variant="button" className="px-4 py-2 text-white" onClick={() => setIsModalOpen(false)}>
                  <span>Close</span>
                </LiquidGlass>
                <LiquidGlass variant="button" className="px-4 py-2 text-white">
                  <span>Action</span>
                </LiquidGlass>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Theme Variations */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Theme Variations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="liquid-glass p-6">
            <h3 className="text-lg font-medium text-white mb-2">Default Theme</h3>
            <p className="text-neutral-300">Works with all theme variations</p>
          </div>
          
          <div className="liquid-glass p-6">
            <h3 className="text-lg font-medium text-white mb-2">Cyberpunk Theme</h3>
            <p className="text-neutral-300">Yellow/gold accents</p>
          </div>
          
          <div className="liquid-glass p-6">
            <h3 className="text-lg font-medium text-white mb-2">Matrix Theme</h3>
            <p className="text-neutral-300">Green accents</p>
          </div>
        </div>
      </section>

      {/* Usage Instructions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Usage Instructions</h2>
        <div className="liquid-card p-6">
          <h3 className="text-lg font-medium text-white mb-4">How to Use Liquid Glass Effects</h3>
          <div className="space-y-3 text-neutral-300">
            <p><strong>CSS Classes:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code className="bg-neutral-800 px-2 py-1 rounded">liquid-glass</code> - Basic liquid glass effect</li>
              <li><code className="bg-neutral-800 px-2 py-1 rounded">liquid-card</code> - Card with hover lift effect</li>
              <li><code className="bg-neutral-800 px-2 py-1 rounded">liquid-button</code> - Button with ripple effect</li>
              <li><code className="bg-neutral-800 px-2 py-1 rounded">liquid-input</code> - Input with focus scaling</li>
              <li><code className="bg-neutral-800 px-2 py-1 rounded">liquid-modal</code> - Modal with entrance animation</li>
              <li><code className="bg-neutral-800 px-2 py-1 rounded">liquid-sidebar</code> - Sidebar with glass effect</li>
              <li><code className="bg-neutral-800 px-2 py-1 rounded">liquid-header</code> - Header with glass effect</li>
            </ul>
            
            <p className="mt-4"><strong>React Component:</strong></p>
            <div className="bg-neutral-800 p-4 rounded-lg">
              <pre className="text-sm text-neutral-300">
{`import LiquidGlass from './components/LiquidGlass';

<LiquidGlass variant="card" className="p-6">
  <h3>Your Content</h3>
  <p>Content goes here</p>
</LiquidGlass>`}
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LiquidGlassDemo; 
import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Tags, CheckSquare, Settings, 
  LogOut, Wrench, Camera, Link as LinkIcon, Menu, X, MapPin, Plane
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: <LayoutDashboard size={20} />, text: 'Dashboard', path: '/' },
    { icon: <Package size={20} />, text: 'Inventory', path: '/inventory' },
    { icon: <Tags size={20} />, text: 'Categories', path: '/categories' },
    { icon: <MapPin size={20} />, text: 'Storage Locations', path: '/storage' },
    { icon: <Wrench size={20} />, text: 'Build Notes', path: '/builds' },
    { icon: <Plane size={20} />, text: 'Flight Log', path: '/flight-log' },
    { icon: <Camera size={20} />, text: 'Gallery', path: '/gallery' },
    { icon: <LinkIcon size={20} />, text: 'Links', path: '/links' },
    { icon: <CheckSquare size={20} />, text: 'Things to Do', path: '/todo' },
    { icon: <Settings size={20} />, text: 'Settings', path: '/settings' }
  ];

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsCollapsed(false);
  };

  const handleExit = () => {
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 liquid-glass rounded-lg text-neutral-400 hover:text-white transition-colors"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 liquid-sidebar flex flex-col h-full transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className={`p-4 ${isCollapsed ? 'px-2' : 'p-6'}`}>
          <div className="flex items-center justify-between">
            <Link 
              to="/"
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'} hover:opacity-80 transition-opacity`}
            >
              <img 
                src="https://images.pexels.com/photos/1087180/pexels-photo-1087180.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=1" 
                alt="Drone"
                className="h-8 w-8 object-cover filter grayscale"
              />
              {!isCollapsed && (
                <div>
                  <h1 className="text-xl font-bold text-white">QuadParts</h1>
                  <span className="text-sm text-neutral-500">by Code.Carter</span>
                </div>
              )}
            </Link>
            <button
              onClick={toggleSidebar}
              className="hidden lg:block p-1.5 rounded-lg liquid-glass text-neutral-400 hover:text-white transition-colors"
            >
              <Menu size={16} />
            </button>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary-900/50 text-primary-400 liquid-glass' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`
                  }
                  title={isCollapsed ? item.text : undefined}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.text}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className={`p-2 border-t border-neutral-800 ${isCollapsed ? 'px-2' : 'p-4'}`}>
          <button 
            onClick={handleExit}
            className={`flex items-center ${
              isCollapsed ? 'justify-center' : 'space-x-3'
            } px-3 py-2.5 w-full text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors`}
            title={isCollapsed ? 'Exit' : undefined}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Exit</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
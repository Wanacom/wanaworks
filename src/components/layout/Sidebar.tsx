import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, LayoutDashboard, Briefcase, Calendar, Map, ClipboardList, Settings, Users, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const { user } = useAuth();
  
  // Determine navigation items based on user role
  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Planner', 'Tech', 'Sales'] },
    { name: 'Jobs', href: '/jobs', icon: Briefcase, roles: ['Admin', 'Manager', 'Planner', 'Sales'] },
    { name: 'Calendar', href: '/calendar', icon: Calendar, roles: ['Admin', 'Manager', 'Planner', 'Tech'] },
    { name: 'Map', href: '/map', icon: Map, roles: ['Admin', 'Manager', 'Planner', 'Tech'] },
    { name: 'Tasks', href: '/tasks', icon: ClipboardList, roles: ['Admin', 'Manager', 'Planner', 'Tech'] },
    { name: 'Clients', href: '/clients', icon: Building, roles: ['Admin', 'Manager', 'Sales'] },
    { name: 'Users', href: '/users', icon: Users, roles: ['Admin'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['Admin'] },
  ];
  
  // Filter navigation items based on user role
  const filteredNavItems = user 
    ? navigationItems.filter(item => item.roles.includes(user.role))
    : [];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-xl font-bold text-blue-800">Wanacom</span>
          </div>
          <button
            className="h-6 w-6 text-gray-600 md:hidden"
            onClick={() => setOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="mt-4 px-2">
          <div className="space-y-1">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => `
                  flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out
                  ${isActive
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
                onClick={() => window.innerWidth < 768 && setOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>
        
        {/* Sidebar Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p>© 2025 Wanacom</p>
            <p>Version 0.1.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
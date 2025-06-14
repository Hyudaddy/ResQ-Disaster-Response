import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { UserRole } from '../../types/auth.types';
import {
  Home,
  AlertTriangle,
  ListChecks,
  UserCircle,
  LogOut,
  Settings,
  Users,
  BarChart3,
  FileText,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';
import Button from '../common/Button';
import { ShieldAlert } from 'lucide-react';

interface NavItem {
  path: string;
  name: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navSections: NavSection[] = [
    {
      title: 'General',
      items: [
        {
          path: '/',
          name: 'Dashboard',
          icon: <Home size={20} />,
          roles: ['citizen', 'responder', 'admin'],
        },
        {
          path: '/incidents/report',
          name: 'Report Incident',
          icon: <AlertTriangle size={20} />,
          roles: ['citizen', 'responder', 'admin'],
        },
        {
          path: '/incidents',
          name: 'Incidents',
          icon: <ListChecks size={20} />,
          roles: ['citizen', 'responder', 'admin'],
        },
      ],
    },
    {
      title: 'Responder Tools',
      items: [
        {
          path: '/responder/alerts',
          name: 'Active Alerts',
          icon: <ShieldAlert size={20} />,
          roles: ['responder', 'admin'],
        },
        {
          path: '/responder/reports',
          name: 'Reports',
          icon: <FileText size={20} />,
          roles: ['responder', 'admin'],
        },
      ],
    },
    {
      title: 'Admin',
      items: [
        {
          path: '/admin/users',
          name: 'User Management',
          icon: <Users size={20} />,
          roles: ['admin'],
        },
        {
          path: '/admin/analytics',
          name: 'Analytics',
          icon: <BarChart3 size={20} />,
          roles: ['admin'],
        },
        {
          path: '/admin/settings',
          name: 'Settings',
          icon: <Settings size={20} />,
          roles: ['admin'],
        },
      ],
    },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  if (!user) return null;

  const isLinkActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navigationItems = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(user.role)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      {/* Mobile sidebar toggle */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-dark-800 text-dark-100 md:hidden"
        onClick={toggleMobileSidebar}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-white dark:bg-dark-900 text-light-900 dark:text-dark-100 h-screen fixed top-0 left-0 z-40 transition-all duration-300 transform shadow-xl
          ${collapsed ? 'w-16' : 'w-64'} 
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`p-4 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => {
                if (collapsed) {
                  setCollapsed(false);
                }
              }}
            >
              <div className="bg-primary-500 text-white h-8 w-8 rounded-md flex items-center justify-center">
                <ShieldAlert size={18} />
              </div>
              {!collapsed && <h1 className="ml-2 text-xl font-bold text-primary-500">ResQ</h1>}
            </div>
            {!collapsed && (
              <button
                className="p-1 rounded-md hover:bg-light-100 dark:hover:bg-dark-800 text-light-500 dark:text-dark-300 hidden md:block"
                onClick={toggleSidebar}
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {navigationItems.map((section, index) => (
              <div key={index} className="mb-6">
                {!collapsed && (
                  <h2 className="px-4 mb-2 text-xs font-semibold text-light-500 dark:text-dark-400 uppercase tracking-wider">
                    {section.title}
                  </h2>
                )}
                <ul>
                  {section.items.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center px-4 py-2.5 text-sm font-medium transition-colors duration-150
                          ${
                            isLinkActive(item.path)
                              ? 'bg-primary-500/10 text-primary-500 border-l-2 border-primary-500'
                              : 'text-light-600 dark:text-dark-300 hover:text-light-900 dark:hover:text-dark-100 hover:bg-light-100 dark:hover:bg-dark-800'
                          }
                          ${collapsed ? 'justify-center' : 'justify-start'}
                        `}
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className={`${collapsed ? '' : 'mr-3'}`}>{item.icon}</span>
                        {!collapsed && <span>{item.name}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* User area */}
          <div className={`p-4 border-t border-light-200 dark:border-dark-800 ${collapsed ? 'items-center' : ''}`}>
            {!collapsed && (
              <div className="relative mb-4">
                <Link
                  to="/profile"
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-light-100 dark:hover:bg-dark-800 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center">
                      {user.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-3 text-left">
                      <p className="text-sm font-medium text-light-900 dark:text-white">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-light-500 dark:text-dark-400">
                        {user.role}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-light-500 dark:text-dark-400" />
                </Link>
              </div>
            )}

            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className={`${collapsed ? 'p-2 w-auto justify-center' : 'w-full'} border border-light-200 dark:border-dark-700`}
                onClick={toggleTheme}
                leftIcon={collapsed ? undefined : theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              >
                {collapsed ? (theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />) : (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`${collapsed ? 'p-2 w-auto justify-center' : 'w-full'} text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20`}
                onClick={handleLogout}
                leftIcon={collapsed ? undefined : <LogOut size={16} />}
              >
                {collapsed ? <LogOut size={16} /> : 'Sign Out'}
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
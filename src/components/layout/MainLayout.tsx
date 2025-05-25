import React from 'react';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Footer from '../Footer';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-light-50 dark:bg-dark-950 text-light-900 dark:text-dark-100">
      {isAuthenticated && <Sidebar />}
      
      <main className={`flex-grow transition-all duration-300 ${isAuthenticated ? 'md:ml-64' : ''}`}>
        <div className="container mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
      
      <Footer />
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#1f2028' : '#ffffff',
            color: theme === 'dark' ? '#e0e2e7' : '#212529',
            border: theme === 'dark' ? '1px solid #353845' : '1px solid #e9ecef',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: theme === 'dark' ? '#ffffff' : '#212529',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: theme === 'dark' ? '#ffffff' : '#212529',
            },
          },
        }}
      />
    </div>
  );
};

export default MainLayout;
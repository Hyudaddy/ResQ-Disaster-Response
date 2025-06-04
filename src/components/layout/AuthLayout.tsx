import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Footer from '../Footer';

const AuthLayout: React.FC = () => {
  const { user } = useAuth();

  // If user is already authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-light-50 dark:bg-dark-950">
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout; 
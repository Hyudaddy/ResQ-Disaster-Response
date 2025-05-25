import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../Footer';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-light-50 dark:bg-dark-950">
      <main className="flex-grow flex items-center justify-center px-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout; 
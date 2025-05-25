import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Footer: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <footer className={`bg-gray-900 text-white py-8 mt-auto ${isAuthenticated ? 'md:ml-64' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">ResQ</h3>
            <p className="text-gray-400">
              Disaster and Incident Response Platform
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Submitted by:</h3>
            <p className="text-gray-400">
            <li>HEWER E. MAGADAN</li>
            <li>ROGIE KIM P. CANDEL</li>
            <li>ELAIZA C. DIETA</li>
            <li>ALJANE GRACE A. BUYO</li>
            <li>UNA GWYN B. LASISTE</li>
            </p>
          </div>
          <div>
          <h3 className="text-xl font-bold mb-4">Submitted to:</h3>
            <p className="text-gray-400">
            <li>JESTONI A. GUYANO, MIT</li>
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white transition">Home</a></li>
              <li><a href="/incidents" className="text-gray-400 hover:text-white transition">Incidents</a></li>
              <li><a href="/resources" className="text-gray-400 hover:text-white transition">Resources</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: support@resq.com</li>
              <li>Emergency: 911</li>
              <li>Non-Emergency: 311</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} ResQ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
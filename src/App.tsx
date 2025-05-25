import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { IncidentProvider } from './contexts/IncidentContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PrivateRoute from './components/auth/PrivateRoute';
import RoleRoute from './components/auth/RoleRoute';

// Public pages
import Dashboard from './pages/dashboard/Dashboard';
import IncidentReport from './pages/incidents/IncidentReport';
import IncidentsList from './pages/incidents/IncidentsList';
import IncidentDetail from './pages/incidents/IncidentDetail';

// Responder pages
import ResponderAlerts from './pages/responder/ResponderAlerts';
import ResponderReports from './pages/responder/ResponderReports';

// Admin pages
import UserManagement from './pages/admin/UserManagement';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <IncidentProvider>
          <Router>
            <Routes>
              {/* Auth routes with AuthLayout */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              
              {/* App routes with MainLayout */}
              <Route element={<MainLayout />}>
                {/* Public routes (require auth) */}
                <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
                <Route path="/incidents/report" element={<PrivateRoute element={<IncidentReport />} />} />
                <Route path="/incidents" element={<PrivateRoute element={<IncidentsList />} />} />
                <Route path="/incidents/:id" element={<PrivateRoute element={<IncidentDetail />} />} />
                
                {/* Responder routes */}
                <Route 
                  path="/responder/alerts"
                  element={
                    <RoleRoute 
                      roles={['responder', 'admin']} 
                      element={<ResponderAlerts />} 
                    />
                  }
                />
                <Route 
                  path="/responder/reports"
                  element={
                    <RoleRoute 
                      roles={['responder', 'admin']} 
                      element={<ResponderReports />} 
                    />
                  }
                />
                
                {/* Admin routes */}
                <Route 
                  path="/admin/users"
                  element={<RoleRoute roles={['admin']} element={<UserManagement />} />}
                />
                <Route 
                  path="/admin/analytics"
                  element={<RoleRoute roles={['admin']} element={<Analytics />} />}
                />
                <Route 
                  path="/admin/settings"
                  element={<RoleRoute roles={['admin']} element={<Settings />} />}
                />
              </Route>
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </IncidentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
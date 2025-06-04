import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useIncidents } from '../contexts/IncidentContext';
import toast from 'react-hot-toast';

const TestSupabase: React.FC = () => {
  const { user, login, register, logout } = useAuth();
  const { incidents, reportIncident, loading } = useIncidents();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        name,
        email,
        password,
        confirmPassword: password,
        role: 'user'
      });
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleTestIncident = async () => {
    if (!user) {
      toast.error('Please login first');
      return;
    }

    try {
      await reportIncident({
        title: 'Test Incident',
        description: 'This is a test incident',
        type: 'other',
        severity: 'low',
        status: 'reported',
        location: {
          latitude: 14.5995,
          longitude: 120.9842,
          address: 'Manila, Philippines'
        },
        reporterId: user.id
      });
      toast.success('Test incident created successfully');
    } catch (error) {
      console.error('Error creating test incident:', error);
      toast.error('Failed to create test incident');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Integration Test</h1>
      
      {!user ? (
        <div className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-2">
            <h2 className="text-xl font-semibold">Login</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
              Login
            </button>
          </form>

          <form onSubmit={handleRegister} className="space-y-2">
            <h2 className="text-xl font-semibold">Register</h2>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">
              Register
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-xl font-semibold">Logged in as:</h2>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
          </div>

          <button
            onClick={handleTestIncident}
            className="bg-blue-500 text-white p-2 rounded"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Test Incident'}
          </button>

          <button
            onClick={logout}
            className="bg-red-500 text-white p-2 rounded"
          >
            Logout
          </button>

          <div className="mt-4">
            <h2 className="text-xl font-semibold">Incidents:</h2>
            {incidents.map((incident) => (
              <div key={incident.id} className="bg-gray-100 p-4 rounded mt-2">
                <h3 className="font-semibold">{incident.title}</h3>
                <p>{incident.description}</p>
                <p>Status: {incident.status}</p>
                <p>Severity: {incident.severity}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSupabase; 
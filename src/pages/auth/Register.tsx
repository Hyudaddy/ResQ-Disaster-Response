import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, User, Building, MapPin } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import ThemeToggle from '../../components/common/ThemeToggle';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth.types';

// Department options
const departmentOptions = [
  { value: '', label: 'Select Department' },
  { value: 'BFP', label: 'BFP' },
  { value: 'PDRRMO', label: 'PDRRMO' },
  { value: 'MDRRMO', label: 'MDRRMO' },
  { value: 'NSART', label: 'NSART' },
  { value: 'SARAS', label: 'SARAS' },
  { value: 'PETSARAG', label: 'PETSARAG' },
  { value: 'REDCROSS', label: 'REDCROSS' },
];

// Municipality options for Agusan del Sur
const municipalityOptions = [
  { value: '', label: 'Select Municipality' },
  { value: 'Bayugan', label: 'Bayugan' },
  { value: 'Bunawan', label: 'Bunawan' },
  { value: 'Esperanza', label: 'Esperanza' },
  { value: 'La Paz', label: 'La Paz' },
  { value: 'Loreto', label: 'Loreto' },
  { value: 'Prosperidad', label: 'Prosperidad' },
  { value: 'Rosario', label: 'Rosario' },
  { value: 'San Francisco', label: 'San Francisco' },
  { value: 'San Luis', label: 'San Luis' },
  { value: 'Santa Josefa', label: 'Santa Josefa' },
  { value: 'Sibagat', label: 'Sibagat' },
  { value: 'Talacogon', label: 'Talacogon' },
  { value: 'Trento', label: 'Trento' },
  { value: 'Veruela', label: 'Veruela' },
];

const Register: React.FC = () => {
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    jurisdiction: '',
    adminCode: '',
    responderCode: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    jurisdiction: '',
    adminCode: '',
    responderCode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Password confirmation is required';
      valid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    if (selectedRole === 'responder') {
      if (!formData.responderCode.trim()) {
        newErrors.responderCode = 'Responder code is required';
        valid = false;
      } else if (formData.responderCode !== 'RESPONDER123') { // Example responder code
        newErrors.responderCode = 'Invalid responder code';
        valid = false;
      }
      if (!formData.department) {
        newErrors.department = 'Department is required for responders';
        valid = false;
      }
      if (!formData.jurisdiction) {
        newErrors.jurisdiction = 'Jurisdiction is required for responders';
        valid = false;
      }
    }

    if (selectedRole === 'admin') {
      if (!formData.adminCode.trim()) {
        newErrors.adminCode = 'Admin code is required';
        valid = false;
      } else if (formData.adminCode !== 'ADMIN123') { // Example admin code
        newErrors.adminCode = 'Invalid admin code';
        valid = false;
      }
      if (!formData.department) {
        newErrors.department = 'Department is required for admins';
        valid = false;
      }
      if (!formData.jurisdiction) {
        newErrors.jurisdiction = 'Jurisdiction is required for admins';
        valid = false;
      }
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // Call the register function - navigation is handled within AuthContext
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: selectedRole,
        department: formData.department,
        jurisdiction: formData.jurisdiction,
      });

    } catch (error) {
      // Error is handled and possibly toasted in the auth context
      console.error('Registration error handled by AuthContext:', error);
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-light-50 dark:bg-dark-950 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center bg-primary-500 text-white h-16 w-16 rounded-lg mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-3xl font-bold text-light-900 dark:text-white mb-2">Join ResQ</h1>
          <p className="text-light-600 dark:text-dark-300">Create your account to get started</p>
        </div>
        
        <div className="bg-white dark:bg-dark-900 rounded-lg p-6 shadow-lg border border-light-200 dark:border-dark-800">
          <div className="flex justify-end mb-4">
            <ThemeToggle variant="ghost" size="sm" showText={false} />
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-light-700 dark:text-dark-200 mb-2">
              I want to register as:
            </label>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <button
                type="button"
                className={`p-3 rounded-lg border text-center transition-colors ${
                  selectedRole === 'citizen'
                    ? 'bg-primary-500/20 border-primary-500 text-primary-500'
                    : 'border-light-200 dark:border-dark-700 text-light-600 dark:text-dark-300 hover:border-light-300 dark:hover:border-dark-600'
                }`}
                onClick={() => setSelectedRole('citizen')}
              >
                <User size={20} className="mx-auto mb-1" />
                <span className="text-sm">Citizen</span>
              </button>
              
              <button
                type="button"
                className={`p-3 rounded-lg border text-center transition-colors ${
                  selectedRole === 'responder'
                    ? 'bg-primary-500/20 border-primary-500 text-primary-500'
                    : 'border-light-200 dark:border-dark-700 text-light-600 dark:text-dark-300 hover:border-light-300 dark:hover:border-dark-600'
                }`}
                onClick={() => setSelectedRole('responder')}
              >
                <ShieldAlert size={20} className="mx-auto mb-1" />
                <span className="text-sm">Responder</span>
              </button>

              <button
                type="button"
                className={`p-3 rounded-lg border text-center transition-colors ${
                  selectedRole === 'admin'
                    ? 'bg-primary-500/20 border-primary-500 text-primary-500'
                    : 'border-light-200 dark:border-dark-700 text-light-600 dark:text-dark-300 hover:border-light-300 dark:hover:border-dark-600'
                }`}
                onClick={() => setSelectedRole('admin')}
              >
                <Building size={20} className="mx-auto mb-1" />
                <span className="text-sm">Admin</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Basic Info: Name, Email, Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Input
                  label="Full Name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  leftIcon={<User size={18} />}
                  error={errors.name}
                  required
                />
                
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  leftIcon={<Mail size={18} />}
                  error={errors.email}
                  required
                />
              </div>

              <div className="space-y-6">
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  leftIcon={<Lock size={18} />}
                  error={errors.password}
                  showPasswordToggle
                  showPasswordStrength
                  required
                />
                
                <Input
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  leftIcon={<Lock size={18} />}
                  error={errors.confirmPassword}
                  showPasswordToggle
                  required
                />
              </div>
            </div>

            {/* Additional fields for responders and admins */}
            {(selectedRole === 'responder' || selectedRole === 'admin') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Select
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  options={departmentOptions}
                  error={errors.department}
                  required
                  fullWidth
                />
                
                <Select
                  label="Jurisdiction"
                  name="jurisdiction"
                  value={formData.jurisdiction}
                  onChange={handleChange}
                  options={municipalityOptions}
                  error={errors.jurisdiction}
                  required
                  fullWidth
                />
              </div>
            )}

            <div className="mt-6">
              {selectedRole === 'admin' && (
                <Input
                  label="Admin Code"
                  type="password"
                  name="adminCode"
                  value={formData.adminCode}
                  onChange={handleChange}
                  placeholder="Enter admin code"
                  error={errors.adminCode}
                  required
                />
              )}

              {selectedRole === 'responder' && (
                <Input
                  label="Responder Code"
                  type="password"
                  name="responderCode"
                  value={formData.responderCode}
                  onChange={handleChange}
                  placeholder="Enter responder code"
                  error={errors.responderCode}
                  required
                />
              )}
            </div>
            
            <div className="mt-8">
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-light-600 dark:text-dark-300">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-500 hover:text-primary-400 transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
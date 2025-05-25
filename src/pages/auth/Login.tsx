import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, Lock } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ThemeToggle from '../../components/common/ThemeToggle';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await login({
        email: formData.email,
        password: formData.password
      });
      navigate('/');
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-light-50 dark:bg-dark-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center bg-primary-500 text-white h-16 w-16 rounded-lg mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-3xl font-bold text-light-900 dark:text-white mb-2">Welcome to ResQ</h1>
          <p className="text-light-600 dark:text-dark-300">Sign in to your account to continue</p>
        </div>
        
        <div className="bg-white dark:bg-dark-900 rounded-lg p-6 shadow-lg border border-light-200 dark:border-dark-800">
          <div className="flex justify-end mb-4">
            <ThemeToggle variant="ghost" size="sm" showText={false} />
          </div>

          <form onSubmit={handleSubmit}>
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
            
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              leftIcon={<Lock size={18} />}
              error={errors.password}
              required
            />
            
            <div className="mt-6">
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-light-600 dark:text-dark-300">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-500 hover:text-primary-400 transition">
                Sign up
              </Link>
            </p>
          </div>
          
          <div className="mt-6 text-center">
            <div className="text-sm text-light-500 dark:text-dark-400 border-t border-light-200 dark:border-dark-800 pt-4">
              <p className="mb-1">Demo Accounts:</p>
              <p className="text-xs">Public: public@example.com</p>
              <p className="text-xs">Responder: responder@example.com</p>
              <p className="text-xs">Admin: admin@example.com</p>
              <p className="text-xs mt-2">(All passwords: "password")</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
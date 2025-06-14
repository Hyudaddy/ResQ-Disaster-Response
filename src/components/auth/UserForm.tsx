import React, { useState } from 'react';
import { ShieldAlert, Mail, Lock, User, Building, MapPin } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

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

interface UserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  full_name?: string;
  department?: string;
  jurisdiction?: string;
}

const UserForm: React.FC<UserFormProps> = ({ onSuccess, onCancel, isModal = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'citizen' | 'responder' | 'admin'>('citizen');
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    department: '',
    jurisdiction: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if ((selectedRole === 'responder' || selectedRole === 'admin') && !formData.department) {
      newErrors.department = 'Department is required for responders and admins';
    }

    if ((selectedRole === 'responder' || selectedRole === 'admin') && !formData.jurisdiction) {
      newErrors.jurisdiction = 'Jurisdiction is required for responders and admins';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!session) {
        throw new Error('No active session. Please log in again.');
      }

      // Verify that the user is an admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
        .throwOnError();

      if (profileError) {
        throw new Error(`Profile error: ${profileError}`);
      }

      if (profile?.role !== 'admin') {
        throw new Error('Only admins can create users');
      }

      // Create the user using Supabase's admin API
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: selectedRole,
            department: selectedRole === 'responder' || selectedRole === 'admin' ? formData.department : null,
            jurisdiction: selectedRole === 'responder' || selectedRole === 'admin' ? formData.jurisdiction : null,
          },
        },
      });

      if (userError) {
        throw new Error(userError.message);
      }

      if (!userData.user) {
        throw new Error('Failed to create user');
      }

      // Create the profile
      const { error: profileCreateError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userData.user.id,
            email: formData.email,
            full_name: formData.full_name,
            role: selectedRole,
            department: selectedRole === 'responder' || selectedRole === 'admin' ? formData.department : null,
            jurisdiction: selectedRole === 'responder' || selectedRole === 'admin' ? formData.jurisdiction : null,
          },
        ]);

      if (profileCreateError) {
        // If profile creation fails, delete the auth user
        await supabase.auth.admin.deleteUser(userData.user.id);
        throw new Error('Failed to create user profile');
      }

      toast.success('User created successfully');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.message.includes('Failed to fetch')) {
        toast.error('Network error. Please check your connection and try again.');
      } else if (error.message.includes('No active session')) {
        toast.error('Your session has expired. Please log in again.');
      } else {
        toast.error(error.message || 'Failed to create user');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${isModal ? 'p-6' : 'min-h-screen bg-light-50 dark:bg-dark-950 flex flex-col items-center justify-center px-4 py-8'}`}>
      <div className={`${isModal ? 'w-full max-w-6xl mx-auto' : 'w-full max-w-6xl'}`}>
        {!isModal && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center bg-primary-500 text-white h-16 w-16 rounded-lg mb-4">
              <ShieldAlert size={32} />
            </div>
            <h1 className="text-3xl font-bold text-light-900 dark:text-white mb-2">Create New User</h1>
            <p className="text-light-600 dark:text-dark-300">Add a new user to the system</p>
          </div>
        )}
        
        <div className="bg-white dark:bg-dark-900 rounded-lg p-8 shadow-lg border border-light-200 dark:border-dark-800">
          {/* Role Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-light-700 dark:text-dark-200 mb-4">
              Select User Role:
            </label>
            <div className="grid grid-cols-3 gap-6">
              <button
                type="button"
                className={`p-4 rounded-lg border text-center transition-colors ${
                  selectedRole === 'citizen'
                    ? 'bg-primary-500/20 border-primary-500 text-primary-500'
                    : 'border-light-200 dark:border-dark-700 text-light-600 dark:text-dark-300 hover:border-light-300 dark:hover:border-dark-600'
                }`}
                onClick={() => setSelectedRole('citizen')}
              >
                <User size={24} className="mx-auto mb-2" />
                <span className="text-sm font-medium">Public User</span>
              </button>
              
              <button
                type="button"
                className={`p-4 rounded-lg border text-center transition-colors ${
                  selectedRole === 'responder'
                    ? 'bg-primary-500/20 border-primary-500 text-primary-500'
                    : 'border-light-200 dark:border-dark-700 text-light-600 dark:text-dark-300 hover:border-light-300 dark:hover:border-dark-600'
                }`}
                onClick={() => setSelectedRole('responder')}
              >
                <ShieldAlert size={24} className="mx-auto mb-2" />
                <span className="text-sm font-medium">Responder</span>
              </button>

              <button
                type="button"
                className={`p-4 rounded-lg border text-center transition-colors ${
                  selectedRole === 'admin'
                    ? 'bg-primary-500/20 border-primary-500 text-primary-500'
                    : 'border-light-200 dark:border-dark-700 text-light-600 dark:text-dark-300 hover:border-light-300 dark:hover:border-dark-600'
                }`}
                onClick={() => setSelectedRole('admin')}
              >
                <Building size={24} className="mx-auto mb-2" />
                <span className="text-sm font-medium">Admin</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Basic Info: Name, Email, Password */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Input
                  label="Full Name"
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  leftIcon={<User size={18} />}
                  error={errors.full_name}
                  required
                />
                
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
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
                  placeholder="Create password"
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
                  placeholder="Confirm password"
                  leftIcon={<Lock size={18} />}
                  error={errors.confirmPassword}
                  showPasswordToggle
                  required
                />
              </div>
            </div>

            {/* Additional fields for responders and admins */}
            {(selectedRole === 'responder' || selectedRole === 'admin') && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
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
            
            <div className="mt-8 flex items-center justify-end space-x-4">
              {isModal && onCancel && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="min-w-[120px]"
              >
                Create User
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserForm; 
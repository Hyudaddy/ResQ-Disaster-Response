import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterCredentials, AuthState, UserRole } from '../types/auth.types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType extends AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Only try to get the profile - do not create if it doesn't exist here
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore 'Result not found' error here
         console.error('Error fetching user profile:', error);
         toast.error('Failed to load user profile');
         throw error;
      }

      if (profile) {
        setUser(profile as User);
      } else {
        // Profile not found - this is expected during initial signup before profile is created
        // Or if a user exists without a profile (less common).
        // Do not attempt to create the profile here.
        setUser(null); // Explicitly set user to null if profile not found
      }
    } catch (error) {
      console.error('Unexpected error in fetchUserProfile:', error);
      toast.error('An unexpected error occurred while loading profile');
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        }
        throw error;
      }

      if (data.user) {
        await fetchUserProfile(data.user.id);
        toast.success('Logged in successfully');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      toast.error(error.message || 'Failed to log in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);
      
      // Proceed with registration
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });

      if (signUpError) throw signUpError;

      if (!data.user) {
        throw new Error('No user data returned from sign up');
      }

      // Create the profile in the 'profiles' table
      const newProfileData = {
        id: data.user.id,
        full_name: credentials.name,
        email: credentials.email,
        role: credentials.role,
        department: credentials.role === 'public' ? null : credentials.department || null,
        jurisdiction: credentials.role === 'public' ? null : credentials.jurisdiction || null,
      };

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([newProfileData])
        .select(); // Select the inserted data to get default values if any

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Consider rollback: delete the auth user if profile creation fails critically
        // await supabase.auth.admin.deleteUser(data.user.id); // Requires admin key
        throw profileError;
      }

      if (profileData && profileData.length > 0) {
         setUser(profileData[0] as User);
         toast.success('Registration successful!');
         navigate('/dashboard', { replace: true });
      } else {
         // This case should ideally not happen if insert is successful
         console.error('Profile creation successful but no data returned.', newProfileData);
         toast.error('Registration successful, but failed to load profile.');
         // Optionally navigate or stay on a loading/error page
         // navigate('/error');
      }

    } catch (error: any) {
      console.error('Error registering:', error);
      // Improved error messages
      if (error.message.includes('duplicate key value violates unique constraint')) {
         toast.error('An account with this email already exists. Please sign in instead.');
      } else if (error.message.includes('violates foreign key constraint')) {
         toast.error('Invalid department or jurisdiction selected.');
      } else if (error.message.includes('violates check constraint')) {
         toast.error('Invalid data provided for profile fields.');
      } else if (error.message.includes('User already registered')) { // Specific Supabase auth error
         toast.error('An account with this email already exists. Please sign in instead.');
      } else {
        toast.error(error.message || 'Failed to register');
      }
      // No need to rethrow if handled with toast
      // throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch (error: any) {
      console.error('Error logging out:', error);
      toast.error(error.message || 'Failed to log out');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user,
      isLoading,
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
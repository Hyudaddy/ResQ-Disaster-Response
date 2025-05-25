export type UserRole = 'public' | 'responder' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  avatarUrl?: string;
  department?: string; // For responders
  jurisdiction?: string; // For responders/admins
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  department?: string;
  jurisdiction?: string;
}
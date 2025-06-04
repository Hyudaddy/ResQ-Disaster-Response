export type UserRole = 'public' | 'responder' | 'admin';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department?: string | null;
  jurisdiction?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
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
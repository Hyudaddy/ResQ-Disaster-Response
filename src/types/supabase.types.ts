export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: 'admin' | 'responder' | 'public'
          department: string | null
          jurisdiction: string | null
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role?: 'admin' | 'responder' | 'public'
          department?: string | null
          jurisdiction?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: 'admin' | 'responder' | 'public'
          department?: string | null
          jurisdiction?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
      }
      incident_types: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          municipality: string
          barangay: string
          purok: string | null
          latitude: number | null
          longitude: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          municipality: string
          barangay: string
          purok?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          municipality?: string
          barangay?: string
          purok?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      incidents: {
        Row: {
          id: string
          title: string
          description: string | null
          type_id: string
          location_id: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          status: 'reported' | 'in_progress' | 'resolved' | 'closed'
          reporter_id: string
          weather_info: Json | null
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type_id: string
          location_id: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'reported' | 'in_progress' | 'resolved' | 'closed'
          reporter_id: string
          weather_info?: Json | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type_id?: string
          location_id?: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'reported' | 'in_progress' | 'resolved' | 'closed'
          reporter_id?: string
          weather_info?: Json | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
      }
      incident_images: {
        Row: {
          id: string
          incident_id: string
          url: string
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          incident_id: string
          url: string
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          incident_id?: string
          url?: string
          uploaded_by?: string
          created_at?: string
        }
      }
      incident_responders: {
        Row: {
          incident_id: string
          responder_id: string
          assigned_at: string
          notes: string | null
          status: 'assigned' | 'en_route' | 'on_scene' | 'completed'
        }
        Insert: {
          incident_id: string
          responder_id: string
          assigned_at?: string
          notes?: string | null
          status?: 'assigned' | 'en_route' | 'on_scene' | 'completed'
        }
        Update: {
          incident_id?: string
          responder_id?: string
          assigned_at?: string
          notes?: string | null
          status?: 'assigned' | 'en_route' | 'on_scene' | 'completed'
        }
      }
      resources: {
        Row: {
          id: string
          name: string
          type: 'personnel' | 'equipment' | 'vehicle' | 'supplies'
          status: 'available' | 'deployed' | 'maintenance'
          location_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'personnel' | 'equipment' | 'vehicle' | 'supplies'
          status?: 'available' | 'deployed' | 'maintenance'
          location_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'personnel' | 'equipment' | 'vehicle' | 'supplies'
          status?: 'available' | 'deployed' | 'maintenance'
          location_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      incident_resources: {
        Row: {
          incident_id: string
          resource_id: string
          assigned_at: string
          status: 'assigned' | 'deployed' | 'returned'
          notes: string | null
        }
        Insert: {
          incident_id: string
          resource_id: string
          assigned_at?: string
          status?: 'assigned' | 'deployed' | 'returned'
          notes?: string | null
        }
        Update: {
          incident_id?: string
          resource_id?: string
          assigned_at?: string
          status?: 'assigned' | 'deployed' | 'returned'
          notes?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Incident, IncidentFilter, IncidentType, IncidentWithDetails } from '../types/incident.types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface IncidentContextType {
  incidents: IncidentWithDetails[];
  filteredIncidents: IncidentWithDetails[];
  filter: IncidentFilter;
  setFilter: React.Dispatch<React.SetStateAction<IncidentFilter>>;
  loading: boolean;
  error: string | null;
  reportIncident: (incident: Omit<IncidentWithDetails, 'id' | 'created_at' | 'updated_at'>) => Promise<IncidentWithDetails>;
  updateIncident: (incidentId: string, updates: Partial<IncidentWithDetails>) => Promise<IncidentWithDetails>;
  getIncidentById: (id: string) => IncidentWithDetails | undefined;
  refreshIncidents: () => Promise<void>;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<IncidentWithDetails[]>([]);
  const [filter, setFilter] = useState<IncidentFilter>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        console.error('Supabase client is not initialized');
        throw new Error('Database connection failed');
      }

      // Check network connectivity
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      // Log the Supabase configuration (without sensitive data)
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Supabase Anon Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

      // Test the connection with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      let testError = null;

      while (retryCount < maxRetries) {
        try {
          const { data: testData, error: error } = await supabase.from('incidents').select('count').limit(1);
          if (error) throw error;
          testError = null;
          break;
        } catch (error) {
          testError = error;
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
            continue;
          }
        }
      }

      if (testError) {
        console.error('Supabase connection test failed after retries:', testError);
        throw new Error('Unable to connect to the database. Please check your internet connection and try again.');
      }

      console.log('Fetching incidents...');
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          type:incident_types(*),
          location:locations(*),
          reporter:profiles!reporter_id(*),
          images:incident_images(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching incidents:', error);
        throw error;
      }

      console.log('Fetched incidents:', data?.length || 0);

      if (data) {
        const mappedIncidents = data.map(incident => ({
          id: incident.id,
          title: incident.title,
          description: incident.description || '',
          type_id: incident.type_id,
          location_id: incident.location_id,
          severity: incident.severity,
          status: incident.status,
          reporter_id: incident.reporter_id,
          weather_info: incident.weather_info,
          created_at: incident.created_at,
          updated_at: incident.updated_at,
          resolved_at: incident.resolved_at,
          type: incident.type,
          location: incident.location,
          reporter: incident.reporter,
          images: incident.images || []
        }));

        console.log('Mapped incidents:', mappedIncidents.length);
        setIncidents(mappedIncidents);
      }
    } catch (error) {
      console.error('Error in fetchIncidents:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load incidents';
      setError(errorMessage);
      toast.error(`Failed to load incidents: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    console.log('Initial fetch of incidents...');
    fetchIncidents();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    if (!supabase) {
      console.error('Cannot set up real-time subscription: Supabase client is not initialized');
      return;
    }

    console.log('Setting up real-time subscription...');
    const subscription = supabase
      .channel('incidents_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'incidents' 
        }, 
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchIncidents();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription...');
      subscription.unsubscribe();
    };
  }, []);

  const filteredIncidents = incidents.filter(incident => {
    // Search query filter
    if (filter.searchQuery) {
      const searchLower = filter.searchQuery.toLowerCase();
      const matchesSearch = 
        incident.title.toLowerCase().includes(searchLower) ||
        incident.description.toLowerCase().includes(searchLower) ||
        incident.location.municipality.toLowerCase().includes(searchLower) ||
        incident.location.barangay.toLowerCase().includes(searchLower) ||
        (incident.location.purok?.toLowerCase().includes(searchLower) ?? false) ||
        incident.reporter.full_name.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Type filter (multiple selection)
    if (filter.type && filter.type.length > 0) {
      if (!filter.type.includes(incident.type.name)) return false;
    }

    // Severity filter (multiple selection)
    if (filter.severity && filter.severity.length > 0) {
      if (!filter.severity.includes(incident.severity)) return false;
    }

    // Status filter (multiple selection)
    if (filter.status && filter.status.length > 0) {
      if (!filter.status.includes(incident.status)) return false;
    }

    // Date range filter
    if (filter.fromDate) {
      const fromDate = new Date(filter.fromDate);
      const incidentDate = new Date(incident.created_at);
      if (incidentDate < fromDate) return false;
    }

    if (filter.toDate) {
      const toDate = new Date(filter.toDate);
      toDate.setHours(23, 59, 59, 999); // End of the day
      const incidentDate = new Date(incident.created_at);
      if (incidentDate > toDate) return false;
    }

    return true;
  });

  const reportIncident = async (incident: Omit<IncidentWithDetails, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user) throw new Error('User must be logged in to report incidents');

      // First, create the location
      const { data: locationData, error: locationError } = await supabase
        .from('locations')
        .insert([
          {
            municipality: incident.location.municipality,
            barangay: incident.location.barangay,
            purok: incident.location.purok,
            latitude: incident.location.latitude,
            longitude: incident.location.longitude,
          },
        ])
        .select()
        .single();

      if (locationError) throw locationError;
      if (!locationData) throw new Error('Failed to create location');

      // Then create the incident
      const { data, error } = await supabase
        .from('incidents')
        .insert([
          {
            title: incident.title,
            description: incident.description,
            type_id: incident.type_id,
            location_id: locationData.id,
            status: incident.status,
            severity: incident.severity,
            reporter_id: user.id,
            weather_info: incident.weather_info,
          },
        ])
        .select(`
          *,
          type:incident_types(*),
          location:locations(*),
          reporter:profiles!reporter_id(*)
        `)
        .single();

      if (error) throw error;

      if (data) {
        const newIncident: IncidentWithDetails = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          type_id: data.type_id,
          location_id: data.location_id,
          severity: data.severity,
          status: data.status,
          reporter_id: data.reporter_id,
          weather_info: data.weather_info,
          created_at: data.created_at,
          updated_at: data.updated_at,
          resolved_at: data.resolved_at,
          type: data.type,
          location: data.location,
          reporter: data.reporter,
        };

        setIncidents(prev => [newIncident, ...prev]);
        toast.success('Incident reported successfully');
        return newIncident;
      }

      throw new Error('Failed to create incident');
    } catch (error) {
      console.error('Error reporting incident:', error);
      toast.error('Failed to report incident');
      throw error;
    }
  };

  const updateIncident = async (incidentId: string, updates: Partial<IncidentWithDetails>) => {
    try {
      // First, update the location if it's provided
      let locationId = updates.location_id;
      if (updates.location) {
        const { data: locationData, error: locationError } = await supabase
          .from('locations')
          .update({
            municipality: updates.location.municipality,
            barangay: updates.location.barangay,
            purok: updates.location.purok,
            latitude: updates.location.latitude,
            longitude: updates.location.longitude,
            updated_at: new Date().toISOString(),
          })
          .eq('id', updates.location_id)
          .select()
          .single();

        if (locationError) throw locationError;
        if (locationData) {
          locationId = locationData.id;
        }
      }

      // Prepare the incident update data
      const incidentUpdateData: any = {
        title: updates.title,
        description: updates.description,
        type_id: updates.type_id,
        location_id: locationId,
        status: updates.status,
        severity: updates.severity,
        updated_at: new Date().toISOString(),
      };

      // Add resolved_at if status is resolved or closed
      if (updates.status === 'resolved' || updates.status === 'closed') {
        incidentUpdateData.resolved_at = new Date().toISOString();
      }

      // First update the incident
      const { error: updateError } = await supabase
        .from('incidents')
        .update(incidentUpdateData)
        .eq('id', incidentId);

      if (updateError) throw updateError;

      // Fetch the updated incident with all its relations
      const { data: updatedIncident, error: fetchError } = await supabase
        .from('incidents')
        .select(`
          *,
          type:incident_types(*),
          location:locations(*),
          reporter:profiles!reporter_id(*),
          images:incident_images(*),
          responders:incident_responders(
            *,
            responder:profiles(*)
          )
        `)
        .eq('id', incidentId)
        .single();

      if (fetchError) throw fetchError;
      if (!updatedIncident) throw new Error('Failed to fetch updated incident');

      // Update the incidents state with the new data
      setIncidents(prevIncidents => 
        prevIncidents.map(incident => 
          incident.id === incidentId 
            ? {
                ...incident,
                ...updatedIncident,
                type: updatedIncident.type,
                location: updatedIncident.location,
                reporter: updatedIncident.reporter,
                images: updatedIncident.images || [],
                responders: updatedIncident.responders || []
              }
            : incident
        )
      );

      toast.success('Incident updated successfully');
      return updatedIncident;
    } catch (error) {
      console.error('Error updating incident:', error);
      throw error;
    }
  };

  const getIncidentById = (id: string) => {
    return incidents.find(incident => incident.id === id);
  };

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        filteredIncidents,
        filter,
        setFilter,
        loading,
        error,
        reportIncident,
        updateIncident,
        getIncidentById,
        refreshIncidents: fetchIncidents,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (context === undefined) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
};
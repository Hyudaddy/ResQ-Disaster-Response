import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Incident, IncidentFilter } from '../types/incident.types';
import { incidents, mockReportIncident, mockUpdateIncident } from '../data/mockData';
import toast from 'react-hot-toast';

interface IncidentContextType {
  incidents: Incident[];
  filteredIncidents: Incident[];
  filter: IncidentFilter;
  setFilter: React.Dispatch<React.SetStateAction<IncidentFilter>>;
  loading: boolean;
  error: string | null;
  reportIncident: (incident: Omit<Incident, 'id' | 'reportTime' | 'updatedAt'>) => Promise<Incident>;
  updateIncident: (incidentId: string, updates: Partial<Incident>) => Promise<Incident>;
  getIncidentById: (id: string) => Incident | undefined;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [filter, setFilter] = useState<IncidentFilter>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initial loading of incidents
  useEffect(() => {
    setAllIncidents(incidents);
    setFilteredIncidents(incidents);
    setLoading(false);
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    let result = [...allIncidents];
    
    // Filter by type
    if (filter.type && filter.type.length > 0) {
      result = result.filter(incident => filter.type?.includes(incident.type));
    }
    
    // Filter by severity
    if (filter.severity && filter.severity.length > 0) {
      result = result.filter(incident => filter.severity?.includes(incident.severity));
    }
    
    // Filter by status
    if (filter.status && filter.status.length > 0) {
      result = result.filter(incident => filter.status?.includes(incident.status));
    }
    
    // Filter by date range
    if (filter.fromDate) {
      const fromDate = new Date(filter.fromDate);
      result = result.filter(incident => new Date(incident.reportTime) >= fromDate);
    }
    
    if (filter.toDate) {
      const toDate = new Date(filter.toDate);
      result = result.filter(incident => new Date(incident.reportTime) <= toDate);
    }
    
    // Filter by search query
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter(
        incident => 
          incident.title.toLowerCase().includes(query) || 
          incident.description.toLowerCase().includes(query) ||
          incident.location.address?.toLowerCase().includes(query) ||
          incident.reporterName.toLowerCase().includes(query)
      );
    }
    
    setFilteredIncidents(result);
  }, [filter, allIncidents]);

  const reportIncident = async (incidentData: Omit<Incident, 'id' | 'reportTime' | 'updatedAt'>): Promise<Incident> => {
    setLoading(true);
    
    try {
      const newIncident = await mockReportIncident(incidentData);
      
      setAllIncidents(prev => [newIncident, ...prev]);
      toast.success('Incident reported successfully!');
      
      return newIncident;
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      toast.error(`Error reporting incident: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateIncident = async (incidentId: string, updates: Partial<Incident>): Promise<Incident> => {
    setLoading(true);
    
    try {
      const updatedIncident = await mockUpdateIncident(incidentId, updates);
      
      setAllIncidents(prev => 
        prev.map(incident => 
          incident.id === incidentId ? updatedIncident : incident
        )
      );
      
      toast.success('Incident updated successfully!');
      return updatedIncident;
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      toast.error(`Error updating incident: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getIncidentById = (id: string): Incident | undefined => {
    return allIncidents.find(incident => incident.id === id);
  };

  return (
    <IncidentContext.Provider
      value={{
        incidents: allIncidents,
        filteredIncidents,
        filter,
        setFilter,
        loading,
        error,
        reportIncident,
        updateIncident,
        getIncidentById,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = (): IncidentContextType => {
  const context = useContext(IncidentContext);
  if (context === undefined) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
};
import { Incident, IncidentType, IncidentStatus, IncidentSeverity } from '../types/incident.types';
import { User } from '../types/auth.types';

// Mock incidents data
export const mockIncidents: Incident[] = [];

// Mock users data
export const users: User[] = [];

// Helper functions for dashboard
export const getIncidentStats = () => {
  return {
    total: 0,
    active: 0,
    resolved: 0,
    critical: 0
  };
};

export const getIncidentTypeDistribution = () => {
  return {
    labels: ['Fire', 'Medical', 'Natural Disaster', 'Security', 'Other'],
    data: [0, 0, 0, 0, 0]
  };
};

export const getRecentIncidents = () => {
  return [];
};
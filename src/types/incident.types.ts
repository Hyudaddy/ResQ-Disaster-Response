export type IncidentType = 
  | 'fire' 
  | 'flood' 
  | 'earthquake' 
  | 'storm' 
  | 'medical' 
  | 'infrastructure' 
  | 'other';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 
  | 'reported' 
  | 'acknowledged' 
  | 'responding' 
  | 'resolved' 
  | 'closed';

export interface Location {
  purok: string;
  barangay: string;
  municipality: string;
  latitude: number;
  longitude: number;
  address?: string;
}

export interface WeatherInfo {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: Location;
  reporterId: string;
  reporterName: string;
  reportTime: string;
  updatedAt: string;
  responderIds?: string[];
  responderNotes?: string;
  adminNotes?: string;
  images?: string[];
  resolvedTime?: string;
  weatherInfo?: WeatherInfo;
}

export interface IncidentFilter {
  type?: IncidentType[];
  severity?: IncidentSeverity[];
  status?: IncidentStatus[];
  fromDate?: string;
  toDate?: string;
  searchQuery?: string;
  barangay?: string;
  municipality?: string;
}

export interface LocationData {
  barangays: string[];
  municipalities: string[];
}
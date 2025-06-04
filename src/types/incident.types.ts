export type IncidentType = 'fire' | 'flood' | 'earthquake' | 'storm' | 'medical' | 'infrastructure' | 'other';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 'reported' | 'acknowledged' | 'responding' | 'resolved' | 'closed';

export type ResponderStatus = 'assigned' | 'en_route' | 'on_scene' | 'completed';

export type ResourceStatus = 'assigned' | 'deployed' | 'returned';

export interface Location {
  id: string;
  municipality: string;
  barangay: string;
  purok?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
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
  type_id: string;
  location_id: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reporter_id: string;
  weather_info?: WeatherInfo;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  type?: {
    id: string;
    name: IncidentType;
    description: string;
    icon: string;
  };
  location?: Location;
  images?: {
    id: string;
    url: string;
    uploaded_by: string;
    created_at: string;
  }[];
}

export interface IncidentWithDetails extends Incident {
  type: {
    id: string;
    name: IncidentType;
    description: string;
    icon: string;
  };
  location: Location;
  reporter: {
    id: string;
    full_name: string;
    role: string;
  };
  images?: {
    id: string;
    url: string;
    uploaded_by: string;
    created_at: string;
  }[];
  responders?: {
    responder_id: string;
    assigned_at: string;
    notes?: string;
    status: ResponderStatus;
    responder: {
      id: string;
      full_name: string;
      role: string;
    };
  }[];
  resources?: {
    resource_id: string;
    assigned_at: string;
    status: ResourceStatus;
    notes?: string;
    resource: {
      id: string;
      name: string;
      type: string;
      status: string;
    };
  }[];
}

export interface IncidentFilter {
  type?: IncidentType[];
  severity?: IncidentSeverity[];
  status?: IncidentStatus[];
  searchQuery?: string;
  fromDate?: string;
  toDate?: string;
  location?: {
    municipality?: string;
    barangay?: string;
  };
}

export interface LocationData {
  municipalities: string[];
  barangays: {
    [municipality: string]: string[];
  };
}
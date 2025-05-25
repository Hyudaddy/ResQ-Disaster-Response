import { User, UserRole } from '../types/auth.types';
import { Incident, IncidentType, IncidentSeverity, IncidentStatus } from '../types/incident.types';
import { addHours, subDays, formatISO } from 'date-fns';

// Mock users
export const users: User[] = [
  {
    id: '1',
    name: 'Public User',
    email: 'public@example.com',
    role: 'public' as UserRole,
    createdAt: subDays(new Date(), 30).toISOString(),
    lastLogin: subDays(new Date(), 2).toISOString(),
  },
  {
    id: '2',
    name: 'Responder',
    email: 'responder@example.com',
    role: 'responder' as UserRole,
    department: 'Fire Department',
    jurisdiction: 'North District',
    createdAt: subDays(new Date(), 60).toISOString(),
    lastLogin: subDays(new Date(), 1).toISOString(),
    avatarUrl: 'https://i.pravatar.cc/150?img=32',
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin' as UserRole,
    jurisdiction: 'City-wide',
    createdAt: subDays(new Date(), 90).toISOString(),
    lastLogin: new Date().toISOString(),
    avatarUrl: 'https://i.pravatar.cc/150?img=68',
  },
];

// Generate random coordinates around a center point
const generateRandomLocation = (centerLat = 40.7128, centerLng = -74.0060, radiusKm = 5) => {
  // Earth's radius in kilometers
  const earthRadius = 6371;
  
  // Convert radius from kilometers to radians
  const radiusInRadian = radiusKm / earthRadius;
  
  // Random angle
  const randomAngle = Math.random() * Math.PI * 2;
  
  // Random radius adjusted by square root to ensure uniform distribution
  const randomRadius = Math.sqrt(Math.random()) * radiusInRadian;
  
  // Calculate offsets
  const latOffset = randomRadius * Math.cos(randomAngle);
  const lngOffset = randomRadius * Math.sin(randomAngle) / Math.cos(centerLat * (Math.PI / 180));
  
  // Calculate new position
  const newLat = centerLat + latOffset * (180 / Math.PI);
  const newLng = centerLng + lngOffset * (180 / Math.PI);
  
  return {
    latitude: newLat,
    longitude: newLng,
  };
};

// Mock incidents
export const incidents: Incident[] = [
  {
    id: '1',
    title: 'Building Fire on Main Street',
    description: 'A commercial building is on fire with visible flames from the roof. Multiple calls received.',
    type: 'fire' as IncidentType,
    severity: 'high' as IncidentSeverity,
    status: 'responding' as IncidentStatus,
    location: {
      ...generateRandomLocation(),
      address: '123 Main St, Downtown',
    },
    reporterId: '1',
    reporterName: 'John Public',
    reportTime: subDays(new Date(), 0.2).toISOString(),
    updatedAt: subDays(new Date(), 0.15).toISOString(),
    responderIds: ['2'],
    responderNotes: 'Multiple units dispatched. Estimated arrival in 5 minutes.',
    images: ['https://images.pexels.com/photos/1123972/pexels-photo-1123972.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
  },
  {
    id: '2',
    title: 'Flooding in East End',
    description: 'Rising water levels in residential area after heavy rainfall. Several homes affected.',
    type: 'flood' as IncidentType,
    severity: 'medium' as IncidentSeverity,
    status: 'acknowledged' as IncidentStatus,
    location: {
      ...generateRandomLocation(),
      address: '45 River Road, East End',
    },
    reporterId: '1',
    reporterName: 'John Public',
    reportTime: subDays(new Date(), 1).toISOString(),
    updatedAt: subDays(new Date(), 0.9).toISOString(),
    responderIds: [],
    images: ['https://images.pexels.com/photos/1756959/pexels-photo-1756959.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
  },
  {
    id: '3',
    title: 'Power Line Down',
    description: 'Storm has knocked down power lines across West Avenue. Sparks visible.',
    type: 'infrastructure' as IncidentType,
    severity: 'high' as IncidentSeverity,
    status: 'reported' as IncidentStatus,
    location: {
      ...generateRandomLocation(),
      address: '789 West Avenue',
    },
    reporterId: '1',
    reporterName: 'John Public',
    reportTime: subDays(new Date(), 0.5).toISOString(),
    updatedAt: subDays(new Date(), 0.5).toISOString(),
    images: ['https://images.pexels.com/photos/9800006/pexels-photo-9800006.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
  },
  {
    id: '4',
    title: 'Minor Earthquake Damage',
    description: 'Small tremors felt in South District. Some structural damage to older buildings reported.',
    type: 'earthquake' as IncidentType,
    severity: 'medium' as IncidentSeverity,
    status: 'resolved' as IncidentStatus,
    location: {
      ...generateRandomLocation(),
      address: '567 Shake Street, South District',
    },
    reporterId: '1',
    reporterName: 'John Public',
    reportTime: subDays(new Date(), 7).toISOString(),
    updatedAt: subDays(new Date(), 5).toISOString(),
    responderIds: ['2'],
    responderNotes: 'Building inspector dispatched. No major structural concerns.',
    resolvedTime: subDays(new Date(), 5).toISOString(),
    images: ['https://images.pexels.com/photos/259583/pexels-photo-259583.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
  },
  {
    id: '5',
    title: 'Medical Emergency at City Park',
    description: 'Elderly person collapsed near the fountain. Possible cardiac event.',
    type: 'medical' as IncidentType,
    severity: 'critical' as IncidentSeverity,
    status: 'closed' as IncidentStatus,
    location: {
      ...generateRandomLocation(),
      address: 'Central City Park, Fountain Area',
    },
    reporterId: '1',
    reporterName: 'John Public',
    reportTime: subDays(new Date(), 14).toISOString(),
    updatedAt: subDays(new Date(), 14).toISOString(),
    responderIds: ['2'],
    responderNotes: 'Medical team arrived within 5 minutes. Patient transported to City Hospital.',
    resolvedTime: subDays(new Date(), 14).toISOString(),
  },
  {
    id: '6',
    title: 'Severe Storm Warning',
    description: 'Heavy winds and rain approaching from the northwest. Several trees reported down.',
    type: 'storm' as IncidentType,
    severity: 'high' as IncidentSeverity,
    status: 'acknowledged' as IncidentStatus,
    location: {
      ...generateRandomLocation(),
      address: 'Citywide',
    },
    reporterId: '2',
    reporterName: 'Sarah Responder',
    reportTime: subDays(new Date(), 0.3).toISOString(),
    updatedAt: subDays(new Date(), 0.25).toISOString(),
    adminNotes: 'Monitor situation. Prepare for possible evacuation of low-lying areas.',
    images: ['https://images.pexels.com/photos/2258536/pexels-photo-2258536.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
  },
];

// Generate more incidents for demo purposes
for (let i = 7; i <= 20; i++) {
  const types: IncidentType[] = ['fire', 'flood', 'earthquake', 'storm', 'medical', 'infrastructure', 'other'];
  const severities: IncidentSeverity[] = ['low', 'medium', 'high', 'critical'];
  const statuses: IncidentStatus[] = ['reported', 'acknowledged', 'responding', 'resolved', 'closed'];
  
  const randomType = types[Math.floor(Math.random() * types.length)];
  const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const randomDaysAgo = Math.floor(Math.random() * 30);
  
  incidents.push({
    id: i.toString(),
    title: `${randomType.charAt(0).toUpperCase() + randomType.slice(1)} Incident ${i}`,
    description: `Auto-generated incident for demonstration purposes.`,
    type: randomType,
    severity: randomSeverity,
    status: randomStatus,
    location: {
      ...generateRandomLocation(),
      address: `${Math.floor(Math.random() * 999)} ${['Oak', 'Maple', 'Pine', 'Cedar'][Math.floor(Math.random() * 4)]} ${['St', 'Ave', 'Blvd', 'Rd'][Math.floor(Math.random() * 4)]}`,
    },
    reporterId: (Math.random() > 0.7) ? '2' : '1',
    reporterName: (Math.random() > 0.7) ? 'Sarah Responder' : 'John Public',
    reportTime: subDays(new Date(), randomDaysAgo).toISOString(),
    updatedAt: subDays(new Date(), randomDaysAgo * 0.9).toISOString(),
    responderIds: randomStatus !== 'reported' ? ['2'] : [],
    responderNotes: randomStatus !== 'reported' ? 'Standard response protocol initiated.' : undefined,
    resolvedTime: ['resolved', 'closed'].includes(randomStatus) 
      ? subDays(new Date(), randomDaysAgo * 0.8).toISOString() 
      : undefined,
  });
}

// Incident stats for dashboard
export const getIncidentStats = () => {
  const total = incidents.length;
  const active = incidents.filter(i => ['reported', 'acknowledged', 'responding'].includes(i.status)).length;
  const resolved = incidents.filter(i => ['resolved', 'closed'].includes(i.status)).length;
  const critical = incidents.filter(i => i.severity === 'critical').length;
  
  return { total, active, resolved, critical };
};

// Incident type distribution for charts
export const getIncidentTypeDistribution = () => {
  const types = incidents.reduce((acc, incident) => {
    acc[incident.type] = (acc[incident.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return types;
};

// Get recent incidents
export const getRecentIncidents = (limit = 5) => {
  return [...incidents]
    .sort((a, b) => new Date(b.reportTime).getTime() - new Date(a.reportTime).getTime())
    .slice(0, limit);
};

// Get incidents by status
export const getIncidentsByStatus = (status: IncidentStatus) => {
  return incidents.filter(i => i.status === status);
};

// Mock login function
export const mockLogin = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.email === email);
      if (user && password === 'password') { // In a real app, passwords would be hashed
        resolve({...user, lastLogin: new Date().toISOString()});
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 800);
  });
};

// Mock register function
export const mockRegister = (name: string, email: string, password: string, role: UserRole): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (users.some(u => u.email === email)) {
        reject(new Error('Email already in use'));
        return;
      }
      
      const newUser: User = {
        id: (users.length + 1).toString(),
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      
      users.push(newUser);
      resolve(newUser);
    }, 800);
  });
};

// Mock report incident function
export const mockReportIncident = (incident: Omit<Incident, 'id' | 'reportTime' | 'updatedAt'>): Promise<Incident> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newIncident: Incident = {
        ...incident,
        id: (incidents.length + 1).toString(),
        reportTime: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      incidents.unshift(newIncident);
      resolve(newIncident);
    }, 800);
  });
};

// Mock update incident function
export const mockUpdateIncident = (incidentId: string, updates: Partial<Incident>): Promise<Incident> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = incidents.findIndex(i => i.id === incidentId);
      if (index === -1) {
        reject(new Error('Incident not found'));
        return;
      }
      
      const updatedIncident = {
        ...incidents[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      incidents[index] = updatedIncident;
      resolve(updatedIncident);
    }, 800);
  });
};
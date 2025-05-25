import React, { useState, useEffect } from 'react';
import { ShieldAlert, Bell, MapPin, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useIncidents } from '../../contexts/IncidentContext';
import IncidentTypeBadge from '../../components/common/IncidentTypeBadge';
import IncidentSeverityBadge from '../../components/common/IncidentSeverityBadge';
import { formatDistanceToNow } from 'date-fns';

const ResponderAlerts: React.FC = () => {
  const { incidents } = useIncidents();
  const navigate = useNavigate();
  const [newAlerts, setNewAlerts] = useState<string[]>([]);
  
  // Filter for active incidents (not resolved or closed)
  const activeIncidents = incidents.filter(
    i => ['reported', 'acknowledged'].includes(i.status)
  );
  
  // High priority incidents (high or critical severity)
  const highPriorityIncidents = activeIncidents.filter(
    i => ['high', 'critical'].includes(i.severity)
  );
  
  // Standard priority incidents
  const standardPriorityIncidents = activeIncidents.filter(
    i => ['low', 'medium'].includes(i.severity)
  );

  // Simulate new alert notifications
  useEffect(() => {
    // Mark all active critical incidents as new
    const criticalIds = activeIncidents
      .filter(i => i.severity === 'critical')
      .map(i => i.id);
    
    setNewAlerts(criticalIds);
    
    // Clear new status after 10 seconds
    const timer = setTimeout(() => {
      setNewAlerts([]);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleViewIncident = (id: string) => {
    // Remove from new alerts
    setNewAlerts(prev => prev.filter(alertId => alertId !== id));
    // Navigate to incident detail
    navigate(`/incidents/${id}`);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <ShieldAlert size={24} className="text-primary-500 mr-2" />
          <h1 className="text-2xl font-bold text-white">Active Alerts</h1>
        </div>
        <p className="text-dark-300">
          Monitor and respond to active incidents requiring attention
        </p>
      </div>
      
      {/* High Priority Alerts */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <span className="inline-block w-3 h-3 bg-danger-500 rounded-full mr-2 animate-ping-slow"></span>
          High Priority
        </h2>
        
        {highPriorityIncidents.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Bell size={40} className="mx-auto mb-4 text-dark-500" />
              <p className="text-dark-300">No high priority incidents at this time</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {highPriorityIncidents.map(incident => (
              <Card 
                key={incident.id} 
                className={`border-l-4 ${
                  incident.severity === 'critical' 
                    ? 'border-l-danger-500' 
                    : 'border-l-warning-500'
                } ${
                  newAlerts.includes(incident.id)
                    ? 'animate-pulse bg-dark-800/70'
                    : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{incident.title}</h3>
                      <IncidentTypeBadge type={incident.type} />
                      <IncidentSeverityBadge severity={incident.severity} />
                    </div>
                    
                    <p className="text-dark-300 text-sm mb-3 line-clamp-1">{incident.description}</p>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-dark-400">
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-1" />
                        <span className="truncate max-w-[200px]">
                          {incident.location.address || `${incident.location.latitude.toFixed(4)}, ${incident.location.longitude.toFixed(4)}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>{formatDistanceToNow(new Date(incident.reportTime), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {newAlerts.includes(incident.id) && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-500 text-white">
                        New Alert
                      </span>
                    )}
                    <Button onClick={() => handleViewIncident(incident.id)}>
                      Respond
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Standard Priority Alerts */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <span className="inline-block w-2 h-2 bg-warning-500 rounded-full mr-2"></span>
          Standard Priority
        </h2>
        
        {standardPriorityIncidents.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Bell size={40} className="mx-auto mb-4 text-dark-500" />
              <p className="text-dark-300">No standard priority incidents at this time</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {standardPriorityIncidents.map(incident => (
              <Card key={incident.id}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{incident.title}</h3>
                    <IncidentTypeBadge type={incident.type} />
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <IncidentSeverityBadge severity={incident.severity} />
                    <div className="text-xs text-dark-400">
                      <Calendar size={12} className="inline mr-1" />
                      {new Date(incident.reportTime).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    fullWidth
                    onClick={() => handleViewIncident(incident.id)}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponderAlerts;
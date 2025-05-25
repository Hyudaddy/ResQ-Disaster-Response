import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Incident } from '../../types/incident.types';
import Card from '../common/Card';
import IncidentStatusBadge from '../common/IncidentStatusBadge';
import IncidentTypeBadge from '../common/IncidentTypeBadge';
import IncidentSeverityBadge from '../common/IncidentSeverityBadge';
import { MapPin, Clock, User } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
  compact?: boolean;
}

interface IncidentCardComponent extends React.FC<IncidentCardProps> {
  IncidentTypeBadge: typeof IncidentTypeBadge;
  IncidentStatusBadge: typeof IncidentStatusBadge;
  IncidentSeverityBadge: typeof IncidentSeverityBadge;
}

const IncidentCard: IncidentCardComponent = ({ incident, compact = false }) => {
  const {
    id,
    title,
    description,
    type,
    severity,
    status,
    location,
    reporterName,
    reportTime,
  } = incident;

  return (
    <Card
      className={`transition-all duration-200 hover:border-primary-500/50 h-full ${
        severity === 'critical' ? 'border-l-4 border-l-danger-500' : ''
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <IncidentTypeBadge type={type} />
          <IncidentStatusBadge status={status} />
        </div>
        
        <Link to={`/incidents/${id}`} className="block mb-2 hover:text-primary-400 transition-colors">
          <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
        </Link>
        
        {!compact && (
          <p className="text-dark-300 text-sm mb-4 line-clamp-2">{description}</p>
        )}
        
        <div className="mt-auto pt-2">
          <div className="flex items-center text-xs text-dark-400 mb-1.5">
            <MapPin size={14} className="mr-1" />
            <span className="truncate">
              {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-y-1.5 justify-between">
            <div className="flex items-center text-xs text-dark-400">
              <Clock size={14} className="mr-1" />
              <span>{formatDistanceToNow(new Date(reportTime), { addSuffix: true })}</span>
            </div>
            
            <div className="flex items-center text-xs text-dark-400">
              <User size={14} className="mr-1" />
              <span>{reporterName}</span>
            </div>
            
            <div className="w-full mt-2">
              <IncidentSeverityBadge severity={severity} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Add static properties for badge components
IncidentCard.IncidentTypeBadge = IncidentTypeBadge;
IncidentCard.IncidentStatusBadge = IncidentStatusBadge;
IncidentCard.IncidentSeverityBadge = IncidentSeverityBadge;

export default IncidentCard;
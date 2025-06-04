import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { IncidentWithDetails } from '../../types/incident.types';
import Card from '../common/Card';
import IncidentStatusBadge from '../common/IncidentStatusBadge';
import IncidentTypeBadge from '../common/IncidentTypeBadge';
import IncidentSeverityBadge from '../common/IncidentSeverityBadge';
import { MapPin, Clock, User } from 'lucide-react';

interface IncidentCardProps {
  incident: IncidentWithDetails;
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
    reporter,
    created_at,
  } = incident;

  return (
    <Card
      className={`transition-all duration-200 hover:border-primary-500/50 h-full ${
        severity === 'critical' ? 'border-l-4 border-l-danger-500' : ''
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <IncidentTypeBadge type={type} />
          <IncidentStatusBadge status={status} />
        </div>
        
        <Link to={`/incidents/${id}`} className="block mb-3 hover:text-primary-400 transition-colors">
          <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
        </Link>
        
        {!compact && (
          <p className="text-dark-300 text-sm mb-4 line-clamp-2 flex-grow">{description}</p>
        )}
        
        <div className="mt-auto space-y-2">
          <div className="flex items-center text-xs text-dark-400">
            <MapPin size={14} className="mr-1.5 flex-shrink-0" />
            <span className="truncate">
              {location.municipality}, {location.barangay}
              {location.purok ? `, ${location.purok}` : ''}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-dark-400">
            <div className="flex items-center">
              <Clock size={14} className="mr-1.5 flex-shrink-0" />
              <span>{formatDistanceToNow(new Date(created_at), { addSuffix: true })}</span>
            </div>
            
            <div className="flex items-center">
              <User size={14} className="mr-1.5 flex-shrink-0" />
              <span className="truncate">{reporter.full_name}</span>
            </div>
          </div>
          
          <div className="pt-1">
            <IncidentSeverityBadge severity={severity} />
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
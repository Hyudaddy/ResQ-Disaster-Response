import React from 'react';
import Badge from './Badge';
import { IncidentStatus } from '../../types/incident.types';

interface IncidentStatusBadgeProps {
  status: IncidentStatus;
  className?: string;
}

const IncidentStatusBadge: React.FC<IncidentStatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = (status: IncidentStatus) => {
    switch (status) {
      case 'reported':
        return { variant: 'primary', label: 'Reported' };
      case 'acknowledged':
        return { variant: 'info', label: 'Acknowledged' };
      case 'responding':
        return { variant: 'warning', label: 'Responding' };
      case 'resolved':
        return { variant: 'success', label: 'Resolved' };
      case 'closed':
        return { variant: 'default', label: 'Closed' };
      default:
        return { variant: 'default', label: 'Unknown' };
    }
  };

  const { variant, label } = getStatusConfig(status);

  return (
    <Badge 
      variant={variant as any} 
      dot 
      className={className}
    >
      {label}
    </Badge>
  );
};

export default IncidentStatusBadge;
import React from 'react';
import Badge from './Badge';
import { IncidentSeverity } from '../../types/incident.types';

interface IncidentSeverityBadgeProps {
  severity: IncidentSeverity;
  className?: string;
}

const IncidentSeverityBadge: React.FC<IncidentSeverityBadgeProps> = ({ severity, className = '' }) => {
  const getSeverityConfig = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'low':
        return { variant: 'info', label: 'Low' };
      case 'medium':
        return { variant: 'warning', label: 'Medium' };
      case 'high':
        return { variant: 'danger', label: 'High' };
      case 'critical':
        return { variant: 'danger', label: 'Critical' };
      default:
        return { variant: 'default', label: 'Unknown' };
    }
  };

  const { variant, label } = getSeverityConfig(severity);

  return (
    <Badge 
      variant={variant as any} 
      className={className}
    >
      {label}
    </Badge>
  );
};

export default IncidentSeverityBadge;
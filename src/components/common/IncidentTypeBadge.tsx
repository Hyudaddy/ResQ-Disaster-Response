import React from 'react';
import Badge from './Badge';
import { IncidentType } from '../../types/incident.types';
import { AlertTriangle, Flame, Droplet, Waves, Heart, Construction, HelpCircle } from 'lucide-react';

interface IncidentTypeBadgeProps {
  type: IncidentType;
  className?: string;
  showIcon?: boolean;
}

const IncidentTypeBadge: React.FC<IncidentTypeBadgeProps> = ({ 
  type, 
  className = '',
  showIcon = true
}) => {
  const getTypeConfig = (type: IncidentType) => {
    switch (type) {
      case 'fire':
        return { 
          variant: 'danger', 
          label: 'Fire',
          icon: <Flame size={14} />
        };
      case 'flood':
        return { 
          variant: 'info', 
          label: 'Flood',
          icon: <Droplet size={14} />
        };
      case 'earthquake':
        return { 
          variant: 'warning', 
          label: 'Earthquake',
          icon: <AlertTriangle size={14} />
        };
      case 'storm':
        return { 
          variant: 'info', 
          label: 'Storm',
          icon: <Waves size={14} />
        };
      case 'medical':
        return { 
          variant: 'primary', 
          label: 'Medical',
          icon: <Heart size={14} />
        };
      case 'infrastructure':
        return { 
          variant: 'warning', 
          label: 'Infrastructure',
          icon: <Construction size={14} />
        };
      case 'other':
        return { 
          variant: 'default', 
          label: 'Other',
          icon: <HelpCircle size={14} />
        };
      default:
        return { 
          variant: 'default', 
          label: 'Unknown',
          icon: <HelpCircle size={14} />
        };
    }
  };

  const { variant, label, icon } = getTypeConfig(type);

  return (
    <Badge 
      variant={variant as any} 
      className={className}
    >
      {showIcon && <span className="mr-1">{icon}</span>}
      {label}
    </Badge>
  );
};

export default IncidentTypeBadge;
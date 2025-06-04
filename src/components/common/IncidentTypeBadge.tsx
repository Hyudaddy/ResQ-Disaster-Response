import React from 'react';
import Badge from './Badge';
import { IncidentType } from '../../types/incident.types';
import { AlertTriangle, Flame, Droplet, Waves, Wind, Heart, Construction, HelpCircle } from 'lucide-react';

interface IncidentTypeBadgeProps {
  type: IncidentType | { name: IncidentType };
  className?: string;
  showIcon?: boolean;
}

const IncidentTypeBadge: React.FC<IncidentTypeBadgeProps> = ({ 
  type, 
  className = '',
  showIcon = true
}) => {
  const typeName = typeof type === 'string' ? type : type.name;

  const getTypeInfo = () => {
    switch (typeName) {
      case 'fire':
        return {
          label: 'Fire',
          icon: Flame,
          color: 'bg-danger-500/20 text-danger-500 border-danger-500/30'
        };
      case 'flood':
        return {
          label: 'Flood',
          icon: Droplet,
          color: 'bg-info-500/20 text-info-500 border-info-500/30'
        };
      case 'earthquake':
        return {
          label: 'Earthquake',
          icon: Waves,
          color: 'bg-warning-500/20 text-warning-500 border-warning-500/30'
        };
      case 'storm':
        return {
          label: 'Storm',
          icon: Wind,
          color: 'bg-info-500/20 text-info-500 border-info-500/30'
        };
      case 'medical':
        return {
          label: 'Medical',
          icon: Heart,
          color: 'bg-primary-500/20 text-primary-500 border-primary-500/30'
        };
      case 'infrastructure':
        return {
          label: 'Infrastructure',
          icon: Construction,
          color: 'bg-warning-500/20 text-warning-500 border-warning-500/30'
        };
      case 'other':
        return {
          label: 'Other',
          icon: HelpCircle,
          color: 'bg-dark-700 text-dark-300 border-dark-600'
        };
      default:
        return {
          label: 'Unknown',
          icon: AlertTriangle,
          color: 'bg-dark-700 text-dark-300 border-dark-600'
        };
    }
  };

  const { label, icon: Icon, color } = getTypeInfo();

  return (
    <Badge className={`${color} ${className}`}>
      {showIcon && <Icon size={14} className="mr-1" />}
      {label}
    </Badge>
  );
};

export default IncidentTypeBadge;
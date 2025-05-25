import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  dot?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const variants = {
    default: 'bg-dark-600 text-dark-200',
    primary: 'bg-primary-500/20 text-primary-400',
    success: 'bg-success-500/20 text-success-500',
    warning: 'bg-warning-500/20 text-warning-500',
    danger: 'bg-danger-500/20 text-danger-500',
    info: 'bg-info-500/20 text-info-500',
  };

  const sizes = {
    sm: 'text-xs py-0.5 px-2',
    md: 'text-sm py-1 px-2.5',
    lg: 'text-base py-1 px-3',
  };

  const baseClasses = 'font-medium rounded-full inline-flex items-center justify-center';
  const variantClasses = variants[variant];
  const sizeClasses = sizes[size];

  return (
    <span className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}>
      {dot && (
        <span className={`w-2 h-2 rounded-full mr-1.5 inline-block ${variant === 'default' ? 'bg-dark-200' : `bg-${variant === 'primary' ? 'primary' : variant}-500`}`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
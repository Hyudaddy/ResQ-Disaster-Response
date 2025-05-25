import React, { ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  footer?: ReactNode;
  headerAction?: ReactNode;
  noPadding?: boolean;
  bordered?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  titleClassName = '',
  contentClassName = '',
  footer,
  headerAction,
  noPadding = false,
  bordered = false,
}) => {
  const { theme } = useTheme();
  const cardClasses = `bg-white dark:bg-dark-800 rounded-lg shadow-lg ${
    bordered ? 'border border-light-200 dark:border-dark-700' : ''
  } ${className}`;
  const headerClasses = 'flex items-center justify-between mb-4';
  const titleClasses = `text-lg font-semibold text-light-900 dark:text-white ${titleClassName}`;
  const contentClasses = `${noPadding ? '' : 'px-5 py-4'} ${contentClassName}`;
  const footerClasses = 'mt-4 pt-4 border-t border-light-200 dark:border-dark-700';

  return (
    <div className={cardClasses}>
      {(title || headerAction) && (
        <div className={`${noPadding ? '' : 'px-5 pt-4'} ${headerClasses}`}>
          {title && <h3 className={titleClasses}>{title}</h3>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={contentClasses}>{children}</div>
      {footer && <div className={`${noPadding ? '' : 'px-5 pb-4'} ${footerClasses}`}>{footer}</div>}
    </div>
  );
};

export default Card;
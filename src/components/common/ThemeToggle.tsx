import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Button from './Button';

interface ThemeToggleProps {
  variant?: 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'ghost',
  size = 'md',
  className = '',
  showText = true,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={className}
      leftIcon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    >
      {showText && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
    </Button>
  );
};

export default ThemeToggle;
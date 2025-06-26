import React, { ReactNode } from 'react';

interface LiquidGlassProps {
  children: ReactNode;
  className?: string;
  variant?: 'card' | 'button' | 'input' | 'modal' | 'sidebar' | 'header' | 'default';
  onClick?: () => void;
  disabled?: boolean;
}

const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
  disabled = false,
}) => {
  const baseClasses = 'liquid-glass';
  const variantClasses = {
    card: 'liquid-card',
    button: 'liquid-button',
    input: 'liquid-input',
    modal: 'liquid-modal',
    sidebar: 'liquid-sidebar',
    header: 'liquid-header',
    default: '',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  if (variant === 'button') {
    return (
      <button
        className={classes}
        onClick={onClick}
        disabled={disabled}
        type="button"
      >
        <div className="liquid-glass-content">
          {children}
        </div>
      </button>
    );
  }

  return (
    <div className={classes} onClick={onClick}>
      <div className="liquid-glass-content">
        {children}
      </div>
    </div>
  );
};

export default LiquidGlass; 
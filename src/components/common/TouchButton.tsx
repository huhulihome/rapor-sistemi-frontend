import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { hapticFeedback } from '../../utils/mobile';

interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  haptic?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy';
}

export const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      haptic = true,
      hapticType = 'light',
      className = '',
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'font-medium rounded-lg transition-all duration-200 active:scale-95 touch-manipulation';
    
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-400',
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-4 py-2.5 text-base min-h-[44px]',
      lg: 'px-6 py-3 text-lg min-h-[52px]',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (haptic && !disabled) {
        hapticFeedback(hapticType);
      }
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className} disabled:cursor-not-allowed disabled:opacity-50`}
        onClick={handleClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TouchButton.displayName = 'TouchButton';

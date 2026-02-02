import type { ReactNode } from 'react';
import { classNames } from '../../utils/classNames';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  gradient?: boolean;
}

export const Card = ({
  children,
  title,
  subtitle,
  footer,
  className,
  padding = 'md',
  hoverable = false,
  gradient = false
}: CardProps) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div
      className={classNames(
        'rounded-2xl',
        gradient
          ? 'glass-card'
          : 'bg-slate-800/50 backdrop-blur-sm border border-white/5',
        hoverable && 'card-hover cursor-pointer',
        className
      )}
    >
      {(title || subtitle) && (
        <div className={classNames(
          'border-b border-white/5',
          paddingClasses[padding]
        )}>
          {title && (
            <h3 className="text-lg font-semibold text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className={paddingClasses[padding]}>
        {children}
      </div>

      {footer && (
        <div className={classNames(
          'border-t border-white/5 bg-white/[0.02]',
          paddingClasses[padding]
        )}>
          {footer}
        </div>
      )}
    </div>
  );
};

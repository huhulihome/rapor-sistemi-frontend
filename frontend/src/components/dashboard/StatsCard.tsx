import type { ReactNode } from 'react';
import { classNames } from '../../utils/classNames';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan';
}

export const StatsCard = ({ title, value, icon, trend, color = 'blue' }: StatsCardProps) => {
  const gradientClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    yellow: 'from-amber-500 to-orange-500',
    red: 'from-red-500 to-pink-500',
    purple: 'from-purple-500 to-violet-600',
    cyan: 'from-cyan-500 to-blue-500'
  };

  const glowClasses = {
    blue: 'shadow-blue-500/20',
    green: 'shadow-emerald-500/20',
    yellow: 'shadow-amber-500/20',
    red: 'shadow-red-500/20',
    purple: 'shadow-purple-500/20',
    cyan: 'shadow-cyan-500/20'
  };

  const trendBgClasses = {
    positive: 'bg-emerald-500/10 text-emerald-400',
    negative: 'bg-red-500/10 text-red-400'
  };

  return (
    <div className="stat-card p-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>

          {trend && (
            <div className="flex items-center mt-3">
              <span
                className={classNames(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  trend.isPositive ? trendBgClasses.positive : trendBgClasses.negative
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-slate-500 ml-2">son aydan</span>
            </div>
          )}
        </div>

        {icon && (
          <div className={classNames(
            'flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br shadow-lg',
            gradientClasses[color],
            glowClasses[color]
          )}>
            <div className="text-white w-6 h-6 [&>svg]:w-6 [&>svg]:h-6 [&>svg]:block">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

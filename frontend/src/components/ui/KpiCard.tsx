import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type KpiVariant = 'critical' | 'warning' | 'info' | 'success' | 'neutral';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: KpiVariant;
  trend?: number;
  subtitle?: string;
  className?: string;
}

const accentStyles: Record<KpiVariant, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-sky-500',
  success: 'bg-emerald-500',
  neutral: 'bg-slate-500',
};

const iconBgStyles: Record<KpiVariant, string> = {
  critical: 'bg-red-50 text-red-600',
  warning: 'bg-amber-50 text-amber-600',
  info: 'bg-sky-50 text-sky-600',
  success: 'bg-emerald-50 text-emerald-600',
  neutral: 'bg-slate-50 text-slate-600',
};

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon: Icon,
  variant = 'neutral',
  trend,
  subtitle,
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 ${className}`}
    >
      <div className={`absolute left-0 top-0 h-full w-1.5 ${accentStyles[variant]}`} />
      <div className="p-5 pl-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
            {trend !== undefined && (
              <div className="mt-2 flex items-center gap-1">
                {trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                ) : trend < 0 ? (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                ) : (
                  <Minus className="w-4 h-4 text-slate-400" />
                )}
                <span
                  className={`text-xs font-semibold ${
                    trend > 0
                      ? 'text-emerald-600'
                      : trend < 0
                      ? 'text-red-600'
                      : 'text-slate-500'
                  }`}
                >
                  {trend > 0 ? '+' : ''}
                  {trend}%
                </span>
              </div>
            )}
            {subtitle && (
              <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
          <div className={`ml-4 flex-shrink-0 rounded-xl p-3 ${iconBgStyles[variant]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KpiCard;

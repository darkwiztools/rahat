import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
  subLabel?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  colorClass,
  subLabel,
  className = '',
}) => {
  return (
    <div
      className={`rounded-xl bg-white shadow-sm ring-1 ring-slate-200 p-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl ${colorClass}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">
            {label}
          </p>
          <p className="mt-0.5 text-2xl font-bold text-slate-900 leading-tight">
            {value}
          </p>
          {subLabel && (
            <p className="mt-0.5 text-xs text-slate-400 truncate">{subLabel}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;

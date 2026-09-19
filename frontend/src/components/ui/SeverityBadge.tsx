import React from 'react';
import { AlertOctagon, AlertTriangle, Info, ShieldCheck } from 'lucide-react';
import type { Severity } from '../../types/rahat';

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

const severityConfig: Record<
  Severity,
  { label: string; className: string; icon: React.FC<{ className?: string }> }
> = {
  CRITICAL: {
    label: 'Critical',
    className: 'bg-red-600 text-white',
    icon: AlertOctagon,
  },
  HIGH: {
    label: 'High',
    className: 'bg-amber-500 text-white',
    icon: AlertTriangle,
  },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-sky-500 text-white',
    icon: Info,
  },
  LOW: {
    label: 'Low',
    className: 'bg-slate-500 text-white',
    icon: ShieldCheck,
  },
};

const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '' }) => {
  const cfg = severityConfig[severity];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${cfg.className} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
};

export default SeverityBadge;

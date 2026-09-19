import React from 'react';
import {
  FilePlus,
  Search,
  UserCheck,
  Loader2,
  MapPin,
  PackageCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { RequestStatus } from '../../types/rahat';

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

const statusConfig: Record<
  RequestStatus,
  { label: string; className: string; icon: React.FC<{ className?: string }> }
> = {
  NEW: {
    label: 'New',
    className: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200',
    icon: FilePlus,
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    className: 'bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-200',
    icon: Search,
  },
  ASSIGNED: {
    label: 'Assigned',
    className: 'bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-200',
    icon: UserCheck,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200',
    icon: Loader2,
  },
  REACHED: {
    label: 'Reached',
    className: 'bg-violet-100 text-violet-700 ring-1 ring-inset ring-violet-200',
    icon: MapPin,
  },
  DELIVERED: {
    label: 'Delivered',
    className: 'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200',
    icon: PackageCheck,
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-200',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200',
    icon: XCircle,
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.className} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;

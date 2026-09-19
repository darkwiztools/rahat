import React from 'react';
import {
  FilePlus,
  Search,
  UserCheck,
  Loader2,
  PackageCheck,
  CheckCircle2,
  XCircle,
  Circle,
  Clock,
} from 'lucide-react';
import type { RequestStatus, TimelineEntry } from '../../types/rahat';

interface RequestTimelineProps {
  timeline: TimelineEntry[];
  currentStatus: RequestStatus;
  className?: string;
}

const STATUS_ORDER: RequestStatus[] = [
  'NEW',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'DELIVERED',
  'RESOLVED',
];

const STEP_LABELS: Record<RequestStatus, string> = {
  NEW: 'REQUEST RECEIVED',
  UNDER_REVIEW: 'UNDER REVIEW',
  ASSIGNED: 'VOLUNTEER ASSIGNED',
  IN_PROGRESS: 'IN PROGRESS',
  REACHED: 'IN PROGRESS',
  DELIVERED: 'ASSISTANCE DELIVERED',
  RESOLVED: 'RESOLVED',
  CANCELLED: 'CANCELLED',
};

const STEP_ICONS: Record<RequestStatus, React.FC<{ className?: string }>> = {
  NEW: FilePlus,
  UNDER_REVIEW: Search,
  ASSIGNED: UserCheck,
  IN_PROGRESS: Loader2,
  REACHED: Loader2,
  DELIVERED: PackageCheck,
  RESOLVED: CheckCircle2,
  CANCELLED: XCircle,
};

const STEP_COLORS: Record<RequestStatus, string> = {
  NEW: 'bg-slate-500 text-white border-slate-500',
  UNDER_REVIEW: 'bg-sky-500 text-white border-sky-500',
  ASSIGNED: 'bg-indigo-500 text-white border-indigo-500',
  IN_PROGRESS: 'bg-amber-500 text-white border-amber-500',
  REACHED: 'bg-violet-500 text-white border-violet-500',
  DELIVERED: 'bg-emerald-500 text-white border-emerald-500',
  RESOLVED: 'bg-green-500 text-white border-green-500',
  CANCELLED: 'bg-red-500 text-white border-red-500',
};

const RequestTimeline: React.FC<RequestTimelineProps> = ({
  timeline,
  currentStatus,
  className = '',
}) => {
  if (currentStatus === 'CANCELLED') {
    const cancelledEntry = timeline.find((t) => t.status === 'CANCELLED');
    return (
      <div className={`rounded-xl bg-red-50 border border-red-200 p-5 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 rounded-full bg-red-500 p-2">
            <XCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-bold text-red-800">Request Cancelled</h4>
            {cancelledEntry?.timestamp && (
              <div className="mt-1 flex items-center gap-1.5 text-sm text-red-600">
                <Clock className="w-4 h-4" />
                {new Date(cancelledEntry.timestamp).toLocaleString()}
              </div>
            )}
            {cancelledEntry?.note && (
              <p className="mt-2 text-sm text-red-700">{cancelledEntry.note}</p>
            )}
            {cancelledEntry?.actor && (
              <p className="mt-1 text-xs text-red-600">By: {cancelledEntry.actor}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(
    STATUS_ORDER.includes(currentStatus) ? currentStatus : 'NEW'
  );

  return (
    <ol className={`relative space-y-6 ${className}`}>
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />

      {STATUS_ORDER.map((status, idx) => {
        const entry = timeline.find((t) => t.status === status);
        const isCompleted = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isPending = idx > currentIndex;
        const StepIcon = STEP_ICONS[status];

        let iconClass = 'bg-slate-200 text-slate-400 border-slate-200';
        if (isCompleted || isCurrent) {
          iconClass = STEP_COLORS[status];
        }

        return (
          <li key={status} className="relative flex items-start gap-4 pl-1">
            <div
              className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${iconClass} ${
                isCurrent ? 'ring-4 ring-offset-2 ring-slate-100' : ''
              }`}
            >
              {isPending ? (
                <Circle className="w-4 h-4" />
              ) : (
                <StepIcon className={`w-4 h-4 ${isCurrent ? 'animate-pulse' : ''}`} />
              )}
            </div>
            <div className={`flex-1 min-w-0 pt-1.5 ${isPending ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-slate-900">{STEP_LABELS[status]}</h4>
                {isCurrent && (
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                    CURRENT
                  </span>
                )}
                {isCompleted && !isCurrent && (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                    DONE
                  </span>
                )}
              </div>
              {entry ? (
                <div className="mt-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                  {entry.note && (
                    <p className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                      {entry.note}
                    </p>
                  )}
                  {entry.actor && (
                    <p className="mt-1 text-xs text-slate-500">— {entry.actor}</p>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-xs text-slate-400 italic">Awaiting next step…</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default RequestTimeline;

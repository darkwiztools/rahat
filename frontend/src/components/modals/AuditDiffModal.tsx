import React from 'react';
import Modal from '../ui/Modal';
import { ClipboardList, ArrowRight } from 'lucide-react';
import type { AuditLogEntry } from '../../types/rahat';

interface AuditDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: AuditLogEntry | null;
}

function prettyJson(value: any, emptyLabel = '(empty)'): React.ReactNode {
  if (value === undefined || value === null || value === '') {
    return <span className="text-slate-400 italic">{emptyLabel}</span>;
  }
  try {
    const str = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    return (
      <pre className="text-[11px] leading-relaxed font-mono whitespace-pre bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto">
        {str}
      </pre>
    );
  } catch {
    return <span>{String(value)}</span>;
  }
}

const AuditDiffModal: React.FC<AuditDiffModalProps> = ({ isOpen, onClose, entry }) => {
  const footer = (
    <button
      type="button"
      onClick={onClose}
      className="px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Close
    </button>
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          <div>
            <div>Audit Log — Change Details</div>
            <div className="text-xs font-normal text-slate-500 mt-0.5">
              {entry ? `${entry.action} • ${entry.entityType} ${entry.entityId} • by ${entry.actor}` : 'Select an entry'}
            </div>
          </div>
        </div>
      }
      footer={footer}
    >
      {!entry ? (
        <div className="py-10 text-center text-sm text-slate-500">No entry selected.</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-slate-500 font-semibold uppercase tracking-wide">Timestamp</div>
              <div className="mt-1 text-slate-900 text-sm font-medium">{new Date(entry.timestamp).toLocaleString()}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-slate-500 font-semibold uppercase tracking-wide">Actor</div>
              <div className="mt-1 text-slate-900 text-sm font-medium truncate">{entry.actor}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-slate-500 font-semibold uppercase tracking-wide">Action</div>
              <div className="mt-1 text-blue-700 text-sm font-semibold">{entry.action}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-slate-500 font-semibold uppercase tracking-wide">Entity</div>
              <div className="mt-1 text-slate-900 text-sm font-medium">{entry.entityType} · {entry.entityId}</div>
            </div>
          </div>
          {entry.note && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-900">
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-1">Note</div>
              {entry.note}
            </div>
          )}
          {(entry.beforeSnapshot || entry.afterSnapshot) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 px-1">
                Before <ArrowRight className="w-3.5 h-3.5" /> After
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Before</div>
                  {prettyJson(entry.beforeSnapshot)}
                </div>
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">After</div>
                  {prettyJson(entry.afterSnapshot)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default AuditDiffModal;

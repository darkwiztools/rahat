import React, { useMemo, useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Package, Minus, Plus, AlertCircle, CheckCircle2, XCircle, Check, AlertTriangle } from 'lucide-react';
import { useRahatStore, useCurrentUser, getInventoryStatus } from '../../store/useRahatStore';
import InventoryStatusBadge from '../ui/InventoryStatusBadge';
import type { ResourceInventory } from '../../types/rahat';

interface AllocateResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string | null;
}

interface AllocationRowState {
  resourceId: string;
  quantity: number;
}

const AllocateResourcesModal: React.FC<AllocateResourcesModalProps> = ({ isOpen, onClose, requestId }) => {
  const requests = useRahatStore((s) => s.requests);
  const resources = useRahatStore((s) => s.resources);
  const allocate = useRahatStore((s) => s.allocateResourcesToRequest);
  const currentUser = useCurrentUser();
  const [rows, setRows] = useState<AllocationRowState[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const request = useMemo(
    () => (requestId ? requests.find((r) => r.id === requestId) || null : null),
    [requests, requestId]
  );

  useEffect(() => {
    if (isOpen && resources.length > 0 && rows.length === 0) {
      setRows(resources.map((r) => ({ resourceId: r.id, quantity: 0 })));
    }
    if (!isOpen) {
      setRows([]);
      setError('');
      setSubmitting(false);
      setToast(null);
    }
  }, [isOpen, resources]);

  const resourceMap = useMemo(() => {
    const m = new Map<string, ResourceInventory>();
    resources.forEach((r) => m.set(r.id, r));
    return m;
  }, [resources]);

  const totalQty = rows.reduce((s, r) => s + r.quantity, 0);

  const setQty = (resourceId: string, qty: number) => {
    const max = resourceMap.get(resourceId)?.quantity ?? 0;
    const v = Math.max(0, Math.min(max, Math.floor(qty || 0)));
    setRows((rs) => rs.map((r) => (r.resourceId === resourceId ? { ...r, quantity: v } : r)));
  };

  const getInlineError = (resourceId: string): string => {
    const row = rows.find((r) => r.resourceId === resourceId);
    if (!row) return '';
    const max = resourceMap.get(resourceId)?.quantity ?? 0;
    if (row.quantity > max) return `Only ${max} available`;
    return '';
  };

  const hasAnyValidationError = rows.some((r) => {
    const max = resourceMap.get(r.resourceId)?.quantity ?? 0;
    return r.quantity > max;
  });

  const handleConfirm = () => {
    if (!request || !currentUser) return;
    const items = rows.filter((r) => r.quantity > 0);
    if (items.length === 0) {
      setError('Select at least one resource with a quantity greater than 0.');
      return;
    }
    if (hasAnyValidationError) {
      setError('One or more quantities exceed available stock.');
      return;
    }
    setSubmitting(true);
    setError('');
    const ctx = { actorId: currentUser.id, actorName: currentUser.name, role: currentUser.role };
    const result = allocate(request.id, items, ctx);
    setSubmitting(false);
    if (result.ok) {
      const summary = items.map((i) => {
        const r = resourceMap.get(i.resourceId);
        return `${i.quantity} ${r?.unit || ''} ${r?.name || i.resourceId}`;
      }).join(', ');
      setToast({ type: 'success', msg: `Allocated: ${summary}` });
      setTimeout(() => {
        setToast(null);
        onClose();
      }, 1200);
    } else {
      setError(result.error || 'Allocation failed');
    }
  };

  const footer = (
    <>
      <div className="flex-1 mr-2 min-h-0">
        {error ? (
          <div className="text-xs text-red-700 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" /> {error}
          </div>
        ) : totalQty > 0 ? (
          <div className="text-xs text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> {rows.filter((r) => r.quantity > 0).length} items selected, {totalQty} units total
          </div>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        disabled={submitting || !!toast}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={totalQty === 0 || submitting || hasAnyValidationError || !!toast}
        className="px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center gap-1.5"
      >
        <Package className="w-4 h-4" />
        Submit Allocation
      </button>
    </>
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          <div>
            <div>Allocate Resources</div>
            <div className="text-xs font-normal text-slate-500 mt-0.5">
              {request ? `${request.id} — needed: ${request.requiredResources.join(', ')}` : 'No request selected'}
            </div>
          </div>
        </div>
      }
      footer={footer}
    >
      <div className="space-y-3 relative">
        {toast && (
          <div className={`fixed top-6 right-6 z-[70] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium animate-fade-in ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}>
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.msg}
          </div>
        )}
        {!request ? (
          <div className="py-8 text-center text-sm text-slate-500">Request not found.</div>
        ) : resources.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">No resources in inventory.</div>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
            {resources.map((r) => {
              const row = rows.find((x) => x.resourceId === r.id);
              const qty = row?.quantity ?? 0;
              const status = getInventoryStatus(r);
              const inlineErr = getInlineError(r.id);
              return (
                <div
                  key={r.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 transition-colors ${
                    inlineErr ? 'bg-red-50/50' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold text-slate-900 truncate">{r.name}</div>
                      <InventoryStatusBadge status={status} size="sm" />
                      {inlineErr && (
                        <span className="text-[11px] font-semibold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {inlineErr}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="inline-flex items-center gap-1"><Package className="w-3 h-3" /> {r.category}</span>
                      <span>•</span>
                      <span>
                        <span className={`font-semibold ${
                          status === 'Out of Stock'
                            ? 'text-red-600'
                            : status === 'Low'
                            ? 'text-amber-600'
                            : 'text-slate-700'
                        }`}>
                          {r.quantity} {r.unit}
                        </span> available
                      </span>
                      <span>•</span>
                      <span className="truncate">{r.storageLocation}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 sm:ml-0 ml-auto">
                    <button
                      type="button"
                      onClick={() => setQty(r.id, qty - 1)}
                      disabled={qty <= 0 || r.quantity <= 0}
                      className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label={`Decrease ${r.name}`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      value={qty}
                      min={0}
                      max={r.quantity}
                      onChange={(e) => setQty(r.id, parseInt(e.target.value || '0', 10))}
                      className={`w-16 text-center text-sm font-semibold border rounded-lg py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        inlineErr
                          ? 'border-red-400 bg-red-50 text-red-700'
                          : 'border-slate-200 text-slate-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setQty(r.id, qty + 1)}
                      disabled={qty >= r.quantity || r.quantity <= 0}
                      className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label={`Increase ${r.name}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-blue-800 leading-relaxed">
            Quantities are validated against current stock. On submit, inventory is decremented, statuses are recomputed (Low / Out of Stock), and an audit log entry is created.
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AllocateResourcesModal;

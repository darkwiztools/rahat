import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import Modal from './Modal';

export type ConfirmDialogVariant = 'danger' | 'primary';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: ConfirmDialogVariant;
  confirmDisabled?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'primary',
  confirmDisabled = false,
}) => {
  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const handleConfirm = () => {
    if (!confirmDisabled) {
      onConfirm();
    }
  };

  const defaults = {
    danger: {
      confirmText: 'Confirm',
      confirmClass: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm shadow-red-600/20',
      icon: AlertTriangle,
      iconClass: 'bg-red-100 text-red-600',
    },
    primary: {
      confirmText: 'OK',
      confirmClass: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm shadow-indigo-600/20',
      icon: variant === 'primary' && title.toLowerCase().includes('success') ? CheckCircle2 : Info,
      iconClass: 'bg-indigo-100 text-indigo-600',
    },
  };

  const cfg = defaults[variant];
  const finalConfirmText = confirmText || cfg.confirmText;
  const Icon = cfg.icon;

  const footer = (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3 w-full gap-2">
      <button
        type="button"
        onClick={handleCancel}
        className="inline-flex justify-center items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors"
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={confirmDisabled}
        className={`inline-flex justify-center items-center rounded-lg px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${cfg.confirmClass}`}
      >
        {finalConfirmText}
      </button>
    </div>
  );

  return (
    <Modal open={isOpen} onClose={onClose} title={title} footer={footer} size="md">
      <div className="flex gap-4">
        <div className={`flex-shrink-0 rounded-full p-2.5 ${cfg.iconClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

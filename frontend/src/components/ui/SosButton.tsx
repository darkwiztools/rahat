import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

interface SosButtonProps {
  onConfirm: () => void;
  className?: string;
}

const SosButton: React.FC<SosButtonProps> = ({ onConfirm, className = '' }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClick = () => {
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    setDialogOpen(false);
    onConfirm();
  };

  const handleCancel = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`group relative flex items-center justify-center gap-3 rounded-2xl bg-red-600 px-10 py-6 text-white shadow-lg shadow-red-600/30 transition-all hover:bg-red-700 hover:shadow-red-700/40 active:scale-95 ${className}`}
      >
        <span className="absolute inset-0 rounded-2xl bg-red-500 animate-ping opacity-40" />
        <AlertTriangle className="relative w-10 h-10 animate-pulse" />
        <span className="relative text-3xl font-black tracking-widest">SOS</span>
      </button>

      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={handleCancel}
        title="Emergency SOS Alert"
        message="RAHAT is a coordination prototype and does not replace official emergency services. Please also contact your local emergency number immediately. Confirm to send SOS alert to the coordination team."
        confirmText="Send SOS"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};

export default SosButton;

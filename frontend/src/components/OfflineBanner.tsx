import React from 'react';
import { WifiOff, X } from 'lucide-react';
import { useRahatStore } from '../store/useRahatStore';

const OfflineBanner: React.FC = () => {
  const backendOnline = useRahatStore((s) => s.backendOnline);
  const offlineBannerDismissed = useRahatStore((s) => s.offlineBannerDismissed);
  const dismissOfflineBanner = useRahatStore((s) => s.dismissOfflineBanner);

  const showBanner = !backendOnline && !offlineBannerDismissed;

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <WifiOff className="w-5 h-5 flex-shrink-0 text-amber-900" />
          <p className="text-sm font-medium">
            Running in offline demo mode
          </p>
        </div>
        <button
          type="button"
          onClick={dismissOfflineBanner}
          className="ml-4 flex-shrink-0 p-1 rounded-md text-amber-900 hover:text-amber-950 hover:bg-amber-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-700"
          aria-label="Dismiss offline notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default OfflineBanner;

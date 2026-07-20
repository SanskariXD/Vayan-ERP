'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[100] bg-amber-400 text-amber-950 px-4 py-2 flex items-center justify-center gap-3 font-semibold text-sm shadow-md">
      <WifiOff size={16} className="animate-pulse" />
      <span>Offline Mode Active. Tracking production locally. Will sync to cluster when connection restores.</span>
    </div>
  );
}

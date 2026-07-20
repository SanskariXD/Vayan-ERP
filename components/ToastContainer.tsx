'use client';

import { useSimulationStore } from '@/lib/store';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function ToastContainer() {
  const toasts = useSimulationStore((s: any) => s.toasts) || [];

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((toast: any) => (
        <div 
          key={toast.id} 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-slide-up-delay-1
            ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
              toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 
              'bg-blue-50 border-blue-200 text-blue-800'}`}
        >
          {toast.type === 'success' && <CheckCircle2 className="text-emerald-600" size={18} />}
          {toast.type === 'error' && <AlertCircle className="text-rose-600" size={18} />}
          {toast.type === 'info' && <Info className="text-blue-600" size={18} />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

'use client';

import { useCoopStore } from '@/lib/store';
import { PlusCircle, RotateCcw, AlertTriangle } from 'lucide-react';

interface LoomIncrementerProps {
  onCycleWarpTrigger: (loomId: string) => void;
}

export function LoomIncrementer({ onCycleWarpTrigger }: LoomIncrementerProps) {
  const looms = useCoopStore((s) => s.looms);
  const incrementSareeCount = useCoopStore((s) => s.incrementSareeCount);
  const getDesignById = useCoopStore((s) => s.getDesignById);

  // Filter only active looms or looms waiting for a warp cycle
  const activeLooms = looms.filter((l: any) => l.status === 'WEAVING' || l.sareesCompleted === 12);

  if (activeLooms.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-100 flex items-center justify-center text-stone-400 font-medium">
         <AlertTriangle className="w-5 h-5 mr-2 opacity-50" /> No looms currently weaving. 
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {activeLooms.map((loom: any) => {
        const design = loom.currentDesignId ? getDesignById(loom.currentDesignId) : null;
        const isCompleted = loom.sareesCompleted === 12;

        return (
          <div 
            key={loom.id} 
            className={`bg-white p-6 rounded-xl border transition-colors ${isCompleted ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'}`}
          >
            <div className="flex justify-between items-start mb-4">
               <div>
                  <div className="text-xs font-mono font-semibold text-stone-400 mb-1">{loom.id}</div>
                  <h3 className="text-sm font-semibold text-slate-800">{loom.weaverName}</h3>
               </div>
               <div className="text-right">
                  <div className={`text-2xl font-light ${isCompleted ? 'text-amber-600' : 'text-slate-800'}`}>
                    {loom.sareesCompleted} <span className="text-sm text-stone-400">/ 12</span>
                  </div>
               </div>
            </div>

            <div className="text-xs font-medium text-stone-500 mb-6 truncate" title={design?.name}>
              {design ? design.name : 'Unknown Design'}
            </div>

            {/* Quick Action Button */}
            {!isCompleted ? (
              <button
                onClick={() => incrementSareeCount(loom.id)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#F9F6F0] hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" /> +1 Saree Completed
              </button>
            ) : (
              <button
                onClick={() => onCycleWarpTrigger(loom.id)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                <RotateCcw className="w-4 h-4" /> Cycle Warp
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

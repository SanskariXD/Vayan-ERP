'use client';

import { useState } from 'react';
import { useCoopStore } from '@/lib/store';
import { X, ArrowRight, Settings2, Scissors } from 'lucide-react';

interface WarpTransitionModalProps {
  loomId: string;
  onClose: () => void;
}

export function WarpTransitionModal({ loomId, onClose }: WarpTransitionModalProps) {
  const looms = useCoopStore((s) => s.looms);
  const transitionWarp = useCoopStore((s) => s.transitionWarp);
  const designs = useCoopStore((s) => s.designs);

  const loom = looms.find((l: any) => l.id === loomId);
  
  const [mode, setMode] = useState<'SELECTION' | 'NEW_DESIGN'>('SELECTION');
  const [selectedNewDesign, setSelectedNewDesign] = useState<string>('');

  if (!loom) return null;

  const handleKeepDesign = () => {
    transitionWarp(loom.id, true);
    onClose();
  };

  const handleSwitchDesign = () => {
    if (mode === 'SELECTION') {
      setMode('NEW_DESIGN');
    } else {
       if (!selectedNewDesign) return alert('Select a new design.');
       transitionWarp(loom.id, false, selectedNewDesign);
       onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
           <div>
             <h2 className="text-xl font-semibold text-slate-800">Warp Transition</h2>
             <p className="text-sm text-stone-500 font-mono mt-0.5">{loom.id} · {loom.weaverName}</p>
           </div>
           <button onClick={onClose} className="p-2 text-stone-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
              <X className="w-5 h-5" />
           </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {mode === 'SELECTION' ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-700 mb-6 font-medium">
                The 12-saree warp is complete. How would you like to proceed for the next batch?
              </p>

              {/* Option 1 */}
              <button 
                onClick={handleKeepDesign}
                className="w-full flex items-start gap-4 p-5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-left group"
              >
                 <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 mt-1 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <ArrowRight className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Keep Current Design</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Mainains existing jacquard cards. Subjects loom to standard <span className="font-semibold text-amber-600">1-day setup penalty</span> for threading and maintenance.
                    </p>
                 </div>
              </button>

              {/* Option 2 */}
              <button 
                onClick={handleSwitchDesign}
                className="w-full flex items-start gap-4 p-5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all text-left group"
              >
                 <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 mt-1 shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <Settings2 className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Mount New Design</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Remove configuration. Subjects loom to <span className="font-semibold text-rose-600">15-day card punching & lacing penalty</span>.
                    </p>
                 </div>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
               <p className="text-sm text-slate-700 font-medium">
                  Select the new technical blueprint to assign to {loom.id}.
               </p>

               <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                 {designs.map((d: any) => (
                   <div 
                     key={d.id}
                     onClick={() => setSelectedNewDesign(d.id)}
                     className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${selectedNewDesign === d.id ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}
                   >
                     <div>
                       <div className="font-medium text-sm text-slate-800">{d.name}</div>
                       <div className="text-xs text-stone-500 mt-0.5">{d.region} · L{d.complexityLevel} Complexity</div>
                     </div>
                     {selectedNewDesign === d.id && <Scissors className="w-4 h-4 text-indigo-600 shrink-0" />}
                   </div>
                 ))}
               </div>

               <div className="flex justify-between gap-3 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setMode('SELECTION')}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors w-full"
                  >
                     Back
                  </button>
                  <button 
                    onClick={handleSwitchDesign}
                    disabled={!selectedNewDesign}
                    className="px-4 py-2 text-sm font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors w-full"
                  >
                     Confirm 15-Day Setup
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

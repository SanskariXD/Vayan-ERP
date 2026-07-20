'use client';

import { useEffect, useState } from 'react';
import { useSimulationStore, useArtisanStore } from '@/lib/store';
import { 
  Package, Wrench, Play, Pause, CheckCircle2, AlertTriangle, 
  Clock, Check, ArrowRight, Layers, User, Activity, Feather, Sparkles
} from 'lucide-react';

export default function IndividualWorkspacePage() {
  const { state, isLoaded, initialize, updateLoomState, triggerManualEvent, incrementSareeCount } = useSimulationStore();
  const artisanState = useArtisanStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isLoaded || !state || !artisanState) return null;

  const { currentLoom } = artisanState;
  const design = state.designs.find((d: any) => d.id === currentLoom.currentDesignId) || state.designs[0];
  const weaver = state.weavers.find((w: any) => w.id === 'weaver-01') || { name: 'Kamesh (You)' };

  // Current order tied to this design/loom
  const order = state.orders.find((o: any) => o.designId === design?.id) || {
    id: 'ORD-1042',
    customerName: 'Kanchipuram Silk Emporium',
    expectedDeliveryDate: '2026-08-25'
  };

  const nextDesign = state.designs.find((d: any) => d.id !== design?.id) || state.designs[1];

  const handleAction = async (msg: string, actionFn: () => void) => {
     setIsSubmitting(true);
     await new Promise(r => setTimeout(r, 400));
     actionFn();
     setIsSubmitting(false);
     setToastMessage(msg);
     setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePause = () => {
    handleAction('Production paused', () => {
       triggerManualEvent('PRODUCTION', 'Production Paused', `Weaver manually paused ${currentLoom.id}`, 'Delay added');
       updateLoomState(currentLoom.id, { status: 'IDLE' });
    });
  };

  const handleResume = () => {
    handleAction('Production resumed', () => {
       triggerManualEvent('PRODUCTION', 'Production Resumed', `Weaver manually resumed ${currentLoom.id}`, 'Production active');
       updateLoomState(currentLoom.id, { status: currentLoom.currentDesignId ? 'WEAVING' : 'IDLE' });
    });
  };

  const handleMaintenance = () => {
    handleAction('Maintenance issue reported to manager', () => {
       triggerManualEvent('MAINTENANCE', 'Reported Mechanical Failure', `Weaver reported a mechanical failure on ${currentLoom.id}.`, 'Production stopped');
       updateLoomState(currentLoom.id, { status: 'MAINTENANCE', maintenanceStatus: 'Under Repair', maintenanceScore: Math.max(0, currentLoom.maintenanceScore - 40) });
    });
  };

  const handleCompleteWork = () => {
    handleAction('Progress updated: +1 Saree logged', () => {
       incrementSareeCount(currentLoom.id);
       triggerManualEvent('PRODUCTION', 'Production Logged', `Weaver logged 1 saree completed on ${currentLoom.id}.`, 'Progress updated');
    });
  };

  const handleRequestMaterial = () => {
     handleAction('Silk & Zari restock requested', () => {
        triggerManualEvent('INVENTORY', 'Material Request', `Weaver requested raw silk and zari allocation for ${currentLoom.id}.`, 'Request sent');
     });
  };

  // Allocated materials math
  const silkUsed = (currentLoom.sareesCompleted * 0.4).toFixed(1);
  const silkRemaining = Math.max(0, (12 - currentLoom.sareesCompleted) * 0.4).toFixed(1);

  const zariUsed = (currentLoom.sareesCompleted * 0.1).toFixed(1);
  const zariRemaining = Math.max(0, (12 - currentLoom.sareesCompleted) * 0.1).toFixed(1);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex justify-between items-end">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Package className="w-5 h-5 text-indigo-600" />
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Workspace</h1>
           </div>
           <p className="text-stone-500 text-sm">Loom Operations & Production Control</p>
        </div>
        <span className="text-xs font-mono bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 font-bold">
           {currentLoom.id.toUpperCase()}
        </span>
      </div>

      {toastMessage && (
         <div className="bg-emerald-600 text-white text-xs font-bold p-3 rounded-xl shadow-md flex items-center gap-2 animate-slide-up">
            <CheckCircle2 size={16} />
            {toastMessage}
         </div>
      )}

      {/* Module 1: Current Production */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up-delay-1">
         <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Current Production</h2>
            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
               currentLoom.status === 'WEAVING' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
               currentLoom.status === 'IDLE' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
               currentLoom.status === 'MAINTENANCE' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
               'bg-amber-100 text-amber-700 border border-amber-200'
            }`}>
               {currentLoom.status.replace('_', ' ')}
            </span>
         </div>
         <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Current Design</div>
                  <div className="text-sm font-bold text-slate-800">{design?.name}</div>
               </div>
               <div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Warp Progress</div>
                  <div className="text-sm font-bold text-indigo-600">{currentLoom.sareesCompleted} / {currentLoom.targetSarees} Sarees</div>
               </div>
               <div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Remaining Warp</div>
                  <div className="text-sm font-semibold text-slate-700">{Math.max(0, currentLoom.targetSarees - currentLoom.sareesCompleted)} Sarees</div>
               </div>
               <div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Estimated Completion</div>
                  <div className="text-sm font-semibold text-slate-700">{currentLoom.daysRemaining} Days Left</div>
               </div>
            </div>

            {/* Progress Bar */}
            <div>
               <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${(currentLoom.sareesCompleted / currentLoom.targetSarees) * 100}%` }}></div>
               </div>
            </div>

            {/* Current Order details */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
               <div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Current Order</div>
                  <div className="font-semibold text-slate-800">{order.id}</div>
                  <div className="text-stone-500 text-[11px] truncate">{order.customerName}</div>
               </div>
               <div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Delivery Date</div>
                  <div className="font-semibold text-emerald-600">{order.expectedDeliveryDate}</div>
               </div>
            </div>
         </div>
      </div>

      {/* Module 2: Loom Information */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up-delay-2">
         <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Loom Information</h2>
         </div>
         <div className="p-5 grid grid-cols-2 gap-4">
            <div>
               <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Loom Health</div>
               <div className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={14}/> {currentLoom.maintenanceScore || 92}%
               </div>
            </div>
            <div>
               <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Maintenance Status</div>
               <div className="text-sm font-semibold text-slate-700">{currentLoom.maintenanceStatus || 'Nominal'}</div>
            </div>
            <div>
               <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Efficiency</div>
               <div className="text-sm font-semibold text-indigo-600">{currentLoom.efficiencyPercent}%</div>
            </div>
            <div>
               <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Assigned Weaver</div>
               <div className="text-sm font-semibold text-slate-800">{weaver.name}</div>
            </div>
         </div>
      </div>

      {/* Module 3: Material Status */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up-delay-2">
         <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Allocated Materials</h2>
         </div>
         <div className="p-5 grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
               <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1">
                  <Feather size={14} className="text-indigo-500"/> Allocated Silk
               </div>
               <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-400">Used:</span>
                  <span className="font-semibold text-slate-700">{silkUsed} kg</span>
               </div>
               <div className="flex justify-between text-xs">
                  <span className="text-stone-400">Remaining:</span>
                  <span className="font-semibold text-emerald-600">{silkRemaining} kg</span>
               </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
               <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1">
                  <Sparkles size={14} className="text-amber-500"/> Allocated Zari
               </div>
               <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-400">Used:</span>
                  <span className="font-semibold text-slate-700">{zariUsed} spools</span>
               </div>
               <div className="flex justify-between text-xs">
                  <span className="text-stone-400">Remaining:</span>
                  <span className="font-semibold text-emerald-600">{zariRemaining} spools</span>
               </div>
            </div>
         </div>
      </div>

      {/* Module 4: Today's Tasks */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up-delay-2">
         <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Today's Tasks</h2>
         </div>
         <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
               <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600 border-slate-300" />
                  <span className="text-xs font-semibold text-slate-800">Complete Saree #{currentLoom.sareesCompleted + 1}</span>
               </div>
               <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">In Progress</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
               <div className="flex items-center gap-3">
                  <input type="checkbox" className="rounded text-indigo-600 border-slate-300" />
                  <span className="text-xs font-semibold text-slate-800">Finish Zari Temple Border</span>
               </div>
               <span className="text-[10px] font-bold text-stone-400 uppercase">Pending</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
               <div className="flex items-center gap-3">
                  <input type="checkbox" className="rounded text-indigo-600 border-slate-300" />
                  <span className="text-xs font-semibold text-slate-800">Collect Jacquard Cards for Next Warp</span>
               </div>
               <span className="text-[10px] font-bold text-stone-400 uppercase">Next Warp</span>
            </div>
         </div>
      </div>

      {/* Module 6: Quick Actions */}
      <div className="space-y-3 animate-slide-up-delay-3">
         <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest px-1">Quick Actions</h2>
         
         <div className="grid grid-cols-2 gap-3">
            <button 
               onClick={handleCompleteWork}
               disabled={isSubmitting || currentLoom.sareesCompleted >= currentLoom.targetSarees}
               className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition text-xs font-bold"
            >
               <Check size={18} /> Update Progress (+1)
            </button>

            <button 
               onClick={handleRequestMaterial}
               disabled={isSubmitting}
               className="bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition text-xs font-bold"
            >
               <Layers size={18} /> Request Material
            </button>

            {currentLoom.status === 'WEAVING' ? (
               <button 
                  onClick={handlePause}
                  disabled={isSubmitting}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 p-3.5 rounded-xl flex items-center justify-center gap-2 transition text-xs font-bold border border-amber-200"
               >
                  <Pause size={18} /> Pause Loom
               </button>
            ) : (
               <button 
                  onClick={handleResume}
                  disabled={isSubmitting}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 p-3.5 rounded-xl flex items-center justify-center gap-2 transition text-xs font-bold border border-emerald-200"
               >
                  <Play size={18} /> Resume Loom
               </button>
            )}

            <button 
               onClick={handleMaintenance}
               disabled={isSubmitting || currentLoom.status === 'MAINTENANCE'}
               className="bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 p-3.5 rounded-xl flex items-center justify-center gap-2 transition text-xs font-bold border border-rose-200"
            >
               <AlertTriangle size={18} /> Report Issue
            </button>
         </div>
      </div>
    </div>
  );
}

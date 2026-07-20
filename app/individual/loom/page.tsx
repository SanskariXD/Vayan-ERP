'use client';

import { useEffect, useState } from 'react';
import { useSimulationStore, useArtisanStore } from '@/lib/store';
import { 
  Package, Wrench, Play, Pause, CheckCircle2, AlertTriangle, 
  Check, Feather, Sparkles, Plus, Layers, AlertCircle
} from 'lucide-react';

export default function IndividualLoomPage() {
  const { state, isLoaded, initialize, updateLoomState, triggerManualEvent, incrementSareeCount, deployLoom } = useSimulationStore();
  const artisanState = useArtisanStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDesignId, setSelectedDesignId] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isLoaded || !state || !artisanState) return null;

  const { currentLoom } = artisanState;
  const currentDesign = state.designs.find((d: any) => d.id === currentLoom.currentDesignId) || state.designs[0];
  const weaver = state.weavers.find((w: any) => w.id === 'weaver-01') || { name: 'Kamesh (You)' };

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
     handleAction('Silk & Zari allocation request submitted', () => {
        triggerManualEvent('INVENTORY', 'Material Request', `Weaver requested raw silk and zari allocation for ${currentLoom.id}.`, 'Request sent');
     });
  };

  const handleAssignDesign = () => {
     if (!selectedDesignId) return;
     const targetDesign = state.designs.find((d: any) => d.id === selectedDesignId);
     handleAction(`Assigned design: ${targetDesign?.name}`, () => {
        deployLoom(currentLoom.id, selectedDesignId);
        triggerManualEvent('PRODUCTION', 'Design Assigned', `Weaver assigned ${targetDesign?.name} to ${currentLoom.id}.`, 'Warp setup scheduled');
     });
  };

  // Material calculations
  const silkUsed = (currentLoom.sareesCompleted * 0.4).toFixed(1);
  const silkRemaining = Math.max(0, (12 - currentLoom.sareesCompleted) * 0.4).toFixed(1);

  const zariUsed = (currentLoom.sareesCompleted * 0.1).toFixed(1);
  const zariRemaining = Math.max(0, (12 - currentLoom.sareesCompleted) * 0.1).toFixed(1);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Package className="w-5 h-5 text-indigo-600" />
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Loom</h1>
           </div>
           <p className="text-stone-500 text-sm">Loom Condition, Materials & Design Controls</p>
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

      {/* Loom Condition & Info */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up-delay-1">
         <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Loom Condition & Health</h2>
            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
               currentLoom.status === 'WEAVING' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
               currentLoom.status === 'IDLE' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
               'bg-rose-100 text-rose-700 border border-rose-200'
            }`}>
               {currentLoom.status.replace('_', ' ')}
            </span>
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
               <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Last Maintenance</div>
               <div className="text-sm font-semibold text-slate-700">12 July 2026</div>
            </div>
         </div>
      </div>

      {/* Material Allocation & Modifiers */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up-delay-2">
         <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Material Allocation (Silk & Zari)</h2>
            <button 
               onClick={handleRequestMaterial}
               disabled={isSubmitting}
               className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
               <Layers size={14} /> Request Restock
            </button>
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

      {/* Select / Add Design for Next Warp */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up-delay-2">
         <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Assign / Change Design</h2>
         </div>
         <div className="p-5 space-y-3">
            <div className="text-xs text-stone-500 mb-1">
               Select a design to prepare for your loom's next warp setup:
            </div>
            <div className="flex gap-2">
               <select 
                  value={selectedDesignId}
                  onChange={(e) => setSelectedDesignId(e.target.value)}
                  className="flex-1 text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
               >
                  <option value="">-- Choose Design --</option>
                  {state.designs.map((d: any) => (
                     <option key={d.id} value={d.id}>
                        {d.name} ({d.expectedSellingPrice ? `₹${d.expectedSellingPrice.toLocaleString('en-IN')}` : ''})
                     </option>
                  ))}
               </select>
               <button 
                  onClick={handleAssignDesign}
                  disabled={!selectedDesignId || isSubmitting}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition"
               >
                  Assign
               </button>
            </div>
         </div>
      </div>

      {/* Quick Operational Controls */}
      <div className="space-y-3 animate-slide-up-delay-3">
         <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest px-1">Loom Controls</h2>
         
         <div className="grid grid-cols-2 gap-3">
            <button 
               onClick={handleCompleteWork}
               disabled={isSubmitting || currentLoom.sareesCompleted >= currentLoom.targetSarees}
               className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition text-xs font-bold"
            >
               <Check size={18} /> Update Progress (+1)
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
               className="col-span-2 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 p-3.5 rounded-xl flex items-center justify-center gap-2 transition text-xs font-bold border border-rose-200"
            >
               <AlertTriangle size={18} /> Report Maintenance Issue
            </button>
         </div>
      </div>
    </div>
  );
}

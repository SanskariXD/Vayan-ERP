'use client';

import { useEffect, useState } from 'react';
import { useSimulationStore, useArtisanStore } from '@/lib/store';
import { Package, Calendar, CheckCircle2, ChevronRight, Zap, Clock, Activity, LayoutDashboard, Plus, Play, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';

export default function IndividualHomePage() {
  const { state, isLoaded, initialize, updateLoomState, triggerManualEvent } = useSimulationStore();
  const artisanState = useArtisanStore();

  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [qcParams, setQcParams] = useState({ zariFastness: false, threadCount: false });

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isLoaded || !state || !artisanState) return null;

  const { currentLoom } = artisanState;
  const design = state.designs.find((d: any) => d.id === currentLoom.currentDesignId) || state.designs[0];

  const handleStartBatch = (des: any) => {
    updateLoomState(currentLoom.id, {
      status: 'SETUP_JACQUARD',
      currentDesignId: des.id,
      setupDaysRemaining: des.setupDays || 15,
      sareesCompleted: 0,
      targetSarees: 12
    });
    triggerManualEvent('PRODUCTION', 'Self-Initiated Batch Setup', `Artisan started setup for ${des.name} on ${currentLoom.id}.`, '15-Day setup pipeline initiated');
    setIsDesignModalOpen(false);
  };

  const handleCompleteFinalInspection = () => {
    if (!qcParams.zariFastness || !qcParams.threadCount) return;
    
    // Register Direct Market Sale & Profit
    const { registerDispatchTransaction } = useSimulationStore.getState();
    if (registerDispatchTransaction) {
       registerDispatchTransaction(currentLoom.id);
    }
    
    updateLoomState(currentLoom.id, {
      status: 'IDLE',
      sareesCompleted: 0,
      currentDesignId: null
    });

    triggerManualEvent('SALES', 'Direct Batch Sale Completed', `Artisan completed final QC inspection and listed batch for sale.`, 'Revenue logged');
    setIsInspectionModalOpen(false);
    setQcParams({ zariFastness: false, threadCount: false });
  };

  const handleNextStage = () => {
     const currentStatus = currentLoom.status;
     let nextStatus = '';
     if (currentStatus === 'SETUP_JACQUARD') nextStatus = 'SETUP_SILK_PREP';
     else if (currentStatus === 'SETUP_SILK_PREP') nextStatus = 'SETUP_WARP_DRAW';
     else if (currentStatus === 'SETUP_WARP_DRAW') nextStatus = 'SETUP_CALIBRATION';
     else if (currentStatus === 'SETUP_CALIBRATION') nextStatus = 'WEAVING';
     
     if (nextStatus) {
        updateLoomState(currentLoom.id, {
           status: nextStatus,
           setupDaysRemaining: Math.max(0, (currentLoom.setupDaysRemaining || 15) - 3)
        });
        triggerManualEvent('PRODUCTION', 'Stage Completed', `Artisan completed ${currentStatus}.`, 'Next stage started');
     }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
           <LayoutDashboard className="w-5 h-5 text-indigo-600" />
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Solo Artisan ERP</h1>
        </div>
        <p className="text-stone-500 text-sm">{state.cooperative.currentSimulatedDate} · Entrepreneur Mode</p>
      </div>

      {/* Start New Batch Card if IDLE */}
      {currentLoom.status === 'IDLE' && (
         <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white rounded-xl shadow-md p-6 border border-indigo-700 animate-slide-up">
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">
               <Sparkles size={16} className="text-amber-400 fill-amber-400" /> Standalone Artisan Production
            </div>
            <h2 className="text-xl font-bold mb-2">Loom is Currently Idle</h2>
            <p className="text-xs text-indigo-100 mb-5 leading-relaxed">
               Select a high-demand bridal or export design from market radar and initiate your 15-day physical setup pipeline.
            </p>
            <button 
               onClick={() => setIsDesignModalOpen(true)}
               className="w-full bg-white text-indigo-900 font-bold text-sm py-3 rounded-lg hover:bg-indigo-50 transition shadow-sm flex items-center justify-center gap-2"
            >
               <Plus size={18} /> Start New Batch
            </button>
         </div>
      )}

      {/* Current Production Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up-delay-1">
         <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Package className="w-4 h-4 text-indigo-600" />
               <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Current Batch</h2>
            </div>
            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
               currentLoom.status === 'WEAVING' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
               currentLoom.status === 'IDLE' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
               'bg-amber-100 text-amber-700 border border-amber-200'
            }`}>
               {currentLoom.status.replace('_', ' ')}
            </span>
         </div>
         <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Active Design</div>
                  <div className="text-sm font-bold text-slate-800">{design?.name || 'None Selected'}</div>
               </div>
               <div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Warp Progress</div>
                  <div className="text-sm font-bold text-indigo-600">{currentLoom.sareesCompleted} / {currentLoom.targetSarees || 12} Sarees</div>
               </div>
               <div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Remaining Warp</div>
                  <div className="text-sm font-semibold text-slate-700">{Math.max(0, (currentLoom.targetSarees || 12) - currentLoom.sareesCompleted)} Sarees</div>
               </div>
               <div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Status / Days Left</div>
                  <div className="text-sm font-semibold text-slate-700">
                     {currentLoom.status.startsWith('SETUP') ? `${currentLoom.setupDaysRemaining || 15} Setup Days Left` : `${currentLoom.daysRemaining || 6} Days Left`}
                  </div>
               </div>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
               <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${(currentLoom.sareesCompleted / (currentLoom.targetSarees || 12)) * 100}%` }}></div>
            </div>

            {/* Self-QC Final Inspection Trigger if sareesCompleted === targetSarees */}
            {currentLoom.sareesCompleted >= (currentLoom.targetSarees || 12) && currentLoom.status !== 'IDLE' && (
               <button 
                  onClick={() => setIsInspectionModalOpen(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 rounded-lg transition shadow-sm flex items-center justify-center gap-2 mt-2"
               >
                  <CheckCircle2 size={18} /> Final Inspection (Ready for Market)
               </button>
            )}
         </div>
      </div>

      {/* Today's To-Do List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up-delay-2">
         <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <CheckCircle2 className="w-4 h-4 text-emerald-500" />
               <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Today's Self-Task</h2>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Solo Pipeline</span>
         </div>
         <div className="p-4 space-y-2.5">
            {/* Dynamic Stage-Aware Tasks */}
            {(() => {
               const status = currentLoom.status;
               const completed = currentLoom.sareesCompleted;
               const target = currentLoom.targetSarees || 12;

               let activeTask = "";
               let taskTag = "Pending";
               let tagColor = "text-stone-400 bg-slate-50";

               if (status === 'SETUP_JACQUARD') {
                  activeTask = "Procure Jacquard Cards & Punch Design.";
                  taskTag = "Setup Stage 1";
                  tagColor = "text-amber-700 bg-amber-50";
               } else if (status === 'SETUP_SILK_PREP') {
                  activeTask = "Silk Yarn Dyeing & Winding in progress.";
                  taskTag = "Setup Stage 2";
                  tagColor = "text-amber-700 bg-amber-50";
               } else if (status === 'SETUP_WARP_DRAW') {
                  activeTask = "Thread Drawing-in & Reed Setup required.";
                  taskTag = "Setup Stage 3";
                  tagColor = "text-amber-700 bg-amber-50";
               } else if (status === 'SETUP_CALIBRATION') {
                  activeTask = "Calibrate Loom Tension.";
                  taskTag = "Setup Stage 4";
                  tagColor = "text-amber-700 bg-amber-50";
               } else if (status === 'QC') {
                  activeTask = "Perform Final Quality Inspection.";
                  taskTag = "Quality Gate";
                  tagColor = "text-indigo-700 bg-indigo-50";
               } else if (status === 'WEAVING' && completed < target) {
                  activeTask = `Complete Saree #${completed + 1}`;
                  taskTag = "In Progress";
                  tagColor = "text-emerald-700 bg-emerald-50";
               } else if (completed >= target) {
                  activeTask = "Batch Completed — Complete Final Inspection";
                  taskTag = "Ready for Sale";
                  tagColor = "text-emerald-700 bg-emerald-50";
               } else {
                  activeTask = "Loom Idle — Start New Batch from Market Radar.";
                  taskTag = "Idle";
               }

               return (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                     <div className="flex items-center gap-3">
                        <input 
                           type="checkbox" 
                           checked={completed >= target || status === 'QC'} 
                           onChange={handleNextStage}
                           disabled={!status.startsWith('SETUP_')}
                           className="rounded text-indigo-600 border-slate-300 cursor-pointer disabled:cursor-not-allowed" 
                        />
                        <span className="text-xs font-bold text-slate-800">{activeTask}</span>
                     </div>
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tagColor}`}>{taskTag}</span>
                  </div>
               );
            })()}
         </div>
      </div>

      {/* Select Design Modal for Self Start */}
      {isDesignModalOpen && (
         <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
               <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                     <Sparkles className="text-indigo-600" size={18} /> Select Market Design
                  </h3>
                  <button onClick={() => setIsDesignModalOpen(false)} className="text-stone-400 hover:text-slate-600">✕</button>
               </div>

               <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {state.designs.map((d: any) => (
                     <div 
                        key={d.id} 
                        onClick={() => setSelectedDesign(d)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                           selectedDesign?.id === d.id ? 'border-indigo-600 bg-indigo-50/60' : 'border-slate-200 hover:bg-slate-50'
                        }`}
                     >
                        <img src={d.imageUrl} alt={d.name} className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0" />
                        <div className="flex-1 min-w-0">
                           <div className="text-xs font-bold text-slate-800 truncate">{d.name}</div>
                           <div className="text-[10px] text-stone-500 font-medium">Selling Price: ₹{d.expectedSellingPrice?.toLocaleString('en-IN')}</div>
                           <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Estimated Profit: ~₹8,000 / saree</div>
                        </div>
                     </div>
                  ))}
               </div>

               <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 mt-4">
                  <button onClick={() => setIsDesignModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
                  <button 
                     disabled={!selectedDesign}
                     onClick={() => handleStartBatch(selectedDesign)}
                     className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm"
                  >
                     Initiate 15-Day Setup
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Self-QC Inspection Modal */}
      {isInspectionModalOpen && (
         <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
               <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                     <CheckCircle2 className="text-emerald-600" size={20} /> Final Inspection (Self-QC)
                  </h3>
                  <button onClick={() => setIsInspectionModalOpen(false)} className="text-stone-400 hover:text-slate-600">✕</button>
               </div>

               <div className="space-y-4 py-2">
                  <p className="text-xs text-stone-500">
                     Verify your completed batch quality before listing for market sales and realizing profits:
                  </p>

                  <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                     <input 
                        type="checkbox" 
                        checked={qcParams.zariFastness}
                        onChange={e => setQcParams({ ...qcParams, zariFastness: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" 
                     />
                     <div>
                        <div className="text-xs font-bold text-slate-800">Zari Fastness & Shine Passed</div>
                        <div className="text-[10px] text-stone-400">Tested border gold zari for grade A fastness</div>
                     </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                     <input 
                        type="checkbox" 
                        checked={qcParams.threadCount}
                        onChange={e => setQcParams({ ...qcParams, threadCount: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" 
                     />
                     <div>
                        <div className="text-xs font-bold text-slate-800">Thread Count & Reed Verification</div>
                        <div className="text-[10px] text-stone-400">Verified warp density and uniformity</div>
                     </div>
                  </label>
               </div>

               <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 mt-2">
                  <button onClick={() => setIsInspectionModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
                  <button 
                     disabled={!qcParams.zariFastness || !qcParams.threadCount}
                     onClick={handleCompleteFinalInspection}
                     className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
                  >
                     <Check size={16} /> Mark Ready for Sale & Realize Revenue
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Market Alert */}
      <div className="bg-indigo-600 text-white rounded-xl shadow-sm border border-indigo-700 overflow-hidden animate-slide-up-delay-2">
         <div className="p-4 border-b border-indigo-500/30 flex items-center gap-2">
            <Zap size={16} className="text-amber-300 fill-amber-300" />
            <span className="text-xs font-bold uppercase tracking-widest">Market Demand Alert</span>
         </div>
         <div className="p-5">
            <p className="text-xs font-medium leading-relaxed mb-4 text-indigo-50">
              Wedding season begins in 45 days. Complete your current warp to prepare for direct market bridal sales.
            </p>
            <Link href="/individual/outlook" className="bg-white text-indigo-700 text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1 hover:bg-indigo-50 transition">
              View Production Outlook <ChevronRight size={14} />
            </Link>
         </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useSimulationStore, useArtisanStore } from '@/lib/store';
import { Package, Calendar, CheckCircle2, ChevronRight, Zap, Clock, Activity, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function IndividualHomePage() {
  const { state, isLoaded, initialize } = useSimulationStore();
  const artisanState = useArtisanStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isLoaded || !state || !artisanState) return null;

  const { currentLoom } = artisanState;
  const design = state.designs.find((d: any) => d.id === currentLoom.currentDesignId) || state.designs[0];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
           <LayoutDashboard className="w-5 h-5 text-indigo-600" />
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Home</h1>
        </div>
        <p className="text-stone-500 text-sm">{state.cooperative.currentSimulatedDate} · Active Shift</p>
      </div>

      {/* Current Production Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up-delay-1">
         <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Package className="w-4 h-4 text-indigo-600" />
               <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Current Production</h2>
            </div>
            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
               currentLoom.status === 'WEAVING' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
               currentLoom.status === 'IDLE' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
               'bg-rose-100 text-rose-700 border border-rose-200'
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

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
               <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${(currentLoom.sareesCompleted / currentLoom.targetSarees) * 100}%` }}></div>
            </div>
         </div>
      </div>

      {/* Today's To-Do List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up-delay-2">
         <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <CheckCircle2 className="w-4 h-4 text-emerald-500" />
               <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Today's To-Do List</h2>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">3 Tasks</span>
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
                  <span className="text-xs font-semibold text-slate-800">Finish Zari Border Weaving</span>
               </div>
               <span className="text-[10px] font-bold text-stone-400 uppercase">Pending</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
               <div className="flex items-center gap-3">
                  <input type="checkbox" className="rounded text-indigo-600 border-slate-300" />
                  <span className="text-xs font-semibold text-slate-800">Prepare Warp Tomorrow</span>
               </div>
               <span className="text-[10px] font-bold text-stone-400 uppercase">Next Setup</span>
            </div>
         </div>
      </div>

      {/* Market Alert */}
      <div className="bg-indigo-600 text-white rounded-xl shadow-sm border border-indigo-700 overflow-hidden animate-slide-up-delay-2">
         <div className="p-4 border-b border-indigo-500/30 flex items-center gap-2">
            <Zap size={16} className="text-amber-300 fill-amber-300" />
            <span className="text-xs font-bold uppercase tracking-widest">Market Demand Alert</span>
         </div>
         <div className="p-5">
            <p className="text-xs font-medium leading-relaxed mb-4 text-indigo-50">
              Wedding season begins in 45 days. Complete your current warp to prepare for assigned bridal orders.
            </p>
            <Link href="/individual/outlook" className="bg-white text-indigo-700 text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1 hover:bg-indigo-50 transition">
              View Production Outlook <ChevronRight size={14} />
            </Link>
         </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useSimulationStore, useCoopStore, useArtisanStore } from '@/lib/store';
import { 
  TrendingUp, Calendar, ArrowRight, CheckCircle2, Clock, 
  Sparkles, Layers, FileText, AlertCircle, Wallet, Compass, Send, Check, Printer, RotateCcw
} from 'lucide-react';

export default function WeaverOutlookPage() {
  const { state, isLoaded, initialize } = useSimulationStore();
  const artisanState = useArtisanStore();
  const [printedDesigns, setPrintedDesigns] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [designOffset, setDesignOffset] = useState(0);
  const queueDesign = useCoopStore((s: any) => s.queueDesign);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isLoaded || !state || !artisanState) return null;

  const { currentLoom, artisanLedger } = artisanState;
  const currentDesign = state.designs.find((d: any) => d.id === currentLoom.currentDesignId) || state.designs[0];
  const nextDesign = state.designs.find((d: any) => d.id !== currentDesign?.id) || state.designs[1];

  const handleSendToQueue = (design: any) => {
     setPrintedDesigns(prev => ({ ...prev, [design.id]: true }));
     if (queueDesign) {
        queueDesign({
           id: `${design.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
           name: design.name,
           imageUrl: design.imageUrl || '',
           complexityLevel: design.complexity || design.complexityLevel || 3,
           silkRequired: design.silkRequired || 4.8,
           zariRequired: design.zariRequired || 1.2,
           expectedWeavingDays: design.expectedWeavingDays || 6,
           setupDays: design.setupDays || 2,
           expectedSellingPrice: design.expectedSellingPrice || 15000,
           source: 'Demand Intelligence',
           notes: `Requested from Weaver Outlook`
        });
     }
     setTimeout(() => {
        setPrintedDesigns(prev => ({ ...prev, [design.id]: false }));
     }, 3000);
  };

  const currentMonthEarned = artisanLedger
    .filter((l: any) => l.type === 'WAGE_PAYOUT')
    .reduce((sum: number, l: any) => sum + Math.abs(l.amount), 0) || 22400;

  const projectedMonthEnd = currentMonthEarned + 9400;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
           <TrendingUp className="w-5 h-5 text-indigo-600" />
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Demand Forecasting & Planning</h1>
        </div>
        <p className="text-stone-500 text-sm">Personal demand forecast, market matrix & workload roadmap</p>
      </div>

      {/* Section 1 — Personal Production Outlook */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-slide-up-delay-1">
         <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Personal Outlook</span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-rose-100 text-rose-700 border border-rose-200">
               Workload: HIGH
            </span>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div>
               <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Current Assignment</div>
               <div className="text-sm font-bold text-slate-800">{currentDesign?.name}</div>
            </div>
            <div>
               <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Next Assignment</div>
               <div className="text-sm font-bold text-indigo-600">{nextDesign?.name}</div>
            </div>
            <div>
               <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Assigned Orders</div>
               <div className="text-sm font-semibold text-slate-700">18 Sarees</div>
            </div>
            <div>
               <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Expected Completion</div>
               <div className="text-sm font-semibold text-emerald-600">30 Aug 2026</div>
            </div>
         </div>
      </div>

      {/* Section 2 — Why My Workload Changes */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 shadow-sm animate-slide-up-delay-1">
         <div className="flex items-center gap-2 mb-3 text-indigo-900">
            <Sparkles size={16} className="text-indigo-600" />
            <h2 className="text-xs font-bold uppercase tracking-wide">Why My Workload Changes</h2>
         </div>

         <div className="space-y-4">
            <div className="bg-white p-3.5 rounded-lg border border-indigo-100/80 space-y-2">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Wedding Season (Starts in 6 weeks)
               </div>
               <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium pl-4">
                  <ArrowRight size={12} className="text-slate-400" />
                  Manager assigned Bridal Collection to LOOM-01
               </div>
               <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-bold pl-4">
                  <ArrowRight size={12} className="text-emerald-500" />
                  12 additional sarees scheduled $\rightarrow$ Estimated earnings increase
               </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-indigo-100/80 space-y-2">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Festival Orders Increasing
               </div>
               <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium pl-4">
                  <ArrowRight size={12} className="text-slate-400" />
                  Temple Collection scheduled after current warp
               </div>
               <div className="flex items-center gap-2 text-[11px] text-indigo-700 font-bold pl-4">
                  <ArrowRight size={12} className="text-indigo-500" />
                  Setup begins in 5 days
               </div>
            </div>
         </div>
      </div>

      {/* Section 3 — Design Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-slide-up-delay-2">
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Design Matrix</h2>
            <button 
               onClick={() => {
                  setIsRefreshing(true);
                  setDesignOffset((prev) => (prev + 6) % Math.max(1, state?.designs?.length || 20));
                  setTimeout(() => setIsRefreshing(false), 600);
               }}
               className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition"
               title="Refresh Design Matrix"
            >
               <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
         </div>

         <div className="grid grid-cols-1 gap-4">
            {(state?.designs && state.designs.length > 0 
               ? Array.from({ length: Math.min(6, state.designs.length) }, (_, i) => state.designs[(designOffset + i) % state.designs.length])
               : []
            ).map((design: any) => (
               <div key={design.id} className="border border-slate-100 rounded-xl hover:border-indigo-100 hover:shadow-md transition bg-slate-50/50 overflow-hidden flex flex-col justify-between">
                  {design.imageUrl && (
                     <div className="relative h-28 w-full overflow-hidden border-b border-slate-100 shrink-0">
                        <img 
                           src={design.imageUrl} 
                           alt={design.name}
                           className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                     </div>
                  )}
                  
                  <div className="p-4 flex-1 flex flex-col justify-between">
                     <div className="flex justify-between items-start mb-3 gap-2">
                        <div>
                           <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{design.name}</h3>
                           <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{design.id}</div>
                        </div>
                        <button 
                           onClick={() => handleSendToQueue(design)}
                           className={`p-2 rounded-lg transition flex items-center justify-center shrink-0 ${printedDesigns[design.id] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600 hover:bg-indigo-600 hover:text-white'}`}
                           title="Send design to Central Management Queue"
                        >
                           {printedDesigns[design.id] ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                        </button>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-white p-2 rounded border border-slate-100">
                           <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Profit Margin</div>
                           <div className="text-xs font-semibold text-emerald-600">₹{(design.profitMargin || (design.expectedSellingPrice ? Math.round(design.expectedSellingPrice * 0.4) : 8800)).toLocaleString()}/unit</div>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-100">
                           <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Difficulty</div>
                           <div className="text-xs font-semibold text-slate-700">{design.complexity || design.complexityLevel || 3}/5</div>
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Section 4 — Upcoming Production Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-slide-up-delay-2">
         <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-4">Production Roadmap</h2>
         
         <div className="relative border-l-2 border-slate-100 ml-3 space-y-6 pb-2">
            <div className="relative pl-6">
               <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm"></div>
               <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-0.5">Today</div>
               <div className="text-xs font-bold text-slate-800">Weaving Current Warp ({currentDesign?.name})</div>
            </div>

            <div className="relative pl-6">
               <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-sm"></div>
               <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Est. Aug 10</div>
               <div className="text-xs font-bold text-slate-800">Finish Current Warp ({Math.max(0, 12 - currentLoom.sareesCompleted)} Sarees Left)</div>
            </div>

            <div className="relative pl-6">
               <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-400 border-4 border-white shadow-sm"></div>
               <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-0.5">Aug 11 - Aug 12</div>
               <div className="text-xs font-bold text-slate-800">Warp Setup (2 Days Lead Time)</div>
            </div>

            <div className="relative pl-6">
               <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm"></div>
               <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Aug 13 - Aug 30</div>
               <div className="text-xs font-bold text-slate-800">Wedding Collection ({nextDesign?.name})</div>
            </div>
         </div>
      </div>

      {/* Section 5 — Upcoming Assignments */}
      <div className="space-y-3 animate-slide-up-delay-2">
         <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Upcoming Assignments</h2>

         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
               <div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-rose-100 text-rose-700 mb-1 inline-block">
                     High Priority
                  </span>
                  <h3 className="text-sm font-bold text-slate-800">{nextDesign?.name}</h3>
               </div>
               <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                  12 Sarees
               </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-100">
               <div>
                  <span className="text-stone-400 text-[10px] uppercase font-bold tracking-widest block mb-0.5">Planned Start</span>
                  <span className="font-semibold text-slate-700">12 Aug 2026</span>
               </div>
               <div>
                  <span className="text-stone-400 text-[10px] uppercase font-bold tracking-widest block mb-0.5">Expected Finish</span>
                  <span className="font-semibold text-slate-700">30 Aug 2026</span>
               </div>
            </div>
         </div>
      </div>

      {/* Section 6 — Preparation Planner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-slide-up-delay-3">
         <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-4">Preparation Planner</h2>

         <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
               <span className="font-semibold text-slate-800">Prepare Warp Setup</span>
               <span className="font-bold text-amber-600">In 3 Days</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
               <span className="font-semibold text-slate-800">Jacquard Cards Ready</span>
               <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14}/> Ready</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
               <span className="font-semibold text-slate-800">Silk Allocated</span>
               <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14}/> 4.8 kg</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
               <span className="font-semibold text-slate-800">Gold Zari Allocated</span>
               <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14}/> 1.2 kg</span>
            </div>
         </div>
      </div>



      {/* Section 8 — Manager Notes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-slide-up-delay-3">
         <div className="flex items-center gap-2 mb-3 text-slate-800">
            <FileText size={16} className="text-indigo-600" />
            <h2 className="text-xs font-bold uppercase tracking-wide">Manager Planning Notes</h2>
         </div>

         <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-lg space-y-2 text-xs text-amber-900 font-medium leading-relaxed">
            <p className="flex items-start gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
               Prioritize Bridal Collection for the upcoming wedding season.
            </p>
            <p className="flex items-start gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
               Quality inspection required after saree #4 of the next batch.
            </p>
            <p className="flex items-start gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
               Gold zari only for border detailing.
            </p>
         </div>
      </div>
    </div>
  );
}

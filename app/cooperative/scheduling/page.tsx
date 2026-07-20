'use client';

import { useState, useEffect } from 'react';
import { useSimulationStore } from '@/lib/store';
import { Sparkles, Calendar, TrendingUp, CheckCircle2, AlertTriangle, Users, Wallet, BrainCircuit, Loader2 } from 'lucide-react';

const TIMELINE_DAYS = 60;
const DAY_WIDTH = 24;
const ROW_HEIGHT = 64;
const LOOM_COL_WIDTH = 120;

function diffDays(date1: string, date2: string) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getDayLabels(currentDateStr: string) {
  const today = new Date(currentDateStr);
  return Array.from({ length: TIMELINE_DAYS }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return {
      day: i,
      label: d.getDate(),
      month: d.toLocaleString('default', { month: 'short' }),
      isFirst: d.getDate() === 1 || i === 0,
    };
  });
}

export default function SchedulingPage() {
  const { state, isLoaded, initialize, deployLoom } = useSimulationStore();
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isLoaded) {
      setTimeout(() => setIsAnalyzing(false), 800);
    }
  }, [isLoaded]);

  if (!isLoaded || !state) return null;

  const { looms, cooperative, productionReadyDesigns } = state;
  const days = getDayLabels(cooperative.currentSimulatedDate);
  const schedulableDesigns = productionReadyDesigns || [];

  // Extract recommendations from the Recommendation Engine (ONLY from Production Ready Designs)
  const recommendations = (schedulableDesigns.length === 0) ? [] : looms
    .filter((l: any) => l.status === 'IDLE' || (l.status === 'WEAVING' && ((l.targetSarees - l.sareesCompleted) * l.averageSareeDays) <= 6))
    .map((l: any) => {
       const isIdle = l.status === 'IDLE';
       const targetDesign = schedulableDesigns.find((d: any) => d.expectedDemandScore > 70) || schedulableDesigns[0];
       if (!targetDesign) return null;
       return {
         id: `rec-${l.id}`,
         designId: targetDesign.id,
         designName: targetDesign.name,
         targetLoom: l.id,
         expectedCompletion: `+${(targetDesign.expectedWeavingDays || 5) * 12 + (targetDesign.setupDays || 2)} days`,
         expectedRevenue: `₹${(targetDesign.expectedSellingPrice || 8000) * 12}`,
         labourRequirement: '1 Weaver',
         riskLevel: isIdle ? 'HIGH' : 'LOW',
         confidenceScore: targetDesign.expectedDemandScore || 85,
         reasoning: isIdle ? 'Loom is currently idle causing revenue bleed.' : 'Loom is nearing completion. Prepare warp to avoid downtime.'
       };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.confidenceScore - a.confidenceScore)
    .slice(0, 2); // Show only top 2 highest priority

  const handleApprove = (rec: any) => {
    deployLoom(rec.targetLoom, rec.designId);
  };

  return (
    <div className="bg-[#F9F6F0] min-h-screen p-6 md:p-10 font-sans relative">
      <div className="mb-8 animate-fade-in flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-semibold text-slate-800 mb-2 tracking-tight">Scheduling Optimizer</h1>
           <p className="text-stone-500 text-sm">
             Executes Production Decision Engine recommendations into the visual timeline.
           </p>
        </div>
      </div>

      <div className="mb-12 animate-slide-up-delay-1 relative min-h-[100px]">
        {isAnalyzing && (
           <div className="absolute inset-0 z-20 bg-[#F9F6F0]/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl border border-slate-200">
             <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
             <div className="text-sm font-semibold text-slate-700 uppercase tracking-widest animate-pulse">Syncing with Decision Engine...</div>
           </div>
        )}

        <div className="flex items-center gap-2 mb-4 text-slate-800">
          <BrainCircuit className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-semibold tracking-tight">Pending Executions</h2>
        </div>
        
        {recommendations.length === 0 ? (
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center text-stone-500 text-sm">
             {schedulableDesigns.length === 0 
               ? "No production-ready designs available. Prepare Jacquard cards and click 'Mark Ready' in Centralized Management."
               : "No pending actions required. Operations are optimal."}
           </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {recommendations.map((rec: any) => (
              <div key={rec.id} className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm flex flex-col justify-between transition-all">
                <div>
                  <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3 text-indigo-500"/> Recommended Execution</div>
                      <h3 className="text-lg font-semibold text-slate-800">{rec.designName}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
                          Target Loom: <span className="font-mono">{rec.targetLoom.toUpperCase()}</span> 
                       </div>
                       <div className="text-xs font-medium text-stone-500">Priority: <span className="text-rose-600 font-bold">{rec.riskLevel}</span></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col bg-slate-50 p-3 rounded-lg border border-slate-100">
                       <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-0.5 block">Expected Completion</span>
                       <span className="text-sm font-medium text-slate-700">{rec.expectedCompletion}</span>
                    </div>
                    <div className="flex flex-col bg-slate-50 p-3 rounded-lg border border-slate-100">
                       <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-0.5 block">Expected Revenue</span>
                       <span className="text-sm font-medium text-emerald-600">{rec.expectedRevenue}</span>
                    </div>
                  </div>

                  <div className="mb-6 border-l-2 border-indigo-200 pl-3">
                     <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Reason</div>
                     <p className="text-sm text-stone-600 leading-relaxed">{rec.reasoning}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleApprove(rec)}
                  className="w-full bg-slate-800 text-white font-semibold text-sm py-3 rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 mt-auto shadow-md"
                >
                  Approve Recommendation
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="animate-slide-up-delay-2">
         <div className="flex items-center gap-2 mb-4 text-slate-800">
          <Calendar className="w-5 h-5 text-slate-600" />
          <h2 className="text-xl font-semibold tracking-tight">Timeline Matrix</h2>
         </div>

         <div className="bg-white border text-sm border-slate-200 rounded-xl overflow-x-auto shadow-sm pb-4">
           <div className="flex sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
             <div 
               className="shrink-0 flex items-center font-semibold text-xs text-stone-500 uppercase tracking-widest px-4 border-r border-slate-200 bg-slate-50"
               style={{ width: LOOM_COL_WIDTH, minWidth: LOOM_COL_WIDTH }}
             >
               Loom Target
             </div>
             <div className="flex">
               {days.map(({ day, label, month, isFirst }) => (
                 <div
                   key={day}
                   className={`flex flex-col items-center justify-end pb-1 ${isFirst ? 'border-l border-slate-300 bg-[#F9F6F0]' : 'border-l border-slate-100'}`}
                   style={{ width: DAY_WIDTH, minWidth: DAY_WIDTH, height: 48 }}
                 >
                   <span className="text-[10px] text-stone-400 font-medium leading-none">{isFirst ? month : ''}</span>
                   <span className={`text-[11px] font-mono mt-1 ${day === 0 ? 'font-bold text-indigo-600' : 'text-stone-500'}`}>{label}</span>
                 </div>
               ))}
             </div>
           </div>

           <div className="flex flex-col relative w-fit">
             {looms.filter((l:any) => l.status !== 'MAINTENANCE').map((loom: any) => {
               
               return (
                 <div key={loom.id} className="flex border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                    <div 
                      className="sticky left-0 z-10 shrink-0 flex flex-col justify-center px-4 border-r border-slate-200 bg-white group-hover:bg-slate-50"
                      style={{ width: LOOM_COL_WIDTH, minWidth: LOOM_COL_WIDTH }}
                    >
                       <div className="font-mono text-xs font-semibold text-stone-400 mb-0.5">{loom.id.toUpperCase()}</div>
                       <div className="w-full truncate overflow-hidden whitespace-nowrap text-ellipsis text-sm font-medium text-slate-800" title={loom.weaverId || ''}>
                         {loom.weaverId || 'Unassigned'}
                       </div>
                    </div>

                    <div className="relative flex-1" style={{ width: TIMELINE_DAYS * DAY_WIDTH, minWidth: TIMELINE_DAYS * DAY_WIDTH, height: ROW_HEIGHT }}>
                      <div className="absolute inset-0 flex pointer-events-none opacity-20">
                         {days.map(d => (
                            <div key={d.day} style={{ width: DAY_WIDTH }} className="border-l border-slate-200 h-full"></div>
                         ))}
                      </div>

                      {loom.currentDesignId && (
                         <div
                           className="absolute top-1/2 -translate-y-1/2 h-10 rounded-md shadow-sm border overflow-hidden cursor-pointer flex items-center custom-tooltip-parent"
                           style={{
                             left: 1, // Simulating current day start
                             width: loom.status === 'WARP_SETUP' ? Math.max(loom.setupDaysRemaining * DAY_WIDTH, 4) : Math.max((loom.targetSarees - loom.sareesCompleted) * loom.averageSareeDays * DAY_WIDTH, 4),
                             backgroundColor: loom.status === 'WEAVING' ? '#E0F2FE' : '#FFEDD5',
                             borderColor: loom.status === 'WEAVING' ? '#7DD3FC' : '#FDBA74',
                           }}
                         >
                           <div className="mx-2 truncate w-full overflow-hidden whitespace-nowrap text-ellipsis text-xs font-semibold" style={{ color: loom.status === 'WEAVING' ? '#0369A1' : '#9A3412' }}>
                             {state.designs.find((d:any) => d.id === loom.currentDesignId)?.name || 'Design'}
                           </div>
                         </div>
                      )}
                    </div>
                 </div>
               );
             })}
           </div>
         </div>
      </div>
    </div>
  );
}

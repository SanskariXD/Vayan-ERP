'use client';

import { useEffect, useState } from 'react';
import { useSimulationStore, useArtisanStore } from '@/lib/store';
import { Briefcase, Clock, Compass, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export default function IndividualWorkPage() {
  const { state, isLoaded, initialize } = useSimulationStore();
  const artisanState = useArtisanStore();
  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'MARKET'>('SCHEDULE');

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isLoaded || !state || !artisanState) return null;

  const { currentLoom } = artisanState;

  // Filter pending jobs that might be assigned to this loom, or general coop jobs
  const upcomingJobs = state.pendingExecutions
     .filter((job: any) => job.status !== 'Completed' && (job.status === 'Assigned' || job.priority === 'High' || job.priority === 'Urgent'))
     .slice(0, 3);

  // Top designs based on demand
  const topDesigns = [...state.designs].sort((a: any, b: any) => b.expectedDemandScore - a.expectedDemandScore).slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-1">
           <Briefcase className="w-5 h-5 text-indigo-600" />
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Work</h1>
        </div>
        <p className="text-stone-500 text-sm">Schedule & Market Intelligence</p>
      </div>

      <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-xl animate-slide-up-delay-1">
         <button 
           onClick={() => setActiveTab('SCHEDULE')}
           className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'SCHEDULE' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
         >
           Upcoming Schedule
         </button>
         <button 
           onClick={() => setActiveTab('MARKET')}
           className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'MARKET' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
         >
           Market Demand
         </button>
      </div>

      {activeTab === 'SCHEDULE' && (
         <div className="space-y-4 animate-fade-in">
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl shadow-sm flex items-start gap-3">
               <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
               <div>
                  <h3 className="text-sm font-bold text-amber-900 mb-1">Current Assignment</h3>
                  {currentLoom.status === 'WEAVING' ? (
                     <p className="text-xs text-amber-700 leading-relaxed font-medium">
                        You are scheduled to weave <strong>{currentLoom.targetSarees - currentLoom.sareesCompleted}</strong> more sarees for your current design. Estimated finish in <strong>{currentLoom.daysRemaining} days</strong>.
                     </p>
                  ) : currentLoom.status === 'IDLE' ? (
                     <p className="text-xs text-amber-700 leading-relaxed font-medium">
                        You have no active assignments. The Cooperative Manager will deploy a new design to your loom shortly.
                     </p>
                  ) : (
                     <p className="text-xs text-amber-700 leading-relaxed font-medium">
                        Your loom is currently unavailable for new assignments due to its status: {currentLoom.status}.
                     </p>
                  )}
               </div>
            </div>

            <h3 className="text-sm font-bold text-slate-800 mt-6 mb-2">Cooperative Queue</h3>
            {upcomingJobs.length > 0 ? upcomingJobs.map((job: any) => (
               <div key={job.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                     <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${job.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {job.priority} Priority
                     </span>
                     <span className="text-xs font-bold text-stone-400">{job.id}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">{job.name} ({job.quantity} Sarees)</h4>
                  <div className="flex items-center gap-4 text-xs font-medium text-stone-500">
                     <span className="flex items-center gap-1"><Calendar size={12}/> Due: {job.expectedDeliveryDate}</span>
                     <span className="flex items-center gap-1"><Clock size={12}/> {job.setupDays}d setup</span>
                  </div>
               </div>
            )) : (
               <div className="p-6 bg-white rounded-xl border border-slate-100 text-center text-sm font-medium text-slate-500 italic">
                  No upcoming jobs in the queue.
               </div>
            )}
         </div>
      )}

      {activeTab === 'MARKET' && (
         <div className="space-y-4 animate-fade-in">
            <h3 className="text-sm font-bold text-slate-800 mb-2">High Demand Designs</h3>
            <p className="text-xs text-stone-500 mb-4">
               Based on recent cooperative orders and market trends, these designs are currently generating the most revenue. You may be scheduled to weave these soon.
            </p>

            {topDesigns.map((design: any, index: number) => (
               <div key={design.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex gap-4 items-center">
                  <div className="w-12 h-12 bg-indigo-50 rounded-lg flex flex-col items-center justify-center shrink-0 border border-indigo-100">
                     <Compass size={16} className="text-indigo-500 mb-0.5" />
                     <span className="text-[10px] font-bold text-indigo-700">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                     <h4 className="text-sm font-bold text-slate-800 mb-1">{design.name}</h4>
                     <div className="flex items-center gap-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                        <span className="text-emerald-600">₹{design.expectedSellingPrice.toLocaleString('en-IN')}/unit</span>
                        <span>{design.expectedWeavingDays} Days/Saree</span>
                     </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end">
                     <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Demand</span>
                     <div className="flex items-center gap-1 text-sm font-bold text-indigo-600">
                        <TrendingUp size={14} />
                        {design.expectedDemandScore}
                     </div>
                  </div>
               </div>
            ))}
         </div>
      )}
    </div>
  );
}

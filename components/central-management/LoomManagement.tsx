'use client';

import { useState } from 'react';
import { useSimulationStore } from '@/lib/store';
import { Plus, Play, Pause, AlertTriangle, AlertCircle, Wrench } from 'lucide-react';
import { DesignIntakeForm } from '@/components/operations/DesignIntakeForm';

export default function LoomManagementTab() {
  const { state, isLoaded, updateLoomState, triggerManualEvent } = useSimulationStore();
  const [isDesignIntakeOpen, setIsDesignIntakeOpen] = useState(false);
  const [qcLoomId, setQcLoomId] = useState<string | null>(null);

  if (!isLoaded || !state) return null;

  const looms = state.looms || [];
  
  const handleTriggerEvent = (loomId: string, eventType: string, title: string, desc: string, impact: string, newMaintenanceStatus?: string, newLoomStatus?: string) => {
     triggerManualEvent(eventType, title, desc, impact);
     if (newMaintenanceStatus) {
        updateLoomState(loomId, { maintenanceStatus: newMaintenanceStatus });
     }
     if (newLoomStatus) {
        updateLoomState(loomId, { status: newLoomStatus });
     }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Loom Operations</h2>
        <button 
          onClick={() => setIsDesignIntakeOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all"
        >
          <Plus size={16} /> New Loom
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {looms.map((loom: any) => (
            <div key={loom.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                      <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{loom.id}</div>
                      <div className="text-lg font-semibold text-slate-800">{loom.weaverName || 'Unassigned'}</div>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase ${
                    loom.status === 'IDLE' ? 'bg-slate-100 text-slate-600' : 
                    loom.status === 'WEAVING' ? 'bg-emerald-100 text-emerald-700' : 
                    loom.status === 'WARP_SETUP' ? 'bg-amber-100 text-amber-700' :
                    loom.status === 'MAINTENANCE' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                      {loom.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="text-xs font-semibold text-slate-500 mb-1">Production</div>
                      <div className="text-sm font-medium text-slate-800">
                        {loom.currentDesignId ? `Working on ${loom.currentDesignId}` : 'No active design'}
                      </div>
                      {loom.currentDesignId && (
                        <div className="w-full bg-slate-200 h-1.5 mt-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(loom.sareesCompleted / loom.targetSarees) * 100}%`}} />
                        </div>
                      )}
                      <div className="text-xs text-stone-500 mt-1">
                        {loom.sareesCompleted} / {loom.targetSarees} Sarees
                      </div>
                  </div>

                  <div className="flex items-center justify-between px-1">
                      <div className="text-xs font-semibold text-slate-500">Maintenance Status:</div>
                      <div className={`text-xs font-bold ${loom.maintenanceStatus === 'Healthy' ? 'text-emerald-600' : loom.maintenanceStatus === 'Needs Maintenance' ? 'text-amber-600' : 'text-rose-600'}`}>
                        {loom.maintenanceStatus || 'Healthy'}
                      </div>
                  </div>
                </div>

                {/* Manual Controls */}
                <div className="border-t border-slate-100 pt-4 mt-auto">
                   {loom.status === 'QC' && (
                      <div className="mb-3 bg-indigo-50 border border-indigo-100 p-3 rounded-xl">
                         <div className="text-[10px] font-bold text-indigo-700 uppercase mb-2 animate-pulse flex items-center gap-1">
                            <AlertTriangle size={12} /> Quality Control Check Required
                         </div>
                         <div className="flex gap-2">
                            <button 
                               onClick={() => setQcLoomId(loom.id)}
                               className="flex-1 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition flex justify-center items-center gap-1 shadow-xs"
                            >
                               Inspect & Dispatch
                            </button>
                            <button 
                               onClick={() => updateLoomState(loom.id, { status: 'WEAVING' })}
                               className="py-1.5 px-3 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition"
                            >
                               Rework
                            </button>
                         </div>
                      </div>
                   )}

                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase block">Manual Override & Pipeline Control:</label>
                      <select 
                         className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
                         value={loom.status}
                         onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'ACTION_PAUSE') {
                               handleTriggerEvent(loom.id, 'PRODUCTION', 'Production Paused', `Manager manually paused ${loom.id}`, 'Delay added', loom.maintenanceStatus, 'IDLE');
                            } else if (val === 'ACTION_RESUME') {
                               handleTriggerEvent(loom.id, 'PRODUCTION', 'Production Resumed', `Manager manually resumed ${loom.id}`, 'Production active', loom.maintenanceStatus, loom.currentDesignId ? 'WEAVING' : 'IDLE');
                            } else if (val === 'ACTION_FIX') {
                               handleTriggerEvent(loom.id, 'MAINTENANCE', 'Maintenance Logged', `Routine maintenance completed on ${loom.id}.`, 'Health restored', 'Healthy', loom.status === 'MAINTENANCE' ? 'IDLE' : loom.status);
                            } else if (val === 'ACTION_ABSENT') {
                               handleTriggerEvent(loom.id, 'PRODUCTION', 'Weaver Absent', `Weaver ${loom.weaverName} marked absent for the day.`, 'Output delayed', loom.maintenanceStatus, 'IDLE');
                            } else {
                               updateLoomState(loom.id, { status: val });
                            }
                         }}
                      >
                         <optgroup label="Physical Setup Pipeline">
                            <option value="SETUP_JACQUARD">SETUP: Jacquard Card Punching (Days 15-11)</option>
                            <option value="SETUP_SILK_PREP">SETUP: Silk Dyeing & Winding (Days 10-7)</option>
                            <option value="SETUP_WARP_DRAW">SETUP: Warp Drawing-in (Days 6-3)</option>
                            <option value="SETUP_CALIBRATION">SETUP: Loom Calibration (Days 2-0)</option>
                         </optgroup>
                         <optgroup label="Production & Quality">
                            <option value="IDLE">IDLE (Awaiting Job)</option>
                            <option value="WEAVING">WEAVING (Active Production)</option>
                            <option value="QC">QC (Quality Inspection & Dispatch)</option>
                         </optgroup>
                         <optgroup label="Maintenance & Actions">
                            <option value="MAINTENANCE">MAINTENANCE (Report Failure / Repair)</option>
                            <option value="ACTION_FIX">🛠️ Fix / Log Maintenance Completed</option>
                            {loom.status === 'WEAVING' || loom.status.startsWith('SETUP') ? (
                               <option value="ACTION_PAUSE">⏸️ Pause Production</option>
                            ) : (
                               <option value="ACTION_RESUME">▶️ Resume Production</option>
                            )}
                            <option value="ACTION_ABSENT">👤 Mark Weaver Absent</option>
                         </optgroup>
                      </select>
                   </div>
                </div>
            </div>
          ))}
      </div>

      {/* QC Parameter Popup Modal */}
      {qcLoomId && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                 <h3 className="font-bold text-slate-800">Quality Control Inspection</h3>
                 <button onClick={() => setQcLoomId(null)} className="text-stone-400 hover:text-slate-700">✕</button>
              </div>
              <div className="p-6 space-y-4">
                 <div>
                    <label className="text-xs font-bold text-slate-600 uppercase mb-1.5 block">Zari Fastness</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                       <option>Pass (Grade A)</option>
                       <option>Pass (Grade B)</option>
                       <option>Fail</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-600 uppercase mb-1.5 block">Thread Count Verification</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                       <option>Optimal</option>
                       <option>Acceptable Variance</option>
                       <option>Rejected</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-600 uppercase mb-1.5 block">Inspector Notes</label>
                    <textarea className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" rows={2} placeholder="Optional notes..."></textarea>
                 </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                 <button onClick={() => setQcLoomId(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800">Cancel</button>
                 <button 
                    onClick={() => {
                       const { registerDispatchTransaction } = useSimulationStore.getState();
                       if (registerDispatchTransaction) registerDispatchTransaction(qcLoomId);
                       updateLoomState(qcLoomId, { status: 'IDLE', sareesCompleted: 0, currentDesignId: null });
                       setQcLoomId(null);
                    }} 
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2"
                 >
                    Complete Order & Log
                 </button>
              </div>
           </div>
        </div>
      )}

      {isDesignIntakeOpen && (
        <DesignIntakeForm onClose={() => setIsDesignIntakeOpen(false)} />
      )}
    </div>
  );
}

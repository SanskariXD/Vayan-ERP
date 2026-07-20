'use client';

import { useState } from 'react';
import { useSimulationStore } from '@/lib/store';
import { Plus, Play, Pause, AlertTriangle, AlertCircle, Wrench } from 'lucide-react';
import { DesignIntakeForm } from '@/components/operations/DesignIntakeForm';

export default function LoomManagementTab() {
  const { state, isLoaded, updateLoomState, triggerManualEvent } = useSimulationStore();
  const [isDesignIntakeOpen, setIsDesignIntakeOpen] = useState(false);

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
                  <div className="text-[10px] font-bold text-stone-400 uppercase mb-3">Manual Override Console</div>
                  <div className="grid grid-cols-2 gap-2">
                      {loom.status === 'WEAVING' || loom.status === 'WARP_SETUP' ? (
                        <button 
                            onClick={() => handleTriggerEvent(loom.id, 'PRODUCTION', 'Production Paused', `Manager manually paused ${loom.id}`, 'Delay added', loom.maintenanceStatus, 'IDLE')}
                            className="py-1.5 flex justify-center items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition"
                        >
                            <Pause size={12} /> Pause
                        </button>
                      ) : (
                        <button 
                            onClick={() => handleTriggerEvent(loom.id, 'PRODUCTION', 'Production Resumed', `Manager manually resumed ${loom.id}`, 'Production active', loom.maintenanceStatus, loom.currentDesignId ? 'WEAVING' : 'IDLE')}
                            className="py-1.5 flex justify-center items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                        >
                            <Play size={12} /> Resume
                        </button>
                      )}

                      <button 
                        onClick={() => handleTriggerEvent(loom.id, 'MAINTENANCE', 'Reported Mechanical Failure', `Manager reported a mechanical failure on ${loom.id}.`, 'Production stopped', 'Under Repair', 'MAINTENANCE')}
                        className="py-1.5 flex justify-center items-center gap-1.5 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition"
                      >
                        <AlertTriangle size={12} /> Report Failure
                      </button>

                      <button 
                        onClick={() => handleTriggerEvent(loom.id, 'MAINTENANCE', 'Maintenance Logged', `Routine maintenance completed on ${loom.id}.`, 'Health restored', 'Healthy', loom.status === 'MAINTENANCE' ? 'IDLE' : loom.status)}
                        className="py-1.5 flex justify-center items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                      >
                        <Wrench size={12} /> Fix / Maint.
                      </button>
                      
                      <button 
                        onClick={() => handleTriggerEvent(loom.id, 'PRODUCTION', 'Weaver Absent', `Weaver ${loom.weaverName} marked absent for the day.`, 'Output delayed', loom.maintenanceStatus, 'IDLE')}
                        className="py-1.5 flex justify-center items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
                      >
                        <AlertCircle size={12} /> Mark Absent
                      </button>
                  </div>
                </div>
            </div>
          ))}
      </div>

      {isDesignIntakeOpen && (
        <DesignIntakeForm onClose={() => setIsDesignIntakeOpen(false)} />
      )}
    </div>
  );
}

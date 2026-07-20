'use client';

import { useEffect, useState } from 'react';
import { useSimulationStore } from '@/lib/store';
import Link from 'next/link';
import {
  Activity, AlertTriangle, TrendingUp, Users, Wallet, CheckCircle2,
  Clock, Package, FastForward, RotateCcw, Calendar, History,
  ChevronRight, ChevronDown, Loader2, Wrench, ArrowRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PRIORITY_STYLES: Record<string, { badge: string }> = {
  high: { badge: 'bg-rose-100 text-rose-700' },
  medium: { badge: 'bg-amber-100 text-amber-700' },
  low: { badge: 'bg-emerald-100 text-emerald-700' },
};

const STATUS_LABELS: Record<string, string> = {
  WEAVING: 'Active',
  WARP_SETUP: 'Setup',
  IDLE: 'Idle',
  MAINTENANCE: 'Maintenance',
};

const STATUS_DOT: Record<string, string> = {
  WEAVING: 'bg-emerald-500',
  WARP_SETUP: 'bg-amber-500',
  IDLE: 'bg-slate-400',
  MAINTENANCE: 'bg-rose-500',
};

const EVENT_ICONS: Record<string, any> = {
  PRODUCTION: Package,
  MARKET: TrendingUp,
  FINANCE: Wallet,
  INVENTORY: Package,
  SYSTEM: Activity,
  MAINTENANCE: Wrench,
  ORDERS: CheckCircle2
};

const EVENT_COLORS: Record<string, string> = {
  PRODUCTION: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  MARKET: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  FINANCE: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  INVENTORY: 'text-amber-600 bg-amber-50 border-amber-100',
  SYSTEM: 'text-slate-600 bg-slate-50 border-slate-100',
  MAINTENANCE: 'text-rose-600 bg-rose-50 border-rose-100',
  ORDERS: 'text-indigo-600 bg-indigo-50 border-indigo-100'
};

export default function CooperativeDashboard() {
  const { state, isLoaded, initialize, advanceTime, resetSimulation } = useSimulationStore();
  const [simulationProgress, setSimulationProgress] = useState<{ current: number, total: number } | null>(null);
  const [expandedLoom, setExpandedLoom] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const runSimulationSequence = async (days: number) => {
    setSimulationProgress({ current: 0, total: days });
    for (let i = 1; i <= days; i++) {
       advanceTime(1);
       setSimulationProgress({ current: i, total: days });
       await new Promise(r => setTimeout(r, 100)); // 100ms per day
    }
    setSimulationProgress(null);
  };

  if (!isLoaded || !state) {
    return <div className="min-h-screen bg-[#F9F6F0] p-10 font-sans flex items-center justify-center text-slate-500">Loading Enterprise Data...</div>;
  }

  const { looms, designs, financeStats, alerts: systemAlerts, cooperative, eventLog } = state;

  const kpis = {
    weaving: looms.filter((l: any) => l.status === 'WEAVING').length,
    warpSetup: looms.filter((l: any) => l.status === 'WARP_SETUP').length,
    idle: looms.filter((l: any) => l.status === 'IDLE').length,
    maintenance: looms.filter((l: any) => l.status === 'MAINTENANCE').length,
    critical: looms.filter((l: any) => (l.setupDaysRemaining || ((l.targetSarees - l.sareesCompleted) * l.averageSareeDays)) <= 6 && l.status === 'WEAVING').length,
    activeWeavers: looms.filter((l: any) => l.status === 'WEAVING' || l.status === 'WARP_SETUP').length,
    utilization: Math.round(((looms.filter((l: any) => l.status === 'WEAVING' || l.status === 'WARP_SETUP').length) / looms.length) * 100) || 0,
    workingCapital: financeStats?.workingCapital || 0,
  };

  const alerts = [...systemAlerts.map((a: string) => ({ priority: 'medium' as const, type: 'Inventory Alert', loom: 'SYS', action: a, deadline: 'ASAP' }))];
  looms.forEach((loom: any) => {
    if (loom.status === 'WEAVING' && loom.daysRemaining <= 6) {
      alerts.push({ priority: 'high', type: 'Pre-warp Required', loom: loom.id.toUpperCase(), action: 'Prepare next warp', deadline: `${loom.daysRemaining} days` });
    }
    if (loom.status === 'IDLE') {
      alerts.push({ priority: 'high', type: 'Idle Loom', loom: loom.id.toUpperCase(), action: 'Assign Design', deadline: 'Immediate' });
    }
    if (loom.status === 'MAINTENANCE') {
      alerts.push({ priority: 'high', type: 'Loom Breakdown', loom: loom.id.toUpperCase(), action: 'Schedule Repair', deadline: 'Immediate' });
    }
  });

  const overallRisk = kpis.critical >= 3 || kpis.maintenance > 0 ? 'High' : kpis.critical >= 1 ? 'Medium' : 'Low';
  const riskStyle = overallRisk === 'High' ? 'text-rose-700 bg-rose-50 border-rose-200' :
    overallRisk === 'Medium' ? 'text-amber-700 bg-amber-50 border-amber-200' :
    'text-emerald-700 bg-emerald-50 border-emerald-200';
  
  let riskReason = 'All looms operating safely.';
  if (kpis.maintenance > 0) riskReason = `${kpis.maintenance} loom(s) broken down.`;
  else if (overallRisk === 'High') riskReason = `${kpis.critical} looms have less than 6 days remaining. Immediate action required.`;
  else if (overallRisk === 'Medium') riskReason = `${kpis.critical} loom approaching warp end. Monitor closely.`;

  return (
    <div className="min-h-screen bg-[#F9F6F0] p-6 md:p-8 font-sans">
      {/* ─── Header ─── */}
      <div className="mb-8 animate-fade-in flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl tracking-tight font-bold text-slate-800 mb-1">Operations Dashboard</h1>
          <p className="text-stone-500 text-sm">Enterprise Operations · Live Manufacturing Data</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-700 font-semibold px-3 flex items-center gap-2 border-r border-slate-200 mr-1">
            <Calendar className="w-4 h-4 text-indigo-500" />
            {cooperative.currentSimulatedDate}
          </div>
          <button 
             onClick={() => runSimulationSequence(1)}
             disabled={!!simulationProgress}
             className="px-3 py-1.5 hover:bg-slate-100 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-md transition"
          >
             +1 Day
          </button>
          <button 
             onClick={() => runSimulationSequence(7)}
             disabled={!!simulationProgress}
             className="px-3 py-1.5 hover:bg-slate-100 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-md transition"
          >
             +7 Days
          </button>
          <button 
             onClick={() => runSimulationSequence(30)}
             disabled={!!simulationProgress}
             className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-1.5 text-xs font-semibold rounded-md shadow-sm transition min-w-[100px] justify-center"
          >
             {simulationProgress ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Day {simulationProgress.current}/{simulationProgress.total}</>
             ) : (
                <><FastForward className="w-3.5 h-3.5" /> +30 Days</>
             )}
          </button>
        </div>
      </div>

      {/* ─── Top: KPIs ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 animate-slide-up-delay-1">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 mb-3">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Active Looms</span>
          </div>
          <div className="text-3xl font-light text-slate-800">{kpis.weaving}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-3">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Warp Batches</span>
          </div>
          <div className="text-3xl font-light text-slate-800">{kpis.warpSetup}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 mb-3">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Utilization</span>
          </div>
          <div className="text-3xl font-light text-slate-800">{kpis.utilization}%</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600 mb-3">
            <Users className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Weavers Active</span>
          </div>
          <div className="text-3xl font-light text-slate-800">{kpis.activeWeavers}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 mb-3">
            <Wallet className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Working Capital</span>
          </div>
          <div className={`text-2xl font-light ${kpis.workingCapital < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            ₹{(kpis.workingCapital / 100000).toFixed(2)}L
          </div>
        </div>
        <div className={`rounded-xl p-4 border shadow-sm ${riskStyle}`}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Operational Risk</span>
          </div>
          <div className="text-2xl font-semibold">{overallRisk}</div>
          <div className="text-[10px] mt-1 opacity-80 line-clamp-2">{riskReason}</div>
        </div>
      </div>

      {/* ─── Middle: Action Center ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-slide-up-delay-2">
        {/* Alerts */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-[360px] flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span className="font-semibold text-slate-800 text-sm">Actionable Alerts</span>
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">{alerts.length}</span>
          </div>
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {alerts.length === 0 && (
              <div className="p-5 flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">No active alerts. All nominal.</span>
              </div>
            )}
            {alerts.map((alert, i) => (
              <div key={i} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${PRIORITY_STYLES[alert.priority].badge}`}>
                    {alert.priority}
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">{alert.deadline}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">{alert.type}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5 font-mono">Loom: {alert.loom}</div>
                  </div>
                  <div className="text-right">
                    {alert.action === 'Prepare next warp' || alert.action === 'Assign Design' ? (
                       <Link href="/cooperative/scheduling" className="text-xs text-indigo-600 font-semibold hover:underline flex items-center justify-end gap-1">{alert.action} <ArrowRight className="w-3 h-3"/></Link>
                    ) : (
                       <div className="text-xs text-indigo-600 font-semibold">{alert.action}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Factory Timeline */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-[360px] flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500" />
              <span className="font-semibold text-slate-800 text-sm">Factory Timeline</span>
            </div>
          </div>
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {eventLog && eventLog.length > 0 ? (
              eventLog.slice(0, 10).map((evt: any, i: number) => {
                const Icon = EVENT_ICONS[evt.type] || Activity;
                const colorClass = EVENT_COLORS[evt.type] || EVENT_COLORS.SYSTEM;
                
                return (
                  <div key={evt.id || i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {i !== eventLog.slice(0, 10).length - 1 && (
                        <div className="w-px h-full bg-slate-100 my-1"></div>
                      )}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-800">{evt.title}</span>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{evt.type}</span>
                        <span className="text-[10px] text-stone-400 ml-auto font-medium">{evt.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-1.5">{evt.description}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                <Activity className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">No events recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-[360px] flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold text-slate-800 text-sm">Today's Tasks</span>
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
             <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition cursor-pointer">
                <input type="checkbox" className="mt-1 rounded text-emerald-500 border-slate-300" />
                <div>
                   <div className="text-sm font-semibold text-slate-700">Approve Pending Warp</div>
                   <div className="text-xs text-stone-500 mt-1">Design 002 needs warp preparation on LOOM-03.</div>
                </div>
             </div>
             <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition cursor-pointer">
                <input type="checkbox" className="mt-1 rounded text-emerald-500 border-slate-300" />
                <div>
                   <div className="text-sm font-semibold text-slate-700">Process Wage Payouts</div>
                   <div className="text-xs text-stone-500 mt-1">3 weavers have pending payouts exceeding ₹15,000.</div>
                </div>
             </div>
             <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition cursor-pointer">
                <input type="checkbox" className="mt-1 rounded text-emerald-500 border-slate-300" />
                <div>
                   <div className="text-sm font-semibold text-slate-700">Verify Zari Inventory</div>
                   <div className="text-xs text-stone-500 mt-1">Stock count is below minimum safety threshold.</div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom: Working Capital Trend ─── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-8 animate-slide-up-delay-2">
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
               <TrendingUp className="w-4 h-4 text-indigo-500" /> Working Capital Trend (Last 30 Days)
            </h2>
         </div>
         <div className="h-64">
            {state.dailySnapshots && state.dailySnapshots.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={state.dailySnapshots}>
                     <defs>
                        <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                     <XAxis 
                        dataKey="date" 
                        tick={{fontSize: 10, fill: '#64748b'}} 
                        axisLine={false} 
                        tickLine={false}
                        tickFormatter={(str) => {
                           const parts = str.split('-');
                           return parts.length === 3 ? `${parts[2]}/${parts[1]}` : str;
                        }}
                     />
                     <YAxis 
                        tick={{fontSize: 10, fill: '#64748b'}} 
                        axisLine={false} 
                        tickLine={false}
                        tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                     />
                     <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(val: any) => [`₹${Number(val || 0).toLocaleString('en-IN')}`, 'Capital']}
                     />
                     <Area type="monotone" dataKey="workingCapital" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCapital)" />
                  </AreaChart>
               </ResponsiveContainer>
            ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <Activity className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">Historical data not available.</p>
               </div>
            )}
         </div>
      </div>

      {/* ─── Bottom: Full Loom Operations Table ─── */}
      <div className="animate-slide-up-delay-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-800">Loom Operations Control</h2>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
          <div className="min-w-[1000px]">
            <div className="grid grid-cols-[100px_2fr_1.5fr_1fr_1fr_120px] gap-3 px-6 py-4 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
              <div>Loom ID</div>
              <div>Design & Weaver</div>
              <div>Progress</div>
              <div>Days Left</div>
              <div>Status</div>
              <div className="text-right">Next Action</div>
            </div>

            <div className="divide-y divide-slate-50">
              {looms.map((loom: any) => {
                const design = designs.find((d: any) => d.id === loom.currentDesignId);
                const isExpanded = expandedLoom === loom.id;
                
                return (
                  <div key={loom.id} className="transition-colors hover:bg-slate-50/50">
                     <div className="grid grid-cols-[100px_2fr_1.5fr_1fr_1fr_120px] gap-3 px-6 py-4 items-center">
                       <div>
                         <div className="font-mono text-sm font-bold text-slate-800">{loom.id.toUpperCase()}</div>
                       </div>

                       <div>
                         {design ? (
                           <>
                             <div className="text-sm font-semibold text-slate-800 truncate">{design.name}</div>
                             <div className="text-[11px] text-stone-500 mt-0.5">{loom.weaverId || 'Unassigned'}</div>
                           </>
                         ) : (
                           <span className="text-sm text-stone-400 italic">No Active Design</span>
                         )}
                       </div>

                       <div>
                         {loom.status === 'WEAVING' ? (
                           <div>
                             <div className="text-xs font-semibold text-slate-700">{loom.sareesCompleted}/{loom.targetSarees} Sarees</div>
                             <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                               <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(loom.sareesCompleted / loom.targetSarees) * 100}%` }} />
                             </div>
                           </div>
                         ) : (
                           <span className="text-xs text-stone-400 font-medium">{STATUS_LABELS[loom.status]}</span>
                         )}
                       </div>

                       <div>
                         {loom.status === 'WEAVING' ? (
                           <div className={`text-sm font-semibold ${loom.daysRemaining <= 6 ? 'text-rose-600' : 'text-slate-700'}`}>
                             {loom.daysRemaining} days
                           </div>
                         ) : loom.status === 'WARP_SETUP' ? (
                           <div className="text-sm font-semibold text-amber-600">{loom.setupDaysRemaining} days</div>
                         ) : (
                           <span className="text-sm text-stone-400">—</span>
                         )}
                       </div>

                       <div className="flex items-center gap-2">
                         <span className={`relative inline-flex rounded-full h-2 w-2 ${STATUS_DOT[loom.status]}`}></span>
                         <span className="text-xs font-medium text-slate-700">{STATUS_LABELS[loom.status]}</span>
                       </div>

                       <div className="flex justify-end">
                         <button 
                           onClick={() => setExpandedLoom(isExpanded ? null : loom.id)}
                           className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                         >
                           {isExpanded ? 'Close' : 'View Details'} <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                         </button>
                       </div>
                     </div>

                     {/* Expanded Row Details */}
                     {isExpanded && (
                       <div className="bg-slate-50 border-t border-slate-100 px-6 py-5 grid grid-cols-1 lg:grid-cols-3 gap-6 shadow-inner">
                          <div className="space-y-4">
                             <div>
                                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Recommended Next Action</div>
                                <div className="text-sm font-bold text-slate-800 bg-white p-3 rounded-lg border border-slate-200">
                                   {loom.currentRecommendation || 'Continue Current Operations'}
                                </div>
                             </div>
                             <div>
                                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Why this action?</div>
                                <div className="text-xs text-slate-600 leading-relaxed">
                                   {loom.recommendationBreakdown || 'Standard operational procedure based on current warp completion state.'}
                                </div>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <div>
                                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Remaining Warp</div>
                                <div className="text-sm font-semibold text-slate-800">{Math.max(0, loom.targetSarees - loom.sareesCompleted)} Sarees</div>
                             </div>
                             <div>
                                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Material Status</div>
                                <div className="text-sm font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Fully Allocated</div>
                             </div>
                             <div>
                                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Required Materials (Next batch)</div>
                                <div className="text-xs font-medium text-slate-600">Silk: 4.8kg, Gold Zari: 1.2kg</div>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <div>
                                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Upcoming Order Assigned</div>
                                <div className="text-sm font-semibold text-slate-800">Wedding Collection - Order #1042</div>
                             </div>
                             <div>
                                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Estimated Completion</div>
                                <div className="text-sm font-semibold text-indigo-600">{loom.daysRemaining} Days</div>
                             </div>
                             <div>
                                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Expected Revenue</div>
                                <div className="text-sm font-bold text-emerald-600">₹{(loom.targetSarees * (design?.expectedSellingPrice || 25000)).toLocaleString('en-IN')}</div>
                             </div>
                          </div>
                       </div>
                     )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

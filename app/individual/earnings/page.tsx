'use client';

import { useEffect } from 'react';
import { useSimulationStore, useArtisanStore } from '@/lib/store';
import { Wallet, TrendingUp, IndianRupee, ArrowDownLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function IndividualEarningsPage() {
  const { state, isLoaded, initialize } = useSimulationStore();
  const artisanState = useArtisanStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isLoaded || !state || !artisanState) return null;

  const { artisanLedger } = artisanState;

  const totalEarned = artisanLedger
    .filter((l: any) => l.type === 'WAGE_PAYOUT')
    .reduce((sum: number, l: any) => sum + Math.abs(l.amount), 0);

  const pendingWages = state.weavers.find((w: any) => w.id === 'weaver-01')?.accruedWages || 0;

  // Group by date for a simple chart
  const last30Days = state.dailySnapshots.slice(-30).map((snap: any) => {
     // find payouts on this date
     const payoutOnDate = artisanLedger.find((l: any) => l.type === 'WAGE_PAYOUT' && l.date === snap.date);
     return {
        date: snap.date,
        amount: payoutOnDate ? Math.abs(payoutOnDate.amount) : 0
     };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-1">
           <Wallet className="w-5 h-5 text-indigo-600" />
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Earnings</h1>
        </div>
        <p className="text-stone-500 text-sm">Financial Overview & History</p>
      </div>

      <div className="grid grid-cols-2 gap-4 animate-slide-up-delay-1">
         <div className="bg-indigo-600 text-white p-5 rounded-2xl shadow-sm border border-indigo-700 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4 opacity-80">
               <TrendingUp size={16} />
               <span className="text-[10px] font-bold uppercase tracking-widest">Total Earned</span>
            </div>
            <div className="text-2xl font-bold tracking-tight">₹{totalEarned.toLocaleString('en-IN')}</div>
         </div>
         <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4 text-emerald-600">
               <IndianRupee size={16} />
               <span className="text-[10px] font-bold uppercase tracking-widest">Pending Payout</span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-800">₹{pendingWages.toLocaleString('en-IN')}</div>
         </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-slide-up-delay-2">
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
               Earning Velocity (30 Days)
            </h2>
         </div>
         <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={last30Days}>
                  <defs>
                     <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
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
                  <Tooltip 
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                     formatter={(val: any) => [`₹${Number(val || 0).toLocaleString('en-IN')}`, 'Earned']}
                     labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEarnings)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Earnings Forecast Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-slide-up-delay-2">
         <div className="flex items-center gap-2 mb-4">
            <Wallet size={16} className="text-emerald-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Earnings Forecast</h2>
         </div>

         <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
               <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Current Month</div>
               <div className="text-lg font-bold text-slate-800">₹{(totalEarned || 22400).toLocaleString('en-IN')}</div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
               <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Projected Month End</div>
               <div className="text-lg font-bold text-emerald-600">₹{((totalEarned || 22400) + 9400).toLocaleString('en-IN')}</div>
            </div>
         </div>

         <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed font-medium">
            <strong>Reason:</strong> Wedding production assignments increase workload by 8 sarees before month end.
         </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-slide-up-delay-2">
         <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <span className="font-semibold text-slate-800 text-sm">Ledger History</span>
         </div>
         <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {artisanLedger.length > 0 ? artisanLedger.map((tx: any, index: number) => (
               <div key={index} className="p-4 hover:bg-slate-50 transition flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'WAGE_PAYOUT' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                        {tx.type === 'WAGE_PAYOUT' ? <ArrowDownLeft size={16} /> : <CheckCircle2 size={16} />}
                     </div>
                     <div>
                        <div className="text-sm font-semibold text-slate-800 leading-none mb-1">{tx.description}</div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{tx.date}</div>
                     </div>
                  </div>
                  <div className="text-right shrink-0">
                     <div className={`text-sm font-bold ${tx.type === 'WAGE_PAYOUT' ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {tx.type === 'WAGE_PAYOUT' ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                     </div>
                     <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{tx.type.replace('_', ' ')}</div>
                  </div>
               </div>
            )) : (
               <div className="p-6 text-center text-xs text-slate-500 italic">No ledger entries available.</div>
            )}
         </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useSimulationStore, useArtisanStore } from '@/lib/store';
import { Wallet, TrendingUp, IndianRupee, ArrowDownLeft, ArrowUpRight, CheckCircle2, Sparkles, DollarSign, Package } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function IndividualEarningsPage() {
  const { state, isLoaded, initialize } = useSimulationStore();
  const artisanState = useArtisanStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isLoaded || !state || !artisanState) return null;

  const { currentLoom } = artisanState;

  // Filter personal sales and material purchase entries
  const personalLedger = (state.transactions || []).filter((t: any) => 
     t.type === 'Income' || t.category === 'Material Purchase' || t.description.includes(currentLoom.id)
  );

  const totalSalesRevenue = personalLedger
    .filter((t: any) => t.type === 'Income')
    .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) || 144000;

  const totalMaterialCosts = personalLedger
    .filter((t: any) => t.type === 'Expense' && t.category === 'Material Purchase')
    .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) || 48000;

  const profitRealized = Math.max(0, totalSalesRevenue - totalMaterialCosts);
  const totalSareesSold = 12;
  const avgProfitPerSaree = Math.round(profitRealized / totalSareesSold);

  // Daily profit chart
  const last30Days = state.dailySnapshots.slice(-30).map((snap: any) => {
     return {
        date: snap.date,
        amount: Math.round(profitRealized / 30)
     };
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
           <Wallet className="w-5 h-5 text-indigo-600" />
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Business & Profits</h1>
        </div>
        <p className="text-stone-500 text-sm">Standalone Enterprise Ledger & Margins</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 animate-slide-up-delay-1">
         <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white p-5 rounded-2xl shadow-md border border-indigo-800 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3 opacity-90">
               <TrendingUp size={16} className="text-emerald-400" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Profit Realized</span>
            </div>
            <div className="text-2xl font-bold tracking-tight">₹{profitRealized.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-indigo-200 font-medium mt-1">Sales Revenue - Materials</div>
         </div>

         <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3 text-emerald-600">
               <Sparkles size={16} />
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Avg Profit / Saree</span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">₹{avgProfitPerSaree.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-stone-400 font-medium mt-1">₹12,000 price - ₹4,000 cost</div>
         </div>
      </div>

      {/* Revenue vs Cost Breakdown */}
      <div className="grid grid-cols-2 gap-4 animate-slide-up-delay-1">
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
               <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Gross Sales Revenue</div>
               <div className="text-base font-bold text-slate-800">₹{totalSalesRevenue.toLocaleString('en-IN')}</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">IN</div>
         </div>

         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
               <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Production Costs</div>
               <div className="text-base font-bold text-rose-600">₹{totalMaterialCosts.toLocaleString('en-IN')}</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">OUT</div>
         </div>
      </div>

      {/* Earning Velocity Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-slide-up-delay-2">
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
               Profit Velocity Trend
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
                     formatter={(val: any) => [`₹${Number(val || 0).toLocaleString('en-IN')}`, 'Net Profit']}
                     labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEarnings)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Personal Ledger History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-slide-up-delay-2">
         <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <span className="font-bold text-slate-800 text-sm">Personal Business Ledger</span>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Solo Artisan</span>
         </div>
         <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {personalLedger.length > 0 ? personalLedger.map((tx: any, index: number) => (
               <div key={index} className="p-4 hover:bg-slate-50 transition flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'Income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {tx.type === 'Income' ? <ArrowDownLeft size={16} /> : <Package size={16} />}
                     </div>
                     <div>
                        <div className="text-xs font-bold text-slate-800 leading-tight mb-0.5">
                           {tx.type === 'Income' ? tx.description.replace(/^Wage Payout:\s*/i, 'Direct Market Sale: ') : tx.description}
                        </div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{tx.date}</div>
                     </div>
                  </div>
                  <div className="text-right shrink-0">
                     <div className={`text-xs font-bold ${tx.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.type === 'Income' ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                     </div>
                     <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        {tx.type === 'Income' ? 'Market Revenue' : 'Material Expense'}
                     </div>
                  </div>
               </div>
            )) : (
               <div className="p-6 text-center text-xs text-slate-500 italic">No personal transactions recorded.</div>
            )}
         </div>
      </div>
    </div>
  );
}

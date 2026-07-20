'use client';

import { useEffect, useMemo } from 'react';
import { useSimulationStore } from '@/lib/store';
import {
  Wallet, TrendingUp, TrendingDown, Activity, ArrowUpRight, ArrowDownRight,
  Package, CreditCard, Users, BrainCircuit, Clock
} from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  Income: 'text-emerald-700 bg-emerald-50',
  Expense: 'text-rose-700 bg-rose-50'
};

export default function FinancePage() {
  const { state, isLoaded, initialize } = useSimulationStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isLoaded || !state) return null;

  const { transactions, financeStats } = state;

  const totalRevenue = financeStats?.totalIncome || 0;
  const totalExpenses = financeStats?.totalExpense || 0;
  const netProfit = financeStats?.profit || 0;
  const workingCapital = financeStats?.cashFlow || 0;
  const pendingReceivables = financeStats?.pendingReceivables || 0;

  const wages = transactions.filter((t: any) => t.category === 'Wage Payout').reduce((s: number, t: any) => s + Math.abs(t.amount), 0);
  const materials = transactions.filter((t: any) => t.category.includes('Material')).reduce((s: number, t: any) => s + Math.abs(t.amount), 0);

  // Simple simulated months (Current month + previous static)
  const monthlyData = [
    { month: 'May', revenue: 340000, expenses: 210000 },
    { month: 'Jun', revenue: 462000, expenses: 278000 },
    { month: 'Jul', revenue: totalRevenue, expenses: totalExpenses },
  ];

  const maxVal = Math.max(...monthlyData.map(d => Math.max(d.revenue, d.expenses)));

  return (
    <div className="min-h-screen bg-[#F9F6F0] p-6 md:p-8 font-sans">
      <div className="mb-8 animate-fade-in flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">Finance & Forecasts</h1>
          <p className="text-stone-500 text-sm">Enterprise Resource Planning · Live Financial Ledger</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 animate-slide-up-delay-1">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 mb-3">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Revenue</span>
          </div>
          <div className="text-2xl font-light text-slate-800">
            ₹{(totalRevenue / 100000).toFixed(2)}L
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-rose-500 mb-3">
            <TrendingDown className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Expenses</span>
          </div>
          <div className="text-2xl font-light text-slate-800">
            ₹{(totalExpenses / 100000).toFixed(2)}L
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 mb-3">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Net Profit</span>
          </div>
          <div className={`text-2xl font-light ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {netProfit >= 0 ? '+' : ''}₹{(netProfit / 100000).toFixed(2)}L
          </div>
        </div>

        <div className={`p-5 rounded-xl border shadow-sm ${workingCapital >= 0 ? 'bg-indigo-600 border-indigo-500' : 'bg-rose-600 border-rose-500'}`}>
          <div className="flex items-center gap-2 text-indigo-200 mb-3">
            <Wallet className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Working Capital</span>
          </div>
          <div className="text-2xl font-light text-white">
            ₹{(workingCapital / 100000).toFixed(2)}L
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-amber-500 mb-3">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Receivables</span>
          </div>
          <div className="text-2xl font-light text-slate-800">
            ₹{(pendingReceivables / 100000).toFixed(2)}L
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-rose-500 mb-3">
            <CreditCard className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Payables</span>
          </div>
          <div className="text-2xl font-light text-slate-800">
            ₹0.00L
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6 animate-slide-up-delay-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-slate-800 text-base">Revenue vs Expenses</h2>
              <p className="text-xs text-stone-400 mt-0.5">Last 3 months comparison</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-indigo-500 block" />Revenue</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-rose-300 block" />Expenses</div>
            </div>
          </div>
          <div className="flex items-end gap-6 h-48 px-4">
            {monthlyData.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-end gap-1 w-full justify-center" style={{ height: '160px' }}>
                  <div
                    className="flex-1 bg-indigo-500 rounded-t-md transition-all max-w-[36px]"
                    style={{ height: `${maxVal > 0 ? (m.revenue / maxVal) * 100 : 0}%` }}
                    title={`Revenue: ₹${(m.revenue / 100000).toFixed(2)}L`}
                  />
                  <div
                    className="flex-1 bg-rose-300 rounded-t-md transition-all max-w-[36px]"
                    style={{ height: `${maxVal > 0 ? (m.expenses / maxVal) * 100 : 0}%` }}
                    title={`Expenses: ₹${(m.expenses / 100000).toFixed(2)}L`}
                  />
                </div>
                <span className="text-xs font-medium text-stone-500">{m.month}</span>
                <span className="text-[10px] text-stone-400">₹{(m.revenue / 100000).toFixed(1)}L</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 animate-slide-up-delay-2">
          <h2 className="font-semibold text-slate-800 text-base mb-1">Monthly Profit</h2>
          <p className="text-xs text-stone-400 mb-6">Net profit trend</p>
          <div className="space-y-4">
            {monthlyData.map((m) => {
              const profit = m.revenue - m.expenses;
              const pct = m.revenue > 0 ? Math.min(100, Math.max(0, (profit / m.revenue) * 100)) : 0;
              return (
                <div key={m.month}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-700">{m.month} 2026</span>
                    <span className={`text-xs font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {profit >= 0 ? '+' : ''}₹{(profit / 100000).toFixed(2)}L
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${profit >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-stone-400 mt-1">Margin: {pct.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden animate-slide-up-delay-2">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 text-base">Operational Breakdown</h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: 'Worker Wages (Ledger)', icon: Users, amount: wages, type: 'expense' },
              { label: 'Materials Consumed', icon: Package, amount: materials, type: 'expense' },
              { label: 'Pending Receivables (Net-45)', icon: CreditCard, amount: pendingReceivables, type: 'pending' },
            ].map(({ label, icon: Icon, amount, type }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${type === 'expense' ? 'bg-rose-50' : 'bg-amber-50'}`}>
                    <Icon className={`w-4 h-4 ${type === 'expense' ? 'text-rose-500' : 'text-amber-500'}`} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </div>
                <span className={`text-sm font-bold ${type === 'expense' ? 'text-rose-600' : 'text-amber-600'}`}>
                  ₹{amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden animate-slide-up-delay-2">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 text-base">Live Ledger</h2>
            <p className="text-xs text-stone-400 mt-0.5">Recent transactions from ERP</p>
          </div>
          <div className="divide-y divide-slate-50 h-[300px] overflow-y-auto">
            {transactions.slice(0, 15).map((entry: any) => (
              <div key={entry.id} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition">
                <div className={`mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${TYPE_COLORS[entry.type] || 'bg-slate-100 text-slate-600'}`}>
                  {entry.type === 'Income' ? 'IN' : 'OUT'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-700 truncate">{entry.description}</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">{entry.date}</div>
                </div>
                <span className={`text-sm font-bold shrink-0 ${entry.amount > 0 && entry.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {entry.type === 'Income' ? '+' : '-'}₹{Math.abs(entry.amount).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

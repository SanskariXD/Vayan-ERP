'use client';

import { useState, useEffect } from 'react';
import { useSimulationStore } from '@/lib/store';
import { Network, Database, Grid, Palette, Box } from 'lucide-react';
import LoomManagementTab from '@/components/central-management/LoomManagement';
import DesignManagementTab from '@/components/central-management/DesignManagement';
import MaterialManagementTab from '@/components/central-management/MaterialManagement';

export default function CentralizedManagementPage() {
  const { initialize, isLoaded, state } = useSimulationStore();
  const [activeTab, setActiveTab] = useState<'looms' | 'designs' | 'materials'>('looms');

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isLoaded || !state) return null;

  return (
    <div className="bg-[#F9F6F0] min-h-screen p-6 md:p-10 font-sans">
      
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-semibold text-slate-800 mb-2 tracking-tight flex items-center gap-3">
          <Database className="text-indigo-600" /> Centralized Management
        </h1>
        <p className="text-stone-500 text-sm leading-relaxed max-w-2xl">
          The single source of truth for all operational master data. Managing looms, designs, inventory, and warps across the Vayan ERP.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('looms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-semibold transition ${
            activeTab === 'looms' ? 'text-indigo-700 bg-white border-t border-l border-r border-slate-200' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Grid size={16} /> Loom Management
        </button>
        <button
          onClick={() => setActiveTab('designs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-semibold transition ${
            activeTab === 'designs' ? 'text-indigo-700 bg-white border-t border-l border-r border-slate-200' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Palette size={16} /> Design Management
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-semibold transition ${
            activeTab === 'materials' ? 'text-indigo-700 bg-white border-t border-l border-r border-slate-200' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Box size={16} /> Silk & Material Management
        </button>
      </div>

      {/* Content */}
      <div className="animate-slide-up">
         {activeTab === 'looms' && <LoomManagementTab />}
         {activeTab === 'designs' && <DesignManagementTab />}
         {activeTab === 'materials' && <MaterialManagementTab />}
      </div>
    </div>
  );
}

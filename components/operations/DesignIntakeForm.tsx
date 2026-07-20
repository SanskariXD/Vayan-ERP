'use client';

import { useState } from 'react';
import { useCoopStore } from '@/lib/store';
import { X, Upload, Check } from 'lucide-react';
import type { SareeDesign } from '@/types';

interface DesignIntakeFormProps {
  onClose: () => void;
}

export function DesignIntakeForm({ onClose }: DesignIntakeFormProps) {
  const addDesign = useCoopStore(s => s.addDesign);

  const [formData, setFormData] = useState({
    name: '',
    bodyColor: '',
    zariDensity: 'Medium',
    complexityLevel: 3,
    region: 'Custom Entry'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newDesign: SareeDesign = {
      id: `design-custom-${Date.now()}`,
      name: formData.name,
      bodyColor: formData.bodyColor,
      zariDensity: formData.zariDensity as 'Low' | 'Medium' | 'High',
      complexityLevel: formData.complexityLevel as 1|2|3|4|5,
      region: formData.region,
      primaryMotif: 'Custom Motif',
      daysPerSaree: Math.max(3, formData.complexityLevel), // Estimate
      estimatedMarginPercent: 20 + (formData.complexityLevel * 5),
      requiresNewCards: true,
      // Generic placeholder image for newly ingested designs
      imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80',
      
      // New required properties
      setupDays: 5,
      expectedWeavingDays: Math.max(3, formData.complexityLevel),
      silkRequired: 0.5,
      zariRequired: 0.2,
      setupCost: 10000,
      expectedSellingPrice: 15000,
      category: 'Custom Entry'
    };

    addDesign(newDesign);
    onClose();
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex animate-slide-left">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#F9F6F0] h-full shadow-2xl border-l border-slate-200 flex flex-col p-8 overflow-y-auto">
         <button onClick={onClose} className="absolute top-6 right-6 p-2 text-stone-400 hover:text-slate-700 bg-white rounded-full shadow-sm">
            <X className="w-5 h-5" />
         </button>

         <div className="mb-10">
           <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
              <Upload className="w-5 h-5 text-indigo-600" />
           </div>
           <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Design Catalog Intake</h2>
           <p className="text-sm text-stone-500 mt-2">
             Register a new technical blueprint to the cooperative catalog for immediate floor deployment.
           </p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6 flex-1">
            <div className="space-y-1.5">
               <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Blueprint Title</label>
               <input 
                 required
                 type="text" 
                 placeholder="e.g., Kanjivaram Bridal Special"
                 value={formData.name}
                 onChange={e => setFormData({...formData, name: e.target.value})}
                 className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm font-medium text-slate-800"
               />
            </div>

            <div className="space-y-1.5">
               <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Base Body Shade</label>
               <input 
                 required
                 type="text" 
                 placeholder="e.g., Crimson Red"
                 value={formData.bodyColor}
                 onChange={e => setFormData({...formData, bodyColor: e.target.value})}
                 className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm font-medium text-slate-800"
               />
            </div>

            <div className="space-y-1.5">
               <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Zari Weight Profile</label>
               <select 
                 value={formData.zariDensity}
                 onChange={e => setFormData({...formData, zariDensity: e.target.value})}
                 className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-800 appearance-none"
               >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
               </select>
            </div>

            <div className="space-y-1.5">
               <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Complexity Scale (1-5)</label>
               <div className="flex gap-2">
                  {[1,2,3,4,5].map(num => (
                     <button
                       key={num}
                       type="button"
                       onClick={() => setFormData({...formData, complexityLevel: num})}
                       className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-colors border ${formData.complexityLevel === num ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                     >
                       {num}
                     </button>
                  ))}
               </div>
               <p className="text-[10px] text-stone-400 mt-2 text-right">L{formData.complexityLevel} calculates to approx. {Math.max(3, formData.complexityLevel)} days/saree.</p>
            </div>

            <div className="pt-8 mt-auto">
               <button 
                 type="submit"
                 className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold shadow-lg shadow-slate-900/10 transition-all"
               >
                  <Check className="w-5 h-5" /> Ingest Blueprint
               </button>
            </div>
         </form>
      </div>
    </div>
  );
}

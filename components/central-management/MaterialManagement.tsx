'use client';

import { useState } from 'react';
import { useCoopStore, useSimulationStore } from '@/lib/store';
import { Package, Layers, Plus, Truck, AlertCircle } from 'lucide-react';
import { NewMaterialModal, CreateWarpModal, NewPOModal } from './Modals';

export default function MaterialManagementTab() {
  const materials = useCoopStore((s: any) => s.materials) || [];
  const warps = useCoopStore((s: any) => s.warps) || [];
  const purchaseOrders = useCoopStore((s: any) => s.purchaseOrders) || [];
  const createProductionJob = useCoopStore((s: any) => s.createProductionJob);
  
  const [activeModal, setActiveModal] = useState<'material' | 'warp' | 'po' | null>(null);
  const [allocatingWarp, setAllocatingWarp] = useState<any | null>(null);
  const [warpSetupForm, setWarpSetupForm] = useState({
    warpLength: 100,
    primaryColor: 'Royal Crimson',
    silkType: 'Mulberry Silk Grade A',
    estimatedSarees: 12
  });

  return (
    <div className="space-y-8">
      
      {/* Materials Inventory */}
      <div>
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
               <Package className="text-indigo-600" size={20} /> Master Inventory
            </h2>
            <button onClick={() => setActiveModal('material')} className="bg-white border border-slate-200 text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 transition">
               <Plus size={16} /> New Material
            </button>
         </div>

         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                     <tr>
                        <th className="px-6 py-4">Material</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Current Stock</th>
                        <th className="px-6 py-4">Reserved</th>
                        <th className="px-6 py-4">Available</th>
                        <th className="px-6 py-4">Incoming</th>
                        <th className="px-6 py-4">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {materials.map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                           <td className="px-6 py-4">
                              <div className="font-bold text-slate-800">{item.name}</div>
                              <div className="text-[10px] text-stone-400 font-mono">{item.id}</div>
                           </td>
                           <td className="px-6 py-4 font-medium">{item.type}</td>
                           <td className="px-6 py-4 font-semibold">{item.currentStock} {item.unit}</td>
                           <td className="px-6 py-4 text-rose-600 font-semibold">{item.reservedStock} {item.unit}</td>
                           <td className="px-6 py-4 text-emerald-600 font-bold">{item.availableStock} {item.unit}</td>
                           <td className="px-6 py-4 text-indigo-600 font-semibold">{item.incomingQuantity > 0 ? `+${item.incomingQuantity} ${item.unit}` : '-'}</td>
                           <td className="px-6 py-4">
                              {item.availableStock <= item.reorderPoint ? (
                                 <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-1 rounded font-bold uppercase flex items-center gap-1 w-max">
                                    <AlertCircle size={12} /> Low Stock
                                 </span>
                              ) : (
                                 <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-1 rounded font-bold uppercase w-max">
                                    Healthy
                                 </span>
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      {/* Warps */}
      <div>
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
               <Layers className="text-indigo-600" size={20} /> Warp Management
            </h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {warps.length > 0 ? warps.map((warp: any) => {
               const design = (useSimulationStore.getState().state?.designs || []).find((d: any) => d.id === warp.designId);
               const title = warp.designName || design?.name || `Custom Saree Design (${warp.id})`;
               const img = warp.imageUrl || design?.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';
               const category = warp.category || design?.category || 'Traditional';

               return (
                  <div key={warp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
                     <div>
                        <div className="relative h-32 -mx-5 -mt-5 mb-4 overflow-hidden bg-slate-100 border-b border-slate-100">
                           <img src={img} alt={title} className="w-full h-full object-cover object-center" />
                           <div className="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                              {warp.id.toUpperCase()}
                           </div>
                           <div className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded uppercase shadow-sm ${warp.status === 'UNALLOCATED' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
                              {warp.status}
                           </div>
                        </div>

                        <div className="mb-3">
                           <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">{category}</span>
                           <h3 className="font-bold text-slate-800 text-base leading-snug">{title}</h3>
                        </div>

                        <div className="space-y-2 text-sm mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                           <div className="flex justify-between">
                              <span className="text-slate-500">Silk Type:</span>
                              <span className="font-semibold text-slate-800">{warp.silkType || 'Mulberry Silk Grade A'}</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-slate-500">Primary Color:</span>
                              <span className="font-semibold text-indigo-600">{warp.primaryColor || 'Royal Crimson'}</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-slate-500">Warp Length:</span>
                              <span className="font-semibold text-slate-800">{warp.warpLength || 100} meters</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-slate-500">Capacity:</span>
                              <span className="font-semibold text-emerald-600">{warp.estimatedSarees || 12} Sarees</span>
                           </div>
                        </div>
                     </div>
                     
                     {warp.status === 'UNALLOCATED' && (
                        <button 
                           onClick={() => setAllocatingWarp(warp)}
                           className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition mt-auto shadow-md flex justify-center items-center gap-1.5"
                        >
                           <Layers size={14} /> Allocate & Plan Warp Setup
                        </button>
                     )}
                  </div>
               );
            }) : (
               <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400">
                  No active warps. When a design in Design Queue is sent to Production, its Warp will automatically appear here for allocation.
               </div>
            )}
         </div>
      </div>

      {/* Purchase Orders */}
      <div>
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
               <Truck className="text-indigo-600" size={20} /> Purchase Orders
            </h2>
            <button onClick={() => setActiveModal('po')} className="bg-white border border-slate-200 text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 transition">
               <Plus size={16} /> New PO
            </button>
         </div>

         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center text-slate-400">
            {purchaseOrders.length > 0 ? (
               <div className="text-left space-y-3">
                  {purchaseOrders.map((po: any) => {
                     const mat = materials.find((m: any) => m.id === po.materialId);
                     return (
                        <div key={po.id} className="p-4 border border-slate-100 rounded-lg bg-slate-50 flex justify-between items-center">
                           <div>
                              <div className="font-bold text-slate-800">{po.id.toUpperCase()}</div>
                              <div className="text-sm text-stone-500">{mat?.name || 'Material'} ({po.quantity} {mat?.unit || 'units'})</div>
                           </div>
                           <div className="text-right">
                              <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{po.status}</div>
                              <div className="text-[10px] text-stone-400">ETA: {po.expectedDelivery}</div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            ) : (
               "No active purchase orders. All materials have been received."
            )}
         </div>
      </div>

      <NewMaterialModal isOpen={activeModal === 'material'} onClose={() => setActiveModal(null)} />
      <CreateWarpModal isOpen={activeModal === 'warp'} onClose={() => setActiveModal(null)} />
      <NewPOModal isOpen={activeModal === 'po'} onClose={() => setActiveModal(null)} />

      {/* Warp Allocation & Configuration Modal */}
      {allocatingWarp && (
         <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
               <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                  <div>
                     <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Layers className="text-indigo-600" size={20} /> Configure Warp Setup
                     </h3>
                     <div className="text-xs text-stone-500 font-mono mt-0.5">{allocatingWarp.id.toUpperCase()} • {allocatingWarp.designName || 'Handloom Design'}</div>
                  </div>
                  <button onClick={() => setAllocatingWarp(null)} className="text-stone-400 hover:text-slate-600 p-1">✕</button>
               </div>

               <form onSubmit={(e) => {
                  e.preventDefault();
                  if (createProductionJob) {
                     createProductionJob(allocatingWarp.designId, allocatingWarp.id, 'KHDC_GOVT', warpSetupForm);
                     const addToast = useSimulationStore.getState().addToast;
                     if (addToast) addToast(`Warp allocated & Production Job created!`, 'success');
                  }
                  setAllocatingWarp(null);
               }} className="space-y-4">

                  <div>
                     <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Primary Silk Color / Yarn Dye</label>
                     <input 
                        type="text" 
                        required
                        value={warpSetupForm.primaryColor}
                        onChange={e => setWarpSetupForm({ ...warpSetupForm, primaryColor: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. Royal Crimson, Peacock Blue, Temple Gold"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Warp Length (Meters)</label>
                        <input 
                           type="number" 
                           required min="10" max="500"
                           value={warpSetupForm.warpLength}
                           onChange={e => setWarpSetupForm({ ...warpSetupForm, warpLength: Number(e.target.value) })}
                           className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Target Sarees (Batch)</label>
                        <input 
                           type="number" 
                           required min="1" max="50"
                           value={warpSetupForm.estimatedSarees}
                           onChange={e => setWarpSetupForm({ ...warpSetupForm, estimatedSarees: Number(e.target.value) })}
                           className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Silk Yarn Grade</label>
                     <select 
                        value={warpSetupForm.silkType}
                        onChange={e => setWarpSetupForm({ ...warpSetupForm, silkType: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                     >
                        <option>Mulberry Silk Grade A</option>
                        <option>Kanchipuram Heavy Zari Silk</option>
                        <option>Organza Lightweight Silk</option>
                        <option>Tussar Raw Silk</option>
                     </select>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                     <button type="button" onClick={() => setAllocatingWarp(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800">
                        Cancel
                     </button>
                     <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg shadow-sm">
                        Confirm Allocation & Queue Production
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}

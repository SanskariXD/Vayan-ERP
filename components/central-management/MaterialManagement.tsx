'use client';

import { useState } from 'react';
import { useCoopStore } from '@/lib/store';
import { Package, Layers, Plus, Truck, AlertCircle } from 'lucide-react';
import { NewMaterialModal, CreateWarpModal, NewPOModal } from './Modals';

export default function MaterialManagementTab() {
  const materials = useCoopStore((s: any) => s.materials) || [];
  const warps = useCoopStore((s: any) => s.warps) || [];
  const purchaseOrders = useCoopStore((s: any) => s.purchaseOrders) || [];
  
  const [activeModal, setActiveModal] = useState<'material' | 'warp' | 'po' | null>(null);

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
            <button onClick={() => setActiveModal('warp')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700 transition">
               <Plus size={16} /> Create Warp
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {warps.length > 0 ? warps.map((warp: any) => (
               <div key={warp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                     <div className="font-bold text-slate-800 uppercase tracking-wide">{warp.id}</div>
                     <div className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{warp.status}</div>
                  </div>
                  <div className="space-y-2 text-sm">
                     <div className="flex justify-between">
                        <span className="text-slate-500">Silk Type:</span>
                        <span className="font-semibold text-slate-800">{warp.silkType}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-slate-500">Length:</span>
                        <span className="font-semibold text-slate-800">{warp.warpLength} m</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-slate-500">Capacity:</span>
                        <span className="font-semibold text-indigo-600">{warp.estimatedSarees} Sarees</span>
                     </div>
                  </div>
               </div>
            )) : (
               <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400">
                  No active warps prepared. Click "Create Warp" to allocate silk for production.
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
    </div>
  );
}

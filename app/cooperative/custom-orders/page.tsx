'use client';

import { useState, useEffect } from 'react';
import { useSimulationStore } from '@/lib/store';
import { Package, Plus, CheckCircle2, Loader2, Upload, AlertTriangle } from 'lucide-react';

export default function CustomOrdersPage() {
  const { state, isLoaded, initialize, addOrder } = useSimulationStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerType: 'Retailer',
    designId: '',
    quantity: 12,
    deliveryDate: '',
    priority: 'Medium',
    sellingPrice: 15000,
    advanceAmount: 5000,
    instructions: '',
    region: 'Local',
    productionModel: 'PRIVATE_COMMERCIAL'
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isLoaded || !state) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate image analysis or processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const newOrder = {
      id: `order-custom-${Date.now()}`,
      customerId: `cust-${Date.now()}`,
      customerName: formData.customerName,
      designId: formData.designId,
      quantity: formData.quantity,
      deliveryDate: formData.deliveryDate,
      status: 'Pending',
      priority: formData.priority,
      region: formData.region,
      productionModel: formData.productionModel,
      expectedRevenue: formData.quantity * formData.sellingPrice
    };

    addOrder(newOrder);
    setIsSubmitting(false);
    setIsFormOpen(false);
  };

  return (
    <div className="bg-[#F9F6F0] min-h-screen p-6 md:p-10 font-sans">
      <div className="mb-8 animate-fade-in flex flex-wrap justify-between items-end gap-4">
        <div>
           <h1 className="text-3xl font-semibold text-slate-800 mb-2 tracking-tight">Custom Orders & Production Requests</h1>
           <p className="text-stone-500 text-sm">
             Ingest bulk requirements directly into the deterministic simulation engine.
           </p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md transition flex items-center gap-2"
        >
          <Plus size={16} /> New Order
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-8 animate-slide-up-delay-1">
         <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
               <Package className="w-4 h-4 text-indigo-500" /> Upcoming Deliveries
            </h2>
         </div>
         <div className="overflow-x-auto flex-1 p-0">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-slate-50 border-b border-slate-100">
                 <th className="px-6 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest">Order</th>
                 <th className="px-6 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest">Customer</th>
                 <th className="px-6 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest">Due Date</th>
                 <th className="px-6 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest">Quantity</th>
                 <th className="px-6 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest">Status</th>
                 <th className="px-6 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest text-right">Revenue</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {state.orders.map((order: any, i: number) => (
                 <tr key={i} className="hover:bg-slate-50 transition-colors">
                   <td className="px-6 py-3 text-xs font-semibold text-slate-800">{order.id}</td>
                   <td className="px-6 py-3 text-xs text-slate-600">
                     <div className="font-semibold text-slate-800">{order.customerName || 'Retail Customer'}</div>
                     <div className="text-[10px] text-stone-400">{order.region || 'Local'}</div>
                   </td>
                   <td className="px-6 py-3 text-xs text-slate-600 flex items-center gap-1">
                     <AlertTriangle className={`w-3 h-3 ${order.priority === 'High' || order.priority === 'Urgent' ? 'text-rose-500' : 'text-stone-400'}`}/> 
                     {order.deliveryDate || order.deadline}
                   </td>
                   <td className="px-6 py-3 text-xs font-medium text-slate-800">{order.quantity} Sarees</td>
                   <td className="px-6 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                         {order.status}
                      </span>
                   </td>
                   <td className="px-6 py-3 text-xs font-bold text-emerald-600 text-right">₹{order.expectedRevenue?.toLocaleString('en-IN') || (order.quantity * 15000).toLocaleString('en-IN')}</td>
                 </tr>
               ))}
               {state.orders.length === 0 && (
                  <tr>
                     <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400 italic">No upcoming deliveries.</td>
                  </tr>
               )}
             </tbody>
           </table>
         </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex justify-end" onClick={() => setIsFormOpen(false)}>
           <div 
             className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 p-8 overflow-y-auto animate-slide-left"
             onClick={(e) => e.stopPropagation()}
           >
             <h2 className="text-xl font-semibold text-slate-800 mb-6">Create Custom Order</h2>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                   <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Customer Name</label>
                   <input required type="text" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Customer Type</label>
                      <select value={formData.customerType} onChange={e => setFormData({...formData, customerType: e.target.value})} className="w-full border rounded-lg p-2 text-sm bg-white">
                         <option>Retailer</option>
                         <option>Boutique</option>
                         <option>Export Buyer</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Priority</label>
                      <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full border rounded-lg p-2 text-sm bg-white">
                         <option>Low</option>
                         <option>Medium</option>
                         <option>High</option>
                         <option>Urgent</option>
                      </select>
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Target Design</label>
                   <select required value={formData.designId} onChange={e => setFormData({...formData, designId: e.target.value})} className="w-full border rounded-lg p-2 text-sm bg-white">
                      <option value="">Select Catalog Design</option>
                      {state.designs.map((d: any) => (
                         <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                   </select>
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition cursor-pointer">
                   <Upload className="w-6 h-6 text-indigo-400 mb-2" />
                   <div className="text-sm font-semibold text-slate-700">Upload Reference Image</div>
                   <div className="text-[10px] text-stone-400 mt-1">System will automatically extract motifs and complexity.</div>
                </div>

                <div>
                   <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">Production Model</label>
                   <div className="flex bg-slate-100 p-1 rounded-lg">
                      <button 
                         type="button"
                         onClick={() => setFormData({...formData, productionModel: 'PRIVATE_COMMERCIAL'})}
                         className={`flex-1 text-xs font-semibold py-2 rounded-md transition ${formData.productionModel === 'PRIVATE_COMMERCIAL' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                         Private Sale (Full Margin)
                      </button>
                      <button 
                         type="button"
                         onClick={() => setFormData({...formData, productionModel: 'KHDC_GOVT'})}
                         className={`flex-1 text-xs font-semibold py-2 rounded-md transition ${formData.productionModel === 'KHDC_GOVT' ? 'bg-indigo-600 shadow text-white' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                         KHDC Commission (Wage)
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Quantity (Sarees)</label>
                      <input required type="number" min={1} value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} className="w-full border rounded-lg p-2 text-sm" />
                   </div>
                   <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Delivery Date</label>
                      <input required type="date" value={formData.deliveryDate} onChange={e => setFormData({...formData, deliveryDate: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Price per Saree</label>
                      <input required type="number" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: parseInt(e.target.value)})} className="w-full border rounded-lg p-2 text-sm" />
                   </div>
                   <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Advance Received</label>
                      <input required type="number" value={formData.advanceAmount} onChange={e => setFormData({...formData, advanceAmount: parseInt(e.target.value)})} className="w-full border rounded-lg p-2 text-sm" />
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Special Instructions</label>
                   <textarea rows={3} value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
                </div>
                
                <div className="pt-4 border-t border-slate-100">
                   <button 
                     type="submit" 
                     disabled={isSubmitting}
                     className="w-full bg-slate-800 text-white font-semibold text-sm py-3 rounded-lg flex justify-center items-center gap-2 hover:bg-slate-700 transition"
                   >
                     {isSubmitting ? <><Loader2 className="animate-spin w-4 h-4" /> Processing...</> : 'Ingest to Engine'}
                   </button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}

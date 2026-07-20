'use client';

import { useState } from 'react';
import { useCoopStore } from '@/lib/store';
import { X, Plus, Package, Layers, Truck, Palette } from 'lucide-react';

// --- 1. ADD EXISTING DESIGN MODAL ---
export function AddDesignModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const addManualDesign = useCoopStore((s: any) => s.addManualDesign);
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    complexityLevel: 3,
    silkRequired: 5.0,
    zariRequired: 1.5,
    setupDays: 2,
    expectedWeavingDays: 6,
    expectedSellingPrice: 15000,
    category: 'Wedding',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    addManualDesign({
      id: `design-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      complexityLevel: Number(formData.complexityLevel),
      silkRequired: Number(formData.silkRequired),
      zariRequired: Number(formData.zariRequired),
      setupDays: Number(formData.setupDays),
      expectedWeavingDays: Number(formData.expectedWeavingDays),
      expectedSellingPrice: Number(formData.expectedSellingPrice),
      category: formData.category,
      notes: formData.notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scale-up">
        <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Palette className="text-indigo-600" size={20} /> Add Production Ready Design
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Design Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Kanjivaram Peacock Regal" 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Complexity (1-5)</label>
              <input 
                type="number" min="1" max="5"
                value={formData.complexityLevel}
                onChange={e => setFormData({ ...formData, complexityLevel: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Selling Price (₹)</label>
              <input 
                type="number" 
                value={formData.expectedSellingPrice}
                onChange={e => setFormData({ ...formData, expectedSellingPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Silk Req (kg)</label>
              <input 
                type="number" step="0.1"
                value={formData.silkRequired}
                onChange={e => setFormData({ ...formData, silkRequired: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Zari Req (spools)</label>
              <input 
                type="number" step="0.1"
                value={formData.zariRequired}
                onChange={e => setFormData({ ...formData, zariRequired: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Image URL (Optional)</label>
            <input 
              type="url"
              placeholder="https://..."
              value={formData.imageUrl}
              onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Design</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- 2. NEW MATERIAL MODAL ---
export function NewMaterialModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const addMaterial = useCoopStore((s: any) => s.addMaterial);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Silk Yarn',
    currentStock: 100,
    unit: 'kg',
    reorderPoint: 30,
    supplier: 'Kanchipuram Silks'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    addMaterial({
      id: `mat-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      type: formData.type as any,
      currentStock: Number(formData.currentStock),
      reservedStock: 0,
      availableStock: Number(formData.currentStock),
      orderedQuantity: 0,
      incomingQuantity: 0,
      safetyStock: 10,
      reorderPoint: Number(formData.reorderPoint),
      unit: formData.unit,
      supplier: formData.supplier
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
        <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Package className="text-indigo-600" size={20} /> Register New Material
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Material Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Mulberry Silk Yarn 20/22" 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Category</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="Silk Yarn">Silk Yarn</option>
                <option value="Gold Zari">Gold Zari</option>
                <option value="Silver Zari">Silver Zari</option>
                <option value="Dyed Silk">Dyed Silk</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Unit</label>
              <input 
                type="text" 
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Current Stock</label>
              <input 
                type="number" 
                value={formData.currentStock}
                onChange={e => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Reorder Point</label>
              <input 
                type="number" 
                value={formData.reorderPoint}
                onChange={e => setFormData({ ...formData, reorderPoint: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Supplier</label>
            <input 
              type="text" 
              value={formData.supplier}
              onChange={e => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Stock</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- 3. CREATE WARP MODAL ---
export function CreateWarpModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const createWarp = useCoopStore((s: any) => s.createWarp);
  const designs = useCoopStore((s: any) => s.productionReadyDesigns) || [];
  const looms = useCoopStore((s: any) => s.looms) || [];

  const [formData, setFormData] = useState({
    silkType: 'Raw Silk Grade A',
    warpLength: 72,
    estimatedSarees: 12,
    assignedDesignId: '',
    assignedLoomId: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createWarp({
      id: `WARP-${Math.floor(100 + Math.random() * 900)}`,
      silkType: formData.silkType,
      warpLength: Number(formData.warpLength),
      estimatedSarees: Number(formData.estimatedSarees),
      assignedDesignId: formData.assignedDesignId || null,
      assignedLoomId: formData.assignedLoomId || null,
      status: 'Prepared',
      createdAt: new Date().toISOString()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
        <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Layers className="text-indigo-600" size={20} /> Create New Warp
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Silk Material Type</label>
            <input 
              type="text" 
              required
              value={formData.silkType}
              onChange={e => setFormData({ ...formData, silkType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Warp Length (m)</label>
              <input 
                type="number" 
                value={formData.warpLength}
                onChange={e => setFormData({ ...formData, warpLength: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Est. Sarees</label>
              <input 
                type="number" 
                value={formData.estimatedSarees}
                onChange={e => setFormData({ ...formData, estimatedSarees: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Assigned Design (Optional)</label>
            <select 
              value={formData.assignedDesignId}
              onChange={e => setFormData({ ...formData, assignedDesignId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">Unassigned</option>
              {designs.map((d: any) => (
                <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Assigned Loom (Optional)</label>
            <select 
              value={formData.assignedLoomId}
              onChange={e => setFormData({ ...formData, assignedLoomId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">Unassigned</option>
              {looms.map((l: any) => (
                <option key={l.id} value={l.id}>{l.id.toUpperCase()} - {l.weaverName}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create Warp</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- 4. NEW PURCHASE ORDER MODAL ---
export function NewPOModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const addPurchaseOrder = useCoopStore((s: any) => s.addPurchaseOrder);
  const materials = useCoopStore((s: any) => s.materials) || [];

  const [formData, setFormData] = useState({
    supplier: 'Kanchipuram Silk Mills',
    materialId: materials[0]?.id || '',
    quantity: 100,
    expectedDelivery: 'In 5 Days'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addPurchaseOrder({
      id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier: formData.supplier,
      materialId: formData.materialId || materials[0]?.id || 'mat-01',
      quantity: Number(formData.quantity),
      orderDate: new Date().toISOString(),
      expectedDelivery: formData.expectedDelivery,
      status: 'Ordered'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
        <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Truck className="text-indigo-600" size={20} /> Create Purchase Order
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Supplier Name</label>
            <input 
              type="text" 
              required
              value={formData.supplier}
              onChange={e => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Material</label>
            <select 
              value={formData.materialId}
              onChange={e => setFormData({ ...formData, materialId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              {materials.map((m: any) => (
                <option key={m.id} value={m.id}>{m.name} ({m.type})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Quantity</label>
              <input 
                type="number" 
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Est. Delivery</label>
              <input 
                type="text" 
                value={formData.expectedDelivery}
                onChange={e => setFormData({ ...formData, expectedDelivery: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Issue PO</button>
          </div>
        </form>
      </div>
    </div>
  );
}

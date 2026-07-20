'use client';

import { useState } from 'react';
import { useCoopStore } from '@/lib/store';
import { Printer, Check, Plus, Edit2, Trash2, ChevronRight, X } from 'lucide-react';
import { AddDesignModal, CreateWarpModal } from './Modals';

export default function DesignManagementTab() {
  const designQueue = useCoopStore((s: any) => s.designQueue);
  const productionReadyDesigns = useCoopStore((s: any) => s.productionReadyDesigns);
  const markDesignReady = useCoopStore((s: any) => s.markDesignReady);

  const [activeSection, setActiveSection] = useState<'queue' | 'ready'>('queue');
  const [printingDesignId, setPrintingDesignId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWarpModalOpen, setIsWarpModalOpen] = useState(false);
  const [selectedDesignForWarp, setSelectedDesignForWarp] = useState<string | undefined>(undefined);

  const handleExportJacquard = (design: any) => {
    setPrintingDesignId(design.id);
    // Lightweight client-side print scoped to design
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Jacquard Export - ${design.name}</title></head>
          <body style="font-family: sans-serif; padding: 20px;">
            <h1>${design.name} (${design.id})</h1>
            <p>Category: ${design.category || 'N/A'}</p>
            <p>Complexity: ${design.complexityLevel || design.complexity || 3}</p>
            <img src="${design.imageUrl}" style="max-width: 100%; height: auto; border: 1px solid #ccc;" />
            <script>
               window.onload = () => { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    setTimeout(() => {
      setPrintingDesignId(null);
    }, 1000);
  };

  const handleMarkReady = (designId: string) => {
    markDesignReady(designId);
  };

  return (
    <div className="space-y-6">
      {/* Section Toggle */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveSection('queue')}
            className={`text-sm font-bold uppercase tracking-wide px-2 py-1 border-b-2 transition ${activeSection === 'queue' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Design Queue ({designQueue.length})
          </button>
          <button 
            onClick={() => setActiveSection('ready')}
            className={`text-sm font-bold uppercase tracking-wide px-2 py-1 border-b-2 transition ${activeSection === 'ready' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Production Ready ({productionReadyDesigns.length})
          </button>
        </div>
        
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700 transition"
          >
            <Plus size={16} /> Add Existing Design
          </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(activeSection === 'queue' ? designQueue : productionReadyDesigns).map((design: any, index: number) => (
          <div key={`${design.id}-${index}`} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="h-48 w-full bg-slate-100 relative">
              {design.imageUrl ? (
                <img src={design.imageUrl} alt={design.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No Image</div>
              )}
              <div className={`absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                design.status === 'Queued' ? 'bg-amber-100 text-amber-700' :
                design.status === 'Ready' || activeSection === 'ready' ? 'bg-emerald-100 text-emerald-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {activeSection === 'ready' ? 'Ready for Production' : design.status || 'Queued'}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{design.name}</h3>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">{design.id}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Complexity</div>
                    <div className="text-sm font-semibold text-slate-700">{design.complexityLevel || design.complexity || 3}/5</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Category</div>
                    <div className="text-sm font-semibold text-slate-700">{design.category || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Tags</div>
                    <div className="text-sm font-semibold text-slate-700 truncate" title={design.tags?.join(', ')}>
                       {design.tags?.length ? design.tags.join(', ') : 'None'}
                    </div>
                  </div>
                </div>
              </div>

              {activeSection === 'queue' ? (
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => handleExportJacquard(design)}
                    className="flex-1 flex justify-center items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-semibold transition"
                  >
                    {printingDesignId === design.id ? <Check size={14} className="text-emerald-600"/> : <Printer size={14} />} 
                    {printingDesignId === design.id ? 'Exporting...' : 'Export Jacquard PDF'}
                  </button>
                  <button 
                    onClick={() => handleMarkReady(design.id)}
                    className="flex-1 flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-semibold transition"
                  >
                    <Check size={14} /> Mark Ready
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => handleExportJacquard(design)}
                    className="flex-1 flex justify-center items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-semibold transition"
                  >
                    {printingDesignId === design.id ? <Check size={14} className="text-emerald-600"/> : <Printer size={14} />} 
                    {printingDesignId === design.id ? 'Exporting...' : 'Export Jacquard PDF'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {(activeSection === 'queue' ? designQueue : productionReadyDesigns).length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
             <div className="text-slate-400 mb-2">No designs found in this section.</div>
             {activeSection === 'queue' && (
                <div className="text-xs text-stone-500">Go to Demand Intelligence to queue designs from Pinterest trends.</div>
             )}
          </div>
        )}
      </div>

      <AddDesignModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <CreateWarpModal isOpen={isWarpModalOpen} onClose={() => setIsWarpModalOpen(false)} selectedDesignId={selectedDesignForWarp} />
    </div>
  );
}

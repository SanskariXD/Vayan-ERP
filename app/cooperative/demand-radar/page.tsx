'use client';

import { useEffect, useState } from 'react';
import { useSimulationStore } from '@/lib/store';
import { 
  Target, CheckCircle2, AlertTriangle, ArrowRight, Send, 
  BarChart, FileText, ChevronRight, Check, RotateCcw
} from 'lucide-react';

function diffDays(date1: string, date2: string) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default function DemandIntelligencePage() {
  const { state, isLoaded, initialize, queueDesign, addToast } = useSimulationStore();
  const [printedDesigns, setPrintedDesigns] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [designOffset, setDesignOffset] = useState(0);
  const [selectedDesignForModal, setSelectedDesignForModal] = useState<any>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isLoaded || !state) return null;

  const { looms, designs, inventory, festivals, orders, cooperative } = state;
  const currentDate = cooperative.currentSimulatedDate;

  // --- Section 1 Calculations ---
  const currentCapacity = looms.reduce((sum: number, l: any) => sum + Math.max(0, (l.targetSarees || 12) - l.sareesCompleted), 0);
  const pendingOrdersQty = orders.filter((o: any) => o.status !== 'Completed').reduce((sum: number, o: any) => sum + (o.quantity || 0), 0);
  
  const upcomingFestivals = festivals.filter((f: any) => diffDays(f.date, currentDate) > 0).sort((a: any, b: any) => diffDays(a.date, currentDate) - diffDays(b.date, currentDate));
  const nextFestival = upcomingFestivals[0];
  const daysToNextFestival = nextFestival ? diffDays(nextFestival.date, currentDate) : 0;
  const festivalDemand = nextFestival ? Math.round(nextFestival.demandMultiplier * 20) : 0;

  const totalDemand = pendingOrdersQty + festivalDemand;
  const shortage = Math.max(0, totalDemand - currentCapacity);

  // --- Section 6: Factory Readiness ---
  const capacityReadiness = looms.length > 0 ? Math.round((looms.filter((l: any) => l.status === 'WEAVING').length / looms.length) * 100) : 0;
  
  const silkStock = inventory.silkYarn?.available || 0;
  const silkRequired = totalDemand * 0.4; // rough estimate 400g per saree
  const materialReadiness = Math.min(100, Math.round((silkStock / (silkRequired || 1)) * 100));
  
  const warpReady = looms.length > 0 ? Math.round((looms.filter((l: any) => l.status === 'IDLE' || l.status === 'WARP_SETUP').length / looms.length) * 100) : 0;
  const skilledWeavers = 88; // Static realistic metric
  const designReady = 100; // Library is full

  let weddingReadiness = Math.round((capacityReadiness + materialReadiness + warpReady + skilledWeavers) / 4);

  // --- Section 7: Material Forecast ---
  const zariStock = inventory.goldZari?.available || 0;
  const zariRequired = totalDemand * 0.1;

  const handleSendToQueue = (design: any) => {
     setPrintedDesigns(prev => ({ ...prev, [design.id]: true }));
     
     queueDesign({
        id: `${design.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: design.name,
        imageUrl: design.imageUrl || '',
        complexityLevel: design.complexity || design.complexityLevel || 3,
        expectedWeavingDays: design.expectedWeavingDays || 6,
        setupDays: design.setupDays || 2,
        expectedSellingPrice: design.expectedSellingPrice || 15000,
        source: 'Demand Intelligence',
        category: design.category || 'Trending',
        tags: [design.globalTrendMatch].filter(Boolean) as string[],
        notes: `Selected from Design Matrix`
     });

     if (addToast) addToast(`Sent ${design.name} to Design Queue`, 'success');

     setTimeout(() => {
        setPrintedDesigns(prev => ({ ...prev, [design.id]: false }));
     }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] p-6 md:p-8 font-sans">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">Demand Intelligence</h1>
        <p className="text-stone-500 text-sm">Strategic factory planning and requirement forecasting.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
         {/* LEFT COLUMN */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Section 1: Executive Summary */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-slide-up-delay-1">
               <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6">Executive Summary</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                     <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Current Factory Situation</h3>
                     <ul className="space-y-3 text-sm text-slate-700 font-medium">
                        <li className="flex items-start gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></div>
                           {nextFestival ? `${nextFestival.festival} begins in ${daysToNextFestival} days.` : 'No immediate major events.'}
                        </li>
                        <li className="flex items-start gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></div>
                           Current production capacity is {currentCapacity} sarees.
                        </li>
                        <li className="flex items-start gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></div>
                           Expected confirmed + projected demand is {totalDemand} sarees.
                        </li>
                     </ul>

                     <div className="mt-5 p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-800 uppercase tracking-widest">Current Shortage</span>
                        <span className="text-lg font-bold text-rose-600">{shortage} sarees</span>
                     </div>
                  </div>

                  <div className="border-l border-slate-100 pl-8">
                     <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Required Action</h3>
                     <ul className="space-y-3 text-sm text-slate-700 font-medium mb-5">
                        <li className="flex items-start gap-2">
                           <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                           Start one new bridal warp this week
                        </li>
                        <li className="flex items-start gap-2">
                           <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                           Convert Loom-05 after current batch
                        </li>
                        <li className="flex items-start gap-2 text-rose-600">
                           <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                           Strict 60-Day Jacquard Lead Time for Wedding designs
                        </li>
                     </ul>

                     <div className="pt-4 border-t border-slate-100">
                        <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Expected Result</h3>
                        <p className="text-sm font-semibold text-slate-800">Demand coverage increases to 97%.</p>
                     </div>
                  </div>
               </div>
            </div>

             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-slide-up-delay-2">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Design Matrix</h2>
                   <button 
                      onClick={() => {
                         setIsRefreshing(true);
                         setDesignOffset((prev) => (prev + 6) % Math.max(1, designs.length));
                         setTimeout(() => setIsRefreshing(false), 600);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
                      title="Refresh Design Matrix"
                   >
                      <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                   </button>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                   {(designs && designs.length > 0 
                      ? Array.from({ length: Math.min(6, designs.length) }, (_, i) => designs[(designOffset + i) % designs.length])
                      : []
                   ).map((design: any) => (
                      <div key={design.id} className="border border-slate-100 rounded-xl hover:border-indigo-100 hover:shadow-md transition bg-slate-50/50 overflow-hidden flex flex-col justify-between">
                         {design.imageUrl && (
                            <div 
                               className={`relative h-28 w-full overflow-hidden border-b border-slate-100 shrink-0 ${design.globalTrendMatch ? 'cursor-pointer' : ''}`}
                               onClick={() => design.globalTrendMatch && setSelectedDesignForModal(design)}
                            >
                               {design.globalTrendMatch && (
                                  <div className="absolute top-2 left-2 z-10 bg-slate-900/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg border border-slate-700 flex items-center gap-1.5">
                                     <span>🌍</span> {design.globalTrendMatch}
                                  </div>
                               )}
                               <img 
                                  src={design.imageUrl} 
                                  alt={design.name}
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                               />
                            </div>
                         )}
                         
                         <div className="p-4 flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-3 gap-2">
                               <div>
                                  <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{design.name}</h3>
                                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{design.id}</div>
                               </div>
                               <button 
                                  onClick={() => handleSendToQueue(design)}
                                  className={`p-2 rounded-lg transition flex items-center justify-center shrink-0 ${printedDesigns[design.id] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600 hover:bg-indigo-600 hover:text-white'}`}
                                  title="Send design to Central Management Queue"
                               >
                                  {printedDesigns[design.id] ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                               </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2.5 mb-3">
                               <div className="bg-white p-2 rounded border border-slate-100">
                                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Profit Margin</div>
                                  <div className="text-xs font-semibold text-emerald-600">₹{(design.profitMargin || (design.expectedSellingPrice ? Math.round(design.expectedSellingPrice * 0.4) : 8800)).toLocaleString()}/unit</div>
                               </div>
                               <div className="bg-white p-2 rounded border border-slate-100">
                                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Difficulty</div>
                                  <div className="text-xs font-semibold text-slate-700">{design.complexity || design.complexityLevel || 3}/5</div>
                               </div>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

         </div>

         {/* RIGHT COLUMN */}
         <div className="space-y-6">
            
            {/* Section 6: Factory Readiness */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-slide-up-delay-1">
               <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6">Factory Readiness</h2>
               
               <div className="mb-6 pb-6 border-b border-slate-100 text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-indigo-100 mb-2 relative">
                     <div className="absolute inset-0 rounded-full border-4 border-indigo-600" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${weddingReadiness}%, 0 ${weddingReadiness}%)` }}></div>
                     <span className="text-2xl font-bold text-slate-800">{weddingReadiness}%</span>
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Wedding Readiness</div>
               </div>

               <div className="space-y-5">
                  <ReadinessBar label="Capacity" value={capacityReadiness} />
                  <ReadinessBar label="Materials" value={materialReadiness} />
                  <ReadinessBar label="Design Ready" value={designReady} />
                  <ReadinessBar label="Warp Ready" value={warpReady} />
                  <ReadinessBar label="Skilled Weavers" value={skilledWeavers} />
               </div>
            </div>

            {/* Section 7: Material Forecast */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-slide-up-delay-2">
               <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6">Material Forecast</h2>
               
               <div className="space-y-6">
                  <div>
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-slate-800">Current Silk</span>
                        <span className="text-sm font-bold text-slate-800">{silkStock} kg</span>
                     </div>
                     <div className="w-full bg-slate-100 h-1.5 rounded-full mb-3">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (silkStock / silkRequired) * 100)}%` }}></div>
                     </div>
                     <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                           <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Required</div>
                           <div className="font-semibold text-slate-700">{silkRequired} kg</div>
                        </div>
                        <div className="bg-rose-50 p-2 rounded border border-rose-100">
                           <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-0.5">Shortage</div>
                           <div className="font-semibold text-rose-700">{Math.max(0, silkRequired - silkStock)} kg</div>
                        </div>
                     </div>
                     <div className="text-[10px] font-bold text-rose-600 mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Order before Aug 8
                     </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-slate-800">Current Zari</span>
                        <span className="text-sm font-bold text-slate-800">{zariStock} kg</span>
                     </div>
                     <div className="w-full bg-slate-100 h-1.5 rounded-full mb-3">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                     </div>
                     <div className="flex justify-between items-center">
                        <div className="text-xs font-medium text-slate-600">Required: {zariRequired} kg</div>
                        <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-widest border border-emerald-100">Safe</div>
                     </div>
                  </div>
               </div>
            </div>

         </div>
      </div>

      {/* Section 2: Demand Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8 animate-slide-up-delay-3">
         <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-8">Demand Timeline</h2>
         
         <div className="relative border-l-2 border-slate-100 ml-3 md:ml-6 space-y-8 pb-4">
            
            <div className="relative pl-6 md:pl-8">
               <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm"></div>
               <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Today</div>
               <h3 className="text-sm font-bold text-slate-800">Operations Nominal</h3>
            </div>

            {upcomingFestivals.map((fest: any, i: number) => (
               <div key={i} className="relative pl-6 md:pl-8">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-sm"></div>
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">{fest.festival} Preparation Begins</div>
                  
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Required Stock</div>
                        <div className="text-sm font-semibold text-slate-800">{fest.demandMultiplier * 30} sarees</div>
                     </div>
                     <div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Current Stock</div>
                        <div className="text-sm font-semibold text-slate-800">{(fest.festival.length % 6) + 2} sarees</div>
                     </div>
                     <div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Recommended Production</div>
                        <div className="text-sm font-semibold text-indigo-600">+{Math.ceil(fest.demandMultiplier * 30 - 5)} sarees</div>
                     </div>
                  </div>
               </div>
            ))}

         </div>
      </div>
      
      {/* TRADITIONAL VS MODERN COMPARISON MODAL */}
      {selectedDesignForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-scale-up">
            
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
               <div>
                  <h3 className="text-lg font-bold text-slate-800">Design Adaptation Analysis</h3>
                  <p className="text-xs text-stone-500 mt-1">{selectedDesignForModal.name}</p>
               </div>
               <button onClick={() => setSelectedDesignForModal(null)} className="p-2 text-stone-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition">
                 ✕
               </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Left: Original Traditional */}
               <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-slate-300"></span> Original Traditional
                  </div>
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                     <img 
                       src={selectedDesignForModal.adaptationDetails?.originalImage || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"} 
                       alt="Original Traditional" 
                       className="w-full h-full object-cover filter grayscale opacity-80 mix-blend-multiply" 
                     />
                  </div>
               </div>

               {/* Right: Modernized */}
               <div className="space-y-3">
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> Market Adapted (Trend: {selectedDesignForModal.globalTrendMatch})
                  </div>
                  <div className="aspect-square rounded-xl overflow-hidden bg-white border-2 border-indigo-100 shadow-inner relative">
                     <img 
                       src={selectedDesignForModal.imageUrl} 
                       alt="Modernized" 
                       className="w-full h-full object-cover" 
                     />
                  </div>
               </div>
            </div>
            
            <div className="bg-slate-50 p-6 border-t border-slate-100">
               <h4 className="text-sm font-bold text-slate-800 mb-3">Key Structural Changes</h4>
               <ul className="space-y-2">
                  {selectedDesignForModal.adaptationDetails?.changes?.map((change: string, idx: number) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                       {change}
                    </li>
                  )) || (
                    <>
                      <li className="text-sm text-slate-600 flex items-start gap-2">
                         <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Reduced Zari density to appeal to minimal aesthetics.
                      </li>
                      <li className="text-sm text-slate-600 flex items-start gap-2">
                         <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Lightened body shade (pastel shift) to align with Global Spring/Summer trends.
                      </li>
                      <li className="text-sm text-slate-600 flex items-start gap-2">
                         <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Preserved original border motif integrity for cultural authenticity.
                      </li>
                    </>
                  )}
               </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function ReadinessBar({ label, value }: { label: string, value: number }) {
   return (
      <div>
         <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-bold text-slate-700">{label}</span>
            <span className="text-[10px] font-bold text-slate-500">{value}%</span>
         </div>
         <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${value}%` }}></div>
         </div>
      </div>
   );
}

'use client';

import { create } from 'zustand';
import { engine } from '@/engine/simulation';

interface SimulationStore {
  state: any;
  isLoaded: boolean;
  initialize: () => Promise<void>;
  advanceDay: () => void;
  advanceTime: (days: number) => void;
  resetSimulation: () => void;
  addOrder: (order: any) => void;
  deployLoom: (loomId: string, designId: string) => void;
  addProductionJob: (job: any) => void;
  assignLoomToJob: (jobId: string, loomId?: string) => void;
  updateLoomState: (loomId: string, updates: any) => void;
  triggerManualEvent: (type: string, title: string, description: string, impact?: string) => void;
  queueDesign: (design: any) => void;
  markDesignReady: (designId: string) => void;
  addManualDesign: (design: any) => void;
  createWarp: (warp: any) => void;
  addPurchaseOrder: (po: any) => void;
  addMaterial: (mat: any) => void;
  incrementSareeCount: (loomId: string) => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => {
  engine.subscribe((newState: any) => {
    set({ state: { ...newState }, isLoaded: true });
  });

  return {
    state: null,
    isLoaded: false,
    
    initialize: async () => {
      if (get().isLoaded) return;
      await engine.initialize();
    },

    advanceDay: () => {
      engine.advanceDay();
    },

    advanceTime: (days: number) => {
      engine.advanceTime(days);
    },

    resetSimulation: () => {
      engine.resetSimulation();
    },

    addOrder: (order: any) => {
      engine.addOrder(order);
    },

    deployLoom: (loomId: string, designId: string) => {
      engine.deployLoom(loomId, designId);
    },

    addProductionJob: (job: any) => {
      engine.addProductionJob(job);
    },

    assignLoomToJob: (jobId: string, loomId?: string) => {
      engine.assignLoomToJob(jobId, loomId);
    },

    updateLoomState: (loomId: string, updates: any) => {
      engine.updateLoomState(loomId, updates);
    },

    triggerManualEvent: (type: string, title: string, description: string, impact?: string) => {
      engine.triggerManualEvent(type, title, description, impact);
    },

    queueDesign: (design: any) => {
      engine.queueDesign(design);
    },

    markDesignReady: (designId: string) => {
      engine.markDesignReady(designId);
    },

    addManualDesign: (design: any) => {
      engine.addManualDesign(design);
    },

    createWarp: (warp: any) => {
      engine.createWarp(warp);
    },

    addPurchaseOrder: (po: any) => {
      engine.addPurchaseOrder(po);
    },

    addMaterial: (mat: any) => {
      engine.addMaterial(mat);
    },

    incrementSareeCount: (loomId: string) => {
      engine.incrementSareeCount(loomId);
    }
  };
});

// Getter helper
export function getDesignById(id: string) {
  const state = engine.getState();
  if (!state || !state.designs) return null;
  return state.designs.find((d: any) => d.id === id) || null;
}

// Cooperative Store Wrapper
export const useCoopStore = (selector: (state: any) => any) => {
  const { state } = useSimulationStore();
  
  // Safe defaults if engine not loaded yet
  const fallbackState = {
    looms: state?.looms || [],
    designs: state?.designs || [],
    designQueue: state?.designQueue || [],
    productionReadyDesigns: state?.productionReadyDesigns || [],
    warps: state?.warps || [],
    materials: state?.materials || [],
    purchaseOrders: state?.purchaseOrders || [],
    ledgerEntries: (state?.transactions || []).map((t: any) => ({
      id: t.id,
      date: t.date,
      type: t.type === 'Income' ? 'SALES_REVENUE' : t.category === 'Wage Payout' ? 'WAGE_PAYOUT' : 'MATERIAL_EXPENSE',
      description: t.description,
      amount: t.type === 'Income' ? t.amount : -t.amount
    })),
    pendingExecutions: state?.pendingExecutions || [],
    dailySnapshots: state?.dailySnapshots || [],
    deployLoom: (loomId: string, designId: string) => {
      engine.deployLoom(loomId, designId);
    },
    addProductionJob: (job: any) => {
      engine.addProductionJob(job);
    },
    assignLoomToJob: (jobId: string, loomId?: string) => {
      engine.assignLoomToJob(jobId, loomId);
    },
    updateLoomState: (loomId: string, updates: any) => {
      engine.updateLoomState(loomId, updates);
    },
    triggerManualEvent: (type: string, title: string, description: string, impact?: string) => {
      engine.triggerManualEvent(type, title, description, impact);
    },
    addDesign: (design: any) => {
      engine.addDesign(design);
    },
    queueDesign: (design: any) => {
      engine.queueDesign(design);
    },
    markDesignReady: (designId: string) => {
      engine.markDesignReady(designId);
    },
    addManualDesign: (design: any) => {
      engine.addManualDesign(design);
    },
    createWarp: (warp: any) => {
      engine.createWarp(warp);
    },
    addPurchaseOrder: (po: any) => {
      engine.addPurchaseOrder(po);
    },
    addMaterial: (mat: any) => {
      engine.addMaterial(mat);
    },

    incrementSareeCount: (loomId: string) => {
      engine.incrementSareeCount(loomId);
    },
    transitionWarp: (loomId: string, keepCurrent: boolean, nextDesignId?: string) => {
      engine.transitionWarp(loomId, keepCurrent, nextDesignId);
    },
    getDesignById: (id: string) => {
      return state?.designs?.find((d: any) => d.id === id) || null;
    },
    getCriticalLooms: () => {
      return (state?.looms || []).filter((l: any) => {
        const remaining = (12 - l.sareesCompleted) * l.averageSareeDays;
        return l.status === 'WEAVING' && remaining <= 6;
      });
    }
  };

  return selector(fallbackState);
};

// Artisan Store Wrapper
export const useArtisanStore = (selector?: (state: any) => any) => {
  const { state } = useSimulationStore();

  const loom = state?.looms?.find((l: any) => l.weaverId === 'weaver-01') || {
    id: 'loom-01',
    weaverId: 'weaver-01',
    currentDesignId: 'design-001',
    sareesCompleted: 8,
    averageSareeDays: 6,
    status: 'WEAVING',
    daysRemaining: 24
  };

  // Safe mapping of daysRemaining for Artisan view
  const daysRemaining = (12 - loom.sareesCompleted) * loom.averageSareeDays;

  const fallbackState = {
    currentLoom: {
      ...loom,
      daysRemaining
    },
    artisanLedger: (state?.transactions || [])
      .filter((t: any) => t.description.includes('loom-01') || t.description.includes('weaver-01') || t.category === 'Wage Payout')
      .map((t: any) => ({
        id: t.id,
        date: t.date,
        type: t.type === 'Income' ? 'SALES_REVENUE' : 'WAGE_PAYOUT',
        description: t.description,
        amount: t.type === 'Income' ? t.amount : -t.amount
      })),
    yarnDebt: 5000,
    logSale: (count: number, value: number) => {
      const currentState = engine.getState();
      if (currentState) {
        const activeLoom = currentState.looms.find((l: any) => l.id === 'loom-01');
        if (activeLoom) {
          activeLoom.sareesCompleted = Math.min(12, activeLoom.sareesCompleted + count);
        }
        currentState.transactions.unshift({
          id: `tx-artisan-${Date.now()}`,
          date: currentState.cooperative.currentSimulatedDate,
          type: 'Income',
          category: 'Sales Revenue',
          amount: value,
          description: `Artisan logged sale of ${count} sarees on loom-01`
        });
        engine.deployLoom('', '');
      }
    },
    getTotalEarned: () => {
      return 24000;
    }
  };

  if (selector) {
    return selector(fallbackState);
  }
  return fallbackState;
};

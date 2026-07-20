import { runDemandEngine } from './demandEngine';
import { runProductionEngine } from './productionEngine';
import { runRecommendationEngine } from './recommendationEngine';
import { runInventoryEngine, reserveMaterialsForWarp, checkMaterialAvailability } from './inventoryEngine';
import { runFinanceEngine } from './financeEngine';
import { runEventEngine } from './eventEngine';
import { advanceDate } from './utils/calendar';

import cooperative from '@/data/cooperative.json';
import looms from '@/data/looms.json';
import weavers from '@/data/weavers.json';
import orders from '@/data/orders.json';
import designs from '@/data/designs.json';
import warps from '@/data/warps.json';
import inventory from '@/data/inventory.json';
import festivals from '@/data/festivals.json';
import transactions from '@/data/transactions.json';
import customers from '@/data/customers.json';

export class SimulationEngine {
  private state: any;
  private listeners: Function[] = [];
  
  constructor() {
    this.state = null;
  }

  async initialize() {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('erp_simulation_state_v3');
      if (savedState) {
        try {
          this.state = JSON.parse(savedState);
          // Guarantee all arrays and objects are present
          if (!this.state.pendingExecutions) this.state.pendingExecutions = [];
          if (!this.state.dailySnapshots) this.state.dailySnapshots = [];
          if (!this.state.designQueue) this.state.designQueue = [];
          if (!this.state.productionReadyDesigns) this.state.productionReadyDesigns = [];
          if (!this.state.warps) this.state.warps = [];
          if (!this.state.materials) this.state.materials = [
             { id: 'mat-01', name: 'Raw Silk Grade A', type: 'Silk Yarn', currentStock: 450, reservedStock: 120, availableStock: 330, orderedQuantity: 0, incomingQuantity: 0, safetyStock: 100, reorderPoint: 150, unit: 'kg', supplier: 'Surat Silk Co.' },
             { id: 'mat-02', name: 'Pure Gold Zari', type: 'Gold Zari', currentStock: 800, reservedStock: 300, availableStock: 500, orderedQuantity: 200, incomingQuantity: 200, safetyStock: 250, reorderPoint: 400, unit: 'spools', supplier: 'Kanchipuram Zari Mills' },
             { id: 'mat-03', name: 'Pure Silver Zari', type: 'Silver Zari', currentStock: 350, reservedStock: 100, availableStock: 250, orderedQuantity: 0, incomingQuantity: 0, safetyStock: 150, reorderPoint: 200, unit: 'spools', supplier: 'Kanchipuram Zari Mills' }
          ];
          if (!this.state.purchaseOrders) this.state.purchaseOrders = [];
          this.notify();
          return;
        } catch (e) {
          console.error("Failed to parse saved state", e);
        }
      }
    }
    this.resetSimulation();
  }

  public resetSimulation() {
    try {
      // Deep copy to prevent mutations to the original JSON objects
      this.state = {
        cooperative: JSON.parse(JSON.stringify(cooperative)),
        looms: JSON.parse(JSON.stringify(looms)),
        weavers: JSON.parse(JSON.stringify(weavers)),
        orders: JSON.parse(JSON.stringify(orders)),
        designs: JSON.parse(JSON.stringify(designs)),
        designQueue: [],
        productionReadyDesigns: [],
        warps: [],
        materials: [
           { id: 'mat-01', name: 'Raw Silk Grade A', type: 'Silk Yarn', currentStock: 450, reservedStock: 120, availableStock: 330, orderedQuantity: 0, incomingQuantity: 0, safetyStock: 100, reorderPoint: 150, unit: 'kg', supplier: 'Surat Silk Co.' },
           { id: 'mat-02', name: 'Pure Gold Zari', type: 'Gold Zari', currentStock: 800, reservedStock: 300, availableStock: 500, orderedQuantity: 200, incomingQuantity: 200, safetyStock: 250, reorderPoint: 400, unit: 'spools', supplier: 'Kanchipuram Zari Mills' },
           { id: 'mat-03', name: 'Pure Silver Zari', type: 'Silver Zari', currentStock: 350, reservedStock: 100, availableStock: 250, orderedQuantity: 0, incomingQuantity: 0, safetyStock: 150, reorderPoint: 200, unit: 'spools', supplier: 'Kanchipuram Zari Mills' }
        ],
        purchaseOrders: [],
        inventory: JSON.parse(JSON.stringify(inventory)),
        festivals: JSON.parse(JSON.stringify(festivals)),
        transactions: JSON.parse(JSON.stringify(transactions)),
        customers: JSON.parse(JSON.stringify(customers)),
        financeStats: null,
        alerts: [],
        eventLog: [],
        pendingExecutions: [],
        dailySnapshots: []
      };

      // Run initial tick to populate derived state
      this.tick(0);
      
      // Fast forward 30 days to generate historical baseline for charts
      for (let i = 0; i < 30; i++) {
        this.tick(1);
      }
    } catch (error) {
      console.error("Failed to load initial simulation state", error);
    }
  }

  public advanceTime(days: number) {
    for (let i = 0; i < days; i++) {
      this.tick(1);
    }
  }

  public advanceDay() {
    this.advanceTime(1);
  }

  private tick(daysToAdvance: number) {
    if (!this.state) return;

    // 1. Advance Time
    if (daysToAdvance > 0) {
      this.state.cooperative.currentSimulatedDate = advanceDate(this.state.cooperative.currentSimulatedDate, daysToAdvance);
    }
    const currentDate = this.state.cooperative.currentSimulatedDate;

    // 2. Events Engine (Injects random or scripted events)
    if (daysToAdvance > 0) {
      this.state.eventLog = runEventEngine(currentDate, this.state, this.state.eventLog);
    }

    // 3. Production Engine (Handles daily weaving progress based on capacity/maintenance)
    let completedSareesToday: { loomId: string, designId: string }[] = [];
    if (daysToAdvance > 0) {
      const { looms: updatedLooms, completedSareesToday: completed } = runProductionEngine(this.state.looms);
      this.state.looms = updatedLooms;
      completedSareesToday = completed;
    } else {
      // Just recalculate days remaining without advancing sarees completed
      for (const loom of this.state.looms) {
        if (loom.status === 'WEAVING' && loom.currentDesignId) {
          let baseChance = 1 / loom.averageSareeDays;
          baseChance *= (loom.efficiencyPercent / 100);
          if (loom.maintenanceScore < 80) {
            const penalty = (80 - loom.maintenanceScore) / 100;
            baseChance *= (1 - penalty);
          }
          baseChance = Math.max(0.01, Math.min(1, baseChance));
          loom.daysRemaining = Math.ceil((loom.targetSarees - loom.sareesCompleted) * (1 / baseChance));
        } else {
          loom.daysRemaining = 0;
        }
      }
    }

    // 4. Inventory Engine (Handles deductions from SAP-style reserved stock)
    if (daysToAdvance > 0) {
      const { inventory: updatedInventory, alerts: invAlerts } = runInventoryEngine(
        this.state.inventory, 
        completedSareesToday, 
        this.state.designs
      );
      this.state.inventory = updatedInventory;
      this.state.alerts = invAlerts;
    }

    // 5. Finance Engine (Working Capital, Cash flow, Pending Receivables)
    const { transactions: updatedTransactions, totalStats } = runFinanceEngine(
      currentDate,
      this.state.transactions,
      this.state.weavers,
      this.state.looms,
      completedSareesToday,
      this.state.designs,
      daysToAdvance > 0
    );
    this.state.transactions = updatedTransactions;
    this.state.financeStats = totalStats;

    // 6. Demand Engine (Calculates new mathematical score based on orders/festivals)
    this.state.demandIntelligence = runDemandEngine(
      currentDate,
      this.state.festivals,
      this.state.orders,
      this.state.looms,
      20
    );

    // 7. Recommendation Engine (Explainable AI decision scoring)
    for (const loom of this.state.looms) {
      const rec = runRecommendationEngine(
        loom,
        this.state.demandIntelligence,
        this.state.inventory,
        this.state.designs
      );
      loom.currentRecommendation = rec.action;
      loom.recommendationScore = rec.score;
      loom.recommendationBreakdown = rec.breakdown;
    }

    // 8. Daily Snapshot
    if (daysToAdvance > 0) {
      this.state.dailySnapshots.push({
        date: currentDate,
        revenue: this.state.financeStats?.totalRevenue || 0,
        expenses: this.state.financeStats?.totalExpenses || 0,
        workingCapital: this.state.financeStats?.workingCapital || 0,
        completedSarees: this.state.looms.reduce((sum: number, l: any) => sum + l.sareesCompleted, 0),
        demandScore: this.state.demandIntelligence?.score || 50
      });
      if (this.state.dailySnapshots.length > 30) {
         this.state.dailySnapshots.shift();
      }
    }

    this.saveState();
    this.notify();
  }

  public addProductionJob(job: any) {
    if (!this.state) return;
    this.state.pendingExecutions.push(job);
    this.tick(0);
  }

  public assignLoomToJob(jobId: string, manualLoomId?: string) {
    if (!this.state) return false;
    const job = this.state.pendingExecutions.find((j: any) => j.id === jobId);
    if (!job) return false;

    let targetLoomId = manualLoomId;
    if (!targetLoomId) {
       let bestLoom = this.state.looms.find((l: any) => l.status === 'IDLE');
       if (!bestLoom) {
          bestLoom = [...this.state.looms].sort((a: any, b: any) => {
             const aRemaining = (12 - a.sareesCompleted) * a.averageSareeDays;
             const bRemaining = (12 - b.sareesCompleted) * b.averageSareeDays;
             return aRemaining - bRemaining;
          })[0];
       }
       targetLoomId = bestLoom?.id;
    }

    if (targetLoomId) {
      this.deployLoom(targetLoomId, job.designId);
      job.status = 'Assigned';
      this.tick(0);
      return true;
    }
    return false;
  }

  public updateLoomState(loomId: string, updates: any) {
    if (!this.state) return;
    const loom = this.state.looms.find((l: any) => l.id === loomId);
    if (loom) {
      Object.assign(loom, updates);
      this.tick(0);
    }
  }

  public addDesign(design: any) {
    if (!this.state) return;
    this.state.designs.push(design);
    this.state.productionReadyDesigns.push(design);
    this.tick(0);
  }

  public queueDesign(design: any) {
    if (!this.state) return;
    if (!this.state.designQueue) this.state.designQueue = [];
    this.state.designQueue.push({
       ...design,
       queuedAt: this.state.cooperative?.currentSimulatedDate || '2026-07-20',
       status: 'Queued'
    });
    this.tick(0);
  }

  public markDesignReady(designId: string) {
    if (!this.state) return;
    if (!this.state.designQueue) this.state.designQueue = [];
    if (!this.state.productionReadyDesigns) this.state.productionReadyDesigns = [];
    if (!this.state.designs) this.state.designs = [];
    
    const queuedIndex = this.state.designQueue.findIndex((d: any) => d.id === designId);
    if (queuedIndex > -1) {
       const design = this.state.designQueue[queuedIndex];
       design.status = 'Ready';
       this.state.productionReadyDesigns.push(design);
       this.state.designs.push(design);
       this.state.designQueue.splice(queuedIndex, 1);
       this.tick(0);
    }
  }

  public addManualDesign(design: any) {
    if (!this.state) return;
    if (!this.state.productionReadyDesigns) this.state.productionReadyDesigns = [];
    if (!this.state.designs) this.state.designs = [];
    this.state.productionReadyDesigns.push(design);
    this.state.designs.push(design);
    this.tick(0);
  }

  public createWarp(warp: any) {
    if (!this.state) return;
    if (!this.state.warps) this.state.warps = [];
    this.state.warps.push(warp);
    this.tick(0);
  }

  public addPurchaseOrder(po: any) {
    if (!this.state) return;
    if (!this.state.purchaseOrders) this.state.purchaseOrders = [];
    if (!this.state.materials) this.state.materials = [];
    this.state.purchaseOrders.push(po);
    const mat = this.state.materials.find((m: any) => m.id === po.materialId);
    if (mat) {
       mat.orderedQuantity += po.quantity;
       mat.incomingQuantity += po.quantity;
    }
    this.tick(0);
  }

  public addMaterial(material: any) {
    if (!this.state) return;
    if (!this.state.materials) this.state.materials = [];
    this.state.materials.push(material);
    this.tick(0);
  }

  public incrementSareeCount(loomId: string) {
    if (!this.state) return;
    const loom = this.state.looms.find((l: any) => l.id === loomId);
    if (loom) {
      loom.sareesCompleted = Math.min(12, loom.sareesCompleted + 1);
      if (loom.sareesCompleted >= 12) {
        loom.status = 'WEAVING'; // Wait for manual warp cycle
      }
    }
    this.tick(0);
  }

  public transitionWarp(loomId: string, keepCurrent: boolean, nextDesignId?: string) {
    if (!this.state) return;
    const loom = this.state.looms.find((l: any) => l.id === loomId);
    if (loom) {
      loom.status = 'WARP_SETUP';
      loom.sareesCompleted = 0;
      if (keepCurrent) {
        loom.setupDaysRemaining = 1;
      } else if (nextDesignId) {
        loom.currentDesignId = nextDesignId;
        const design = this.state.designs.find((d: any) => d.id === nextDesignId);
        loom.setupDaysRemaining = design ? design.setupDays : 15;
        loom.averageSareeDays = design ? design.expectedWeavingDays : 5;
      }
    }
    this.tick(0);
  }

  public triggerManualEvent(type: string, title: string, description: string, impact?: string) {
    if (!this.state) return;
    this.state.eventLog.unshift({
      id: `evt-manual-${Date.now()}`,
      date: this.state.cooperative.currentSimulatedDate,
      title,
      description,
      type: type as any,
      impact
    });
    this.tick(0);
  }

  // Allow custom orders to be added directly
  public addOrder(order: any) {
    if (!this.state) return;
    this.state.orders.push(order);
    this.tick(0); // Recalculate everything without advancing time
  }

  public deployLoom(loomId: string, designId: string) {
    if (!this.state) return;
    const loom = this.state.looms.find((l: any) => l.id === loomId);
    const design = this.state.designs.find((d: any) => d.id === designId);
    
    if (loom && design) {
      // Check if we have materials
      if (!checkMaterialAvailability(this.state.inventory, design, 12)) {
        console.warn("Insufficient materials to start warp.");
        return false;
      }

      // Reserve materials for this batch
      this.state.inventory = reserveMaterialsForWarp(this.state.inventory, design, 12);

      loom.currentDesignId = designId;
      loom.status = 'WARP_SETUP';
      loom.setupDaysRemaining = design.setupDays;
      loom.sareesCompleted = 0;
      loom.targetSarees = 12;
      loom.averageSareeDays = design.expectedWeavingDays;
      
      this.tick(0);
      return true;
    }
    return false;
  }

  private saveState() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('erp_simulation_state_v3', JSON.stringify(this.state));
    }
  }

  public getState() {
    return this.state;
  }

  // Subscribe for React
  public subscribe(listener: Function) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    // Notify listeners with a deep copy to prevent React/Zustand from freezing internal state
    const copy = JSON.parse(JSON.stringify(this.state));
    for (const listener of this.listeners) {
      listener(copy);
    }
  }
}

// Singleton instance
export const engine = new SimulationEngine();

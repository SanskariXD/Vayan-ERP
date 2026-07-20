import { Loom } from '@/types';

export function runProductionEngine(looms: Loom[]) {
  const updatedLooms = [...looms];
  const completedSareesToday: { loomId: string, designId: string }[] = [];

  for (const loom of updatedLooms) {
    if (loom.status === 'WARP_SETUP') {
      if (loom.setupDaysRemaining > 0) {
        loom.setupDaysRemaining -= 1;
      }
      if (loom.setupDaysRemaining <= 0) {
        loom.status = 'WEAVING';
      }
    } else if (loom.status === 'WEAVING' && loom.currentDesignId) {
      // Calculate dynamic production speed based on efficiency and maintenance
      // Base daily chance = 1 / averageSareeDays
      // E.g., if average is 5 days, base chance is 20%
      
      let baseChance = 1 / loom.averageSareeDays;
      
      // Apply efficiency multiplier (e.g., 105% = 1.05)
      baseChance *= (loom.efficiencyPercent / 100);
      
      // Apply maintenance penalty. If maintenance < 80, performance drops linearly.
      if (loom.maintenanceScore < 80) {
        const penalty = (80 - loom.maintenanceScore) / 100; // e.g., 60 score -> 20% penalty
        baseChance *= (1 - penalty);
      }

      // Add a tiny bit of random variance (+/- 5%) to simulate real-world human variance
      const variance = (Math.random() * 0.1) - 0.05;
      baseChance += variance;

      // Ensure chance is bound between 0 and 1
      baseChance = Math.max(0, Math.min(1, baseChance));

      // Did we finish a saree today?
      if (Math.random() < baseChance) {
        loom.sareesCompleted += 1;
        completedSareesToday.push({ loomId: loom.id, designId: loom.currentDesignId });
        
        if (loom.sareesCompleted >= loom.targetSarees) {
          loom.status = 'IDLE';
          // We keep currentDesignId so the UI knows what was last woven
        }
      }

      // Update days remaining based on the current metrics
      if (loom.status === 'WEAVING') {
         loom.daysRemaining = Math.ceil((loom.targetSarees - loom.sareesCompleted) * (1 / baseChance));
      } else {
         loom.daysRemaining = 0;
      }
    }
  }

  return {
    looms: updatedLooms,
    completedSareesToday
  };
}

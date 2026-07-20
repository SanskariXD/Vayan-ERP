import { Loom } from '@/types';
import { checkMaterialAvailability } from './inventoryEngine';

export function runRecommendationEngine(loom: Loom, demandData: any, inventory: any, designs: any[]) {
  if (loom.status === 'MAINTENANCE') {
    return {
      action: 'Complete Maintenance',
      score: 100,
      breakdown: 'Maintenance is critical for operations (+100)'
    };
  }
  
  if (loom.status === 'WARP_SETUP') {
    return {
      action: 'Complete Setup',
      score: 100,
      breakdown: 'Warp setup must be completed before weaving (+100)'
    };
  }

  // If currently weaving, we need to decide if we should prepare the next warp
  const remainingDays = (loom.targetSarees - loom.sareesCompleted) * loom.averageSareeDays;
  
  if (loom.status === 'WEAVING' && remainingDays > 6) {
    return {
      action: 'Continue Weaving',
      score: 85,
      breakdown: `Production on schedule. ${remainingDays} days remaining.`
    };
  }

  // AI needs to pick the best design to recommend next (for Idle or soon-to-finish looms)
  let bestDesign: any = null;
  let highestScore = -999;
  let bestBreakdown = '';

  for (const design of designs) {
    let score = 0;
    const breakdownParts = [];

    // 1. Demand Weight
    const demandWeight = (demandData.rawScore || 50) * 0.4; // 40% weight
    score += demandWeight;
    breakdownParts.push(`Demand (+${demandWeight.toFixed(1)})`);

    // 2. Profit & Setup Cost Weight
    const profitPotential = design.expectedSellingPrice;
    const normalizedProfit = Math.min(profitPotential / 25000 * 50, 50);
    score += normalizedProfit;
    breakdownParts.push(`Profit (+${normalizedProfit.toFixed(1)})`);

    if (loom.currentDesignId !== design.id) {
      // Switching costs penalty
      const setupPenalty = (design.setupCost / 20000) * 30; // Max 30 points penalty
      score -= setupPenalty;
      breakdownParts.push(`Setup Cost (-${setupPenalty.toFixed(1)})`);
    }

    // 3. Inventory Check
    const hasMaterials = checkMaterialAvailability(inventory, design, 12);
    if (!hasMaterials) {
      score -= 100; // Massive penalty if we can't build it
      breakdownParts.push(`Missing Materials (-100)`);
    }

    if (score > highestScore) {
      highestScore = score;
      bestDesign = design;
      bestBreakdown = breakdownParts.join(' | ');
    }
  }

  const roundedScore = Math.max(0, Math.min(100, Math.round(highestScore)));

  if (loom.status === 'IDLE') {
    return {
      action: `Setup ${bestDesign?.name}`,
      score: roundedScore,
      breakdown: bestBreakdown
    };
  }

  // For weaving looms with <= 6 days remaining
  return {
    action: `Prepare Warp: ${bestDesign?.name}`,
    score: roundedScore,
    breakdown: bestBreakdown
  };
}

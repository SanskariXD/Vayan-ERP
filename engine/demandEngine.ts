import { normalize, getDemandLevel } from './utils/calculations';
import { diffDays } from './utils/calendar';

export function runDemandEngine(currentDate: string, festivals: any[], orders: any[], looms: any[], historicalDemandScore: number = 20) {
  let festivalWeight = 0;
  let activeFestival = null;
  let peakSeason = false;
  const drivers: any[] = [];

  // 1. Evaluate festivals
  for (const fest of festivals) {
    const daysUntil = diffDays(fest.date, currentDate);
    
    // Demand increases before the festival during the preparation lead time
    if (daysUntil > 0 && daysUntil <= fest.preparationLeadTime) {
      // The closer it gets, the higher the weight, peaking at lead time / 2
      const urgency = 1 - (daysUntil / fest.preparationLeadTime);
      const weight = (fest.demandMultiplier * 30) * urgency;
      
      if (weight > festivalWeight) {
        festivalWeight = weight;
        activeFestival = fest.festival;
        peakSeason = fest.demandMultiplier > 2.0;
        
        drivers.push({
          label: `Approaching ${fest.festival}`,
          icon: fest.festival.includes('Wedding') ? '💍' : fest.festival.includes('Diwali') ? '🪔' : '📅',
          strength: weight > 25 ? 'high' : weight > 10 ? 'medium' : 'low'
        });
      }
    }
  }

  // 2. Evaluate Pending Orders
  const pendingOrders = orders.filter((o: any) => o.status !== 'Completed' && o.status !== 'Cancelled');
  const totalPendingQuantity = pendingOrders.reduce((sum: number, o: any) => sum + (o.quantity || 1), 0);
  const orderWeight = totalPendingQuantity;

  if (orderWeight > 0) {
    drivers.push({
      label: `Pending Orders (${totalPendingQuantity} sarees)`,
      icon: '📦',
      strength: orderWeight > 50 ? 'high' : orderWeight > 20 ? 'medium' : 'low'
    });
  }

  // 3. Trend Score (Deterministic based on date hash to avoid changing values during clicks/resets)
  let hash = 0;
  for (let i = 0; i < currentDate.length; i++) {
    hash = currentDate.charCodeAt(i) + ((hash << 5) - hash);
  }
  const trendScore = Math.abs(hash % 15);
  
  // Calculate base score
  const rawScore = historicalDemandScore + festivalWeight + orderWeight + trendScore;
  
  // 4. Capacity Check
  const currentCapacity = looms.reduce((sum: number, loom: any) => {
     // A loom producing a design represents capacity. We'll count sarees currently scheduled/weaving.
     const remainingOnLoom = Math.max(0, (loom.targetSarees || 12) - loom.sareesCompleted);
     return sum + (['WEAVING', 'WARP_SETUP'].includes(loom.status) ? remainingOnLoom : 0);
  }, 0);
  
  // Adjusted Score: demand drops if we already have a lot of capacity handling it
  const capacityDeficit = Math.max(0, rawScore - currentCapacity);
  const normalizedScore = normalize(capacityDeficit, 0, 100);
  const demandLevel = getDemandLevel(normalizedScore);

  let reason = '';
  if (capacityDeficit === 0) {
    reason = `Current production capacity (${currentCapacity} sarees) is sufficient to handle demand.`;
  } else if (peakSeason) {
    reason = `${activeFestival} is approaching. Capacity deficit of ${Math.round(capacityDeficit)}. Immediate production recommended.`;
  } else if (activeFestival) {
    reason = `${activeFestival} demand is building up. Capacity deficit of ${Math.round(capacityDeficit)}. Maintain current production levels.`;
  } else {
    reason = `Normal seasonal demand. Capacity deficit of ${Math.round(capacityDeficit)}.`;
  }

  return {
    score: normalizedScore,
    rawScore,
    level: demandLevel,
    pressure: demandLevel === 'HIGH' ? 'Very High' : demandLevel === 'MEDIUM' ? 'Moderate' : 'Low',
    peakSeason,
    reason,
    drivers: drivers.slice(0, 3) // Top 3 drivers
  };
}

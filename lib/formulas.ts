// ============================================================
// AntiGravity — Core Mathematical Formulas
// Implements Section 2 constraints exactly as specified
// ============================================================

import { BASE_WAGE, PREWARP_THRESHOLD, S_SAME, S_NEW } from './constants';
import type { DesignComplexity } from '@/types';

/**
 * §2.1 Warp-Lock Days Remaining
 * Days Remaining = Unwoven Sarees × Days Per Saree
 */
export function calcDaysRemaining(
  unwovenSarees: number,
  daysPerSaree: number
): number {
  return unwovenSarees * daysPerSaree;
}

/**
 * §2.1 Pre-Warp Alert Trigger
 * Returns true if remaining time < 14 days → triggers CRITICAL_PREWARP_ALERT
 */
export function isPrewarpAlert(daysRemaining: number): boolean {
  return daysRemaining < PREWARP_THRESHOLD;
}

/**
 * §2.2 Sequence-Dependent Setup Matrix
 * S_ij = 1 day (same design, Jacquard cards reused)
 * S_ij = 15 days (new design, requires new card punching + warp drawing)
 */
export function calcSetupDays(fromDesignId: string, toDesignId: string): number {
  return fromDesignId === toDesignId ? S_SAME : S_NEW;
}

/**
 * §2.3 Complexity-Weighted Piece-Rate Wages
 * Final Wage = Base Wage (₹4,000) × (1.0 + (Complexity Level − 1) × 0.25)
 *
 * Examples:
 *   Level 1 → ₹4,000 × 1.00 = ₹4,000
 *   Level 3 → ₹4,000 × 1.50 = ₹6,000
 *   Level 5 → ₹4,000 × 2.00 = ₹8,000
 */
export function calcFinalWage(complexityLevel: DesignComplexity): number {
  return BASE_WAGE * (1.0 + (complexityLevel - 1) * 0.25);
}

/**
 * Calculate wage breakdown components for display in WageCalculatorWidget
 */
export function calcWageBreakdown(complexityLevel: DesignComplexity): {
  baseWage: number;
  multiplier: number;
  bonus: number;
  finalWage: number;
  formulaString: string;
} {
  const multiplier = 1.0 + (complexityLevel - 1) * 0.25;
  const finalWage = BASE_WAGE * multiplier;
  const bonus = finalWage - BASE_WAGE;
  return {
    baseWage: BASE_WAGE,
    multiplier,
    bonus,
    finalWage,
    formulaString: `₹${BASE_WAGE.toLocaleString('en-IN')} × ${multiplier.toFixed(2)} = ₹${finalWage.toLocaleString('en-IN')}`,
  };
}

/**
 * Format a number as Indian Rupee currency string
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
}

/**
 * Calculate total earned for a completed set of sarees
 */
export function calcWarpEarnings(
  sareesCompleted: number,
  complexityLevel: DesignComplexity
): number {
  return sareesCompleted * calcFinalWage(complexityLevel);
}

/**
 * Derive loom progress percentage (0-100)
 */
export function calcLoomProgress(sareesCompleted: number, warpSize = 12): number {
  return Math.min(100, Math.round((sareesCompleted / warpSize) * 100));
}

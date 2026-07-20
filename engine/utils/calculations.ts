// Shared calculation formulas for the Simulation Engine

export function normalize(value: number, min: number, max: number): number {
  if (value <= min) return 0;
  if (value >= max) return 100;
  return Math.round(((value - min) / (max - min)) * 100);
}

export function getDemandLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (score <= 35) return 'LOW';
  if (score <= 65) return 'MEDIUM';
  return 'HIGH';
}

// Calendar Utilities for Simulation

export function advanceDate(dateString: string, days: number = 1): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function diffDays(dateString1: string, dateString2: string): number {
  const d1 = new Date(dateString1);
  const d2 = new Date(dateString2);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatSimulatedDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

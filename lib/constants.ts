// ============================================================
// AntiGravity — Core Constants & Design Tokens
// ============================================================

// ---- Production Constraints ----
export const WARP_SIZE = 12; // Sarees per warp batch
export const PREWARP_THRESHOLD = 14; // Days remaining that triggers alert
export const BASE_WAGE = 4000; // Base piece-rate wage in INR

// ---- Setup Delay Matrix (Sequence-Dependent) ----
export const S_SAME = 1;  // Days: same design continues (Jacquard cards reused)
export const S_NEW = 15;  // Days: new design (new card punching + warp drawing)

// ---- Heritage Craft Design System Colors ----
export const COLORS = {
  khadiCream: '#F9F6F0',
  deepIndigo: '#1E2A38',
  madderRed: '#7A2021',
  leafGreen: '#2E6F40',
  leafGreenLight: '#2E6F4019', // 10% opacity
  terracottaOchre: '#D97706',
  terracottaOchreLight: '#D9770619', // 10% opacity
  mutedSlate: '#78716C', // stone-500
  mutedSlateLight: '#E7E5E4', // stone-200
  white: '#FFFFFF',
  borderStone: '#E7E5E4', // stone-200
} as const;

// ---- Status Badge Maps ----
export const STATUS_LABELS: Record<string, string> = {
  IDLE: 'Idle',
  WARP_SETUP: 'Warp Setup',
  WEAVING: 'Weaving',
  MAINTENANCE: 'Maintenance',
};

export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  WEAVING: {
    bg: 'bg-[#2E6F40]/10',
    text: 'text-[#2E6F40]',
    border: 'border-[#2E6F40]/20',
  },
  WARP_SETUP: {
    bg: 'bg-[#D97706]/10',
    text: 'text-[#D97706]',
    border: 'border-[#D97706]/20',
  },
  IDLE: {
    bg: 'bg-stone-200',
    text: 'text-stone-600',
    border: 'border-stone-300',
  },
  MAINTENANCE: {
    bg: 'bg-[#1E2A38]/10',
    text: 'text-[#1E2A38]',
    border: 'border-[#1E2A38]/20',
  },
};

// ---- Ledger Entry Type Labels ----
export const LEDGER_TYPE_LABELS: Record<string, string> = {
  MATERIAL_EXPENSE: 'Material Expense',
  WAGE_PAYOUT: 'Wage Payout',
  SALES_REVENUE: 'Sales Revenue',
};

// ---- Complexity Labels ----
export const COMPLEXITY_LABELS: Record<number, string> = {
  1: 'Elementary',
  2: 'Simple',
  3: 'Moderate',
  4: 'Complex',
  5: 'Master Craft',
};

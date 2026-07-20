// ============================================================
// AntiGravity — Handloom Capacity & Financial Planning
// Core TypeScript Type Definitions
// ============================================================

export type LoomStatus = 'IDLE' | 'WARP_SETUP' | 'SETUP_JACQUARD' | 'SETUP_SILK_PREP' | 'SETUP_WARP_DRAW' | 'SETUP_CALIBRATION' | 'WEAVING' | 'MAINTENANCE' | 'STOPPED' | 'WAITING_FOR_MATERIALS';
export type DesignComplexity = 1 | 2 | 3 | 4 | 5;
export type UserRole = 'COOPERATIVE' | 'SOLO_ARTISAN';

export interface SareeDesign {
  id: string;
  name: string;
  imageUrl: string;
  bodyColor: string;
  zariDensity: 'High' | 'Medium' | 'Low';
  primaryMotif: string;
  complexityLevel: DesignComplexity;
  daysPerSaree: number;
  setupDays: number;
  expectedWeavingDays: number;
  silkRequired: number; // kg
  zariRequired: number; // spools
  setupCost: number; // Penalty/Cost for switching warp
  requiresNewCards: boolean;
  expectedSellingPrice: number;
  estimatedMarginPercent: number;
  region: string;
  category: string;
  globalTrendMatch?: string | null;
}

export interface Loom {
  id: string;
  weaverName: string;
  weaverId: string;
  status: LoomStatus;
  maintenanceStatus: 'Healthy' | 'Needs Maintenance' | 'Under Repair' | 'Stopped';
  currentDesignId: string | null;
  sareesCompleted: number; // Out of targetSarees
  targetSarees: number;
  setupDaysRemaining: number;
  averageSareeDays: number;
  daysRemaining: number; // Calculated dynamically
  location: string;
  lastMaintenanceDate: string;
  currentRecommendation?: string;
  recommendationScore?: number;
  recommendationBreakdown?: string;
  
  // Machine Capacity Extensions
  efficiencyPercent: number; // e.g., 105 for 105%
  maintenanceScore: number; // 0-100 (100 is perfect)
  
  productionModel?: 'KHDC_GOVT' | 'PRIVATE_COMMERCIAL';
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: 'Income' | 'Expense';
  category: 'MATERIAL_EXPENSE' | 'WAGE_PAYOUT' | 'SALES_REVENUE' | string;
  description: string;
  amount: number; // Absolute value
  status: 'PAID' | 'PENDING';
  dueDate?: string; // For pending payments (receivables)
}

export interface InventoryItem {
  available: number;
  reserved: number;
  onOrder: number;
  consumed: number;
  safetyStock: number;
  reorderPoint: number;
  restockLeadTime: number; // Days to restock
  unit: string;
}

export interface InventoryState {
  silkYarn: InventoryItem;
  goldZari: InventoryItem;
  silverZari: InventoryItem;
  packaging: InventoryItem;
}

export interface EventLogEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'PRODUCTION' | 'INVENTORY' | 'FINANCE' | 'ORDERS' | 'MAINTENANCE' | 'AI';
  impact?: string;
}

export interface ProductionJob {
  id: string;
  name: string;
  designId: string;
  customer?: string;
  type: 'Regular' | 'Festival' | 'Wedding' | 'Custom';
  quantity: number;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  expectedDeliveryDate: string;
  notes: string;
  status: 'Waiting' | 'Ready' | 'Scheduled' | 'Assigned' | 'Completed';
  productionModel?: 'KHDC_GOVT' | 'PRIVATE_COMMERCIAL';
  
  // Estimates
  setupDays: number;
  silkRequired: number;
  zariRequired: number;
  estimatedRevenue: number;
  estimatedProfit: number;
}

// ---- Extended Types ----

export interface TrendingDesign {
  id: string;
  designId: string; // References SareeDesign.id if asset exists
  motifName: string;
  imageUrl: string;
  engagementScore: number; // Aggregate of Pinterest saves + pins
  saves: number;
  pins: number;
  comments: number;
  hasExistingAsset: boolean;
  trendCategory: string;
}

export interface ProductionTicket {
  id: string;
  generatedAt: string;
  trendingDesignId: string;
  motifName: string;
  bodyColor: string;
  zariRules: string;
  motifGeometry: string;
  complexityLevel: DesignComplexity;
  estimatedDaysPerSaree: number;
  setupTimeEstimate: number; // 1 or 15 days
  colorPalette: string[];
  warpThreadCount: number;
  geminiConfidence: number; // 0-100
}

export interface ScheduleBlock {
  id: string;
  loomId: string;
  designId: string;
  status: 'WEAVING' | 'WARP_SETUP';
  startDay: number; // Day offset from timeline start (0-indexed)
  endDay: number;
  designName: string;
  expectedCompletionDate: string;
}

export interface KpiStat {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendPercent?: number;
  color?: string;
}

export interface ArtisanLedgerEntry extends LedgerEntry {
  warpBatchId: string;
  sareesInvolved?: number;
}

// ---- Centralized Management Extensions ----

export interface DesignQueueItem extends SareeDesign {
  queuedAt: string;
  source: 'Demand Intelligence' | 'Manual' | 'Custom Order';
  status: 'Queued' | 'Card Prep' | 'Ready';
  notes?: string;
}

export interface Warp {
  id: string;
  silkType: string;
  warpLength: number; // in meters
  estimatedSarees: number;
  assignedDesignId: string | null;
  assignedLoomId: string | null;
  status: 'Prepared' | 'Assigned' | 'Installed' | 'Completed';
  createdAt: string;
}

export interface MaterialInventoryItem {
  id: string;
  name: string;
  type: 'Silk Yarn' | 'Gold Zari' | 'Silver Zari' | 'Dyed Silk' | 'Accessories';
  currentStock: number;
  reservedStock: number;
  availableStock: number; // Derived
  orderedQuantity: number;
  incomingQuantity: number;
  safetyStock: number;
  reorderPoint: number;
  unit: string;
  supplier: string;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  materialId: string;
  quantity: number;
  orderDate: string;
  expectedDelivery: string;
  status: 'Ordered' | 'Dispatched' | 'Received' | 'Cancelled';
}

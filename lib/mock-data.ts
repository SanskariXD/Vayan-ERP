// @ts-nocheck
// ============================================================
// AntiGravity — Mock Data Layer
// Simulates REST API payloads from Python FastAPI / PyJobShop
// All integration points annotated with: // API_INTEGRATION:
// ============================================================

import type { Loom, SareeDesign, LedgerEntry, TrendingDesign, ScheduleBlock } from '@/types';

// ---- SAREE DESIGNS ----
// API_INTEGRATION: GET /api/designs → SareeDesign[]
export const MOCK_DESIGNS: SareeDesign[] = [
  {
    id: 'design-001',
    name: 'Kanjivaram Peacock Thambalam',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80',
    bodyColor: 'Deep Crimson',
    zariDensity: 'High',
    primaryMotif: 'Peacock & Mango',
    complexityLevel: 5,
    daysPerSaree: 6,
    requiresNewCards: true,
    estimatedMarginPercent: 42,
    region: 'Tamil Nadu',
    setupDays: 10, expectedWeavingDays: 6, silkRequired: 0.8, zariRequired: 0.3, setupCost: 15000, expectedSellingPrice: 22000, category: 'Wedding'
  },
  {
    id: 'design-002',
    name: 'Banarasi Butidar Jaal',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&q=80',
    bodyColor: 'Ivory Gold',
    zariDensity: 'High',
    primaryMotif: 'Buti Floral Lattice',
    complexityLevel: 4,
    daysPerSaree: 5,
    requiresNewCards: true,
    estimatedMarginPercent: 38,
    region: 'Uttar Pradesh',
    setupDays: 8, expectedWeavingDays: 5, silkRequired: 0.7, zariRequired: 0.4, setupCost: 12000, expectedSellingPrice: 18000, category: 'Festival'
  },
  {
    id: 'design-003',
    name: 'Paithani Lotus Border',
    imageUrl: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=80',
    bodyColor: 'Peacock Blue',
    zariDensity: 'Medium',
    primaryMotif: 'Lotus & Vine',
    complexityLevel: 3,
    daysPerSaree: 4,
    requiresNewCards: false,
    estimatedMarginPercent: 29,
    region: 'Maharashtra',
    setupDays: 5, expectedWeavingDays: 4, silkRequired: 0.6, zariRequired: 0.2, setupCost: 8000, expectedSellingPrice: 12000, category: 'Premium'
  },
  {
    id: 'design-004',
    name: 'Chanderi Sheer Floral',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80',
    bodyColor: 'Blush Pink',
    zariDensity: 'Low',
    primaryMotif: 'Small Geometric Flower',
    complexityLevel: 2,
    daysPerSaree: 3,
    requiresNewCards: false,
    estimatedMarginPercent: 22,
    region: 'Madhya Pradesh',
    setupDays: 3, expectedWeavingDays: 3, silkRequired: 0.4, zariRequired: 0.1, setupCost: 4000, expectedSellingPrice: 6000, category: 'Regular'
  },
  {
    id: 'design-005',
    name: 'Kanjivaram Temple Border',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80',
    bodyColor: 'Royal Purple',
    zariDensity: 'High',
    primaryMotif: 'Temple Gopuram',
    complexityLevel: 5,
    daysPerSaree: 7,
    requiresNewCards: true,
    estimatedMarginPercent: 48,
    region: 'Tamil Nadu',
    setupDays: 12, expectedWeavingDays: 7, silkRequired: 0.9, zariRequired: 0.35, setupCost: 18000, expectedSellingPrice: 25000, category: 'Luxury'
  },
  {
    id: 'design-006',
    name: 'Pochampally Ikat Diagonal',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&q=80',
    bodyColor: 'Mustard Yellow',
    zariDensity: 'Low',
    primaryMotif: 'Ikat Diamond',
    complexityLevel: 2,
    daysPerSaree: 3,
    requiresNewCards: false,
    estimatedMarginPercent: 18,
    region: 'Telangana',
    setupDays: 3, expectedWeavingDays: 3, silkRequired: 0.4, zariRequired: 0.1, setupCost: 4000, expectedSellingPrice: 6000, category: 'Regular'
  },
  {
    id: 'design-007',
    name: 'Gadwal Silk Interlocked',
    imageUrl: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=80',
    bodyColor: 'Forest Green',
    zariDensity: 'Medium',
    primaryMotif: 'Interlocked Squares',
    complexityLevel: 3,
    daysPerSaree: 4,
    requiresNewCards: false,
    estimatedMarginPercent: 25,
    region: 'Andhra Pradesh',
    setupDays: 5, expectedWeavingDays: 4, silkRequired: 0.6, zariRequired: 0.2, setupCost: 8000, expectedSellingPrice: 12000, category: 'Premium'
  },
  {
    id: 'design-008',
    name: 'Uppada Jamdani Paisley',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80',
    bodyColor: 'Turquoise',
    zariDensity: 'Medium',
    primaryMotif: 'Paisley Cluster',
    complexityLevel: 4,
    daysPerSaree: 5,
    requiresNewCards: true,
    estimatedMarginPercent: 35,
    region: 'Andhra Pradesh',
    setupDays: 8, expectedWeavingDays: 5, silkRequired: 0.7, zariRequired: 0.4, setupCost: 12000, expectedSellingPrice: 18000, category: 'Festival'
  },
];

// ---- LOOMS ----
// API_INTEGRATION: GET /api/cooperative/looms → Loom[]
export const MOCK_LOOMS: Loom[] = [
  { id: 'loom-01', weaverName: 'Narayanan S.', status: 'WEAVING', currentDesignId: 'design-001', sareesCompleted: 10, daysRemaining: 12, location: 'Hall A', lastMaintenanceDate: '2026-06-01' },
  { id: 'loom-02', weaverName: 'Meenakshi R.', status: 'WEAVING', currentDesignId: 'design-002', sareesCompleted: 8, daysRemaining: 20, location: 'Hall A', lastMaintenanceDate: '2026-05-15' },
  { id: 'loom-03', weaverName: 'Krishnaswamy P.', status: 'WARP_SETUP', currentDesignId: 'design-003', sareesCompleted: 0, daysRemaining: 48, location: 'Hall A', lastMaintenanceDate: '2026-06-20' },
  { id: 'loom-04', weaverName: 'Saradha V.', status: 'WEAVING', currentDesignId: 'design-001', sareesCompleted: 11, daysRemaining: 6, location: 'Hall B', lastMaintenanceDate: '2026-06-10' },
  { id: 'loom-05', weaverName: 'Rajan M.', status: 'IDLE', currentDesignId: null, sareesCompleted: 0, daysRemaining: 0, location: 'Hall B', lastMaintenanceDate: '2026-07-01' },
  { id: 'loom-06', weaverName: 'Lakshmi T.', status: 'WEAVING', currentDesignId: 'design-004', sareesCompleted: 6, daysRemaining: 18, location: 'Hall B', lastMaintenanceDate: '2026-05-20' },
  { id: 'loom-07', weaverName: 'Selvam K.', status: 'WEAVING', currentDesignId: 'design-005', sareesCompleted: 9, daysRemaining: 21, location: 'Hall C', lastMaintenanceDate: '2026-06-05' },
  { id: 'loom-08', weaverName: 'Parvathi A.', status: 'MAINTENANCE', currentDesignId: null, sareesCompleted: 0, daysRemaining: 0, location: 'Hall C', lastMaintenanceDate: '2026-07-15' },
  { id: 'loom-09', weaverName: 'Subramaniam G.', status: 'WEAVING', currentDesignId: 'design-002', sareesCompleted: 4, daysRemaining: 40, location: 'Hall C', lastMaintenanceDate: '2026-06-12' },
  { id: 'loom-10', weaverName: 'Kamakshi B.', status: 'WARP_SETUP', currentDesignId: 'design-006', sareesCompleted: 0, daysRemaining: 36, location: 'Hall D', lastMaintenanceDate: '2026-07-10' },
  { id: 'loom-11', weaverName: 'Venkataraman L.', status: 'WEAVING', currentDesignId: 'design-003', sareesCompleted: 11, daysRemaining: 8, location: 'Hall D', lastMaintenanceDate: '2026-05-28' },
  { id: 'loom-12', weaverName: 'Usha S.', status: 'WEAVING', currentDesignId: 'design-007', sareesCompleted: 5, daysRemaining: 28, location: 'Hall D', lastMaintenanceDate: '2026-06-18' },
  { id: 'loom-13', weaverName: 'Murugan C.', status: 'IDLE', currentDesignId: null, sareesCompleted: 0, daysRemaining: 0, location: 'Hall E', lastMaintenanceDate: '2026-06-30' },
  { id: 'loom-14', weaverName: 'Padmavathi N.', status: 'WEAVING', currentDesignId: 'design-008', sareesCompleted: 10, daysRemaining: 10, location: 'Hall E', lastMaintenanceDate: '2026-06-08' },
  { id: 'loom-15', weaverName: 'Annamalai R.', status: 'WEAVING', currentDesignId: 'design-001', sareesCompleted: 7, daysRemaining: 30, location: 'Hall E', lastMaintenanceDate: '2026-05-25' },
  { id: 'loom-16', weaverName: 'Bhavani K.', status: 'WARP_SETUP', currentDesignId: 'design-004', sareesCompleted: 0, daysRemaining: 42, location: 'Hall F', lastMaintenanceDate: '2026-07-12' },
];

// ---- LEDGER ENTRIES (Cooperative) ----
// API_INTEGRATION: GET /api/cooperative/ledger → LedgerEntry[]
export const MOCK_LEDGER: LedgerEntry[] = [
  { id: 'le-001', date: '2026-07-15', type: 'SALES_REVENUE', description: 'Kanjivaram Warp Batch #47 — 12 sarees delivered to Chennai Boutique', amount: 156000 },
  { id: 'le-002', date: '2026-07-14', type: 'WAGE_PAYOUT', description: 'Narayanan S. — Warp Batch #47 Completion (Complexity L5)', amount: -96000 },
  { id: 'le-003', date: '2026-07-13', type: 'MATERIAL_EXPENSE', description: 'Pure Mulberry Silk Yarn — 48kg for 4 looms', amount: -86400 },
  { id: 'le-004', date: '2026-07-12', type: 'MATERIAL_EXPENSE', description: 'Real Zari (Gold Thread) — 12 spools', amount: -28800 },
  { id: 'le-005', date: '2026-07-10', type: 'SALES_REVENUE', description: 'Banarasi Warp Batch #38 — 12 sarees to Delhi Silk House', amount: 132000 },
  { id: 'le-006', date: '2026-07-08', type: 'WAGE_PAYOUT', description: 'Meenakshi R. — Warp Batch #38 Completion (Complexity L4)', amount: -72000 },
  { id: 'le-007', date: '2026-07-05', type: 'MATERIAL_EXPENSE', description: 'Jacquard Punch Cards — New Design Set #12', amount: -12000 },
  { id: 'le-008', date: '2026-07-03', type: 'SALES_REVENUE', description: 'Paithani Batch #21 — 12 sarees to Pune Textile Fair', amount: 108000 },
  { id: 'le-009', date: '2026-07-01', type: 'WAGE_PAYOUT', description: 'Krishnaswamy P. — Warp Drawing Setup Fee', amount: -6000 },
  { id: 'le-010', date: '2026-06-28', type: 'MATERIAL_EXPENSE', description: 'Natural Indigo Dye — 8kg batch', amount: -9600 },
  { id: 'le-011', date: '2026-06-25', type: 'SALES_REVENUE', description: 'Chanderi Batch #14 — 12 sarees to Mumbai Fashion Week', amount: 89400 },
  { id: 'le-012', date: '2026-06-22', type: 'WAGE_PAYOUT', description: 'All Weavers — Advance Wage July', amount: -48000 },
  { id: 'le-013', date: '2026-06-20', type: 'MATERIAL_EXPENSE', description: 'Loom Maintenance Parts — 2 looms', amount: -15000 },
  { id: 'le-014', date: '2026-06-18', type: 'SALES_REVENUE', description: 'Pochampally Batch #09 — 12 sarees online export', amount: 76800 },
  { id: 'le-015', date: '2026-06-15', type: 'MATERIAL_EXPENSE', description: 'Cotton Warp Thread — Bulk Order', amount: -22000 },
  { id: 'le-016', date: '2026-06-12', type: 'WAGE_PAYOUT', description: 'Selvam K. — Warp Batch #31 (Complexity L5)', amount: -96000 },
  { id: 'le-017', date: '2026-06-10', type: 'SALES_REVENUE', description: 'Gadwal Batch #18 — 12 sarees to Hyderabad Co-op', amount: 96000 },
  { id: 'le-018', date: '2026-06-08', type: 'MATERIAL_EXPENSE', description: 'Silver Zari Thread — 6 spools', amount: -14400 },
  { id: 'le-019', date: '2026-06-05', type: 'WAGE_PAYOUT', description: 'Padmavathi N. — Uppada Batch (Complexity L4)', amount: -72000 },
  { id: 'le-020', date: '2026-06-01', type: 'SALES_REVENUE', description: 'Kanjivaram Temple Batch — 12 sarees wedding season', amount: 192000 },
];

// ---- TRENDING DESIGNS ----
// API_INTEGRATION: GET /api/demand-radar/trends → TrendingDesign[]
// Source: Scrapy spider targeting Pinterest regional textile tags
export const MOCK_TRENDS: TrendingDesign[] = [
  {
    id: 'trend-001',
    designId: 'design-001',
    motifName: 'Kanjivaram Peacock with Wedding Gold',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&q=80',
    engagementScore: 18420,
    saves: 12300,
    pins: 4890,
    comments: 1230,
    hasExistingAsset: true,
    trendCategory: 'Wedding Silk',
  },
  {
    id: 'trend-002',
    designId: '',
    motifName: 'Banarasi Meenakari Lotus Field',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300&q=80',
    engagementScore: 14750,
    saves: 9800,
    pins: 3800,
    comments: 1150,
    hasExistingAsset: false,
    trendCategory: 'Festive Ethnic',
  },
  {
    id: 'trend-003',
    designId: 'design-004',
    motifName: 'Chanderi Minimal Geometric',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&q=80',
    engagementScore: 11200,
    saves: 7800,
    pins: 2800,
    comments: 600,
    hasExistingAsset: true,
    trendCategory: 'Daily Wear',
  },
  {
    id: 'trend-004',
    designId: '',
    motifName: 'Pochampally Abstract Ikat Modern',
    imageUrl: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=300&q=80',
    engagementScore: 9680,
    saves: 6400,
    pins: 2480,
    comments: 800,
    hasExistingAsset: false,
    trendCategory: 'Contemporary Fusion',
  },
  {
    id: 'trend-005',
    designId: 'design-005',
    motifName: 'Kanjivaram Temple Chariot Border',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&q=80',
    engagementScore: 8920,
    saves: 5900,
    pins: 2420,
    comments: 600,
    hasExistingAsset: true,
    trendCategory: 'Religious Occasions',
  },
  {
    id: 'trend-006',
    designId: '',
    motifName: 'Uppada Sheer Floral Pastel',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300&q=80',
    engagementScore: 7340,
    saves: 4900,
    pins: 1940,
    comments: 500,
    hasExistingAsset: false,
    trendCategory: 'Summer Light',
  },
];

// ---- SCHEDULE BLOCKS (60-day timeline) ----
// API_INTEGRATION: GET /api/cooperative/schedule → ScheduleBlock[]
// Computed by PyJobShop / Google OR-Tools engine
export const MOCK_SCHEDULE_BLOCKS: ScheduleBlock[] = [
  { id: 'sb-01', loomId: 'loom-01', designId: 'design-001', status: 'WEAVING', startDay: 0, endDay: 12, designName: 'Kanjivaram Peacock', expectedCompletionDate: '2026-07-30' },
  { id: 'sb-02', loomId: 'loom-01', designId: 'design-003', status: 'WARP_SETUP', startDay: 12, endDay: 27, designName: 'Paithani Lotus (Setup)', expectedCompletionDate: '2026-08-14' },
  { id: 'sb-03', loomId: 'loom-01', designId: 'design-003', status: 'WEAVING', startDay: 27, endDay: 51, designName: 'Paithani Lotus', expectedCompletionDate: '2026-09-07' },
  { id: 'sb-04', loomId: 'loom-02', designId: 'design-002', status: 'WEAVING', startDay: 0, endDay: 20, designName: 'Banarasi Butidar', expectedCompletionDate: '2026-08-07' },
  { id: 'sb-05', loomId: 'loom-02', designId: 'design-002', status: 'WARP_SETUP', startDay: 20, endDay: 21, designName: 'Banarasi Butidar (Next Warp)', expectedCompletionDate: '2026-08-08' },
  { id: 'sb-06', loomId: 'loom-02', designId: 'design-002', status: 'WEAVING', startDay: 21, endDay: 41, designName: 'Banarasi Butidar', expectedCompletionDate: '2026-08-28' },
  { id: 'sb-07', loomId: 'loom-03', designId: 'design-003', status: 'WARP_SETUP', startDay: 0, endDay: 15, designName: 'Paithani Lotus (Setup)', expectedCompletionDate: '2026-08-02' },
  { id: 'sb-08', loomId: 'loom-03', designId: 'design-003', status: 'WEAVING', startDay: 15, endDay: 39, designName: 'Paithani Lotus', expectedCompletionDate: '2026-08-26' },
  { id: 'sb-09', loomId: 'loom-04', designId: 'design-001', status: 'WEAVING', startDay: 0, endDay: 6, designName: 'Kanjivaram Peacock', expectedCompletionDate: '2026-07-24' },
  { id: 'sb-10', loomId: 'loom-04', designId: 'design-005', status: 'WARP_SETUP', startDay: 6, endDay: 21, designName: 'Temple Border (Setup)', expectedCompletionDate: '2026-08-08' },
  { id: 'sb-11', loomId: 'loom-04', designId: 'design-005', status: 'WEAVING', startDay: 21, endDay: 51, designName: 'Kanjivaram Temple', expectedCompletionDate: '2026-09-07' },
  { id: 'sb-12', loomId: 'loom-06', designId: 'design-004', status: 'WEAVING', startDay: 0, endDay: 18, designName: 'Chanderi Floral', expectedCompletionDate: '2026-08-05' },
  { id: 'sb-13', loomId: 'loom-07', designId: 'design-005', status: 'WEAVING', startDay: 0, endDay: 21, designName: 'Kanjivaram Temple', expectedCompletionDate: '2026-08-08' },
  { id: 'sb-14', loomId: 'loom-09', designId: 'design-002', status: 'WEAVING', startDay: 0, endDay: 40, designName: 'Banarasi Butidar', expectedCompletionDate: '2026-08-27' },
  { id: 'sb-15', loomId: 'loom-11', designId: 'design-003', status: 'WEAVING', startDay: 0, endDay: 8, designName: 'Paithani Lotus', expectedCompletionDate: '2026-07-26' },
  { id: 'sb-16', loomId: 'loom-12', designId: 'design-007', status: 'WEAVING', startDay: 0, endDay: 28, designName: 'Gadwal Silk', expectedCompletionDate: '2026-08-15' },
  { id: 'sb-17', loomId: 'loom-14', designId: 'design-008', status: 'WEAVING', startDay: 0, endDay: 10, designName: 'Uppada Jamdani', expectedCompletionDate: '2026-07-28' },
  { id: 'sb-18', loomId: 'loom-15', designId: 'design-001', status: 'WEAVING', startDay: 0, endDay: 30, designName: 'Kanjivaram Peacock', expectedCompletionDate: '2026-08-17' },
];

// ---- SOLO ARTISAN DATA ----
// API_INTEGRATION: GET /api/artisan/profile → ArtisanProfile
export const MOCK_ARTISAN_LOOM: Loom = {
  id: 'loom-artisan-01',
  weaverName: 'Saraswathi Devi R.',
  status: 'WEAVING',
  currentDesignId: 'design-001',
  sareesCompleted: 9,
  daysRemaining: 18,
  location: 'Home Studio',
  lastMaintenanceDate: '2026-06-15',
};

// API_INTEGRATION: GET /api/artisan/ledger → ArtisanLedgerEntry[]
export const MOCK_ARTISAN_LEDGER: LedgerEntry[] = [
  { id: 'al-001', date: '2026-07-10', type: 'SALES_REVENUE', description: 'Direct sale — 3 sarees to Lakshmi Boutique', amount: 24000 },
  { id: 'al-002', date: '2026-07-05', type: 'MATERIAL_EXPENSE', description: 'Silk yarn purchase — 4kg', amount: -7200 },
  { id: 'al-003', date: '2026-06-28', type: 'WAGE_PAYOUT', description: 'My wage — Previous warp completion', amount: 96000 },
  { id: 'al-004', date: '2026-06-20', type: 'MATERIAL_EXPENSE', description: 'Zari thread — 2 spools', amount: -4800 },
  { id: 'al-005', date: '2026-06-15', type: 'SALES_REVENUE', description: 'Wedding order — 5 special sarees', amount: 40000 },
  { id: 'al-006', date: '2026-06-10', type: 'MATERIAL_EXPENSE', description: 'Jacquard cards — New design punch', amount: -3000 },
  { id: 'al-007', date: '2026-06-05', type: 'MATERIAL_EXPENSE', description: 'Natural dye set', amount: -2400 },
  { id: 'al-008', date: '2026-05-28', type: 'SALES_REVENUE', description: 'Festive season — 4 sarees bulk', amount: 32000 },
  { id: 'al-009', date: '2026-05-20', type: 'MATERIAL_EXPENSE', description: 'Cotton warp thread', amount: -1800 },
  { id: 'al-010', date: '2026-05-15', type: 'WAGE_PAYOUT', description: 'My wage — Warp batch (Complexity L3)', amount: 72000 },
];

export const MOCK_YARN_DEBT = 18000; // Outstanding yarn advance from supplier

import { advanceDate } from './utils/calendar';
import { DAILY_WAGE } from './utils/constants';
import { LedgerEntry } from '@/types';

export function runFinanceEngine(
  currentDate: string,
  transactions: LedgerEntry[],
  weavers: any[],
  looms: any[],
  completedSarees: { loomId: string, designId: string }[],
  designs: any[],
  accrueWages: boolean = true
) {
  const updatedTransactions = [...transactions];
  let dailyRevenue = 0;
  let dailyWageExpense = 0;
  let dailyMaterialCost = 0;

  // 1. Calculate Revenue from completed sarees (B2B Orders are usually on Net-45 terms)
  if (accrueWages) {
    for (const completed of completedSarees) {
      const design = designs.find(d => d.id === completed.designId);
      if (design) {
        dailyRevenue += design.expectedSellingPrice;
        
        updatedTransactions.unshift({
          id: `tx-sale-${Date.now()}-${Math.random()}`,
          date: currentDate,
          type: 'Income',
          category: 'Sales Revenue',
          amount: design.expectedSellingPrice,
          status: 'PENDING',
          dueDate: advanceDate(currentDate, 45), // 45-day payment terms
          description: `Sale of 1 ${design.name} (Loom ${completed.loomId.toUpperCase()}) - Net 45 Terms`
        });

        // Rough material cost approximation for the simulation
        const materialCost = (design.silkRequired * 4000) + (design.zariRequired * 8000);
        dailyMaterialCost += materialCost;

        // Material expense is PAID immediately (Cash leaves the business)
        updatedTransactions.unshift({
          id: `tx-mat-${Date.now()}-${Math.random()}`,
          date: currentDate,
          type: 'Expense',
          category: 'Material Expense',
          amount: materialCost,
          status: 'PAID',
          description: `Material consumed for ${design.name}`
        });
      }
    }
  }

  // 2. Calculate daily wages for active weavers
  if (accrueWages) {
    const activeLooms = looms.filter(l => l.status === 'WEAVING' || l.status === 'WARP_SETUP');
    const activeWeaversCount = activeLooms.length;
    dailyWageExpense = activeWeaversCount * DAILY_WAGE;

    if (dailyWageExpense > 0) {
      // Wages are PAID immediately (Cash leaves the business)
      updatedTransactions.unshift({
        id: `tx-wage-${Date.now()}-${Math.random()}`,
        date: currentDate,
        type: 'Expense',
        category: 'Wage Payout',
        amount: dailyWageExpense,
        status: 'PAID',
        description: `Daily wages for ${activeWeaversCount} active weavers`
      });
    }
  }

  // Calculate totals
  const totalIncome = updatedTransactions.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = updatedTransactions.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
  const profit = totalIncome - totalExpense;

  // Working Capital (Cash on Hand) = Base Capital + Only PAID Income - PAID Expenses
  const paidIncome = updatedTransactions.filter(t => t.type === 'Income' && t.status === 'PAID').reduce((s, t) => s + t.amount, 0);
  const cashFlow = 1500000 + paidIncome - totalExpense; // Expenses are always paid immediately in this model

  const pendingReceivables = updatedTransactions.filter(t => t.type === 'Income' && t.status === 'PENDING').reduce((s, t) => s + t.amount, 0);

  return {
    transactions: updatedTransactions.slice(0, 200), // Keep last 200
    dailyStats: {
      revenue: dailyRevenue,
      wages: dailyWageExpense,
      materials: dailyMaterialCost,
      profit: dailyRevenue - (dailyWageExpense + dailyMaterialCost)
    },
    totalStats: {
      totalIncome,
      totalExpense,
      profit,
      cashFlow,
      pendingReceivables
    }
  };
}

import { EventLogEntry, Loom } from '@/types';
import { advanceDate } from './utils/calendar';

// Define some predefined scenario dates for demo purposes
// But also allow random chance based on loom metrics
const SCRIPTED_EVENTS = [
  {
    date: '2026-07-25',
    type: 'INVENTORY',
    title: 'Supplier Delay',
    description: 'Market update: Supplier informed a five-day transport delay for zari shipment.',
    impact: 'Zari shipments delayed',
    apply: (state: any) => {
      // Find zari and delay restock
      state.inventory.goldZari.restockLeadTime += 5;
    }
  },
  {
    date: '2026-07-28',
    type: 'MARKET',
    title: 'Bulk Order Cancelled',
    description: 'Market update: Chennai Silks cancelled their bulk order of 50 sarees due to overstocking.',
    impact: 'Demand score reduced',
    apply: (state: any) => {
      // Find a large pending order and cancel it
      const order = state.orders.find((o: any) => o.status === 'Pending' && o.quantity > 10);
      if (order) order.status = 'Cancelled';
    }
  },
  {
    date: '2026-08-05',
    type: 'MARKET',
    title: 'Market Intelligence',
    description: 'Market update: High volume of enquiries for Design 001 matching recent bridal trends.',
    impact: 'Orders for Design 001 spiked',
    apply: (state: any) => {
      state.orders.push({
        id: `ord-viral-${Date.now()}`,
        date: state.cooperative.currentSimulatedDate,
        customerName: "Boutique Trend Setters",
        designId: "design-001",
        quantity: 45,
        status: "Pending",
        deadline: advanceDate(state.cooperative.currentSimulatedDate, 30)
      });
    }
  }
];

export function runEventEngine(
  currentDate: string,
  state: any, // The full mutable state object
  eventLog: EventLogEntry[]
) {
  const newEvents: EventLogEntry[] = [];

  // 1. Process Scripted Events
  for (const scripted of SCRIPTED_EVENTS) {
    if (scripted.date === currentDate) {
      scripted.apply(state);
      newEvents.push({
        id: `evt-script-${Date.now()}-${Math.random()}`,
        date: currentDate,
        title: scripted.title,
        description: scripted.description,
        type: scripted.type as any,
        impact: scripted.impact
      });
    }
  }

  // Random Machine Failures have been removed per user feedback.
  // Events now only originate from:
  // 1. Manager-reported events (Primary - injected via triggerManualEvent)
  // 2. Calendar-driven events (Festivals - computed in demand/production engines)
  // 3. Scripted Demo Events (Processed above)

  // 3. Process Pending Payments (Finance)
  for (const tx of state.transactions) {
    if (tx.status === 'PENDING' && tx.dueDate && currentDate >= tx.dueDate) {
      tx.status = 'PAID';
      newEvents.push({
        id: `evt-finance-${tx.id}-${Date.now()}`,
        date: currentDate,
        title: 'Payment Received',
        description: `Invoice ${tx.id} for ₹${tx.amount.toLocaleString('en-IN')} has been cleared by the customer.`,
        type: 'FINANCE',
        impact: 'Cash flow increased'
      });
    }
  }

  // Update Event Log (prepend)
  return [...newEvents.reverse(), ...eventLog].slice(0, 50); // Keep last 50 events
}

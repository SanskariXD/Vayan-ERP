export function runInventoryEngine(inventory: any, completedSarees: { loomId: string, designId: string }[], designs: any[]) {
  const updatedInventory = { ...inventory };
  const alerts: string[] = [];

  // 1. Process completed sarees (deduct from reserved)
  for (const completed of completedSarees) {
    const design = designs.find(d => d.id === completed.designId);
    if (design) {
      // Deduct from reserved (since it was reserved during setup)
      updatedInventory.silkYarn.reserved -= design.silkRequired;
      updatedInventory.goldZari.reserved -= (design.zariRequired * 0.7); // 70% gold
      updatedInventory.silverZari.reserved -= (design.zariRequired * 0.3); // 30% silver
      
      // Packaging is taken from available (assuming not reserved upfront)
      updatedInventory.packaging.available -= 1;
    }
  }

  // 2. Prevent negative reservations (safety check)
  if (updatedInventory.silkYarn.reserved < 0) updatedInventory.silkYarn.reserved = 0;
  if (updatedInventory.goldZari.reserved < 0) updatedInventory.goldZari.reserved = 0;
  if (updatedInventory.silverZari.reserved < 0) updatedInventory.silverZari.reserved = 0;

  // 3. Process Incoming Shipments (simulated via restockLeadTime in EventEngine/Finance, but for simplicity we'll just check thresholds here)
  
  // 4. Check thresholds on Available stock (not Total stock)
  if (updatedInventory.silkYarn.available <= updatedInventory.silkYarn.reorderPoint) {
    alerts.push(`Restock Silk Yarn: Available stock (${updatedInventory.silkYarn.available}kg) below reorder point.`);
  }
  if (updatedInventory.goldZari.available <= updatedInventory.goldZari.reorderPoint) {
    alerts.push(`Restock Gold Zari: Available stock (${updatedInventory.goldZari.available} spools) below reorder point.`);
  }
  if (updatedInventory.silverZari.available <= updatedInventory.silverZari.reorderPoint) {
    alerts.push(`Restock Silver Zari: Available stock (${updatedInventory.silverZari.available} spools) below reorder point.`);
  }

  return {
    inventory: updatedInventory,
    alerts
  };
}

export function reserveMaterialsForWarp(inventory: any, design: any, targetSarees: number = 12) {
  const updatedInventory = { ...inventory };
  
  const totalSilk = design.silkRequired * targetSarees;
  const totalGoldZari = (design.zariRequired * 0.7) * targetSarees;
  const totalSilverZari = (design.zariRequired * 0.3) * targetSarees;

  // Check if we have enough available
  if (updatedInventory.silkYarn.available >= totalSilk) {
    updatedInventory.silkYarn.available -= totalSilk;
    updatedInventory.silkYarn.reserved += totalSilk;
  }
  
  if (updatedInventory.goldZari.available >= totalGoldZari) {
    updatedInventory.goldZari.available -= totalGoldZari;
    updatedInventory.goldZari.reserved += totalGoldZari;
  }

  if (updatedInventory.silverZari.available >= totalSilverZari) {
    updatedInventory.silverZari.available -= totalSilverZari;
    updatedInventory.silverZari.reserved += totalSilverZari;
  }

  return updatedInventory;
}

export function checkMaterialAvailability(inventory: any, design: any, targetSarees: number = 12): boolean {
  const totalSilk = design.silkRequired * targetSarees;
  const totalGoldZari = (design.zariRequired * 0.7) * targetSarees;
  const totalSilverZari = (design.zariRequired * 0.3) * targetSarees;

  return (
    inventory.silkYarn.available >= totalSilk &&
    inventory.goldZari.available >= totalGoldZari &&
    inventory.silverZari.available >= totalSilverZari
  );
}

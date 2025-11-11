// Real Plumbing Calculations based on UPC/IPC

// Water Supply Fixture Units (WSFU) per UPC Table 6-3
export const fixtureUnits: Record<string, number> = {
  'Water Closet (Tank)': 3,
  'Water Closet (Flush Valve)': 5,
  'Urinal (Flush Valve)': 5,
  'Urinal (Tank)': 3,
  'Lavatory': 1,
  'Sink (Kitchen)': 2,
  'Sink (Service)': 3,
  'Bathtub': 3,
  'Shower': 2,
  'Dishwasher (Domestic)': 2,
  'Washing Machine': 3,
  'Drinking Fountain': 0.5,
  'Hose Bibb': 3,
}

/**
 * Calculate total fixture units for a system
 * @param fixtures - Array of fixture counts
 * @returns Total Water Supply Fixture Units (WSFU)
 */
export function calculateTotalFixtureUnits(fixtures: Record<string, number>): number {
  let total = 0
  for (const [fixtureName, count] of Object.entries(fixtures)) {
    const units = fixtureUnits[fixtureName] || 1
    total += units * count
  }
  return total
}

/**
 * Convert fixture units to flow rate (GPM) using Hunter's Curve
 * @param fixtureUnits - Total WSFU
 * @returns Flow rate in gallons per minute (GPM)
 */
export function fixtureUnitsToGPM(wsfu: number): number {
  // Hunter's Curve approximation for predominately flush tanks
  // Formula: GPM = √WSFU for small systems
  // For larger systems, use polynomial approximation
  
  if (wsfu <= 0) return 0
  if (wsfu <= 10) return Math.sqrt(wsfu) * 3.5
  if (wsfu <= 50) return Math.pow(wsfu, 0.45) * 8
  if (wsfu <= 200) return Math.pow(wsfu, 0.38) * 15
  
  // For very large systems
  return Math.pow(wsfu, 0.35) * 20
}

/**
 * Calculate water pipe size based on fixture units and length
 * @param fixtureUnits - Total WSFU
 * @param length - Pipe length in feet
 * @param pressureAvailable - Available pressure in PSI
 * @returns Recommended pipe size in inches
 */
export function calculatePipeSize(
  fixtureUnits: number,
  length: number,
  pressureAvailable: number = 50
): string {
  const flowRate = fixtureUnitsToGPM(fixtureUnits)
  
  // Velocity should be 4-8 fps (feet per second) for domestic water
  // Using 5 fps as target
  const targetVelocity = 5 // fps
  
  // Flow rate in cubic feet per second
  const flowCFS = flowRate / (7.48 * 60) // 7.48 gal/cu ft, 60 sec/min
  
  // Required pipe area (square feet)
  const requiredArea = flowCFS / targetVelocity
  
  // Calculate diameter in inches
  const diameter = Math.sqrt((4 * requiredArea) / Math.PI) * 12
  
  // Standard copper pipe sizes (Type L)
  const standardSizes = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12]
  
  // Check pressure loss and adjust if needed
  const frictionLoss = calculateFrictionLoss(flowRate, diameter, length)
  const pressureLoss = frictionLoss * length / 100
  
  // If pressure loss is too high, increase pipe size
  let selectedSize = standardSizes.find(size => size >= diameter) || standardSizes[0]
  
  if (pressureLoss > pressureAvailable * 0.5) {
    // Use next larger size if pressure loss exceeds 50% of available
    const index = standardSizes.indexOf(selectedSize)
    if (index < standardSizes.length - 1) {
      selectedSize = standardSizes[index + 1]
    }
  }
  
  return selectedSize + '"'
}

/**
 * Calculate friction loss in pipe (PSI per 100 feet)
 * Using Hazen-Williams equation with C=140 for copper
 * @param flowRate - Flow rate in GPM
 * @param diameter - Pipe diameter in inches
 * @param length - Pipe length in feet
 * @returns Friction loss in PSI per 100 feet
 */
export function calculateFrictionLoss(
  flowRate: number,
  diameter: number,
  length: number
): number {
  const C = 140 // Hazen-Williams coefficient for copper
  
  // Hazen-Williams equation
  // h = (4.52 × Q^1.85) / (C^1.85 × d^4.87)
  // Where h is head loss in feet per 100 feet
  
  const headLoss = (4.52 * Math.pow(flowRate, 1.85)) / 
                   (Math.pow(C, 1.85) * Math.pow(diameter, 4.87))
  
  // Convert feet of head to PSI (1 foot = 0.433 PSI)
  const pressureLoss = headLoss * 0.433
  
  return Math.round(pressureLoss * 100) / 100
}

/**
 * Calculate drain pipe size using Drainage Fixture Units (DFU)
 * @param drainageFixtureUnits - Total DFU
 * @param slope - Pipe slope (1/8", 1/4", 1/2" per foot)
 * @returns Recommended drain pipe size in inches
 */
export function calculateDrainPipeSize(
  drainageFixtureUnits: number,
  slope: number = 0.25 // 1/4" per foot
): string {
  // UPC Table 7-6: Maximum DFU capacity for various pipe sizes
  interface DrainCapacity {
    size: number
    dfu: number
  }
  
  const drainCapacities: DrainCapacity[] = [
    { size: 1.5, dfu: 3 },
    { size: 2, dfu: 6 },
    { size: 2.5, dfu: 12 },
    { size: 3, dfu: 20 },
    { size: 4, dfu: 160 },
    { size: 5, dfu: 360 },
    { size: 6, dfu: 620 },
    { size: 8, dfu: 1400 },
    { size: 10, dfu: 2500 },
    { size: 12, dfu: 3900 },
  ]
  
  // Adjust for slope (1/4" slope is baseline)
  const slopeFactor = Math.sqrt(slope / 0.25)
  const adjustedDFU = drainageFixtureUnits / slopeFactor
  
  // Find appropriate size
  const selectedSize = drainCapacities.find(cap => cap.dfu >= adjustedDFU)
  
  return (selectedSize?.size || 12) + '"'
}

/**
 * Calculate hot water heater capacity
 * @param fixtureCount - Number of fixtures
 * @param peakDemand - Peak demand factor (0.3-0.5 typical)
 * @returns Required tank capacity in gallons and recovery rate in GPH
 */
export function calculateWaterHeaterSize(
  fixtureCount: number,
  peakDemand: number = 0.4
): { tankCapacity: number; recoveryRate: number } {
  // Rule of thumb: 10-15 gallons per fixture
  const baseCapacity = fixtureCount * 12
  
  // Apply peak demand factor
  const tankCapacity = Math.ceil(baseCapacity * peakDemand / 10) * 10 // Round to nearest 10
  
  // Recovery rate should handle 70% of peak demand per hour
  const recoveryRate = Math.ceil(baseCapacity * peakDemand * 0.7)
  
  return {
    tankCapacity,
    recoveryRate,
  }
}

// Real Electrical Calculations based on NEC (National Electrical Code)

/**
 * Calculate electrical demand load using NEC Article 220
 * @param connectedLoad - Connected load in watts
 * @param demandFactor - Demand factor (0-1)
 * @returns Demand load in watts
 */
export function calculateDemandLoad(connectedLoad: number, demandFactor: number): number {
  return Math.round(connectedLoad * demandFactor)
}

/**
 * Calculate current (amperage) using Ohm's Law
 * @param load - Load in watts
 * @param voltage - Voltage (120, 208, 240, 480)
 * @param phases - Number of phases (1 or 3)
 * @param powerFactor - Power factor (typically 0.8-1.0)
 * @returns Current in amperes
 */
export function calculateCurrent(
  load: number,
  voltage: number,
  phases: number,
  powerFactor: number = 0.85
): number {
  let current: number
  
  if (phases === 3) {
    // Three-phase: I = P / (√3 × V × PF)
    current = load / (Math.sqrt(3) * voltage * powerFactor)
  } else {
    // Single-phase: I = P / (V × PF)
    current = load / (voltage * powerFactor)
  }
  
  return Math.round(current * 10) / 10 // Round to 1 decimal
}

/**
 * Calculate breaker size per NEC 210.20
 * @param current - Continuous current in amperes
 * @param isContinuous - Whether load is continuous (>3 hours)
 * @returns Recommended breaker size in amperes
 */
export function calculateBreakerSize(current: number, isContinuous: boolean = true): number {
  // Continuous loads must not exceed 80% of breaker rating
  const requiredRating = isContinuous ? current / 0.8 : current
  
  // Standard breaker sizes per NEC
  const standardSizes = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 
                         110, 125, 150, 175, 200, 225, 250, 300, 350, 400, 
                         450, 500, 600, 700, 800, 1000, 1200]
  
  // Select next larger standard size
  const breakerSize = standardSizes.find(size => size >= requiredRating) || standardSizes[standardSizes.length - 1]
  
  return breakerSize
}

/**
 * Calculate wire size (AWG) based on ampacity per NEC Table 310.16
 * @param current - Current in amperes
 * @param material - Conductor material ('copper' or 'aluminum')
 * @param tempRating - Temperature rating (60, 75, 90°C)
 * @returns Wire size in AWG
 */
export function calculateWireSize(
  current: number,
  material: 'copper' | 'aluminum' = 'copper',
  tempRating: number = 75
): string {
  // NEC Table 310.16 ampacity values for 75°C copper in conduit
  const copperAmpacity75C: Record<string, number> = {
    '14': 20,
    '12': 25,
    '10': 35,
    '8': 50,
    '6': 65,
    '4': 85,
    '3': 100,
    '2': 115,
    '1': 130,
    '1/0': 150,
    '2/0': 175,
    '3/0': 200,
    '4/0': 230,
    '250': 255,
    '300': 285,
    '350': 310,
    '400': 335,
    '500': 380,
    '600': 420,
    '750': 475,
    '1000': 545,
  }
  
  // Aluminum is about 62% of copper ampacity
  const ampacityTable = material === 'copper' ? copperAmpacity75C : 
                        Object.fromEntries(Object.entries(copperAmpacity75C).map(([size, amp]) => [size, Math.round(amp * 0.62)]))
  
  // Apply temperature correction if needed
  const tempFactors: Record<number, number> = {
    60: 0.88,
    75: 1.0,
    90: 1.04,
  }
  const tempFactor = tempFactors[tempRating] || 1.0
  
  // Find appropriate wire size (80% derating for continuous loads)
  const requiredAmpacity = current / 0.8
  
  for (const [size, ampacity] of Object.entries(ampacityTable)) {
    if (ampacity * tempFactor >= requiredAmpacity) {
      return size + ' AWG'
    }
  }
  
  return '1000 kcmil' // Largest size
}

/**
 * Calculate voltage drop per NEC 210.19
 * @param current - Current in amperes
 * @param distance - One-way distance in feet
 * @param voltage - System voltage
 * @param wireSize - Wire size in AWG
 * @param phases - Number of phases (1 or 3)
 * @returns Voltage drop percentage
 */
export function calculateVoltageDrop(
  current: number,
  distance: number,
  voltage: number,
  wireSize: string,
  phases: number
): number {
  // Resistance per 1000 feet for copper conductors at 75°C (Ohms)
  const resistancePer1000ft: Record<string, number> = {
    '14': 3.07,
    '12': 1.93,
    '10': 1.21,
    '8': 0.764,
    '6': 0.491,
    '4': 0.308,
    '3': 0.245,
    '2': 0.194,
    '1': 0.154,
    '1/0': 0.122,
    '2/0': 0.0967,
    '3/0': 0.0766,
    '4/0': 0.0608,
    '250': 0.0515,
    '300': 0.0429,
    '350': 0.0367,
    '400': 0.0321,
    '500': 0.0258,
  }
  
  const sizeKey = wireSize.replace(' AWG', '').replace(' kcmil', '')
  const resistance = resistancePer1000ft[sizeKey] || 0.1
  
  // Calculate voltage drop
  let voltageDrop: number
  if (phases === 3) {
    // Three-phase: Vd = √3 × I × R × L
    voltageDrop = Math.sqrt(3) * current * resistance * (distance / 1000)
  } else {
    // Single-phase: Vd = 2 × I × R × L (2 for round trip)
    voltageDrop = 2 * current * resistance * (distance / 1000)
  }
  
  // Return as percentage
  const voltageDropPercent = (voltageDrop / voltage) * 100
  
  return Math.round(voltageDropPercent * 100) / 100
}

/**
 * Calculate short circuit current
 * @param transformerKVA - Transformer capacity in kVA
 * @param voltage - Secondary voltage
 * @param impedance - Transformer impedance percentage
 * @returns Short circuit current in amperes
 */
export function calculateShortCircuitCurrent(
  transformerKVA: number,
  voltage: number,
  impedance: number = 5.75
): number {
  // Isc = (kVA × 1000) / (√3 × V × Z%)
  const shortCircuitCurrent = (transformerKVA * 1000) / (Math.sqrt(3) * voltage * (impedance / 100))
  
  return Math.round(shortCircuitCurrent)
}

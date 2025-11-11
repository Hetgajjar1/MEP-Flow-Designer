// Real Fire Protection Calculations based on NFPA Standards

/**
 * Calculate sprinkler system requirements per NFPA 13
 * @param area - Protected area in square feet
 * @param hazardClass - Hazard classification
 * @param ceilingHeight - Ceiling height in feet
 * @returns System requirements
 */
export function calculateSprinklerSystem(
  area: number,
  hazardClass: 'Light' | 'Ordinary I' | 'Ordinary II' | 'Extra',
  ceilingHeight: number = 12
): {
  coverage: number // sq ft per head
  density: number // GPM per sq ft
  headCount: number
  flowRate: number // GPM
  pressure: number // PSI
  pipeSize: string
} {
  // NFPA 13 design density (GPM per sq ft)
  const densities: Record<string, number> = {
    Light: 0.10,
    'Ordinary I': 0.15,
    'Ordinary II': 0.20,
    Extra: 0.30,
  }
  
  // Coverage area per sprinkler head (sq ft)
  const coverages: Record<string, number> = {
    Light: 225, // 15' x 15'
    'Ordinary I': 130, // ~11' x 12'
    'Ordinary II': 130,
    Extra: 100, // 10' x 10'
  }
  
  const density = densities[hazardClass] || 0.15
  const coverage = coverages[hazardClass] || 130
  
  // Calculate number of heads
  const headCount = Math.ceil(area / coverage)
  
  // Design area (5 most hydraulically remote heads, minimum 1500 sq ft)
  const designArea = Math.max(1500, coverage * 5)
  
  // Flow rate for design area
  const flowRate = Math.round(designArea * density)
  
  // Pressure requirements (PSI at most remote head)
  const basePressure: Record<string, number> = {
    Light: 7,
    'Ordinary I': 10,
    'Ordinary II': 15,
    Extra: 20,
  }
  
  // Add elevation pressure (0.433 PSI per foot of height)
  const elevationPressure = ceilingHeight * 0.433
  
  // Add friction loss estimate (30% of base)
  const totalPressure = Math.round(basePressure[hazardClass] + elevationPressure + (basePressure[hazardClass] * 0.3))
  
  // Main pipe sizing based on flow rate
  let pipeSize: string
  if (flowRate < 100) pipeSize = '2"'
  else if (flowRate < 200) pipeSize = '2.5"'
  else if (flowRate < 400) pipeSize = '3"'
  else if (flowRate < 750) pipeSize = '4"'
  else if (flowRate < 1200) pipeSize = '5"'
  else if (flowRate < 2000) pipeSize = '6"'
  else pipeSize = '8"'
  
  return {
    coverage,
    density,
    headCount,
    flowRate,
    pressure: totalPressure,
    pipeSize,
  }
}

/**
 * Calculate standpipe system requirements per NFPA 14
 * @param floors - Number of floors
 * @param buildingHeight - Total building height in feet
 * @returns Standpipe requirements
 */
export function calculateStandpipeSystem(
  floors: number,
  buildingHeight: number
): {
  systemType: string
  flowRate: number // GPM
  pressure: number // PSI
  pipeSize: string
  hoseConnections: number
} {
  // Determine system type
  let systemType: string
  let flowRate: number
  
  if (floors <= 3) {
    systemType = 'Class I (2.5" hose)'
    flowRate = 500 // GPM per standpipe
  } else {
    systemType = 'Class I (2.5" hose)'
    flowRate = 500 // first standpipe + 250 for each additional (max 1250)
    flowRate = Math.min(1250, 500 + ((floors - 3) * 250))
  }
  
  // Pressure at topmost outlet (minimum 100 PSI residual)
  const staticPressure = 100 // PSI
  const elevationPressure = buildingHeight * 0.433 // PSI
  const frictionLoss = buildingHeight * 0.1 // Estimate 0.1 PSI per foot
  
  const totalPressure = Math.round(staticPressure + elevationPressure + frictionLoss)
  
  // Pipe size (typically 4" minimum for Class I)
  const pipeSize = floors <= 5 ? '4"' : '6"'
  
  // Number of hose connections (typically 1 per floor minimum)
  const hoseConnections = floors
  
  return {
    systemType,
    flowRate,
    pressure: totalPressure,
    pipeSize,
    hoseConnections,
  }
}

/**
 * Calculate fire pump requirements per NFPA 20
 * @param totalFlowRequired - Total system demand in GPM
 * @param staticPressure - Available static pressure in PSI
 * @param requiredPressure - Required pressure at highest point in PSI
 * @param elevation - Elevation difference in feet
 * @returns Fire pump specifications
 */
export function calculateFirePump(
  totalFlowRequired: number,
  staticPressure: number,
  requiredPressure: number,
  elevation: number
): {
  pumpCapacity: number // GPM
  pumpPressure: number // PSI
  horsepower: number // HP
  pumpType: string
} {
  // Add 150% safety factor for pump capacity per NFPA 20
  const pumpCapacity = Math.ceil(totalFlowRequired * 1.5 / 100) * 100 // Round to nearest 100 GPM
  
  // Calculate required pump pressure
  const elevationPressure = elevation * 0.433
  const frictionLoss = elevation * 0.15 // Estimate
  const pressureDeficit = requiredPressure - staticPressure + elevationPressure + frictionLoss
  
  const pumpPressure = Math.ceil(Math.max(0, pressureDeficit) / 5) * 5 // Round to nearest 5 PSI
  
  // Calculate horsepower (HP = GPM × PSI / 1714 / efficiency)
  // Assuming 70% pump efficiency
  const horsepower = Math.ceil((pumpCapacity * pumpPressure) / (1714 * 0.70) / 5) * 5 // Round to nearest 5 HP
  
  // Determine pump type
  let pumpType: string
  if (pumpCapacity <= 1500 && pumpPressure <= 100) {
    pumpType = 'Horizontal Split Case'
  } else if (pumpCapacity <= 1000 && pumpPressure > 100) {
    pumpType = 'Vertical Turbine'
  } else {
    pumpType = 'Horizontal Split Case (Large)'
  }
  
  return {
    pumpCapacity,
    pumpPressure,
    horsepower,
    pumpType,
  }
}

/**
 * Calculate fire hydrant flow requirements
 * @param buildingArea - Building area in square feet
 * @param constructionType - Type of construction
 * @returns Required fire flow in GPM
 */
export function calculateFireHydrantFlow(
  buildingArea: number,
  constructionType: 'Type I' | 'Type II' | 'Type III' | 'Type IV' | 'Type V'
): number {
  // ISO formula: Fire Flow = C × (Area)^0.5
  // Where C is construction factor
  
  const constructionFactors: Record<string, number> = {
    'Type I': 0.6, // Fire resistive
    'Type II': 0.8, // Noncombustible
    'Type III': 1.0, // Ordinary
    'Type IV': 0.8, // Heavy timber
    'Type V': 1.2, // Wood frame
  }
  
  const C = constructionFactors[constructionType] || 1.0
  
  // Calculate base fire flow
  let fireFlow = C * Math.sqrt(buildingArea) * 18
  
  // Apply limits (minimum 500 GPM, maximum 12,000 GPM)
  fireFlow = Math.max(500, Math.min(12000, fireFlow))
  
  // Round to nearest 250 GPM
  return Math.round(fireFlow / 250) * 250
}

/**
 * Calculate sprinkler head spacing
 * @param coverage - Coverage area per head in sq ft
 * @returns Maximum spacing dimensions
 */
export function calculateHeadSpacing(coverage: number): { maxSpacing: number; maxDistance: number } {
  // Maximum spacing between heads
  const maxSpacing = Math.sqrt(coverage)
  
  // Maximum distance from wall (half the spacing)
  const maxDistance = maxSpacing / 2
  
  return {
    maxSpacing: Math.round(maxSpacing * 10) / 10,
    maxDistance: Math.round(maxDistance * 10) / 10,
  }
}

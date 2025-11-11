// Real HVAC Calculations based on ASHRAE Standards

/**
 * Calculate heating load using simplified ASHRAE method
 * @param area - Floor area in square feet
 * @param occupancy - Number of occupants
 * @param outdoorTemp - Design outdoor temperature (°F)
 * @param indoorTemp - Design indoor temperature (°F)
 * @returns Heating load in BTU/hr
 */
export function calculateHeatingLoad(
  area: number,
  occupancy: number,
  outdoorTemp: number = 0,
  indoorTemp: number = 70
): number {
  // Heat loss through building envelope (30 BTU/hr per sq ft avg)
  const envelopeLoss = area * 30
  
  // Temperature difference factor
  const tempDiff = indoorTemp - outdoorTemp
  const tempFactor = tempDiff / 70 // normalized to 70°F difference
  
  // Infiltration load (0.018 BTU/hr/sq ft per °F)
  const infiltrationLoss = area * 0.018 * tempDiff
  
  // Occupancy load (negligible for heating, bodies add heat)
  const occupancyLoad = occupancy * -250 // negative because people generate heat
  
  const totalLoad = (envelopeLoss * tempFactor) + infiltrationLoss + occupancyLoad
  
  return Math.max(0, Math.round(totalLoad))
}

/**
 * Calculate cooling load using simplified ASHRAE method
 * @param area - Floor area in square feet
 * @param occupancy - Number of occupants
 * @param outdoorTemp - Design outdoor temperature (°F)
 * @param indoorTemp - Design indoor temperature (°F)
 * @returns Cooling load in BTU/hr
 */
export function calculateCoolingLoad(
  area: number,
  occupancy: number,
  outdoorTemp: number = 95,
  indoorTemp: number = 75
): number {
  // Solar heat gain (40 BTU/hr per sq ft average)
  const solarGain = area * 40
  
  // Conduction through envelope (15 BTU/hr per sq ft)
  const conductionGain = area * 15
  
  // Temperature difference factor
  const tempDiff = outdoorTemp - indoorTemp
  const tempFactor = tempDiff / 20 // normalized to 20°F difference
  
  // Infiltration load
  const infiltrationGain = area * 0.018 * tempDiff
  
  // Internal loads (lights, equipment, people)
  const lightsLoad = area * 1.5 // 1.5 W/sq ft
  const equipmentLoad = area * 1.0 // 1.0 W/sq ft
  const occupancyLoad = occupancy * 250 // 250 BTU/hr per person (sensible)
  const occupancyLatent = occupancy * 200 // 200 BTU/hr per person (latent)
  
  // Convert watts to BTU/hr (1 W = 3.412 BTU/hr)
  const internalLoad = (lightsLoad + equipmentLoad) * 3.412
  
  const totalLoad = (solarGain + conductionGain) * tempFactor + 
                    infiltrationGain + internalLoad + 
                    occupancyLoad + occupancyLatent
  
  return Math.round(totalLoad)
}

/**
 * Calculate required ventilation rate per ASHRAE 62.1
 * @param area - Floor area in square feet
 * @param occupancy - Number of occupants
 * @param spaceType - Type of space (office, classroom, retail, etc.)
 * @returns Required ventilation in CFM
 */
export function calculateVentilationRate(
  area: number,
  occupancy: number,
  spaceType: string = 'office'
): number {
  // ASHRAE 62.1 rates (CFM per person + CFM per sq ft)
  const ventilationRates: Record<string, { perPerson: number; perArea: number }> = {
    office: { perPerson: 5, perArea: 0.06 },
    classroom: { perPerson: 10, perArea: 0.12 },
    retail: { perPerson: 7.5, perArea: 0.12 },
    restaurant: { perPerson: 7.5, perArea: 0.18 },
    warehouse: { perPerson: 0, perArea: 0.06 },
    gym: { perPerson: 20, perArea: 0.06 },
  }
  
  const rates = ventilationRates[spaceType.toLowerCase()] || ventilationRates.office
  
  const ventilation = (occupancy * rates.perPerson) + (area * rates.perArea)
  
  return Math.round(ventilation)
}

/**
 * Calculate equipment capacity in tons
 * @param coolingLoad - Cooling load in BTU/hr
 * @returns Equipment capacity in tons (1 ton = 12,000 BTU/hr)
 */
export function calculateEquipmentCapacity(coolingLoad: number): number {
  const tons = coolingLoad / 12000
  // Round up to nearest 0.5 ton
  return Math.ceil(tons * 2) / 2
}

/**
 * Calculate duct size using equal friction method
 * @param airflow - Airflow in CFM
 * @param velocity - Design velocity in FPM (feet per minute)
 * @returns Duct diameter in inches
 */
export function calculateDuctSize(airflow: number, velocity: number = 1000): number {
  // Area = CFM / Velocity (in square feet)
  const area = airflow / velocity
  
  // Diameter = sqrt(4 * Area / π) converted to inches
  const diameter = Math.sqrt((4 * area) / Math.PI) * 12
  
  // Round to nearest standard duct size
  const standardSizes = [6, 8, 10, 12, 14, 16, 18, 20, 24, 30, 36, 42, 48]
  const closestSize = standardSizes.reduce((prev, curr) => 
    Math.abs(curr - diameter) < Math.abs(prev - diameter) ? curr : prev
  )
  
  return closestSize
}

# MEP Calculations Guide

## Overview

This guide provides the engineering formulas, industry standards, and implementation patterns for real MEP (Mechanical, Electrical, and Plumbing) calculations in Phase 3.

**Current Status**: Phase 1 uses placeholder calculations. This document prepares for real formula implementation.

---

## Industry Standards & Codes

### HVAC
- **ASHRAE** (American Society of Heating, Refrigerating and Air-Conditioning Engineers)
  - ASHRAE 62.1: Ventilation for Acceptable Indoor Air Quality
  - ASHRAE 90.1: Energy Standard for Buildings
  - ASHRAE Fundamentals Handbook: Load calculation methods

### Electrical
- **NEC** (National Electrical Code / NFPA 70)
  - Article 220: Branch-Circuit, Feeder, and Service Load Calculations
  - Article 310: Conductors for General Wiring
- **IEEE** Standards for power systems

### Plumbing
- **UPC** (Uniform Plumbing Code)
  - Fixture unit method for water supply
  - Drainage fixture units (DFU)
- **IPC** (International Plumbing Code)

### Fire Protection
- **NFPA 13**: Standard for Installation of Sprinkler Systems
- **NFPA 14**: Standard for Installation of Standpipe Systems
- **NFPA 20**: Standard for Installation of Stationary Pumps

---

## 1. HVAC Load Calculations

### 1.1 Heating Load (BTU/hr)

**Formula** (Simplified Heat Loss Method):
```
Q_heating = UA × ΔT + (CFM × 1.08 × ΔT)
```

Where:
- `Q_heating` = Total heating load (BTU/hr)
- `U` = Overall heat transfer coefficient (BTU/hr·ft²·°F)
- `A` = Building envelope area (ft²)
- `ΔT` = Design temperature difference (°F)
- `CFM` = Ventilation air (cubic feet per minute)
- `1.08` = Constant for air (specific heat × density)

**Detailed Calculation**:
```javascript
function calculateHeatingLoad(inputs) {
  const {
    wallArea,          // ft²
    roofArea,          // ft²
    windowArea,        // ft²
    insulationR,       // R-value
    outdoorTemp,       // °F (winter design)
    indoorTemp = 70,   // °F (comfort)
    ventilationCFM,    // CFM
  } = inputs;

  // U-values (BTU/hr·ft²·°F) = 1/R
  const uWall = 1 / insulationR.wall;
  const uRoof = 1 / insulationR.roof;
  const uWindow = 1 / insulationR.window;

  const tempDiff = indoorTemp - outdoorTemp;

  // Transmission losses
  const wallLoss = wallArea * uWall * tempDiff;
  const roofLoss = roofArea * uRoof * tempDiff;
  const windowLoss = windowArea * uWindow * tempDiff;

  // Infiltration/ventilation loss
  const ventilationLoss = ventilationCFM * 1.08 * tempDiff;

  const totalLoad = wallLoss + roofLoss + windowLoss + ventilationLoss;

  return {
    heatingLoad: Math.round(totalLoad),
    breakdown: {
      walls: Math.round(wallLoss),
      roof: Math.round(roofLoss),
      windows: Math.round(windowLoss),
      ventilation: Math.round(ventilationLoss)
    }
  };
}
```

---

### 1.2 Cooling Load (BTU/hr)

**ASHRAE Cooling Load Temperature Difference (CLTD) Method**:
```
Q_cooling = Q_sensible + Q_latent
```

**Sensible Heat Gain**:
```
Q_sensible = (UA × CLTD) + (CFM × 1.08 × ΔT) + Internal_Gains
```

**Latent Heat Gain**:
```
Q_latent = CFM × 0.68 × Δω
```

Where:
- `CLTD` = Cooling Load Temperature Difference (from ASHRAE tables)
- `Δω` = Humidity ratio difference (lbs moisture / lb dry air)
- `0.68` = Constant for latent heat of water vapor

**Implementation**:
```javascript
function calculateCoolingLoad(inputs) {
  const {
    wallArea,
    roofArea,
    windowArea,
    solarHeatGain,     // BTU/hr·ft² (SHGC × Solar Radiation)
    occupancy,         // Number of people
    lighting,          // Watts
    equipment,         // Watts
    ventilationCFM,
    outdoorTemp,       // °F (summer design)
    indoorTemp = 75,   // °F
    outdoorHumidity,   // Relative humidity %
    indoorHumidity = 50 // Relative humidity %
  } = inputs;

  // Sensible gains
  const wallGain = wallArea * (1/15) * (outdoorTemp - indoorTemp); // U ≈ 1/15 for typical wall
  const roofGain = roofArea * (1/20) * (outdoorTemp - indoorTemp);
  const solarGain = windowArea * solarHeatGain;
  const occupancyGain = occupancy * 250; // ~250 BTU/hr per person (sensible)
  const lightingGain = lighting * 3.41; // Watts to BTU/hr
  const equipmentGain = equipment * 3.41;
  const ventilationSensible = ventilationCFM * 1.08 * (outdoorTemp - indoorTemp);

  const sensibleLoad = wallGain + roofGain + solarGain + occupancyGain + 
                       lightingGain + equipmentGain + ventilationSensible;

  // Latent gains (simplified)
  const occupancyLatent = occupancy * 200; // ~200 BTU/hr per person (latent)
  const ventilationLatent = ventilationCFM * 0.68 * 
                            (humidityRatioDiff(outdoorTemp, outdoorHumidity, indoorTemp, indoorHumidity));

  const latentLoad = occupancyLatent + ventilationLatent;

  return {
    coolingLoad: Math.round(sensibleLoad + latentLoad),
    sensible: Math.round(sensibleLoad),
    latent: Math.round(latentLoad),
    breakdown: {
      envelope: Math.round(wallGain + roofGain),
      solar: Math.round(solarGain),
      occupancy: Math.round(occupancyGain + occupancyLatent),
      lighting: Math.round(lightingGain),
      equipment: Math.round(equipmentGain),
      ventilation: Math.round(ventilationSensible + ventilationLatent)
    }
  };
}
```

---

### 1.3 Ventilation (CFM)

**ASHRAE 62.1 Formula**:
```
CFM = Rp × Pz + Ra × Az
```

Where:
- `Rp` = Outdoor air rate per person (CFM/person, from ASHRAE tables)
- `Pz` = Zone population
- `Ra` = Outdoor air rate per unit area (CFM/ft²)
- `Az` = Zone floor area (ft²)

**Example Values** (ASHRAE 62.1-2019):
- Office: Rp = 5 CFM/person, Ra = 0.06 CFM/ft²
- Classroom: Rp = 10 CFM/person, Ra = 0.12 CFM/ft²
- Retail: Rp = 7.5 CFM/person, Ra = 0.12 CFM/ft²

**Implementation**:
```javascript
function calculateVentilation(inputs) {
  const {
    spaceType,      // 'office', 'classroom', 'retail', etc.
    floorArea,      // ft²
    occupancy       // Number of people
  } = inputs;

  const ventilationRates = {
    office: { Rp: 5, Ra: 0.06 },
    classroom: { Rp: 10, Ra: 0.12 },
    retail: { Rp: 7.5, Ra: 0.12 },
    residential: { Rp: 5, Ra: 0.06 }
  };

  const rates = ventilationRates[spaceType] || ventilationRates.office;
  const cfm = (rates.Rp * occupancy) + (rates.Ra * floorArea);

  return {
    ventilationCFM: Math.round(cfm),
    perPerson: rates.Rp,
    perArea: rates.Ra
  };
}
```

---

## 2. Electrical Load Calculations

### 2.1 Total Connected Load (kW)

**NEC Article 220 Method**:
```
Total Load = Lighting + Receptacles + HVAC + Appliances + Motors
```

**Implementation**:
```javascript
function calculateElectricalLoad(inputs) {
  const {
    floorArea,          // ft²
    buildingType,       // 'residential', 'commercial', 'industrial'
    hvacLoad,           // kW
    appliances,         // Array of { name, watts }
    motors              // Array of { hp, efficiency }
  } = inputs;

  // Lighting & receptacle loads (NEC Table 220.12)
  const loadPerSqFt = {
    residential: 3,    // VA/ft²
    commercial: 3.5,
    industrial: 2
  };

  const lightingLoad = (floorArea * loadPerSqFt[buildingType]) / 1000; // Convert VA to kVA, approx kW

  // Appliance load
  const applianceLoad = appliances.reduce((sum, app) => sum + app.watts, 0) / 1000;

  // Motor load (HP to kW: 1 HP ≈ 0.746 kW, adjusted for efficiency)
  const motorLoad = motors.reduce((sum, motor) => {
    return sum + (motor.hp * 0.746 / (motor.efficiency || 0.85));
  }, 0);

  const totalLoad = lightingLoad + applianceLoad + hvacLoad + motorLoad;

  return {
    totalLoad: Math.round(totalLoad * 10) / 10, // Round to 1 decimal
    breakdown: {
      lighting: Math.round(lightingLoad * 10) / 10,
      appliances: Math.round(applianceLoad * 10) / 10,
      hvac: hvacLoad,
      motors: Math.round(motorLoad * 10) / 10
    }
  };
}
```

---

### 2.2 Demand Load (kW) with Demand Factors

**NEC Table 220.42**: Demand factors reduce total connected load.

```
Demand Load = Total Load × Demand Factor
```

**Demand Factors**:
- First 3 kVA @ 100%
- Next 117 kVA @ 35%
- Remainder @ 25%

**Implementation**:
```javascript
function applyDemandFactors(totalLoad) {
  let demand = 0;

  if (totalLoad <= 3) {
    demand = totalLoad;
  } else if (totalLoad <= 120) {
    demand = 3 + ((totalLoad - 3) * 0.35);
  } else {
    demand = 3 + (117 * 0.35) + ((totalLoad - 120) * 0.25);
  }

  return Math.round(demand * 10) / 10;
}
```

---

### 2.3 Amperage Calculation

**Formula** (3-phase):
```
Amperage = (kW × 1000) / (√3 × Voltage × Power Factor)
```

**Single-phase**:
```
Amperage = (kW × 1000) / (Voltage × Power Factor)
```

**Implementation**:
```javascript
function calculateAmperage(kW, voltage = 240, phases = 3, powerFactor = 0.85) {
  let amps;

  if (phases === 3) {
    amps = (kW * 1000) / (Math.sqrt(3) * voltage * powerFactor);
  } else {
    amps = (kW * 1000) / (voltage * powerFactor);
  }

  return Math.round(amps);
}
```

---

## 3. Plumbing Flow Calculations

### 3.1 Water Supply (GPM)

**Fixture Unit Method** (UPC Appendix A):
```
GPM = √(Total Fixture Units)
```

**Fixture Units** (Examples):
- Water closet (flush tank): 3 FU
- Lavatory: 1 FU
- Shower: 2 FU
- Kitchen sink: 2 FU
- Bathtub: 4 FU

**Implementation**:
```javascript
function calculateWaterSupply(fixtures) {
  const fixtureUnits = {
    waterCloset: 3,
    lavatory: 1,
    shower: 2,
    kitchenSink: 2,
    bathtub: 4,
    dishwasher: 2,
    washingMachine: 3
  };

  let totalFU = 0;
  for (const [type, count] of Object.entries(fixtures)) {
    totalFU += (fixtureUnits[type] || 0) * count;
  }

  const gpm = Math.sqrt(totalFU);

  return {
    waterSupplyGPM: Math.round(gpm * 10) / 10,
    totalFixtureUnits: totalFU
  };
}
```

---

### 3.2 Drainage (DFU - Drainage Fixture Units)

**UPC Table 7-3**: Drainage fixture units for various fixtures.

**Fixture DFU Values**:
- Water closet (1.6 gpf): 3 DFU
- Lavatory: 1 DFU
- Shower: 2 DFU
- Bathtub: 2 DFU
- Kitchen sink: 2 DFU

**Implementation**:
```javascript
function calculateDrainage(fixtures) {
  const drainageUnits = {
    waterCloset: 3,
    lavatory: 1,
    shower: 2,
    bathtub: 2,
    kitchenSink: 2,
    dishwasher: 2,
    washingMachine: 3
  };

  let totalDFU = 0;
  for (const [type, count] of Object.entries(fixtures)) {
    totalDFU += (drainageUnits[type] || 0) * count;
  }

  return {
    drainageLoad: totalDFU,
    drainageDFU: totalDFU
  };
}
```

---

### 3.3 Pipe Sizing

**Hunter Curve Method** (convert DFU to GPM, then size pipe):

**UPC Pipe Sizing Table**:
- 1/2": up to 4 FU (2-3 GPM)
- 3/4": up to 10 FU (5-6 GPM)
- 1": up to 30 FU (12-15 GPM)
- 1-1/4": up to 60 FU (25-30 GPM)
- 1-1/2": up to 100 FU (40-50 GPM)
- 2": up to 200 FU (75-100 GPM)

**Implementation**:
```javascript
function sizePipe(fixtureUnits) {
  const pipeSizes = [
    { size: '1/2"', maxFU: 4 },
    { size: '3/4"', maxFU: 10 },
    { size: '1"', maxFU: 30 },
    { size: '1-1/4"', maxFU: 60 },
    { size: '1-1/2"', maxFU: 100 },
    { size: '2"', maxFU: 200 },
    { size: '2-1/2"', maxFU: 350 },
    { size: '3"', maxFU: 600 }
  ];

  const selectedSize = pipeSizes.find(p => p.maxFU >= fixtureUnits);
  return selectedSize ? selectedSize.size : '4" or larger';
}
```

---

## 4. Fire Protection Calculations

### 4.1 Sprinkler Demand (GPM)

**NFPA 13 Method**:
```
GPM = Density × Area / 96.3
```

Where:
- `Density` = Design density (gpm/ft²), depends on occupancy hazard
- `Area` = Design area (ft²), from NFPA 13 curves
- `96.3` = Constant for units conversion

**Occupancy Hazards** (NFPA 13):
- **Light Hazard**: 0.10 gpm/ft² over 1500 ft² (offices, schools)
- **Ordinary Hazard Group 1**: 0.15 gpm/ft² over 1500 ft²
- **Ordinary Hazard Group 2**: 0.20 gpm/ft² over 1500 ft²
- **Extra Hazard**: 0.30-0.60 gpm/ft² over 2500 ft²

**Implementation**:
```javascript
function calculateSprinklerDemand(inputs) {
  const {
    occupancyHazard, // 'light', 'ordinary1', 'ordinary2', 'extra'
    floorArea        // ft²
  } = inputs;

  const densityTable = {
    light: { density: 0.10, designArea: 1500 },
    ordinary1: { density: 0.15, designArea: 1500 },
    ordinary2: { density: 0.20, designArea: 1500 },
    extra: { density: 0.40, designArea: 2500 }
  };

  const config = densityTable[occupancyHazard] || densityTable.ordinary1;
  const gpm = (config.density * config.designArea);

  return {
    sprinklerDemand: Math.round(gpm),
    density: config.density,
    designArea: config.designArea,
    occupancyHazard
  };
}
```

---

### 4.2 Hydrant Flow (GPM)

**NFPA 1142 / ISO Fire Flow**:
```
Fire Flow (GPM) = (C × A^0.5) + (X × P)
```

Where:
- `C` = Construction factor (0.6 - 1.5)
- `A` = Building area (ft²)
- `X` = Exposure factor
- `P` = Communication (common walls) factor

**Simplified Method**:
```
Fire Flow ≈ 250 GPM per floor for commercial buildings
```

**Implementation**:
```javascript
function calculateHydrantFlow(inputs) {
  const {
    buildingArea,     // ft²
    floors,
    buildingType      // 'commercial', 'residential', 'industrial'
  } = inputs;

  // Simplified method
  const baseFlow = buildingType === 'industrial' ? 1500 : 1000;
  const flowPerFloor = 250;

  const totalFlow = baseFlow + (flowPerFloor * (floors - 1));

  return {
    hydrantFlow: Math.round(totalFlow),
    duration: 2, // hours (typical)
    numberOfHydrants: Math.ceil(totalFlow / 750) // ~750 GPM per hydrant
  };
}
```

---

### 4.3 Fire Pump Sizing

**Pump Size = Sprinkler Demand + Hose Allowance**

**NFPA 20**:
```
Pump GPM = Sprinkler GPM + Hose Stream Allowance
Pump Pressure = System Pressure + Elevation Head + Friction Loss
```

**Hose Allowances**:
- Light Hazard: 50-100 GPM
- Ordinary Hazard: 250 GPM
- Extra Hazard: 500 GPM

**Implementation**:
```javascript
function calculateFirePump(inputs) {
  const {
    sprinklerGPM,
    occupancyHazard,
    buildingHeight,    // ft
    systemPressure = 100 // PSI
  } = inputs;

  const hoseAllowance = {
    light: 50,
    ordinary1: 250,
    ordinary2: 250,
    extra: 500
  };

  const hoseGPM = hoseAllowance[occupancyHazard] || 250;
  const totalGPM = sprinklerGPM + hoseGPM;

  // Elevation head: 0.433 PSI per foot of height
  const elevationHead = buildingHeight * 0.433;
  const frictionLoss = 15; // Assume 15 PSI (simplified)
  const totalPressure = systemPressure + elevationHead + frictionLoss;

  return {
    pumpGPM: Math.round(totalGPM),
    pumpPressure: Math.round(totalPressure),
    hoseAllowance: hoseGPM,
    breakdown: {
      system: systemPressure,
      elevation: Math.round(elevationHead),
      friction: frictionLoss
    }
  };
}
```

---

## 5. Integration Patterns

### 5.1 Cloud Function Structure

```javascript
// functions/calculations/hvac.js
exports.computeHVAC = function(inputs) {
  const heating = calculateHeatingLoad(inputs);
  const cooling = calculateCoolingLoad(inputs);
  const ventilation = calculateVentilation(inputs);

  return {
    heatingLoad: heating.heatingLoad,
    coolingLoad: cooling.coolingLoad,
    ventilationCFM: ventilation.ventilationCFM,
    breakdown: {
      heating: heating.breakdown,
      cooling: cooling.breakdown
    },
    recommendations: generateRecommendations(heating, cooling, ventilation)
  };
};

function generateRecommendations(heating, cooling, ventilation) {
  const recommendations = [];

  if (heating.heatingLoad > 100000) {
    recommendations.push('Consider zoned heating for large load');
  }

  if (cooling.sensible / cooling.coolingLoad > 0.8) {
    recommendations.push('High sensible heat ratio - verify insulation');
  }

  return recommendations;
}
```

---

### 5.2 Callable Function Wrapper

```javascript
// functions/index.js
const hvacCalc = require('./calculations/hvac');

exports.calculateHVACLoad = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in');
  }

  const { projectId, inputs } = data;

  try {
    // Fetch project data from Firestore if needed
    const projectDoc = await admin.firestore().collection('projects').doc(projectId).get();
    const projectData = projectDoc.data();

    // Merge project data with inputs
    const calculationInputs = {
      ...projectData,
      ...inputs
    };

    // Perform calculation
    const results = hvacCalc.computeHVAC(calculationInputs);

    // Save results to Firestore
    await admin.firestore()
      .collection('projects').doc(projectId)
      .collection('calculations').doc('hvac')
      .set({
        results,
        calculatedAt: admin.firestore.FieldValue.serverTimestamp(),
        calculatedBy: context.auth.uid
      }, { merge: true });

    return {
      success: true,
      results,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    functions.logger.error('HVAC calculation failed', error);
    throw new functions.https.HttpsError('internal', 'Calculation failed');
  }
});
```

---

## 6. Validation & Error Handling

### 6.1 Input Validation

```javascript
function validateInputs(inputs, required) {
  const errors = [];

  for (const field of required) {
    if (inputs[field] === undefined || inputs[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Range validations
  if (inputs.floorArea !== undefined && inputs.floorArea <= 0) {
    errors.push('Floor area must be positive');
  }

  if (inputs.occupancy !== undefined && inputs.occupancy < 0) {
    errors.push('Occupancy cannot be negative');
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
}
```

---

### 6.2 Unit Conversion

```javascript
function convertUnits(value, fromUnit, toUnit) {
  const conversions = {
    'ft2_to_m2': 0.092903,
    'm2_to_ft2': 10.7639,
    'btu_to_kw': 0.000293071,
    'kw_to_btu': 3412.14,
    'gpm_to_lps': 0.0630902,
    'lps_to_gpm': 15.8503
  };

  const key = `${fromUnit}_to_${toUnit}`;
  return value * (conversions[key] || 1);
}
```

---

## 7. Testing Calculations

### 7.1 Unit Tests

```javascript
// functions/test/hvac.test.js
const { computeHVAC } = require('../calculations/hvac');

describe('HVAC Calculations', () => {
  test('calculates heating load correctly', () => {
    const inputs = {
      wallArea: 1000,
      roofArea: 1000,
      windowArea: 200,
      insulationR: { wall: 19, roof: 30, window: 2 },
      outdoorTemp: 0,
      indoorTemp: 70,
      ventilationCFM: 500
    };

    const result = computeHVAC(inputs);
    expect(result.heatingLoad).toBeGreaterThan(0);
    expect(result.heatingLoad).toBeLessThan(200000); // Sanity check
  });
});
```

---

## 8. Future Enhancements

### 8.1 Advanced Features
- **Climate Data Integration**: Pull weather data from NOAA/ASHRAE databases
- **3D Building Model**: Import BIM/IFC files for automated area calculations
- **Optimization**: AI-driven equipment selection and system optimization
- **Code Compliance**: Auto-check against local building codes
- **Energy Modeling**: DOE-2/EnergyPlus integration for detailed simulations

### 8.2 Machine Learning
- **Load Prediction**: ML models trained on historical building data
- **Anomaly Detection**: Flag unusual calculation results
- **Equipment Recommendation**: Suggest optimal HVAC/electrical equipment

---

## References

- ASHRAE Handbook - Fundamentals (2021)
- NEC 2020 - National Electrical Code
- UPC 2018 - Uniform Plumbing Code
- NFPA 13 (2022) - Sprinkler Systems
- NFPA 20 (2019) - Fire Pumps

---

## Implementation Checklist

Phase 3 Tasks:
- [ ] Create `functions/calculations/` directory
- [ ] Implement HVAC calculation module
- [ ] Implement electrical calculation module
- [ ] Implement plumbing calculation module
- [ ] Implement fire protection calculation module
- [ ] Add unit tests for all calculations
- [ ] Update callable functions to use real calculations
- [ ] Add input validation for all functions
- [ ] Implement unit conversion utilities
- [ ] Add calculation history tracking in Firestore
- [ ] Create calculation report generator (PDF export)
- [ ] Document all formulas and assumptions


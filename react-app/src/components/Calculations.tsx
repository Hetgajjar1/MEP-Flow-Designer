import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calculator, ChevronDown, ChevronRight } from 'lucide-react'
import { 
  calculateHeatingLoad,
  calculateCoolingLoad,
  calculateVentilationRate,
  calculateEquipmentCapacity,
  calculateDuctSize
} from '@/lib/calculations/hvac'
import { 
  calculateDemandLoad,
  calculateCurrent,
  calculateBreakerSize,
  calculateWireSize,
  calculateVoltageDrop,
  calculateShortCircuitCurrent
} from '@/lib/calculations/electrical'
import {
  fixtureUnitsToGPM,
  calculatePipeSize,
  calculateFrictionLoss,
  calculateDrainPipeSize,
  calculateWaterHeaterSize
} from '@/lib/calculations/plumbing'
import {
  calculateSprinklerSystem,
  calculateStandpipeSystem,
  calculateFirePump,
  calculateFireHydrantFlow
} from '@/lib/calculations/fire'
import type { Project } from '@/types'

interface CalculationsProps {
  userId: string
}

interface CollapsibleState {
  hvac: boolean
  electrical: boolean
  plumbing: boolean
  fire: boolean
}

export function Calculations({ userId }: CalculationsProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [open, setOpen] = useState<CollapsibleState>({ hvac: true, electrical: false, plumbing: false, fire: false })

  // HVAC form state
  const [hvacInputs, setHvacInputs] = useState({
    area: 1000,
    occupancy: 10,
    outdoorTemp: 95,
    indoorTemp: 75,
    spaceType: 'office',
    airflow: 1200 // CFM for duct sizing
  })
  const [hvacResult, setHvacResult] = useState<any | null>(null)
  const [savingHvac, setSavingHvac] = useState(false)

  // Electrical form state
  const [elecInputs, setElecInputs] = useState({
    connectedLoad: 50000, // watts
    demandFactor: 0.8,
    voltage: 480,
    phases: 3 as 1 | 3,
    powerFactor: 0.85,
    distance: 150, // feet for voltage drop
    material: 'copper' as 'copper' | 'aluminum',
    tempRating: 75 as 60 | 75 | 90,
    transformerKVA: 500,
    impedance: 5.75
  })
  const [elecResult, setElecResult] = useState<any | null>(null)
  const [savingElec, setSavingElec] = useState(false)

  // Plumbing form state
  const [plumbInputs, setPlumbInputs] = useState({
    fixtureUnits: 40,
    length: 120, // pipe length ft
    pressureAvailable: 50,
    fixtureCount: 25,
    drainageFixtureUnits: 60,
  })
  const [plumbResult, setPlumbResult] = useState<any | null>(null)
  const [savingPlumb, setSavingPlumb] = useState(false)

  // Fire Protection form state
  const [fireInputs, setFireInputs] = useState({
    area: 20000,
    hazardClass: 'Ordinary I' as 'Light' | 'Ordinary I' | 'Ordinary II' | 'Extra',
    ceilingHeight: 15,
    floors: 5,
    buildingHeight: 70,
    staticPressure: 60,
    requiredPressure: 120,
    elevation: 30,
    constructionType: 'Type III' as 'Type I' | 'Type II' | 'Type III' | 'Type IV' | 'Type V'
  })
  const [fireResult, setFireResult] = useState<any | null>(null)
  const [savingFire, setSavingFire] = useState(false)

  // Load projects for selection
  useEffect(() => {
    const q = query(collection(db, 'projects'), where('owner', '==', userId))
    const unsub = onSnapshot(q, (snap) => {
      const list: Project[] = []
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as Project))
      setProjects(list)
      if (!selectedProjectId && list.length) setSelectedProjectId(list[0].id)
      setLoadingProjects(false)
    })
    return () => unsub()
  }, [userId, selectedProjectId])

  // Calculation handlers
  const runHVAC = () => {
    const heatingLoad = calculateHeatingLoad(hvacInputs.area, hvacInputs.occupancy, hvacInputs.outdoorTemp, hvacInputs.indoorTemp)
    const coolingLoad = calculateCoolingLoad(hvacInputs.area, hvacInputs.occupancy, hvacInputs.outdoorTemp, hvacInputs.indoorTemp)
    const ventilationRate = calculateVentilationRate(hvacInputs.area, hvacInputs.occupancy, hvacInputs.spaceType as any)
    const equipmentCapacity = calculateEquipmentCapacity(coolingLoad)
    const ductSize = calculateDuctSize(hvacInputs.airflow)
    setHvacResult({ heatingLoad, coolingLoad, ventilationRate, equipmentCapacity, ductSize })
  }

  const saveHVAC = async () => {
    if (!hvacResult || !selectedProjectId) return
    setSavingHvac(true)
    try {
      await addDoc(collection(db, 'calculations'), {
        projectId: selectedProjectId,
        type: 'HVAC',
        area: hvacInputs.area,
        occupancy: hvacInputs.occupancy,
        heatingLoad: hvacResult.heatingLoad,
        coolingLoad: hvacResult.coolingLoad,
        ventilationRate: hvacResult.ventilationRate,
        equipmentCapacity: hvacResult.equipmentCapacity,
        ductSize: hvacResult.ductSize,
        createdBy: userId,
        createdAt: serverTimestamp(),
      })
    } catch (e) {
      console.error('Error saving HVAC calc', e)
    } finally {
      setSavingHvac(false)
    }
  }

  const runElectrical = () => {
    const demandLoad = calculateDemandLoad(elecInputs.connectedLoad, elecInputs.demandFactor)
    const current = calculateCurrent(demandLoad, elecInputs.voltage, elecInputs.phases, elecInputs.powerFactor)
    const breakerSize = calculateBreakerSize(current, true)
    const wireSize = calculateWireSize(current, elecInputs.material, elecInputs.tempRating)
    const voltageDrop = calculateVoltageDrop(current, elecInputs.distance, elecInputs.voltage, wireSize, elecInputs.phases)
    const shortCircuitCurrent = calculateShortCircuitCurrent(elecInputs.transformerKVA, elecInputs.voltage, elecInputs.impedance)
    setElecResult({ demandLoad, current, breakerSize, wireSize, voltageDrop, shortCircuitCurrent })
  }

  const saveElectrical = async () => {
    if (!elecResult || !selectedProjectId) return
    setSavingElec(true)
    try {
      await addDoc(collection(db, 'calculations'), {
        projectId: selectedProjectId,
        type: 'Electrical',
        connectedLoad: elecInputs.connectedLoad,
        demandFactor: elecInputs.demandFactor,
        demandLoad: elecResult.demandLoad,
        voltage: elecInputs.voltage,
        phases: elecInputs.phases,
        current: elecResult.current,
        breakerSize: elecResult.breakerSize,
        wireSize: elecResult.wireSize,
        voltageDrop: elecResult.voltageDrop,
        shortCircuitCurrent: elecResult.shortCircuitCurrent,
        createdBy: userId,
        createdAt: serverTimestamp(),
      })
    } catch (e) {
      console.error('Error saving electrical calc', e)
    } finally {
      setSavingElec(false)
    }
  }

  const runPlumbing = () => {
    const flowRate = fixtureUnitsToGPM(plumbInputs.fixtureUnits)
    const pipeSize = calculatePipeSize(plumbInputs.fixtureUnits, plumbInputs.length, plumbInputs.pressureAvailable)
    const frictionLoss = calculateFrictionLoss(flowRate, parseFloat(pipeSize), plumbInputs.length)
    const drainPipeSize = calculateDrainPipeSize(plumbInputs.drainageFixtureUnits)
    const waterHeater = calculateWaterHeaterSize(plumbInputs.fixtureCount)
    setPlumbResult({ flowRate, pipeSize, frictionLoss, drainPipeSize, waterHeater })
  }

  const savePlumbing = async () => {
    if (!plumbResult || !selectedProjectId) return
    setSavingPlumb(true)
    try {
      await addDoc(collection(db, 'calculations'), {
        projectId: selectedProjectId,
        type: 'Plumbing',
        fixtureUnits: plumbInputs.fixtureUnits,
        flowRate: plumbResult.flowRate,
        pipeSize: plumbResult.pipeSize,
        frictionLoss: plumbResult.frictionLoss,
        drainPipeSize: plumbResult.drainPipeSize,
        waterHeaterTank: plumbResult.waterHeater.tankCapacity,
        waterHeaterRecovery: plumbResult.waterHeater.recoveryRate,
        createdBy: userId,
        createdAt: serverTimestamp(),
      })
    } catch (e) {
      console.error('Error saving plumbing calc', e)
    } finally {
      setSavingPlumb(false)
    }
  }

  const runFire = () => {
    const sprinkler = calculateSprinklerSystem(fireInputs.area, fireInputs.hazardClass, fireInputs.ceilingHeight)
    const standpipe = calculateStandpipeSystem(fireInputs.floors, fireInputs.buildingHeight)
    const firePump = calculateFirePump(sprinkler.flowRate + standpipe.flowRate, fireInputs.staticPressure, fireInputs.requiredPressure, fireInputs.elevation)
    const hydrantFlow = calculateFireHydrantFlow(fireInputs.area, fireInputs.constructionType)
    setFireResult({ sprinkler, standpipe, firePump, hydrantFlow })
  }

  const saveFire = async () => {
    if (!fireResult || !selectedProjectId) return
    setSavingFire(true)
    try {
      await addDoc(collection(db, 'calculations'), {
        projectId: selectedProjectId,
        type: 'Fire Protection',
        hazardClass: fireInputs.hazardClass,
        sprinklerFlow: fireResult.sprinkler.flowRate,
        sprinklerHeads: fireResult.sprinkler.headCount,
        sprinklerPressure: fireResult.sprinkler.pressure,
        standpipeFlow: fireResult.standpipe.flowRate,
        standpipePressure: fireResult.standpipe.pressure,
        firePumpCapacity: fireResult.firePump.pumpCapacity,
        firePumpPressure: fireResult.firePump.pumpPressure,
        firePumpHP: fireResult.firePump.horsepower,
        hydrantFlow: fireResult.hydrantFlow,
        createdBy: userId,
        createdAt: serverTimestamp(),
      })
    } catch (e) {
      console.error('Error saving fire protection calc', e)
    } finally {
      setSavingFire(false)
    }
  }

  const formatNumber = (n: number, decimals = 0) => n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CALCULATIONS</h1>
          <p className="text-sm text-foreground-muted mt-1">Run engineering-grade MEP system calculations</p>
        </div>
        <div className="flex items-center gap-3">
          {loadingProjects ? (
            <div className="text-foreground-muted text-sm">Loading projects...</div>
          ) : (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-2 bg-background-card border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* HVAC Calculation */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => setOpen(o => ({ ...o, hvac: !o.hvac }))}>
          <div>
            <CardTitle className="text-foreground flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" />HVAC LOAD ANALYSIS</CardTitle>
            <CardDescription>Heating, cooling, ventilation & duct sizing</CardDescription>
          </div>
          {open.hvac ? <ChevronDown className="h-4 w-4 text-foreground-muted" /> : <ChevronRight className="h-4 w-4 text-foreground-muted" />}
        </CardHeader>
        {open.hvac && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-foreground-muted">Area (sq ft)</label>
                <Input type="number" value={hvacInputs.area} onChange={e => setHvacInputs({ ...hvacInputs, area: parseInt(e.target.value)||0 })} />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Occupancy (people)</label>
                <Input type="number" value={hvacInputs.occupancy} onChange={e => setHvacInputs({ ...hvacInputs, occupancy: parseInt(e.target.value)||0 })} />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Space Type</label>
                <select value={hvacInputs.spaceType} onChange={e => setHvacInputs({ ...hvacInputs, spaceType: e.target.value })} className="w-full px-2 py-2 bg-background-card border border-border rounded-md text-foreground text-sm">
                  <option value="office">Office</option>
                  <option value="classroom">Classroom</option>
                  <option value="retail">Retail</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="gym">Gym</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Outdoor Temp (°F)</label>
                <Input type="number" value={hvacInputs.outdoorTemp} onChange={e => setHvacInputs({ ...hvacInputs, outdoorTemp: parseFloat(e.target.value)||0 })} />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Indoor Temp (°F)</label>
                <Input type="number" value={hvacInputs.indoorTemp} onChange={e => setHvacInputs({ ...hvacInputs, indoorTemp: parseFloat(e.target.value)||0 })} />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Airflow (CFM)</label>
                <Input type="number" value={hvacInputs.airflow} onChange={e => setHvacInputs({ ...hvacInputs, airflow: parseInt(e.target.value)||0 })} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" onClick={runHVAC}>Run HVAC</Button>
              {hvacResult && <Button variant="outline" disabled={savingHvac} onClick={saveHVAC}>{savingHvac ? 'Saving...' : 'Save Result'}</Button>}
            </div>
            {hvacResult && (
              <div className="grid grid-cols-5 gap-4 text-sm">
                <ResultBox label="Heating Load" value={`${formatNumber(hvacResult.heatingLoad)} BTU/hr`} />
                <ResultBox label="Cooling Load" value={`${formatNumber(hvacResult.coolingLoad)} BTU/hr`} />
                <ResultBox label="Ventilation" value={`${formatNumber(hvacResult.ventilationRate)} CFM`} />
                <ResultBox label="Equipment" value={`${hvacResult.equipmentCapacity} tons`} />
                <ResultBox label="Duct Size" value={`${hvacResult.ductSize}" dia`} />
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Electrical Calculation */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => setOpen(o => ({ ...o, electrical: !o.electrical }))}>
          <div>
            <CardTitle className="text-foreground flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" />ELECTRICAL LOAD ANALYSIS</CardTitle>
            <CardDescription>Demand, current, breaker & wire sizing, voltage drop</CardDescription>
          </div>
          {open.electrical ? <ChevronDown className="h-4 w-4 text-foreground-muted" /> : <ChevronRight className="h-4 w-4 text-foreground-muted" />}
        </CardHeader>
        {open.electrical && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-foreground-muted">Connected Load (W)</label>
                <Input type="number" value={elecInputs.connectedLoad} onChange={e => setElecInputs({ ...elecInputs, connectedLoad: parseInt(e.target.value)||0 })} />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Demand Factor (0-1)</label>
                <Input type="number" step="0.01" value={elecInputs.demandFactor} onChange={e => setElecInputs({ ...elecInputs, demandFactor: parseFloat(e.target.value)||0 })} />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Voltage (V)</label>
                <select value={elecInputs.voltage} onChange={e => setElecInputs({ ...elecInputs, voltage: parseInt(e.target.value)||480 })} className="w-full px-2 py-2 bg-background-card border border-border rounded-md text-sm text-foreground">
                  <option value={120}>120</option>
                  <option value={208}>208</option>
                  <option value={240}>240</option>
                  <option value={480}>480</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Phases</label>
                <select value={elecInputs.phases} onChange={e => setElecInputs({ ...elecInputs, phases: parseInt(e.target.value) === 3 ? 3 : 1 })} className="w-full px-2 py-2 bg-background-card border border-border rounded-md text-sm text-foreground">
                  <option value={1}>Single</option>
                  <option value={3}>Three</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Power Factor (0-1)</label>
                <Input type="number" step="0.01" value={elecInputs.powerFactor} onChange={e => setElecInputs({ ...elecInputs, powerFactor: parseFloat(e.target.value)||0 })} />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Distance (ft)</label>
                <Input type="number" value={elecInputs.distance} onChange={e => setElecInputs({ ...elecInputs, distance: parseInt(e.target.value)||0 })} />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Material</label>
                <select value={elecInputs.material} onChange={e => setElecInputs({ ...elecInputs, material: e.target.value as any })} className="w-full px-2 py-2 bg-background-card border border-border rounded-md text-sm text-foreground">
                  <option value="copper">Copper</option>
                  <option value="aluminum">Aluminum</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Temp Rating (°C)</label>
                <select value={elecInputs.tempRating} onChange={e => setElecInputs({ ...elecInputs, tempRating: parseInt(e.target.value) as any })} className="w-full px-2 py-2 bg-background-card border border-border rounded-md text-sm text-foreground">
                  <option value={60}>60</option>
                  <option value={75}>75</option>
                  <option value={90}>90</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Transformer kVA</label>
                <Input type="number" value={elecInputs.transformerKVA} onChange={e => setElecInputs({ ...elecInputs, transformerKVA: parseInt(e.target.value)||0 })} />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Impedance (%)</label>
                <Input type="number" step="0.01" value={elecInputs.impedance} onChange={e => setElecInputs({ ...elecInputs, impedance: parseFloat(e.target.value)||0 })} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" onClick={runElectrical}>Run Electrical</Button>
              {elecResult && <Button variant="outline" disabled={savingElec} onClick={saveElectrical}>{savingElec ? 'Saving...' : 'Save Result'}</Button>}
            </div>
            {elecResult && (
              <div className="grid grid-cols-6 gap-4 text-sm">
                <ResultBox label="Demand Load" value={`${formatNumber(elecResult.demandLoad)} W`} />
                <ResultBox label="Current" value={`${formatNumber(elecResult.current,2)} A`} />
                <ResultBox label="Breaker" value={`${elecResult.breakerSize} A`} />
                <ResultBox label="Wire Size" value={elecResult.wireSize} />
                <ResultBox label="Voltage Drop" value={`${formatNumber(elecResult.voltageDrop,2)} %`} />
                <ResultBox label="Short Circuit" value={`${formatNumber(elecResult.shortCircuitCurrent)} A`} />
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Plumbing Calculation */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => setOpen(o => ({ ...o, plumbing: !o.plumbing }))}>
          <div>
            <CardTitle className="text-foreground flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" />PLUMBING SYSTEM ANALYSIS</CardTitle>
            <CardDescription>Flow rate, pipe sizing, friction loss & water heater</CardDescription>
          </div>
          {open.plumbing ? <ChevronDown className="h-4 w-4 text-foreground-muted" /> : <ChevronRight className="h-4 w-4 text-foreground-muted" />}
        </CardHeader>
        {open.plumbing && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-5 gap-4">
              <div>
                <label className="text-xs text-foreground-muted">Fixture Units (WSFU)</label>
                <Input type="number" value={plumbInputs.fixtureUnits} onChange={e => setPlumbInputs({ ...plumbInputs, fixtureUnits: parseInt(e.target.value)||0 })} />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Pipe Length (ft)</label>
                <Input type="number" value={plumbInputs.length} onChange={e => setPlumbInputs({ ...plumbInputs, length: parseInt(e.target.value)||0 })} />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Pressure Available (PSI)</label>
                <Input type="number" value={plumbInputs.pressureAvailable} onChange={e => setPlumbInputs({ ...plumbInputs, pressureAvailable: parseInt(e.target.value)||0 })} />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Fixture Count</label>
                <Input type="number" value={plumbInputs.fixtureCount} onChange={e => setPlumbInputs({ ...plumbInputs, fixtureCount: parseInt(e.target.value)||0 })} />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Drainage Fixture Units (DFU)</label>
                <Input type="number" value={plumbInputs.drainageFixtureUnits} onChange={e => setPlumbInputs({ ...plumbInputs, drainageFixtureUnits: parseInt(e.target.value)||0 })} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" onClick={runPlumbing}>Run Plumbing</Button>
              {plumbResult && <Button variant="outline" disabled={savingPlumb} onClick={savePlumbing}>{savingPlumb ? 'Saving...' : 'Save Result'}</Button>}
            </div>
            {plumbResult && (
              <div className="grid grid-cols-5 gap-4 text-sm">
                <ResultBox label="Flow Rate" value={`${formatNumber(plumbResult.flowRate,2)} GPM`} />
                <ResultBox label="Pipe Size" value={`${plumbResult.pipeSize}"`} />
                <ResultBox label="Friction Loss" value={`${formatNumber(plumbResult.frictionLoss,2)} PSI/100ft`} />
                <ResultBox label="Drain Pipe" value={`${plumbResult.drainPipeSize}"`} />
                <ResultBox label="Water Heater" value={`${plumbResult.waterHeater.tankCapacity} gal / ${formatNumber(plumbResult.waterHeater.recoveryRate)} GPH`} />
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Fire Protection Calculation */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => setOpen(o => ({ ...o, fire: !o.fire }))}>
          <div>
            <CardTitle className="text-foreground flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" />FIRE PROTECTION ANALYSIS</CardTitle>
            <CardDescription>Sprinkler, standpipe, pump sizing & hydrant flow</CardDescription>
          </div>
          {open.fire ? <ChevronDown className="h-4 w-4 text-foreground-muted" /> : <ChevronRight className="h-4 w-4 text-foreground-muted" />}
        </CardHeader>
        {open.fire && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-5 gap-4">
              <div>
                <label className="text-xs text-foreground-muted">Area (sq ft)</label>
                <Input type="number" value={fireInputs.area} onChange={e => setFireInputs({ ...fireInputs, area: parseInt(e.target.value)||0 })} />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Hazard Class</label>
                <select value={fireInputs.hazardClass} onChange={e => setFireInputs({ ...fireInputs, hazardClass: e.target.value as any })} className="w-full px-2 py-2 bg-background-card border border-border rounded-md text-sm text-foreground">
                  <option value="Light">Light</option>
                  <option value="Ordinary I">Ordinary I</option>
                  <option value="Ordinary II">Ordinary II</option>
                  <option value="Extra">Extra</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Ceiling Height (ft)</label>
                <Input type="number" value={fireInputs.ceilingHeight} onChange={e => setFireInputs({ ...fireInputs, ceilingHeight: parseInt(e.target.value)||0 })} />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Floors</label>
                <Input type="number" value={fireInputs.floors} onChange={e => setFireInputs({ ...fireInputs, floors: parseInt(e.target.value)||0 })} />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Building Height (ft)</label>
                <Input type="number" value={fireInputs.buildingHeight} onChange={e => setFireInputs({ ...fireInputs, buildingHeight: parseInt(e.target.value)||0 })} />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Static Pressure (PSI)</label>
                <Input type="number" value={fireInputs.staticPressure} onChange={e => setFireInputs({ ...fireInputs, staticPressure: parseInt(e.target.value)||0 })} />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Required Pressure (PSI)</label>
                <Input type="number" value={fireInputs.requiredPressure} onChange={e => setFireInputs({ ...fireInputs, requiredPressure: parseInt(e.target.value)||0 })} />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Elevation (ft)</label>
                <Input type="number" value={fireInputs.elevation} onChange={e => setFireInputs({ ...fireInputs, elevation: parseInt(e.target.value)||0 })} />
              </div>
              <div>
                <label className="text-xs text-foreground-muted">Construction Type</label>
                <select value={fireInputs.constructionType} onChange={e => setFireInputs({ ...fireInputs, constructionType: e.target.value as any })} className="w-full px-2 py-2 bg-background-card border border-border rounded-md text-sm text-foreground">
                  <option value="Type I">Type I</option>
                  <option value="Type II">Type II</option>
                  <option value="Type III">Type III</option>
                  <option value="Type IV">Type IV</option>
                  <option value="Type V">Type V</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" onClick={runFire}>Run Fire Protection</Button>
              {fireResult && <Button variant="outline" disabled={savingFire} onClick={saveFire}>{savingFire ? 'Saving...' : 'Save Result'}</Button>}
            </div>
            {fireResult && (
              <div className="grid grid-cols-6 gap-4 text-sm">
                <ResultBox label="Sprinkler Flow" value={`${formatNumber(fireResult.sprinkler.flowRate,2)} GPM`} />
                <ResultBox label="Sprinkler Heads" value={fireResult.sprinkler.headCount} />
                <ResultBox label="Standpipe Flow" value={`${formatNumber(fireResult.standpipe.flowRate)} GPM`} />
                <ResultBox label="Pump Capacity" value={`${formatNumber(fireResult.firePump.pumpCapacity)} GPM`} />
                <ResultBox label="Pump HP" value={`${formatNumber(fireResult.firePump.horsepower)} HP`} />
                <ResultBox label="Hydrant Flow" value={`${formatNumber(fireResult.hydrantFlow)} GPM`} />
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}

function ResultBox({ label, value }: { label: string; value: any }) {
  return (
    <div className="p-3 rounded-md border border-border bg-background-card">
      <div className="text-[10px] tracking-wide text-foreground-muted mb-1 font-medium">{label.toUpperCase()}</div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  )
}

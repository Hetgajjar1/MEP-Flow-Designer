import { Timestamp } from 'firebase/firestore'

// Real MEP project types
export type ProjectType = 'HVAC' | 'Electrical' | 'Plumbing' | 'Fire Protection' | 'Integrated'
export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'archived'
export type UserRole = 'admin' | 'engineer' | 'designer' | 'reviewer'

// User data structure
export interface User {
  uid: string
  email: string
  displayName: string
  role: UserRole
  createdAt: Timestamp
  photoURL?: string
}

// Real project structure matching Firestore
export interface Project {
  id: string
  name: string
  type: ProjectType
  status: ProjectStatus
  location: string
  area: number // square feet
  floors: number
  buildingType: string
  progress: number // 0-100
  owner: string // user UID
  ownerName: string
  createdAt: Timestamp
  updatedAt: Timestamp
  description?: string
}

// Real HVAC calculation data
export interface HVACCalculation {
  id: string
  projectId: string
  zoneName: string
  area: number // sq ft
  occupancy: number // people
  heatingLoad: number // BTU/hr
  coolingLoad: number // BTU/hr
  ventilationRate: number // CFM
  equipmentCapacity: number // tons
  createdAt: Timestamp
  createdBy: string
}

// Real Electrical calculation data
export interface ElectricalCalculation {
  id: string
  projectId: string
  loadName: string
  connectedLoad: number // watts
  demandFactor: number // 0-1
  demandLoad: number // watts
  voltage: number // volts (120, 208, 240, 480)
  phases: number // 1 or 3
  current: number // amperes
  breakerSize: number // amperes
  wireSize: string // AWG
  createdAt: Timestamp
  createdBy: string
}

// Real Plumbing calculation data
export interface PlumbingCalculation {
  id: string
  projectId: string
  fixtureName: string
  fixtureUnits: number // WSFU
  flowRate: number // GPM
  pipeSize: string // inches
  pressure: number // PSI
  createdAt: Timestamp
  createdBy: string
}

// Real Fire Protection calculation data
export interface FireProtectionCalculation {
  id: string
  projectId: string
  systemType: 'Sprinkler' | 'Standpipe' | 'Fire Pump'
  hazardClass: 'Light' | 'Ordinary I' | 'Ordinary II' | 'Extra'
  coverage: number // sq ft per head
  flowRate: number // GPM
  pressure: number // PSI
  pipeSize: string // inches
  headCount: number
  createdAt: Timestamp
  createdBy: string
}

// File upload structure
export interface ProjectFile {
  id: string
  projectId: string
  fileName: string
  fileType: 'DWG' | 'PDF' | 'Image' | 'Other'
  fileSize: number // bytes
  storagePath: string
  downloadURL: string
  uploadedBy: string
  uploadedByName: string
  uploadedAt: Timestamp
}

// Dashboard statistics
export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  onHoldProjects: number
  averageProgress: number
  totalCalculations: number
  totalFiles: number
}

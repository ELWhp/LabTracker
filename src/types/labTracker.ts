export type LabType = string;

export interface TestTypeConfig {
  id: string;
  name: string;
  label: string;
  color: string;
  description?: string;
}

export const DEFAULT_TEST_TYPES: TestTypeConfig[] = [
  { id: 'washer_energy', name: 'washer_energy', label: 'Washer Energy', color: '#3b82f6' },
  { id: 'dryer_energy', name: 'dryer_energy', label: 'Dryer Energy', color: '#f97316' },
  { id: 'washer_performance', name: 'washer_performance', label: 'Washer Performance', color: '#10b981' },
  { id: 'dryer_performance', name: 'dryer_performance', label: 'Dryer Performance', color: '#8b5cf6' },
];

export const LAB_TYPE_LABELS: Record<string, string> = {
  washer_energy: 'Washer Energy',
  dryer_energy: 'Dryer Energy',
  washer_performance: 'Washer Performance',
  dryer_performance: 'Dryer Performance',
};

export interface StationCapability {
  id: string;
  name: string;
  comments?: string;
}

export interface Station {
  id: string;
  labId: string;
  stationNumber: number;
  name: string; // Renamed from notes (Station Name)
  comments?: string;
  capabilities?: StationCapability[];
}

export interface Lab {
  id: string;
  name: string;
  type: LabType;
  stationCount: number;
  comments?: string;
  supportedTestTypes?: string[];
}

export interface PersonnelResource {
  id: string;
  name: string;
  capabilities: LabType[];
  holidays: string[];
}

export interface UnitAllocation {
  id: string;
  testId: string;
  unitIndex: number;
  totalUnits: number;
  stationId: string;
  startDate: string;
  endDate: string;
}

export interface TestEditLog {
  timestamp: string;
  updatedBy: string;
  details: string;
}

export interface LabTest {
  id: string;
  name: string;
  units: number;
  durationDays: number;
  color: string;
  resourcesNeededTotal: number;
  labType: LabType;
  startDate: string;
  notes?: string;
  testComments?: string;
  assignedTechName?: string;
  unitAllocations: UnitAllocation[];
  testOwner?: string;
  vrNumber?: string;
  linkToVR?: string;
  editHistory?: TestEditLog[];
}

export interface CalendarDay {
  dateStr: string;
  year: number;
  month: number;
  monthName: string;
  weekNumber: number;
  dayOfMonth: number;
  dayOfWeek: number;
  isWeekend: boolean;
}

export interface ResourceIssue {
  labType: LabType;
  startDate: string;
  endDate: string;
  demand: number;
  capacity: number;
}

export interface Landmark {
  id: string;
  name: string;
  date: string;
}

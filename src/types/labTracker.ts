export type LabType = 'washer_energy' | 'dryer_energy' | 'washer_performance' | 'dryer_performance';

export const LAB_TYPE_LABELS: Record<LabType, string> = {
  washer_energy: 'Washer Energy',
  dryer_energy: 'Dryer Energy',
  washer_performance: 'Washer Performance',
  dryer_performance: 'Dryer Performance',
};

export interface Lab {
  id: string;
  name: string;
  type: LabType;
  stationCount: number;
}

export interface Station {
  id: string;
  labId: string;
  stationNumber: number;
  notes: string;
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
  unitAllocations: UnitAllocation[];
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

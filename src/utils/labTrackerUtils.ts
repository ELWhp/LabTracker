import type { Lab, Station, PersonnelResource, LabTest, CalendarDay, ResourceIssue, LabType } from '../types/labTracker';

export function formatYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseYYYYMMDD(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(dateStr: string, days: number): string {
  const d = parseYYYYMMDD(dateStr);
  d.setDate(d.getDate() + days);
  return formatYYYYMMDD(d);
}

export function addWorkingDays(startDateStr: string, durationWorkingDays: number): string {
  let curr = parseYYYYMMDD(startDateStr);
  let added = 0;
  while (added < durationWorkingDays - 1) {
    curr.setDate(curr.getDate() + 1);
    if (curr.getDay() !== 0 && curr.getDay() !== 6) {
      added++;
    }
  }
  return formatYYYYMMDD(curr);
}

export function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function generateCalendarDays(startDateStr: string, numDays: number): CalendarDay[] {
  const days: CalendarDay[] = [];
  const start = parseYYYYMMDD(startDateStr);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  for (let i = 0; i < numDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dateStr = formatYYYYMMDD(d);
    const dayOfWeek = d.getDay();
    days.push({
      dateStr,
      year: d.getFullYear(),
      month: d.getMonth(),
      monthName: monthNames[d.getMonth()],
      weekNumber: getWeekNumber(d),
      dayOfMonth: d.getDate(),
      dayOfWeek,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }
  return days;
}

export function createInitialMockData() {
  const labs: Lab[] = [
    { id: 'lab-1', name: 'Washer Energy Lab A', type: 'washer_energy', stationCount: 3 },
    { id: 'lab-2', name: 'Dryer Energy Lab B', type: 'dryer_energy', stationCount: 2 },
    { id: 'lab-3', name: 'Washer Performance Lab C', type: 'washer_performance', stationCount: 2 },
    { id: 'lab-4', name: 'Dryer Performance Lab D', type: 'dryer_performance', stationCount: 2 },
  ];

  const stations: Station[] = [
    { id: 'st-1-1', labId: 'lab-1', stationNumber: 1, notes: '220V High Flow Water Hookup' },
    { id: 'st-1-2', labId: 'lab-1', stationNumber: 2, notes: 'Standard 120V Station' },
    { id: 'st-1-3', labId: 'lab-1', stationNumber: 3, notes: 'Calibrated Water Meter Station' },

    { id: 'st-2-1', labId: 'lab-2', stationNumber: 1, notes: 'High Heat Vent Duct' },
    { id: 'st-2-2', labId: 'lab-2', stationNumber: 2, notes: 'Condenser Unit Exhaust' },

    { id: 'st-3-1', labId: 'lab-3', stationNumber: 1, notes: 'Performance Stain Chamber 1' },
    { id: 'st-3-2', labId: 'lab-3', stationNumber: 2, notes: 'Performance Stain Chamber 2' },

    { id: 'st-4-1', labId: 'lab-4', stationNumber: 1, notes: 'Lint & Moisture Sensor Station 1' },
    { id: 'st-4-2', labId: 'lab-4', stationNumber: 2, notes: 'Lint & Moisture Sensor Station 2' },
  ];

  const resources: PersonnelResource[] = [
    {
      id: 'res-1',
      name: 'Alice Johnson',
      capabilities: ['washer_energy', 'dryer_energy'],
      holidays: ['2026-09-25'],
    },
    {
      id: 'res-2',
      name: 'Bob Smith',
      capabilities: ['washer_energy', 'washer_performance'],
      holidays: [],
    },
    {
      id: 'res-3',
      name: 'Charlie Davis',
      capabilities: ['dryer_energy', 'dryer_performance'],
      holidays: ['2026-09-28', '2026-09-29'],
    },
  ];

  const today = new Date();
  const baseDate = formatYYYYMMDD(today);

  const tests: LabTest[] = [
    {
      id: 'test-101',
      name: 'ENERGY STAR Washer Audit 2026',
      units: 3,
      durationDays: 12,
      color: '#3b82f6',
      resourcesNeededTotal: 1,
      labType: 'washer_energy',
      startDate: baseDate,
      unitAllocations: [
        {
          id: 'alloc-101-1',
          testId: 'test-101',
          unitIndex: 1,
          totalUnits: 3,
          stationId: 'st-1-1',
          startDate: baseDate,
          endDate: addWorkingDays(baseDate, 12),
        },
        {
          id: 'alloc-101-2',
          testId: 'test-101',
          unitIndex: 2,
          totalUnits: 3,
          stationId: 'st-1-2',
          startDate: baseDate,
          endDate: addWorkingDays(baseDate, 12),
        },
        {
          id: 'alloc-101-3',
          testId: 'test-101',
          unitIndex: 3,
          totalUnits: 3,
          stationId: 'st-1-3',
          startDate: baseDate,
          endDate: addWorkingDays(baseDate, 12),
        },
      ],
    },
    {
      id: 'test-102',
      name: 'Dryer Heat Efficiency Cycle',
      units: 2,
      durationDays: 8,
      color: '#f97316',
      resourcesNeededTotal: 2,
      labType: 'dryer_energy',
      startDate: addDays(baseDate, 2),
      unitAllocations: [
        {
          id: 'alloc-102-1',
          testId: 'test-102',
          unitIndex: 1,
          totalUnits: 2,
          stationId: 'st-2-1',
          startDate: addDays(baseDate, 2),
          endDate: addWorkingDays(addDays(baseDate, 2), 8),
        },
        {
          id: 'alloc-102-2',
          testId: 'test-102',
          unitIndex: 2,
          totalUnits: 2,
          stationId: 'st-2-2',
          startDate: addDays(baseDate, 2),
          endDate: addWorkingDays(addDays(baseDate, 2), 8),
        },
      ],
    },
  ];

  return { labs, stations, resources, tests };
}

export function evaluateResourceAllocations(
  tests: LabTest[],
  resources: PersonnelResource[],
  calendarDays: CalendarDay[]
): ResourceIssue[] {
  const issues: ResourceIssue[] = [];
  const labTypes: LabType[] = ['washer_energy', 'dryer_energy', 'washer_performance', 'dryer_performance'];

  labTypes.forEach((labType) => {
    let currentConflictStart: string | null = null;
    let currentConflictEnd: string | null = null;
    let maxDemand = 0;
    let maxCapacity = 0;

    calendarDays.forEach((day) => {
      if (day.isWeekend) return;

      const capacity = resources.filter((r) => {
        const carriesCap = r.capabilities.includes(labType);
        const isOnHoliday = r.holidays.includes(day.dateStr);
        return carriesCap && !isOnHoliday;
      }).length;

      let demand = 0;
      tests.forEach((test) => {
        if (test.labType !== labType) return;
        test.unitAllocations.forEach((alloc) => {
          if (day.dateStr >= alloc.startDate && day.dateStr <= alloc.endDate) {
            const fraction = test.resourcesNeededTotal / (test.units || 1);
            demand += fraction;
          }
        });
      });

      const roundedDemand = Math.round(demand * 100) / 100;

      if (roundedDemand > capacity) {
        if (!currentConflictStart) {
          currentConflictStart = day.dateStr;
        }
        currentConflictEnd = day.dateStr;
        maxDemand = Math.max(maxDemand, roundedDemand);
        maxCapacity = capacity;
      } else {
        if (currentConflictStart && currentConflictEnd) {
          issues.push({
            labType,
            startDate: currentConflictStart,
            endDate: currentConflictEnd,
            demand: maxDemand,
            capacity: maxCapacity,
          });
          currentConflictStart = null;
          currentConflictEnd = null;
          maxDemand = 0;
          maxCapacity = 0;
        }
      }
    });

    if (currentConflictStart && currentConflictEnd) {
      issues.push({
        labType,
        startDate: currentConflictStart,
        endDate: currentConflictEnd,
        demand: maxDemand,
        capacity: maxCapacity,
      });
    }
  });

  return issues;
}

import type {
  Lab,
  Station,
  PersonnelResource,
  LabTest,
  CalendarDay,
  ResourceIssue,
  LocationMismatchIssue,
  TestTypeConfig,
  Landmark,
} from '../types/labTracker';
import { DEFAULT_TEST_TYPES } from '../types/labTracker';

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

export function calculateWorkingDaysBetween(startDateStr: string, endDateStr: string): number {
  if (endDateStr < startDateStr) return 1;
  let curr = parseYYYYMMDD(startDateStr);
  const end = parseYYYYMMDD(endDateStr);
  let count = 0;
  while (curr <= end) {
    if (curr.getDay() !== 0 && curr.getDay() !== 6) {
      count++;
    }
    curr.setDate(curr.getDate() + 1);
  }
  return Math.max(1, count);
}

export function getRandomVibrantColor(): string {
  const colors = [
    '#2563eb', // Vibrant Blue
    '#d97706', // Amber / Orange
    '#059669', // Emerald
    '#7c3aed', // Purple
    '#db2777', // Pink
    '#0284c7', // Sky Blue
    '#ea580c', // Dark Orange
    '#4f46e5', // Indigo
    '#0891b2', // Cyan
    '#be185d', // Rose
  ];
  return colors[Math.floor(Math.random() * colors.length)];
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
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
  const testTypes: TestTypeConfig[] = DEFAULT_TEST_TYPES;

  const labs: Lab[] = [
    {
      id: 'lab-1',
      name: 'Washer Energy Lab A (Mty)',
      type: 'washer_energy',
      stationCount: 3,
      comments: 'Main washer energy testing facility with high pressure water lines.',
      supportedTestTypes: ['washer_energy', 'washer_performance'],
      location: 'Mty',
    },
    {
      id: 'lab-2',
      name: 'Dryer Energy Lab B (Mty)',
      type: 'dryer_energy',
      stationCount: 2,
      comments: 'High heat venting chamber for energy compliance testing.',
      supportedTestTypes: ['dryer_energy', 'dryer_performance'],
      location: 'Mty',
    },
    {
      id: 'lab-3',
      name: 'Washer Performance Lab C (SJTC)',
      type: 'washer_performance',
      stationCount: 2,
      comments: 'Stain removal and load balance testing lab.',
      supportedTestTypes: ['washer_performance'],
      location: 'SJTC',
    },
    {
      id: 'lab-4',
      name: 'Dryer Performance Lab D (SJTC)',
      type: 'dryer_performance',
      stationCount: 2,
      comments: 'Moisture sensing and lint accumulation facility.',
      supportedTestTypes: ['dryer_performance'],
      location: 'SJTC',
    },
  ];

  const stations: Station[] = [
    {
      id: 'st-1-1',
      labId: 'lab-1',
      stationNumber: 1,
      name: 'Station 1 - 220V Flow',
      comments: 'Equipped with precision water flow meters and thermistor array.',
      capabilities: [
        { id: 'cap-1', name: 'Thermistor 1', comments: 'Calibrated temp probe (+/- 0.1C)' },
        { id: 'cap-2', name: 'Scale', comments: 'High capacity 50kg digital scale' },
      ],
    },
    {
      id: 'st-1-2',
      labId: 'lab-1',
      stationNumber: 2,
      name: 'Station 2 - 120V Standard',
      comments: 'Standard 120V power supply hookup.',
      capabilities: [
        { id: 'cap-1', name: 'Thermistor 1', comments: 'Standard thermal sensor' },
      ],
    },
    {
      id: 'st-1-3',
      labId: 'lab-1',
      stationNumber: 3,
      name: 'Station 3 - Calibrated Meter',
      comments: 'Dedicated for high precision energy audits.',
      capabilities: [
        { id: 'cap-1', name: 'Thermistor 1', comments: 'Calibrated temp probe' },
        { id: 'cap-3', name: 'Humidity Sensor', comments: 'Relative humidity probe' },
      ],
    },

    {
      id: 'st-2-1',
      labId: 'lab-2',
      stationNumber: 1,
      name: 'Station 1 - Vent Duct',
      comments: 'Insulated exhaust ducting.',
      capabilities: [
        { id: 'cap-3', name: 'Humidity Sensor', comments: 'Exhaust RH sensor' },
      ],
    },
    {
      id: 'st-2-2',
      labId: 'lab-2',
      stationNumber: 2,
      name: 'Station 2 - Condenser Unit',
      comments: 'Water drain exhaust line attached.',
      capabilities: [
        { id: 'cap-2', name: 'Scale', comments: 'Water condensation catch scale' },
      ],
    },

    {
      id: 'st-3-1',
      labId: 'lab-3',
      stationNumber: 1,
      name: 'Station 1 - Stain Chamber',
      comments: 'Standardized stain cloth analysis rig.',
      capabilities: [],
    },
    {
      id: 'st-3-2',
      labId: 'lab-3',
      stationNumber: 2,
      name: 'Station 2 - Stain Chamber',
      comments: 'Secondary stain chamber.',
      capabilities: [],
    },

    {
      id: 'st-4-1',
      labId: 'lab-4',
      stationNumber: 1,
      name: 'Station 1 - Moisture Rig',
      comments: 'Precision humidity telemetry.',
      capabilities: [
        { id: 'cap-3', name: 'Humidity Sensor', comments: 'Precision RH probe' },
      ],
    },
    {
      id: 'st-4-2',
      labId: 'lab-4',
      stationNumber: 2,
      name: 'Station 2 - Lint Collector',
      comments: 'Lint mass airflow measurement.',
      capabilities: [
        { id: 'cap-2', name: 'Scale', comments: '0.01g lint scale' },
      ],
    },
  ];

  const resources: PersonnelResource[] = [
    {
      id: 'res-1',
      name: 'Alice Johnson',
      capabilities: ['washer_energy', 'dryer_energy'],
      holidays: ['2026-09-25'],
      location: 'Mty',
    },
    {
      id: 'res-2',
      name: 'Bob Smith',
      capabilities: ['washer_energy', 'washer_performance'],
      holidays: [],
      location: 'Mty',
    },
    {
      id: 'res-3',
      name: 'Charlie Davis',
      capabilities: ['dryer_energy', 'dryer_performance'],
      holidays: ['2026-09-28', '2026-09-29'],
      location: 'SJTC',
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
      color: '#2563eb',
      resourcesNeededTotal: 1,
      labType: 'washer_energy',
      startDate: baseDate,
      assignedTechName: 'Alice Johnson',
      testOwner: 'alice@labcompany.com',
      vrNumber: 'VR-2026-001',
      linkToVR: 'https://codebeamer.example.com/item/1001',
      editHistory: [
        {
          timestamp: new Date().toLocaleString(),
          updatedBy: 'alice@labcompany.com',
          details: 'Created initial test schedule.',
        },
      ],
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
      color: '#ea580c',
      resourcesNeededTotal: 2,
      labType: 'dryer_energy',
      startDate: addDays(baseDate, 2),
      assignedTechName: 'Bob Smith',
      testOwner: 'charlie@labcompany.com',
      vrNumber: 'VR-2026-008',
      linkToVR: 'https://codebeamer.example.com/item/1008',
      editHistory: [
        {
          timestamp: new Date().toLocaleString(),
          updatedBy: 'charlie@labcompany.com',
          details: 'Created test schedule.',
        },
      ],
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

  const landmarks: Landmark[] = [
    {
      id: 'lm-1',
      name: '🚀 Product Launch v1.0',
      date: addDays(baseDate, 10),
    },
    {
      id: 'lm-2',
      name: '📋 Compliance Audit Milestone',
      date: addDays(baseDate, 20),
    },
  ];

  return { testTypes, labs, stations, resources, tests, landmarks };
}

export function evaluateResourceAllocations(
  tests: LabTest[],
  resources: PersonnelResource[],
  calendarDays: CalendarDay[],
  testTypes: TestTypeConfig[] = DEFAULT_TEST_TYPES
): ResourceIssue[] {
  const issues: ResourceIssue[] = [];
  const typeKeys = testTypes.map((t) => t.id);

  typeKeys.forEach((labType) => {
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

export function evaluateLocationMismatches(
  tests: LabTest[],
  labs: Lab[],
  stations: Station[],
  resources: PersonnelResource[]
): LocationMismatchIssue[] {
  const issues: LocationMismatchIssue[] = [];

  tests.forEach((test) => {
    if (test.status === 'completed' || !test.assignedTechName) return;

    const assignedTech = resources.find(
      (r) => r.name.toLowerCase() === test.assignedTechName?.toLowerCase()
    );

    if (!assignedTech || !assignedTech.location) return;

    // Find assigned station and lab
    const firstAlloc = test.unitAllocations[0];
    if (!firstAlloc) return;

    const station = stations.find((s) => s.id === firstAlloc.stationId);
    const lab = station ? labs.find((l) => l.id === station.labId) : null;

    if (!lab || !lab.location) return;

    if (assignedTech.location.toLowerCase() !== lab.location.toLowerCase()) {
      issues.push({
        testId: test.id,
        testName: test.name,
        techName: assignedTech.name,
        labName: lab.name,
        labLocation: lab.location,
        techLocation: assignedTech.location,
        startDate: test.startDate,
        endDate: firstAlloc.endDate,
      });
    }
  });

  return issues;
}

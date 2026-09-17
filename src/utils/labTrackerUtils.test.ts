import { describe, it, expect } from 'vitest';
import {
  addWorkingDays,
  evaluateResourceAllocations,
} from './labTrackerUtils';
import type { LabTest, PersonnelResource, CalendarDay } from '../types/labTracker';

describe('Lab Tracker Utilities', () => {
  it('correctly calculates end date for working days duration', () => {
    const startDate = '2026-09-18';
    const endDate = addWorkingDays(startDate, 5);
    expect(endDate).toBe('2026-09-24');
  });

  it('detects resource constraint shortage when demand exceeds staff capacity', () => {
    const calendarDays: CalendarDay[] = [
      {
        dateStr: '2026-09-21',
        year: 2026,
        month: 8,
        monthName: 'Sep',
        weekNumber: 39,
        dayOfMonth: 21,
        dayOfWeek: 1,
        isWeekend: false,
      },
      {
        dateStr: '2026-09-22',
        year: 2026,
        month: 8,
        monthName: 'Sep',
        weekNumber: 39,
        dayOfMonth: 22,
        dayOfWeek: 2,
        isWeekend: false,
      },
    ];

    const resources: PersonnelResource[] = [
      {
        id: 'r1',
        name: 'Tech 1',
        capabilities: ['washer_energy'],
        holidays: ['2026-09-21'],
      },
    ];

    const tests: LabTest[] = [
      {
        id: 't1',
        name: 'Test Washer',
        units: 2,
        durationDays: 5,
        color: '#000000',
        resourcesNeededTotal: 2,
        labType: 'washer_energy',
        startDate: '2026-09-21',
        unitAllocations: [
          {
            id: 'a1',
            testId: 't1',
            unitIndex: 1,
            totalUnits: 2,
            stationId: 'st1',
            startDate: '2026-09-21',
            endDate: '2026-09-25',
          },
          {
            id: 'a2',
            testId: 't1',
            unitIndex: 2,
            totalUnits: 2,
            stationId: 'st2',
            startDate: '2026-09-21',
            endDate: '2026-09-25',
          },
        ],
      },
    ];

    const issues = evaluateResourceAllocations(tests, resources, calendarDays);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].labType).toBe('washer_energy');
    expect(issues[0].startDate).toBe('2026-09-21');
  });
});

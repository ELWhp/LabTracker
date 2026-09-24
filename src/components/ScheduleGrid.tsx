import React from 'react';
import type {
  Lab,
  Station,
  LabTest,
  UnitAllocation,
  CalendarDay,
} from '../types/labTracker';
import { LAB_TYPE_LABELS } from '../types/labTracker';
import { addWorkingDays } from '../utils/labTrackerUtils';

interface ScheduleGridProps {
  labs: Lab[];
  stations: Station[];
  tests: LabTest[];
  calendarDays: CalendarDay[];
  selectedAllocationId: string | null;
  onSelectAllocation: (allocation: UnitAllocation, test: LabTest) => void;
  onUpdateAllocationDates: (
    allocationId: string,
    newStationId: string,
    newStartDate: string
  ) => void;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  labs,
  stations,
  tests,
  calendarDays,
  selectedAllocationId,
  onSelectAllocation,
  onUpdateAllocationDates,
}) => {
  const testMap = new Map<string, LabTest>(tests.map((t) => [t.id, t]));

  const yearSpans: { year: number; colSpan: number }[] = [];
  const monthSpans: { monthName: string; year: number; colSpan: number }[] = [];
  const weekSpans: { weekNumber: number; colSpan: number }[] = [];

  calendarDays.forEach((day) => {
    const lastYear = yearSpans[yearSpans.length - 1];
    if (lastYear && lastYear.year === day.year) {
      lastYear.colSpan++;
    } else {
      yearSpans.push({ year: day.year, colSpan: 1 });
    }

    const lastMonth = monthSpans[monthSpans.length - 1];
    if (lastMonth && lastMonth.monthName === day.monthName && lastMonth.year === day.year) {
      lastMonth.colSpan++;
    } else {
      monthSpans.push({ monthName: day.monthName, year: day.year, colSpan: 1 });
    }

    const lastWeek = weekSpans[weekSpans.length - 1];
    if (lastWeek && lastWeek.weekNumber === day.weekNumber) {
      lastWeek.colSpan++;
    } else {
      weekSpans.push({ weekNumber: day.weekNumber, colSpan: 1 });
    }
  });

  const allocationsByStation = new Map<string, { alloc: UnitAllocation; test: LabTest }[]>();
  tests.forEach((test) => {
    test.unitAllocations.forEach((alloc) => {
      const list = allocationsByStation.get(alloc.stationId) || [];
      list.push({ alloc, test });
      allocationsByStation.set(alloc.stationId, list);
    });
  });

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    allocation: UnitAllocation
  ) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(allocation));
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent<HTMLTableCellElement>,
    targetStationId: string,
    targetDateStr: string
  ) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    try {
      const draggedAlloc: UnitAllocation = JSON.parse(data);
      const test = testMap.get(draggedAlloc.testId);
      if (!test) return;

      const newEndDate = addWorkingDays(targetDateStr, test.durationDays);
      const targetStationAllocations = allocationsByStation.get(targetStationId) || [];

      const hasCollision = targetStationAllocations.some(({ alloc }) => {
        if (alloc.id === draggedAlloc.id) return false;
        return (
          targetDateStr <= alloc.endDate && newEndDate >= alloc.startDate
        );
      });

      if (hasCollision) {
        alert('Cannot place test here: Collision with another test scheduled on this station!');
        return;
      }

      onUpdateAllocationDates(draggedAlloc.id, targetStationId, targetDateStr);
    } catch (err) {
      console.error('Failed to parse drag data:', err);
    }
  };

  return (
    <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm bg-white">
      <table className="min-w-full border-collapse text-xs select-none">
        <thead>
          <tr className="bg-slate-800 text-white font-semibold text-center border-b border-slate-700">
            <th colSpan={2} className="px-3 py-2 sticky left-0 bg-slate-800 z-20 border-r border-slate-700 w-64 text-left">
              Timeline / Year
            </th>
            {yearSpans.map((y, idx) => (
              <th key={idx} colSpan={y.colSpan} className="px-2 py-1 border-r border-slate-700">
                {y.year}
              </th>
            ))}
          </tr>

          <tr className="bg-slate-700 text-white font-medium text-center border-b border-slate-600">
            <th colSpan={2} className="px-3 py-1.5 sticky left-0 bg-slate-700 z-20 border-r border-slate-600 text-left">
              Month
            </th>
            {monthSpans.map((m, idx) => (
              <th key={idx} colSpan={m.colSpan} className="px-2 py-1 border-r border-slate-600">
                {m.monthName}
              </th>
            ))}
          </tr>

          <tr className="bg-slate-600 text-slate-100 font-medium text-center border-b border-slate-500">
            <th colSpan={2} className="px-3 py-1 sticky left-0 bg-slate-600 z-20 border-r border-slate-500 text-left">
              Week
            </th>
            {weekSpans.map((w, idx) => (
              <th key={idx} colSpan={w.colSpan} className="px-1 py-1 border-r border-slate-500">
                W{w.weekNumber}
              </th>
            ))}
          </tr>

          <tr className="bg-slate-100 text-slate-700 font-bold text-center border-b border-slate-300">
            <th className="px-3 py-1 sticky left-0 bg-slate-200 z-20 border-r border-slate-300 w-36 text-left">
              Lab
            </th>
            <th className="px-3 py-1 sticky left-36 bg-slate-200 z-20 border-r border-slate-300 w-48 text-left">
              Station & Notes
            </th>
            {calendarDays.map((day) => (
              <th
                key={day.dateStr}
                className={`w-8 min-w-[32px] px-0.5 py-1 border-r border-slate-200 ${
                  day.isWeekend ? 'bg-slate-200 text-slate-400' : 'bg-slate-50'
                }`}
                title={`${day.dateStr} (${day.monthName} ${day.dayOfMonth})`}
              >
                {day.dayOfMonth}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {labs.map((lab) => {
            const labStations = stations.filter((s) => s.labId === lab.id);
            if (labStations.length === 0) return null;

            return labStations.map((station, stationIndex) => {
              return (
                <tr key={station.id} className="border-b border-slate-200 hover:bg-slate-50">
                  {stationIndex === 0 && (
                    <td
                      rowSpan={labStations.length}
                      className="px-3 py-2 sticky left-0 bg-slate-100 z-10 border-r border-slate-300 font-semibold text-slate-800 align-top shadow-sm"
                    >
                      <div>{lab.name}</div>
                      <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded">
                        {LAB_TYPE_LABELS[lab.type]}
                      </span>
                    </td>
                  )}

                  <td className="px-3 py-2 sticky left-36 bg-white z-10 border-r border-slate-300 align-middle shadow-sm">
                    <div className="font-semibold text-slate-700">Station {station.stationNumber}</div>
                    {station.notes && (
                      <div className="text-[10px] text-slate-500 italic truncate max-w-[170px]" title={station.notes}>
                        {station.notes}
                      </div>
                    )}
                  </td>

                  {calendarDays.map((day, dayIdx) => {
                    const stationAllocations = allocationsByStation.get(station.id) || [];

                    // Check if allocation starts on this day OR if it started before calendar start and today is day 0
                    const allocStartingHere = stationAllocations.find(({ alloc }) => {
                      if (alloc.startDate === day.dateStr) return true;
                      if (dayIdx === 0 && alloc.startDate < day.dateStr && alloc.endDate >= day.dateStr) return true;
                      return false;
                    });

                    const isCoveredByAlloc = stationAllocations.some(
                      ({ alloc }) =>
                        day.dateStr >= alloc.startDate && day.dateStr <= alloc.endDate
                    );

                    if (allocStartingHere) {
                      const { alloc, test } = allocStartingHere;
                      let startIndex = calendarDays.findIndex((d) => d.dateStr === alloc.startDate);
                      let endIndex = calendarDays.findIndex((d) => d.dateStr === alloc.endDate);

                      if (startIndex < 0) startIndex = 0;
                      if (endIndex < 0) endIndex = calendarDays.length - 1;

                      const colSpan = Math.max(1, endIndex - startIndex + 1);

                      const isSelected = selectedAllocationId === alloc.id;

                      return (
                        <td
                          key={day.dateStr}
                          colSpan={colSpan}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, station.id, day.dateStr)}
                          className="p-0.5 border-r border-slate-200 align-middle relative h-10"
                        >
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, alloc)}
                            onClick={() => onSelectAllocation(alloc, test)}
                            style={{ backgroundColor: test.color || '#3b82f6' }}
                            className={`h-full w-full rounded px-2 text-white font-medium flex items-center justify-between cursor-grab active:cursor-grabbing shadow-sm transition-all hover:brightness-110 ${
                              isSelected ? 'ring-2 ring-black ring-offset-1 z-10' : ''
                            }`}
                            title={`Test: ${test.name}\nUnit: ${alloc.unitIndex}/${alloc.totalUnits}\nDates: ${alloc.startDate} to ${alloc.endDate}\nDrag to move!`}
                          >
                            <span className="truncate mr-2 text-[11px] font-semibold drop-shadow-sm">
                              {test.name}
                            </span>
                            <span className="bg-black/30 text-white font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0">
                              {alloc.unitIndex}/{alloc.totalUnits}
                            </span>
                          </div>
                        </td>
                      );
                    }

                    if (isCoveredByAlloc) {
                      return null;
                    }

                    return (
                      <td
                        key={day.dateStr}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, station.id, day.dateStr)}
                        className={`border-r border-slate-200 transition-colors hover:bg-blue-50 ${
                          day.isWeekend ? 'bg-slate-100/60' : ''
                        }`}
                      />
                    );
                  })}
                </tr>
              );
            });
          })}
        </tbody>
      </table>
    </div>
  );
};

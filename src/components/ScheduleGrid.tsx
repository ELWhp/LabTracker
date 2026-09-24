import React, { useState, useEffect, useRef } from 'react';
import type {
  Lab,
  Station,
  LabTest,
  UnitAllocation,
  CalendarDay,
  Landmark,
} from '../types/labTracker';
import { LAB_TYPE_LABELS } from '../types/labTracker';
import { addWorkingDays, addDays } from '../utils/labTrackerUtils';
import { Info, Cpu, FileText } from 'lucide-react';

interface ScheduleGridProps {
  labs: Lab[];
  stations: Station[];
  tests: LabTest[];
  landmarks?: Landmark[];
  calendarDays: CalendarDay[];
  selectedAllocationId: string | null;
  onSelectAllocation: (allocation: UnitAllocation, test: LabTest) => void;
  onUpdateAllocationDates: (
    allocationId: string,
    newStationId: string,
    newStartDate: string
  ) => void;
  onResizeAllocation?: (
    allocationId: string,
    edge: 'start' | 'end',
    newDateStr: string
  ) => void;
  onDoubleClickCell?: (stationId: string, dateStr: string) => void;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  labs,
  stations,
  tests,
  landmarks = [],
  calendarDays,
  selectedAllocationId,
  onSelectAllocation,
  onUpdateAllocationDates,
  onResizeAllocation,
  onDoubleClickCell,
}) => {
  const testMap = new Map<string, LabTest>(tests.map((t) => [t.id, t]));

  // Active popup comment state for Lab or Station
  const [activeCommentPopup, setActiveCommentPopup] = useState<{
    type: 'lab' | 'station';
    id: string;
    title: string;
    comments: string;
    capabilities?: { name: string; comments?: string }[];
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setActiveCommentPopup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        return targetDateStr <= alloc.endDate && newEndDate >= alloc.startDate;
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
    <div ref={containerRef} className="relative overflow-x-auto border border-gray-300 rounded-lg shadow-sm bg-white min-h-[500px]">
      {/* Floating Comment Popup Modal */}
      {activeCommentPopup && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4" onClick={() => setActiveCommentPopup(null)}>
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 p-5 max-w-md w-full space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                {activeCommentPopup.type === 'lab' ? (
                  <FileText className="h-5 w-5 text-blue-600" />
                ) : (
                  <Cpu className="h-5 w-5 text-emerald-600" />
                )}
                <h3 className="font-bold text-slate-800 text-sm">{activeCommentPopup.title}</h3>
              </div>
              <button
                onClick={() => setActiveCommentPopup(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 rounded"
              >
                ✕ Close
              </button>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Comments & Description</label>
              <p className="text-xs text-slate-700 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200 whitespace-pre-wrap">
                {activeCommentPopup.comments || 'No comments provided for this item.'}
              </p>
            </div>

            {activeCommentPopup.capabilities && activeCommentPopup.capabilities.length > 0 && (
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Station Capabilities</label>
                <div className="space-y-1.5">
                  {activeCommentPopup.capabilities.map((cap, idx) => (
                    <div key={idx} className="bg-emerald-50 border border-emerald-200 rounded p-2 text-xs">
                      <div className="font-bold text-emerald-800">{cap.name}</div>
                      {cap.comments && <div className="text-emerald-700 text-[11px]">{cap.comments}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <table className="min-w-full border-collapse text-xs select-none">
        <thead>
          <tr className="bg-slate-800 text-white font-semibold text-center border-b border-slate-700">
            <th className="px-3 py-2 sticky left-0 bg-slate-800 z-20 border-r border-slate-700 w-72 text-left">
              Timeline / Year
            </th>
            <th className="px-3 py-2 sticky left-72 bg-slate-800 z-20 border-r border-slate-700 w-52 text-left" />
            {yearSpans.map((y, idx) => (
              <th key={idx} colSpan={y.colSpan} className="px-2 py-1 border-r border-slate-700">
                {y.year}
              </th>
            ))}
          </tr>

          <tr className="bg-slate-700 text-white font-medium text-center border-b border-slate-600">
            <th className="px-3 py-1.5 sticky left-0 bg-slate-700 z-20 border-r border-slate-600 w-72 text-left">
              Month
            </th>
            <th className="px-3 py-1.5 sticky left-72 bg-slate-700 z-20 border-r border-slate-600 w-52 text-left" />
            {monthSpans.map((m, idx) => (
              <th key={idx} colSpan={m.colSpan} className="px-2 py-1 border-r border-slate-600">
                {m.monthName}
              </th>
            ))}
          </tr>

          <tr className="bg-slate-600 text-slate-100 font-medium text-center border-b border-slate-500">
            <th className="px-3 py-1 sticky left-0 bg-slate-600 z-20 border-r border-slate-500 w-72 text-left">
              Week
            </th>
            <th className="px-3 py-1 sticky left-72 bg-slate-600 z-20 border-r border-slate-500 w-52 text-left" />
            {weekSpans.map((w, idx) => (
              <th key={idx} colSpan={w.colSpan} className="px-1 py-1 border-r border-slate-500">
                W{w.weekNumber}
              </th>
            ))}
          </tr>

          <tr className="bg-slate-100 text-slate-700 font-bold text-center border-b border-slate-300">
            <th className="px-3 py-2 sticky left-0 bg-slate-200 z-20 border-r border-slate-300 w-72 text-left">
              Lab & Comments
            </th>
            <th className="px-3 py-2 sticky left-72 bg-slate-200 z-20 border-r border-slate-300 w-52 text-left">
              Station & Capabilities
            </th>
            {calendarDays.map((day) => {
              const landmarkOnDay = landmarks.find((lm) => lm.date === day.dateStr);
              return (
                <th
                  key={day.dateStr}
                  className={`w-8 min-w-[32px] px-0.5 py-1 border-r border-slate-200 relative ${
                    day.isWeekend ? 'bg-slate-200 text-slate-400' : 'bg-slate-50'
                  }`}
                  title={`${day.dateStr} (${day.monthName} ${day.dayOfMonth})${
                    landmarkOnDay ? ` - Landmark: ${landmarkOnDay.name}` : ''
                  }`}
                >
                  {landmarkOnDay && (
                    <div
                      className="absolute -top-7 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap z-30"
                      title={`Landmark Date: ${landmarkOnDay.name} (${landmarkOnDay.date})`}
                    >
                      {landmarkOnDay.name}
                    </div>
                  )}
                  {day.dayOfMonth}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {labs.map((lab) => {
            const labStations = stations.filter((s) => s.labId === lab.id);
            if (labStations.length === 0) return null;

            return labStations.map((station, stationIndex) => {
              return (
                <tr key={station.id} className="border-b border-slate-200 hover:bg-slate-50/80">
                  {stationIndex === 0 && (
                    <td
                      rowSpan={labStations.length}
                      onClick={() =>
                        setActiveCommentPopup({
                          type: 'lab',
                          id: lab.id,
                          title: lab.name,
                          comments: lab.comments || 'No specific comments recorded for this lab.',
                        })
                      }
                      className="px-3 py-3 sticky left-0 bg-slate-100 z-10 border-r border-slate-300 font-semibold text-slate-800 align-top shadow-xs cursor-pointer hover:bg-slate-200 transition-colors"
                      title="Click to view lab comments"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{lab.name}</span>
                        <Info className="h-3.5 w-3.5 text-blue-500 shrink-0 ml-1" />
                      </div>
                      <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono">
                        {LAB_TYPE_LABELS[lab.type] || lab.type}
                      </span>
                      {lab.comments && (
                        <div className="text-[10px] text-slate-500 italic mt-1.5 line-clamp-2">
                          "{lab.comments}"
                        </div>
                      )}
                    </td>
                  )}

                  <td
                    onClick={() =>
                      setActiveCommentPopup({
                        type: 'station',
                        id: station.id,
                        title: `${station.name} (${lab.name})`,
                        comments: station.comments || 'No station comments provided.',
                        capabilities: station.capabilities,
                      })
                    }
                    className="px-3 py-3 sticky left-72 bg-white z-10 border-r border-slate-300 align-top shadow-xs cursor-pointer hover:bg-slate-50 transition-colors"
                    title="Click to view station comments & capabilities"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{station.name}</span>
                      <Cpu className="h-3.5 w-3.5 text-emerald-500 shrink-0 ml-1" />
                    </div>

                    {station.capabilities && station.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {station.capabilities.map((cap) => (
                          <span key={cap.id} className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">
                            {cap.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {station.comments && (
                      <div className="text-[10px] text-slate-500 italic mt-1 line-clamp-1">
                        {station.comments}
                      </div>
                    )}
                  </td>

                  {calendarDays.map((day, dayIdx) => {
                    const stationAllocations = allocationsByStation.get(station.id) || [];

                    const allocStartingHere = stationAllocations.find(({ alloc }) => {
                      if (alloc.startDate === day.dateStr) return true;
                      if (dayIdx === 0 && alloc.startDate < day.dateStr && alloc.endDate >= day.dateStr) return true;
                      return false;
                    });

                    const isCoveredByAlloc = stationAllocations.some(
                      ({ alloc }) => day.dateStr >= alloc.startDate && day.dateStr <= alloc.endDate
                    );

                    const landmarkOnDay = landmarks.find((lm) => lm.date === day.dateStr);

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
                          className="p-1 border-r border-slate-200 align-middle relative h-12"
                        >
                          {/* Vertical Landmark Launch Line */}
                          {landmarkOnDay && (
                            <div
                              className="absolute top-0 bottom-0 right-0 w-1 bg-red-600 z-20 pointer-events-none shadow-sm"
                              title={`Landmark: ${landmarkOnDay.name} (${landmarkOnDay.date})`}
                            />
                          )}

                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, alloc)}
                            onClick={() => onSelectAllocation(alloc, test)}
                            style={{ backgroundColor: test.color || '#2563eb' }}
                            className={`h-full w-full rounded-md px-2 text-white font-medium flex items-center justify-between cursor-grab active:cursor-grabbing shadow-sm transition-all hover:brightness-110 relative group ${
                              isSelected ? 'ring-2 ring-black ring-offset-1 z-10' : ''
                            }`}
                            title={`Test: ${test.name}\nVR: ${test.vrNumber || 'N/A'}\nOwner: ${test.testOwner || 'N/A'}\nUnit: ${alloc.unitIndex}/${alloc.totalUnits}\nDates: ${alloc.startDate} to ${alloc.endDate}\nDrag handles on left/right to extend or shrink test duration!`}
                          >
                            {/* Left Resize Handle */}
                            {onResizeAllocation && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const prevDate = addDays(alloc.startDate, -1);
                                  onResizeAllocation(alloc.id, 'start', prevDate);
                                }}
                                className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/20 hover:bg-black/40 rounded-l cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[8px]"
                                title="Extend duration start earlier"
                              >
                                ‹
                              </button>
                            )}

                            <span className="truncate mr-2 text-[11px] font-semibold drop-shadow-sm pl-1">
                              {test.name}
                            </span>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="bg-black/30 text-white font-mono text-[10px] px-1.5 py-0.5 rounded">
                                {alloc.unitIndex}/{alloc.totalUnits}
                              </span>
                            </div>

                            {/* Right Resize Handle */}
                            {onResizeAllocation && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextDate = addDays(alloc.endDate, 1);
                                  onResizeAllocation(alloc.id, 'end', nextDate);
                                }}
                                className="absolute right-0 top-0 bottom-0 w-2.5 bg-black/20 hover:bg-black/40 rounded-r cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[8px]"
                                title="Extend duration end later"
                              >
                                ›
                              </button>
                            )}
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
                        onDoubleClick={() => onDoubleClickCell && onDoubleClickCell(station.id, day.dateStr)}
                        className={`border-r border-slate-200 transition-colors hover:bg-blue-100/60 cursor-pointer relative ${
                          day.isWeekend ? 'bg-slate-100/60' : ''
                        }`}
                        title="Double-click to add test starting on this date"
                      >
                        {/* Vertical Landmark Launch Line */}
                        {landmarkOnDay && (
                          <div
                            className="absolute top-0 bottom-0 right-0 w-1 bg-red-600 z-20 pointer-events-none shadow-sm"
                            title={`Landmark: ${landmarkOnDay.name} (${landmarkOnDay.date})`}
                          />
                        )}
                      </td>
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

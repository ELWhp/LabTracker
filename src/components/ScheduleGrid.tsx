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
import { addWorkingDays, addDays, calculateWorkingDaysBetween, parseYYYYMMDD, formatYYYYMMDD } from '../utils/labTrackerUtils';
import { Info, Cpu, FileText } from 'lucide-react';

interface ScheduleGridProps {
  labs: Lab[];
  stations: Station[];
  tests: LabTest[];
  landmarks?: Landmark[];
  calendarDays: CalendarDay[];
  viewMode?: 'days' | 'weeks';
  selectedLabIds?: string[];
  selectedLabId?: string;
  selectedAllocationId: string | null;
  onSelectAllocation: (allocation: UnitAllocation, test: LabTest, isShiftKey?: boolean) => void;
  onUpdateAllocationDates: (
    allocationId: string,
    newStationId: string,
    newStartDate: string
  ) => void;
  onBatchUpdateAllocationDates?: (
    updates: { allocationId: string; newStationId: string; newStartDate: string }[]
  ) => void;
  onResizeAllocation?: (
    allocationId: string,
    edge: 'start' | 'end',
    newDateStr: string
  ) => void;
  onDoubleClickCell?: (stationId: string, dateStr: string) => void;
  onUpdateLandmark?: (landmark: Landmark) => void;
  onUpdateStationComments?: (stationId: string, comments: string) => void;
  onUpdateLabComments?: (labId: string, comments: string) => void;
  selectedAllocationIds?: string[];
  onClearMultiSelection?: () => void;
}

interface DisplayColumn {
  id: string;
  dateStr: string;
  label: string;
  subLabel: string;
  year: number;
  monthName: string;
  weekNumber: number;
  isWeekend?: boolean;
  startDate: string;
  endDate: string;
  dates: string[];
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  labs,
  stations,
  tests,
  landmarks = [],
  calendarDays,
  viewMode = 'days',
  selectedLabIds,
  selectedLabId = 'all',
  selectedAllocationId,
  onSelectAllocation,
  onUpdateAllocationDates,
  onBatchUpdateAllocationDates,
  onResizeAllocation,
  onDoubleClickCell,
  onUpdateLandmark,
  onUpdateStationComments,
  onUpdateLabComments,
  selectedAllocationIds = [],
  onClearMultiSelection,
}) => {
  const testMap = new Map<string, LabTest>(tests.map((t) => [t.id, t]));

  // Resizable column width states (defaults in pixels)
  const [labColWidth, setLabColWidth] = useState<number>(200);
  const [stationColWidth, setStationColWidth] = useState<number>(180);

  const [isResizingCol1, setIsResizingCol1] = useState(false);
  const [isResizingCol2, setIsResizingCol2] = useState(false);

  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  // Active popup comment state for Lab or Station
  const [activeCommentPopup, setActiveCommentPopup] = useState<{
    type: 'lab' | 'station';
    id: string;
    title: string;
    comments: string;
    capabilities?: { name: string; comments?: string }[];
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // 1:1 Pixel tracking mouse drag column resizers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startXRef.current;
      if (isResizingCol1) {
        const newWidth = Math.max(120, Math.min(600, startWidthRef.current + deltaX));
        setLabColWidth(newWidth);
      } else if (isResizingCol2) {
        const newWidth = Math.max(120, Math.min(600, startWidthRef.current + deltaX));
        setStationColWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizingCol1(false);
      setIsResizingCol2(false);
    };

    if (isResizingCol1 || isResizingCol2) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingCol1, isResizingCol2]);

  const handleStartResizeCol1 = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingCol1(true);
    startXRef.current = e.clientX;
    startWidthRef.current = labColWidth;
  };

  const handleStartResizeCol2 = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingCol2(true);
    startXRef.current = e.clientX;
    startWidthRef.current = stationColWidth;
  };

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

  // Construct display columns depending on viewMode ('days' or 'weeks')
  const displayCols: DisplayColumn[] = React.useMemo(() => {
    if (viewMode === 'days') {
      return calendarDays.map((d) => ({
        id: d.dateStr,
        dateStr: d.dateStr,
        label: String(d.dayOfMonth),
        subLabel: d.monthName,
        year: d.year,
        monthName: d.monthName,
        weekNumber: d.weekNumber,
        isWeekend: d.isWeekend,
        startDate: d.dateStr,
        endDate: d.dateStr,
        dates: [d.dateStr],
      }));
    } else {
      // Group calendarDays into weeks
      const weekMap = new Map<string, CalendarDay[]>();
      calendarDays.forEach((d) => {
        const key = `${d.year}-W${d.weekNumber}`;
        const existing = weekMap.get(key) || [];
        existing.push(d);
        weekMap.set(key, existing);
      });

      const cols: DisplayColumn[] = [];
      weekMap.forEach((daysInWeek) => {
        const first = daysInWeek[0];
        const last = daysInWeek[daysInWeek.length - 1];
        cols.push({
          id: `${first.year}-W${first.weekNumber}`,
          dateStr: first.dateStr,
          label: `W${first.weekNumber}`,
          subLabel: `${first.monthName} ${first.dayOfMonth}-${last.dayOfMonth}`,
          year: first.year,
          monthName: first.monthName,
          weekNumber: first.weekNumber,
          isWeekend: false,
          startDate: first.dateStr,
          endDate: last.dateStr,
          dates: daysInWeek.map((d) => d.dateStr),
        });
      });
      return cols;
    }
  }, [calendarDays, viewMode]);

  const yearSpans: { year: number; colSpan: number }[] = [];
  const monthSpans: { monthName: string; year: number; colSpan: number }[] = [];
  const weekSpans: { weekNumber: number; colSpan: number }[] = [];

  displayCols.forEach((col) => {
    const lastYear = yearSpans[yearSpans.length - 1];
    if (lastYear && lastYear.year === col.year) {
      lastYear.colSpan++;
    } else {
      yearSpans.push({ year: col.year, colSpan: 1 });
    }

    const lastMonth = monthSpans[monthSpans.length - 1];
    if (lastMonth && lastMonth.monthName === col.monthName && lastMonth.year === col.year) {
      lastMonth.colSpan++;
    } else {
      monthSpans.push({ monthName: col.monthName, year: col.year, colSpan: 1 });
    }

    const lastWeek = weekSpans[weekSpans.length - 1];
    if (lastWeek && lastWeek.weekNumber === col.weekNumber) {
      lastWeek.colSpan++;
    } else {
      weekSpans.push({ weekNumber: col.weekNumber, colSpan: 1 });
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
    e.dataTransfer.effectAllowed = 'move';

    // Set drag image anchor at left edge (1st day position) of the element
    if (e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      e.dataTransfer.setDragImage(e.currentTarget, 0, rect.height / 2);
    }

    // Make element translucent while dragging
    const elem = e.currentTarget;
    setTimeout(() => {
      if (elem) elem.style.opacity = '0.35';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
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
    const dataStr = e.dataTransfer.getData('text/plain');
    if (!dataStr) return;

    try {
      const parsed = JSON.parse(dataStr);

      // Handle edge resizing drag drop
      if (parsed.type === 'resize' && onResizeAllocation) {
        onResizeAllocation(parsed.allocationId, parsed.edge, targetDateStr);
        return;
      }

      // Handle full test allocation dragging
      const draggedAlloc: UnitAllocation = parsed;
      if (!draggedAlloc || !draggedAlloc.id) return;

      // Check if dragging a multi-selection of slabs
      const isMulti = selectedAllocationIds.includes(draggedAlloc.id) && selectedAllocationIds.length > 1;

      if (isMulti && onBatchUpdateAllocationDates) {
        // Collect all selected allocations
        const selectedAllocs: { alloc: UnitAllocation; test: LabTest; stationIndex: number }[] = [];
        tests.forEach((t) => {
          t.unitAllocations.forEach((a) => {
            if (selectedAllocationIds.includes(a.id)) {
              selectedAllocs.push({ alloc: a, test: t, stationIndex: 0 });
            }
          });
        });

        // Compute visual station order matching the exact top-to-bottom rendering order of sortedLabs & stations
        const visualStationOrder: string[] = [];
        sortedLabs.forEach((lab) => {
          const labStations = stations
            .filter((s) => s.labId === lab.id)
            .sort((a, b) => a.stationNumber - b.stationNumber);
          labStations.forEach((s) => visualStationOrder.push(s.id));
        });

        const draggedStationIdx = visualStationOrder.indexOf(draggedAlloc.stationId);
        const targetStationIdx = visualStationOrder.indexOf(targetStationId);
        const stationOffset = targetStationIdx - draggedStationIdx;

        // Compute working day offset relative to dragged allocation's start date
        const dateOffsetDays = (parseYYYYMMDD(targetDateStr).getTime() - parseYYYYMMDD(draggedAlloc.startDate).getTime()) / 86400000;

        // Calculate prospective new placements for ALL selected slabs
        const updates: { allocationId: string; newStationId: string; newStartDate: string; newEndDate: string }[] = [];
        let canFit = true;

        for (const { alloc } of selectedAllocs) {
          const currStationIdx = visualStationOrder.indexOf(alloc.stationId);
          const newStationIdx = currStationIdx + stationOffset;

          if (newStationIdx < 0 || newStationIdx >= visualStationOrder.length) {
            canFit = false;
            break;
          }

          const newStationId = visualStationOrder[newStationIdx];
          const currStartObj = parseYYYYMMDD(alloc.startDate);
          currStartObj.setDate(currStartObj.getDate() + dateOffsetDays);
          const newStartDate = formatYYYYMMDD(currStartObj);
          const dur = calculateWorkingDaysBetween(alloc.startDate, alloc.endDate);
          const newEndDate = addWorkingDays(newStartDate, dur);

          // Check collisions with non-selected slabs on the destination station
          const stationAllocs = allocationsByStation.get(newStationId) || [];
          const hasCollision = stationAllocs.some(({ alloc: existingAlloc }) => {
            if (selectedAllocationIds.includes(existingAlloc.id)) return false; // ignore collisions with other moving selected slabs
            return newStartDate <= existingAlloc.endDate && newEndDate >= existingAlloc.startDate;
          });

          if (hasCollision) {
            canFit = false;
            break;
          }

          updates.push({ allocationId: alloc.id, newStationId, newStartDate, newEndDate });
        }

        if (!canFit) {
          alert('Cannot move multi-selection: One or more selected test slabs collide or do not fit in the target stations/dates!');
          return;
        }

        onBatchUpdateAllocationDates(
          updates.map((u) => ({
            allocationId: u.allocationId,
            newStationId: u.newStationId,
            newStartDate: u.newStartDate,
          }))
        );
        return;
      }

      // Single slab drop handling
      const test = testMap.get(draggedAlloc.testId);
      if (!test) return;

      const unitDuration = calculateWorkingDaysBetween(draggedAlloc.startDate, draggedAlloc.endDate);
      const newEndDate = addWorkingDays(targetDateStr, unitDuration);
      const targetStationAllocations = allocationsByStation.get(targetStationId) || [];

      // Exclude the dragged allocation itself from collision check!
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
      console.error('Failed to parse drag drop data:', err);
    }
  };

  const col1Style: React.CSSProperties = {
    position: 'sticky',
    left: 0,
    width: `${labColWidth}px`,
    minWidth: `${labColWidth}px`,
    maxWidth: `${labColWidth}px`,
    boxSizing: 'border-box',
  };

  const col2Style: React.CSSProperties = {
    position: 'sticky',
    left: `${labColWidth}px`,
    width: `${stationColWidth}px`,
    minWidth: `${stationColWidth}px`,
    maxWidth: `${stationColWidth}px`,
    boxSizing: 'border-box',
  };

  // Compact day or week column width
  const cellWidth = viewMode === 'weeks' ? '70px' : '22px';

  const getLabTypePriority = (type: string, name: string): number => {
    const label = (LAB_TYPE_LABELS[type] || type || name).toLowerCase();
    if (label.includes('washer energy') || type === 'washer_energy') return 1;
    if (label.includes('washer performance') || type === 'washer_performance') return 2;
    if (label.includes('washer')) return 3;
    if (label.includes('dryer energy') || type === 'dryer_energy') return 4;
    if (label.includes('dryer performance') || type === 'dryer_performance') return 5;
    if (label.includes('dryer')) return 6;
    return 10;
  };

  // Filter and sort Labs hierarchically: 1. By Location, 2. Washers First (Energy then Performance), then Dryers, 3. By Lab Name
  const sortedLabs = [...labs]
    .filter((l) => {
      if (selectedLabIds && selectedLabIds.length > 0) {
        return selectedLabIds.includes(l.id);
      }
      return selectedLabId === 'all' || l.id === selectedLabId;
    })
    .sort((a, b) => {
      const locA = a.location || 'Mty';
      const locB = b.location || 'Mty';
      if (locA !== locB) {
        return locA.localeCompare(locB);
      }
      const prioA = getLabTypePriority(a.type, a.name);
      const prioB = getLabTypePriority(b.type, b.name);
      if (prioA !== prioB) {
        return prioA - prioB;
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div
      ref={containerRef}
      onClick={() => {
        if (onClearMultiSelection) onClearMultiSelection();
      }}
      className="relative overflow-x-auto border border-gray-300 rounded-lg shadow-sm bg-white min-h-[500px]"
    >
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Comments & Description
                </label>
                {activeCommentPopup.type === 'station' && onUpdateStationComments && (
                  <button
                    onClick={() => {
                      const newComm = prompt('Edit Station Comments:', activeCommentPopup.comments || '');
                      if (newComm !== null) {
                        onUpdateStationComments(activeCommentPopup.id, newComm.trim());
                        setActiveCommentPopup({
                          ...activeCommentPopup,
                          comments: newComm.trim(),
                        });
                      }
                    }}
                    className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                  >
                    Edit Station Comments
                  </button>
                )}
                {activeCommentPopup.type === 'lab' && onUpdateLabComments && (
                  <button
                    onClick={() => {
                      const newComm = prompt('Edit Lab Comments:', activeCommentPopup.comments || '');
                      if (newComm !== null) {
                        onUpdateLabComments(activeCommentPopup.id, newComm.trim());
                        setActiveCommentPopup({
                          ...activeCommentPopup,
                          comments: newComm.trim(),
                        });
                      }
                    }}
                    className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                  >
                    Edit Lab Comments
                  </button>
                )}
              </div>
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

      <table className="w-full border-collapse text-xs select-none table-fixed">
        <colgroup>
          <col style={{ width: `${labColWidth}px`, minWidth: `${labColWidth}px` }} />
          <col style={{ width: `${stationColWidth}px`, minWidth: `${stationColWidth}px` }} />
          {displayCols.map((col) => (
            <col key={col.id} style={{ minWidth: cellWidth }} />
          ))}
        </colgroup>

        <thead className="sticky top-0 z-40 shadow-sm bg-white">
          <tr className="bg-slate-800 text-white font-semibold text-center border-b border-slate-700">
            <th style={col1Style} className="px-2 py-2 bg-slate-800 z-50 border-r border-slate-700 text-left">
              Timeline / Year
            </th>
            <th style={col2Style} className="px-2 py-2 bg-slate-800 z-50 border-r border-slate-700 text-left" />
            {yearSpans.map((y, idx) => (
              <th key={idx} colSpan={y.colSpan} className="px-0.5 py-1 border-r border-slate-700 font-bold relative bg-slate-800">
                {y.year}
              </th>
            ))}
          </tr>

          <tr className="bg-slate-700 text-white font-medium text-center border-b border-slate-600">
            <th style={col1Style} className="px-2 py-1.5 bg-slate-700 z-50 border-r border-slate-600 text-left">
              Month
            </th>
            <th style={col2Style} className="px-2 py-1.5 bg-slate-700 z-50 border-r border-slate-600 text-left" />
            {monthSpans.map((m, idx) => (
              <th key={idx} colSpan={m.colSpan} className="px-0.5 py-1 border-r border-slate-600 text-[11px] font-semibold bg-slate-700">
                {m.monthName}
              </th>
            ))}
          </tr>

          <tr className="bg-slate-600 text-slate-100 font-medium text-center border-b border-slate-500">
            <th style={col1Style} className="px-2 py-1 bg-slate-600 z-50 border-r border-slate-500 text-left">
              Week
            </th>
            <th style={col2Style} className="px-2 py-1 bg-slate-600 z-50 border-r border-slate-500 text-left" />
            {weekSpans.map((w, idx) => (
              <th key={idx} colSpan={w.colSpan} className="px-0.5 py-1 border-r border-slate-500 text-[10px] bg-slate-600">
                W{w.weekNumber}
              </th>
            ))}
          </tr>

          <tr className="bg-slate-100 text-slate-700 font-bold text-center border-b-2 border-slate-400">
            <th style={col1Style} className="px-2 py-2 bg-slate-200 z-50 border-r border-slate-300 text-left relative group">
              <div className="flex items-center justify-between">
                <span className="truncate">Lab & Comments</span>
                <span className="text-[10px] text-slate-400 font-normal shrink-0">↔</span>
              </div>
              <div
                onMouseDown={handleStartResizeCol1}
                className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize hover:bg-blue-600/70 bg-transparent z-50"
                title="Drag to resize Lab column width"
              />
            </th>

            <th style={col2Style} className="px-2 py-2 bg-slate-200 z-50 border-r border-slate-300 text-left relative group">
              <div className="flex items-center justify-between">
                <span className="truncate">Station & Capabilities</span>
                <span className="text-[10px] text-slate-400 font-normal shrink-0">↔</span>
              </div>
              <div
                onMouseDown={handleStartResizeCol2}
                className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize hover:bg-blue-600/70 bg-transparent z-50"
                title="Drag to resize Station column width"
              />
            </th>

            {displayCols.map((col) => {
              const landmarkOnCol = landmarks.find((lm) => col.dates.includes(lm.date));
              const lmOffsetPct = landmarkOnCol
                ? (col.dates.indexOf(landmarkOnCol.date) / Math.max(1, col.dates.length)) * 100
                : 0;

              return (
                <th
                  key={col.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const dataStr = e.dataTransfer.getData('text/plain');
                    if (dataStr && onUpdateLandmark) {
                      try {
                        const parsed = JSON.parse(dataStr);
                        if (parsed.type === 'landmark' && parsed.landmarkId) {
                          const targetLandmark = landmarks.find((l) => l.id === parsed.landmarkId);
                          if (targetLandmark) {
                            onUpdateLandmark({ ...targetLandmark, date: col.startDate });
                          }
                        }
                      } catch (err) {
                        console.error('Failed to parse landmark drag drop:', err);
                      }
                    }
                  }}
                  className={`px-0.5 py-1 border-r border-slate-200 relative text-center text-[10px] ${
                    col.isWeekend ? 'bg-slate-200 text-slate-400' : 'bg-slate-50'
                  }`}
                  title={`${col.label} (${col.subLabel})${
                    landmarkOnCol ? ` - Landmark: ${landmarkOnCol.name}` : ''
                  }`}
                >
                  {/* Vertical Landmark Launch Line in Header */}
                  {landmarkOnCol && (
                    <>
                      <div
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'landmark', landmarkId: landmarkOnCol.id }));
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onUpdateLandmark) {
                            const newName = prompt('Edit Landmark Name:', landmarkOnCol.name);
                            if (newName && newName.trim()) {
                              onUpdateLandmark({ ...landmarkOnCol, name: newName.trim() });
                            }
                          }
                        }}
                        style={{ left: `${lmOffsetPct}%` }}
                        className="absolute -top-3 -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white text-[8px] font-bold px-1 py-0.2 rounded shadow-md whitespace-nowrap z-50 cursor-pointer active:cursor-grabbing select-none"
                        title="Click to rename landmark, drag to change date"
                      >
                        {landmarkOnCol.name}
                      </div>
                      <div
                        style={{ left: `${lmOffsetPct}%` }}
                        className="absolute top-0 bottom-0 w-1 bg-red-600 z-30 pointer-events-none -translate-x-1/2 shadow-sm"
                      />
                    </>
                  )}
                  <div>{col.label}</div>
                  {viewMode === 'weeks' && (
                    <div className="text-[8px] text-slate-400 font-normal truncate">{col.subLabel}</div>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {sortedLabs.map((lab) => {
            // Sort stations numerically by stationNumber increasing
            const labStations = stations
              .filter((s) => s.labId === lab.id)
              .sort((a, b) => a.stationNumber - b.stationNumber);

            if (labStations.length === 0) return null;

            return labStations.map((station, stationIndex) => {
              const isLastStationInLab = stationIndex === labStations.length - 1;

              return (
                <tr
                  key={station.id}
                  className={`hover:bg-slate-50/80 ${
                    isLastStationInLab ? 'border-b-2 border-slate-600' : 'border-b border-slate-200'
                  }`}
                >
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
                      style={col1Style}
                      className="px-2 py-2 bg-slate-100 z-30 border-r border-slate-300 font-semibold text-slate-800 align-top shadow-xs cursor-pointer hover:bg-slate-200 transition-colors overflow-hidden"
                      title="Click to view lab comments"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 truncate">{lab.name}</span>
                        <Info className="h-3 w-3 text-blue-500 shrink-0 ml-0.5" />
                      </div>

                      <div className="flex items-center gap-1 mt-1">
                        <span className="inline-block text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-mono font-bold">
                          {lab.location || 'Mty'}
                        </span>
                        <span className="inline-block text-[9px] px-1 py-0.2 bg-slate-200 text-slate-700 rounded font-mono">
                          {LAB_TYPE_LABELS[lab.type] || lab.type}
                        </span>
                      </div>

                      {lab.comments && (
                        <div className="text-[9px] text-slate-500 italic mt-1 line-clamp-2">
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
                    style={col2Style}
                    className="px-2 py-2 bg-white z-30 border-r border-slate-300 align-top shadow-xs cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden"
                    title="Click to view station comments & capabilities"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 truncate">Station {station.stationNumber} — {station.name}</span>
                      <Cpu className="h-3 w-3 text-emerald-500 shrink-0 ml-0.5" />
                    </div>

                    {station.capabilities && station.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mt-0.5">
                        {station.capabilities.map((cap) => (
                          <span key={cap.id} className="text-[8px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-mono">
                            {cap.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {station.comments && (
                      <div className="text-[9px] text-slate-500 italic mt-0.5 line-clamp-1">
                        {station.comments}
                      </div>
                    )}
                  </td>

                  {displayCols.map((col, colIdx) => {
                    const stationAllocations = allocationsByStation.get(station.id) || [];

                    // Collect all allocations starting in this column (or active on colIdx 0)
                    const allocsStartingHere = stationAllocations.filter(({ alloc }) => {
                      if (col.dates.includes(alloc.startDate)) return true;
                      if (colIdx === 0 && alloc.startDate < col.startDate && alloc.endDate >= col.startDate) return true;
                      return false;
                    });

                    const landmarkOnCol = landmarks.find((lm) => col.dates.includes(lm.date));

                    if (allocsStartingHere.length > 0) {
                      // Find max end column index across all allocations starting on this cell
                      const endColIndices = allocsStartingHere.map(({ alloc }) => {
                        const idx = displayCols.findIndex((c) => c.dates.includes(alloc.endDate));
                        return idx < 0 ? displayCols.length - 1 : idx;
                      });
                      const maxEndIndex = Math.max(...endColIndices);
                      const startIndex = colIdx;
                      const colSpan = Math.max(1, maxEndIndex - startIndex + 1);

                      return (
                        <td
                          key={col.id}
                          colSpan={colSpan}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, station.id, col.startDate)}
                          className="p-0.5 border-r border-slate-200 align-middle relative h-12"
                        >
                          {/* Vertical Landmark Launch Lines inside spanned cell */}
                          {displayCols.slice(startIndex, startIndex + colSpan).map((colInSpan, cIdx) => {
                            const lm = landmarks.find((l) => colInSpan.dates.includes(l.date));
                            if (!lm) return null;
                            const colFraction = colInSpan.dates.indexOf(lm.date) / Math.max(1, colInSpan.dates.length);
                            const pct = ((cIdx + colFraction) / colSpan) * 100;
                            return (
                              <div
                                key={lm.id}
                                style={{ left: `${pct}%` }}
                                className="absolute top-0 bottom-0 w-1 bg-red-600 z-30 pointer-events-none shadow-sm -translate-x-1/2"
                                title={`Landmark: ${lm.name} (${lm.date})`}
                              />
                            );
                          })}

                          <div className="flex flex-col gap-0.5 h-full w-full justify-center">
                            {allocsStartingHere.map(({ alloc, test }) => {
                              const isSelected = selectedAllocationId === alloc.id;
                              return (
                                <div
                                  key={alloc.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, alloc)}
                                  onDragEnd={handleDragEnd}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectAllocation(alloc, test, e.shiftKey);
                                  }}
                                  style={{ backgroundColor: test.status === 'completed' ? '#94a3b8' : test.color || '#2563eb' }}
                                  className={`h-full min-h-[22px] w-full rounded px-1 text-white font-medium flex items-center justify-between cursor-grab active:cursor-grabbing shadow-2xs transition-all hover:brightness-110 relative group z-10 ${
                                    test.status === 'completed' ? 'opacity-80' : ''
                                  } ${
                                    selectedAllocationIds.includes(alloc.id) ? 'ring-2 ring-amber-400 ring-offset-1 z-20 scale-[1.02]' : isSelected ? 'ring-2 ring-black ring-offset-1 z-10' : ''
                                  }`}
                                  title={`Test: ${test.name} ${test.status === 'completed' ? '(Completed)' : ''}\nVR: ${test.vrNumber || 'N/A'}\nOwner: ${test.testOwner || 'N/A'}\nUnit: ${alloc.unitIndex}/${alloc.totalUnits}\nDates: ${alloc.startDate} to ${alloc.endDate}`}
                                >
                                  {/* Left Resize Handle (Click +/- or drag handle) */}
                                  {onResizeAllocation && (
                                    <div
                                      onClick={(e) => e.stopPropagation()}
                                      className="absolute left-0 top-0 bottom-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                    >
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const prevDate = addDays(alloc.startDate, -1);
                                          onResizeAllocation(alloc.id, 'start', prevDate);
                                        }}
                                        className="h-full px-0.5 bg-black/50 hover:bg-black/80 text-white font-bold text-[9px] rounded-l flex items-center justify-center cursor-pointer"
                                        title="Expand start date (1 day earlier)"
                                      >
                                        +
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const nextDate = addDays(alloc.startDate, 1);
                                          if (nextDate <= alloc.endDate) {
                                            onResizeAllocation(alloc.id, 'start', nextDate);
                                          }
                                        }}
                                        className="h-full px-0.5 bg-black/50 hover:bg-black/80 text-white font-bold text-[9px] flex items-center justify-center cursor-pointer border-l border-white/20"
                                        title="Shrink start date (1 day later)"
                                      >
                                        -
                                      </button>
                                    </div>
                                  )}

                                  <div className="flex flex-col min-w-0 pl-3.5 leading-none py-0.5">
                                    <span className="truncate text-[10px] font-semibold drop-shadow-2xs">
                                      {test.name}
                                    </span>
                                    <span className="text-[8px] text-white/80 font-normal truncate">
                                      {test.assignedTechNames && test.assignedTechNames.length > 0
                                        ? test.assignedTechNames.join(', ')
                                        : (test.assignedTechName || '')}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-0.5 shrink-0 pr-3.5">
                                    <span className="bg-black/30 text-white font-mono text-[8px] px-1 py-0.2 rounded font-bold">
                                      {alloc.unitIndex}/{alloc.totalUnits}
                                    </span>
                                  </div>

                                  {/* Right Resize Handle (Click +/- or drag handle) */}
                                  {onResizeAllocation && (
                                    <div
                                      onClick={(e) => e.stopPropagation()}
                                      className="absolute right-0 top-0 bottom-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                    >
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const prevDate = addDays(alloc.endDate, -1);
                                          if (prevDate >= alloc.startDate) {
                                            onResizeAllocation(alloc.id, 'end', prevDate);
                                          }
                                        }}
                                        className="h-full px-0.5 bg-black/50 hover:bg-black/80 text-white font-bold text-[9px] flex items-center justify-center cursor-pointer border-r border-white/20"
                                        title="Shrink end date (1 day earlier)"
                                      >
                                        -
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const nextDate = addDays(alloc.endDate, 1);
                                          onResizeAllocation(alloc.id, 'end', nextDate);
                                        }}
                                        className="h-full px-0.5 bg-black/50 hover:bg-black/80 text-white font-bold text-[9px] rounded-r flex items-center justify-center cursor-pointer"
                                        title="Expand end date (1 day later)"
                                      >
                                        +
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    }

                    // Check if this column is covered by an allocation that started previously
                    const isCoveredByPrevAlloc = stationAllocations.some(({ alloc }) => {
                      const startColIdx = displayCols.findIndex((c) => c.dates.includes(alloc.startDate));
                      const effectiveStartColIdx = startColIdx < 0 ? 0 : startColIdx;
                      return effectiveStartColIdx < colIdx && col.startDate <= alloc.endDate;
                    });

                    if (isCoveredByPrevAlloc) {
                      return null;
                    }

                    return (
                      <td
                        key={col.id}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, station.id, col.startDate)}
                        onDoubleClick={() => onDoubleClickCell && onDoubleClickCell(station.id, col.startDate)}
                        className={`border-r border-slate-200 transition-colors hover:bg-blue-100/60 cursor-pointer relative ${
                          col.isWeekend ? 'bg-slate-100/60' : ''
                        }`}
                        title="Double-click to add test starting on this date"
                      >
                        {/* Vertical Landmark Launch Line */}
                        {landmarkOnCol && (() => {
                          const colFraction = col.dates.indexOf(landmarkOnCol.date) / Math.max(1, col.dates.length);
                          return (
                            <div
                              style={{ left: `${colFraction * 100}%` }}
                              className="absolute top-0 bottom-0 w-1 bg-red-600 z-30 pointer-events-none shadow-sm -translate-x-1/2"
                              title={`Landmark: ${landmarkOnCol.name} (${landmarkOnCol.date})`}
                            />
                          );
                        })()}
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

import React from 'react';
import type { PersonnelResource, LabTest, CalendarDay, TestTypeConfig } from '../types/labTracker';
import { LAB_TYPE_LABELS } from '../types/labTracker';
import { Users, Calendar as CalendarIcon, Award } from 'lucide-react';

interface TechWorkloadViewProps {
  resources: PersonnelResource[];
  tests: LabTest[];
  calendarDays: CalendarDay[];
  testTypes: TestTypeConfig[];
  startDateStr?: string;
  daysCount?: number;
  onStartDateChange?: (dateStr: string) => void;
  onDaysCountChange?: (days: number) => void;
}

export const TechWorkloadView: React.FC<TechWorkloadViewProps> = ({
  resources,
  tests,
  calendarDays,
  testTypes,
  startDateStr,
  daysCount,
  onStartDateChange,
  onDaysCountChange,
}) => {
  const typeMap = new Map<string, string>(testTypes.map((tt) => [tt.id, tt.label]));

  // Exclude completed tests from active technician workload
  const activeTests = tests.filter((t) => t.status !== 'completed');

  // Compute hierarchical header spans for Techs Workload table
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

  return (
    <div className="space-y-6">
      {/* Timeline Controls Bar for Techs Workload View */}
      {startDateStr !== undefined && onStartDateChange && (
        <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-slate-500" />
              <label className="font-semibold text-slate-700">Timeline Start Date:</label>
              <input
                type="date"
                value={startDateStr}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="px-2.5 py-1 border border-slate-300 rounded text-xs font-mono"
              />
            </div>

            {daysCount !== undefined && onDaysCountChange && (
              <div className="flex items-center gap-2">
                <label className="font-semibold text-slate-700">Days to View (Technician Agenda):</label>
                <select
                  value={daysCount}
                  onChange={(e) => onDaysCountChange(Math.min(365, parseInt(e.target.value) || 30))}
                  className="px-2.5 py-1 border border-slate-300 rounded text-xs bg-white font-mono"
                >
                  <option value={14}>14 Days (2 Weeks)</option>
                  <option value={30}>30 Days (1 Month)</option>
                  <option value={60}>60 Days (2 Months)</option>
                  <option value={90}>90 Days (Quarter)</option>
                  <option value={180}>180 Days (6 Months)</option>
                  <option value={365}>365 Days (1 Year Max)</option>
                </select>
              </div>
            )}
          </div>

          <div className="text-slate-500 italic text-[11px]">
            Viewing {calendarDays.length} days of technician agenda & parallel test lanes
          </div>
        </div>
      )}

      {/* Header Overview Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl text-white">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Technician Workload & Concurrent Test Tracking</h2>
              <p className="text-xs text-slate-500">
                Track technician availability, active test assignments, off-days, and parallel test lanes (Completed tests excluded)
              </p>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-lg text-xs font-semibold text-emerald-800">
            Total Technicians: {resources.length}
          </div>
        </div>

        {/* Technician Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((tech) => {
            const assignedActiveTests = activeTests.filter((t) => {
              if (t.assignedTechName) {
                return t.assignedTechName.toLowerCase() === tech.name.toLowerCase();
              }
              return t.labType && tech.capabilities.includes(t.labType);
            });

            return (
              <div
                key={tech.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    {tech.name}
                  </div>
                  <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                    ID: {tech.id}
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Award className="h-3 w-3 text-blue-500" /> Qualified Lab Capabilities
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {tech.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-medium"
                      >
                        {typeMap.get(cap) || LAB_TYPE_LABELS[cap] || cap}
                      </span>
                    ))}
                    {tech.capabilities.length === 0 && (
                      <span className="text-[10px] text-slate-400 italic">No capabilities assigned</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3 text-amber-500" /> Holiday / Scheduled Off-Days
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {tech.holidays.map((h) => (
                      <span
                        key={h}
                        className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono"
                      >
                        {h}
                      </span>
                    ))}
                    {tech.holidays.length === 0 && (
                      <span className="text-[10px] text-slate-400 italic">No off-days scheduled</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span className="font-semibold">Active Assigned Tests:</span>
                    <span className="font-bold text-slate-900">{assignedActiveTests.length}</span>
                  </div>
                  <div className="space-y-1">
                    {assignedActiveTests.map((at) => (
                      <div
                        key={at.id}
                        className="text-[11px] bg-white border border-slate-200 p-1.5 rounded flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold block truncate max-w-[170px]" style={{ color: at.color }}>
                            {at.name}
                          </span>
                          {at.testComments && (
                            <span className="text-[10px] text-slate-500 italic block">{at.testComments}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{at.startDate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technician Timeline Schedule Heatmap with Multi-Level Year/Month/Week/Day Headers */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs overflow-x-auto">
        <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-blue-600" /> Technician Multi-Test Agenda ({calendarDays.length} Days)
        </h3>

        <table className="w-full border-collapse text-xs select-none" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '180px' }} />
            {calendarDays.map((d) => (
              <col key={d.dateStr} style={{ width: '22px' }} />
            ))}
          </colgroup>

          <thead>
            {/* Year Header Row */}
            <tr className="bg-slate-800 text-white font-semibold text-center border-b border-slate-700">
              <th className="px-3 py-1.5 text-left sticky left-0 bg-slate-800 z-10 border-r border-slate-700 w-44">
                Year
              </th>
              {yearSpans.map((y, idx) => (
                <th key={idx} colSpan={y.colSpan} className="px-1 py-1 border-r border-slate-700 font-bold">
                  {y.year}
                </th>
              ))}
            </tr>

            {/* Month Header Row */}
            <tr className="bg-slate-700 text-white font-medium text-center border-b border-slate-600">
              <th className="px-3 py-1 text-left sticky left-0 bg-slate-700 z-10 border-r border-slate-600">
                Month
              </th>
              {monthSpans.map((m, idx) => (
                <th key={idx} colSpan={m.colSpan} className="px-1 py-1 border-r border-slate-600 text-[11px] font-semibold">
                  {m.monthName}
                </th>
              ))}
            </tr>

            {/* Week Header Row */}
            <tr className="bg-slate-600 text-slate-100 font-medium text-center border-b border-slate-500">
              <th className="px-3 py-1 text-left sticky left-0 bg-slate-600 z-10 border-r border-slate-500">
                Week
              </th>
              {weekSpans.map((w, idx) => (
                <th key={idx} colSpan={w.colSpan} className="px-0.5 py-1 border-r border-slate-500 text-[10px]">
                  W{w.weekNumber}
                </th>
              ))}
            </tr>

            {/* Day Header Row */}
            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
              <th className="px-3 py-2 text-left sticky left-0 bg-slate-200 z-10 border-r border-slate-300">
                Technician & Test Lane
              </th>
              {calendarDays.map((day) => (
                <th
                  key={day.dateStr}
                  className={`px-0.5 py-1 text-center border-r border-slate-200 text-[10px] ${
                    day.isWeekend ? 'bg-slate-200 text-slate-400' : 'bg-slate-50'
                  }`}
                  title={day.dateStr}
                >
                  {day.dayOfMonth}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {resources.map((tech) => {
              const techActiveTests = activeTests.filter((t) => {
                if (t.assignedTechName) {
                  return t.assignedTechName.toLowerCase() === tech.name.toLowerCase();
                }
                return t.labType && tech.capabilities.includes(t.labType);
              });

              const lanes = techActiveTests.length > 0 ? techActiveTests : [null];

              return lanes.map((testItem, laneIdx) => (
                <tr key={`${tech.id}-lane-${laneIdx}`} className="border-b border-slate-200">
                  {laneIdx === 0 && (
                    <td
                      rowSpan={lanes.length}
                      className="px-3 py-2 font-bold text-slate-800 sticky left-0 bg-slate-100 z-10 border-r border-slate-300 align-top"
                    >
                      <div>{tech.name}</div>
                      <span className="text-[10px] text-slate-500 font-mono font-normal block">
                        {lanes.length > 1 ? `${lanes.length} Concurrent Lanes` : '1 Test Lane'}
                      </span>
                    </td>
                  )}

                  {calendarDays.map((day) => {
                    const isOff = tech.holidays.includes(day.dateStr);
                    if (isOff) {
                      return (
                        <td
                          key={day.dateStr}
                          className="bg-amber-200 text-amber-900 font-bold text-center text-[9px] border-r border-slate-200"
                          title={`${tech.name} on Holiday / Off-day (${day.dateStr})`}
                        >
                          OFF
                        </td>
                      );
                    }

                    if (day.isWeekend) {
                      return <td key={day.dateStr} className="bg-slate-100 border-r border-slate-200" />;
                    }

                    if (testItem) {
                      const testAlloc = testItem.unitAllocations[0];
                      const endDate = testAlloc ? testAlloc.endDate : testItem.startDate;
                      const isActiveOnDay = day.dateStr >= testItem.startDate && day.dateStr <= endDate;

                      if (isActiveOnDay) {
                        return (
                          <td
                            key={day.dateStr}
                            style={{ backgroundColor: testItem.color || '#2563eb' }}
                            className="text-white text-center text-[9px] font-bold border-r border-slate-200 truncate p-0.5"
                            title={`Test: ${testItem.name}\nComments: ${testItem.testComments || 'None'}\nDates: ${testItem.startDate} to ${endDate}`}
                          >
                            <span className="truncate block">{testItem.name}</span>
                          </td>
                        );
                      }
                    }

                    return (
                      <td
                        key={day.dateStr}
                        className="bg-emerald-50/60 text-emerald-700 text-center text-[10px] font-semibold border-r border-slate-200"
                        title={`${tech.name} Available`}
                      >
                        ✓
                      </td>
                    );
                  })}
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

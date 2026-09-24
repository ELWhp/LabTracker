import React from 'react';
import type { PersonnelResource, LabTest, CalendarDay, TestTypeConfig } from '../types/labTracker';
import { LAB_TYPE_LABELS } from '../types/labTracker';
import { Users, Calendar, Award } from 'lucide-react';

interface TechWorkloadViewProps {
  resources: PersonnelResource[];
  tests: LabTest[];
  calendarDays: CalendarDay[];
  testTypes: TestTypeConfig[];
}

export const TechWorkloadView: React.FC<TechWorkloadViewProps> = ({
  resources,
  tests,
  calendarDays,
  testTypes,
}) => {
  const typeMap = new Map<string, string>(testTypes.map((tt) => [tt.id, tt.label]));

  return (
    <div className="space-y-6">
      {/* Header Overview Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl text-white">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Technician Workload & Resource Allocation</h2>
              <p className="text-xs text-slate-500">
                Track team capacity, lab capability qualifications, off-days, and scheduled test load
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
            const assignedTests = tests.filter((t) => {
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
                    <Calendar className="h-3 w-3 text-amber-500" /> Holiday / Scheduled Off-Days
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
                    <span className="font-semibold">Matching Active Lab Tests:</span>
                    <span className="font-bold text-slate-900">{assignedTests.length}</span>
                  </div>
                  <div className="space-y-1">
                    {assignedTests.map((at) => (
                      <div
                        key={at.id}
                        className="text-[11px] bg-white border border-slate-200 p-1.5 rounded flex items-center justify-between"
                      >
                        <span className="font-semibold truncate max-w-[170px]" style={{ color: at.color }}>
                          {at.name}
                        </span>
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

      {/* Technician Timeline Schedule Heatmap */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs overflow-x-auto">
        <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-600" /> Daily Availability & Workload Heatmap
        </h3>

        <table className="min-w-full border-collapse text-xs select-none">
          <thead>
            <tr className="bg-slate-800 text-white font-semibold">
              <th className="px-3 py-2 text-left sticky left-0 bg-slate-800 z-10 border-r border-slate-700 w-44">
                Technician
              </th>
              {calendarDays.slice(0, 30).map((day) => (
                <th
                  key={day.dateStr}
                  className={`w-8 min-w-[32px] px-1 py-1 text-center border-r border-slate-700 ${
                    day.isWeekend ? 'bg-slate-700 text-slate-400' : ''
                  }`}
                  title={day.dateStr}
                >
                  {day.dayOfMonth}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resources.map((tech) => (
              <tr key={tech.id} className="border-b border-slate-200">
                <td className="px-3 py-2.5 font-bold text-slate-800 sticky left-0 bg-slate-100 z-10 border-r border-slate-300">
                  {tech.name}
                </td>
                {calendarDays.slice(0, 30).map((day) => {
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

                  return (
                    <td
                      key={day.dateStr}
                      className="bg-emerald-50 text-emerald-800 text-center text-[10px] font-semibold border-r border-slate-200"
                      title={`${tech.name} Available`}
                    >
                      ✓
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

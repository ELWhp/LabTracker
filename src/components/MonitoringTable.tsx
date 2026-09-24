import React, { useState } from 'react';
import type { LabTest, TestTypeConfig, CalendarDay } from '../types/labTracker';
import { LAB_TYPE_LABELS } from '../types/labTracker';
import { Trash2, Edit2, ExternalLink, User, FileCode, History, CheckCircle2, RotateCcw } from 'lucide-react';

interface MonitoringTableProps {
  tests: LabTest[];
  testTypes?: TestTypeConfig[];
  calendarDays?: CalendarDay[];
  onUpdateTest: (updatedTest: LabTest) => void;
  onDeleteTest: (testId: string) => void;
}

export const MonitoringTable: React.FC<MonitoringTableProps> = ({
  tests,
  testTypes = [],
  calendarDays = [],
  onUpdateTest,
  onDeleteTest,
}) => {
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [historyModalTest, setHistoryModalTest] = useState<LabTest | null>(null);
  const [showCompleted, setShowCompleted] = useState<boolean>(false);

  const typeMap = new Map<string, string>(testTypes.map((tt) => [tt.id, tt.label]));

  // Filter out completed tests unless user enables "Show Completed Tests"
  const visibleTests = tests.filter((t) => {
    if (showCompleted) return true;
    return t.status !== 'completed';
  });

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-3">
      {/* Test Edit History Audit Log Modal */}
      {historyModalTest && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Edit Audit Log: {historyModalTest.name}
                </h3>
              </div>
              <button
                onClick={() => setHistoryModalTest(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {historyModalTest.editHistory && historyModalTest.editHistory.length > 0 ? (
                historyModalTest.editHistory.map((log, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>User: {log.updatedBy}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className="text-slate-800 font-medium">{log.details}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  No previous edit history logged for this test.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Test Monitoring & Tracking Table</h2>
          <p className="text-[11px] text-slate-500">
            Real-time schedule parameters, VR numbers, test owners, chronogram timeline bars & edit audit logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer select-none bg-slate-50 px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="text-blue-600 rounded"
            />
            <span>Show Completed Tests ({tests.filter((t) => t.status === 'completed').length})</span>
          </label>

          <span className="text-xs font-semibold bg-blue-50 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200">
            Active Tests: {tests.filter((t) => t.status !== 'completed').length}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold text-left border-b border-slate-300">
              <th className="px-3 py-2 min-w-[650px] w-[88%]">Chronogram Timeline (90% Width)</th>
              <th className="px-3 py-2">Test Name</th>
              <th className="px-3 py-2">Test Comments</th>
              <th className="px-3 py-2">Assigned Tech</th>
              <th className="px-3 py-2">VR # & Link</th>
              <th className="px-3 py-2">Owner</th>
              <th className="px-3 py-2">Lab Type</th>
              <th className="px-3 py-2 text-center">Units</th>
              <th className="px-3 py-2 text-center">Duration</th>
              <th className="px-3 py-2 text-center">Start Date</th>
              <th className="px-3 py-2 text-center">Status & Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleTests.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-3 py-6 text-center text-slate-400 italic">
                  {showCompleted ? 'No completed or active tests found.' : 'No active tests scheduled. Mark tests as completed to hide them, or check "Show Completed Tests".'}
                </td>
              </tr>
            ) : (
              visibleTests.map((test) => {
                const isEditing = editingTestId === test.id;
                const isCompleted = test.status === 'completed';

                const totalCalDays = Math.max(1, calendarDays.length);
                const testStartIndex = calendarDays.findIndex((d) => d.dateStr === test.startDate);
                const testAlloc = test.unitAllocations[0];
                const testEndDate = testAlloc ? testAlloc.endDate : test.startDate;
                const testEndIndex = calendarDays.findIndex((d) => d.dateStr === testEndDate);

                let leftPercent = 0;
                let widthPercent = 100;

                if (testStartIndex >= 0) {
                  leftPercent = (testStartIndex / totalCalDays) * 100;
                  const durationSpan = Math.max(1, (testEndIndex >= 0 ? testEndIndex : testStartIndex) - testStartIndex + 1);
                  widthPercent = (durationSpan / totalCalDays) * 100;
                }

                return (
                  <tr
                    key={test.id}
                    className={`border-b border-slate-200 transition-colors ${
                      isCompleted ? 'bg-slate-100/70 text-slate-500' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Visual Chronogram Column */}
                    <td className="px-3 py-2 align-middle">
                      <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden relative border border-slate-200" title={`Chronogram: ${test.startDate} to ${testEndDate}`}>
                        <div
                          style={{
                            marginLeft: `${leftPercent}%`,
                            width: `${Math.min(100 - leftPercent, widthPercent)}%`,
                            backgroundColor: isCompleted ? '#94a3b8' : test.color || '#2563eb',
                          }}
                          className="h-full rounded-full transition-all"
                        />
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5 text-center">
                        {test.startDate.slice(5)} - {testEndDate.slice(5)}
                      </div>
                    </td>

                    {/* Test Name */}
                    <td className="px-3 py-2 font-semibold">
                      {isEditing ? (
                        <input
                          type="text"
                          value={test.name}
                          onChange={(e) => onUpdateTest({ ...test, name: e.target.value })}
                          className="px-2 py-1 border border-blue-400 rounded w-full font-sans text-xs focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: isCompleted ? '#94a3b8' : test.color }}
                          />
                          <span className={`font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {test.name}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Test Comments */}
                    <td className="px-3 py-2 text-slate-600 italic">
                      {isEditing ? (
                        <input
                          type="text"
                          value={test.testComments || ''}
                          placeholder="e.g. Needs scale"
                          onChange={(e) => onUpdateTest({ ...test, testComments: e.target.value })}
                          className="px-2 py-1 border border-blue-400 rounded w-full font-sans text-xs"
                        />
                      ) : (
                        <span className="line-clamp-2">{test.testComments || 'None'}</span>
                      )}
                    </td>

                    {/* Assigned Tech */}
                    <td className="px-3 py-2 text-slate-700 font-medium">
                      {isEditing ? (
                        <input
                          type="text"
                          value={test.assignedTechName || ''}
                          placeholder="Tech Name"
                          onChange={(e) => onUpdateTest({ ...test, assignedTechName: e.target.value })}
                          className="px-2 py-1 border border-blue-400 rounded w-full font-sans text-xs"
                        />
                      ) : (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                          {test.assignedTechName || 'Auto-Assigned'}
                        </span>
                      )}
                    </td>

                    {/* VR Number & Link */}
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-600">
                      {test.vrNumber ? (
                        <div className="flex items-center gap-1">
                          <FileCode className="h-3 w-3 text-slate-400" />
                          <span>{test.vrNumber}</span>
                          {test.linkToVR && (
                            <a
                              href={test.linkToVR}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline inline-flex items-center gap-0.5 ml-1"
                              title="Open VR Link"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>

                    {/* Test Owner */}
                    <td className="px-3 py-2 text-slate-600">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-400" />
                        <span className="truncate max-w-[120px]">{test.testOwner || 'Unassigned'}</span>
                      </div>
                    </td>

                    {/* Lab Type */}
                    <td className="px-3 py-2 text-slate-600 font-medium">
                      {typeMap.get(test.labType) || LAB_TYPE_LABELS[test.labType] || test.labType}
                    </td>

                    {/* Amount of Units */}
                    <td className="px-3 py-2 text-center font-bold text-slate-700">
                      {isEditing ? (
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={test.units}
                          onChange={(e) =>
                            onUpdateTest({ ...test, units: Math.max(1, parseInt(e.target.value) || 1) })
                          }
                          className="px-2 py-1 border border-blue-400 rounded w-16 text-center font-mono text-xs"
                        />
                      ) : (
                        test.units
                      )}
                    </td>

                    {/* Duration in Days */}
                    <td className="px-3 py-2 text-center font-mono text-slate-700">
                      {test.durationDays} working days
                    </td>

                    {/* Start Date */}
                    <td className="px-3 py-2 text-center font-mono text-slate-600">
                      {test.startDate}
                    </td>

                    {/* Actions & Mark as Completed Toggle */}
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() =>
                            onUpdateTest({
                              ...test,
                              status: isCompleted ? 'active' : 'completed',
                            })
                          }
                          className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
                            isCompleted
                              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                          }`}
                          title={isCompleted ? 'Reactivate Test' : 'Mark Test as Completed (hides from workload & table)'}
                        >
                          {isCompleted ? (
                            <>
                              <RotateCcw className="h-3 w-3" /> Reactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Complete
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setHistoryModalTest(test)}
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View Edit Audit Log"
                        >
                          <History className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => setEditingTestId(isEditing ? null : test.id)}
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-200 rounded transition-colors"
                          title={isEditing ? 'Done Editing' : 'Edit Test'}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteTest(test.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Test"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

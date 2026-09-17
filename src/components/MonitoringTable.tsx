import React, { useState } from 'react';
import type { LabTest } from '../types/labTracker';
import { LAB_TYPE_LABELS } from '../types/labTracker';
import { Edit2, Trash2, Layers } from 'lucide-react';

interface MonitoringTableProps {
  tests: LabTest[];
  onUpdateTest: (updatedTest: LabTest) => void;
  onDeleteTest: (testId: string) => void;
}

export const MonitoringTable: React.FC<MonitoringTableProps> = ({
  tests,
  onUpdateTest,
  onDeleteTest,
}) => {
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUnits, setEditUnits] = useState(1);
  const [editColor, setEditColor] = useState('#3b82f6');
  const [editResources, setEditResources] = useState(1);

  const startEditing = (test: LabTest) => {
    setEditingTestId(test.id);
    setEditName(test.name);
    setEditUnits(test.units);
    setEditColor(test.color);
    setEditResources(test.resourcesNeededTotal);
  };

  const saveEditing = (test: LabTest) => {
    if (!editName.trim()) return;

    const minStart = test.unitAllocations.reduce(
      (min, a) => (a.startDate < min ? a.startDate : min),
      test.startDate
    );

    onUpdateTest({
      ...test,
      name: editName.trim(),
      units: Math.max(1, editUnits),
      color: editColor,
      resourcesNeededTotal: Math.max(1, editResources),
      startDate: minStart,
    });
    setEditingTestId(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            Test Monitoring Table
          </h3>
          <p className="text-xs text-slate-500">
            Overview of all ongoing and scheduled lab tests. Edits to Test Name or Amount of Units here automatically update the main lab schedule.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <th className="px-3 py-2">Color</th>
              <th className="px-3 py-2">Test Name</th>
              <th className="px-3 py-2">Lab Type</th>
              <th className="px-3 py-2 text-center">Amount of Units</th>
              <th className="px-3 py-2 text-center">Duration (Days)</th>
              <th className="px-3 py-2 text-center">Resources Needed</th>
              <th className="px-3 py-2">Start Date</th>
              <th className="px-3 py-2">End Date</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {tests.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-slate-400 italic">
                  No tests created yet. Click "Add Test" above to configure a new test.
                </td>
              </tr>
            ) : (
              tests.map((test) => {
                const isEditing = editingTestId === test.id;
                const minStartDate = test.unitAllocations.length > 0
                  ? test.unitAllocations.reduce((min, a) => (a.startDate < min ? a.startDate : min), test.unitAllocations[0].startDate)
                  : test.startDate;
                const maxEndDate = test.unitAllocations.length > 0
                  ? test.unitAllocations.reduce((max, a) => (a.endDate > max ? a.endDate : max), test.unitAllocations[0].endDate)
                  : '-';

                return (
                  <tr key={test.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 align-middle">
                      {isEditing ? (
                        <input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
                        />
                      ) : (
                        <div
                          className="w-5 h-5 rounded border border-slate-300 shadow-xs"
                          style={{ backgroundColor: test.color }}
                          title={test.color}
                        />
                      )}
                    </td>

                    <td className="px-3 py-2 font-medium text-slate-800 align-middle">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2 py-1 border border-slate-300 rounded text-xs w-full focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        test.name
                      )}
                    </td>

                    <td className="px-3 py-2 align-middle">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium border border-slate-200">
                        {LAB_TYPE_LABELS[test.labType]}
                      </span>
                    </td>

                    <td className="px-3 py-2 text-center font-bold text-slate-700 align-middle">
                      {isEditing ? (
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={editUnits}
                          onChange={(e) => setEditUnits(parseInt(e.target.value) || 1)}
                          className="px-2 py-1 border border-slate-300 rounded text-xs w-16 text-center"
                        />
                      ) : (
                        test.units
                      )}
                    </td>

                    <td className="px-3 py-2 text-center align-middle font-mono">
                      {test.durationDays} days
                    </td>

                    <td className="px-3 py-2 text-center align-middle font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={editResources}
                          onChange={(e) => setEditResources(parseInt(e.target.value) || 1)}
                          className="px-2 py-1 border border-slate-300 rounded text-xs w-16 text-center"
                        />
                      ) : (
                        `${test.resourcesNeededTotal} tech`
                      )}
                    </td>

                    <td className="px-3 py-2 align-middle font-mono text-slate-600">
                      {minStartDate}
                    </td>

                    <td className="px-3 py-2 align-middle font-mono text-slate-600">
                      {maxEndDate}
                    </td>

                    <td className="px-3 py-2 text-right align-middle space-x-1">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => saveEditing(test)}
                            className="px-2 py-1 bg-green-600 text-white text-[11px] rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingTestId(null)}
                            className="px-2 py-1 bg-slate-200 text-slate-700 text-[11px] rounded hover:bg-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEditing(test)}
                            className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                            title="Edit Test"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTest(test.id)}
                            className="p-1 text-slate-500 hover:text-red-600 rounded hover:bg-slate-100"
                            title="Delete Test"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
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

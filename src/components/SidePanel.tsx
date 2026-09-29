import React, { useState, useEffect } from 'react';
import type { UnitAllocation, LabTest, Lab, Station } from '../types/labTracker';
import { calculateWorkingDaysBetween, addWorkingDays } from '../utils/labTrackerUtils';
import { X, Calendar, User, FileCode, ExternalLink, Cpu, History, Edit2, AlertTriangle } from 'lucide-react';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  allocation: UnitAllocation | null;
  test: LabTest | null;
  labs: Lab[];
  stations: Station[];
  allTests?: LabTest[];
  onUpdateAllocation: (updatedAllocation: UnitAllocation) => void;
  onEditTest?: (test: LabTest) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  allocation,
  test,
  labs,
  stations,
  allTests,
  onUpdateAllocation,
  onEditTest,
}) => {
  if (!isOpen || !allocation || !test) return null;

  const station = stations.find((s) => s.id === allocation.stationId);
  const lab = station ? labs.find((l) => l.id === station.labId) : null;

  const currentDuration = calculateWorkingDaysBetween(allocation.startDate, allocation.endDate);
  const [durationInput, setDurationInput] = useState<number>(currentDuration);
  const [collisionWarning, setCollisionWarning] = useState<string | null>(null);

  useEffect(() => {
    setDurationInput(currentDuration);
    setCollisionWarning(null);
  }, [allocation.id, allocation.startDate, allocation.endDate]);

  const handleDurationChange = (newDays: number) => {
    if (newDays <= 0 || isNaN(newDays)) return;
    setDurationInput(newDays);

    const calculatedEndDate = addWorkingDays(allocation.startDate, newDays);

    // Collision check against other allocations on the same station
    let hasCollision = false;
    let collidingTestName = '';

    if (allTests) {
      for (const t of allTests) {
        for (const a of t.unitAllocations) {
          if (a.id === allocation.id) continue;
          if (a.stationId === allocation.stationId) {
            // Check overlap
            if (allocation.startDate <= a.endDate && calculatedEndDate >= a.startDate) {
              hasCollision = true;
              collidingTestName = t.name;
              break;
            }
          }
        }
        if (hasCollision) break;
      }
    }

    if (hasCollision) {
      setCollisionWarning(`Warning: Extending duration to ${newDays} working days (${calculatedEndDate}) collides with test "${collidingTestName}" on this station!`);
    } else {
      setCollisionWarning(null);
    }

    onUpdateAllocation({
      ...allocation,
      endDate: calculatedEndDate,
    });
  };

  const techList = test.assignedTechNames && test.assignedTechNames.length > 0
    ? test.assignedTechNames.join(', ')
    : (test.assignedTechName || 'Auto-Assigned');

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-slate-200 z-[60] transform transition-transform duration-300 ease-in-out flex flex-col">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: test.color }} />
          <div>
            <h3 className="font-bold text-sm leading-tight">{test.name}</h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Unit {allocation.unitIndex} of {test.units}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {onEditTest && (
            <button
              onClick={() => onEditTest(test)}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded flex items-center gap-1 transition-colors cursor-pointer"
              title="Open full test edit window"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit Test
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
        {/* Completion Status Toggle */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-800 text-xs block">Test Completion Status</span>
            <span className="text-[11px] text-slate-500">
              {test.status === 'completed' ? 'Completed (Hidden from workload & monitoring)' : 'Active Test'}
            </span>
          </div>
          <span
            className={`px-2.5 py-1 rounded font-bold text-xs ${
              test.status === 'completed'
                ? 'bg-slate-200 text-slate-700 border border-slate-300'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
          >
            {test.status === 'completed' ? 'Completed ✓' : 'Active'}
          </span>
        </div>

        {/* Test Comments & Assigned Technician */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div>
            <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider block mb-1">
              Assigned Technician(s)
            </span>
            <span className="font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded text-xs inline-block">
              {techList}
            </span>
          </div>

          {test.testComments && (
            <div className="border-t pt-2">
              <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider block mb-1">
                Test Comments & Details
              </span>
              <p className="text-xs text-slate-800 italic bg-white p-2 rounded border border-slate-200">
                "{test.testComments}"
              </p>
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-2">
            <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider flex items-center gap-1">
              <User className="h-3 w-3 text-blue-500" /> Test Owner
            </span>
            <span className="font-bold text-slate-800">{test.testOwner || 'Unassigned'}</span>
          </div>

          <div className="flex items-center justify-between border-t pt-2">
            <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider flex items-center gap-1">
              <FileCode className="h-3 w-3 text-slate-500" /> VR Number
            </span>
            <span className="font-mono font-bold text-slate-800">{test.vrNumber || 'N/A'}</span>
          </div>

          {test.linkToVR && (
            <div className="border-t pt-2">
              <a
                href={test.linkToVR}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 text-[11px] font-semibold"
              >
                <ExternalLink className="h-3 w-3" /> Open Linked VR Document
              </a>
            </div>
          )}
        </div>

        {/* Assigned Location */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
            Assigned Facility Location
          </label>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
            <div className="font-bold text-blue-900">{lab?.name || 'Unknown Lab'}</div>
            <div className="font-medium text-blue-800 flex items-center gap-1">
              <Cpu className="h-3.5 w-3.5" />
              {station?.name || 'Unknown Station'}
            </div>
            {station?.comments && (
              <div className="text-[11px] text-blue-700 italic border-t border-blue-200 pt-1 mt-1">
                "{station.comments}"
              </div>
            )}
            {station?.capabilities && station.capabilities.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {station.capabilities.map((cap) => (
                  <span key={cap.id} className="text-[9px] bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded font-mono">
                    {cap.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Unit Date Configuration */}
        <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-blue-500" /> Schedule Unit Duration & Dates
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Duration (Working Days):</label>
            <input
              type="number"
              min="1"
              value={durationInput}
              onChange={(e) => handleDurationChange(parseInt(e.target.value) || 1)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-xs bg-white font-bold text-blue-900"
            />
          </div>

          {collisionWarning && (
            <div className="p-2 bg-amber-50 border border-amber-300 rounded text-amber-800 text-[11px] flex items-start gap-1.5 font-medium">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{collisionWarning}</span>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Start Date:</label>
            <input
              type="date"
              value={allocation.startDate}
              onChange={(e) => {
                const newStart = e.target.value;
                const newEnd = addWorkingDays(newStart, durationInput);
                onUpdateAllocation({ ...allocation, startDate: newStart, endDate: newEnd });
              }}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-xs bg-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">End Date:</label>
            <input
              type="date"
              value={allocation.endDate}
              onChange={(e) =>
                onUpdateAllocation({ ...allocation, endDate: e.target.value })
              }
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-xs bg-white"
            />
          </div>
        </div>

        {/* Edit Audit History */}
        <div className="space-y-2">
          <label className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
            <History className="h-3.5 w-3.5 text-slate-500" /> Recent Edit Audit Log
          </label>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
            {test.editHistory && test.editHistory.length > 0 ? (
              test.editHistory.map((log, idx) => (
                <div key={idx} className="border-b border-slate-200 pb-1.5 last:border-b-0 text-[11px]">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{log.updatedBy}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <div className="text-slate-700 mt-0.5">{log.details}</div>
                </div>
              ))
            ) : (
              <div className="text-slate-400 italic text-[11px]">No previous edit history.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

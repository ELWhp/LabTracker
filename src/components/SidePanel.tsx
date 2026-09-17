import React from 'react';
import type { LabTest, UnitAllocation, Lab, Station } from '../types/labTracker';
import { LAB_TYPE_LABELS } from '../types/labTracker';
import { X, Calendar, Clock, Layers, Users, CheckCircle, Tag } from 'lucide-react';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  allocation: UnitAllocation | null;
  test: LabTest | null;
  labs: Lab[];
  stations: Station[];
  onUpdateAllocation: (updatedAllocation: UnitAllocation) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  allocation,
  test,
  labs,
  stations,
  onUpdateAllocation,
}) => {
  if (!isOpen || !allocation || !test) return null;

  const station = stations.find((s) => s.id === allocation.stationId);
  const lab = station ? labs.find((l) => l.id === station.labId) : null;

  const fractionStr = `${allocation.unitIndex}/${allocation.totalUnits}`;
  const resourceAllocFraction = (test.resourcesNeededTotal / test.units).toFixed(2);

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col transition-all animate-in slide-in-from-right duration-200">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
            style={{ backgroundColor: test.color }}
          />
          <h3 className="font-bold text-slate-800 text-sm truncate max-w-[220px]">
            {test.name}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-200"
          title="Hide Side Panel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs text-slate-700">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600">Unit Identification</span>
            <span className="bg-blue-600 text-white font-mono font-bold text-[11px] px-2 py-0.5 rounded-full">
              Unit {fractionStr}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 block">Assigned Lab:</span>
              <span className="font-semibold text-slate-800">{lab ? lab.name : '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Assigned Station:</span>
              <span className="font-semibold text-slate-800">
                {station ? `Station ${station.stationNumber}` : '-'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
            Test Details
          </h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Tag className="h-3.5 w-3.5 text-slate-400" /> Lab Type
              </span>
              <span className="font-semibold text-slate-800">{LAB_TYPE_LABELS[test.labType]}</span>
            </div>

            <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Layers className="h-3.5 w-3.5 text-slate-400" /> Total Units in Test
              </span>
              <span className="font-semibold text-slate-800">{test.units} units</span>
            </div>

            <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Clock className="h-3.5 w-3.5 text-slate-400" /> Duration (Working Days)
              </span>
              <span className="font-semibold text-slate-800">{test.durationDays} days</span>
            </div>

            <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Users className="h-3.5 w-3.5 text-slate-400" /> Resource Allocation / Unit
              </span>
              <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {resourceAllocFraction} Tech
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" /> Scheduled Dates
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <label className="block text-[10px] text-slate-500 font-medium">Start Date</label>
              <input
                type="date"
                value={allocation.startDate}
                onChange={(e) =>
                  onUpdateAllocation({ ...allocation, startDate: e.target.value })
                }
                className="w-full mt-1 px-2 py-1 text-xs border border-slate-300 rounded font-mono bg-white"
              />
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <label className="block text-[10px] text-slate-500 font-medium">End Date</label>
              <input
                type="date"
                value={allocation.endDate}
                onChange={(e) =>
                  onUpdateAllocation({ ...allocation, endDate: e.target.value })
                }
                className="w-full mt-1 px-2 py-1 text-xs border border-slate-300 rounded font-mono bg-white"
              />
            </div>
          </div>
        </div>

        {station?.notes && (
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
            <span className="font-semibold text-amber-900 block mb-1 text-[11px]">
              Station Specific Notes:
            </span>
            <p className="text-amber-800 text-xs italic">{station.notes}</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          <CheckCircle className="h-3.5 w-3.5 text-green-600" /> Auto-saved
        </span>
        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold cursor-pointer"
        >
          Close Panel
        </button>
      </div>
    </div>
  );
};

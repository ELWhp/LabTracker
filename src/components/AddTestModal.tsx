import React, { useState } from 'react';
import type { LabType, LabTest, UnitAllocation, Lab, Station } from '../types/labTracker';
import { LAB_TYPE_LABELS } from '../types/labTracker';
import { addWorkingDays } from '../utils/labTrackerUtils';
import { Plus, X, Palette, Calendar, Clock, Layers, Users } from 'lucide-react';

interface AddTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  labs: Lab[];
  stations: Station[];
  defaultStartDate: string;
  onAddTest: (test: LabTest) => void;
}

export const AddTestModal: React.FC<AddTestModalProps> = ({
  isOpen,
  onClose,
  labs,
  stations,
  defaultStartDate,
  onAddTest,
}) => {
  const [name, setName] = useState('');
  const [labType, setLabType] = useState<LabType>('washer_energy');
  const [units, setUnits] = useState(2);
  const [durationDays, setDurationDays] = useState(10);
  const [color, setColor] = useState('#3b82f6');
  const [resourcesNeededTotal, setResourcesNeededTotal] = useState(1);
  const [startDate, setStartDate] = useState(defaultStartDate);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const testId = `test-${Date.now()}`;
    const endDate = addWorkingDays(startDate, durationDays);

    const matchingLabs = labs.filter((l) => l.type === labType);
    const matchingStations = stations.filter((s) => matchingLabs.some((l) => l.id === s.labId));

    const unitAllocations: UnitAllocation[] = [];

    for (let i = 1; i <= units; i++) {
      const station = matchingStations[(i - 1) % (matchingStations.length || 1)];
      unitAllocations.push({
        id: `alloc-${testId}-${i}`,
        testId,
        unitIndex: i,
        totalUnits: units,
        stationId: station ? station.id : 'st-1-1',
        startDate,
        endDate,
      });
    }

    const newTest: LabTest = {
      id: testId,
      name: name.trim(),
      units,
      durationDays,
      color,
      resourcesNeededTotal,
      labType,
      startDate,
      unitAllocations,
    };

    onAddTest(newTest);
    onClose();

    setName('');
    setUnits(2);
    setDurationDays(10);
    setColor('#3b82f6');
    setResourcesNeededTotal(1);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Add New Lab Test
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Test Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. WASHER ENERGY CONSUMPTION 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lab Capability Type
              </label>
              <select
                value={labType}
                onChange={(e) => setLabType(e.target.value as LabType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(LAB_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Palette className="h-3.5 w-3.5 text-slate-500" /> Badge Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-9 p-0.5 rounded border border-slate-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-slate-500" /> Units
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={units}
                onChange={(e) => setUnits(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-500" /> Working Days
              </label>
              <input
                type="number"
                min={1}
                max={60}
                required
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-slate-500" /> Resources
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={resourcesNeededTotal}
                onChange={(e) => setResourcesNeededTotal(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-500" /> Start Date
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              Add Test to Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

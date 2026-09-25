import React, { useState, useEffect } from 'react';
import type { Lab, Station, LabTest, UnitAllocation, TestTypeConfig, PersonnelResource } from '../types/labTracker';
import { getRandomVibrantColor, addWorkingDays } from '../utils/labTrackerUtils';
import { X, Plus, Sparkles, User, FileCode, ExternalLink } from 'lucide-react';

interface AddTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  labs: Lab[];
  stations: Station[];
  resources?: PersonnelResource[];
  testTypes?: TestTypeConfig[];
  defaultStartDate: string;
  prefilledStationId?: string;
  currentUserEmail?: string;
  onAddTest: (newTest: LabTest) => void;
}

export const AddTestModal: React.FC<AddTestModalProps> = ({
  isOpen,
  onClose,
  labs,
  stations,
  resources = [],
  testTypes = [],
  defaultStartDate,
  prefilledStationId,
  currentUserEmail = 'user@labcompany.com',
  onAddTest,
}) => {
  const [testName, setTestName] = useState('');
  const [testComments, setTestComments] = useState('');
  const [assignedTechName, setAssignedTechName] = useState('');
  const [vrNumber, setVrNumber] = useState('');
  const [linkToVR, setLinkToVR] = useState('');
  const [testOwner, setTestOwner] = useState(currentUserEmail);
  const [units, setUnits] = useState(2);
  const [durationDays, setDurationDays] = useState(10);
  const [labType, setLabType] = useState<string>('washer_energy');
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [resourcesNeededTotal, setResourcesNeededTotal] = useState(1);
  const [color, setColor] = useState(() => getRandomVibrantColor());

  useEffect(() => {
    if (isOpen) {
      setStartDate(defaultStartDate);
      setTestOwner(currentUserEmail);
      setColor(getRandomVibrantColor());
      if (prefilledStationId) {
        const station = stations.find((s) => s.id === prefilledStationId);
        const lab = station ? labs.find((l) => l.id === station.labId) : null;
        if (lab) {
          setLabType(lab.type);
        }
      }

      // Auto-assign qualified technician based on labType AND matching lab location
      const selectedLab = labs.find((l) => l.type === labType || (l.supportedTestTypes && l.supportedTestTypes.includes(labType)));
      const labLocation = selectedLab?.location?.toLowerCase() || '';

      const locationMatchTech = resources.find(
        (r) => r.capabilities.includes(labType) && r.location?.toLowerCase() === labLocation
      );

      const anyQualifiedTech = resources.find((r) => r.capabilities.includes(labType));

      if (locationMatchTech) {
        setAssignedTechName(locationMatchTech.name);
      } else if (anyQualifiedTech) {
        setAssignedTechName(anyQualifiedTech.name);
      } else if (resources.length > 0) {
        setAssignedTechName(resources[0].name);
      }
    }
  }, [isOpen, defaultStartDate, prefilledStationId, currentUserEmail, stations, labs, resources, labType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) return;

    const testId = `test-${Date.now()}`;
    const matchingLabs = labs.filter(
      (l) => l.type === labType || (l.supportedTestTypes && l.supportedTestTypes.includes(labType))
    );
    const matchingStations = stations.filter((s) => matchingLabs.some((l) => l.id === s.labId));

    let assignedStationId = matchingStations[0]?.id || 'st-1-1';
    if (prefilledStationId && matchingStations.some((s) => s.id === prefilledStationId)) {
      assignedStationId = prefilledStationId;
    }

    const unitAllocations: UnitAllocation[] = [];
    const endDate = addWorkingDays(startDate, durationDays);

    for (let i = 1; i <= units; i++) {
      const station = matchingStations[(i - 1) % (matchingStations.length || 1)];
      unitAllocations.push({
        id: `alloc-${testId}-${i}`,
        testId,
        unitIndex: i,
        totalUnits: units,
        stationId: i === 1 && prefilledStationId ? assignedStationId : station ? station.id : assignedStationId,
        startDate,
        endDate,
      });
    }

    const newTest: LabTest = {
      id: testId,
      name: testName,
      testComments: testComments.trim() || undefined,
      assignedTechName: assignedTechName.trim() || undefined,
      vrNumber: vrNumber.trim() || undefined,
      linkToVR: linkToVR.trim() || undefined,
      testOwner: testOwner.trim() || currentUserEmail,
      units,
      durationDays,
      color,
      resourcesNeededTotal,
      labType,
      startDate,
      unitAllocations,
      editHistory: [
        {
          timestamp: new Date().toLocaleString(),
          updatedBy: testOwner || currentUserEmail,
          details: `Created test schedule. Assigned Tech: ${assignedTechName || 'Auto'}`,
        },
      ],
    };

    onAddTest(newTest);
    onClose();
    setTestName('');
    setTestComments('');
    setVrNumber('');
    setLinkToVR('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">Add New Lab Test Schedule</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs text-slate-700">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Test Name *</label>
            <input
              type="text"
              required
              placeholder="e.g., ENERGY STAR Audit Cycle 2026"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-sans text-xs font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Test Comments / Notes (e.g. Needs Scale)</label>
            <textarea
              rows={2}
              placeholder="e.g., Requires precision scale and humidity probe"
              value={testComments}
              onChange={(e) => setTestComments(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-sans text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Assigned Technician (Auto-Assigned)</label>
              <input
                type="text"
                placeholder="Technician Name"
                value={assignedTechName}
                onChange={(e) => setAssignedTechName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-sans text-xs bg-emerald-50/50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <FileCode className="h-3.5 w-3.5 text-slate-400" /> VR Number
              </label>
              <input
                type="text"
                placeholder="e.g., VR-2026-005"
                value={vrNumber}
                onChange={(e) => setVrNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-blue-500" /> Test Owner Email
              </label>
              <input
                type="email"
                required
                placeholder="owner@labcompany.com"
                value={testOwner}
                onChange={(e) => setTestOwner(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-sans text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
              <ExternalLink className="h-3.5 w-3.5 text-blue-500" /> Link to VR Document
            </label>
            <input
              type="url"
              placeholder="https://codebeamer.example.com/item/1001"
              value={linkToVR}
              onChange={(e) => setLinkToVR(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Required Lab Type</label>
              <select
                value={labType}
                onChange={(e) => setLabType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-sans text-xs"
              >
                {testTypes.length > 0 ? (
                  testTypes.map((tt) => (
                    <option key={tt.id} value={tt.id}>
                      {tt.label}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="washer_energy">Washer Energy</option>
                    <option value="dryer_energy">Dryer Energy</option>
                    <option value="washer_performance">Washer Performance</option>
                    <option value="dryer_performance">Dryer Performance</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Number of Units</label>
              <input
                type="number"
                min={1}
                max={20}
                value={units}
                onChange={(e) => setUnits(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Duration (Working Days)</label>
              <input
                type="number"
                min={1}
                max={365}
                value={durationDays}
                onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tech Resources Req</label>
              <input
                type="number"
                min={1}
                max={10}
                value={resourcesNeededTotal}
                onChange={(e) => setResourcesNeededTotal(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Test Badge Color (Auto-Generated)</label>
              <button
                type="button"
                onClick={() => setColor(getRandomVibrantColor())}
                className="text-[11px] text-blue-600 hover:underline font-semibold"
              >
                Randomize Color
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-8 p-0 border border-slate-300 rounded cursor-pointer"
              />
              <span className="font-mono text-xs text-slate-600">{color}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Schedule Test
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

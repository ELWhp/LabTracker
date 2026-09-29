import React, { useState, useEffect } from 'react';
import type { LabTest, TestTypeConfig, PersonnelResource } from '../types/labTracker';
import { getRandomVibrantColor } from '../utils/labTrackerUtils';
import { X, Sparkles, User, FileCode, ExternalLink, Save, Plus, Minus } from 'lucide-react';

interface EditTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: LabTest | null;
  resources?: PersonnelResource[];
  testTypes?: TestTypeConfig[];
  currentUserEmail?: string;
  onSaveTest: (updatedTest: LabTest) => void;
}

export const EditTestModal: React.FC<EditTestModalProps> = ({
  isOpen,
  onClose,
  test,
  resources = [],
  testTypes = [],
  currentUserEmail = 'user@labcompany.com',
  onSaveTest,
}) => {
  const [testName, setTestName] = useState('');
  const [testComments, setTestComments] = useState('');
  const [assignedTechNames, setAssignedTechNames] = useState<string[]>([]);
  const [vrNumber, setVrNumber] = useState('');
  const [linkToVR, setLinkToVR] = useState('');
  const [testOwner, setTestOwner] = useState(currentUserEmail);
  const [units, setUnits] = useState(2);
  const [durationDays, setDurationDays] = useState(10);
  const [labType, setLabType] = useState<string>('washer_energy');
  const [startDate, setStartDate] = useState('');
  const [resourcesNeededTotal, setResourcesNeededTotal] = useState(1);
  const [color, setColor] = useState('#2563eb');

  useEffect(() => {
    if (isOpen && test) {
      setTestName(test.name || '');
      setTestComments(test.testComments || '');
      setAssignedTechNames(test.assignedTechNames || (test.assignedTechName ? test.assignedTechName.split(', ') : []));
      setVrNumber(test.vrNumber || '');
      setLinkToVR(test.linkToVR || '');
      setTestOwner(test.testOwner || currentUserEmail);
      setUnits(test.units || 1);
      setDurationDays(test.durationDays || 1);
      setLabType(test.labType || 'washer_energy');
      setStartDate(test.startDate || '');
      setResourcesNeededTotal(test.resourcesNeededTotal || 1);
      setColor(test.color || '#2563eb');
    }
  }, [isOpen, test, currentUserEmail]);

  if (!isOpen || !test) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) return;

    const updatedTest: LabTest = {
      ...test,
      name: testName.trim(),
      testComments: testComments.trim() || undefined,
      assignedTechName: assignedTechNames.join(', ') || undefined,
      assignedTechNames: assignedTechNames.length > 0 ? assignedTechNames : undefined,
      vrNumber: vrNumber.trim() || undefined,
      linkToVR: linkToVR.trim() || undefined,
      testOwner: testOwner.trim() || currentUserEmail,
      units,
      durationDays,
      color,
      resourcesNeededTotal,
      labType,
      startDate,
    };

    onSaveTest(updatedTest);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">Edit Test Schedule: {test.name}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
          <div>
            <label className="font-bold text-slate-800 block mb-1">Test Name *</label>
            <input
              type="text"
              required
              placeholder="Test Name"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-sans text-sm font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Test Comments / Requirements</label>
            <textarea
              rows={3}
              placeholder="Enter special testing equipment, scale, humidity sensor requirements or notes"
              value={testComments}
              onChange={(e) => setTestComments(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-sans text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Assigned Technicians (Select up to 2)</label>
              <select
                multiple
                value={assignedTechNames}
                onChange={(e) => {
                  const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
                  setAssignedTechNames(opts.slice(0, 2));
                }}
                className="w-full px-2 py-1 border border-slate-300 rounded-lg font-sans text-xs bg-white h-16"
              >
                {resources.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} ({r.location || 'Mty'})
                  </option>
                ))}
              </select>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
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

          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            {/* Amount of Units with Add / Remove controls */}
            <div>
              <label className="font-bold text-slate-800 block mb-1">Number of Units</label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setUnits(Math.max(1, units - 1))}
                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-bold cursor-pointer"
                  title="Remove 1 unit"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={units}
                  onChange={(e) => setUnits(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-center font-bold font-mono text-xs bg-white"
                />
                <button
                  type="button"
                  onClick={() => setUnits(units + 1)}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold cursor-pointer"
                  title="Add 1 unit"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Duration (Working Days)</label>
              <input
                type="number"
                min={1}
                max={365}
                value={durationDays}
                onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Tech Resources Req</label>
              <input
                type="number"
                step="0.1"
                min={0.1}
                max={10}
                value={resourcesNeededTotal}
                onChange={(e) => setResourcesNeededTotal(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Test Badge Color</label>
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
              <Save className="h-4 w-4" /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

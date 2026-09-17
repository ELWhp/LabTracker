import React, { useState } from 'react';
import type { Lab, Station, PersonnelResource, LabType } from '../types/labTracker';
import { LAB_TYPE_LABELS } from '../types/labTracker';
import { Settings, Plus, Trash2, Calendar, UserCheck, CheckSquare, Square } from 'lucide-react';

interface LabConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  labs: Lab[];
  stations: Station[];
  resources: PersonnelResource[];
  onUpdateLabsAndStations: (labs: Lab[], stations: Station[]) => void;
  onUpdateResources: (resources: PersonnelResource[]) => void;
}

export const LabConfigModal: React.FC<LabConfigModalProps> = ({
  isOpen,
  onClose,
  labs,
  stations,
  resources,
  onUpdateLabsAndStations,
  onUpdateResources,
}) => {
  const [activeTab, setActiveTab] = useState<'labs' | 'resources'>('labs');

  const [localLabs, setLocalLabs] = useState<Lab[]>(labs);
  const [localStations, setLocalStations] = useState<Station[]>(stations);

  const [localResources, setLocalResources] = useState<PersonnelResource[]>(resources);
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceHoliday, setNewResourceHoliday] = useState('');

  if (!isOpen) return null;

  const handleStationCountChange = (labId: string, count: number) => {
    const targetCount = Math.max(1, count);
    const updatedLabs = localLabs.map((l) => (l.id === labId ? { ...l, stationCount: targetCount } : l));
    setLocalLabs(updatedLabs);

    const currentStationsForLab = localStations.filter((s) => s.labId === labId);
    if (currentStationsForLab.length < targetCount) {
      const toAdd = targetCount - currentStationsForLab.length;
      const newStations: Station[] = [];
      for (let i = 1; i <= toAdd; i++) {
        const stationNumber = currentStationsForLab.length + i;
        newStations.push({
          id: `st-${labId}-${Date.now()}-${i}`,
          labId,
          stationNumber,
          notes: `Station ${stationNumber} configured notes`,
        });
      }
      setLocalStations([...localStations, ...newStations]);
    } else if (currentStationsForLab.length > targetCount) {
      const keptStationIds = currentStationsForLab.slice(0, targetCount).map((s) => s.id);
      setLocalStations(localStations.filter((s) => s.labId !== labId || keptStationIds.includes(s.id)));
    }
  };

  const handleStationNoteChange = (stationId: string, notes: string) => {
    setLocalStations(
      localStations.map((s) => (s.id === stationId ? { ...s, notes } : s))
    );
  };

  const toggleCapability = (resId: string, cap: LabType) => {
    setLocalResources(
      localResources.map((r) => {
        if (r.id !== resId) return r;
        const exists = r.capabilities.includes(cap);
        const updated = exists
          ? r.capabilities.filter((c) => c !== cap)
          : [...r.capabilities, cap];
        return { ...r, capabilities: updated };
      })
    );
  };

  const addHolidayToResource = (resId: string, holidayDate: string) => {
    if (!holidayDate) return;
    setLocalResources(
      localResources.map((r) => {
        if (r.id !== resId) return r;
        if (r.holidays.includes(holidayDate)) return r;
        return { ...r, holidays: [...r.holidays, holidayDate] };
      })
    );
  };

  const removeHolidayFromResource = (resId: string, holidayDate: string) => {
    setLocalResources(
      localResources.map((r) => {
        if (r.id !== resId) return r;
        return { ...r, holidays: r.holidays.filter((h) => h !== holidayDate) };
      })
    );
  };

  const handleAddResource = () => {
    if (!newResourceName.trim()) return;
    const newRes: PersonnelResource = {
      id: `res-${Date.now()}`,
      name: newResourceName.trim(),
      capabilities: ['washer_energy'],
      holidays: [],
    };
    setLocalResources([...localResources, newRes]);
    setNewResourceName('');
  };

  const handleSave = () => {
    onUpdateLabsAndStations(localLabs, localStations);
    onUpdateResources(localResources);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-600" />
            Lab Tracker Configuration
          </h3>
          <div className="flex bg-slate-200 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('labs')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === 'labs' ? 'bg-white shadow-xs text-slate-800 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Labs & Stations
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === 'resources' ? 'bg-white shadow-xs text-slate-800 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Personnel & Resources
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'labs' ? (
            <div className="space-y-6">
              {localLabs.map((lab) => {
                const labStations = localStations.filter((s) => s.labId === lab.id);
                return (
                  <div key={lab.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{lab.name}</h4>
                        <span className="text-xs text-slate-500 font-medium">{LAB_TYPE_LABELS[lab.type]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-600 font-semibold">Stations Count:</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={lab.stationCount}
                          onChange={(e) => handleStationCountChange(lab.id, parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border border-slate-300 rounded text-xs font-bold text-center bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Station Notes Setup</p>
                      {labStations.map((station) => (
                        <div key={station.id} className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-md">
                          <span className="text-xs font-semibold text-slate-700 w-24 shrink-0">
                            Station {station.stationNumber}
                          </span>
                          <input
                            type="text"
                            value={station.notes}
                            onChange={(e) => handleStationNoteChange(station.id, e.target.value)}
                            placeholder="Add station notes (e.g. 220V power, water hookup specs...)"
                            className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <input
                  type="text"
                  value={newResourceName}
                  onChange={(e) => setNewResourceName(e.target.value)}
                  placeholder="New technician name..."
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddResource}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Resource
                </button>
              </div>

              <div className="space-y-4">
                {localResources.map((res) => (
                  <div key={res.id} className="border border-slate-200 rounded-lg p-4 bg-white shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                        <UserCheck className="h-4 w-4 text-blue-600" /> {res.name}
                      </span>
                      <button
                        onClick={() => setLocalResources(localResources.filter((r) => r.id !== res.id))}
                        className="text-slate-400 hover:text-red-600 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-slate-600 mb-2">Test Type Capabilities:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(LAB_TYPE_LABELS).map(([typeKey, typeLabel]) => {
                          const isCapable = res.capabilities.includes(typeKey as LabType);
                          return (
                            <button
                              key={typeKey}
                              type="button"
                              onClick={() => toggleCapability(res.id, typeKey as LabType)}
                              className={`flex items-center gap-2 p-2 rounded text-xs border text-left transition-colors ${
                                isCapable
                                  ? 'bg-blue-50 border-blue-300 text-blue-900 font-medium'
                                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              {isCapable ? (
                                <CheckSquare className="h-4 w-4 text-blue-600 shrink-0" />
                              ) : (
                                <Square className="h-4 w-4 text-slate-400 shrink-0" />
                              )}
                              <span>{typeLabel}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" /> Configured Holiday Off Days:
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="date"
                          value={newResourceHoliday}
                          onChange={(e) => setNewResourceHoliday(e.target.value)}
                          className="px-2 py-1 text-xs border border-slate-300 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            addHolidayToResource(res.id, newResourceHoliday);
                            setNewResourceHoliday('');
                          }}
                          className="px-2.5 py-1 bg-slate-800 text-white rounded text-xs font-medium hover:bg-slate-900"
                        >
                          Add Off Day
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {res.holidays.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic">No holiday off days set.</span>
                        ) : (
                          res.holidays.map((hDate) => (
                            <span
                              key={hDate}
                              className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 text-[11px] px-2 py-0.5 rounded font-mono"
                            >
                              {hDate}
                              <button
                                onClick={() => removeHolidayFromResource(res.id, hDate)}
                                className="text-amber-700 hover:text-amber-950 font-bold ml-1"
                              >
                                &times;
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 text-xs font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

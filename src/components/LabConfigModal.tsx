import React, { useState } from 'react';
import type { Lab, Station, PersonnelResource, TestTypeConfig, StationCapability } from '../types/labTracker';
import { DEFAULT_TEST_TYPES } from '../types/labTracker';
import { X, Plus, Trash2, Settings, Users, Cpu, FileText } from 'lucide-react';

interface LabConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  labs: Lab[];
  stations: Station[];
  resources: PersonnelResource[];
  testTypes?: TestTypeConfig[];
  onUpdateLabsAndStations: (labs: Lab[], stations: Station[]) => void;
  onUpdateResources: (resources: PersonnelResource[]) => void;
  onUpdateTestTypes?: (testTypes: TestTypeConfig[]) => void;
}

export const LabConfigModal: React.FC<LabConfigModalProps> = ({
  isOpen,
  onClose,
  labs,
  stations,
  resources,
  testTypes = DEFAULT_TEST_TYPES,
  onUpdateLabsAndStations,
  onUpdateResources,
  onUpdateTestTypes,
}) => {
  const [activeTab, setActiveTab] = useState<'labs' | 'testTypes' | 'stations' | 'techs'>('labs');

  const [localLabs, setLocalLabs] = useState<Lab[]>(labs);
  const [localStations, setLocalStations] = useState<Station[]>(stations);
  const [localResources, setLocalResources] = useState<PersonnelResource[]>(resources);
  const [localTestTypes, setLocalTestTypes] = useState<TestTypeConfig[]>(testTypes);

  // New item inputs
  const [newLabName, setNewLabName] = useState('');
  const [newLabType, setNewLabType] = useState('washer_energy');
  const [newLabComments, setNewLabComments] = useState('');

  const [newTestTypeName, setNewTestTypeName] = useState('');
  const [newTestTypeLabel, setNewTestTypeLabel] = useState('');
  const [newTestTypeColor, setNewTestTypeColor] = useState('#2563eb');

  const [newTechName, setNewTechName] = useState('');

  if (!isOpen) return null;

  const handleSaveAll = () => {
    onUpdateLabsAndStations(localLabs, localStations);
    onUpdateResources(localResources);
    if (onUpdateTestTypes) {
      onUpdateTestTypes(localTestTypes);
    }
    onClose();
  };

  const handleAddLab = () => {
    if (!newLabName.trim()) return;
    const labId = `lab-${Date.now()}`;
    const newLab: Lab = {
      id: labId,
      name: newLabName.trim(),
      type: newLabType,
      stationCount: 2,
      comments: newLabComments.trim() || undefined,
      supportedTestTypes: [newLabType],
    };

    const newLabStations: Station[] = [
      {
        id: `st-${labId}-1`,
        labId,
        stationNumber: 1,
        name: `${newLabName} - Station 1`,
        comments: 'Default station setup',
        capabilities: [],
      },
      {
        id: `st-${labId}-2`,
        labId,
        stationNumber: 2,
        name: `${newLabName} - Station 2`,
        comments: 'Default station setup',
        capabilities: [],
      },
    ];

    setLocalLabs([...localLabs, newLab]);
    setLocalStations([...localStations, ...newLabStations]);

    setNewLabName('');
    setNewLabComments('');
  };

  const handleDeleteLab = (labId: string) => {
    if (confirm('Delete this lab and all its stations?')) {
      setLocalLabs(localLabs.filter((l) => l.id !== labId));
      setLocalStations(localStations.filter((s) => s.labId !== labId));
    }
  };

  const handleAddTestType = () => {
    if (!newTestTypeLabel.trim()) return;
    const typeId = newTestTypeName.toLowerCase().replace(/\s+/g, '_') || `type_${Date.now()}`;
    const newTT: TestTypeConfig = {
      id: typeId,
      name: typeId,
      label: newTestTypeLabel.trim(),
      color: newTestTypeColor,
    };
    setLocalTestTypes([...localTestTypes, newTT]);
    setNewTestTypeName('');
    setNewTestTypeLabel('');
  };

  const handleDeleteTestType = (typeId: string) => {
    setLocalTestTypes(localTestTypes.filter((tt) => tt.id !== typeId));
  };

  const handleAddTech = () => {
    if (!newTechName.trim()) return;
    const newTech: PersonnelResource = {
      id: `res-${Date.now()}`,
      name: newTechName.trim(),
      capabilities: [localTestTypes[0]?.id || 'washer_energy'],
      holidays: [],
    };
    setLocalResources([...localResources, newTech]);
    setNewTechName('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 space-y-4 border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">Lab & Resource System Configuration</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-2">
          {[
            { key: 'labs', label: 'Labs & Supported Types', icon: FileText },
            { key: 'testTypes', label: 'Custom Test Types', icon: Settings },
            { key: 'stations', label: 'Stations & Capabilities', icon: Cpu },
            { key: 'techs', label: 'Technicians & Qualifications', icon: Users },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`px-3 py-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
          {/* TAB 1: LABS */}
          {activeTab === 'labs' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-800">Add New Lab</h3>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Lab Name (e.g. Washer Energy Lab E)"
                    value={newLabName}
                    onChange={(e) => setNewLabName(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded font-sans text-xs bg-white"
                  />
                  <select
                    value={newLabType}
                    onChange={(e) => setNewLabType(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded font-sans text-xs bg-white"
                  >
                    {localTestTypes.map((tt) => (
                      <option key={tt.id} value={tt.id}>
                        {tt.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Lab Comments"
                    value={newLabComments}
                    onChange={(e) => setNewLabComments(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded font-sans text-xs bg-white"
                  />
                </div>
                <button
                  onClick={handleAddLab}
                  className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded text-xs flex items-center gap-1 hover:bg-blue-500 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Lab
                </button>
              </div>

              <div className="space-y-3">
                {localLabs.map((lab) => (
                  <div key={lab.id} className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between border-b pb-1.5">
                      <div className="font-bold text-slate-800 text-sm">{lab.name}</div>
                      <button
                        onClick={() => handleDeleteLab(lab.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete Lab"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Lab Comments:</label>
                      <input
                        type="text"
                        value={lab.comments || ''}
                        onChange={(e) => {
                          const updated = localLabs.map((l) =>
                            l.id === lab.id ? { ...l, comments: e.target.value } : l
                          );
                          setLocalLabs(updated);
                        }}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Supported Test Types:</label>
                      <div className="flex flex-wrap gap-2">
                        {localTestTypes.map((tt) => {
                          const isSupported = (lab.supportedTestTypes || [lab.type]).includes(tt.id);
                          return (
                            <label
                              key={tt.id}
                              className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isSupported}
                                onChange={() => {
                                  const current = lab.supportedTestTypes || [lab.type];
                                  const updatedTypes = isSupported
                                    ? current.filter((t) => t !== tt.id)
                                    : [...current, tt.id];
                                  setLocalLabs(
                                    localLabs.map((l) =>
                                      l.id === lab.id ? { ...l, supportedTestTypes: updatedTypes } : l
                                    )
                                  );
                                }}
                              />
                              <span className="font-medium text-slate-700">{tt.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM TEST TYPES */}
          {activeTab === 'testTypes' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-800">Add New Test Type</h3>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Label (e.g. Washer Energy)"
                    value={newTestTypeLabel}
                    onChange={(e) => {
                      setNewTestTypeLabel(e.target.value);
                      setNewTestTypeName(e.target.value);
                    }}
                    className="px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-slate-600 font-semibold">Badge Color:</label>
                    <input
                      type="color"
                      value={newTestTypeColor}
                      onChange={(e) => setNewTestTypeColor(e.target.value)}
                      className="w-10 h-7 p-0 border border-slate-300 rounded cursor-pointer"
                    />
                  </div>
                  <button
                    onClick={handleAddTestType}
                    className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded text-xs flex items-center gap-1 hover:bg-blue-500 cursor-pointer justify-center"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Type
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {localTestTypes.map((tt) => (
                  <div key={tt.id} className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: tt.color }} />
                      <span className="font-bold text-slate-800">{tt.label}</span>
                      <span className="font-mono text-[10px] text-slate-400">({tt.id})</span>
                    </div>
                    <button
                      onClick={() => handleDeleteTestType(tt.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STATIONS & CAPABILITIES */}
          {activeTab === 'stations' && (
            <div className="space-y-3">
              {localStations.map((station) => {
                const lab = localLabs.find((l) => l.id === station.labId);
                return (
                  <div key={station.id} className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between border-b pb-1 font-bold text-slate-800">
                      <span>{station.name} ({lab?.name})</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-600 block mb-1">Station Name:</label>
                        <input
                          type="text"
                          value={station.name}
                          onChange={(e) => {
                            setLocalStations(
                              localStations.map((s) =>
                                s.id === station.id ? { ...s, name: e.target.value } : s
                              )
                            );
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-600 block mb-1">Station Comments:</label>
                        <input
                          type="text"
                          value={station.comments || ''}
                          onChange={(e) => {
                            setLocalStations(
                              localStations.map((s) =>
                                s.id === station.id ? { ...s, comments: e.target.value } : s
                              )
                            );
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                        />
                      </div>
                    </div>

                    {/* Capabilities List (Thermistor 1, Scale, Humidity Sensor) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-slate-600">Station Capabilities & Sensors:</label>
                        <button
                          type="button"
                          onClick={() => {
                            const newCapName = prompt('Enter capability name (e.g. Thermistor 1, Scale, Humidity Sensor):');
                            if (!newCapName) return;
                            const newCapComment = prompt('Enter comments for this capability:') || '';
                            const newCap: StationCapability = {
                              id: `cap-${Date.now()}`,
                              name: newCapName,
                              comments: newCapComment,
                            };
                            const updatedCaps = [...(station.capabilities || []), newCap];
                            setLocalStations(
                              localStations.map((s) =>
                                s.id === station.id ? { ...s, capabilities: updatedCaps } : s
                              )
                            );
                          }}
                          className="text-[10px] text-blue-600 hover:underline font-bold"
                        >
                          + Add Capability
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {(station.capabilities || []).map((cap) => (
                          <div key={cap.id} className="bg-emerald-50 border border-emerald-200 px-2 py-1 rounded text-[11px] flex items-center gap-2">
                            <div>
                              <span className="font-bold text-emerald-900">{cap.name}</span>
                              {cap.comments && <span className="text-emerald-700 italic block text-[9px]">{cap.comments}</span>}
                            </div>
                            <button
                              onClick={() => {
                                const updatedCaps = (station.capabilities || []).filter((c) => c.id !== cap.id);
                                setLocalStations(
                                  localStations.map((s) =>
                                    s.id === station.id ? { ...s, capabilities: updatedCaps } : s
                                  )
                                );
                              }}
                              className="text-red-500 hover:text-red-700 font-bold text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: TECHNICIANS */}
          {activeTab === 'techs' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-800">Add New Technician</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Technician Name (e.g. Jane Doe)"
                    value={newTechName}
                    onChange={(e) => setNewTechName(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded font-sans text-xs bg-white"
                  />
                  <button
                    onClick={handleAddTech}
                    className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded text-xs flex items-center gap-1 hover:bg-blue-500 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Tech
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {localResources.map((tech) => (
                  <div key={tech.id} className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between border-b pb-1 font-bold text-slate-800">
                      <span>{tech.name}</span>
                      <button
                        onClick={() => setLocalResources(localResources.filter((r) => r.id !== tech.id))}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Qualified Lab Capabilities:</label>
                      <div className="flex flex-wrap gap-2">
                        {localTestTypes.map((tt) => {
                          const carriesCap = tech.capabilities.includes(tt.id);
                          return (
                            <label key={tt.id} className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={carriesCap}
                                onChange={() => {
                                  const updatedCaps = carriesCap
                                    ? tech.capabilities.filter((c) => c !== tt.id)
                                    : [...tech.capabilities, tt.id];
                                  setLocalResources(
                                    localResources.map((r) =>
                                      r.id === tech.id ? { ...r, capabilities: updatedCaps } : r
                                    )
                                  );
                                }}
                              />
                              <span className="font-medium text-slate-700">{tt.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm cursor-pointer"
          >
            Save All Configurations
          </button>
        </div>
      </div>
    </div>
  );
};

import type {
  Lab,
  Station,
  PersonnelResource,
  LabTest,
  UnitAllocation,
  TestTypeConfig,
  Landmark,
} from './types/labTracker';
import type { HistoryVersion } from './types/history';
import {
  createInitialMockData,
  generateCalendarDays,
  evaluateResourceAllocations,
  evaluateLocationMismatches,
  addDays,
  addWorkingDays,
  calculateWorkingDaysBetween,
} from './utils/labTrackerUtils';
import { ScheduleGrid } from './components/ScheduleGrid';
import { ResourceAlertBanner } from './components/ResourceAlertBanner';
import { MonitoringTable } from './components/MonitoringTable';
import { EditTestModal } from './components/EditTestModal';
import { AddTestModal } from './components/AddTestModal';
import { LabConfigModal } from './components/LabConfigModal';
import { SidePanel } from './components/SidePanel';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { TechWorkloadView } from './components/TechWorkloadView';
import { DataExportModal } from './components/DataExportModal';
import { CustomLabGridIcon } from './components/CustomLabGridIcon';
import {
  Plus,
  Settings,
  Calendar as CalendarIcon,
  Download,
  HelpCircle,
  Save,
  History,
  AlertTriangle,
  Users,
  LayoutGrid,
  RotateCcw,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function App() {
  const [activeTab, setActiveTab] = useState<'labs' | 'techs'>('labs');

  const [testTypes, setTestTypes] = useState<TestTypeConfig[]>(() => {
    const saved = localStorage.getItem('labtracker_test_types');
    return saved ? JSON.parse(saved) : createInitialMockData().testTypes;
  });

  const [labs, setLabs] = useState<Lab[]>(() => {
    const saved = localStorage.getItem('labtracker_labs');
    return saved ? JSON.parse(saved) : createInitialMockData().labs;
  });

  const [stations, setStations] = useState<Station[]>(() => {
    const saved = localStorage.getItem('labtracker_stations');
    return saved ? JSON.parse(saved) : createInitialMockData().stations;
  });

  const [resources, setResources] = useState<PersonnelResource[]>(() => {
    const saved = localStorage.getItem('labtracker_resources');
    return saved ? JSON.parse(saved) : createInitialMockData().resources;
  });

  const [tests, setTests] = useState<LabTest[]>(() => {
    const saved = localStorage.getItem('labtracker_tests');
    return saved ? JSON.parse(saved) : createInitialMockData().tests;
  });

  const [landmarks, setLandmarks] = useState<Landmark[]>(() => {
    const saved = localStorage.getItem('labtracker_landmarks');
    return saved ? JSON.parse(saved) : createInitialMockData().landmarks;
  });

  const [currentUserEmail, setCurrentUserEmail] = useState<string>('user@labcompany.com');

  // Automatically detect user Google account email & load shared cloud data when running in Google Apps Script
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google?.script?.run) {
      const gas = (window as any).google.script.run;

      gas.withSuccessHandler((email: string) => {
        if (email && email.trim()) {
          setCurrentUserEmail(email.trim());
        }
      }).getUserEmail();

      gas.withSuccessHandler((res: any) => {
        if (res && res.status === 'success' && res.data) {
          const d = res.data;
          if (d.labs) setLabs(d.labs);
          if (d.stations) setStations(d.stations);
          if (d.resources) setResources(d.resources);
          if (d.tests) setTests(d.tests);
          if (d.testTypes) setTestTypes(d.testTypes);
          if (d.landmarks) setLandmarks(d.landmarks);
          if (res.historyVersions) setHistoryVersions(res.historyVersions);
        }
      }).getLabTrackerData();
    }
  }, []);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [historyVersions, setHistoryVersions] = useState<HistoryVersion[]>(() => {
    const saved = localStorage.getItem('labtracker_history_versions');
    return saved ? JSON.parse(saved) : [];
  });

  // Undo History Stack for Ctrl+Z
  const [undoStack, setUndoStack] = useState<{
    labs: Lab[];
    stations: Station[];
    resources: PersonnelResource[];
    tests: LabTest[];
    testTypes: TestTypeConfig[];
    landmarks: Landmark[];
  }[]>([]);

  const pushUndoState = () => {
    setUndoStack((prev) => [
      ...prev.slice(-20), // limit stack depth to 20
      {
        labs,
        stations,
        resources,
        tests,
        testTypes,
        landmarks,
      },
    ]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));

    setLabs(previous.labs);
    setStations(previous.stations);
    setResources(previous.resources);
    setTests(previous.tests);
    setTestTypes(previous.testTypes);
    setLandmarks(previous.landmarks);
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        const activeElem = document.activeElement;
        if (
          activeElem &&
          (activeElem.tagName === 'INPUT' || activeElem.tagName === 'TEXTAREA' || activeElem.tagName === 'SELECT')
        ) {
          return;
        }
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, labs, stations, resources, tests, testTypes, landmarks]);

  const handleResetSession = () => {
    if (confirm('Are you sure you want to reset current session to initial mock data? Any unsaved changes will be cleared.')) {
      pushUndoState();
      const initial = createInitialMockData();
      setLabs(initial.labs);
      setStations(initial.stations);
      setResources(initial.resources);
      setTests(initial.tests);
      setTestTypes(initial.testTypes);
      setLandmarks(initial.landmarks);
      setHasUnsavedChanges(true);
    }
  };

  const [startDateStr, setStartDateStr] = useState<string>(() => {
    const saved = localStorage.getItem('labtracker_start_date');
    if (saved) return saved;
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const [daysCount, setDaysCount] = useState<number>(() => {
    const saved = localStorage.getItem('labtracker_days_count');
    return saved ? parseInt(saved, 10) || 30 : 30;
  });

  const [selectedLabIds, setSelectedLabIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('labtracker_selected_lab_ids');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* fallback */
      }
    }
    return labs.map((l) => l.id);
  });

  const [isLabFilterOpen, setIsLabFilterOpen] = useState<boolean>(false);

  const [viewMode, setViewMode] = useState<'days' | 'weeks'>(() => {
    return (localStorage.getItem('labtracker_view_mode') as 'days' | 'weeks') || 'days';
  });

  useEffect(() => {
    localStorage.setItem('labtracker_start_date', startDateStr);
  }, [startDateStr]);

  useEffect(() => {
    localStorage.setItem('labtracker_days_count', String(daysCount));
  }, [daysCount]);

  useEffect(() => {
    localStorage.setItem('labtracker_selected_lab_ids', JSON.stringify(selectedLabIds));
  }, [selectedLabIds]);

  useEffect(() => {
    localStorage.setItem('labtracker_view_mode', viewMode);
  }, [viewMode]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prefilledStationId, setPrefilledStationId] = useState<string | undefined>(undefined);
  const [prefilledStartDate, setPrefilledStartDate] = useState<string | undefined>(undefined);

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedAllocationId, setSelectedAllocationId] = useState<string | null>(null);

  const [testToEditFromPanel, setTestToEditFromPanel] = useState<LabTest | null>(null);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    localStorage.setItem('labtracker_history_versions', JSON.stringify(historyVersions));
  }, [historyVersions]);

  useEffect(() => {
    localStorage.setItem('labtracker_test_types', JSON.stringify(testTypes));
  }, [testTypes]);

  useEffect(() => {
    localStorage.setItem('labtracker_landmarks', JSON.stringify(landmarks));
  }, [landmarks]);

  const calendarDays = generateCalendarDays(startDateStr, daysCount);
  const resourceIssues = evaluateResourceAllocations(tests, resources, calendarDays, testTypes);
  const locationIssues = evaluateLocationMismatches(tests, labs, stations, resources);

  let selectedAllocation: UnitAllocation | null = null;
  let selectedTest: LabTest | null = null;

  if (selectedAllocationId) {
    for (const test of tests) {
      const found = test.unitAllocations.find((a) => a.id === selectedAllocationId);
      if (found) {
        selectedAllocation = found;
        selectedTest = test;
        break;
      }
    }
  }

  const handleSaveChanges = () => {
    localStorage.setItem('labtracker_labs', JSON.stringify(labs));
    localStorage.setItem('labtracker_stations', JSON.stringify(stations));
    localStorage.setItem('labtracker_resources', JSON.stringify(resources));
    localStorage.setItem('labtracker_tests', JSON.stringify(tests));
    localStorage.setItem('labtracker_test_types', JSON.stringify(testTypes));
    localStorage.setItem('labtracker_landmarks', JSON.stringify(landmarks));

    const newVer: HistoryVersion = {
      id: `ver-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      savedBy: currentUserEmail,
      note: 'Manual saved schedule revision',
      data: { labs, stations, resources, tests },
    };

    const payload = {
      labs,
      stations,
      resources,
      tests,
      testTypes,
      landmarks,
    };

    if (typeof window !== 'undefined' && (window as any).google?.script?.run) {
      (window as any).google.script.run
        .withSuccessHandler((res: any) => {
          if (res && res.status === 'success') {
            alert('Saved to cloud successfully! All team members will see this update.');
          } else if (res && res.status === 'lock_timeout') {
            alert('Another team member is currently saving. Please try saving again in a moment.');
          }
        })
        .saveLabTrackerData(payload, currentUserEmail, 'Manual save from UI');
    }

    setHistoryVersions([newVer, ...historyVersions]);
    setHasUnsavedChanges(false);
  };

  const handleRestoreVersion = (version: HistoryVersion) => {
    if (version.data) {
      setLabs(version.data.labs || labs);
      setStations(version.data.stations || stations);
      setResources(version.data.resources || resources);
      setTests(version.data.tests || tests);
      setHasUnsavedChanges(true);
    }
  };

  const handleAddTest = (newTest: LabTest) => {
    pushUndoState();
    setTests([...tests, newTest]);
    setHasUnsavedChanges(true);
  };

  const handleUpdateTest = (updatedTest: LabTest) => {
    pushUndoState();
    setTests(
      tests.map((t) => {
        if (t.id !== updatedTest.id) return t;

        let updatedAllocations = t.unitAllocations;

        if (updatedTest.units !== t.units) {
          const matchingLabs = labs.filter((l) =>
            l.type === updatedTest.labType || (l.supportedTestTypes && l.supportedTestTypes.includes(updatedTest.labType))
          );
          const matchingStations = stations.filter((s) => matchingLabs.some((l) => l.id === s.labId));

          if (updatedTest.units < t.units) {
            updatedAllocations = t.unitAllocations.slice(0, updatedTest.units);
          } else {
            const existingStationIds = t.unitAllocations.map((a) => a.stationId);
            const toAdd = updatedTest.units - t.units;
            const newAllocations: UnitAllocation[] = [];
            for (let i = 1; i <= toAdd; i++) {
              const uIdx = t.units + i;
              const unusedStations = matchingStations.filter((s) => !existingStationIds.includes(s.id));
              const stationId = unusedStations.length > 0
                ? unusedStations[0].id
                : (matchingStations[(uIdx - 1) % (matchingStations.length || 1)]?.id || 'st-1-1');

              existingStationIds.push(stationId);

              newAllocations.push({
                id: `alloc-${updatedTest.id}-${uIdx}`,
                testId: updatedTest.id,
                unitIndex: uIdx,
                totalUnits: updatedTest.units,
                stationId,
                startDate: updatedTest.startDate,
                endDate: addWorkingDays(updatedTest.startDate, updatedTest.durationDays),
              });
            }
            updatedAllocations = [...t.unitAllocations, ...newAllocations];
          }
        }

        updatedAllocations = updatedAllocations.map((a) => ({
          ...a,
          totalUnits: updatedTest.units,
        }));

        const changeDetail = `Updated test details by ${currentUserEmail}`;
        const newLog = {
          timestamp: new Date().toLocaleString(),
          updatedBy: currentUserEmail,
          details: changeDetail,
        };

        const editHistory = [...(t.editHistory || []), newLog];

        return {
          ...updatedTest,
          unitAllocations: updatedAllocations,
          editHistory,
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleDeleteTest = (testId: string) => {
    if (confirm('Are you sure you want to delete this test?')) {
      pushUndoState();
      setTests(tests.filter((t) => t.id !== testId));
      if (selectedTest?.id === testId) {
        setSelectedAllocationId(null);
      }
      setHasUnsavedChanges(true);
    }
  };

  const handleUpdateAllocationDates = (
    allocationId: string,
    newStationId: string,
    newStartDate: string
  ) => {
    pushUndoState();
    setTests(
      tests.map((t) => {
        const targetAlloc = t.unitAllocations.find((a) => a.id === allocationId);
        if (!targetAlloc) return t;

        // Preserve individual unit's duration (working days)
        const unitDuration = calculateWorkingDaysBetween(targetAlloc.startDate, targetAlloc.endDate);
        const newEndDate = addWorkingDays(newStartDate, unitDuration);

        const updatedAllocations = t.unitAllocations.map((a) => {
          if (a.id !== allocationId) return a;
          return {
            ...a,
            stationId: newStationId,
            startDate: newStartDate,
            endDate: newEndDate,
          };
        });

        const newLog = {
          timestamp: new Date().toLocaleString(),
          updatedBy: currentUserEmail,
          details: `Rescheduled unit dates to ${newStartDate}`,
        };

        return {
          ...t,
          unitAllocations: updatedAllocations,
          editHistory: [...(t.editHistory || []), newLog],
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleResizeAllocation = (
    allocationId: string,
    edge: 'start' | 'end',
    newDateStr: string
  ) => {
    pushUndoState();
    setTests(
      tests.map((t) => {
        const targetAlloc = t.unitAllocations.find((a) => a.id === allocationId);
        if (!targetAlloc) return t;

        let newStartDate = targetAlloc.startDate;
        let newEndDate = targetAlloc.endDate;

        if (edge === 'start') {
          if (newDateStr <= targetAlloc.endDate) {
            newStartDate = newDateStr;
          }
        } else {
          if (newDateStr >= targetAlloc.startDate) {
            newEndDate = newDateStr;
          }
        }

        const newUnitDuration = calculateWorkingDaysBetween(newStartDate, newEndDate);

        // Update ONLY the specific unit allocation being resized, leaving other units untouched
        const updatedAllocations = t.unitAllocations.map((a) => {
          if (a.id !== allocationId) return a;
          return {
            ...a,
            startDate: newStartDate,
            endDate: newEndDate,
          };
        });

        const newLog = {
          timestamp: new Date().toLocaleString(),
          updatedBy: currentUserEmail,
          details: `Resized Unit ${targetAlloc.unitIndex} duration to ${newUnitDuration} working days (${newStartDate} - ${newEndDate})`,
        };

        return {
          ...t,
          unitAllocations: updatedAllocations,
          editHistory: [...(t.editHistory || []), newLog],
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleUpdateSingleAllocation = (updatedAllocation: UnitAllocation) => {
    setTests(
      tests.map((t) => {
        if (t.id !== updatedAllocation.testId) return t;
        const updatedAllocations = t.unitAllocations.map((a) =>
          a.id === updatedAllocation.id ? updatedAllocation : a
        );
        return { ...t, unitAllocations: updatedAllocations };
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleDoubleClickCell = (stationId: string, dateStr: string) => {
    setPrefilledStationId(stationId);
    setPrefilledStartDate(dateStr);
    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Sleek Compact Main Navbar Header */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-[98%] w-full mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3 shrink-0">
            <div className="p-1 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center">
              <CustomLabGridIcon size={32} />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight leading-none">
                Lab Tracker & Resource Manager
              </h1>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Multi-station timeline, station notes/capabilities, technician capacity & test edit history
              </p>
            </div>
          </div>

          {/* Integrated View Navigation Tabs */}
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 space-x-1 shrink-0">
            <button
              onClick={() => setActiveTab('labs')}
              className={`px-2.5 py-1 font-bold text-xs rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'labs'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Labs View
            </button>

            <button
              onClick={() => setActiveTab('techs')}
              className={`px-2.5 py-1 font-bold text-xs rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'techs'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Techs Workload
            </button>
          </div>

          {/* Action Buttons & User Email Field */}
          <div className="flex items-center space-x-2 shrink-0 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
              <Users className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span className="text-slate-400 text-[11px] shrink-0">User:</span>
              <input
                type="text"
                value={currentUserEmail}
                onChange={(e) => setCurrentUserEmail(e.target.value)}
                className="bg-transparent text-white font-mono text-xs focus:outline-none w-44"
                title="Current active user for edit audit logging & owner notices"
              />
            </div>

            <button
              onClick={handleSaveChanges}
              className={`px-3 py-1.5 font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Save className="h-4 w-4" /> Save Changes
            </button>

            <button
              onClick={handleResetSession}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-300 font-semibold text-xs rounded-lg border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset session to default baseline data"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Session
            </button>

            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <History className="h-4 w-4 text-blue-400" /> Version History
            </button>

            <button
              onClick={() => {
                setPrefilledStationId(undefined);
                setPrefilledStartDate(undefined);
                setIsAddModalOpen(true);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Test
            </button>

            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings className="h-4 w-4 text-slate-400" /> Config Labs & Techs
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export Database Tables (Tests, Labs, Techs, Stations)"
            >
              <Download className="h-4 w-4 text-emerald-400" /> Export Tables
            </button>
          </div>
        </div>

        {/* Top Warning Banner for Unsaved Changes */}
        {hasUnsavedChanges && (
          <div className="bg-amber-400 text-amber-950 text-xs font-semibold px-4 py-1 flex items-center justify-between border-t border-amber-500">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-950 shrink-0" />
              You have unsaved changes! Click "Save Changes" to save revisions for the team.
            </span>
            <button
              onClick={handleSaveChanges}
              className="bg-amber-950 text-white px-2.5 py-0.5 rounded text-[11px] hover:bg-amber-900 font-bold cursor-pointer"
            >
              Save Now
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area filling ~98% PC Screen Width */}
      <main className="flex-1 max-w-[98%] w-full mx-auto p-3 space-y-3">
        {/* Sleek Vertically Compact Resource Allocation Banner */}
        <ResourceAlertBanner issues={resourceIssues} locationIssues={locationIssues} />

        {activeTab === 'labs' ? (
          <>
            {/* Timeline Control Bar */}
            <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-xs flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-slate-500" />
                  <label className="font-semibold text-slate-700">Timeline Start Date:</label>
                  <input
                    type="date"
                    value={startDateStr}
                    onChange={(e) => setStartDateStr(e.target.value)}
                    className="px-2.5 py-1 border border-slate-300 rounded text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setStartDateStr(addDays(startDateStr, -14))}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold rounded text-[11px] cursor-pointer flex items-center gap-1 transition-colors"
                    title="Shift start date 14 days earlier to view historical test schedule"
                  >
                    ‹ See Previous Days
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="font-semibold text-slate-700">Range to View:</label>
                  <select
                    value={daysCount}
                    onChange={(e) => setDaysCount(Math.min(365, parseInt(e.target.value) || 30))}
                    className="px-2.5 py-1 border border-slate-300 rounded text-xs bg-white font-mono"
                  >
                    <option value={14}>14 Days (2 Weeks)</option>
                    <option value={30}>30 Days (1 Month)</option>
                    <option value={60}>60 Days (2 Months)</option>
                    <option value={90}>90 Days (Quarter)</option>
                    <option value={180}>180 Days (6 Months)</option>
                    <option value={365}>365 Days (1 Year Max)</option>
                  </select>
                </div>

                <div className="relative flex items-center gap-2">
                  <label className="font-semibold text-slate-700">Filter Labs:</label>
                  <button
                    type="button"
                    onClick={() => setIsLabFilterOpen(!isLabFilterOpen)}
                    className="px-2.5 py-1 border border-slate-300 rounded text-xs bg-white font-semibold text-slate-800 flex items-center gap-1.5 cursor-pointer shadow-2xs hover:bg-slate-50"
                  >
                    <span>
                      {selectedLabIds.length === labs.length
                        ? `All Labs (${labs.length})`
                        : `${selectedLabIds.length} of ${labs.length} Labs`}
                    </span>
                    <span className="text-[10px] text-slate-400">▼</span>
                  </button>

                  {/* Multi-select Popover Dropdown */}
                  {isLabFilterOpen && (
                    <div className="absolute top-full left-16 mt-1 w-64 bg-white border border-slate-300 rounded-lg shadow-xl z-50 p-2 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between border-b pb-1">
                        <span className="font-bold text-slate-800">Select Labs</span>
                        <div className="flex gap-2 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setSelectedLabIds(labs.map((l) => l.id))}
                            className="text-blue-600 hover:underline font-bold cursor-pointer"
                          >
                            All
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedLabIds([])}
                            className="text-red-500 hover:underline font-bold cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {labs.map((lab) => {
                          const isChecked = selectedLabIds.includes(lab.id);
                          return (
                            <label
                              key={lab.id}
                              className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer text-slate-700"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedLabIds(selectedLabIds.filter((id) => id !== lab.id));
                                  } else {
                                    setSelectedLabIds([...selectedLabIds, lab.id]);
                                  }
                                }}
                                className="rounded text-blue-600 cursor-pointer"
                              />
                              <span className="truncate font-medium">{lab.name}</span>
                            </label>
                          );
                        })}
                      </div>

                      <div className="border-t pt-1 text-right">
                        <button
                          type="button"
                          onClick={() => setIsLabFilterOpen(false)}
                          className="px-2 py-0.5 bg-blue-600 text-white font-bold rounded text-[10px] hover:bg-blue-500 cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
                  <button
                    onClick={() => setViewMode('days')}
                    className={`px-2.5 py-1 rounded font-bold text-[11px] transition-colors cursor-pointer ${
                      viewMode === 'days' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Days View
                  </button>
                  <button
                    onClick={() => setViewMode('weeks')}
                    className={`px-2.5 py-1 rounded font-bold text-[11px] transition-colors cursor-pointer ${
                      viewMode === 'weeks' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Weeks View
                  </button>
                </div>
              </div>

              <div className="text-slate-500 italic flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5" />
                Double-click date cell to add test. Drag ends of test block to extend/shrink duration!
              </div>
            </div>

            {/* Schedule Grid Table */}
            <ScheduleGrid
              labs={labs}
              stations={stations}
              tests={tests}
              landmarks={landmarks}
              calendarDays={calendarDays}
              viewMode={viewMode}
              selectedLabIds={selectedLabIds}
              selectedAllocationId={selectedAllocationId}
              onSelectAllocation={(alloc) => setSelectedAllocationId(alloc.id)}
              onUpdateAllocationDates={handleUpdateAllocationDates}
              onResizeAllocation={handleResizeAllocation}
              onDoubleClickCell={handleDoubleClickCell}
              onUpdateLandmark={(updatedLm) => {
                setLandmarks(landmarks.map((lm) => (lm.id === updatedLm.id ? updatedLm : lm)));
                setHasUnsavedChanges(true);
              }}
              onUpdateStationComments={(stationId, comments) => {
                pushUndoState();
                setStations(stations.map((s) => (s.id === stationId ? { ...s, comments } : s)));
                setHasUnsavedChanges(true);
              }}
              onUpdateLabComments={(labId, comments) => {
                pushUndoState();
                setLabs(labs.map((l) => (l.id === labId ? { ...l, comments } : l)));
                setHasUnsavedChanges(true);
              }}
            />

            {/* Monitoring Table with Chronogram covering ~90% screen width */}
            <MonitoringTable
              tests={tests}
              testTypes={testTypes}
              resources={resources}
              calendarDays={calendarDays}
              onUpdateTest={handleUpdateTest}
              onDeleteTest={handleDeleteTest}
            />
          </>
        ) : (
          <TechWorkloadView
            resources={resources}
            tests={tests}
            calendarDays={calendarDays}
            testTypes={testTypes}
            startDateStr={startDateStr}
            daysCount={daysCount}
            onStartDateChange={setStartDateStr}
            onDaysCountChange={setDaysCount}
          />
        )}
      </main>

      {/* Hideable Right Side Panel */}
      <SidePanel
        isOpen={selectedAllocationId !== null}
        onClose={() => setSelectedAllocationId(null)}
        allocation={selectedAllocation}
        test={selectedTest}
        labs={labs}
        stations={stations}
        onUpdateAllocation={handleUpdateSingleAllocation}
        onEditTest={(t) => setTestToEditFromPanel(t)}
      />

      {/* Edit Test Miniwindow triggered from Side Panel */}
      <EditTestModal
        isOpen={testToEditFromPanel !== null}
        onClose={() => setTestToEditFromPanel(null)}
        test={testToEditFromPanel}
        resources={resources}
        testTypes={testTypes}
        onSaveTest={handleUpdateTest}
      />

      {/* Modals */}
      <AddTestModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setPrefilledStationId(undefined);
          setPrefilledStartDate(undefined);
        }}
        labs={labs}
        stations={stations}
        resources={resources}
        testTypes={testTypes}
        defaultStartDate={prefilledStartDate || startDateStr}
        prefilledStationId={prefilledStationId}
        currentUserEmail={currentUserEmail}
        onAddTest={handleAddTest}
      />

      <LabConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        labs={labs}
        stations={stations}
        resources={resources}
        testTypes={testTypes}
        landmarks={landmarks}
        onUpdateLabsAndStations={(l: Lab[], s: Station[]) => {
          setLabs(l);
          setStations(s);
          setHasUnsavedChanges(true);
        }}
        onUpdateResources={(r) => {
          setResources(r);
          setHasUnsavedChanges(true);
        }}
        onUpdateTestTypes={(tt) => {
          setTestTypes(tt);
          setHasUnsavedChanges(true);
        }}
        onUpdateLandmarks={(lm) => {
          setLandmarks(lm);
          setHasUnsavedChanges(true);
        }}
      />

      <VersionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        versions={historyVersions}
        onRestoreVersion={handleRestoreVersion}
      />

      <DataExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        labs={labs}
        stations={stations}
        resources={resources}
        tests={tests}
        testTypes={testTypes}
        landmarks={landmarks}
      />
    </div>
  );
}

export default App;

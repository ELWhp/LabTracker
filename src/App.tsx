import type {
  Lab,
  Station,
  PersonnelResource,
  LabTest,
  UnitAllocation,
} from './types/labTracker';
import {
  createInitialMockData,
  generateCalendarDays,
  evaluateResourceAllocations,
  addWorkingDays,
} from './utils/labTrackerUtils';
import { ScheduleGrid } from './components/ScheduleGrid';
import { ResourceAlertBanner } from './components/ResourceAlertBanner';
import { MonitoringTable } from './components/MonitoringTable';
import { AddTestModal } from './components/AddTestModal';
import { LabConfigModal } from './components/LabConfigModal';
import { SidePanel } from './components/SidePanel';
import {
  Plus,
  Settings,
  Calendar as CalendarIcon,
  Download,
  RotateCcw,
  FlaskConical,
  HelpCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function App() {
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

  const [startDateStr, setStartDateStr] = useState<string>(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const [daysCount, setDaysCount] = useState<number>(30);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedAllocationId, setSelectedAllocationId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('labtracker_labs', JSON.stringify(labs));
  }, [labs]);

  useEffect(() => {
    localStorage.setItem('labtracker_stations', JSON.stringify(stations));
  }, [stations]);

  useEffect(() => {
    localStorage.setItem('labtracker_resources', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('labtracker_tests', JSON.stringify(tests));
  }, [tests]);

  const calendarDays = generateCalendarDays(startDateStr, daysCount);
  const resourceIssues = evaluateResourceAllocations(tests, resources, calendarDays);

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

  const handleAddTest = (newTest: LabTest) => {
    setTests([...tests, newTest]);
  };

  const handleUpdateTest = (updatedTest: LabTest) => {
    setTests(
      tests.map((t) => {
        if (t.id !== updatedTest.id) return t;

        let updatedAllocations = t.unitAllocations;

        if (updatedTest.units !== t.units) {
          const matchingLabs = labs.filter((l) => l.type === updatedTest.labType);
          const matchingStations = stations.filter((s) => matchingLabs.some((l) => l.id === s.labId));

          if (updatedTest.units < t.units) {
            updatedAllocations = t.unitAllocations.slice(0, updatedTest.units);
          } else {
            const toAdd = updatedTest.units - t.units;
            const newAllocations: UnitAllocation[] = [];
            for (let i = 1; i <= toAdd; i++) {
              const uIdx = t.units + i;
              const station = matchingStations[(uIdx - 1) % (matchingStations.length || 1)];
              newAllocations.push({
                id: `alloc-${updatedTest.id}-${uIdx}`,
                testId: updatedTest.id,
                unitIndex: uIdx,
                totalUnits: updatedTest.units,
                stationId: station ? station.id : 'st-1-1',
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

        return {
          ...updatedTest,
          unitAllocations: updatedAllocations,
        };
      })
    );
  };

  const handleDeleteTest = (testId: string) => {
    if (confirm('Are you sure you want to delete this test?')) {
      setTests(tests.filter((t) => t.id !== testId));
      if (selectedTest?.id === testId) {
        setSelectedAllocationId(null);
      }
    }
  };

  const handleUpdateAllocationDates = (
    allocationId: string,
    newStationId: string,
    newStartDate: string
  ) => {
    setTests(
      tests.map((t) => {
        const hasAlloc = t.unitAllocations.some((a) => a.id === allocationId);
        if (!hasAlloc) return t;

        const newEndDate = addWorkingDays(newStartDate, t.durationDays);

        const updatedAllocations = t.unitAllocations.map((a) => {
          if (a.id !== allocationId) return a;
          return {
            ...a,
            stationId: newStationId,
            startDate: newStartDate,
            endDate: newEndDate,
          };
        });

        return { ...t, unitAllocations: updatedAllocations };
      })
    );
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
  };

  const handleResetData = () => {
    if (confirm('Reset all labs, stations, resources, and tests to initial mock defaults?')) {
      const initial = createInitialMockData();
      setLabs(initial.labs);
      setStations(initial.stations);
      setResources(initial.resources);
      setTests(initial.tests);
      setSelectedAllocationId(null);
    }
  };

  const handleExportDriveScript = () => {
    const codeGs = `function doGet(e) {\n  return HtmlService.createTemplateFromFile('Index').evaluate().setTitle('Lab Tracker');\n}`;
    const blob = new Blob([codeGs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Code.gs';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FlaskConical className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Lab Tracker & Resource Manager</h1>
              <p className="text-xs text-slate-400">
                Multi-station scheduling with daily timeline & resource capacity constraint tracking
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Test
            </button>

            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings className="h-4 w-4 text-slate-400" /> Config Labs & Techs
            </button>

            <button
              onClick={handleExportDriveScript}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              title="Export Apps Script (Code.gs)"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" /> Drive Script Export
            </button>

            <button
              onClick={handleResetData}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Reset Mock Data"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-4">
        <ResourceAlertBanner issues={resourceIssues} />

        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex items-center justify-between text-xs">
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
            </div>

            <div className="flex items-center gap-2">
              <label className="font-semibold text-slate-700">Days to View:</label>
              <select
                value={daysCount}
                onChange={(e) => setDaysCount(parseInt(e.target.value) || 30)}
                className="px-2.5 py-1 border border-slate-300 rounded text-xs bg-white font-mono"
              >
                <option value={14}>14 Days (2 Weeks)</option>
                <option value={30}>30 Days (1 Month)</option>
                <option value={60}>60 Days (2 Months)</option>
                <option value={90}>90 Days (Quarter)</option>
              </select>
            </div>
          </div>

          <div className="text-slate-500 italic flex items-center gap-1">
            <HelpCircle className="h-3.5 w-3.5" />
            Drag unit blocks along station rows to reschedule dates. Collision detection prevents overlap.
          </div>
        </div>

        <ScheduleGrid
          labs={labs}
          stations={stations}
          tests={tests}
          calendarDays={calendarDays}
          selectedAllocationId={selectedAllocationId}
          onSelectAllocation={(alloc) => setSelectedAllocationId(alloc.id)}
          onUpdateAllocationDates={handleUpdateAllocationDates}
        />

        <MonitoringTable
          tests={tests}
          onUpdateTest={handleUpdateTest}
          onDeleteTest={handleDeleteTest}
        />
      </main>

      <SidePanel
        isOpen={selectedAllocationId !== null}
        onClose={() => setSelectedAllocationId(null)}
        allocation={selectedAllocation}
        test={selectedTest}
        labs={labs}
        stations={stations}
        onUpdateAllocation={handleUpdateSingleAllocation}
      />

      <AddTestModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        labs={labs}
        stations={stations}
        defaultStartDate={startDateStr}
        onAddTest={handleAddTest}
      />

      <LabConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        labs={labs}
        stations={stations}
        resources={resources}
        onUpdateLabsAndStations={(l: Lab[], s: Station[]) => {
          setLabs(l);
          setStations(s);
        }}
        onUpdateResources={setResources}
      />
    </div>
  );
}

export default App;

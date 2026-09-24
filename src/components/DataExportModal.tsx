import React, { useState } from 'react';
import type { Lab, Station, PersonnelResource, LabTest, TestTypeConfig, Landmark } from '../types/labTracker';
import { Download, CheckSquare, Square, X } from 'lucide-react';

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  labs: Lab[];
  stations: Station[];
  resources: PersonnelResource[];
  tests: LabTest[];
  testTypes: TestTypeConfig[];
  landmarks?: Landmark[];
}

export const DataExportModal: React.FC<DataExportModalProps> = ({
  isOpen,
  onClose,
  labs,
  stations,
  resources,
  tests,
  testTypes,
  landmarks = [],
}) => {
  const [selectedTables, setSelectedTables] = useState<{
    tests: boolean;
    labs: boolean;
    stations: boolean;
    techs: boolean;
    testTypes: boolean;
    landmarks: boolean;
  }>({
    tests: true,
    labs: true,
    stations: true,
    techs: true,
    testTypes: true,
    landmarks: true,
  });

  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  if (!isOpen) return null;

  const toggleTable = (key: keyof typeof selectedTables) => {
    setSelectedTables((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const convertToCSV = (arr: Record<string, any>[]): string => {
    if (arr.length === 0) return '';
    const keys = Object.keys(arr[0]);
    const header = keys.join(',');
    const rows = arr.map((row) =>
      keys
        .map((k) => {
          let val = row[k];
          if (typeof val === 'object' && val !== null) {
            val = JSON.stringify(val);
          }
          const str = String(val ?? '').replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    );
    return [header, ...rows].join('\n');
  };

  const downloadFile = (filename: string, content: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    const dataMap: Record<string, any[]> = {};

    if (selectedTables.tests) {
      dataMap['tests'] = tests.map((t) => ({
        id: t.id,
        name: t.name,
        vrNumber: t.vrNumber || '',
        testOwner: t.testOwner || '',
        linkToVR: t.linkToVR || '',
        labType: t.labType,
        units: t.units,
        durationDays: t.durationDays,
        startDate: t.startDate,
        resourcesNeededTotal: t.resourcesNeededTotal,
        color: t.color,
      }));
    }

    if (selectedTables.labs) {
      dataMap['labs'] = labs.map((l) => ({
        id: l.id,
        name: l.name,
        type: l.type,
        stationCount: l.stationCount,
        comments: l.comments || '',
        supportedTestTypes: (l.supportedTestTypes || []).join('; '),
      }));
    }

    if (selectedTables.stations) {
      dataMap['stations'] = stations.map((s) => ({
        id: s.id,
        labId: s.labId,
        stationNumber: s.stationNumber,
        name: s.name,
        comments: s.comments || '',
        capabilities: (s.capabilities || []).map((c) => c.name).join('; '),
      }));
    }

    if (selectedTables.techs) {
      dataMap['techs'] = resources.map((r) => ({
        id: r.id,
        name: r.name,
        capabilities: r.capabilities.join('; '),
        holidays: r.holidays.join('; '),
      }));
    }

    if (selectedTables.testTypes) {
      dataMap['testTypes'] = testTypes.map((tt) => ({
        id: tt.id,
        name: tt.name,
        label: tt.label,
        color: tt.color,
      }));
    }

    if (selectedTables.landmarks) {
      dataMap['landmarks'] = landmarks.map((lm) => ({
        id: lm.id,
        name: lm.name,
        date: lm.date,
      }));
    }

    if (exportFormat === 'json') {
      const jsonStr = JSON.stringify(dataMap, null, 2);
      downloadFile('lab_tracker_database_export.json', jsonStr, 'application/json');
    } else {
      Object.entries(dataMap).forEach(([tableName, rows]) => {
        const csvStr = convertToCSV(rows);
        downloadFile(`${tableName}_export.csv`, csvStr, 'text/csv');
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-200">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">Export Database Tables</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Select which tables from the Lab Tracker database you would like to download:
        </p>

        {/* Checkbox Options */}
        <div className="space-y-2.5 bg-slate-50 p-4 rounded-lg border border-slate-200">
          {[
            { key: 'tests', label: `Tests List (${tests.length} records)` },
            { key: 'labs', label: `Labs Table (${labs.length} records)` },
            { key: 'stations', label: `Stations Table (${stations.length} records)` },
            { key: 'techs', label: `Technicians List (${resources.length} records)` },
            { key: 'testTypes', label: `Test Types Config (${testTypes.length} records)` },
            { key: 'landmarks', label: `Landmarks Table (${landmarks.length} records)` },
          ].map(({ key, label }) => {
            const isChecked = selectedTables[key as keyof typeof selectedTables];
            return (
              <div
                key={key}
                onClick={() => toggleTable(key as keyof typeof selectedTables)}
                className="flex items-center gap-2.5 text-xs text-slate-800 font-medium cursor-pointer select-none hover:text-blue-600"
              >
                {isChecked ? (
                  <CheckSquare className="h-4 w-4 text-blue-600 shrink-0" />
                ) : (
                  <Square className="h-4 w-4 text-slate-400 shrink-0" />
                )}
                <span>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Export Format Selector */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">File Format:</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="exportFormat"
                value="csv"
                checked={exportFormat === 'csv'}
                onChange={() => setExportFormat('csv')}
                className="text-blue-600"
              />
              <span>CSV Files (Excel / Spreadsheet)</span>
            </label>

            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="exportFormat"
                value="json"
                checked={exportFormat === 'json'}
                onChange={() => setExportFormat('json')}
                className="text-blue-600"
              />
              <span>Single JSON File</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export Selected Tables
          </button>
        </div>
      </div>
    </div>
  );
};

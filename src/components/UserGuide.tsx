import React from 'react';
import { BookOpen, ExternalLink, X } from 'lucide-react';

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuide: React.FC<UserGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOpenNewWindow = () => {
    const guideHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lab Tracker - User Guide</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          html { scroll-behavior: smooth; }
        </style>
      </head>
      <body class="bg-slate-100 p-8 font-sans text-slate-800">
        <div class="max-w-4xl mx-auto bg-white rounded-xl p-8 shadow-md border border-slate-200 space-y-6">
          <h1 class="text-2xl font-bold text-slate-900 border-b pb-3">📖 Lab Tracker - End User Guide</h1>
          <p class="text-sm text-slate-600">This guide explains how to use the Lab Tracker app in simple, non-technical terms.</p>

          <nav class="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h2 class="font-bold text-sm text-slate-800 mb-2">🔖 Quick Navigation Bookmarks</h2>
            <ul class="grid grid-cols-2 gap-2 text-xs text-blue-600 font-semibold">
              <li><a href="#overview" class="hover:underline">1. App Overview & Navigation</a></li>
              <li><a href="#adding-tests" class="hover:underline">2. Adding & Rescheduling Tests</a></li>
              <li><a href="#resizing-tests" class="hover:underline">3. Shrinking & Extending Test Duration</a></li>
              <li><a href="#resource-alerts" class="hover:underline">4. Technician Resource Alerts</a></li>
              <li><a href="#labs-stations" class="hover:underline">5. Lab Comments & Station Capabilities</a></li>
              <li><a href="#saving-revisions" class="hover:underline">6. Saving & Reverting Version History</a></li>
              <li><a href="#export-data" class="hover:underline">7. Exporting Database Tables</a></li>
            </ul>
          </nav>

          <section id="overview" class="space-y-2 border-t pt-4">
            <h2 class="text-lg font-bold text-slate-800">1. App Overview & Navigation</h2>
            <p class="text-xs text-slate-600">The app has two main top views:</p>
            <ul class="list-disc list-inside text-xs text-slate-700 space-y-1">
              <li><strong>Labs View:</strong> The main schedule grid showing labs, stations, timeline dates (Year, Month, Week, Day), and tests.</li>
              <li><strong>Techs Workload View:</strong> Displays technician capacity, qualified capabilities, off-days, and active workload heatmaps.</li>
            </ul>
          </section>

          <section id="adding-tests" class="space-y-2 border-t pt-4">
            <h2 class="text-lg font-bold text-slate-800">2. Adding & Rescheduling Tests</h2>
            <p class="text-xs text-slate-600">You can schedule a test in two easy ways:</p>
            <ul class="list-disc list-inside text-xs text-slate-700 space-y-1">
              <li>Click the blue <strong>"+ Add Test"</strong> button at the top.</li>
              <li>Or simply <strong>double-click any date cell</strong> on a station row in the schedule grid!</li>
              <li><strong>Drag & Drop:</strong> Click and hold any test block on the schedule to drag it to another date or station. Collision detection prevents overlapping tests!</li>
            </ul>
          </section>

          <section id="resizing-tests" class="space-y-2 border-t pt-4">
            <h2 class="text-lg font-bold text-slate-800">3. Shrinking & Extending Test Duration</h2>
            <p class="text-xs text-slate-600">Hover your mouse over any test block on the schedule grid. You will see small left (<) and right (>) grab handles. Drag these handles to extend or shrink the test duration in working days!</p>
          </section>

          <section id="resource-alerts" class="space-y-2 border-t pt-4">
            <h2 class="text-lg font-bold text-slate-800">4. Technician Resource Alerts</h2>
            <p class="text-xs text-slate-600">When tests are scheduled, the app automatically checks if there are enough qualified technicians available (excluding technicians on holiday). If demand exceeds capacity between Date X and Date Y, a warning banner appears at the upper-middle of the screen.</p>
          </section>

          <section id="labs-stations" class="space-y-2 border-t pt-4">
            <h2 class="text-lg font-bold text-slate-800">5. Lab Comments & Station Capabilities</h2>
            <p class="text-xs text-slate-600">Clicking on any Lab cell or Station cell opens a popup window displaying descriptions, comments, and equipment capabilities (like <i>Thermistor 1</i>, <i>Scale</i>, <i>Humidity Sensor</i>). Clicking anywhere outside closes the popup.</p>
          </section>

          <section id="saving-revisions" class="space-y-2 border-t pt-4">
            <h2 class="text-lg font-bold text-slate-800">6. Saving & Reverting Version History</h2>
            <p class="text-xs text-slate-600">Whenever you make changes, click <strong>"Save Changes"</strong> in the top bar. Click <strong>"Version History"</strong> to see past saved revisions numbered #1, #2, #3, who saved them, and use <strong>"View"</strong> to inspect past snapshots before restoring!</p>
          </section>

          <section id="export-data" class="space-y-2 border-t pt-4">
            <h2 class="text-lg font-bold text-slate-800">7. Exporting Database Tables</h2>
            <p class="text-xs text-slate-600">Click <strong>"Export Tables"</strong> in the top navigation bar to download CSV or JSON files of Tests, Labs, Stations, Technicians, or Test Types.</p>
          </section>
        </div>
      </body>
      </html>
    `;
    const newWin = window.open('', '_blank');
    if (newWin) {
      newWin.document.write(guideHtml);
      newWin.document.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200 max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">User Guide & Feature Manual</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenNewWindow}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Open guide in a separate window/tab"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open in New Tab
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Bookmarks */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
          <span className="font-bold text-slate-700 block mb-1">🔖 Bookmark Links:</span>
          <div className="flex flex-wrap gap-2 text-blue-600 font-semibold text-[11px]">
            <a href="#guide-overview" className="hover:underline bg-white px-2 py-0.5 rounded border border-slate-200">1. App Overview</a>
            <a href="#guide-tests" className="hover:underline bg-white px-2 py-0.5 rounded border border-slate-200">2. Adding Tests</a>
            <a href="#guide-resizing" className="hover:underline bg-white px-2 py-0.5 rounded border border-slate-200">3. Duration Resizing</a>
            <a href="#guide-comments" className="hover:underline bg-white px-2 py-0.5 rounded border border-slate-200">4. Lab Comments</a>
            <a href="#guide-history" className="hover:underline bg-white px-2 py-0.5 rounded border border-slate-200">5. Version History</a>
            <a href="#guide-export" className="hover:underline bg-white px-2 py-0.5 rounded border border-slate-200">6. Exporting Data</a>
          </div>
        </div>

        {/* Guide Body */}
        <div className="flex-1 overflow-y-auto space-y-4 text-xs text-slate-700 pr-1">
          <section id="guide-overview" className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm">1. App Overview & Navigation</h3>
            <p>
              Use the top navigation bar to switch between <strong>Labs View</strong> (main schedule grid) and <strong>Techs Workload View</strong> (technician workload heatmap & capabilities).
            </p>
          </section>

          <section id="guide-tests" className="space-y-1 border-t pt-3">
            <h3 className="font-bold text-slate-900 text-sm">2. Adding & Rescheduling Tests</h3>
            <p>
              Click <strong>"+ Add Test"</strong> or <strong>double-click any date cell</strong> on the station row to open the test scheduler. Drag and drop test blocks to move them across dates and stations!
            </p>
          </section>

          <section id="guide-resizing" className="space-y-1 border-t pt-3">
            <h3 className="font-bold text-slate-900 text-sm">3. Shrinking & Extending Test Duration</h3>
            <p>
              Hover over any test block on the timeline grid to reveal left and right drag handles. Drag these handles left or right to extend or shrink test duration in working days!
            </p>
          </section>

          <section id="guide-comments" className="space-y-1 border-t pt-3">
            <h3 className="font-bold text-slate-900 text-sm">4. Lab Comments & Station Capabilities</h3>
            <p>
              Clicking any Lab cell or Station cell opens a comment popup displaying descriptions and equipment capabilities (e.g., <i>Thermistor 1</i>, <i>Scale</i>). Click anywhere outside to close.
            </p>
          </section>

          <section id="guide-history" className="space-y-1 border-t pt-3">
            <h3 className="font-bold text-slate-900 text-sm">5. Version History & Revisions</h3>
            <p>
              Click <strong>"Save Changes"</strong> to record a timestamped version snapshot with your user ID. Click <strong>"Version History"</strong> to view past snapshots (#1, #2, #3...) and preview them before restoring.
            </p>
          </section>

          <section id="guide-export" className="space-y-1 border-t pt-3">
            <h3 className="font-bold text-slate-900 text-sm">6. Exporting Data</h3>
            <p>
              Click <strong>"Export Tables"</strong> to download CSV or JSON spreadsheets of your Tests, Labs, Stations, Technicians, or Test Types.
            </p>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end pt-2 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

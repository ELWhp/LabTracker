import React from 'react';
import type { HistoryVersion } from '../types/history';
import { History, RotateCcw, X, Clock, User, CheckCircle2 } from 'lucide-react';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: HistoryVersion[];
  onRestoreVersion: (version: HistoryVersion) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  versions,
  onRestoreVersion,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200 flex flex-col max-h-[80vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            Revision Version History
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content / Version Timeline */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {versions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 italic">
              No saved history revisions recorded yet. Click "Save Changes" to save a restore point!
            </div>
          ) : (
            versions.map((ver, idx) => (
              <div
                key={ver.id}
                className={`p-3.5 border rounded-lg transition-all ${
                  idx === 0
                    ? 'bg-blue-50/60 border-blue-300 shadow-2xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    {idx === 0 && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Current Active
                      </span>
                    )}
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      {ver.timestamp}
                    </span>
                  </div>

                  {idx !== 0 && (
                    <button
                      onClick={() => {
                        if (confirm(`Revert schedule state to snapshot from ${ver.timestamp}?`)) {
                          onRestoreVersion(ver);
                          onClose();
                        }
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" /> Restore Version
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-600 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-slate-500">
                    <User className="h-3.5 w-3.5" /> Saved by: <strong className="text-slate-700">{ver.savedBy}</strong>
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="italic">{ver.note || 'Manual save snapshot'}</span>
                </div>

                <div className="mt-2 text-[11px] text-slate-500 font-mono bg-slate-100/80 p-1.5 rounded flex gap-4">
                  <span>Labs: {ver.data.labs?.length || 0}</span>
                  <span>Stations: {ver.data.stations?.length || 0}</span>
                  <span>Techs: {ver.data.resources?.length || 0}</span>
                  <span>Tests: {ver.data.tests?.length || 0}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Total Saved Revisions: {versions.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 bg-white rounded-lg text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

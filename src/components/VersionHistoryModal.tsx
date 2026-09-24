import React, { useState } from 'react';
import type { HistoryVersion } from '../types/history';
import { History, RotateCcw, X, Eye, User, Calendar, FileText } from 'lucide-react';

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
  const [previewVersion, setPreviewVersion] = useState<{ version: HistoryVersion; indexNum: number } | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      {/* Preview Modal for "View this version" */}
      {previewVersion && (
        <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4" onClick={() => setPreviewVersion(null)}>
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Preview Version #{previewVersion.indexNum} Snapshot
                </h3>
              </div>
              <button onClick={() => setPreviewVersion(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xs">
                ✕ Close
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-blue-500" /> Saved By: {previewVersion.version.savedBy || 'Unknown User'}
                </span>
                <span className="font-mono text-slate-500 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {previewVersion.version.timestamp}
                </span>
              </div>
              {previewVersion.version.note && <p className="text-slate-700 italic">"{previewVersion.version.note}"</p>}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 flex items-center gap-1">
                <FileText className="h-4 w-4 text-emerald-600" /> Scheduled Tests in this Version ({previewVersion.version.data?.tests?.length || 0}):
              </h4>
              <div className="space-y-1.5">
                {(previewVersion.version.data?.tests || []).map((t) => (
                  <div key={t.id} className="bg-white border border-slate-200 p-2.5 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{t.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        VR: {t.vrNumber || 'N/A'} | Owner: {t.testOwner || 'N/A'} | Start: {t.startDate}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: t.color }}>
                      {t.units} Units / {t.durationDays} Days
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <button
                onClick={() => setPreviewVersion(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Back to Version List
              </button>
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to restore Version #${previewVersion.indexNum}?`)) {
                    onRestoreVersion(previewVersion.version);
                    setPreviewVersion(null);
                    onClose();
                  }
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <RotateCcw className="h-4 w-4" /> Restore Version #{previewVersion.indexNum}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Version List Modal */}
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">Schedule Revision History</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Every time someone clicks "Save Changes", an automatic snapshot with version numbers and user auto-identification is logged below.
        </p>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {versions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 italic text-xs">
              No saved version history recorded yet. Click "Save Changes" in the top bar to create your first snapshot.
            </div>
          ) : (
            versions.map((ver, idx) => {
              const versionNum = versions.length - idx; // Consecutive numbering (#1, #2, #3...)
              return (
                <div
                  key={ver.id}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between hover:border-blue-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600 text-xs font-mono bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                        Version #{versionNum}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">{ver.timestamp}</span>
                    </div>

                    <div className="text-xs text-slate-700 flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-400" /> Saved by: <span className="font-semibold text-slate-900">{ver.savedBy || 'Auto-Identified User'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewVersion({ version: ver, indexNum: versionNum })}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      title="Preview this version before restoring"
                    >
                      <Eye className="h-3.5 w-3.5 text-blue-600" /> View
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Restore Version #${versionNum}? Your current unsaved changes will be replaced.`)) {
                          onRestoreVersion(ver);
                          onClose();
                        }
                      }}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      title="Restore schedule to this snapshot"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Restore
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-end pt-2 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

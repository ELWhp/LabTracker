import React, { useState, useEffect } from 'react';
import type { ResourceIssue, LocationMismatchIssue } from '../types/labTracker';
import { LAB_TYPE_LABELS } from '../types/labTracker';
import { AlertTriangle, AlertCircle, Bell, BellOff, MapPin } from 'lucide-react';

interface ResourceAlertBannerProps {
  issues: ResourceIssue[];
  locationIssues?: LocationMismatchIssue[];
}

export const ResourceAlertBanner: React.FC<ResourceAlertBannerProps> = ({
  issues,
  locationIssues = [],
}) => {
  const [notifyOnModification, setNotifyOnModification] = useState<boolean>(() => {
    const saved = localStorage.getItem('labtracker_user_notify_preference');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('labtracker_user_notify_preference', JSON.stringify(notifyOnModification));
  }, [notifyOnModification]);

  return (
    <div className="w-full mx-auto space-y-1.5 text-xs">
      {/* Sleek 1-Line Email Notification Toggle Banner */}
      <div className="bg-slate-800 text-slate-200 px-3.5 py-1.5 rounded-md flex items-center justify-between border border-slate-700 shadow-2xs">
        <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-200 hover:text-white">
          <input
            type="checkbox"
            checked={notifyOnModification}
            onChange={(e) => setNotifyOnModification(e.target.checked)}
            className="w-3.5 h-3.5 text-blue-600 rounded border-slate-600 focus:ring-blue-500"
          />
          <span className="flex items-center gap-1.5 text-[11px]">
            {notifyOnModification ? (
              <Bell className="h-3 w-3 text-emerald-400" />
            ) : (
              <BellOff className="h-3 w-3 text-slate-400" />
            )}
            Send me email notifications when my scheduled tests are modified by another team member
          </span>
        </label>

        <span className="text-[10px] text-slate-400 font-mono">
          {notifyOnModification ? 'Notifications On ✓' : 'Off'}
        </span>
      </div>

      {/* Location Allocation Mismatch Warnings */}
      {locationIssues.length > 0 && (
        <div className="bg-rose-50 border-l-4 border-rose-600 rounded-r-md px-3 py-2 shadow-2xs text-slate-800">
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <h4 className="font-bold text-rose-950 text-xs">
                Location Allocation Alert ({locationIssues.length} Wrongly Allocated):
              </h4>
              <div className="space-y-1">
                {locationIssues.map((item, index) => (
                  <div key={index} className="flex items-center text-[11px] text-rose-900 font-medium">
                    <AlertCircle className="h-3 w-3 text-rose-600 mr-1 shrink-0" />
                    <span>
                      Technician <strong className="font-bold text-rose-950">{item.techName}</strong> (located in{' '}
                      <span className="font-bold underline">{item.techLocation}</span>) is assigned to test{' '}
                      <strong className="font-bold text-rose-950">"{item.testName}"</strong> in{' '}
                      <strong className="font-bold">{item.labName}</strong> (located in{' '}
                      <span className="font-bold underline">{item.labLocation}</span>) between {item.startDate} and {item.endDate}.
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resource Allocation Shortage Conflict Banner */}
      {issues.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-md px-3 py-2 shadow-2xs text-slate-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="font-bold text-amber-900 shrink-0 text-xs">
                Capacity Shortages:
              </span>
              {issues.map((issue, index) => (
                <div key={index} className="flex items-center text-[11px] text-amber-900 font-medium">
                  <AlertCircle className="h-3 w-3 text-amber-600 mr-1 shrink-0" />
                  <span>
                    <strong className="font-bold">{issue.startDate}</strong> to <strong className="font-bold">{issue.endDate}</strong> ({LAB_TYPE_LABELS[issue.labType] || issue.labType}): req <strong className="text-amber-950">{issue.demand}</strong> tech(s), only <strong className="text-amber-950">{issue.capacity}</strong> available.
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

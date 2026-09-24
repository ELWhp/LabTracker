import React, { useState, useEffect } from 'react';
import type { ResourceIssue } from '../types/labTracker';
import { LAB_TYPE_LABELS } from '../types/labTracker';
import { AlertTriangle, AlertCircle, Bell, BellOff } from 'lucide-react';

interface ResourceAlertBannerProps {
  issues: ResourceIssue[];
}

export const ResourceAlertBanner: React.FC<ResourceAlertBannerProps> = ({ issues }) => {
  const [notifyOnModification, setNotifyOnModification] = useState<boolean>(() => {
    const saved = localStorage.getItem('labtracker_user_notify_preference');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('labtracker_user_notify_preference', JSON.stringify(notifyOnModification));
  }, [notifyOnModification]);

  return (
    <div className="w-full max-w-4xl mx-auto my-3 space-y-2">
      {/* Top Banner Control: Email Notification Preference Checkbox */}
      <div className="bg-slate-800 text-slate-200 text-xs px-4 py-2 rounded-lg flex items-center justify-between border border-slate-700 shadow-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-slate-200 hover:text-white">
          <input
            type="checkbox"
            checked={notifyOnModification}
            onChange={(e) => setNotifyOnModification(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-slate-600 focus:ring-blue-500"
          />
          <span className="flex items-center gap-1.5">
            {notifyOnModification ? (
              <Bell className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <BellOff className="h-3.5 w-3.5 text-slate-400" />
            )}
            Send me email notifications when my scheduled tests are modified by another team member
          </span>
        </label>

        <span className="text-[10px] text-slate-400 font-mono">
          {notifyOnModification ? 'Notifications Enabled ✓' : 'Notifications Disabled'}
        </span>
      </div>

      {/* Resource Allocation Deficit Warning Banner */}
      {issues.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-md p-3.5 shadow-sm text-slate-800">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1 text-sm">
              <h4 className="font-bold text-amber-900 mb-1 flex items-center">
                Resource Allocation Issues Detected
              </h4>
              <div className="space-y-1">
                {issues.map((issue, index) => (
                  <div key={index} className="flex items-center text-xs text-amber-800">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 mr-1.5 shrink-0" />
                    <span>
                      Resource allocation issue between <strong className="font-semibold">{issue.startDate}</strong> and{' '}
                      <strong className="font-semibold">{issue.endDate}</strong> in{' '}
                      <strong className="font-semibold">{LAB_TYPE_LABELS[issue.labType] || issue.labType}</strong>: required demand is{' '}
                      <span className="font-bold text-amber-900">{issue.demand}</span> tech resources, but only{' '}
                      <span className="font-bold text-amber-900">{issue.capacity}</span> available.
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

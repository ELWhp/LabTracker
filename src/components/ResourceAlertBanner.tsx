import React from 'react';
import type { ResourceIssue } from '../types/labTracker';
import { LAB_TYPE_LABELS } from '../types/labTracker';
import { AlertTriangle, AlertCircle } from 'lucide-react';

interface ResourceAlertBannerProps {
  issues: ResourceIssue[];
}

export const ResourceAlertBanner: React.FC<ResourceAlertBannerProps> = ({ issues }) => {
  if (issues.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto my-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-md p-3.5 shadow-sm text-slate-800">
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
                  <strong className="font-semibold">{LAB_TYPE_LABELS[issue.labType]}</strong>: required demand is{' '}
                  <span className="font-bold text-amber-900">{issue.demand}</span> tech resources, but only{' '}
                  <span className="font-bold text-amber-900">{issue.capacity}</span> available.
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

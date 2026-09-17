export interface HistoryVersion {
  id: string;
  timestamp: string;
  savedBy: string;
  note: string;
  data: {
    labs: any[];
    stations: any[];
    resources: any[];
    tests: any[];
  };
}

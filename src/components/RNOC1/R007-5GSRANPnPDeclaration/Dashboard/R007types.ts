// R007dashboard.types.ts
// Dashboard TypeScript type definitions

export interface Job {
  id: string;
  jobNumber: string;
  type: "SiteConfig" | "AutoPnP";
  status: "Completed" | "Processing" | "Failed" | "Partial";
  totalSites: number;
  successfulSites: number;
  failedSites: number;
  createdAt: string;
  completedAt: string;
  duration: string;
}

export interface StatCard {
  title: string;
  value: number;
  change: number;
  icon: string;
  color: string;
}

export interface ChartData {
  date: string;
  siteConfig: number;
  autoPnP: number;
}

export interface RegionData {
  region: string;
  sites: number;
}

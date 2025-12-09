// R007mockData.ts
// Mock data for Dashboard testing

import { Job, ChartData, RegionData } from "./R007types";

// Mock Jobs - 5 jobs mẫu
export const mockJobs: Job[] = [
  {
    id: "1",
    jobNumber: "5G-HKM006M-HNI",
    type: "AutoPnP",
    status: "Completed",
    totalSites: 15,
    successfulSites: 15,
    failedSites: 0,
    createdAt: "2025-09-21 08:30:00",
    completedAt: "2025-09-21 10:15:00",
    duration: "1h 45m",
  },
  {
    id: "2",
    jobNumber: "5G-TPO030M-CBG",
    type: "AutoPnP",
    status: "Completed",
    totalSites: 25,
    successfulSites: 23,
    failedSites: 2,
    createdAt: "2025-01-20 14:00:00",
    completedAt: "2025-01-20 16:30:00",
    duration: "2h 30m",
  },
  {
    id: "3",
    jobNumber: "5G-TPO005M-DBN",
    type: "AutoPnP",
    status: "Processing",
    totalSites: 30,
    successfulSites: 18,
    failedSites: 0,
    createdAt: "2025-09-23 09:00:00",
    completedAt: "2025-09-23 09:00:00",
    duration: "",
  },
  {
    id: "4",
    jobNumber: "5G-TNU001M-LCU",
    type: "SiteConfig",
    status: "Processing",
    totalSites: 10,
    successfulSites: 0,
    failedSites: 10,
    createdAt: "2025-01-19 11:00:00",
    completedAt: "",
    duration: "",
  },
  {
    id: "5",
    jobNumber: "J1525",
    type: "AutoPnP",
    status: "Completed",
    totalSites: 20,
    successfulSites: 20,
    failedSites: 0,
    createdAt: "2025-01-18 10:00:00",
    completedAt: "2025-01-18 12:00:00",
    duration: "2h 0m",
  },
];

// Mock Chart Data - 7 ngày
export const mockChartData: ChartData[] = [
  { date: "2025-09-17", siteConfig: 5, autoPnP: 3 },
  { date: "2025-09-18", siteConfig: 2, autoPnP: 1 },
  { date: "2025-09-19", siteConfig: 4, autoPnP: 5 },
  { date: "2025-09-20", siteConfig: 6, autoPnP: 2 },
  { date: "2025-09-21", siteConfig: 3, autoPnP: 4 },
  { date: "2025-09-22", siteConfig: 5, autoPnP: 4 },
  { date: "2025-09-23", siteConfig: 2, autoPnP: 6 },
];

// Mock Region Data
export const mockRegionData: RegionData[] = [
  { region: "HNI", sites: 6 },
  { region: "CBG", sites: 5 },
  { region: "SLA", sites: 3 },
  { region: "LSN", sites: 3 },
  { region: "HGG", sites: 2 },
  { region: "LCI", sites: 4 },
  { region: "LCU", sites: 2 },
  { region: "DBN", sites: 2 },
];

// Statistics summary
export const mockStatistics = {
  totalJobs: 27,
  totalSites: 27,
  successRate: 100,
  manualSites: 6,
  pnpSites: 21,
  activeJobs: 3,
};

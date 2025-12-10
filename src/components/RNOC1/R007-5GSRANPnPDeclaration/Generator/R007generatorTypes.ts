// R007generatorTypes.ts
// Type definitions for Generator workflow

// Commission Type
export type CommissionType = "SiteConfig" | "AutoPnP";

// Step status
export type StepStatus = "pending" | "active" | "completed" | "error";

// Site data từ Excel
export interface SiteData {
  id: string;
  selected: boolean;
  // Core fields
  stt: number;
  siteName: string;
  address: string;
  ipOam: string;
  vlanMsPlane: number;
  ipMsPlane: string;
  gatewayMsPlane: string;
  vlanCuPlane: number;
  ipCuPlane: string;
  gatewayCuPlane: string;
  // Equipment info
  serialSm5g: string;
  nrbtsId5g: number;
  mrbtsId: number;
  mrbtsName5g: string;
  band5g: string;
  rrh5g: string;
  profile: string;
  // Radio config
  physCellId1: number;
  physCellId2: number;
  physCellId3: number;
  beamset1: string;
  beamset2: string;
  beamset3: string;
  // Validation
  validationStatus: "valid" | "invalid" | "warning";
  validationErrors: string[];
  // Template
  templateMatched: string | null;
}

// Template info
export interface TemplateInfo {
  id: string;
  name: string;
  rrhType: string;
  band: string;
  technology: string;
  version: string;
  commissionType: CommissionType;
  usageCount: number;
  lastUpdated: string;
}

// Site group for template matching
export interface SiteGroup {
  id: string;
  name: string;
  criteria: {
    rrhType: string;
    band: string;
    technology: string;
  };
  siteCount: number;
  siteIds: string[];
  suggestedTemplates: TemplateInfo[];
  selectedTemplate: TemplateInfo | null;
}

// Generation progress
export interface GenerationProgress {
  currentStep: number;
  totalSteps: number;
  currentSite: string;
  completedSites: number;
  failedSites: number;
  totalSites: number;
  percentage: number;
  message: string;
}

// Job result
export interface JobResult {
  jobId: string;
  jobNumber: string;
  status: "success" | "partial" | "failed";
  totalSites: number;
  successfulSites: number;
  failedSites: number;
  duration: string;
  downloadLinks: {
    xmlZip?: string;
    errorReport?: string;
    executionLog?: string;
  };
}

// Generator state
export interface GeneratorState {
  currentStep: number;
  commissionType: CommissionType | null;
  uploadedFile: File | null;
  sites: SiteData[];
  siteGroups: SiteGroup[];
  generationProgress: GenerationProgress | null;
  jobResult: JobResult | null;
  error: string | null;
}

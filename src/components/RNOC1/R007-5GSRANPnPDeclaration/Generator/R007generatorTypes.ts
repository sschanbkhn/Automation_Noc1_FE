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

  // Location & Management (used in case 4)
  province?: string;
  district?: string;
  fbbManager?: string;
  managementCell?: string;
  bandSm?: string;
  channelBw?: number | string;

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

/*
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
  templates: TemplateFile[]; // ← THÊM DÒNG NÀY
  currentJobId: string | null; // ← THÊM để lưu jobId
  currentExecutionId: string | null; // ← THÊM để truyền sang Step 6
}
*/

export interface TemplateFile {
  id: string;
  fileName: string;
  type?: string;
}


export interface GeneratedFileResult {
  siteId: string;
  fileName: string;
  status: "success" | "failed";
  error: string | null;
}

export interface StepTimestamp {
  startTime: Date | null;
  endTime: Date | null;
}

export interface ExecutionTimestamps {
  generateXML: StepTimestamp;
  uploadOSS: StepTimestamp;
  executeCommissioning: StepTimestamp;
}

export interface GeneratorState {
  currentStep: number;
  commissionType: CommissionType;
  uploadedFile: File | null;
  sites: SiteData[];
  selectedSites: string[];
  error: string | null;
  templates: TemplateFile[];
  generationProgress: GenerationProgress | null;
  executionId: string | null;  // ← THÊM DÒNG NÀY
  jobResult: JobResult | null;
   generatedResults: GeneratedFileResult[]; // ← THÊM field này
   executionTimestamps: ExecutionTimestamps; // ← THÊM

  currentJobId: string | null; // ← THÊM để lưu jobId
  currentExecutionId: string | null; // ← THÊM để truyền sang Step 6
}

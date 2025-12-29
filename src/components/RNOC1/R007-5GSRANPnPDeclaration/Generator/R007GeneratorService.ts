
// R007GeneratorService.ts
// Service để gọi 7 APIs backend cho Generator workflow
// import API_CONFIG from "./Designer/ApiR0075GSRANPnPDeclarationConfig";
import API_CONFIG from "../Designer/ApiR0075GSRANPnPDeclarationConfig";
// const API_BASE_URL = "/api/pnp5Gsran-declaration/generator";
const API_BASE_URL = `${API_CONFIG.BASE_URL}/generator`;
import { GeneratedFileResult } from "./R007generatorTypes"; // ← THÊM import này


export interface GenerateXMLRequest {
  commissionType: string;
  sites: SiteDataDTO[];
}

export interface SiteDataDTO {
  id: string;
  siteName: string;
  templateId: string;
  ipOam: string;
  band5g: string;
  rrh5g: string;
  // ... (thêm fields khác khi cần)
}

export interface GenerateXMLResponse {
  jobId: string;
  totalSites: number;
  generatedFiles: GeneratedFileResult[];
}

/*
export interface GeneratedFileResult {
  siteId: string;
  fileName: string;
  status: string;
  error: string | null;
}
*/

export interface UploadToOSSResponse {
  uploadedFiles: number;
  failedFiles: number;
  ossJobId: string;
}

export interface ExecuteCommissioningResponse {
  executionId: string;
  status: string;
  startTime: string;
}

export interface ExecutionStatusResponse {
  executionId: string;
  status: string;
  progress: {
    percentage: number;
    currentSite: string;
    completedSites: number;
    failedSites: number;
    totalSites: number;
  };
  message: string;
}

export interface ExecutionResultsResponse {
  executionId: string;
  status: string;
  totalSites: number;
  successfulSites: number;
  failedSites: number;
  duration: string;
  results: SiteExecutionResult[];
  downloadLinks: {
    xmlZip: string;
    errorReport: string;
    executionLog: string;
  };
}

export interface SiteExecutionResult {
  siteId: string;
  siteName: string;
  status: string;
  error: string | null;
  completedAt: string | null;
}

export class R007GeneratorService {
  // ====================================================================
  // API 1: Get Template Content
  // ====================================================================
  static async getTemplateContent(fileName: string): Promise<string> {
    const response = await fetch(
      `${API_BASE_URL}/template-content/${fileName}`
    );
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Failed to get template content");
    }
    
    return result.data.content;
  }

  // ====================================================================
  // API 2: Generate XML Files
  // ====================================================================
  static async generateXML(
    request: GenerateXMLRequest
  ): Promise<GenerateXMLResponse> {
    const response = await fetch(`${API_BASE_URL}/generate-xml`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Failed to generate XML files");
    }
    
    return result.data;
  }

  // ====================================================================
  // API 3: Download XML ZIP
  // ====================================================================
  static async downloadXMLZip(jobId: string): Promise<void> {
    const url = `${API_BASE_URL}/download/${jobId}`;
    window.open(url, "_blank");
  }

  // ====================================================================
  // API 4: Upload to OSS Netact
  // ====================================================================
  static async uploadToOSS(
    jobId: string,
    commissionType: string
  ): Promise<UploadToOSSResponse> {
    const response = await fetch(`${API_BASE_URL}/upload-to-oss`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, commissionType }),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Failed to upload to OSS");
    }
    
    return result.data;
  }

  // ====================================================================
  // API 5: Execute Commissioning
  // ====================================================================
  static async executeCommissioning(
    ossJobId: string,
    commissionType: string
  ): Promise<ExecuteCommissioningResponse> {
    const response = await fetch(`${API_BASE_URL}/execute-commissioning`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ossJobId, commissionType }),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Failed to execute commissioning");
    }
    
    return result.data;
  }

  // ====================================================================
  // API 6: Get Job Status (Polling)
  // ====================================================================
  static async getJobStatus(
    executionId: string
  ): Promise<ExecutionStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/status/${executionId}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Failed to get job status");
    }
    
    return result.data;
  }

  // ====================================================================
  // API 7: Get Final Results
  // ====================================================================
  static async getJobResults(
    executionId: string
  ): Promise<ExecutionResultsResponse> {
    const response = await fetch(`${API_BASE_URL}/results/${executionId}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Failed to get job results");
    }
    
    return result.data;
  }

  // ====================================================================
  // BONUS: Download Error Report
  // ====================================================================
  static async downloadErrorReport(executionId: string): Promise<void> {
    const url = `${API_BASE_URL}/error-report/${executionId}`;
    window.open(url, "_blank");
  }

  // ====================================================================
  // BONUS: Download Execution Logs
  // ====================================================================

  static async downloadLogs(executionId: string): Promise<void> {
    const url = `${API_BASE_URL}/logs/${executionId}`;
    window.open(url, "_blank");
  }
   // ====================================================================


   // ====================================================================
  // NEW: Get XML File Content
  // Mục đích: Lấy nội dung file XML đã generate từ backend
  // Input: jobId, fileName
  // Output: XML content dạng string
  // ====================================================================
  static async getXMLFileContent(jobId: string, fileName: string): Promise<string> {
    const response = await fetch(
      `${API_BASE_URL}/xml-content/${jobId}/${fileName}`
    );
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Failed to get XML content");
    }
    
    return result.data.content;
  }
// ====================================================================














}
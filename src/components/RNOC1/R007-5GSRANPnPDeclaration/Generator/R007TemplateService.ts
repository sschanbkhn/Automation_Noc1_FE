// import { API_CONFIG } from "./apiConfig";
import API_CONFIG from "../Designer/ApiR0075GSRANPnPDeclarationConfig";

// const API_BASE = API_CONFIG.BASE_URL.replace("/sleeping-cell", "/pnp5Gsran-declaration/funprocessing");
const API_BASE = `${API_CONFIG.BASE_URL}/generator`;

export interface TemplateFile {
  id: string;
  fileName: string;
  type?: string;
}

export interface TemplateListResponse {
  success: boolean;
  count: number;
  type?: string;
  data: TemplateFile[];
}

export const R007TemplateService = {
  /**
   * Lấy templates cho Auto PnP
   * GET /api/pnp5Gsran-declaration/funprocessing/PnP-list
   */
  getPnPTemplateList: async (): Promise<TemplateListResponse> => {
    try {
      const response = await fetch(`${API_BASE}/list-pnp`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching PnP templates:", error);
      throw error;
    }
  },

  /**
   * Lấy templates cho Site Configuration (OnSite)
   * GET /api/pnp5Gsran-declaration/funprocessing/OnSite-list
   */
  getOnSiteTemplateList: async (): Promise<TemplateListResponse> => {
    try {
      const response = await fetch(`${API_BASE}/OnSite-list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching OnSite templates:", error);
      throw error;
    }
  },

  /**
   * Download template file
   * GET /api/pnp5Gsran-declaration/funprocessing/download/{fileName}?type=...
   */
  downloadTemplate: async (fileName: string, type: "SiteConfig" | "AutoPnP"): Promise<Blob> => {
    try {
      const response = await fetch(`${API_BASE}/download/${fileName}?type=${type}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error("Error downloading template:", error);
      throw error;
    }
  },
};

import request from "helpers/request"

/**
 * Tab1Service - API service for Tab 1: Dashboard & Policer
 * Handles all API calls related to ASN configuration, policer management, and monitoring
 */
const I001_TAB1 = "I001_TAB1";

const Tab1Service = {
  /**
   * Get ASN list with traffic statistics
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 1000)
   * @returns Promise with ASN data
   */
  GetASNList: async (page: number = 1, pageSize: number = 1000) => {
    let res: any = await request({
      url: `/${I001_TAB1}/GetASNList?page=${page}&pageSize=${pageSize}`,
      method: 'get'
    });
    return res
  },

  /**
   * Get API monitor status
   * @returns Promise with API usage percentage and threshold
   */
  GetAPIMonitorStatus: async () => {
    let res: any = await request({
      url: `/${I001_TAB1}/GetAPIMonitorStatus`,
      method: 'get'
    });
    return res
  },

  /**
   * Get last warning information
   * @returns Promise with latest warning data
   */
  GetLastWarning: async () => {
    let res: any = await request({
      url: `/${I001_TAB1}/GetLastWarning`,
      method: 'get'
    });
    return res
  },

  /**
   * Apply policer configuration to selected devices via N8n
   * @param asn - ASN number to configure
   * @param bandwidth - Bandwidth limit
   * @param devices - List of devices to apply config to
   * @returns Promise with configuration result
   */
  ApplyPolicerConfig: async (asn: string, bandwidth: string, devices: string[]) => {
    let res: any = await request({
      url: `/${I001_TAB1}/ApplyPolicerConfig`,
      method: 'post',
      data: {
        asn,
        bandwidth,
        devices
      }
    });
    return res
  }
}

export default Tab1Service

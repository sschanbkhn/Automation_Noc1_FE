import request from "helpers/request"

/**
 * Tab2Service - API service for Tab 2: Add Counter - IPT Statistics
 * Handles all API calls related to adding traffic counters to ASNs and their prefixes
 */
const I001_TAB2 = "I001_TAB2";

const Tab2Service = {
  /**
   * Get TOP 20 ASNs with highest traffic for a specific date
   * @param date - Date to get statistics for (YYYY-MM-DD format)
   * @returns Promise with TOP 20 ASN data
   */
  GetTopASNList: async (date: string) => {
    let res: any = await request({
      url: `/${I001_TAB2}/GetTopASNList?date=${date}`,
      method: 'get'
    });
    return res
  },

  /**
   * Get detailed prefix information for an ASN
   * @param asn - ASN number
   * @returns Promise with prefix details including traffic stats
   */
  GetASNPrefixes: async (asn: string) => {
    let res: any = await request({
      url: `/${I001_TAB2}/GetASNPrefixes?asn=${asn}`,
      method: 'get'
    });
    return res
  },

  /**
   * Add traffic counter to ASN prefixes on selected devices via N8n
   * @param asn - ASN number
   * @param asName - AS name
   * @param prefixes - List of prefixes to counter
   * @param devices - List of devices to apply counter to
   * @returns Promise with operation result for each device
   */
  AddCounter: async (asn: string, asName: string, prefixes: string[], devices: string[]) => {
    let res: any = await request({
      url: `/${I001_TAB2}/AddCounter`,
      method: 'post',
      data: {
        asn,
        asName,
        prefixes,
        devices
      }
    });
    return res
  }
}

export default Tab2Service

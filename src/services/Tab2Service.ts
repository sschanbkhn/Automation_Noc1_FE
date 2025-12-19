import request from "helpers/request"
import axios from 'axios'

/**
 * Tab2Service - API service for Tab 2: Add Counter - IPT Statistics
 * Handles all API calls related to adding traffic counters to ASNs and their prefixes
 */
const I001_TAB2 = "I001_TAB2";

const Tab2Service = {
  /**
   * Get TOP 20 ASNs with highest max_in traffic for a specific date
   * Endpoint: GET /api/get-arbor-as-traffic (proxied)
   * @param date - Date to get statistics for (YYYY-MM-DD format)
   * @returns Promise with TOP 20 ASN data sorted by max_in
   */
  GetArborASTraffic: async (date: string) => {
    try {
      const response = await axios.get('/api/get-arbor-as-traffic', {
        params: { date },
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (err: any) {
      return { 
        status: 'error', 
        data: [], 
        message: err?.message || 'Network error'
      };
    }
  },

  /**
   * Get prefix information for a specific ASN on a specific date
   * Endpoint: GET /api/get-prefix-fromASN (proxied)
   * @param asn - ASN number (e.g., "AS12345")
   * @param date - Date to get prefix data for (YYYY-MM-DD format)
   * @returns Promise with prefix details including traffic stats
   */
  GetPrefixFromASN: async (asn: string, date: string) => {
    try {
      const response = await axios.get('/api/get-prefix-fromASN', {
        params: { asn, date },
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (err: any) {
      return { 
        status: 'error', 
        data: [], 
        message: err?.message || 'Network error'
      };
    }
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

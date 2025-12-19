import request from "helpers/request"
import axios from 'axios'

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
   * Get threshold configuration for alert monitoring
   * @returns Promise with threshold value from database
   * Endpoint: GET /api/set-threshold (proxied)
   */
  GetThresholdConfig: async () => {
    try {
      const response = await axios.get('/api/set-threshold', {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (err: any) {
      return { 
        status: 'error', 
        data: null, 
        message: err?.message || 'Network error'
      };
    }
  },

  /**
   * Get last warning information
   * @returns Promise with latest warning data from external API
   * Endpoint: GET /api/last-warning (proxied)
   */
  GetLastWarning: async () => {
    try {
      const response = await axios.get('/api/last-warning', {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (err: any) {
      return { 
        status: 'error', 
        data: null, 
        message: err?.message || 'Network error'
      };
    }
  },

  /**
   * Get IPT chart data for traffic monitoring
   * @param from - Start date (YYYY-MM-DD format)
   * @param to - End date (YYYY-MM-DD format)
   * @returns Promise with chart data array containing time, throughput, capacity, efficiency
   */
  GetIPTChart: async (from?: string, to?: string) => {
    const params = [];
    if (from) params.push(`from=${encodeURIComponent(from)}`);
    if (to) params.push(`to=${encodeURIComponent(to)}`);
    const qs = params.length ? `?${params.join('&')}` : '';

    let res: any = await request({
      url: `/${I001_TAB1}/GetIPTChart${qs}`,
      method: 'get'
    });
    return res;
  },

  /**
   * Get last policer configuration applied
   * @returns Promise with last policer data including ASN, bandwidth, devices, status
   */
  GetLastPolicerData: async () => {
    let res: any = await request({
      url: `/${I001_TAB1}/GetLastPolicerData`,
      method: 'get'
    });
    return res
  },

  /**
   * Get traffic data from external API for chart visualization
   * Endpoint: GET /api/traffic (proxied to http://localhost:3000)
   * @param startDate - Start date (YYYY-MM-DD format) - optional
   * @param endDate - End date (YYYY-MM-DD format) - optional
   * @returns Promise with traffic data including trafficInTotal, capacityTotal, utilizationPercent
   */
  GetTrafficData: async (startDate?: string, endDate?: string) => {
    try {
      let url = '/api/traffic';
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      console.log('🔄 GetTrafficData URL:', url);
      
      const response = await axios.get(url, {
        timeout: 30000
      });
      return response.data;
    } catch (err: any) {
      console.error('GetTrafficData error:', err);
      return { success: false, data: [], message: err?.message || 'Network error' };
    }
  },

  /**
   * Get ASN shortlist from external API
   * Endpoint: GET /api/shortlist (proxied to http://localhost:3000)
   * @returns Promise with ASN shortlist data
   */
  GetASNShortlist: async () => {
    try {
      const response = await axios.get('/api/shortlist', {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (err: any) {
      console.error('GetASNShortlist error:', err);
      return { 
        success: false, 
        data: [], 
        message: err?.message || 'Network error',
        totalRecords: 0
      };
    }
  },

  /**
   * Get last config policer information
   * @returns Promise with latest policer config data from external API
   * Endpoint: GET /api/Lasted-config-policer (proxied)
   */
  GetLastedConfigPolicer: async () => {
    try {
      console.log('🔄 Calling /api/Lasted-config-policer...');
      const response = await axios.get('/api/Lasted-config-policer', {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ GetLastedConfigPolicer response:', response);
      console.log('✅ Status:', response.status);
      console.log('✅ Data:', response.data);
      return response.data;
    } catch (err: any) {
      console.error('❌ GetLastedConfigPolicer error:', err);
      console.error('❌ Error response:', err?.response);
      console.error('❌ Status code:', err?.response?.status);
      console.error('❌ Error data:', err?.response?.data);
      console.error('❌ Error message:', err?.message);
      return { 
        status: 'error', 
        data: null, 
        message: err?.message || 'Network error'
      };
    }
  },

  /**
   * Delete ASN from shortlist
   * @param asnId - ASN ID to delete
   * @returns Promise with deletion result
   * Endpoint: DELETE /api/shortlist/:id (proxied)
   */
  DeleteASN: async (asnId: number) => {
    try {
      console.log('🔄 Calling DELETE /api/shortlist/' + asnId);
      const response = await axios.delete(`/api/shortlist/${asnId}`, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ DeleteASN response:', response);
      console.log('✅ Status:', response.status);
      console.log('✅ Data:', response.data);
      return response.data;
    } catch (err: any) {
      console.error('❌ DeleteASN error:', err);
      console.error('❌ Error response:', err?.response);
      console.error('❌ Status code:', err?.response?.status);
      console.error('❌ Error data:', err?.response?.data);
      console.error('❌ Error message:', err?.message);
      return { 
        success: false, 
        message: err?.message || 'Network error'
      };
    }
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
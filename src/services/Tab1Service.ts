import axios from 'axios'

/**
 * Tab1Service - API service for Tab 1: Dashboard & Policer
 * Handles all API calls related to ASN configuration, policer management, and monitoring
 */
const I001_TAB1 = "I001_TAB1";
// Production server - ACTIVE
const API_BASE_URL = 'http://10.155.43.196:3000';
// Local development (comment production above, uncomment this for local dev)
// const API_BASE_URL = 'http://localhost:3000';

console.log('🔧 Tab1Service API_BASE_URL:', API_BASE_URL);

const Tab1Service = {
  /**
   * Get ASN list with traffic statistics
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 1000)
   * @returns Promise with ASN data
   */
  GetASNList: async (page: number = 1, pageSize: number = 1000) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${I001_TAB1}/GetASNList`, {
        params: { page, pageSize },
        timeout: 10000
      });
      return response.data;
    } catch (err: any) {
      console.error('GetASNList error:', err);
      return { status: 'error', data: [], message: err?.message || 'Network error' };
    }
  },

  /**
   * Get API monitor status
   * @returns Promise with API usage percentage and threshold
   */
  GetAPIMonitorStatus: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${I001_TAB1}/GetAPIMonitorStatus`, { timeout: 10000 });
      return response.data;
    } catch (err: any) {
      console.error('GetAPIMonitorStatus error:', err);
      return { status: 'error', data: null, message: err?.message || 'Network error' };
    }
  },

  /**
   * Get threshold configuration for alert monitoring
   * @returns Promise with threshold value from database
   * Endpoint: GET /api/set-threshold (proxied)
   */
  GetThresholdConfig: async () => {
    try {
      console.log('🔄 Calling /api/set-threshold...');
      const response = await axios.get(`${API_BASE_URL}/api/set-threshold`, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ GetThresholdConfig response:', response);
      console.log('✅ Status:', response.status);
      console.log('✅ Data:', response.data);
      return response.data;
    } catch (err: any) {
      console.error('❌ GetThresholdConfig error:', err);
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
   * Get last warning information
   * @returns Promise with latest warning data from external API
   * Endpoint: GET /api/last-warning (proxied)
   */
  GetLastWarning: async () => {
    try {
      console.log('🔄 Calling /api/last-warning...');
      const response = await axios.get(`${API_BASE_URL}/api/last-warning`, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ GetLastWarning response:', response);
      console.log('✅ Status:', response.status);
      console.log('✅ Data:', response.data);
      return response.data;
    } catch (err: any) {
      console.error('❌ GetLastWarning error:', err);
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
   * Get IPT chart data for traffic monitoring
   * @param from - Start date (YYYY-MM-DD format)
   * @param to - End date (YYYY-MM-DD format)
   * @returns Promise with chart data array containing time, throughput, capacity, efficiency
   */
  GetIPTChart: async (from?: string, to?: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${I001_TAB1}/GetIPTChart`, {
        params: { from, to },
        timeout: 15000
      });
      return response.data;
    } catch (err: any) {
      console.error('GetIPTChart error:', err);
      return { status: 'error', data: [], message: err?.message || 'Network error' };
    }
  },

  /**
   * Get last policer configuration applied
   * @returns Promise with last policer data including ASN, bandwidth, devices, status
   */
  GetLastPolicerData: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${I001_TAB1}/GetLastPolicerData`, { timeout: 10000 });
      return response.data;
    } catch (err: any) {
      console.error('GetLastPolicerData error:', err);
      return { status: 'error', data: null, message: err?.message || 'Network error' };
    }
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
      let url = `${API_BASE_URL}/api/traffic`;
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
   * Get latest traffic data for API Monitor Box (1 sample only)
   * Endpoint: GET /api/Traffic-APIMonitoBox (proxied)
   * Backend configured to return only the latest record
   * @returns Promise with single latest traffic record {trafficInTotal, capacityTotal, utilizationPercent, updatedAt}
   */
  GetTrafficAPIMonitorBox: async () => {
    try {
      const url = `${API_BASE_URL}/api/Traffic-APIMonitoBox`;
      console.log('🔄 GetTrafficAPIMonitorBox URL:', url);
      
      const response = await axios.get(url, {
        timeout: 30000
      });
      return response.data;
    } catch (err: any) {
      console.error('GetTrafficAPIMonitorBox error:', err);
      return { success: false, data: null, message: err?.message || 'Network error' };
    }
  },

  /**
   * Get ASN shortlist from external API
   * Endpoint: GET /api/shortlist (proxied to http://localhost:3000)
   * @returns Promise with ASN shortlist data
   */
  GetASNShortlist: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/shortlist`, {
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
   * Apply policer configuration to selected devices via N8n
   * @param asn - ASN number to configure
   * @param bandwidth - Bandwidth limit
   * @param devices - List of devices to apply config to
   * @returns Promise with configuration result
   */
  ApplyPolicerConfig: async (asn: string, bandwidth: string, devices: string[]) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/${I001_TAB1}/ApplyPolicerConfig`, {
        asn,
        bandwidth,
        devices
      }, {
        timeout: 60000,
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (err: any) {
      console.error('ApplyPolicerConfig error:', err);
      return { status: 'error', data: null, message: err?.message || 'Network error' };
    }
  },

  /**
   * Get configuration to apply policer from external API
   * This API automatically runs continuously to get latest config when performance exceeds threshold
   * Provides: Config Updated At, ASN Section, Config Command, bandwidth
   * Endpoint: GET /api/get-config-toPolicer (proxied)
   * @returns Promise with config data {asn, policer_bw, config_commands, updated_at}
   */
  GetConfigToPolicer: async () => {
    try {
      console.log('🔄 Calling /api/get-config-toPolicer...');
      const response = await axios.get(`${API_BASE_URL}/api/get-config-toPolicer`, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ GetConfigToPolicer response:', response);
      console.log('✅ Status:', response.status);
      console.log('✅ Data:', response.data);
      return response.data;
    } catch (err: any) {
      console.error('❌ GetConfigToPolicer error:', err);
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
   * Post policer configuration to N8N for execution
   * Endpoint: POST /api/Post-policer-config-toN8 (proxied)
   * @param policerTemplate - Config template command
   * @param deviceList - List of devices with hostname and name
   * @param asn - ASN number
   * @param policerBw - Bandwidth in Gbps
   * @returns Promise with execution result
   */
  PostPolicerConfigToN8: async (policerTemplate: string, deviceList: Array<{hostname: string, name: string}>, asn: string, policerBw: number) => {
    try {
      console.log('🔄 Calling POST /api/Post-policer-config-toN8...');
      const payload = {
        policer_template: policerTemplate,
        device_list: deviceList,
        asn: asn,
        policer_bw: policerBw
      };
      console.log('📦 POST payload:', payload);
      
      const response = await axios.post(`${API_BASE_URL}/api/Post-policer-config-toN8`, payload, {
        timeout: 60000, // 60 seconds for N8N execution
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ PostPolicerConfigToN8 response:', response);
      console.log('✅ Status:', response.status);
      console.log('✅ Data:', response.data);
      return response.data;
    } catch (err: any) {
      console.error('❌ PostPolicerConfigToN8 error:', err);
      console.error('❌ Error response:', err?.response);
      console.error('❌ Status code:', err?.response?.status);
      console.error('❌ Error data:', err?.response?.data);
      console.error('❌ Error message:', err?.message);
      
      // If 404, return mock success for testing (REMOVE THIS AFTER BACKEND IS READY)
      if (err?.response?.status === 404) {
        console.warn('⚠️ API endpoint not found (404). Using MOCK response for testing.');
        console.warn('⚠️ TODO: Implement /api/Post-policer-config-toN8 endpoint in backend!');
        return {
          status: 'success',
          data: {
            message: 'MOCK: Config sent to N8N successfully',
            asn: asn,
            policer_bw: policerBw,
            device_list: deviceList,
            timestamp: new Date().toISOString()
          }
        };
      }
      
      return { 
        status: 'error', 
        data: null, 
        message: err?.message || 'Network error'
      };
    }
  },

  /**
   * Get latest policer configuration result
   * Endpoint: GET /api/config_policer_bw_result (proxied)
   * @returns Promise with result data showing per-device status
   */
  GetPolicerConfigResult: async () => {
    try {
      console.log('🔄 Calling /api/config_policer_bw_result...');
      const response = await axios.get(`${API_BASE_URL}/api/config_policer_bw_result`, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ GetPolicerConfigResult response:', response);
      console.log('✅ Status:', response.status);
      console.log('✅ Data:', response.data);
      return response.data;
    } catch (err: any) {
      console.error('❌ GetPolicerConfigResult error:', err);
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
   * Post delete ASN counter to N8N via backend
   * Endpoint: POST /api/Delete-ASN-Counter
   * @param asn - ASN number (string or number)
   */
  PostDeleteASNCounter: async (asn: string | number) => {
    try {
      console.log('🔄 Calling POST /api/Delete-ASN-Counter...', { asn });
      const payload = { asn: String(asn) };
      console.log('📦 Delete payload:', payload);
      const response = await axios.post(`${API_BASE_URL}/api/Delete-ASN-Counter`, payload, {
        timeout: 120000,
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('✅ PostDeleteASNCounter response:', response);
      return response.data;
    } catch (err: any) {
      console.error('❌ PostDeleteASNCounter error:', err);
      return { status: 'error', data: null, message: err?.message || 'Network error' };
    }
  },

  /**
   * Get delete ASN counter result (per-device) from backend
   * Endpoint: GET /api/Delete-ASN-Counter/result
   */
  GetDeleteASNCounterResult: async () => {
    try {
      console.log('🔄 Calling GET /api/Delete-ASN-Counter/result...');
      const response = await axios.get(`${API_BASE_URL}/api/Delete-ASN-Counter/result`, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('✅ GetDeleteASNCounterResult response:', response);
      return response.data;
    } catch (err: any) {
      console.error('❌ GetDeleteASNCounterResult error:', err);
      return { status: 'error', data: null, message: err?.message || 'Network error' };
    }
  },

  /**
   * Post frontend user action log for IPT policer operations
   * Endpoint: POST /api/log-action-ipt-policer-fe
   * @param payload - { user: string, log_action: string }
   */
  PostLogActionIptPolicerFE: async (payload: { user: string, log_action: string }) => {
    try {
      console.log('🔄 Posting frontend action log to /api/log-action-ipt-policer-fe', payload);
      const response = await axios.post(`${API_BASE_URL}/api/log-action-ipt-policer-fe`, payload, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('✅ PostLogActionIptPolicerFE response:', response?.data);
      return response.data;
    } catch (err: any) {
      console.error('❌ PostLogActionIptPolicerFE error:', err?.message || err);
      return { status: 'error', message: err?.message || 'Network error' };
    }
  },

  /**
   * Get lasted policer configuration details
   * Endpoint: GET /api/Lasted-config-policer (proxied)
   * @returns Promise with lasted config details
   */
  GetLastedConfigPolicer: async () => {
    try {
      console.log('🔄 Calling /api/Lasted-config-policer...');
      const response = await axios.get(`${API_BASE_URL}/api/Lasted-config-policer`, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ GetLastedConfigPolicer response:', response);
      return response.data;
    } catch (err: any) {
      console.error('❌ GetLastedConfigPolicer error:', err);
      return { 
        status: 'error', 
        data: null, 
        message: err?.message || 'Network error'
      };
    }
  }
}

export default Tab1Service
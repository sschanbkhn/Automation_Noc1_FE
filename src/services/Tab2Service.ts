import axios from 'axios'

/**
 * Tab2Service - API service for Tab 2: Add Counter - IPT Statistics
 * Handles all API calls related to adding traffic counters to ASNs and their prefixes
 */
const I001_TAB2 = "I001_TAB2";
// Production server - ACTIVE
// const API_BASE_URL = 'http://10.155.43.196:3000';
const API_BASE_URL = process.env.REACT_APP_INOC_API_URL;
// Local development (comment production above, uncomment this for local dev)
// const API_BASE_URL = 'http://localhost:3000';

const Tab2Service = {
  /**
   * Get TOP 20 ASNs with highest max_in traffic for a specific date
   * Endpoint: GET /api/get-arbor-as-traffic (proxied)
   * @param date - Date to get statistics for (YYYY-MM-DD format)
   * @returns Promise with TOP 20 ASN data sorted by max_in
   */
  GetArborASTraffic: async (date: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/get-arbor-as-traffic`, {
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
   * Check which PRTG groups are already used
   * Endpoint: GET /api/Check-ASN-Counter/checkGroup
   * @returns { status: string, data: number[] }
   */
  CheckPRTGGroupUsed: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/Check-ASN-Counter/checkGroup`, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
      });
      // Normalize to array of numeric ids
      const payload = response.data;
      let ids: number[] = [];
      if (payload?.status === 'success' && Array.isArray(payload.data)) {
        ids = payload.data.map((x: any) => {
          if (typeof x === 'object') return Number(x.group_id ?? x.id ?? x);
          return Number(x);
        }).filter((n: number) => !Number.isNaN(n));
      } else if (Array.isArray(payload)) {
        ids = payload.map((x: any) => Number(x)).filter((n: number) => !Number.isNaN(n));
      }
      return { status: 'success', data: ids };
    } catch (err: any) {
      console.error('CheckPRTGGroupUsed error (primary endpoint):', err?.message || err);
      // Fallback: try fetching all ASN counter records and extract group_id field
      try {
        const fallback = await axios.get(`${API_BASE_URL}/api/Check-ASN-Counter`, {
          timeout: 7000,
          headers: { 'Content-Type': 'application/json' }
        });
        const fb = fallback.data;
        if (fb?.status === 'success' && Array.isArray(fb.data)) {
          const ids = fb.data.map((rec: any) => Number(rec.group_id ?? rec.groupId ?? rec.group ?? rec)).filter((n: number) => !Number.isNaN(n));
          const unique = Array.from(new Set(ids));
          return { status: 'success', data: unique };
        }
      } catch (fbErr: any) {
        console.error('CheckPRTGGroupUsed fallback error:', fbErr?.message || fbErr);
      }
      return { status: 'error', data: [] };
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
      const response = await axios.get(`${API_BASE_URL}/api/get-prefix-fromASN`, {
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
   * Check whether an ASN is already countered
   * Endpoint: GET /api/Check-ASN-Counter
   * @param asn - ASN number (without 'AS' prefix)
   * @returns Promise with { isCountered: boolean } or boolean
   */
  CheckASNCounter: async (asn: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/Check-ASN-Counter`, {
        params: { asn },
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
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
   * Check which prefixes for an ASN are already countered
   * Endpoint: GET /api/Check-ASN-Counter/checkprefix_list?asn=<asn>
   * @param asn - ASN number (string or numeric)
   * @returns { status: string, data: string[] }
   */
  CheckPrefixesUsed: async (asn: string) => {
    try {
      const url = `${API_BASE_URL}/api/Check-ASN-Counter/checkprefix_list`;
      console.debug('CheckPrefixesUsed request:', { url, params: { asn } });
      const response = await axios.get(url, {
        params: { asn },
        timeout: 7000,
        headers: { 'Content-Type': 'application/json' }
      });
      const payload = response.data;
      console.debug('CheckPrefixesUsed response payload:', payload);
      let prefixes: string[] = [];
      if (payload?.status === 'success' && Array.isArray(payload.data)) {
        prefixes = payload.data.map((p: any) => {
          if (typeof p === 'string') return p;
          if (typeof p === 'object') return p.prefix || p.prefix_name || String(p);
          return String(p);
        }).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      } else if (Array.isArray(payload)) {
        prefixes = payload.map((p: any) => String(p).trim()).filter((s: string) => s.length > 0);
      }
      return { status: 'success', data: prefixes };
    } catch (err: any) {
      console.error('CheckPrefixesUsed error:', err?.message || err);
      return { status: 'error', data: [] };
    }
  },
  /**
   * Post Add ASN counter request to N8N via backend
   * Endpoint: POST /api/Add-ASN-Counter
   */
  PostAddASNCounterToN8: async (asn: string, asName: string, prefixes: string[], prtgGroup?: number, isAlreadyCountered?: boolean, userUpdate?: string) => {
    try {
      // Backend / N8N expects: { asn, prefix_list, is_new_asn }
      // Keep group and asName fields as additional metadata; compute is_new_asn from isAlreadyCountered
      const payload = {
        asn,
        prefix_list: prefixes,
        is_new_asn: !isAlreadyCountered,
        ptrg_group: prtgGroup,
        user_update: userUpdate || process.env.REACT_APP_USER_UPDATE || ''
      };
      const response = await axios.post(`${API_BASE_URL}/api/Add-ASN-Counter`, payload, {
        timeout: 60000,
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (err: any) {
      console.error('PostAddASNCounterToN8 error:', err);
      if (err?.response?.status === 404) {
        return { status: 'error', data: null, message: 'Endpoint not found' };
      }
      return { status: 'error', data: null, message: err?.message || 'Network error' };
    }
  },

  /**
   * Get result of config counter applied by N8N
   * Endpoint: GET /api/Config-Counter-result
   */
  GetConfigCounterResult: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/Config-Counter-result`, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (err: any) {
      console.error('GetConfigCounterResult error:', err);
      return { status: 'error', data: null, message: err?.message || 'Network error' };
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
  AddCounter: async (asn: string, asName: string, prefixes: string[], devices: string[] = [], isAlreadyCountered: boolean = false) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/${I001_TAB2}/AddCounter`, {
        asn,
        asName,
        prefixes,
        devices,
        isAlreadyCountered
      }, {
        timeout: 60000,
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (err: any) {
      console.error('AddCounter error:', err);
      return { status: 'error', data: null, message: err?.message || 'Network error' };
    }
  }
}

export default Tab2Service

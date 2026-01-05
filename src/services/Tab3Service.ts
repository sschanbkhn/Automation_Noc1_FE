import axios from 'axios'

/**
 * Tab3Service - API service for Tab 3: Admin Work - IPT Monitoring Management
 * Handles all API calls related to managing IPT monitoring points and system settings
 */
const I001_TAB3 = "I001_TAB3";
// Production server - ACTIVE
const API_BASE_URL = 'http://10.155.43.196:3000';
// Local development (comment production above, uncomment this for local dev)
// const API_BASE_URL = 'http://localhost:3000';

const Tab3Service = {
  /**
   * Get list of all current IPT monitoring points
   * Endpoint: GET /api/GetIPTMonitoringList
   * @returns Promise with { status, data: [{ id, device, interface, partner, capacity, prtg_id, created_at }] }
   */
  GetIPTMonitoringList: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/GetIPTMonitoringList`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return {
        status: 'success',
        data: (response.data?.data || response.data || []) as any[]
      };
    } catch (error: any) {
      return {
        status: 'error',
        data: [] as any[],
        message: error?.message || 'Failed to fetch IPT monitoring list'
      };
    }
  },

  /**
   * Add new IPT monitoring point
   * Endpoint: POST /api/AddIPTMonitoring
   * @param device - Target device
   * @param interfaceName - Network interface
   * @param partner - ISP/Partner name
   * @param capacity - Bandwidth capacity
   * @param prtgId - PRTG monitoring ID
   * @returns Promise with result of adding monitoring point
   */
  AddIPTMonitoring: async (
    device: string,
    interfaceName: string,
    partner: string,
    capacity: string,
    prtgId: string
  ) => {
    try {
      if (!device || !interfaceName || !partner || !capacity || !prtgId) {
        throw new Error('All fields are required');
      }

      const response = await axios.post(`${API_BASE_URL}/api/AddIPTMonitoring`, {
        device,
        interface: interfaceName,
        partner,
        capacity,
        prtg_id: prtgId
      }, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        status: 'success',
        message: response.data?.message || 'IPT monitoring added successfully',
        data: response.data
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.response?.data?.message || error?.message || 'Failed to add IPT monitoring'
      };
    }
  },

  /**
   * Delete IPT monitoring point from database
   * Endpoint: DELETE /api/DeleteIPTMonitoring/:id
   * @param id - IPT monitoring ID to delete
   * @returns Promise with result { status, message }
   */
  DeleteIPTMonitoring: async (id: number) => {
    try {
      if (!id) {
        throw new Error('IPT ID is required');
      }

      const response = await axios.delete(`${API_BASE_URL}/api/DeleteIPTMonitoring/${id}`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        status: 'success',
        message: response.data?.message || 'IPT monitoring deleted successfully',
        data: response.data
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.response?.data?.message || error?.message || 'Failed to delete IPT monitoring'
      };
    }
  },

  /**
   * Get current trigger alarm threshold from database
   * Endpoint: GET /api/GetTriggerAlarmLevel
   * @returns Promise with { status, data: { id, trigger_threshold, user_updated, updated_at }, timestamp }
   */
  GetTriggerAlarmLevel: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/GetTriggerAlarmLevel`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      return {
        status: 'error',
        data: {
          trigger_threshold: 70
        },
        message: error?.message || 'Failed to fetch trigger alarm level'
      };
    }
  },

  /**
   * Set trigger alarm threshold in database
   * Endpoint: POST /api/SetTriggerAlarmLevel
   * @param alarmLevel - Alarm threshold percentage (70-100)
   * @returns Promise with result { status, message }
   */
  SetTriggerAlarmLevel: async (alarmLevel: number) => {
    try {
      if (!alarmLevel || alarmLevel < 0 || alarmLevel > 100) {
        throw new Error('Invalid alarm level. Must be between 0-100');
      }
      
      const response = await axios.post(`${API_BASE_URL}/api/SetTriggerAlarmLevel`, {
        trigger_threshold: alarmLevel,
        user_updated: 'frontend_user'
      }, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return {
        status: 'success',
        message: 'Trigger alarm level updated successfully',
        data: response.data
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.response?.data?.message || error?.message || 'Failed to update trigger alarm level'
      };
    }
  },

  /**
   * Get current automatic rollback time
   * @returns Promise with current rollback time (HH:MM format)
   */
  GetRollbackTime: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${I001_TAB3}/GetRollbackTime`, { timeout: 10000 });
      return response.data;
    } catch (err: any) {
      console.error('GetRollbackTime error:', err);
      return { status: 'error', data: null, message: err?.message || 'Network error' };
    }
  },

  /**
   * Set automatic rollback time via N8n (crontab format)
   * @param time - Rollback time in HH:MM format (24-hour)
   * @returns Promise with result of setting rollback time
   */
  SetRollbackTime: async (time: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/${I001_TAB3}/SetRollbackTime`, { time }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (err: any) {
      console.error('SetRollbackTime error:', err);
      return { status: 'error', data: null, message: err?.message || 'Network error' };
    }
  },

  /**
   * Get cron setting from database (rollback time)
   * Endpoint: GET /api/cron-setting
   * @returns Promise with cron configuration array [{ id, cron, user_updated, updated_at }]
   */
  GetCronSetting: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cron-setting`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      let cronList = [];
      if (response.data?.value && Array.isArray(response.data.value)) {
        cronList = response.data.value;
      } else if (Array.isArray(response.data)) {
        cronList = response.data;
      }
      
      if (cronList.length > 0) {
        const sortedList = cronList.sort((a: any, b: any) => {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
        
        const latestSetting = sortedList[0];
        
        return {
          status: 'success',
          data: {
            cron_expression: latestSetting.cron,
            description: `Updated by ${latestSetting.user_updated}`,
            last_updated: latestSetting.updated_at
          }
        };
      }
      
      return {
        status: 'success',
        data: {
          cron_expression: '0 2 * * *',
          description: 'Default rollback time'
        }
      };
    } catch (error: any) {
      return {
        status: 'error',
        data: {
          cron_expression: '0 2 * * *',
          description: 'Default fallback time'
        },
        message: error?.message || 'Failed to fetch cron setting'
      };
    }
  },

  /**
   * Update cron setting in database (rollback time)
   * Endpoint: POST /api/cron-setting
   * @param time - Rollback time in HH:MM format (24-hour)
   * @returns Promise with result { status, message }
   */
  UpdateCronSetting: async (time: string) => {
    try {
      if (!time || !time.includes(':')) {
        throw new Error('Invalid time format. Expected HH:MM');
      }
      
      const [hours, minutes] = time.split(':');
      
      if (!hours || !minutes || isNaN(parseInt(hours)) || isNaN(parseInt(minutes))) {
        throw new Error('Invalid time values');
      }
      
      const cronExpression = `${minutes} ${hours} * * *`;
      
      const response = await axios.post(`${API_BASE_URL}/api/cron-setting`, {
        cron: cronExpression,
        user_updated: 'web_user'
      }, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return {
        status: 'success',
        message: response.data.message || 'Cron setting updated successfully',
        data: response.data
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.response?.data?.message || error?.message || 'Failed to update cron setting'
      };
    }
  }
}

export default Tab3Service

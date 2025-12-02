import request from "helpers/request"

/**
 * Tab3Service - API service for Tab 3: Admin Work - IPT Monitoring Management
 * Handles all API calls related to managing IPT monitoring points and system settings
 */
const I001_TAB3 = "I001_TAB3";

const Tab3Service = {
  /**
   * Get list of all current IPT monitoring points
   * @returns Promise with monitoring items
   */
  GetIPTMonitoringList: async () => {
    let res: any = await request({
      url: `/${I001_TAB3}/GetIPTMonitoringList`,
      method: 'get'
    });
    return res
  },

  /**
   * Add new IPT monitoring point via N8n
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
    let res: any = await request({
      url: `/${I001_TAB3}/AddIPTMonitoring`,
      method: 'post',
      data: {
        device,
        interface: interfaceName,
        partner,
        capacity,
        prtgId
      }
    });
    return res
  },

  /**
   * Get current trigger alarm threshold
   * @returns Promise with current alarm percentage
   */
  GetTriggerAlarmLevel: async () => {
    let res: any = await request({
      url: `/${I001_TAB3}/GetTriggerAlarmLevel`,
      method: 'get'
    });
    return res
  },

  /**
   * Set trigger alarm threshold via N8n
   * @param alarmLevel - Alarm threshold percentage (70-100)
   * @returns Promise with result of setting alarm
   */
  SetTriggerAlarmLevel: async (alarmLevel: number) => {
    let res: any = await request({
      url: `/${I001_TAB3}/SetTriggerAlarmLevel`,
      method: 'post',
      data: {
        alarmLevel
      }
    });
    return res
  },

  /**
   * Get current automatic rollback time
   * @returns Promise with current rollback time (HH:MM format)
   */
  GetRollbackTime: async () => {
    let res: any = await request({
      url: `/${I001_TAB3}/GetRollbackTime`,
      method: 'get'
    });
    return res
  },

  /**
   * Set automatic rollback time via N8n (crontab format)
   * @param time - Rollback time in HH:MM format (24-hour)
   * @returns Promise with result of setting rollback time
   */
  SetRollbackTime: async (time: string) => {
    let res: any = await request({
      url: `/${I001_TAB3}/SetRollbackTime`,
      method: 'post',
      data: {
        time
      }
    });
    return res
  }
}

export default Tab3Service

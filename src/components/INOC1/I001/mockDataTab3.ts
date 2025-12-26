// Mock data for Tab 3 - Admin Work IPT Management

export interface IPTMonitoringItem {
  id: number;
  stt: number;
  device: string;
  interface: string;
  partner: string;
  prtgId: string;
  capacity: string;
  dayAdded: string;
}

export const mockIPTMonitoringData: IPTMonitoringItem[] = [
  {
    id: 1,
    stt: 1,
    device: 'HKG-POP01',
    interface: 'ge-0/0/0',
    partner: 'GTT',
    prtgId: 'PRTG-001',
    capacity: '100 Gbps',
    dayAdded: '2024-01-15'
  },
  {
    id: 2,
    stt: 2,
    device: 'HKG-POP02',
    interface: 'ge-0/0/1',
    partner: 'Zenlayer',
    prtgId: 'PRTG-002',
    capacity: '50 Gbps',
    dayAdded: '2024-01-16'
  },
  {
    id: 3,
    stt: 3,
    device: 'SPG-POP01',
    interface: 'ge-0/0/0',
    partner: 'Equinix',
    prtgId: 'PRTG-003',
    capacity: '75 Gbps',
    dayAdded: '2024-01-17'
  },
  {
    id: 4,
    stt: 4,
    device: 'HCM-ASBR2',
    interface: 'et0',
    partner: 'NTT',
    prtgId: 'PRTG-004',
    capacity: '60 Gbps',
    dayAdded: '2024-01-18'
  }
];

// Device list for counter configuration
export const DEVICES_LIST = [
  'HKG-EQX-POP01', 'HKG-EQX-POP02',
  'HKG-MEGA-POP01', 'HKG-MEGA-POP02',
  'SGP-EQX-POP01', 'SGP-GLS-POP01'
];

export const TRIGGER_ALARM_OPTIONS = [40, 50, 70, 75, 80, 85, 90, 95, 100];

export const DEFAULT_TRIGGER_ALARM = 80; // Default trigger alarm level
export const DEFAULT_ROLLBACK_TIME = '02:00'; // Default rollback time (24-hour format)

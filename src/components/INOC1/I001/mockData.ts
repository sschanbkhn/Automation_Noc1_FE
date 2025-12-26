// ============================================
// Utility Functions for Date/Time Formatting
// ============================================

/**
 * Format date based on specified format string
 * Supports: 'HH:mm' and 'HH:mm:ss DD/MM/YYYY' formats
 */
const formatTime = (date: Date, format: string): string => {
  const pad = (n: number) => String(n).padStart(2, '0');

  if (format === 'HH:mm') {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  if (format === 'HH:mm:ss DD/MM/YYYY') {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  }

  return '';
};

/**
 * Subtract minutes from a date
 * @param date - Source date
 * @param minutes - Number of minutes to subtract
 */
const subtractMinutes = (date: Date, minutes: number): Date => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() - minutes);
  return result;
};

// ============================================
// Chart Data Generation
// ============================================

/**
 * Generate mock line chart data with 3 metrics: throughput, capacity, efficiency
 * Simulates 96 data points with 15-minute intervals (24 hours of data)
 * Each data point includes: time, throughput (Gbps), capacity (Gbps), efficiency (%)
 */
const generateChartData = () => {
  const now = new Date();
  const data = [];

  // Generate data for last 24 hours (96 points × 15min = 24 hours)
  for (let i = 95; i >= 0; i--) {
    const time = subtractMinutes(now, i * 15);
    const timeStr = formatTime(time, 'HH:mm');

    // Fixed traffic pattern for fallback mock data (use real API data when available)
    // Base throughput: ~80 Gbps
    // Capacity: ~110 Gbps  
    // Efficiency: throughput/capacity percentage
    const baseThrough = 75 + (i % 10) * 2; // Varies between 75-95 Gbps
    const baseCapa = 110;
    const efficiency = (baseThrough / baseCapa) * 100;

    data.push({
      time: timeStr,
      throughput: parseFloat(baseThrough.toFixed(2)),
      capacity: parseFloat(baseCapa.toFixed(2)),
      efficiency: parseFloat(efficiency.toFixed(2))
    });
  }

  return data;
};

export const mockChartData = generateChartData();

// ============================================
// ASN Counter Data
// ============================================

/**
 * Mock data for ASNs currently being countered
 * Each ASN includes: ID, STT, ASN number, AS Name, PRTG Group ID, and list of prefixes being countered
 */
export const mockASNData = [
  {
    id: 1,
    stt: 1,
    asn: 'AS64512',
    asName: 'TECHNET-AS',
    prtgId: 'Group1',
    prefixes: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '203.0.113.0/24']
  },
  {
    id: 2,
    stt: 2,
    asn: 'AS64513',
    asName: 'DATACENTRE-AS',
    prtgId: 'Group2',
    prefixes: ['198.51.100.0/24', '203.0.113.0/24']
  },
  {
    id: 3,
    stt: 3,
    asn: 'AS64514',
    asName: 'CLOUD-AS',
    prtgId: 'Group3',
    prefixes: ['198.18.0.0/15', '198.20.0.0/14']
  },
  {
    id: 4,
    stt: 4,
    asn: 'AS64515',
    asName: 'NETWORK-AS',
    prtgId: 'Group4',
    prefixes: ['192.0.2.0/24']
  },
  {
    id: 5,
    stt: 5,
    asn: 'AS64516',
    asName: 'TRANSIT-AS',
    prtgId: 'Group5',
    prefixes: ['203.0.113.0/24', '198.51.100.0/24']
  }
];

// ============================================
// Warning/Alert Data
// ============================================

/**
 * Mock data for last warning
 * Shows timestamp of last alert with affected ASN, bandwidth, and recommended firewall configuration
 */
export const mockWarningData = {
  lastWarningTime: formatTime(subtractMinutes(new Date(), 5), 'HH:mm:ss DD/MM/YYYY'),
  message: '5 phút trước',
  asn: 'AS-54113',
  bandwidth: '29 Gbps',
  recommendation: 'set firewall filter Protect-VN2-from-Upstream-Transit term Policer-AS-54113 then policer 29g'
};

// ============================================
// API Monitor Status Data
// ============================================

/**
 * Mock data for API/Performance monitoring
 * status >= threshold (80%) triggers alert with red color and flashing animation
 */
export const mockApiMonitorData = {
  status: 80.6, // Triggers alert condition (>= 80%)
  threshold: 80, // Alert threshold percentage
  timestamp: formatTime(new Date(), 'HH:mm'),
  note: 'Hiệu suất cao'
};

// ============================================
// Last Policer Applied Data
// ============================================

/**
 * Mock data for last policer configuration applied
 * Shows timestamp of most recent policer application with ASN/Bandwidth and device count
 * Includes detailed device list with application status for each device
 */
export const mockLastPolicerData = {
  lastPolicerTime: formatTime(subtractMinutes(new Date(), 45), 'HH:mm:ss DD/MM/YYYY'),
  asn: 'AS-64512',
  bandwidth: '95.5 Gbps',
  deviceCount: 6,
  status: 'Thành công',
  // Detailed configuration information
  configCommand: 'set firewall filter Protect-VN2-from-Upstream-Transit term Policer-AS-64512 then policer 95g',
  timeSinceExecution: '15 phút trước',
  // Device application statistics
  devicesApplied: 5,
  totalDevices: 6,
  successRate: 83,
  // List of devices with their application status
  devices: [
    { name: 'SPG-POP01', status: 'Applied', statusColor: '#10b981' },
    { name: 'SPG-POP02', status: 'Applied', statusColor: '#10b981' },
    { name: 'HKG-POP01', status: 'Applied', statusColor: '#10b981' },
    { name: 'HKG-EQX-POP01', status: 'Applied', statusColor: '#10b981' },
    { name: 'SGP-GLS-POP01', status: 'Applied', statusColor: '#10b981' },
    { name: 'BKK-MEGA-POP01', status: 'Pending', statusColor: '#f59e0b' }
  ]
};

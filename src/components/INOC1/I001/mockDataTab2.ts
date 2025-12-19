// Extended mock data for Tab 2 - Top 20 ASN Statistics

export interface PrefixData {
  prefix: string;
  maxIn: string;
  maxOut: string;
  isCountered?: boolean;
}

export interface ASNTab2Data {
  id: number;
  stt: number;
  asn: string;
  asName: string;
  maxIn: string;
  maxOut: string;
  prefixes: PrefixData[];
}

export const mockTab2ASNData: ASNTab2Data[] = [
  {
    id: 1,
    stt: 1,
    asn: 'AS64512',
    asName: 'TECHNET-AS',
    maxIn: '95.5 Gbps',
    maxOut: '87.3 Gbps',
    prefixes: [
      { prefix: '10.0.0.0/8', maxIn: '50.2 Gbps', maxOut: '45.1 Gbps', isCountered: true },
      { prefix: '172.16.0.0/12', maxIn: '30.1 Gbps', maxOut: '25.8 Gbps', isCountered: false },
      { prefix: '192.168.0.0/16', maxIn: '15.2 Gbps', maxOut: '16.4 Gbps', isCountered: false },
      { prefix: '203.0.113.0/24', maxIn: '8.5 Gbps', maxOut: '12.3 Gbps', isCountered: false }
    ]
  },
  {
    id: 2,
    stt: 2,
    asn: 'AS64513',
    asName: 'DATACENTRE-AS',
    maxIn: '78.2 Gbps',
    maxOut: '72.1 Gbps',
    prefixes: [
      { prefix: '198.51.100.0/24', maxIn: '45.0 Gbps', maxOut: '40.5 Gbps', isCountered: false },
      { prefix: '203.0.113.0/24', maxIn: '33.2 Gbps', maxOut: '31.6 Gbps', isCountered: false }
    ]
  },
  {
    id: 3,
    stt: 3,
    asn: 'AS64514',
    asName: 'CLOUD-PROVIDER',
    maxIn: '120.5 Gbps',
    maxOut: '115.0 Gbps',
    prefixes: [
      { prefix: '198.18.0.0/15', maxIn: '78.3 Gbps', maxOut: '72.5 Gbps', isCountered: true },
      { prefix: '198.20.0.0/14', maxIn: '42.2 Gbps', maxOut: '42.5 Gbps', isCountered: false }
    ]
  },
  {
    id: 4,
    stt: 4,
    asn: 'AS64515',
    asName: 'ISP-NETWORK',
    maxIn: '65.3 Gbps',
    maxOut: '60.2 Gbps',
    prefixes: [
      { prefix: '192.0.2.0/24', maxIn: '65.3 Gbps', maxOut: '60.2 Gbps', isCountered: false }
    ]
  },
  {
    id: 5,
    stt: 5,
    asn: 'AS64516',
    asName: 'TRANSIT-AS',
    maxIn: '82.5 Gbps',
    maxOut: '76.3 Gbps',
    prefixes: [
      { prefix: '198.51.100.0/25', maxIn: '42.0 Gbps', maxOut: '38.5 Gbps', isCountered: false },
      { prefix: '198.51.101.0/25', maxIn: '40.5 Gbps', maxOut: '37.8 Gbps', isCountered: false }
    ]
  },
  {
    id: 6,
    stt: 6,
    asn: 'AS64517',
    asName: 'INFRA-AS',
    maxIn: '71.7 Gbps',
    maxOut: '68.5 Gbps',
    prefixes: [
      { prefix: '192.168.1.0/24', maxIn: '35.8 Gbps', maxOut: '34.2 Gbps', isCountered: false },
      { prefix: '192.168.2.0/24', maxIn: '35.9 Gbps', maxOut: '34.3 Gbps', isCountered: false }
    ]
  },
  {
    id: 7,
    stt: 7,
    asn: 'AS64518',
    asName: 'CONTENT-NET',
    maxIn: '95.2 Gbps',
    maxOut: '88.7 Gbps',
    prefixes: [
      { prefix: '203.0.113.0/25', maxIn: '47.6 Gbps', maxOut: '44.3 Gbps', isCountered: true },
      { prefix: '203.0.114.0/25', maxIn: '47.6 Gbps', maxOut: '44.4 Gbps', isCountered: false }
    ]
  },
  {
    id: 8,
    stt: 8,
    asn: 'AS64519',
    asName: 'ONLINE-CORP',
    maxIn: '58.9 Gbps',
    maxOut: '55.2 Gbps',
    prefixes: [
      { prefix: '198.51.200.0/24', maxIn: '58.9 Gbps', maxOut: '55.2 Gbps', isCountered: false }
    ]
  },
  {
    id: 9,
    stt: 9,
    asn: 'AS64520',
    asName: 'CLOUD-SVC',
    maxIn: '72.3 Gbps',
    maxOut: '68.1 Gbps',
    prefixes: [
      { prefix: '198.51.201.0/24', maxIn: '36.1 Gbps', maxOut: '34.0 Gbps', isCountered: false },
      { prefix: '198.51.202.0/24', maxIn: '36.2 Gbps', maxOut: '34.1 Gbps', isCountered: false }
    ]
  },
  {
    id: 10,
    stt: 10,
    asn: 'AS64521',
    asName: 'GLOBAL-NET',
    maxIn: '85.6 Gbps',
    maxOut: '79.8 Gbps',
    prefixes: [
      { prefix: '192.0.2.128/25', maxIn: '42.8 Gbps', maxOut: '39.9 Gbps', isCountered: false },
      { prefix: '192.0.3.0/25', maxIn: '42.8 Gbps', maxOut: '39.9 Gbps', isCountered: false }
    ]
  },
  {
    id: 11,
    stt: 11,
    asn: 'AS64522',
    asName: 'MEDIA-GROUP',
    maxIn: '63.4 Gbps',
    maxOut: '59.5 Gbps',
    prefixes: [
      { prefix: '203.0.113.128/25', maxIn: '63.4 Gbps', maxOut: '59.5 Gbps', isCountered: false }
    ]
  },
  {
    id: 12,
    stt: 12,
    asn: 'AS64523',
    asName: 'DIGITAL-PLUS',
    maxIn: '74.8 Gbps',
    maxOut: '70.2 Gbps',
    prefixes: [
      { prefix: '198.51.203.0/24', maxIn: '37.4 Gbps', maxOut: '35.1 Gbps', isCountered: false },
      { prefix: '198.51.204.0/24', maxIn: '37.4 Gbps', maxOut: '35.1 Gbps', isCountered: false }
    ]
  },
  {
    id: 13,
    stt: 13,
    asn: 'AS64524',
    asName: 'ENTERPRISE-NET',
    maxIn: '51.2 Gbps',
    maxOut: '48.7 Gbps',
    prefixes: [
      { prefix: '192.168.10.0/24', maxIn: '51.2 Gbps', maxOut: '48.7 Gbps', isCountered: false }
    ]
  },
  {
    id: 14,
    stt: 14,
    asn: 'AS64525',
    asName: 'TECH-PARTNER',
    maxIn: '68.5 Gbps',
    maxOut: '64.3 Gbps',
    prefixes: [
      { prefix: '198.51.205.0/25', maxIn: '34.2 Gbps', maxOut: '32.1 Gbps', isCountered: false },
      { prefix: '198.51.205.128/25', maxIn: '34.3 Gbps', maxOut: '32.2 Gbps', isCountered: false }
    ]
  },
  {
    id: 15,
    stt: 15,
    asn: 'AS64526',
    asName: 'MOBILE-SVC',
    maxIn: '79.3 Gbps',
    maxOut: '74.5 Gbps',
    prefixes: [
      { prefix: '192.0.2.0/26', maxIn: '39.6 Gbps', maxOut: '37.2 Gbps', isCountered: false },
      { prefix: '192.0.2.64/26', maxIn: '39.7 Gbps', maxOut: '37.3 Gbps', isCountered: false }
    ]
  },
  {
    id: 16,
    stt: 16,
    asn: 'AS64527',
    asName: 'DATA-SYNC',
    maxIn: '55.8 Gbps',
    maxOut: '52.4 Gbps',
    prefixes: [
      { prefix: '203.0.115.0/24', maxIn: '55.8 Gbps', maxOut: '52.4 Gbps', isCountered: false }
    ]
  },
  {
    id: 17,
    stt: 17,
    asn: 'AS64528',
    asName: 'SECURE-NET',
    maxIn: '69.7 Gbps',
    maxOut: '65.8 Gbps',
    prefixes: [
      { prefix: '198.51.206.0/24', maxIn: '69.7 Gbps', maxOut: '65.8 Gbps', isCountered: false }
    ]
  },
  {
    id: 18,
    stt: 18,
    asn: 'AS64529',
    asName: 'FIBER-LINK',
    maxIn: '81.4 Gbps',
    maxOut: '76.8 Gbps',
    prefixes: [
      { prefix: '192.168.20.0/25', maxIn: '40.7 Gbps', maxOut: '38.4 Gbps', isCountered: false },
      { prefix: '192.168.20.128/25', maxIn: '40.7 Gbps', maxOut: '38.4 Gbps', isCountered: false }
    ]
  },
  {
    id: 19,
    stt: 19,
    asn: 'AS64530',
    asName: 'SMART-LINK',
    maxIn: '62.5 Gbps',
    maxOut: '58.9 Gbps',
    prefixes: [
      { prefix: '203.0.116.0/24', maxIn: '62.5 Gbps', maxOut: '58.9 Gbps', isCountered: false }
    ]
  },
  {
    id: 20,
    stt: 20,
    asn: 'AS64531',
    asName: 'CLOUD-EDGE',
    maxIn: '76.3 Gbps',
    maxOut: '71.5 Gbps',
    prefixes: [
      { prefix: '198.51.207.0/25', maxIn: '38.1 Gbps', maxOut: '35.7 Gbps', isCountered: false },
      { prefix: '198.51.207.128/25', maxIn: '38.2 Gbps', maxOut: '35.8 Gbps', isCountered: false }
    ]
  }
];

// Device list for counter configuration
export const DEVICES_LIST = [
  'HKG-EQX-POP01', 'HKG-EQX-POP02',
  'HKG-MEGA-POP01', 'HKG-MEGA-POP02',
  'SGP-EQX-POP01', 'SGP-GLS-POP01'
];

// PRTG-ID Group list
export const PRTG_GROUPS = [
  { id: 1, name: 'Group1' },
  { id: 2, name: 'Group2' },
  { id: 3, name: 'Group3' },
  { id: 4, name: 'Group4' },
  { id: 5, name: 'Group5' },
  { id: 6, name: 'Group6' },
  { id: 7, name: 'Group7' },
  { id: 8, name: 'Group8' },
  { id: 9, name: 'Group9' },
  { id: 10, name: 'Group10' }
];

// ASN Growth Data Interface
export interface ASNGrowthData {
  stt: number;
  asn: string;
  asName: string;
  maxIn: string;
  growthPercent: number;
  date: string;
}

// Mock ASN Growth Data for different time periods
export const generateASNGrowthData = (period: 'week' | 'month' = 'week'): ASNGrowthData[] => {
  const baseData = [
    { asn: 'AS64512', asName: 'TECHNET-AS', maxIn: '95.5 Gbps' },
    { asn: 'AS64513', asName: 'DATACENTRE-AS', maxIn: '78.2 Gbps' },
    { asn: 'AS64514', asName: 'CLOUD-PROVIDER', maxIn: '120.5 Gbps' },
    { asn: 'AS64515', asName: 'ISP-NETWORK', maxIn: '65.3 Gbps' },
    { asn: 'AS64516', asName: 'TRANSIT-AS', maxIn: '82.5 Gbps' },
    { asn: 'AS64517', asName: 'INFRA-AS', maxIn: '71.7 Gbps' },
    { asn: 'AS64518', asName: 'CONTENT-NET', maxIn: '95.2 Gbps' },
    { asn: 'AS64519', asName: 'ONLINE-CORP', maxIn: '58.9 Gbps' },
    { asn: 'AS64520', asName: 'CLOUD-SVC', maxIn: '72.3 Gbps' },
    { asn: 'AS64521', asName: 'GLOBAL-NET', maxIn: '85.6 Gbps' },
    { asn: 'AS64522', asName: 'MEDIA-GROUP', maxIn: '63.4 Gbps' },
    { asn: 'AS64523', asName: 'DIGITAL-PLUS', maxIn: '74.8 Gbps' },
    { asn: 'AS64524', asName: 'ENTERPRISE-NET', maxIn: '51.2 Gbps' },
    { asn: 'AS64525', asName: 'TECH-PARTNER', maxIn: '68.5 Gbps' },
    { asn: 'AS64526', asName: 'MOBILE-SVC', maxIn: '79.3 Gbps' },
    { asn: 'AS64527', asName: 'DATA-SYNC', maxIn: '55.8 Gbps' },
    { asn: 'AS64528', asName: 'SECURE-NET', maxIn: '69.7 Gbps' },
    { asn: 'AS64529', asName: 'FIBER-LINK', maxIn: '81.4 Gbps' },
    { asn: 'AS64530', asName: 'SMART-LINK', maxIn: '62.5 Gbps' },
    { asn: 'AS64531', asName: 'CLOUD-EDGE', maxIn: '76.3 Gbps' }
  ];

  return baseData.map((item, idx) => {
    // Fixed growth percentage until API is ready - replace with real data from backend
    const growthPercent = period === 'week'
      ? 25  // Fixed 25% for weekly
      : 15; // Fixed 15% for monthly

    return {
      stt: idx + 1,
      asn: item.asn,
      asName: item.asName,
      maxIn: item.maxIn,
      growthPercent,
      date: new Date().toISOString().split('T')[0]
    };
  });
};

// Export pre-generated data for monthly and weekly
export const mockASNGrowthWeekly = generateASNGrowthData('week');
export const mockASNGrowthMonthly = generateASNGrowthData('month');

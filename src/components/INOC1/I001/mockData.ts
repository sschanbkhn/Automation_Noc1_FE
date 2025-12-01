// Utility function to format date
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

// Utility function to subtract minutes from a date
const subtractMinutes = (date: Date, minutes: number): Date => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() - minutes);
  return result;
};

// Generate time series data for the last 24 hours
const generateChartData = () => {
  const now = new Date();
  const data = [];

  for (let i = 95; i >= 0; i--) {
    const time = subtractMinutes(now, i * 15);
    const timeStr = formatTime(time, 'HH:mm');

    // Simulate realistic throughput values
    const baseThrough = 60 + Math.random() * 40;
    const baseCapa = baseThrough + 20 + Math.random() * 20;
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

export const mockASNData = [
  {
    id: 1,
    stt: 1,
    asn: 'AS64512',
    asName: 'TECHNET-AS',
    maxIn: '95.5 Gbps',
    maxOut: '87.3 Gbps',
    prefixes: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '203.0.113.0/24']
  },
  {
    id: 2,
    stt: 2,
    asn: 'AS64513',
    asName: 'DATACENTRE-AS',
    maxIn: '78.2 Gbps',
    maxOut: '72.1 Gbps',
    prefixes: ['198.51.100.0/24', '203.0.113.0/24']
  },
  {
    id: 3,
    stt: 3,
    asn: 'AS64514',
    asName: 'CLOUD-PROVIDER',
    maxIn: '120.5 Gbps',
    maxOut: '115.0 Gbps',
    prefixes: ['198.18.0.0/15', '198.20.0.0/14']
  },
  {
    id: 4,
    stt: 4,
    asn: 'AS64515',
    asName: 'ISP-NETWORK',
    maxIn: '65.3 Gbps',
    maxOut: '60.2 Gbps',
    prefixes: ['192.0.2.0/24']
  }
];

export const mockWarningData = {
  lastWarningTime: formatTime(subtractMinutes(new Date(), 5), 'HH:mm:ss DD/MM/YYYY'),
  message: '5 phút trước',
  asn: 'AS-54113',
  bandwidth: '29 Gbps',
  recommendation: 'set firewall filter Protect-VN2-from-Upstream-Transit term Policer-AS-54113 then policer 29g'
};

export const mockApiMonitorData = {
  status: 80.6, // Will trigger alert at >= 80%
  threshold: 80,
  timestamp: formatTime(new Date(), 'HH:mm'),
  note: 'Hiệu suất cao'
};

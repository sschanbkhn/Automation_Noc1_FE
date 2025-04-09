export const switches: { id: string; name: string; lat: number; lon: number }[] = [
  { id: "SW001", name: "Core Switch", lat: 10.7769, lon: 106.7000 },
  { id: "SW002", name: "Access Switch 1", lat: 10.7792, lon: 106.7015 },
  { id: "SW003", name: "Access Switch 2", lat: 10.7781, lon: 106.7028 },
  { id: "SW004", name: "Distribution Switch 1", lat: 10.7800, lon: 106.7035 },
  { id: "SW005", name: "Distribution Switch 2", lat: 10.7790, lon: 106.7050 },
  { id: "SW006", name: "Access Switch 3", lat: 10.7812, lon: 106.7045 },
  { id: "SW007", name: "Access Switch 4", lat: 10.7785, lon: 106.7005 },
  { id: "SW008", name: "Core Switch Backup", lat: 10.7778, lon: 106.7020 },
  { id: "SW009", name: "Access Switch 5", lat: 10.7805, lon: 106.7002 },
  { id: "SW010", name: "Access Switch 6", lat: 10.7820, lon: 106.7030 },
];

export const connections: {
  source: string;
  target: string;
  sourcePort: string;
  targetPort: string;
}[] = [
  { source: "SW001", target: "SW002", sourcePort: "1", targetPort: "4" },
  { source: "SW001", target: "SW003", sourcePort: "2", targetPort: "6" },
  { source: "SW001", target: "SW004", sourcePort: "3", targetPort: "2" },
  { source: "SW001", target: "SW008", sourcePort: "4", targetPort: "1" },
  { source: "SW004", target: "SW005", sourcePort: "1", targetPort: "8" },
  { source: "SW004", target: "SW006", sourcePort: "2", targetPort: "5" },
  { source: "SW002", target: "SW007", sourcePort: "10", targetPort: "3" },
  { source: "SW003", target: "SW009", sourcePort: "7", targetPort: "9" },
  { source: "SW005", target: "SW010", sourcePort: "8", targetPort: "1" },
  { source: "SW006", target: "SW010", sourcePort: "6", targetPort: "2" },
  { source: "SW002", target: "SW003", sourcePort: "11", targetPort: "3" },
  { source: "SW009", target: "SW008", sourcePort: "4", targetPort: "6" },
  { source: "SW007", target: "SW010", sourcePort: "2", targetPort: "7" },
  { source: "SW008", target: "SW005", sourcePort: "3", targetPort: "10" },
];

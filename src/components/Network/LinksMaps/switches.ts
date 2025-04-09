export interface Switch {
    id: string;
    name: string;
    lat: number;
    lon: number;
    active: boolean; // Trạng thái hoạt động
  }
  
  export const switches: Switch[] = [
    { id: "SW001", name: "Core Switch", lat: 10.7769, lon: 106.7000, active: true },
    { id: "SW002", name: "Access Switch 1", lat: 10.7792, lon: 106.7015, active: false },
    { id: "SW003", name: "Access Switch 2", lat: 10.7781, lon: 106.7028, active: true },
    { id: "SW004", name: "Distribution Switch 1", lat: 10.7800, lon: 106.7035, active: true },
    { id: "SW005", name: "Distribution Switch 2", lat: 10.7790, lon: 106.7050, active: false },
    { id: "SW006", name: "Access Switch 3", lat: 10.7812, lon: 106.7045, active: true },
    { id: "SW007", name: "Access Switch 4", lat: 10.7785, lon: 106.7005, active: false },
    { id: "SW008", name: "Core Switch Backup", lat: 10.7778, lon: 106.7020, active: true },
    { id: "SW009", name: "Access Switch 5", lat: 10.7805, lon: 106.7002, active: true },
    { id: "SW010", name: "Access Switch 6", lat: 10.7820, lon: 106.7030, active: false },
    { id: "SW011", name: "Access Switch 7", lat: 10.7830, lon: 106.7060, active: true },
    { id: "SW012", name: "Distribution Switch 3", lat: 10.7840, lon: 106.7045, active: true },
    { id: "SW013", name: "Access Switch 8", lat: 10.7780, lon: 106.7090, active: true },
    { id: "SW014", name: "Distribution Switch 4", lat: 10.7750, lon: 106.7075, active: false },
    { id: "SW015", name: "Access Switch 9", lat: 10.7760, lon: 106.7100, active: true },
  ];
  
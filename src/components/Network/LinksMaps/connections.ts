export interface Connection {
    distance: number;
    source: string;
    target: string;
    sourcePort: string;
    targetPort: string;
    type: "Cáp ngầm" | "Cáp treo"; // Loại cáp
  }
  export const connections: Connection[] = [
    {
      source: "SW001",
      target: "SW002",
      sourcePort: "1",
      targetPort: "4",
      distance: 0,
      type: "Cáp ngầm",
    },
    {
      source: "SW001",
      target: "SW003",
      sourcePort: "2",
      targetPort: "6",
      distance: 0,
      type: "Cáp treo",
    },
    {
      source: "SW001",
      target: "SW004",
      sourcePort: "3",
      targetPort: "2",
      distance: 0,
      type: "Cáp ngầm",
    },
    {
      source: "SW004",
      target: "SW005",
      sourcePort: "1",
      targetPort: "8",
      distance: 0,
      type: "Cáp treo",
    },
    {
      source: "SW002",
      target: "SW007",
      sourcePort: "10",
      targetPort: "3",
      distance: 0,
      type: "Cáp ngầm",
    },
    {
      source: "SW003",
      target: "SW006",
      sourcePort: "5",
      targetPort: "4",
      distance: 0,
      type: "Cáp treo",
    },
    {
      source: "SW004",
      target: "SW009",
      sourcePort: "2",
      targetPort: "7",
      distance: 0,
      type: "Cáp ngầm",
    },
    {
      source: "SW006",
      target: "SW010",
      sourcePort: "6",
      targetPort: "3",
      distance: 0,
      type: "Cáp treo",
    },
    {
      source: "SW008",
      target: "SW012",
      sourcePort: "1",
      targetPort: "2",
      distance: 0,
      type: "Cáp ngầm",
    },
    {
      source: "SW009",
      target: "SW013",
      sourcePort: "3",
      targetPort: "5",
      distance: 0,
      type: "Cáp treo",
    },
    {
      source: "SW011",
      target: "SW014",
      sourcePort: "2",
      targetPort: "4",
      distance: 0,
      type: "Cáp ngầm",
    },
    {
      source: "SW012",
      target: "SW015",
      sourcePort: "3",
      targetPort: "6",
      distance: 0,
      type: "Cáp treo",
    },
    {
      source: "SW007",
      target: "SW005",
      sourcePort: "7",
      targetPort: "8",
      distance: 0,
      type: "Cáp ngầm",
    },
  ];
  
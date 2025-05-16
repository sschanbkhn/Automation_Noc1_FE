export const centerData = {
    summary: { total: 120, success: 100, failed: 10, running: 10 },
    byField: [
      { field: "Truyền dẫn", total: 40, success: 35, failed: 3, running: 2 },
      { field: "Vô tuyến", total: 30, success: 25, failed: 2, running: 3 },
      { field: "IP", total: 25, success: 20, failed: 3, running: 2 },
      { field: "Tổng đài", total: 25, success: 20, failed: 2, running: 3 }
    ],
    byRoom: [
      { room: "Phòng A", total: 30, success: 25, failed: 3, running: 2 },
      { room: "Phòng B", total: 30, success: 28, failed: 1, running: 1 },
      { room: "Phòng C", total: 30, success: 27, failed: 2, running: 1 },
      { room: "Phòng D", total: 30, success: 20, failed: 4, running: 6 }
    ],
    trend: [
      { hour: "00", count: 2 },
      { hour: "01", count: 3 },
      { hour: "02", count: 5 },
      { hour: "03", count: 8 },
      { hour: "04", count: 10 },
      { hour: "05", count: 12 },
      { hour: "06", count: 15 },
      { hour: "07", count: 20 },
      { hour: "08", count: 25 },
      { hour: "09", count: 20 }
    ]
  };
  
  export const roomData = {
    room: "Phòng RNOC",
    date: "2024-06-01",
    processes: [
      {
        name: "Backup DB",
        status: "success",
        start: "2024-06-01T01:00:00",
        end: "2024-06-01T01:10:00",
        duration: 600,
        error: ""
      },
      {
        name: "Sync Data",
        status: "failed",
        start: "2024-06-01T02:00:00",
        end: "2024-06-01T02:05:00",
        duration: 300,
        error: "Timeout"
      },
      {
        name: "Update Firmware",
        status: "running",
        start: "2024-06-01T03:00:00",
        end: "",
        duration: 0,
        error: ""
      }
    ],
    history: [
      { date: "2024-05-31", success: 10, failed: 2 },
      { date: "2024-05-30", success: 12, failed: 1 },
      { date: "2024-05-29", success: 11, failed: 3 }
    ]
  };
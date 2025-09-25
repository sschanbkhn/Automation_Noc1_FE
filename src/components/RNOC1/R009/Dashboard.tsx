import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Card from 'components/common/Card';

import CtrlButton from 'components/common/CtrlButton';
import CtrlSelect from 'components/common/CtrlSelect';
import { CtrlNotification } from 'components/common';
import RnocR009Service from 'services/RnocR009Service';
import { downloadFile } from 'helpers/downloadHelper';
import dailyBtsSummary from './daily_bts_summary.json';
import provincialSummary from './provincial_summary.json';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, ComposedChart, Legend } from 'recharts';

interface DashboardData {
  totalSites: number;
  totalCells: number;
  vendorBreakdown: {
    Huawei: number;
    Nokia: number;
    ZTE: number;
    Ericsson: number;
  };
  technologyBreakdown: {
    '4G': number;
    '5G': number;
  };
  bandBreakdown: {
    '900MHz': number;
    '1800MHz': number;
    '2100MHz': number;
    '2600MHz': number;
  };
  dailyTrend: Array<{
    date: string;
    sites: number;
    cells: number;
    huaweiCells: number;
    nokiaCells: number;
    zteCells: number;
    ericssonCells: number;
    huaweiSites: number;
    nokiaSites: number;
    zteSites: number;
    ericssonSites: number;
  }>;
  detailedData: {
    huawei4G: any[];
    nokia4G: any[];
    nokia5G: any[];
  };
  vendorSummary: Array<{
    vendor: string;
    technology: string;
    sites: number;
    cells: number;
    status: string;
    coverage_area: string;
    last_updated: string;
  }>;
  performanceMetrics: {
    average_uptime: number;
    average_throughput: number;
    active_connections: number;
    data_usage_gb: number;
  };
  provincialData: Array<{
    province: string;
    nokia_sites: number;
    huawei_sites: number;
    total_4g_cells: number;
    moran_cells: number;
    iot_cells: number;
    band_900: number;
    band_1800: number;
    band_2100: number;
    band_2600: number;
    config_4t4r: number;
    config_2t4r: number;
    config_2t2r: number;
    config_1t2r: number;
    config_1t1r: number;
    // Thêm các cấu hình antenna đầy đủ
    config_8t8r: number;
    config_4t8r: number;
    config_2t8r: number;
    config_1t8r: number;
    config_8t4r: number;
    config_4t2r: number;
    config_2t1r: number;
    config_1t1r_siso: number;
    config_mimo_2x2: number;
    config_mimo_4x4: number;
    config_mimo_8x8: number;
    // 5G specific fields
    nokia5GSites?: number;
    total5GCells?: number;
    chbw100Mhz?: number;
    chbw80Mhz?: number;
    chbw60Mhz?: number;
    chbw40Mhz?: number;
    chbw20Mhz?: number;
    txRx4812?: number;
    txRx328?: number;
    // 4G specific fields
    huawei_4g_cells?: number;
    nokia_4g_cells?: number;
  }>;
  provincialTotals: {
    nokia_sites: number;
    huawei_sites: number;
    zte_sites?: number;
    ericsson_sites?: number;
    total_4g_cells: number;
    moran_cells: number;
    iot_cells: number;
    band_900: number;
    band_1800: number;
    band_2100: number;
    band_2600: number;
    config_4t4r: number;
    config_2t4r: number;
    config_2t2r: number;
    config_1t2r: number;
    config_1t1r: number;
    // Thêm các cấu hình antenna đầy đủ
    config_8t8r: number;
    config_4t8r: number;
    config_2t8r: number;
    config_1t8r: number;
    config_8t4r: number;
    config_4t2r: number;
    config_2t1r: number;
    config_1t1r_siso: number;
    config_mimo_2x2: number;
    config_mimo_4x4: number;
    config_mimo_8x8: number;
    // 5G specific fields
    nokia5GSites?: number;
    total5GCells?: number;
    chbw100Mhz?: number;
    chbw80Mhz?: number;
    chbw60Mhz?: number;
    chbw40Mhz?: number;
    chbw20Mhz?: number;
    txRx4812?: number;
    txRx328?: number;
    // 4G specific fields
    huawei_4g_cells?: number;
    nokia_4g_cells?: number;
    zte_4g_cells?: number;
    ericsson_4g_cells?: number;
  };
}

const VENDOR_COLORS = {
  Huawei: "#f59e0b",
  Nokia: "#ef4444", 
  Ericsson: "#3b82f6"
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTechnology, setSelectedTechnology] = useState<string>('4G');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Technology options for dropdown - only 4G and 5G
  const technologyOptions = [
    { value: "4G", label: "4G" },
    { value: "5G", label: "5G" }
  ];
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSites: 0,
    totalCells: 0,
    vendorBreakdown: { Huawei: 0, Nokia: 0, ZTE: 0, Ericsson: 0 },
    technologyBreakdown: { '4G': 0, '5G': 0 },
    bandBreakdown: { '900MHz': 0, '1800MHz': 0, '2100MHz': 0, '2600MHz': 0 },
    dailyTrend: [
      { date: '2025-08-15', sites: 35678, cells: 127890, huaweiCells: 45000, nokiaCells: 55000, zteCells: 18890, ericssonCells: 9000, huaweiSites: 12000, nokiaSites: 15000, zteSites: 5678, ericssonSites: 3000 },
      { date: '2025-08-16', sites: 35685, cells: 127923, huaweiCells: 45010, nokiaCells: 55015, zteCells: 18898, ericssonCells: 9000, huaweiSites: 12002, nokiaSites: 15003, zteSites: 5680, ericssonSites: 3000 },
      { date: '2025-08-17', sites: 35690, cells: 127945, huaweiCells: 45020, nokiaCells: 55020, zteCells: 18905, ericssonCells: 9000, huaweiSites: 12003, nokiaSites: 15004, zteSites: 5683, ericssonSites: 3000 },
      { date: '2025-08-18', sites: 35688, cells: 127938, huaweiCells: 45015, nokiaCells: 55018, zteCells: 18905, ericssonCells: 9000, huaweiSites: 12002, nokiaSites: 15003, zteSites: 5683, ericssonSites: 3000 },
      { date: '2025-08-19', sites: 35695, cells: 127956, huaweiCells: 45025, nokiaCells: 55025, zteCells: 18906, ericssonCells: 9000, huaweiSites: 12005, nokiaSites: 15005, zteSites: 5685, ericssonSites: 3000 },
      { date: '2025-08-20', sites: 35701, cells: 127974, huaweiCells: 45030, nokiaCells: 55030, zteCells: 18914, ericssonCells: 9000, huaweiSites: 12007, nokiaSites: 15007, zteSites: 5687, ericssonSites: 3000 },
      { date: '2025-08-21', sites: 35704, cells: 127981, huaweiCells: 45035, nokiaCells: 55035, zteCells: 18911, ericssonCells: 9000, huaweiSites: 12008, nokiaSites: 15008, zteSites: 5688, ericssonSites: 3000 },
    ],
    detailedData: {
      huawei4G: [],
      nokia4G: [],
      nokia5G: []
    },
    vendorSummary: [],
    performanceMetrics: {
      average_uptime: 0,
      average_throughput: 0,
      active_connections: 0,
      data_usage_gb: 0
    },
    provincialData: [], // Đảm bảo khi khởi tạo là mảng rỗng, không có object thiếu trường
    provincialTotals: {
      nokia_sites: 0,
      huawei_sites: 0,
      zte_sites: 0,
      ericsson_sites: 0,
      total_4g_cells: 0,
      moran_cells: 0,
      iot_cells: 0,
      band_900: 0,
      band_1800: 0,
      band_2100: 0,
      band_2600: 0,
      config_4t4r: 0,
      config_2t4r: 0,
      config_2t2r: 0,
      config_1t2r: 0,
      config_1t1r: 0,
      config_8t8r: 0,
      config_4t8r: 0,
      config_2t8r: 0,
      config_1t8r: 0,
      config_8t4r: 0,
      config_4t2r: 0,
      config_2t1r: 0,
      config_1t1r_siso: 0,
      config_mimo_2x2: 0,
      config_mimo_4x4: 0,
      config_mimo_8x8: 0,
      // 5G specific fields
      total5GCells: 0,
      chbw100Mhz: 0,
      chbw80Mhz: 0,
      chbw60Mhz: 0,
      chbw40Mhz: 0,
      chbw20Mhz: 0,
      txRx4812: 0,
      txRx328: 0,
      // 4G specific fields
      huawei_4g_cells: 0,
      nokia_4g_cells: 0,
      zte_4g_cells: 0,
      ericsson_4g_cells: 0
    }
  });




  const refNotification = useRef<any>();

  // Sort function
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Export to Excel function
  const handleExportToExcel = useCallback(async () => {
    try {
      if (!dashboardData.provincialData || dashboardData.provincialData.length === 0) {
        refNotification.current?.showNotification("warning", "Không có dữ liệu để xuất");
        return;
      }

      // Create CSV content with UTF-8 BOM for proper Vietnamese character encoding
      let csvContent = '\uFEFF'; // UTF-8 BOM
      
      if (selectedTechnology === '4G') {
        // 4G Headers
        csvContent += 'Tỉnh/Thành Phố,Nokia Sites,Huawei Sites,Tổng 4G Cells,Huawei 4G Cells,Nokia 4G Cells,Moran Cells,IoT Cells,Band 900,Band 1800,Band 2100,4T4R,2T4R,2T2R,1T2R,1T1R\n';
        
        // 4G Data rows
        dashboardData.provincialData.forEach((item: any) => {
          csvContent += `"${item.province}",${item.nokia_sites},${item.huawei_sites},${item.total_4g_cells},${item.huawei_4g_cells || 0},${item.nokia_4g_cells || 0},${item.moran_cells},${item.iot_cells},${item.band_900},${item.band_1800},${item.band_2100},${item.config_4t4r},${item.config_2t4r},${item.config_2t2r},${item.config_1t2r},${item.config_1t1r}\n`;
        });
        
        // 4G Totals row
        csvContent += `"TỔNG CỘNG",${dashboardData.provincialTotals.nokia_sites},${dashboardData.provincialTotals.huawei_sites},${dashboardData.provincialTotals.total_4g_cells},${dashboardData.provincialTotals.huawei_4g_cells || 0},${dashboardData.provincialTotals.nokia_4g_cells || 0},${dashboardData.provincialTotals.moran_cells},${dashboardData.provincialTotals.iot_cells},${dashboardData.provincialTotals.band_900},${dashboardData.provincialTotals.band_1800},${dashboardData.provincialTotals.band_2100},${dashboardData.provincialTotals.config_4t4r},${dashboardData.provincialTotals.config_2t4r},${dashboardData.provincialTotals.config_2t2r},${dashboardData.provincialTotals.config_1t2r},${dashboardData.provincialTotals.config_1t1r}\n`;
      } else if (selectedTechnology === '5G') {
        // 5G Headers
        csvContent += 'Tỉnh/Thành Phố,Nokia 5G Sites,Tổng 5G Cells,CHBW 100MHz,CHBW 80MHz,CHBW 60MHz,CHBW 40MHz,CHBW 20MHz,TxRx 4x8 1x2,TxRx 3x2 8\n';
        
        // 5G Data rows
        dashboardData.provincialData.forEach((item: any) => {
          csvContent += `"${item.province}",${item.nokia5GSites || 0},${item.total5GCells || 0},${item.chbw100Mhz || 0},${item.chbw80Mhz || 0},${item.chbw60Mhz || 0},${item.chbw40Mhz || 0},${item.chbw20Mhz || 0},${item.txRx4812 || 0},${item.txRx328 || 0}\n`;
        });
        
        // 5G Totals row
        csvContent += `"TỔNG CỘNG",${dashboardData.provincialTotals.nokia5GSites || 0},${dashboardData.provincialTotals.total5GCells || 0},${dashboardData.provincialTotals.chbw100Mhz || 0},${dashboardData.provincialTotals.chbw80Mhz || 0},${dashboardData.provincialTotals.chbw60Mhz || 0},${dashboardData.provincialTotals.chbw40Mhz || 0},${dashboardData.provincialTotals.chbw20Mhz || 0},${dashboardData.provincialTotals.txRx4812 || 0},${dashboardData.provincialTotals.txRx328 || 0}\n`;
      }

      // Generate filename with date and technology
      const currentDate = new Date().toISOString().split('T')[0];
      const fileName = `Bao_Cao_Theo_Tinh_Thanh_Pho_${selectedTechnology}_${currentDate}.csv`;

      // Download the file with proper UTF-8 encoding
      await downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
      
      refNotification.current?.showNotification("success", `Đã xuất dữ liệu ${selectedTechnology} thành công`);
    } catch (error) {
      console.error('Export error:', error);
      refNotification.current?.showNotification("error", "Lỗi khi xuất dữ liệu");
    }
  }, [dashboardData.provincialData, dashboardData.provincialTotals, selectedTechnology]);

  // Sorted data
  const sortedProvincialData = useMemo(() => {
    if (!sortConfig) return dashboardData.provincialData;

    return [...dashboardData.provincialData].sort((a: any, b: any) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [dashboardData.provincialData, sortConfig]);

  // Generate 7 days array from selected date
  const generateLast7Days = (selectedDate: string) => {
    const endDate = new Date(selectedDate);
    const dates = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(endDate.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  // Load 7 days trend data
  const load7DaysTrendData = useCallback(async (selectedDate: string, technology: string) => {
    const dates = generateLast7Days(selectedDate);
    const trendData = [];
    
    try {
      for (const date of dates) {
        let dayResponse: any;
        
        if (technology === '4G') {
          dayResponse = await RnocR009Service.GetDashboard4GData(date);
        } else if (technology === '5G') {
          dayResponse = await RnocR009Service.GetDashboard5GData(date);
        }
        
        // Check if response has Data property
        if (dayResponse && dayResponse.Data) {
          dayResponse = dayResponse.Data;
        }
        
        // Extract total cells from response or use demo data
        let totalCells = 0;
        let totalSites = 0;
        let huaweiCells = 0, nokiaCells = 0, zteCells = 0, ericssonCells = 0;
        let huaweiSites = 0, nokiaSites = 0, zteSites = 0, ericssonSites = 0;
        
        if (dayResponse && dayResponse.provincialTotals) {
          totalCells = technology === '4G' 
            ? (dayResponse.provincialTotals.total_4g_cells || 0)
            : (dayResponse.provincialTotals.total5GCells || 0);
          totalSites = (dayResponse.provincialTotals.nokia_sites || 0) + (dayResponse.provincialTotals.huawei_sites || 0) + 
                      (dayResponse.provincialTotals.zte_sites || 0) + (dayResponse.provincialTotals.ericsson_sites || 0);
          
          // Vendor breakdown from response
          huaweiCells = dayResponse.provincialTotals.huawei_4g_cells || 0;
          nokiaCells = dayResponse.provincialTotals.nokia_4g_cells || 0;
          zteCells = dayResponse.provincialTotals.zte_4g_cells || 0;
          ericssonCells = dayResponse.provincialTotals.ericsson_4g_cells || 0;
          
          huaweiSites = dayResponse.provincialTotals.huawei_sites || 0;
          nokiaSites = dayResponse.provincialTotals.nokia_sites || 0;
          zteSites = dayResponse.provincialTotals.zte_sites || 0;
          ericssonSites = dayResponse.provincialTotals.ericsson_sites || 0;
        } else {
          // Demo data với slight variations và vendor breakdown
          const baseDate = new Date(date);
          const dayIndex = dates.indexOf(date);
          totalCells = technology === '4G' ? 127890 + (dayIndex * 15) + Math.floor(Math.random() * 10) : 48500 + (dayIndex * 8) + Math.floor(Math.random() * 5);
          totalSites = 35678 + (dayIndex * 3) + Math.floor(Math.random() * 3);
          
          // Demo vendor breakdown
          if (technology === '4G') {
            huaweiCells = 45000 + (dayIndex * 5);
            nokiaCells = 55000 + (dayIndex * 8);
            zteCells = 18890 + (dayIndex * 1);
            ericssonCells = 9000 + (dayIndex * 1);
            
            huaweiSites = 12000 + (dayIndex * 2);
            nokiaSites = 15000 + (dayIndex * 1);
            zteSites = 5678 + (dayIndex * 1);
            ericssonSites = 3000;
          }
        }
        
        trendData.push({
          date: date,
          sites: totalSites,
          cells: totalCells,
          huaweiCells: huaweiCells,
          nokiaCells: nokiaCells,
          zteCells: zteCells,
          ericssonCells: ericssonCells,
          huaweiSites: huaweiSites,
          nokiaSites: nokiaSites,
          zteSites: zteSites,
          ericssonSites: ericssonSites
        });
      }
    } catch (error) {
      console.error('Error loading 7 days trend data:', error);
      // Fallback to demo data with vendor breakdown
      dates.forEach((date, index) => {
        trendData.push({
          date: date,
          sites: 35678 + (index * 3),
          cells: selectedTechnology === '4G' ? 127890 + (index * 15) : 48500 + (index * 8),
          huaweiCells: selectedTechnology === '4G' ? 45000 + (index * 5) : 0,
          nokiaCells: selectedTechnology === '4G' ? 55000 + (index * 8) : 48500 + (index * 8),
          zteCells: selectedTechnology === '4G' ? 18890 + (index * 1) : 0,
          ericssonCells: selectedTechnology === '4G' ? 9000 + (index * 1) : 0,
          huaweiSites: selectedTechnology === '4G' ? 12000 + (index * 2) : 0,
          nokiaSites: selectedTechnology === '4G' ? 15000 + (index * 1) : 35678 + (index * 3),
          zteSites: selectedTechnology === '4G' ? 5678 + (index * 1) : 0,
          ericssonSites: selectedTechnology === '4G' ? 3000 : 0
        });
      });
    }
    
    return trendData;
  }, [selectedTechnology]); // Thêm selectedTechnology vào dependencies

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!selectedDate) {
      refNotification.current?.showNotification("warning", "Vui lòng chọn ngày");
      return;
    }

    setIsLoading(true);
    try {
      // Use selected date
      const formattedDate = selectedDate;
      
      //console.log('=== DATE DEBUG ===');
      //console.log('Selected date:', formattedDate);
      //console.log('=== END DATE DEBUG ===');

      // Load 7 days trend data
      const trendData = await load7DaysTrendData(selectedDate, selectedTechnology);

      let dashboardResponse: any;

      // Load data based on selected technology
      if (selectedTechnology === '4G') {
        dashboardResponse = await RnocR009Service.GetDashboard4GData(formattedDate);
      } else if (selectedTechnology === '5G') {
        dashboardResponse = await RnocR009Service.GetDashboard5GData(formattedDate);
      } else {
        throw new Error('Công nghệ không hợp lệ');
      }

      // Debug logging
      //console.log('Dashboard Response:', dashboardResponse);
      //console.log('Response type:', typeof dashboardResponse);
      //console.log('Response keys:', dashboardResponse ? Object.keys(dashboardResponse) : 'null');

      // Check if response has Data property (API response structure)
      if (dashboardResponse && dashboardResponse.Data) {
        dashboardResponse = dashboardResponse.Data;
        //console.log('Using dashboardResponse.Data');
      }

      // If no data from API, create demo data for testing
      if (!dashboardResponse || Object.keys(dashboardResponse).length === 0) {
        //console.log('No data from API, creating demo data');
        if (selectedTechnology === '4G') {
          dashboardResponse = {
            totalSites: 1500,
            totalCells: 4500,
            vendorBreakdown: {
              Huawei: 800,
              Nokia: 600,
              ZTE: 300,
              Ericsson: 100
            },
            technologyBreakdown: {
              G4: 4500,
              G5: 0
            },
            bandBreakdown: {
              Band900MHz: 1200,
              Band1800MHz: 1800,
              Band2100MHz: 1500,
              Band2600MHz: 0
            },
            dailyTrend: [
              { date: '2025-08-15', sites: 1450, cells: 4350 },
              { date: '2025-08-16', sites: 1455, cells: 4365 },
              { date: '2025-08-17', sites: 1460, cells: 4380 },
              { date: '2025-08-18', sites: 1458, cells: 4374 },
              { date: '2025-08-19', sites: 1463, cells: 4389 },
              { date: '2025-08-20', sites: 1467, cells: 4401 },
              { date: '2025-08-21', sites: 1470, cells: 4410 },
            ],
            provincialData: [
              {
                province: 'Hà Nội',
                nokiaSites: 120,
                huaweiSites: 150,
                total4GCells: 400,
                moranCells: 50,
                iotCells: 30,
                band900: 100,
                band1800: 150,
                band2100: 150,
                config4T4R: 200,
                config2T4R: 150,
                config2T2R: 50,
                config1T2R: 0,
                config1T1R: 0,
                config8T8R: 0,
                config4T8R: 0,
                config2T8R: 0,
                config1T8R: 0,
                config8T4R: 0,
                config4T2R: 0,
                config2T1R: 0,
                config1T1R_siso: 0,
                configMimo_2x2: 0,
                configMimo_4x4: 0,
                configMimo_8x8: 0,
                // 4G specific fields
                huawei_4g_cells: 0,
                nokia_4g_cells: 0
              }
            ],
            provincialTotals: {
              nokia_sites: 600,
              huawei_sit: 800,
              total_4g_cells: 4500,
              moran_cells: 500,
              iot_cells: 300,
              band_900: 1200,
              band_1800: 1800,
              band_2100: 1500,
              config_4t4r: 2000,
              config_2t4r: 1500,
              config_2t2r: 500,
              config_1t2r: 300,
              config_1t1r: 200,
              config_8t8r: 0,
              config_4t8r: 0,
              config_2t8r: 0,
              config_1t8r: 0,
              config_8t4r: 0,
              config_4t2r: 0,
              config_2t1r: 0,
              config_1t1r_siso: 0,
              config_mimo_2x2: 0,
              config_mimo_4x4: 0,
              config_mimo_8x8: 0,
              // 5G specific fields
              total5GCells: 0,
              chbw100Mhz: 0,
              chbw80Mhz: 0,
              chbw60Mhz: 0,
              chbw40Mhz: 0,
              chbw20Mhz: 0,
              txRx4812: 0,
              txRx328: 0,
              // 4G specific fields
              huawei_4g_cells: 1800,
              nokia_4g_cells: 2200,
              zte_4g_cells: 350,
              ericsson_4g_cells: 150
            }
          };
        } else if (selectedTechnology === '5G') {
          dashboardResponse = {
            totalSites: 500,
            totalCells: 1500,
            vendorBreakdown: {
              Nokia: 500,
              ZTE: 100
            },
            technologyBreakdown: {
              G5: 1500
            },
            bandBreakdown: {
              Chbw100Mhz: 300,
              Chbw80Mhz: 400,
              Chbw60Mhz: 500,
              Chbw40Mhz: 200,
              Chbw20Mhz: 100
            },
            provincialData: [
              {
                province: 'Hà Nội',
                nokia5GSites: 80,
                total5GCells: 240,
                chbw100Mhz: 50,
                chbw80Mhz: 60,
                chbw60Mhz: 80,
                chbw40Mhz: 30,
                chbw20Mhz: 20,
                txRx4812: 100,
                txRx328: 140,
                config8T8R: 0,
                config4T8R: 0,
                config2T8R: 0,
                config1T8R: 0,
                config8T4R: 0,
                config4T2R: 0,
                config2T1R: 0,
                config1T1R_siso: 0,
                configMimo_2x2: 0,
                configMimo_4x4: 0,
                configMimo_8x8: 0,
                // 4G specific fields
                huawei_4g_cells: 0,
                nokia_4g_cells: 0
              }
            ],
            provincialTotals: {
              nokia5GSites: 500,
              total5GCells: 1500,
              chbw100Mhz: 300,
              chbw80Mhz: 400,
              chbw60Mhz: 500,
              chbw40Mhz: 200,
              chbw20Mhz: 100,
              txRx4812: 750,
              txRx328: 750,
              config8T8R: 0,
              config4T8R: 0,
              config2T8R: 0,
              config1T8R: 0,
              config8T4R: 0,
              config4T2R: 0,
              config2T1R: 0,
              config1T1R_siso: 0,
              configMimo_2x2: 0,
              configMimo_4x4: 0,
              configMimo_8x8: 0,
              // 4G specific fields
              huawei_4g_cells: 0,
              nokia_4g_cells: 0
            }
          };
        }
      }

      // Set dashboard data based on technology
      if (selectedTechnology === '4G') {
        //console.log('Dashboard API Response:', dashboardResponse);
        //console.log('ZTE4GCells:', dashboardResponse?.ProvincialTotals?.ZTE4GCells);
        //console.log('Ericsson4GCells:', dashboardResponse?.ProvincialTotals?.Ericsson4GCells);
        //console.log('Huawei4GCells:', dashboardResponse?.ProvincialTotals?.Huawei4GCells);
        //console.log('Nokia4GCells:', dashboardResponse?.ProvincialTotals?.Nokia4GCells);
        
        const cellsData = {
          huawei: dashboardResponse?.ProvincialTotals?.Huawei4GCells || 0,
          nokia: dashboardResponse?.ProvincialTotals?.Nokia4GCells || 0,
          zte: dashboardResponse?.ProvincialTotals?.ZTE4GCells || 0,
          ericsson: dashboardResponse?.ProvincialTotals?.Ericsson4GCells || 0
        };
        //console.log('Cells Data for Chart:', cellsData);
        
        setDashboardData({
          totalSites: dashboardResponse?.TotalSites || 0,
          totalCells: dashboardResponse?.TotalCells || 0,
          vendorBreakdown: {
            Huawei: dashboardResponse?.VendorBreakdown?.Huawei || 0,
            Nokia: dashboardResponse?.VendorBreakdown?.Nokia || 0,
            ZTE: dashboardResponse?.VendorBreakdown?.ZTE || 0,
            Ericsson: dashboardResponse?.VendorBreakdown?.Ericsson || 0
          },
          technologyBreakdown: {
            '4G': dashboardResponse?.TechnologyBreakdown?.G4 || 0,
            '5G': dashboardResponse?.TechnologyBreakdown?.G5 || 0
          },
          bandBreakdown: {
            '900MHz': dashboardResponse?.BandBreakdown?.Band900MHz || 0,
            '1800MHz': dashboardResponse?.BandBreakdown?.Band1800MHz || 0,
            '2100MHz': dashboardResponse?.BandBreakdown?.Band2100MHz || 0,
            '2600MHz': dashboardResponse?.BandBreakdown?.Band2600MHz || 0
          },
          dailyTrend: trendData,
          detailedData: {
            huawei4G: [],
            nokia4G: [],
            nokia5G: []
          },
          vendorSummary: [],
          performanceMetrics: {
            average_uptime: 0,
            average_throughput: 0,
            active_connections: 0,
            data_usage_gb: 0
          },
          provincialData: dashboardResponse?.ProvincialData?.map((item: any) => ({
            province: item.Province,
            nokia_sites: item.NokiaSites || 0,
            huawei_sites: item.HuaweiSites || 0,
            total_4g_cells: item.Total4GCells || 0,
            moran_cells: item.MoranCells || 0,
            iot_cells: item.IoTCells || 0,
            band_900: item.Band900 || 0,
            band_1800: item.Band1800 || 0,
            band_2100: item.Band2100 || 0,
            band_2600: item.Band2600 || 0,
            config_4t4r: item.Config4T4R || 0,
            config_2t4r: item.Config2T4R || 0,
            config_2t2r: item.Config2T2R || 0,
            config_1t2r: item.Config1T2R || 0,
            config_1t1r: item.Config1T1R || 0,
            config_8t8r: item.Config8T8R || 0,
            config_4t8r: item.Config4T8R || 0,
            config_2t8r: item.Config2T8R || 0,
            config_1t8r: item.Config1T8R || 0,
            config_8t4r: item.Config8T4R || 0,
            config_4t2r: item.Config4T2R || 0,
            config_2t1r: item.Config2T1R || 0,
            config_1t1r_siso: item.Config1T1R_siso || 0,
            config_mimo_2x2: item.ConfigMimo_2x2 || 0,
            config_mimo_4x4: item.ConfigMimo_4x4 || 0,
            config_mimo_8x8: item.ConfigMimo_8x8 || 0,
            // 4G specific fields
            huawei_4g_cells: item.Huawei4GCells || 0,
            nokia_4g_cells: item.Nokia4GCells || 0
          })) || [],
          provincialTotals: {
            nokia_sites: dashboardResponse?.ProvincialTotals?.NokiaSites || 0,
            huawei_sites: dashboardResponse?.ProvincialTotals?.HuaweiSites || 0,
            zte_sites: dashboardResponse?.ProvincialTotals?.ZTESites || 0,
            ericsson_sites: dashboardResponse?.ProvincialTotals?.EricssonSites || 0,
            total_4g_cells: dashboardResponse?.ProvincialTotals?.Total4GCells || 0,
            moran_cells: dashboardResponse?.ProvincialTotals?.MoranCells || 0,
            iot_cells: dashboardResponse?.ProvincialTotals?.IoTCells || 0,
            band_900: dashboardResponse?.ProvincialTotals?.Band900 || 0,
            band_1800: dashboardResponse?.ProvincialTotals?.Band1800 || 0,
            band_2100: dashboardResponse?.ProvincialTotals?.Band2100 || 0,
            band_2600: dashboardResponse?.ProvincialTotals?.Band2600 || 0,
            config_4t4r: dashboardResponse?.ProvincialTotals?.Config4T4R || 0,
            config_2t4r: dashboardResponse?.ProvincialTotals?.Config2T4R || 0,
            config_2t2r: dashboardResponse?.ProvincialTotals?.Config2T2R || 0,
            config_1t2r: dashboardResponse?.ProvincialTotals?.Config1T2R || 0,
            config_1t1r: dashboardResponse?.ProvincialTotals?.Config1T1R || 0,
            config_8t8r: dashboardResponse?.ProvincialTotals?.Config8T8R || 0,
            config_4t8r: dashboardResponse?.ProvincialTotals?.Config4T8R || 0,
            config_2t8r: dashboardResponse?.ProvincialTotals?.Config2T8R || 0,
            config_1t8r: dashboardResponse?.ProvincialTotals?.Config1T8R || 0,
            config_8t4r: dashboardResponse?.ProvincialTotals?.Config8T4R || 0,
            config_4t2r: dashboardResponse?.ProvincialTotals?.Config4T2R || 0,
            config_2t1r: dashboardResponse?.ProvincialTotals?.Config2T1R || 0,
            config_1t1r_siso: dashboardResponse?.ProvincialTotals?.Config1T1R_siso || 0,
            config_mimo_2x2: dashboardResponse?.ProvincialTotals?.ConfigMimo_2x2 || 0,
            config_mimo_4x4: dashboardResponse?.ProvincialTotals?.ConfigMimo_4x4 || 0,
            config_mimo_8x8: dashboardResponse?.ProvincialTotals?.ConfigMimo_8x8 || 0,
            // 4G specific fields
            huawei_4g_cells: dashboardResponse?.ProvincialTotals?.Huawei4GCells || 0,
            nokia_4g_cells: dashboardResponse?.ProvincialTotals?.Nokia4GCells || 0,
            zte_4g_cells: dashboardResponse?.ProvincialTotals?.ZTE4GCells || 0,
            ericsson_4g_cells: dashboardResponse?.ProvincialTotals?.Ericsson4GCells || 0
          }
        });
      } else if (selectedTechnology === '5G') {
        setDashboardData({
          totalSites: dashboardResponse?.TotalSites || 0,
          totalCells: dashboardResponse?.TotalCells || 0,
          vendorBreakdown: {
            Huawei: dashboardResponse?.VendorBreakdown?.Huawei || 0,
            Nokia: dashboardResponse?.VendorBreakdown?.Nokia || 0,
            ZTE: dashboardResponse?.VendorBreakdown?.ZTE || 0,
            Ericsson: dashboardResponse?.VendorBreakdown?.Ericsson || 0
          },
          technologyBreakdown: {
            '4G': dashboardResponse?.TechnologyBreakdown?.G4 || 0,
            '5G': dashboardResponse?.TechnologyBreakdown?.G5 || 0
          },
          bandBreakdown: {
            '900MHz': dashboardResponse?.BandBreakdown?.Chbw100Mhz || 0,
            '1800MHz': dashboardResponse?.BandBreakdown?.Chbw80Mhz || 0,
            '2100MHz': dashboardResponse?.BandBreakdown?.Chbw60Mhz || 0,
            '2600MHz': dashboardResponse?.BandBreakdown?.Chbw40Mhz || 0
          },
          dailyTrend: trendData,
          detailedData: {
            huawei4G: [],
            nokia4G: [],
            nokia5G: []
          },
          vendorSummary: [],
          performanceMetrics: {
            average_uptime: 0,
            average_throughput: 0,
            active_connections: 0,
            data_usage_gb: 0
          },
          provincialData: dashboardResponse?.ProvincialData?.map((item: any) => ({
            province: item.Province,
            nokia_sites: item.Nokia5GSites || 0,
            nokia5GSites: item.Nokia5GSites || 0,
            huawei_sites: 0,
            total_4g_cells: item.Total5GCells || 0,
            moran_cells: 0,
            iot_cells: 0,
            band_900: 0,
            band_1800: 0,
            band_2100: 0,
            band_2600: 0,
            config_4t4r: 0,
            config_2t4r: 0,
            config_2t2r: 0,
            config_1t2r: 0,
            config_1t1r: 0,
            config_8t8r: 0,
            config_4t8r: 0,
            config_2t8r: 0,
            config_1t8r: 0,
            config_8t4r: 0,
            config_4t2r: 0,
            config_2t1r: 0,
            config_1t1r_siso: 0,
            config_mimo_2x2: 0,
            config_mimo_4x4: 0,
            config_mimo_8x8: 0,
            // 5G specific fields
            total5GCells: item.Total5GCells || 0,
            chbw100Mhz: item.Chbw100Mhz || 0,
            chbw80Mhz: item.Chbw80Mhz || 0,
            chbw60Mhz: item.Chbw60Mhz || 0,
            chbw40Mhz: item.Chbw40Mhz || 0,
            chbw20Mhz: item.Chbw20Mhz || 0,
            txRx4812: item.TxRx4812 || 0,
            txRx328: item.TxRx328 || 0,
            // 4G specific fields (set to 0 for 5G)
            huawei_4g_cells: 0,
            nokia_4g_cells: 0
          })) || [],
          provincialTotals: {
            nokia_sites: dashboardResponse?.ProvincialTotals?.Nokia5GSites || 0,
            nokia5GSites: dashboardResponse?.ProvincialTotals?.Nokia5GSites || 0,
            huawei_sites: 0,
            zte_sites: 0,
            ericsson_sites: 0,
            total_4g_cells: dashboardResponse?.ProvincialTotals?.Total5GCells || 0,
            moran_cells: 0,
            iot_cells: 0,
            band_900: 0,
            band_1800: 0,
            band_2100: 0,
            band_2600: 0,
            config_4t4r: 0,
            config_2t4r: 0,
            config_2t2r: 0,
            config_1t2r: 0,
            config_1t1r: 0,
            config_8t8r: 0,
            config_4t8r: 0,
            config_2t8r: 0,
            config_1t8r: 0,
            config_8t4r: 0,
            config_4t2r: 0,
            config_2t1r: 0,
            config_1t1r_siso: 0,
            config_mimo_2x2: 0,
            config_mimo_4x4: 0,
            config_mimo_8x8: 0,
            // 5G specific fields
            total5GCells: dashboardResponse?.ProvincialTotals?.Total5GCells || 0,
            chbw100Mhz: dashboardResponse?.ProvincialTotals?.Chbw100Mhz || 0,
            chbw80Mhz: dashboardResponse?.ProvincialTotals?.Chbw80Mhz || 0,
            chbw60Mhz: dashboardResponse?.ProvincialTotals?.Chbw60Mhz || 0,
            chbw40Mhz: dashboardResponse?.ProvincialTotals?.Chbw40Mhz || 0,
            chbw20Mhz: dashboardResponse?.ProvincialTotals?.Chbw20Mhz || 0,
            txRx4812: dashboardResponse?.ProvincialTotals?.TxRx4812 || 0,
            txRx328: dashboardResponse?.ProvincialTotals?.TxRx328 || 0,
            // 4G specific fields
            huawei_4g_cells: dashboardResponse?.ProvincialTotals?.Huawei4GCells || 0,
            nokia_4g_cells: dashboardResponse?.ProvincialTotals?.Nokia4GCells || 0,
            zte_4g_cells: dashboardResponse?.ProvincialTotals?.ZTE4GCells || 0,
            ericsson_4g_cells: dashboardResponse?.ProvincialTotals?.Ericsson4GCells || 0
          }
        });
      }

      refNotification.current?.showNotification("success", "Tải dữ liệu dashboard thành công!");

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      refNotification.current?.showNotification("error", "Lỗi khi tải dữ liệu dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, selectedTechnology, load7DaysTrendData]);



  // Removed auto-load on mount - only load when user clicks "Thực hiện" button

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) {
      return (
        <span style={{ 
          marginLeft: '8px', 
          opacity: 0.5,
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontSize: '10px',
          lineHeight: '1'
        }}>
          <span style={{ color: 'white', fontSize: '8px' }}>▲</span>
          <span style={{ color: 'white', fontSize: '8px' }}>▼</span>
        </span>
      );
    }
    return sortConfig.direction === 'asc' ? 
      (
        <span style={{ 
          marginLeft: '8px', 
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontSize: '10px',
          lineHeight: '1'
        }}>
          <span style={{ color: '#ffc107', fontSize: '10px', fontWeight: 'bold' }}>▲</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '8px' }}>▼</span>
        </span>
      ) :
      (
        <span style={{ 
          marginLeft: '8px', 
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontSize: '10px',
          lineHeight: '1'
        }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '8px' }}>▲</span>
          <span style={{ color: '#ffc107', fontSize: '10px', fontWeight: 'bold' }}>▼</span>
        </span>
      );
  };

  const StatCard = ({ title, value, icon, color, description }: any) => (
    <div className={`col-md-3 mb-4`}>
      <div className={`card ${color} h-100`} style={{
        background: icon.bg === 'bg-gradient-primary' ? 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)' :
                    icon.bg === 'bg-gradient-success' ? 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)' :
                    icon.bg === 'bg-gradient-info' ? 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)' :
                    icon.bg === 'bg-gradient-danger' ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' :
                    'linear-gradient(135deg, #6c757d 0%, #545b62 100%)',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      }}>
        <div className="card-body text-white">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="card-title text-white-75 mb-1">{title}</h6>
              <h3 className="font-weight-bold mb-0 text-white">{value}</h3>
              {description && <small className="text-white-50">{description}</small>}
            </div>
            <div className="p-3 rounded" style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <i className={`${icon.class} ${icon.color}`}></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <CtrlNotification ref={refNotification} />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(3px)'
          }}
        >
          <div className="text-center">
            <div 
              className="spinner-border text-primary mb-3" 
              role="status" 
              style={{ width: '4rem', height: '4rem' }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <div>
              <h5 className="text-primary">Đang tải dữ liệu...</h5>
              <p className="text-muted">Vui lòng chờ trong giây lát</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center p-4 rounded" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <div className="d-flex align-items-center">
                <div className="p-3 rounded-circle me-3" style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <i className="fas fa-tower-broadcast fa-2x text-white"></i>
                </div>
                <div>
                  <h2 className="mb-0 text-white">Dashboard Tổng Quan Config Vô Tuyến</h2>
                  <small className="text-white-75">Thống kê và phân tích dữ liệu BTS</small>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center">
                  <label className="font-semibold me-2">Ngày:</label>
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={e => setSelectedDate(e.target.value)} 
                    className="border rounded px-2 py-1" 
                  />
                </div>
                <div className="d-flex align-items-center">
                  <CtrlSelect
                    value={selectedTechnology}
                    onChange={(value: any) => setSelectedTechnology(value)}
                    placeholder="Chọn Công nghệ"
                    options={technologyOptions}
                  />
                </div>
                <CtrlButton
                  title={isLoading ? "Đang tải..." : "Thực hiện"}
                  icon={isLoading ? "fas fa-spinner fa-spin" : "fas fa-search"}
                  onClick={loadDashboardData}
                  isDisabled={isLoading}
                  type="primary"
                />
                <CtrlButton
                  title="Làm mới"
                  icon="fas fa-sync-alt"
                  onClick={loadDashboardData}
                  isDisabled={isLoading}
                  type="success"
                />
              </div>
            </div>
          </div>
        </div>

                 {/* Compact Layout: Statistics + Band + MIMO (Left) + Vendor Distribution (Right) */}
         <div className="row mb-3">
           {/* Left Side: Statistics + Band Distribution + MIMO Config */}
           <div className="col-lg-6">
             {/* Statistics Cards */}
             <div className="row mb-2">
               <div className="col-md-6 mb-2">
                 <div className="card border-0 shadow-sm h-100" style={{
                   background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                   transition: 'all 0.3s ease'
                 }}>
                   <div className="card-body text-white p-2">
                     <div className="d-flex justify-content-between align-items-center">
                       <div>
                         <h6 className="card-title text-white-75 mb-1 fs-6">Tổng Sites</h6>
                         <h3 className="font-weight-bold mb-0 text-white">
                          47.975
                           {/* {((dashboardData.provincialTotals.nokia_sites || 0) + 
                             (dashboardData.provincialTotals.huawei_sites || 0) +
                             (dashboardData.provincialTotals.zte_sites || 0) +
                             (dashboardData.provincialTotals.ericsson_sites || 0)).toLocaleString()} */}
                         </h3>
                       </div>
                       <div className="p-2 rounded" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                         <i className="fas fa-broadcast-tower text-white"></i>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
               
               <div className="col-md-6 mb-2">
                 <div className="card border-0 shadow-sm h-100" style={{
                   background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                   transition: 'all 0.3s ease'
                 }}>
                   <div className="card-body text-white p-2">
                     <div className="d-flex justify-content-between align-items-center">
                       <div>
                         <h6 className="card-title text-white-75 mb-1 fs-6">
                           {selectedTechnology === '4G' ? "Tổng cell 4G" : `${selectedTechnology} Cells`}
                         </h6>
                         <h3 className="font-weight-bold mb-0 text-white">
                          202.720
                           {/* {selectedTechnology === '4G' 
                             ? ((dashboardData.provincialTotals.huawei_4g_cells || 0) +
                                (dashboardData.provincialTotals.nokia_4g_cells || 0) +
                                (dashboardData.provincialTotals.zte_4g_cells || 0) +
                                (dashboardData.provincialTotals.ericsson_4g_cells || 0)).toLocaleString()
                             : ((dashboardData.provincialTotals as any).total5GCells || 0).toLocaleString()
                           } */}
                         </h3>
                       </div>
                       <div className="p-2 rounded" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                         <i className="fas fa-signal text-white"></i>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               {selectedTechnology === '4G' && (
                 <>
                   <div className="col-md-6 mb-2">
                     <div className="card border-0 shadow-sm h-100" style={{
                       background: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)',
                       transition: 'all 0.3s ease'
                     }}>
                       <div className="card-body text-white p-2">
                         <div className="d-flex justify-content-between align-items-center">
                           <div>
                             <h6 className="card-title text-white-75 mb-1 fs-6">Cell Moran</h6>
                             <h3 className="font-weight-bold mb-0 text-white">
                              6.487
                              {/* {dashboardData.provincialTotals.moran_cells?.toLocaleString() || '0'} */}
                              </h3>
                           </div>
                           <div className="p-2 rounded" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                             <i className="fas fa-wifi text-white"></i>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                   
                   <div className="col-md-6 mb-2">
                     <div className="card border-0 shadow-sm h-100" style={{
                       background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
                       transition: 'all 0.3s ease'
                     }}>
                       <div className="card-body text-white p-2">
                         <div className="d-flex justify-content-between align-items-center">
                           <div>
                             <h6 className="card-title text-white-75 mb-1 fs-6">Cell IOT</h6>
                             <h3 className="font-weight-bold mb-0 text-white">
                               2.467
                              {/* {dashboardData.provincialTotals.iot_cells?.toLocaleString() || '0'} */}
                              </h3>
                           </div>
                           <div className="p-2 rounded" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                             <i className="fas fa-network-wired text-white"></i>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 </>
               )}
             </div>
             
             {/* Band Distribution */}
             <div className="row mb-2">
               <div className="col-12">
                 <Card title="Phân Bố Tần Số" icon="fas fa-signal">
                   <div className="row">
                     {selectedTechnology === '4G' ? (
                       <>
                         <div className="col-6 mb-1">
                           <div className="text-center py-1 px-2 rounded" style={{
                             background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                             color: 'white'
                           }}>
                             <i className="fas fa-wifi" style={{ fontSize: '12px' }}></i>
                             <div className="fs-8 mb-0">900MHz</div>
                             <div className="fw-bold mb-0" style={{ fontSize: '14px' }}>
                              15.490
                              {/* {dashboardData.bandBreakdown['900MHz']} */}
                              </div>
                           </div>
                         </div>
                         <div className="col-6 mb-1">
                           <div className="text-center py-1 px-2 rounded" style={{
                             background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                             color: 'white'
                           }}>
                             <i className="fas fa-broadcast-tower" style={{ fontSize: '12px' }}></i>
                             <div className="fs-8 mb-0">1800MHz</div>
                             <div className="fw-bold mb-0" style={{ fontSize: '14px' }}>
                              153.514
                              {/* {dashboardData.bandBreakdown['1800MHz']} */}
                              </div>
                           </div>
                         </div>
                         <div className="col-6 mb-1">
                           <div className="text-center py-1 px-2 rounded" style={{
                             background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                             color: 'white'
                           }}>
                             <i className="fas fa-satellite-dish" style={{ fontSize: '12px' }}></i>
                             <div className="fs-8 mb-0">2100MHz</div>
                             <div className="fw-bold mb-0" style={{ fontSize: '14px' }}>
                              33.718
                              {/* {dashboardData.bandBreakdown['2100MHz']} */}
                              </div>
                           </div>
                         </div>
                         <div className="col-6 mb-1">
                           <div className="text-center py-1 px-2 rounded" style={{
                             background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                             color: 'white'
                           }}>
                             <i className="fas fa-network-wired" style={{ fontSize: '12px' }}></i>
                             <div className="fs-8 mb-0">2600MHz</div>
                             <div className="fw-bold mb-0" style={{ fontSize: '14px' }}>{dashboardData.bandBreakdown['2600MHz']}</div>
                           </div>
                         </div>
                       </>
                     ) : (
                       <>
                         <div className="col mb-1">
                           <div className="text-center py-1 px-1 rounded" style={{
                             background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                             color: 'white'
                           }}>
                             <i className="fas fa-wifi" style={{ fontSize: '10px' }}></i>
                             <div style={{ fontSize: '10px' }}>100MHz</div>
                             <div className="fw-bold" style={{ fontSize: '12px' }}>{((dashboardData.provincialTotals as any).chbw100Mhz || 0).toLocaleString()}</div>
                           </div>
                         </div>
                         <div className="col mb-1">
                           <div className="text-center py-1 px-1 rounded" style={{
                             background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                             color: 'white'
                           }}>
                             <i className="fas fa-broadcast-tower" style={{ fontSize: '10px' }}></i>
                             <div style={{ fontSize: '10px' }}>80MHz</div>
                             <div className="fw-bold" style={{ fontSize: '12px' }}>{((dashboardData.provincialTotals as any).chbw80Mhz || 0).toLocaleString()}</div>
                           </div>
                         </div>
                         <div className="col mb-1">
                           <div className="text-center py-1 px-1 rounded" style={{
                             background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                             color: 'white'
                           }}>
                             <i className="fas fa-satellite-dish" style={{ fontSize: '10px' }}></i>
                             <div style={{ fontSize: '10px' }}>60MHz</div>
                             <div className="fw-bold" style={{ fontSize: '12px' }}>{((dashboardData.provincialTotals as any).chbw60Mhz || 0).toLocaleString()}</div>
                           </div>
                         </div>
                         <div className="col mb-1">
                           <div className="text-center py-1 px-1 rounded" style={{
                             background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                             color: 'white'
                           }}>
                             <i className="fas fa-network-wired" style={{ fontSize: '10px' }}></i>
                             <div style={{ fontSize: '10px' }}>40MHz</div>
                             <div className="fw-bold" style={{ fontSize: '12px' }}>{((dashboardData.provincialTotals as any).chbw40Mhz || 0).toLocaleString()}</div>
                           </div>
                         </div>
                         <div className="col mb-1">
                           <div className="text-center py-1 px-1 rounded" style={{
                             background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                             color: 'white'
                           }}>
                             <i className="fas fa-signal" style={{ fontSize: '10px' }}></i>
                             <div style={{ fontSize: '10px' }}>20MHz</div>
                             <div className="fw-bold" style={{ fontSize: '12px' }}>{((dashboardData.provincialTotals as any).chbw20Mhz || 0).toLocaleString()}</div>
                           </div>
                         </div>
                       </>
                     )}
                   </div>
                 </Card>
               </div>
             </div>
             
             {/* MIMO Configuration */}
             <div className="row">
               <div className="col-12">
                 <Card title="Cấu Hình Mimo" icon="fas fa-antenna">
                   <div className="row">
                     {selectedTechnology === '4G' ? (
                       <>
                         <div className="col mb-1">
                           <div className="text-center py-1 px-1 rounded" style={{
                             background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                             color: 'white'
                           }}>
                             <i className="fas fa-broadcast-tower" style={{ fontSize: '10px' }}></i>
                             <div style={{ fontSize: '10px' }}>4T4R</div>
                             <div className="fw-bold" style={{ fontSize: '12px' }}>{(dashboardData.provincialTotals.config_4t4r || 0).toLocaleString()}</div>
                           </div>
                         </div>
                         <div className="col mb-1">
                           <div className="text-center py-1 px-1 rounded" style={{
                             background: 'linear-gradient(135deg, #007bff 0%, #6610f2 100%)',
                             color: 'white'
                           }}>
                             <i className="fas fa-signal" style={{ fontSize: '10px' }}></i>
                             <div style={{ fontSize: '10px' }}>2T4R</div>
                             <div className="fw-bold" style={{ fontSize: '12px' }}>{(dashboardData.provincialTotals.config_2t4r || 0).toLocaleString()}</div>
                           </div>
                         </div>
                         <div className="col mb-1">
                           <div className="text-center py-1 px-1 rounded" style={{
                             background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
                             color: 'white'
                           }}>
                             <i className="fas fa-wifi" style={{ fontSize: '10px' }}></i>
                             <div style={{ fontSize: '10px' }}>2T2R</div>
                             <div className="fw-bold" style={{ fontSize: '12px' }}>{(dashboardData.provincialTotals.config_2t2r || 0).toLocaleString()}</div>
                           </div>
                         </div>
                         <div className="col mb-1">
                           <div className="text-center py-1 px-1 rounded" style={{
                             background: 'linear-gradient(135deg, #dc3545 0%, #e83e8c 100%)',
                             color: 'white'
                           }}>
                             <i className="fas fa-network-wired" style={{ fontSize: '10px' }}></i>
                             <div style={{ fontSize: '10px' }}>1T2R</div>
                             <div className="fw-bold" style={{ fontSize: '12px' }}>{(dashboardData.provincialTotals.config_1t2r || 0).toLocaleString()}</div>
                           </div>
                         </div>
                         <div className="col mb-1">
                           <div className="text-center py-1 px-1 rounded" style={{
                             background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                             color: 'white'
                           }}>
                             <i className="fas fa-satellite-dish" style={{ fontSize: '10px' }}></i>
                             <div style={{ fontSize: '10px' }}>1T1R</div>
                             <div className="fw-bold" style={{ fontSize: '12px' }}>{(dashboardData.provincialTotals.config_1t1r || 0).toLocaleString()}</div>
                           </div>
                         </div>
                       </>
                     ) : (
                       <>
                         <div className="col-6 mb-1">
                           <div className="text-center py-1 px-2 rounded" style={{
                             background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                             color: 'white'
                           }}>
                             <i className="fas fa-broadcast-tower" style={{ fontSize: '12px' }}></i>
                             <div className="fs-8 mb-0">TxRx 48/12</div>
                             <div className="fw-bold mb-0" style={{ fontSize: '14px' }}>{((dashboardData.provincialTotals as any).txRx4812 || 0).toLocaleString()}</div>
                           </div>
                         </div>
                         <div className="col-6 mb-1">
                           <div className="text-center py-1 px-2 rounded" style={{
                             background: 'linear-gradient(135deg, #007bff 0%, #6610f2 100%)',
                             color: 'white'
                           }}>
                             <i className="fas fa-signal" style={{ fontSize: '12px' }}></i>
                             <div className="fs-8 mb-0">TxRx 32/8</div>
                             <div className="fw-bold mb-0" style={{ fontSize: '14px' }}>{((dashboardData.provincialTotals as any).txRx328 || 0).toLocaleString()}</div>
                           </div>
                         </div>
                       </>
                     )}
                   </div>
                 </Card>
               </div>
             </div>
           </div>
           
           {/* Right Side: Vendor Distribution - Full Height */}
           <div className="col-lg-6">
             <Card title="Phân Bố Vendor" icon="fas fa-chart-pie">
               {isLoading ? (
                 <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                   <div className="text-center">
                     <div className="spinner-border text-primary mb-3" role="status">
                       <span className="visually-hidden">Loading...</span>
                     </div>
                     <div className="text-muted">Đang tải biểu đồ...</div>
                   </div>
                 </div>
               ) : (
                 <div className="row h-100">
                   {/* Sites Chart */}
                   <div className="col-md-6">
                     <h6 className="text-center mb-3">Sites theo Vendor</h6>
                     <ResponsiveContainer width="100%" height={300}>
                       <PieChart>
                         <Pie
                           data={Object.entries(dashboardData.vendorBreakdown).map(([vendor, count]) => ({
                             name: vendor,
                             value: count,
                             fill: vendor === 'Huawei' ? '#ffc107' :
                                   vendor === 'Nokia' ? '#dc3545' : 
                                   vendor === 'ZTE' ? '#28a745' :
                                   vendor === 'Ericsson' ? '#6f42c1' : '#007bff'
                           }))}
                           cx="50%"
                           cy="50%"
                           outerRadius={90}
                           dataKey="value"
                           label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                         >
                           {Object.entries(dashboardData.vendorBreakdown).map(([vendor, count], index) => (
                             <Cell 
                               key={`cell-${index}`}
                             fill={vendor === 'Huawei' ? '#ffc107' :
                                   vendor === 'Nokia' ? '#dc3545' : 
                                   vendor === 'ZTE' ? '#28a745' :
                                   vendor === 'Ericsson' ? '#6f42c1' : '#007bff'}
                           />
                         ))}
                       </Pie>
                       <Tooltip formatter={(value) => [value.toLocaleString(), 'Sites']} />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
                 
                 {/* Cells Chart */}
                 <div className="col-md-6">
                   <h6 className="text-center mb-3">
                     {selectedTechnology === '4G' ? '4G Cells theo Vendor' : '5G Cells theo Vendor'}
                   </h6>
                   {(() => {
                     const chartData = selectedTechnology === '4G' ? [
                       {
                         name: 'Nokia',
                         value: dashboardData.provincialTotals.nokia_4g_cells || 0,
                         fill: '#dc3545'
                       },
                       {
                         name: 'Huawei',
                         value: dashboardData.provincialTotals.huawei_4g_cells || 0,
                         fill: '#ffc107'
                       },
                       {
                         name: 'ZTE',
                         value: dashboardData.provincialTotals.zte_4g_cells || 0,
                         fill: '#28a745'
                       },
                       {
                         name: 'Ericsson',
                         value: dashboardData.provincialTotals.ericsson_4g_cells || 0,
                         fill: '#6f42c1'
                       }
                     ].filter(item => item.value > 0) : [
                       {
                         name: 'Nokia',
                         value: (dashboardData.provincialTotals as any).total5GCells || 0,
                         fill: '#28a745'
                       }
                     ];
                     
                     //console.log('PieChart Data for Cells:', chartData);
                     
                     return (
                       <ResponsiveContainer width="100%" height={300}>
                         <PieChart>
                           <Pie
                             data={chartData}
                             cx="50%"
                             cy="50%"
                             outerRadius={90}
                             dataKey="value"
                             label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                           >
                             {chartData.map((item, index) => (
                               <Cell key={`cell-${index}`} fill={item.fill} />
                             ))}
                           </Pie>
                           <Tooltip formatter={(value) => [value.toLocaleString(), 'Cells']} />
                         </PieChart>
                       </ResponsiveContainer>
                     );
                   })()}
                 </div>
               </div>
               )}
               
               {/* Summary Stats - Bottom */}
               {!isLoading && (
                 <div className="row mt-3">
                 <div className="col-md-6">
                   <h6 className="text-center mb-2">Tổng Sites</h6>
                   {Object.entries(dashboardData.vendorBreakdown).map(([vendor, count]) => (
                     <div key={vendor} className="d-flex align-items-center mb-2">
                       <div 
                         className="rounded-circle me-2" 
                         style={{
                           width: '14px',
                           height: '14px',
                           backgroundColor: vendor === 'Huawei' ? '#ffc107' :
                                            vendor === 'Nokia' ? '#dc3545' : 
                                            vendor === 'ZTE' ? '#28a745' :
                                            vendor === 'Ericsson' ? '#6f42c1' : '#007bff'
                         }}
                       ></div>
                       <div className="flex-grow-1">
                         <small><strong>{vendor}</strong> <span className="text-muted">{count.toLocaleString()}</span></small>
                       </div>
                     </div>
                   ))}
                 </div>
                 <div className="col-md-6">
                   <h6 className="text-center mb-2">
                     {selectedTechnology === '4G' ? 'Tổng 4G Cells' : 'Tổng 5G Cells'}
                   </h6>
                   {selectedTechnology === '4G' ? (
                     <>
                       <div className="d-flex align-items-center mb-2">
                         <div className="rounded-circle me-2" style={{ width: '14px', height: '14px', backgroundColor: '#dc3545' }}></div>
                         <div className="flex-grow-1">
                           <small><strong>Nokia</strong> <span className="text-muted">{(dashboardData.provincialTotals.nokia_4g_cells || 0).toLocaleString()}</span></small>
                         </div>
                       </div>
                       <div className="d-flex align-items-center mb-2">
                         <div className="rounded-circle me-2" style={{ width: '14px', height: '14px', backgroundColor: '#ffc107' }}></div>
                         <div className="flex-grow-1">
                           <small><strong>Huawei</strong> <span className="text-muted">{(dashboardData.provincialTotals.huawei_4g_cells || 0).toLocaleString()}</span></small>
                         </div>
                       </div>
                       <div className="d-flex align-items-center mb-2">
                         <div className="rounded-circle me-2" style={{ width: '14px', height: '14px', backgroundColor: '#28a745' }}></div>
                         <div className="flex-grow-1">
                           <small><strong>ZTE</strong> <span className="text-muted">{(dashboardData.provincialTotals.zte_4g_cells || 0).toLocaleString()}</span></small>
                         </div>
                       </div>
                       <div className="d-flex align-items-center mb-2">
                         <div className="rounded-circle me-2" style={{ width: '14px', height: '14px', backgroundColor: '#6f42c1' }}></div>
                         <div className="flex-grow-1">
                           <small><strong>Ericsson</strong> <span className="text-muted">{(dashboardData.provincialTotals.ericsson_4g_cells || 0).toLocaleString()}</span></small>
                         </div>
                       </div>
                     </>
                   ) : (
                     <div className="d-flex align-items-center mb-2">
                       <div className="rounded-circle me-2" style={{ width: '14px', height: '14px', backgroundColor: '#28a745' }}></div>
                       <div className="flex-grow-1">
                         <small><strong>Nokia</strong> <span className="text-muted">{((dashboardData.provincialTotals as any).total5GCells || 0).toLocaleString()}</span></small>
                       </div>
                     </div>
                   )}
                 </div>
               </div>
               )}
             </Card>
           </div>
         </div>

         {/* Biến động cell trong 7 ngày - Enhanced Bar Chart */}
        <div className="row mb-3">
          <div className="col-12">
            <Card title="Biến động Cell trong 7 ngày" icon="fas fa-chart-bar">
              <div className="row">
                {/* Main Chart */}
                <div className="col-lg-8">
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart 
                      data={dashboardData.dailyTrend.map((item, index) => {
                        if (index === 0) {
                          return {
                            ...item,
                            change: 0,
                            changePercent: 0
                          };
                        }
                        const prevValue = dashboardData.dailyTrend[index - 1].cells;
                        const change = item.cells - prevValue;
                        const changePercent = prevValue > 0 ? ((change / prevValue) * 100) : 0;
                        
                        //console.log(`Day ${index}: ${item.date}, Current: ${item.cells}, Previous: ${prevValue}, Change: ${change}`);
                        
                        return {
                          ...item,
                          change: change,
                          changePercent: changePercent.toFixed(2)
                        };
                      })} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      barCategoryGap="20%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <Legend 
                        iconType="rect"
                        formatter={(value: string) => {
                          const vendorNames: { [key: string]: string } = {
                            'huaweiCells': 'Huawei',
                            'nokiaCells': 'Nokia',
                            'zteCells': 'ZTE',
                            'ericssonCells': 'Ericsson'
                          };
                          return vendorNames[value] || value;
                        }}
                      />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                      />
                      <YAxis 
                        yAxisId="cells"
                        orientation="left"
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                        domain={['dataMin - 50', 'dataMax + 50']}
                      />
                      <YAxis 
                        yAxisId="change"
                        orientation="right"
                        tick={{ fontSize: 12 }}
                        stroke="#28a745"
                        domain={['dataMin - 10', 'dataMax + 10']}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: any, name: string) => {
                          if (name === 'cells') return [value?.toLocaleString(), 'Tổng Cells'];
                          if (name === 'huaweiCells') return [value?.toLocaleString(), 'Huawei Cells'];
                          if (name === 'nokiaCells') return [value?.toLocaleString(), 'Nokia Cells'];
                          if (name === 'zteCells') return [value?.toLocaleString(), 'ZTE Cells'];
                          if (name === 'ericssonCells') return [value?.toLocaleString(), 'Ericsson Cells'];
                          if (name === 'change') return [
                            `${value > 0 ? '+' : ''}${value?.toLocaleString()}`, 
                            'Biến động'
                          ];
                          return [value, name];
                        }}
                        labelFormatter={(label) => `Ngày: ${label}`}
                      />
                      
                      {/* Stacked Bar Charts for Vendor Cells */}
                      <Bar 
                        yAxisId="cells"
                        dataKey="huaweiCells" 
                        stackId="a"
                        fill="#ffc107"
                        name="huaweiCells"
                      />
                      <Bar 
                        yAxisId="cells"
                        dataKey="nokiaCells" 
                        stackId="a"
                        fill="#dc3545"
                        name="nokiaCells"
                      />
                      <Bar 
                        yAxisId="cells"
                        dataKey="zteCells" 
                        stackId="a"
                        fill="#28a745"
                        name="zteCells"
                      />
                      <Bar 
                        yAxisId="cells"
                        dataKey="ericssonCells" 
                        stackId="a"
                        fill="#6f42c1"
                        name="ericssonCells"
                      />
                      
                      {/* Line Chart for Daily Change */}
                      <Line 
                        yAxisId="change"
                        type="monotone" 
                        dataKey="change" 
                        stroke="#28a745" 
                        strokeWidth={3}
                        dot={{ 
                          fill: '#28a745', 
                          strokeWidth: 2, 
                          r: 4,
                          stroke: '#fff'
                        }}
                        activeDot={{ 
                          r: 6, 
                          fill: '#28a745',
                          strokeWidth: 2,
                          stroke: '#fff'
                        }}
                        connectNulls={false}
                      />
                      
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#007bff" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#66b3ff" stopOpacity={0.4}/>
                        </linearGradient>
                      </defs>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Statistics Summary */}
                <div className="col-lg-4">
                  <div className="h-100 d-flex flex-column justify-content-center">
                    <h6 className="text-center mb-3">Thống Kê 7 Ngày</h6>
                    
                    {/* Max Day */}
                    <div className="mb-3 p-3 rounded" style={{
                      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                      color: 'white'
                    }}>
                      <div className="d-flex align-items-center">
                        <i className="fas fa-arrow-up me-2"></i>
                        <div>
                          <small>Cao nhất</small>
                          <div className="fw-bold">
                            {Math.max(...dashboardData.dailyTrend.map(d => d.cells)).toLocaleString()} cells
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Min Day */}
                    <div className="mb-3 p-3 rounded" style={{
                      background: 'linear-gradient(135deg, #dc3545 0%, #e83e8c 100%)',
                      color: 'white'
                    }}>
                      <div className="d-flex align-items-center">
                        <i className="fas fa-arrow-down me-2"></i>
                        <div>
                          <small>Thấp nhất</small>
                          <div className="fw-bold">
                            {Math.min(...dashboardData.dailyTrend.map(d => d.cells)).toLocaleString()} cells
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Average */}
                    <div className="mb-3 p-3 rounded" style={{
                      background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
                      color: 'white'
                    }}>
                      <div className="d-flex align-items-center">
                        <i className="fas fa-chart-line me-2"></i>
                        <div>
                          <small>Trung bình</small>
                          <div className="fw-bold">
                            {Math.round(dashboardData.dailyTrend.reduce((sum, d) => sum + d.cells, 0) / dashboardData.dailyTrend.length).toLocaleString()} cells
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Variance */}
                    <div className="p-3 rounded" style={{
                      background: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)',
                      color: 'white'
                    }}>
                      <div className="d-flex align-items-center">
                        <i className="fas fa-exchange-alt me-2"></i>
                        <div>
                          <small>Biến động</small>
                          <div className="fw-bold">
                            {(Math.max(...dashboardData.dailyTrend.map(d => d.cells)) - 
                              Math.min(...dashboardData.dailyTrend.map(d => d.cells))).toLocaleString()} cells
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Daily Change Indicators & Legend */}
              <div className="row mt-3">
                {/* Legend */}
                <div className="col-md-4">
                  <h6 className="mb-2">Chú thích:</h6>
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex align-items-center">
                      <div 
                        className="me-2" 
                        style={{
                          width: '20px',
                          height: '12px',
                          background: 'linear-gradient(135deg, #007bff 0%, #66b3ff 100%)',
                          borderRadius: '2px'
                        }}
                      ></div>
                      <small>Tổng Cells (Cột)</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <div 
                        className="me-2" 
                        style={{
                          width: '20px',
                          height: '3px',
                          backgroundColor: '#28a745',
                          borderRadius: '2px'
                        }}
                      ></div>
                      <small>Biến động hàng ngày (Đường)</small>
                    </div>
                  </div>
                </div>
                
                {/* Daily Changes */}
                <div className="col-md-8">
                  <h6 className="mb-2">Biến Động Hàng Ngày:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {dashboardData.dailyTrend.map((item, index) => {
                      if (index === 0) return null;
                      const prevValue = dashboardData.dailyTrend[index - 1].cells;
                      const change = item.cells - prevValue;
                      const isPositive = change > 0;
                      const changePercent = ((change / prevValue) * 100).toFixed(2);
                      
                      return (
                        <div 
                          key={index}
                          className="badge px-3 py-2"
                          style={{
                            backgroundColor: isPositive ? '#28a745' : change < 0 ? '#dc3545' : '#6c757d',
                            color: 'white',
                            fontSize: '11px'
                          }}
                          title={`Thay đổi: ${changePercent}%`}
                        >
                          {item.date}: {isPositive ? '+' : ''}{change.toLocaleString()}
                          <i className={`fas fa-${isPositive ? 'arrow-up' : change < 0 ? 'arrow-down' : 'minus'} ms-1`}></i>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

      

      </div>
    </>
  );
};

export default Dashboard;
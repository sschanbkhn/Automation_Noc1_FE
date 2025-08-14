import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Card from 'components/common/Card';

import CtrlButton from 'components/common/CtrlButton';
import CtrlSelect from 'components/common/CtrlSelect';
import { CtrlNotification } from 'components/common';
import RnocR009Service from 'services/RnocR009Service';
import { downloadFile } from 'helpers/downloadHelper';
import dailyBtsSummary from './daily_bts_summary.json';
import provincialSummary from './provincial_summary.json';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardData {
  totalSites: number;
  totalCells: number;
  vendorBreakdown: {
    Huawei: number;
    Nokia: number;
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
    vendorBreakdown: { Huawei: 0, Nokia: 0, Ericsson: 0 },
    technologyBreakdown: { '4G': 0, '5G': 0 },
    bandBreakdown: { '900MHz': 0, '1800MHz': 0, '2100MHz': 0, '2600MHz': 0 },
    dailyTrend: [
      { date: '2025-07-21', sites: 35678, cells: 47890 },
      { date: '2025-07-22', sites: 35789, cells: 48123 },
      { date: '2025-07-23', sites: 35890, cells: 48345 },
      { date: '2025-07-24', sites: 35901, cells: 48567 },
      { date: '2025-07-25', sites: 36012, cells: 48789 },
      { date: '2025-07-26', sites: 36123, cells: 49012 },
      { date: '2025-07-27', sites: 36234, cells: 49234 },
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
      nokia_4g_cells: 0
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
      
      console.log('=== DATE DEBUG ===');
      console.log('Selected date:', formattedDate);
      console.log('=== END DATE DEBUG ===');

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
      console.log('Dashboard Response:', dashboardResponse);
      console.log('Response type:', typeof dashboardResponse);
      console.log('Response keys:', dashboardResponse ? Object.keys(dashboardResponse) : 'null');

      // Check if response has Data property (API response structure)
      if (dashboardResponse && dashboardResponse.Data) {
        dashboardResponse = dashboardResponse.Data;
        console.log('Using dashboardResponse.Data');
      }

      // If no data from API, create demo data for testing
      if (!dashboardResponse || Object.keys(dashboardResponse).length === 0) {
        console.log('No data from API, creating demo data');
        if (selectedTechnology === '4G') {
          dashboardResponse = {
            totalSites: 1500,
            totalCells: 4500,
            vendorBreakdown: {
              Huawei: 800,
              Nokia: 600,
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
              { date: '2025-07-21', sites: 1450, cells: 4350 },
              { date: '2025-07-22', sites: 1460, cells: 4380 },
              { date: '2025-07-23', sites: 1470, cells: 4410 },
              { date: '2025-07-24', sites: 1480, cells: 4440 },
              { date: '2025-07-25', sites: 1490, cells: 4470 },
              { date: '2025-07-26', sites: 1495, cells: 4485 },
              { date: '2025-07-27', sites: 1500, cells: 4500 },
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
              huawei_4g_cells: 0,
              nokia_4g_cells: 0
            }
          };
        } else if (selectedTechnology === '5G') {
          dashboardResponse = {
            totalSites: 500,
            totalCells: 1500,
            vendorBreakdown: {
              Nokia: 500
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
            dailyTrend: [
              { date: '2025-07-21', sites: 480, cells: 1440 },
              { date: '2025-07-22', sites: 485, cells: 1455 },
              { date: '2025-07-23', sites: 490, cells: 1470 },
              { date: '2025-07-24', sites: 495, cells: 1485 },
              { date: '2025-07-25', sites: 498, cells: 1494 },
              { date: '2025-07-26', sites: 499, cells: 1497 },
              { date: '2025-07-27', sites: 500, cells: 1500 },
            ],
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
        setDashboardData({
          totalSites: dashboardResponse?.TotalSites || 0,
          totalCells: dashboardResponse?.TotalCells || 0,
          vendorBreakdown: {
            Huawei: dashboardResponse?.VendorBreakdown?.Huawei || 0,
            Nokia: dashboardResponse?.VendorBreakdown?.Nokia || 0,
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
          dailyTrend: dashboardResponse?.DailyTrend?.map((item: any) => ({
            date: item.Date,
            sites: item.Sites,
            cells: item.Cells
          })) || [],
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
            nokia_4g_cells: dashboardResponse?.ProvincialTotals?.Nokia4GCells || 0
          }
        });
      } else if (selectedTechnology === '5G') {
        setDashboardData({
          totalSites: dashboardResponse?.TotalSites || 0,
          totalCells: dashboardResponse?.TotalCells || 0,
          vendorBreakdown: {
            Huawei: dashboardResponse?.VendorBreakdown?.Huawei || 0,
            Nokia: dashboardResponse?.VendorBreakdown?.Nokia || 0,
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
          dailyTrend: dashboardResponse?.DailyTrend?.map((item: any) => ({
            date: item.Date,
            sites: item.Sites,
            cells: item.Cells
          })) || [],
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
            huawei_4g_cells: dashboardResponse?.ProvincialTotals?.Huawei4gCells || 0,
            nokia_4g_cells: dashboardResponse?.ProvincialTotals?.Nokia4gCells || 0
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
  }, [selectedDate, selectedTechnology]);



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
                  title="Thực hiện"
                  icon="fas fa-search"
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

                 {/* Statistics Grid */}
         <div className="row mb-4">
           <StatCard
             title="Tổng Sites"
             value={dashboardData.totalSites}
             icon={{ class: "fas fa-broadcast-tower", color: "text-white", bg: "bg-gradient-primary" }}
             color="border-0 shadow-lg"
             description="Tổng số trạm"
           />
           <StatCard
             title={selectedTechnology === '4G' ? "Tổng Cell 4G" : `${selectedTechnology} Cells`}
             value={selectedTechnology === '4G' 
               ? (dashboardData.provincialTotals.moran_cells || 0) + 
                 (dashboardData.provincialTotals.iot_cells || 0) + 
                 (dashboardData.provincialTotals.huawei_4g_cells || 0) + 
                 (dashboardData.provincialTotals.nokia_4g_cells || 0)
               : (dashboardData.provincialTotals as any).total5GCells || 0}
             icon={{ class: "fas fa-signal", color: "text-white", bg: "bg-gradient-info" }}
             color="border-0 shadow-lg"
             description={selectedTechnology === '4G' ? "Tổng tất cả Cell 4G" : `Cell ${selectedTechnology}`}
           />
           {selectedTechnology === '4G' && (
             <>
               <StatCard
                 title="Cell Moran"
                 value={dashboardData.provincialTotals.moran_cells}
                 icon={{ class: "fas fa-wifi", color: "text-white", bg: "bg-gradient-success" }}
                 color="border-0 shadow-lg"
                 description="Cell Moran"
               />
               <StatCard
                 title="Cell IOT"
                 value={dashboardData.provincialTotals.iot_cells}
                 icon={{ class: "fas fa-network-wired", color: "text-white", bg: "bg-gradient-warning" }}
                 color="border-0 shadow-lg"
                 description="Cell IOT"
               />
               <StatCard
                 title="Tổng cell Nokia"
                 value={dashboardData.provincialTotals.nokia_4g_cells || 0}
                 icon={{ class: "fas fa-tower-broadcast", color: "text-white", bg: "bg-gradient-danger" }}
                 color="border-0 shadow-lg"
                 description="Tổng cell Nokia 4G"
               />
               <StatCard
                 title="Tổng cell Huawei"
                 value={dashboardData.provincialTotals.huawei_4g_cells || 0}
                 icon={{ class: "fas fa-tower-broadcast", color: "text-white", bg: "bg-gradient-warning" }}
                 color="border-0 shadow-lg"
                 description="Tổng cell Huawei 4G"
               />
             </>
           )}
         </div>

                 {/* Vendor Distribution Pie Chart */}
         <div className="row mb-4">
           <div className="col-12">
             <Card title="Phân Bố Vendor" icon="fas fa-chart-pie">
               <div className="row">
                 <div className="col-md-8">
                   <ResponsiveContainer width="100%" height={300}>
                     <PieChart>
                       <Pie
                         data={Object.entries(dashboardData.vendorBreakdown).map(([vendor, count]) => ({
                           name: vendor,
                           value: count,
                           fill: vendor === 'Huawei' ? '#ffc107' :
                                 vendor === 'Nokia' ? '#dc3545' : '#007bff'
                         }))}
                         cx="50%"
                         cy="50%"
                         outerRadius={100}
                         dataKey="value"
                         label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                       >
                         {Object.entries(dashboardData.vendorBreakdown).map(([vendor, count], index) => (
                           <Cell 
                             key={`cell-${index}`}
                             fill={vendor === 'Huawei' ? '#ffc107' :
                                   vendor === 'Nokia' ? '#dc3545' : '#007bff'}
                           />
                         ))}
                       </Pie>
                       <Tooltip formatter={(value) => [value.toLocaleString(), 'Sites']} />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
                 <div className="col-md-4">
                   <div className="d-flex flex-column justify-content-center h-100">
                     {Object.entries(dashboardData.vendorBreakdown).map(([vendor, count]) => (
                       <div key={vendor} className="d-flex align-items-center mb-3">
                         <div 
                           className="rounded-circle me-3" 
                           style={{
                             width: '20px',
                             height: '20px',
                             backgroundColor: vendor === 'Huawei' ? '#ffc107' :
                                              vendor === 'Nokia' ? '#dc3545' : '#007bff'
                           }}
                         ></div>
                         <div>
                           <strong>{vendor}</strong>
                           <div className="text-muted">{count.toLocaleString()} sites</div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             </Card>
           </div>
         </div>

                 {/* Band Distribution */}
         <div className="row mt-4">
           <div className="col-12">
             <Card title="Phân Bố Tần Số" icon="fas fa-signal">
               <div className="row">
                 {selectedTechnology === '4G' ? (
                   <>
                     <div className="col-md-3 mb-3">
                       <div className="text-center p-3 rounded" style={{
                         background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                         color: 'white'
                       }}>
                         <i className="fas fa-wifi fa-2x mb-2"></i>
                         <h5>900MHz</h5>
                         <h3 className="mb-0">{dashboardData.bandBreakdown['900MHz']}</h3>
                       </div>
                     </div>
                     <div className="col-md-3 mb-3">
                       <div className="text-center p-3 rounded" style={{
                         background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                         color: 'white'
                       }}>
                         <i className="fas fa-broadcast-tower fa-2x mb-2"></i>
                         <h5>1800MHz</h5>
                         <h3 className="mb-0">{dashboardData.bandBreakdown['1800MHz']}</h3>
                       </div>
                     </div>
                     <div className="col-md-3 mb-3">
                       <div className="text-center p-3 rounded" style={{
                         background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                         color: 'white'
                       }}>
                         <i className="fas fa-satellite-dish fa-2x mb-2"></i>
                         <h5>2100MHz</h5>
                         <h3 className="mb-0">{dashboardData.bandBreakdown['2100MHz']}</h3>
                       </div>
                     </div>
                     <div className="col-md-3 mb-3">
                       <div className="text-center p-3 rounded" style={{
                         background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                         color: 'white'
                       }}>
                         <i className="fas fa-network-wired fa-2x mb-2"></i>
                         <h5>2600MHz</h5>
                         <h3 className="mb-0">{dashboardData.bandBreakdown['2600MHz']}</h3>
                       </div>
                     </div>
                   </>
                 ) : (
                   <>
                     <div className="col-md-2 mb-3">
                       <div className="text-center p-3 rounded" style={{
                         background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                         color: 'white'
                       }}>
                         <i className="fas fa-wifi fa-2x mb-2"></i>
                         <h5>100MHz</h5>
                         <h3 className="mb-0">{((dashboardData.provincialTotals as any).chbw100Mhz || 0).toLocaleString()}</h3>
                       </div>
                     </div>
                     <div className="col-md-2 mb-3">
                       <div className="text-center p-3 rounded" style={{
                         background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                         color: 'white'
                       }}>
                         <i className="fas fa-broadcast-tower fa-2x mb-2"></i>
                         <h5>80MHz</h5>
                         <h3 className="mb-0">{((dashboardData.provincialTotals as any).chbw80Mhz || 0).toLocaleString()}</h3>
                       </div>
                     </div>
                     <div className="col-md-2 mb-3">
                       <div className="text-center p-3 rounded" style={{
                         background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                         color: 'white'
                       }}>
                         <i className="fas fa-satellite-dish fa-2x mb-2"></i>
                         <h5>60MHz</h5>
                         <h3 className="mb-0">{((dashboardData.provincialTotals as any).chbw60Mhz || 0).toLocaleString()}</h3>
                       </div>
                     </div>
                     <div className="col-md-2 mb-3">
                       <div className="text-center p-3 rounded" style={{
                         background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                         color: 'white'
                       }}>
                         <i className="fas fa-network-wired fa-2x mb-2"></i>
                         <h5>40MHz</h5>
                         <h3 className="mb-0">{((dashboardData.provincialTotals as any).chbw40Mhz || 0).toLocaleString()}</h3>
                       </div>
                     </div>
                     <div className="col-md-2 mb-3">
                       <div className="text-center p-3 rounded" style={{
                         background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                         color: 'white'
                       }}>
                         <i className="fas fa-signal fa-2x mb-2"></i>
                         <h5>20MHz</h5>
                         <h3 className="mb-0">{((dashboardData.provincialTotals as any).chbw20Mhz || 0).toLocaleString()}</h3>
                       </div>
                     </div>
                   </>
                 )}
               </div>
             </Card>
           </div>
         </div>

         {/* Cấu Hình Antenna */}
         <div className="row mt-4">
           <div className="col-12">
             <Card title="Cấu Hình Mimo" icon="fas fa-antenna">
               <div className="row">
                 {selectedTechnology === '4G' ? (
                   <>
                     <div className="col mb-3">
                       <div className="text-center p-3 rounded" style={{
                         background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                         color: 'white'
                       }}>
                         <i className="fas fa-broadcast-tower fa-2x mb-2"></i>
                         <h5>4T4R</h5>
                         <h3 className="mb-0">{(dashboardData.provincialTotals.config_4t4r || 0).toLocaleString()}</h3>
                       </div>
                     </div>
                     <div className="col mb-3">
                       <div className="text-center p-3 rounded" style={{
                         background: 'linear-gradient(135deg, #007bff 0%, #6610f2 100%)',
                         color: 'white'
                       }}>
                         <i className="fas fa-signal fa-2x mb-2"></i>
                         <h5>2T4R</h5>
                         <h3 className="mb-0">{(dashboardData.provincialTotals.config_2t4r || 0).toLocaleString()}</h3>
                       </div>
                     </div>
                     <div className="col mb-3">
                       <div className="text-center p-3 rounded" style={{
                         background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
                         color: 'white'
                       }}>
                         <i className="fas fa-wifi fa-2x mb-2"></i>
                         <h5>2T2R</h5>
                         <h3 className="mb-0">{(dashboardData.provincialTotals.config_2t2r || 0).toLocaleString()}</h3>
                       </div>
                     </div>
                     <div className="col mb-3">
                       <div className="text-center p-3 rounded" style={{
                         background: 'linear-gradient(135deg, #dc3545 0%, #e83e8c 100%)',
                         color: 'white'
                       }}>
                         <i className="fas fa-network-wired fa-2x mb-2"></i>
                         <h5>1T2R</h5>
                         <h3 className="mb-0">{(dashboardData.provincialTotals.config_1t2r || 0).toLocaleString()}</h3>
                       </div>
                     </div>
                     <div className="col mb-3">
                       <div className="text-center p-3 rounded" style={{
                         background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                         color: 'white'
                       }}>
                         <i className="fas fa-satellite-dish fa-2x mb-2"></i>
                         <h5>1T1R</h5>
                         <h3 className="mb-0">{(dashboardData.provincialTotals.config_1t1r || 0).toLocaleString()}</h3>
                       </div>
                     </div>
                   </>
                 ) : (
                   <>
                     <div className="col mb-3">
                       <div className="text-center p-3 rounded" style={{
                         background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                         color: 'white'
                       }}>
                         <i className="fas fa-broadcast-tower fa-2x mb-2"></i>
                         <h5>TxRx 48/12</h5>
                         <h3 className="mb-0">{((dashboardData.provincialTotals as any).txRx4812 || 0).toLocaleString()}</h3>
                       </div>
                     </div>
                     <div className="col mb-3">
                       <div className="text-center p-3 rounded" style={{
                         background: 'linear-gradient(135deg, #007bff 0%, #6610f2 100%)',
                         color: 'white'
                       }}>
                         <i className="fas fa-signal fa-2x mb-2"></i>
                         <h5>TxRx 32/8</h5>
                         <h3 className="mb-0">{((dashboardData.provincialTotals as any).txRx328 || 0).toLocaleString()}</h3>
                       </div>
                     </div>
                   </>
                 )}
               </div>
             </Card>
           </div>
         </div>

         {/* Biến động cell trong 7 ngày */}
        <div className="row mt-4">
          <div className="col-12">
            <Card title="Biến động cell trong 7 ngày" icon="fas fa-chart-line">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.dailyTrend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cells" stroke="#007bff" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>

        {/* Bảng Theo Tỉnh/Thành Phố */}
        <div className="row mt-4">
          <div className="col-12">
            <Card title="Báo Cáo Theo Tỉnh/Thành Phố" icon="fas fa-map-marker-alt" buttonGroups={
              <div className="d-flex gap-2">
                <CtrlButton
                  title="Xuất Excel"
                  icon="fas fa-download"
                  onClick={handleExportToExcel}
                  type="success"
                />
                <CtrlButton
                  title="Làm mới"
                  icon="fas fa-sync-alt"
                  onClick={loadDashboardData}
                  isDisabled={isLoading}
                  type="primary"
                />
              </div>
            }>
              <div className="table-responsive">
                <table className="table table-striped table-hover table-sm" style={{
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                  <thead style={{
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    color: 'white',
                    border: 'none'
                  }}>
                    <style>{`
                      .sortable-header:hover {
                        background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%) !important;
                        transform: translateY(-1px);
                        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                        transition: all 0.3s ease;
                      }
                      .sortable-header {
                        transition: all 0.3s ease;
                      }
                      .provincial-table {
                        border-collapse: collapse;
                        width: 100%;
                        margin-top: 20px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        border-radius: 8px;
                        overflow: hidden;
                      }
                      .provincial-table th,
                      .provincial-table td {
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        padding: 12px 10px;
                        text-align: center;
                      }
                      .provincial-table tbody tr:hover {
                        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%) !important;
                        transform: scale(1.01);
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                      }
                    `}</style>
                    <tr>
                      <th 
                        className="sortable-header"
                        style={{ 
                          border: 'none', 
                          padding: '15px 10px', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('report_date')}
                      >
                        Ngày Báo Cáo <SortIcon columnKey="report_date" />
                      </th>
                      <th 
                        className="sortable-header"
                        style={{ 
                          border: 'none', 
                          padding: '15px 10px', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('province')}
                      >
                        Tỉnh/Thành <SortIcon columnKey="province" />
                      </th>
                      <th 
                        className="sortable-header"
                        style={{ 
                          border: 'none', 
                          padding: '15px 10px', 
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('nokia_sites')}
                      >
                        {selectedTechnology === '4G' ? 'Nokia Sites' : 'Nokia 5G Sites'} <SortIcon columnKey="nokia_sites" />
                      </th>
                      
                      {/* 4G Technology Columns */}
                      {selectedTechnology === '4G' && (
                        <>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('huawei_sites')}
                          >
                            Huawei Sites <SortIcon columnKey="huawei_sites" />
                          </th>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('total_4g_cells')}
                          >
                            Tổng 4G Cells <SortIcon columnKey="total_4g_cells" />
                          </th>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('huawei_4g_cells')}
                          >
                            Huawei 4G Cells <SortIcon columnKey="huawei_4g_cells" />
                          </th>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('nokia_4g_cells')}
                          >
                            Nokia 4G Cells <SortIcon columnKey="nokia_4g_cells" />
                          </th>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('moran_cells')}
                          >
                            Moran Cells <SortIcon columnKey="moran_cells" />
                          </th>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('iot_cells')}
                          >
                            IoT Cells <SortIcon columnKey="iot_cells" />
                          </th>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('band_900')}
                          >
                            Band 900 <SortIcon columnKey="band_900" />
                          </th>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('band_1800')}
                          >
                            Band 1800 <SortIcon columnKey="band_1800" />
                          </th>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('band_2100')}
                          >
                            Band 2100 <SortIcon columnKey="band_2100" />
                          </th>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('config_4t4r')}
                          >
                            4T4R <SortIcon columnKey="config_4t4r" />
                          </th>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('config_2t4r')}
                          >
                            2T4R <SortIcon columnKey="config_2t4r" />
                          </th>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('config_2t2r')}
                          >
                            2T2R <SortIcon columnKey="config_2t2r" />
                          </th>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('config_1t2r')}
                          >
                            1T2R <SortIcon columnKey="config_1t2r" />
                          </th>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('config_1t1r')}
                          >
                            1T1R <SortIcon columnKey="config_1t1r" />
                          </th>
                        </>
                      )}
                      
                      {/* 5G Technology Columns */}
                      {selectedTechnology === '5G' && (
                        <>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('total5GCells')}
                          >
                            Tổng 5G Cells <SortIcon columnKey="total5GCells" />
                          </th>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('chbw100Mhz')}
                          >
                            Chbw100Mhz <SortIcon columnKey="chbw100Mhz" />
                          </th>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('chbw80Mhz')}
                          >
                            Chbw80Mhz <SortIcon columnKey="chbw80Mhz" />
                          </th>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('chbw60Mhz')}
                          >
                            Chbw60Mhz <SortIcon columnKey="chbw60Mhz" />
                          </th>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('chbw40Mhz')}
                          >
                            Chbw40Mhz <SortIcon columnKey="chbw40Mhz" />
                          </th>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('chbw20Mhz')}
                          >
                            Chbw20Mhz <SortIcon columnKey="chbw20Mhz" />
                          </th>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('txRx4812')}
                          >
                            TxRx4812 <SortIcon columnKey="txRx4812" />
                          </th>
                          <th 
                            className="sortable-header"
                            style={{ 
                              border: 'none', 
                              padding: '15px 10px', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            onClick={() => handleSort('txRx328')}
                          >
                            TxRx328 <SortIcon columnKey="txRx328" />
                          </th>
                        </>
                      )}
                      

                    </tr>
                  </thead>
                  <tbody>
                    {sortedProvincialData.map((item, index) => (
                      <tr key={index} style={{
                        background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(248, 249, 250, 0.8)',
                        transition: 'all 0.3s ease',
                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)';
                        e.currentTarget.style.transform = 'scale(1.01)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = index % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(248, 249, 250, 0.8)';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}>
                        <td style={{ padding: '12px 10px', fontWeight: '500' }}>{selectedDate}</td>
                        <td style={{ padding: '12px 10px' }}>
                          <strong style={{ 
                            color: '#2c3e50',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>{item.province}</strong>
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                          {selectedTechnology === '4G' 
                            ? (item.nokia_sites || 0).toLocaleString()
                            : (item.nokia5GSites || 0).toLocaleString()
                          }
                        </td>
                        
                        {/* 4G Technology Data */}
                        {selectedTechnology === '4G' && (
                          <>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.huawei_sites || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.total_4g_cells || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.huawei_4g_cells || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.nokia_4g_cells || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.moran_cells || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.iot_cells || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.band_900 || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.band_1800 || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.band_2100 || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.config_4t4r || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.config_2t4r || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.config_2t2r || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.config_1t2r || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.config_1t1r || 0).toLocaleString()}
                            </td>
                          </>
                        )}
                        
                        {/* 5G Technology Data */}
                        {selectedTechnology === '5G' && (
                          <>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.total5GCells || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.chbw100Mhz || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.chbw80Mhz || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.chbw60Mhz || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.chbw40Mhz || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.chbw20Mhz || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.txRx4812 || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              {(item.txRx328 || 0).toLocaleString()}
                            </td>
                          </>
                        )}

                      </tr>
                    ))}
                  </tbody>
                  <tfoot style={{
                    background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                    color: 'white',
                    border: 'none'
                  }}>
                    <tr>
                      <td colSpan={2} style={{ border: 'none', padding: '15px 10px' }}>
                        <strong style={{ fontSize: '16px' }}>TỔNG CỘNG</strong>
                      </td>
                      <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                        <strong style={{ fontSize: '16px' }}>
                          {selectedTechnology === '4G'
                            ? (dashboardData.provincialTotals.nokia_sites || 0).toLocaleString()
                            : (dashboardData.provincialTotals.nokia5GSites || 0).toLocaleString()
                          }
                        </strong>
                      </td>
                      {selectedTechnology === '4G' && (
                        <>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>{(dashboardData.provincialTotals.huawei_sites || 0).toLocaleString()}</strong>
                          </td>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>{(dashboardData.provincialTotals.total_4g_cells || 0).toLocaleString()}</strong>
                          </td>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>{(dashboardData.provincialTotals.huawei_4g_cells || 0).toLocaleString()}</strong>
                          </td>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>{(dashboardData.provincialTotals.nokia_4g_cells || 0).toLocaleString()}</strong>
                          </td>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>{(dashboardData.provincialTotals.moran_cells || 0).toLocaleString()}</strong>
                          </td>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>{(dashboardData.provincialTotals.iot_cells || 0).toLocaleString()}</strong>
                          </td>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>{(dashboardData.provincialTotals.band_900 || 0).toLocaleString()}</strong>
                          </td>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>{(dashboardData.provincialTotals.band_1800 || 0).toLocaleString()}</strong>
                          </td>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>{(dashboardData.provincialTotals.band_2100 || 0).toLocaleString()}</strong>
                          </td>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>{(dashboardData.provincialTotals.config_4t4r || 0).toLocaleString()}</strong>
                          </td>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>{(dashboardData.provincialTotals.config_2t4r || 0).toLocaleString()}</strong>
                          </td>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>{(dashboardData.provincialTotals.config_2t2r || 0).toLocaleString()}</strong>
                          </td>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>{(dashboardData.provincialTotals.config_1t2r || 0).toLocaleString()}</strong>
                          </td>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>{(dashboardData.provincialTotals.config_1t1r || 0).toLocaleString()}</strong>
                          </td>
                        </>
                      )}
                      {selectedTechnology === '5G' && (
                        <>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>
                              {(dashboardData.provincialTotals.total5GCells || 0).toLocaleString()}
                            </strong>
                          </td>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>
                              {(dashboardData.provincialTotals.chbw100Mhz || 0).toLocaleString()}
                            </strong>
                          </td>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>
                              {(dashboardData.provincialTotals.chbw80Mhz || 0).toLocaleString()}
                            </strong>
                          </td>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>
                              {(dashboardData.provincialTotals.chbw60Mhz || 0).toLocaleString()}
                            </strong>
                          </td>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>
                              {(dashboardData.provincialTotals.chbw40Mhz || 0).toLocaleString()}
                            </strong>
                          </td>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>
                              {(dashboardData.provincialTotals.chbw20Mhz || 0).toLocaleString()}
                            </strong>
                          </td>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>
                              {(dashboardData.provincialTotals.txRx4812 || 0).toLocaleString()}
                            </strong>
                          </td>
                          <td style={{ border: 'none', padding: '15px 10px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '16px' }}>
                              {(dashboardData.provincialTotals.txRx328 || 0).toLocaleString()}
                            </strong>
                          </td>
                        </>
                      )}


                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;
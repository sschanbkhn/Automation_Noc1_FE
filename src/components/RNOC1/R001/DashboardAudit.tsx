import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { connect } from "react-redux";
import { Doughnut } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { CtrlNotification } from 'components/common';
import Card from 'components/common/Card';
import Tab from 'components/common/Tab';
import CtrlButton from 'components/common/CtrlButton';
import RnocR001Service from 'services/RnocR001Service';

// Đăng ký các thành phần Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// Interfaces
interface IR001ParameterSummary {
  ParameterName: string;
  CorrectCount: number;
  IncorrectCount: number;
  TotalCount: number;
  CorrectPercentage: number;
}

interface IBaselineTypeSummary {
  BaselineType: string;
  CorrectCount: number;
  IncorrectCount: number;
  TotalCount: number;
  CorrectPercentage: number;
  Parameters: IR001ParameterSummary[];
}

interface IR001DataRuntime {
  Id: number;
  NeName: string;
  CellId: number;
  ReportDate: string;
  UtranSrvccSwitch: string;
  UtranCsfbSwitch: string;
  UtranFlashCsfbSwitch: string;
  GeranFlashCsfbSwitch: string;
  CsfbAdaptiveBlindHoSwitch: string;
  UtranCsfbSteeringSwitch: string;
  IdleCsfbRedirectOptSwitch: string;
  DlVoipBundlingSwitch: string;
  UlVoipPreAllocationSwitch: string;
  UlVoipDelaySchSwitch: string;
  UlVoipLoadBasedSchSwitch: string;
  UlVoipServStateEnhancedSw: string;
  UlVoipSchOptSwitch: string;
  UlVoLteDataSizeEstSwitch: string;
}

interface IR001DataRuntimeBad extends IR001DataRuntime {
  DetectedDate: string;
}

interface Props {
  Apps?: any;
}

const DashboardAudit = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [parameterSummaries, setParameterSummaries] = useState<IR001ParameterSummary[]>([]);
  const [baselineTypeSummaries, setBaselineTypeSummaries] = useState<IBaselineTypeSummary[]>([]);
  const [runtimeData, setRuntimeData] = useState<IR001DataRuntime[]>([]);
  const [badData, setBadData] = useState<IR001DataRuntimeBad[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Modal states
  const [correctModalVisible, setCorrectModalVisible] = useState(false);
  const [wrongModalVisible, setWrongModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedBaselineType, setSelectedBaselineType] = useState<IBaselineTypeSummary | null>(null);
  
  // Single parameter modal states
  const [singleParamModalVisible, setSingleParamModalVisible] = useState(false);
  const [singleParamData, setSingleParamData] = useState<any[]>([]);
  const [singleParamTitle, setSingleParamTitle] = useState('');
  const [selectedParameterName, setSelectedParameterName] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  
  // Modal pagination states
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [modalPageSize] = useState(50);
  
  const refNotification = useRef<any>();
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset pagination when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [badData]);

  // Helper function to group parameters by baseline type (MUST BE BEFORE fetchAllData)
  const groupParametersByBaselineType = useCallback((params: IR001ParameterSummary[]): IBaselineTypeSummary[] => {
    // Define parameter mapping based on the table (using snake_case to match API response)
    const baselineMapping: { [key: string]: string } = {
      'utran_srvcc_switch': 'SRVCC',
      'utran_csfb_switch': 'CSFB',
      'utran_flash_csfb_switch': 'CSFB',
      'geran_flash_csfb_switch': 'CSFB',
      'csfb_adaptive_blind_ho_switch': 'CSFB',
      'utran_csfb_steering_switch': 'CSFB',
      'idle_csfb_redirect_opt_switch': 'CSFB',
      'dl_voip_bundling_switch': 'VOLTE',
      'ul_voip_pre_allocation_switch': 'VOLTE',
      'ul_voip_delay_sch_switch': 'VOLTE',
      'ul_voip_load_based_sch_switch': 'VOLTE',
      'ul_voip_serv_state_enhanced_sw': 'VOLTE',
      'ul_voip_sch_opt_switch': 'VOLTE',
      'ul_vo_lte_data_size_est_switch': 'VOLTE'
    };

    const groups: { [key: string]: IR001ParameterSummary[] } = {
      'SRVCC': [],
      'CSFB': [],
      'VOLTE': []
    };

    // Group parameters
    params.forEach(param => {
      const baselineType = baselineMapping[param.ParameterName];
      if (baselineType && groups[baselineType]) {
        groups[baselineType].push(param);
      }
    });

    // Calculate summaries for each baseline type
    const result: IBaselineTypeSummary[] = Object.keys(groups).map(baselineType => {
      const parameters = groups[baselineType];
      const totalCorrect = parameters.reduce((sum, p) => sum + (p.CorrectCount || 0), 0);
      const totalIncorrect = parameters.reduce((sum, p) => sum + (p.IncorrectCount || 0), 0);
      const total = totalCorrect + totalIncorrect;
      const percentage = total > 0 ? (totalCorrect / total) * 100 : 0;

      return {
        BaselineType: baselineType,
        CorrectCount: totalCorrect,
        IncorrectCount: totalIncorrect,
        TotalCount: total,
        CorrectPercentage: percentage,
        Parameters: parameters
      };
    });

    return result;
  }, []);

  const fetchAllData = useCallback(async (date?: string) => {
    if (!isMountedRef.current) return;
    
    if (isMountedRef.current) {
      setLoading(true);
    }
    
    try {
      const dateToUse = date || selectedDate;
      
      const [paramSummariesRes, runtimeRes, badRes] = await Promise.all([
        RnocR001Service.GetParameterSummaries(dateToUse),
        RnocR001Service.GetConfiguredSites(dateToUse),
        RnocR001Service.GetBadConfigurations(dateToUse)
      ]);

      if (!isMountedRef.current) return;

      // parameter-summaries returns array directly
      let params: IR001ParameterSummary[] = [];
      if (Array.isArray(paramSummariesRes)) {
        params = paramSummariesRes;
      } else if (paramSummariesRes?.Data && Array.isArray(paramSummariesRes.Data)) {
        params = paramSummariesRes.Data;
      }
      
      setParameterSummaries(params);
      
      // Group parameters by baseline type
      const grouped = groupParametersByBaselineType(params);
      setBaselineTypeSummaries(grouped);
      
      // configured-sites returns object with Data property
      if (runtimeRes?.Data) {
        setRuntimeData(runtimeRes.Data || []);
      } else if (Array.isArray(runtimeRes)) {
        setRuntimeData(runtimeRes);
      }
      
      // bad-configurations returns object with Data property
      if (badRes?.Data) {
        setBadData(badRes.Data || []);
      } else if (Array.isArray(badRes)) {
        setBadData(badRes);
      }
      
      if (isMountedRef.current) {
        refNotification.current?.showNotification("success", "Tải dữ liệu thành công!");
      }
    } catch (err) {
      if (isMountedRef.current) {
        refNotification.current?.showNotification("error", "Không thể tải dữ liệu. Vui lòng thử lại sau.");
        console.error('Error fetching data:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [selectedDate, groupParametersByBaselineType]);

  // Handle date change
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  // Handle submit with selected date
  const handleSubmit = useCallback(() => {
    fetchAllData(selectedDate);
  }, [selectedDate, fetchAllData]);

  // Refresh data function
  const refreshData = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Show correct configurations modal
  const showCorrectModal = () => {
    const correctItems = runtimeData.filter(item => {
      // Check if all parameters match the correct standard values (case-insensitive)
      return (item.UtranSrvccSwitch?.toUpperCase() === 'ON') &&
             (item.UtranCsfbSwitch?.toUpperCase() === 'ON') &&
             (item.UtranFlashCsfbSwitch?.toUpperCase() === 'OFF') &&
             (item.GeranFlashCsfbSwitch?.toUpperCase() === 'OFF') &&
             (item.CsfbAdaptiveBlindHoSwitch?.toUpperCase() === 'OFF') &&
             (item.UtranCsfbSteeringSwitch?.toUpperCase() === 'OFF') &&
             (item.IdleCsfbRedirectOptSwitch?.toUpperCase() === 'ON') &&
             (item.DlVoipBundlingSwitch?.toUpperCase() === 'ON') &&
             (item.UlVoipPreAllocationSwitch?.toUpperCase() === 'ON') &&
             (item.UlVoipDelaySchSwitch?.toUpperCase() === 'OFF') &&
             (item.UlVoipLoadBasedSchSwitch?.toUpperCase() === 'OFF') &&
             (item.UlVoipServStateEnhancedSw?.toUpperCase() === 'OFF') &&
             (item.UlVoipSchOptSwitch?.toUpperCase() === 'ON') &&
             (item.UlVoLteDataSizeEstSwitch?.toUpperCase() === 'OFF');
    });

    console.log('Runtime data:', runtimeData);
    console.log('Correct items found:', correctItems);

    setModalData(correctItems);
    setModalTitle('Danh sách cấu hình chuẩn');
    setModalCurrentPage(1); // Reset pagination
    setCorrectModalVisible(true);
  };

  // Show wrong configurations modal
  const showWrongModal = () => {
    setModalData(badData);
    setModalTitle('Danh sách cấu hình chưa chuẩn');
    setModalCurrentPage(1); // Reset pagination
    setWrongModalVisible(true);
  };

  // Export to Excel function
  const exportToExcel = () => {
    const isWrongModal = modalTitle.includes('chưa chuẩn');
    
    // Prepare data for export
    const exportData = modalData.map((item, index) => ({
      'STT': index + 1,
      'NE Name': item.NeName,
      'Cell ID': item.CellId,
      'UTRAN SRVCC': item.UtranSrvccSwitch || 'N/A',
      'UTRAN CSFB': item.UtranCsfbSwitch || 'N/A',
      'UTRAN Flash CSFB': item.UtranFlashCsfbSwitch || 'N/A',
      'GERAN Flash CSFB': item.GeranFlashCsfbSwitch || 'N/A',
      'CSFB Adaptive Blind HO': item.CsfbAdaptiveBlindHoSwitch || 'N/A',
      'UTRAN CSFB Steering': item.UtranCsfbSteeringSwitch || 'N/A',
      'Idle CSFB Redirect Opt': item.IdleCsfbRedirectOptSwitch || 'N/A',
      'DL VoIP Bundling': item.DlVoipBundlingSwitch || 'N/A',
      'UL VoIP Pre Allocation': item.UlVoipPreAllocationSwitch || 'N/A',
      'UL VoIP Delay SCH': item.UlVoipDelaySchSwitch || 'N/A',
      'UL VoIP Load Based SCH': item.UlVoipLoadBasedSchSwitch || 'N/A',
      'UL VoIP Serv State Enhanced': item.UlVoipServStateEnhancedSw || 'N/A',
      'UL VoIP SCH Opt': item.UlVoipSchOptSwitch || 'N/A',
      'UL VoLTE Data Size Est': item.UlVoLteDataSizeEstSwitch || 'N/A',
      [isWrongModal ? 'Detected Date' : 'Report Date']: isWrongModal 
        ? new Date(item.DetectedDate).toLocaleString('vi-VN')
        : new Date(item.ReportDate).toLocaleString('vi-VN')
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    const colWidths = [
      { wch: 5 },  // STT
      { wch: 20 }, // NE Name
      { wch: 10 }, // Cell ID
      { wch: 12 }, // UTRAN SRVCC
      { wch: 12 }, // UTRAN CSFB
      { wch: 15 }, // UTRAN Flash CSFB
      { wch: 15 }, // GERAN Flash CSFB
      { wch: 20 }, // CSFB Adaptive Blind HO
      { wch: 20 }, // UTRAN CSFB Steering
      { wch: 20 }, // Idle CSFB Redirect Opt
      { wch: 15 }, // DL VoIP Bundling
      { wch: 20 }, // UL VoIP Pre Allocation
      { wch: 15 }, // UL VoIP Delay SCH
      { wch: 20 }, // UL VoIP Load Based SCH
      { wch: 25 }, // UL VoIP Serv State Enhanced
      { wch: 15 }, // UL VoIP SCH Opt
      { wch: 20 }, // UL VoLTE Data Size Est
      { wch: 20 }  // Date
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, isWrongModal ? 'Cấu hình chưa chuẩn' : 'Cấu hình chuẩn');

    // Generate filename with date
    const fileName = `R001_${isWrongModal ? 'Cau_hinh_sai' : 'Cau_hinh_dung'}_${selectedDate.replace(/-/g, '')}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
  };

  // Memoized unique bad data (moved here before usage)
  const uniqueBadData = useMemo(() => {
    return badData.filter((item, index, self) =>
      index === self.findIndex((t) => (
        t.NeName === item.NeName && t.CellId === item.CellId && t.DetectedDate === item.DetectedDate
      ))
    );
  }, [badData]);

  // Handle fix action for bad configuration
  const handleFixConfiguration = (item: IR001DataRuntimeBad) => {
    // Show alert that command has been executed
    alert(`Đã thực hiện lệnh sửa cấu hình cho:\nNE Name: ${item.NeName}\nCell ID: ${item.CellId}\nDetected Date: ${new Date(item.DetectedDate).toLocaleString('vi-VN')}`);
  };

  // Handle fix all bad configurations
  const handleFixAllConfigurations = useCallback(() => {
    if (uniqueBadData.length === 0) {
      alert('Không có cấu hình sai để sửa!');
      return;
    }

    const confirmMessage = `Bạn có chắc chắn muốn sửa tất cả ${uniqueBadData.length} cấu hình sai không?`;
    
    if (window.confirm(confirmMessage)) {
      alert(`Đã thực hiện lệnh sửa tất cả ${uniqueBadData.length} cấu hình sai!\n\nDanh sách đã sửa:\n${uniqueBadData.slice(0, 5).map((item, idx) => `${idx + 1}. ${item.NeName} - Cell ${item.CellId}`).join('\n')}${uniqueBadData.length > 5 ? `\n... và ${uniqueBadData.length - 5} cấu hình khác` : ''}`);
    }
  }, [uniqueBadData]);

  // Export bad data to Excel function
  const exportBadDataToExcel = useCallback(() => {
    if (uniqueBadData.length === 0) {
      refNotification.current?.showNotification("warning", "Không có dữ liệu để xuất!");
      return;
    }
    
    // Prepare data for export
    const exportData = uniqueBadData.map((item, index) => ({
      'STT': index + 1,
      'NE Name': item.NeName,
      'Cell ID': item.CellId,
      'UTRAN SRVCC': item.UtranSrvccSwitch || 'N/A',
      'UTRAN CSFB': item.UtranCsfbSwitch || 'N/A',
      'UTRAN Flash CSFB': item.UtranFlashCsfbSwitch || 'N/A',
      'GERAN Flash CSFB': item.GeranFlashCsfbSwitch || 'N/A',
      'CSFB Adaptive Blind HO': item.CsfbAdaptiveBlindHoSwitch || 'N/A',
      'UTRAN CSFB Steering': item.UtranCsfbSteeringSwitch || 'N/A',
      'Idle CSFB Redirect Opt': item.IdleCsfbRedirectOptSwitch || 'N/A',
      'DL VoIP Bundling': item.DlVoipBundlingSwitch || 'N/A',
      'UL VoIP Pre Allocation': item.UlVoipPreAllocationSwitch || 'N/A',
      'UL VoIP Delay SCH': item.UlVoipDelaySchSwitch || 'N/A',
      'UL VoIP Load Based SCH': item.UlVoipLoadBasedSchSwitch || 'N/A',
      'UL VoIP Serv State Enhanced': item.UlVoipServStateEnhancedSw || 'N/A',
      'UL VoIP SCH Opt': item.UlVoipSchOptSwitch || 'N/A',
      'UL VoLTE Data Size Est': item.UlVoLteDataSizeEstSwitch || 'N/A',
      'Detected Date': new Date(item.DetectedDate).toLocaleString('vi-VN')
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    const colWidths = [
      { wch: 5 },  // STT
      { wch: 20 }, // NE Name
      { wch: 10 }, // Cell ID
      { wch: 12 }, // UTRAN SRVCC
      { wch: 12 }, // UTRAN CSFB
      { wch: 15 }, // UTRAN Flash CSFB
      { wch: 15 }, // GERAN Flash CSFB
      { wch: 20 }, // CSFB Adaptive Blind HO
      { wch: 20 }, // UTRAN CSFB Steering
      { wch: 20 }, // Idle CSFB Redirect Opt
      { wch: 15 }, // DL VoIP Bundling
      { wch: 20 }, // UL VoIP Pre Allocation
      { wch: 15 }, // UL VoIP Delay SCH
      { wch: 20 }, // UL VoIP Load Based SCH
      { wch: 25 }, // UL VoIP Serv State Enhanced
      { wch: 15 }, // UL VoIP SCH Opt
      { wch: 20 }, // UL VoLTE Data Size Est
      { wch: 20 }  // Detected Date
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cấu hình sai');

    // Generate filename with date
    const fileName = `R001_Cau_hinh_audit_sai_${selectedDate.replace(/-/g, '')}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
    
    refNotification.current?.showNotification("success", `Đã xuất ${uniqueBadData.length} bản ghi ra file Excel!`);
  }, [uniqueBadData, selectedDate]);

  // Helper function to check if parameter value is correct
  const isParameterCorrect = (paramName: string, value: string | null | undefined): boolean => {
    const upperValue = value?.toUpperCase();
    
    // Parameters that should be "ON"
    const shouldBeOn = [
      'UtranSrvccSwitch',
      'UtranCsfbSwitch',
      'IdleCsfbRedirectOptSwitch',
      'DlVoipBundlingSwitch',
      'UlVoipPreAllocationSwitch',
      'UlVoipSchOptSwitch'
    ];
    
    // Parameters that should be "OFF"
    const shouldBeOff = [
      'UtranFlashCsfbSwitch',
      'GeranFlashCsfbSwitch',
      'CsfbAdaptiveBlindHoSwitch',
      'UtranCsfbSteeringSwitch',
      'UlVoipDelaySchSwitch',
      'UlVoipLoadBasedSchSwitch',
      'UlVoipServStateEnhancedSw',
      'UlVoLteDataSizeEstSwitch'
    ];
    
    if (shouldBeOn.includes(paramName)) {
      return upperValue === 'ON';
    } else if (shouldBeOff.includes(paramName)) {
      return upperValue === 'OFF';
    }
    
    return false;
  };

  // Button groups for header
  const ButtonGroupsRender = useCallback(() => {
    return (
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="date-picker" className="form-label mb-0 fw-semibold">
            Chọn ngày:
          </label>
          <input
            id="date-picker"
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={handleDateChange}
            max={new Date().toISOString().split('T')[0]}
            style={{ width: '150px' }}
          />
        </div>
        <CtrlButton 
          title="Tìm kiếm" 
          onClick={handleSubmit} 
          type="primary"
          icon="el-icon-search"
          loading={loading}
        />
        <CtrlButton 
          title="Làm mới" 
          onClick={refreshData} 
          type="default"
          icon="el-icon-refresh"
        />
      </div>
    );
  }, [selectedDate, handleSubmit, refreshData, loading]);

  // Button groups for bad data tab with export
  const ButtonGroupsRenderWithExport = useCallback(() => {
    return (
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="date-picker" className="form-label mb-0 fw-semibold">
            Chọn ngày:
          </label>
          <input
            id="date-picker"
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={handleDateChange}
            max={new Date().toISOString().split('T')[0]}
            style={{ width: '150px' }}
          />
        </div>
        <CtrlButton 
          title="Tìm kiếm" 
          onClick={handleSubmit} 
          type="primary"
          icon="el-icon-search"
          loading={loading}
        />
        <CtrlButton 
          title="Làm mới" 
          onClick={refreshData} 
          type="default"
          icon="el-icon-refresh"
        />
        <CtrlButton 
          title="Sửa All" 
          onClick={handleFixAllConfigurations} 
          type="warning"
          icon="el-icon-edit"
          disabled={uniqueBadData.length === 0}
        />
        <CtrlButton 
          title="Xuất Excel" 
          onClick={exportBadDataToExcel} 
          type="success"
          icon="el-icon-download"
          disabled={uniqueBadData.length === 0}
        />
      </div>
    );
  }, [selectedDate, handleSubmit, refreshData, loading, uniqueBadData.length, handleFixAllConfigurations, exportBadDataToExcel]);

  // Show baseline type detail modal
  const showBaselineTypeDetail = (baselineType: IBaselineTypeSummary) => {
    setSelectedBaselineType(baselineType);
    setDetailModalVisible(true);
  };

  // Show single parameter detail (only show specific parameter column)
  const showSingleParameterDetail = (parameterName: string, showCorrect: boolean) => {
    // Map snake_case parameter name to PascalCase property name
    const paramMapping: { [key: string]: keyof IR001DataRuntime } = {
      'utran_srvcc_switch': 'UtranSrvccSwitch',
      'utran_csfb_switch': 'UtranCsfbSwitch',
      'utran_flash_csfb_switch': 'UtranFlashCsfbSwitch',
      'geran_flash_csfb_switch': 'GeranFlashCsfbSwitch',
      'csfb_adaptive_blind_ho_switch': 'CsfbAdaptiveBlindHoSwitch',
      'utran_csfb_steering_switch': 'UtranCsfbSteeringSwitch',
      'idle_csfb_redirect_opt_switch': 'IdleCsfbRedirectOptSwitch',
      'dl_voip_bundling_switch': 'DlVoipBundlingSwitch',
      'ul_voip_pre_allocation_switch': 'UlVoipPreAllocationSwitch',
      'ul_voip_delay_sch_switch': 'UlVoipDelaySchSwitch',
      'ul_voip_load_based_sch_switch': 'UlVoipLoadBasedSchSwitch',
      'ul_voip_serv_state_enhanced_sw': 'UlVoipServStateEnhancedSw',
      'ul_voip_sch_opt_switch': 'UlVoipSchOptSwitch',
      'ul_vo_lte_data_size_est_switch': 'UlVoLteDataSizeEstSwitch'
    };
    
    const propertyName = paramMapping[parameterName];
    if (!propertyName) return;
    
    // Get expected value for this parameter
    const shouldBeOn = [
      'UtranSrvccSwitch',
      'UtranCsfbSwitch',
      'IdleCsfbRedirectOptSwitch',
      'DlVoipBundlingSwitch',
      'UlVoipPreAllocationSwitch',
      'UlVoipSchOptSwitch'
    ];
    
    const expectedValue = shouldBeOn.includes(propertyName) ? 'ON' : 'OFF';
    
    if (showCorrect) {
      // Show correct configurations - filter from runtimeData
      const correctItems = runtimeData.filter(item => {
        const value = item[propertyName];
        return typeof value === 'string' && value.toUpperCase() === expectedValue;
      });
      setSingleParamData(correctItems);
      setSingleParamTitle(`Cấu hình chuẩn - ${parameterName}`);
    } else {
      // Show incorrect configurations - filter from runtimeData
      const incorrectItems = runtimeData.filter(item => {
        const value = item[propertyName];
        return typeof value === 'string' && value.toUpperCase() !== expectedValue;
      });
      
      setSingleParamData(incorrectItems);
      setSingleParamTitle(`Cấu hình chưa chuẩn - ${parameterName}`);
    }
    
    setSelectedParameterName(parameterName);
    setModalCurrentPage(1); // Reset pagination
    setSingleParamModalVisible(true);
  };

  // Show parameter detail (correct or incorrect configurations) - for baseline type detail
  const showParameterDetail = (parameterName: string, showCorrect: boolean) => {
    // Close the detail modal first
    setDetailModalVisible(false);
    
    // Map snake_case parameter name to PascalCase property name
    const paramMapping: { [key: string]: keyof IR001DataRuntime } = {
      'utran_srvcc_switch': 'UtranSrvccSwitch',
      'utran_csfb_switch': 'UtranCsfbSwitch',
      'utran_flash_csfb_switch': 'UtranFlashCsfbSwitch',
      'geran_flash_csfb_switch': 'GeranFlashCsfbSwitch',
      'csfb_adaptive_blind_ho_switch': 'CsfbAdaptiveBlindHoSwitch',
      'utran_csfb_steering_switch': 'UtranCsfbSteeringSwitch',
      'idle_csfb_redirect_opt_switch': 'IdleCsfbRedirectOptSwitch',
      'dl_voip_bundling_switch': 'DlVoipBundlingSwitch',
      'ul_voip_pre_allocation_switch': 'UlVoipPreAllocationSwitch',
      'ul_voip_delay_sch_switch': 'UlVoipDelaySchSwitch',
      'ul_voip_load_based_sch_switch': 'UlVoipLoadBasedSchSwitch',
      'ul_voip_serv_state_enhanced_sw': 'UlVoipServStateEnhancedSw',
      'ul_voip_sch_opt_switch': 'UlVoipSchOptSwitch',
      'ul_vo_lte_data_size_est_switch': 'UlVoLteDataSizeEstSwitch'
    };
    
    const propertyName = paramMapping[parameterName];
    if (!propertyName) return;
    
    // Get expected value for this parameter
    const shouldBeOn = [
      'UtranSrvccSwitch',
      'UtranCsfbSwitch',
      'IdleCsfbRedirectOptSwitch',
      'DlVoipBundlingSwitch',
      'UlVoipPreAllocationSwitch',
      'UlVoipSchOptSwitch'
    ];
    
    const expectedValue = shouldBeOn.includes(propertyName) ? 'ON' : 'OFF';
    
    if (showCorrect) {
      // Show correct configurations - filter from runtimeData
      const correctItems = runtimeData.filter(item => {
        const value = item[propertyName];
        return typeof value === 'string' && value.toUpperCase() === expectedValue;
      });
      setSingleParamData(correctItems);
      setSingleParamTitle(`Cấu hình chuẩn - ${parameterName}`);
    } else {
      // Show incorrect configurations - filter from runtimeData
      const incorrectItems = runtimeData.filter(item => {
        const value = item[propertyName];
        return typeof value === 'string' && value.toUpperCase() !== expectedValue;
      });
      
      setSingleParamData(incorrectItems);
      setSingleParamTitle(`Cấu hình chưa chuẩn - ${parameterName}`);
    }
    
    setSelectedParameterName(parameterName);
    setModalCurrentPage(1); // Reset pagination
    setSingleParamModalVisible(true);
  };

  // Memoized statistics calculations
  const statistics = useMemo(() => {
    // Calculate NE statistics
    const totalNE = Array.from(new Set(runtimeData.map(item => item.NeName))).filter(name => name).length;

    // Calculate Cell statistics
    const totalCells = runtimeData.length;
    
    // Calculate correct cells (all parameters must be correct)
    const correctCells = runtimeData.filter(item => {
      return (item.UtranSrvccSwitch?.toUpperCase() === 'ON') &&
             (item.UtranCsfbSwitch?.toUpperCase() === 'ON') &&
             (item.UtranFlashCsfbSwitch?.toUpperCase() === 'OFF') &&
             (item.GeranFlashCsfbSwitch?.toUpperCase() === 'OFF') &&
             (item.CsfbAdaptiveBlindHoSwitch?.toUpperCase() === 'OFF') &&
             (item.UtranCsfbSteeringSwitch?.toUpperCase() === 'OFF') &&
             (item.IdleCsfbRedirectOptSwitch?.toUpperCase() === 'ON') &&
             (item.DlVoipBundlingSwitch?.toUpperCase() === 'ON') &&
             (item.UlVoipPreAllocationSwitch?.toUpperCase() === 'ON') &&
             (item.UlVoipDelaySchSwitch?.toUpperCase() === 'OFF') &&
             (item.UlVoipLoadBasedSchSwitch?.toUpperCase() === 'OFF') &&
             (item.UlVoipServStateEnhancedSw?.toUpperCase() === 'OFF') &&
             (item.UlVoipSchOptSwitch?.toUpperCase() === 'ON') &&
             (item.UlVoLteDataSizeEstSwitch?.toUpperCase() === 'OFF');
    }).length;

    // Get unique bad cells
    const uniqueBadCells = badData.filter((item, index, self) =>
      index === self.findIndex((t) => (
        t.NeName === item.NeName && t.CellId === item.CellId
      ))
    ).length;

    return {
      totalNE,
      totalCells,
      correctCells,
      uniqueBadCells
    };
  }, [runtimeData, badData]);

  // Render overview pie charts for NE and Cell statistics
  const renderOverviewPieCharts = () => {
    const { totalNE, totalCells, correctCells, uniqueBadCells } = statistics;

    // NE Pie Chart Data
    const nePieData = {
      labels: ['NE đã kiểm tra'],
      datasets: [{
        data: [totalNE],
        backgroundColor: ['#52c41a'],
        borderColor: ['#fff'],
        borderWidth: 3
      }]
    };

    const nePieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.label || '';
              const value = context.parsed || 0;
              return `${label}: ${value}`;
            }
          }
        }
      }
    };

    // Cell Pie Chart Data
    const cellPieData = {
      labels: ['Cell chuẩn', 'Cell chưa chuẩn'],
      datasets: [{
        data: [correctCells, uniqueBadCells],
        backgroundColor: ['#52c41a', '#ff4d4f'],
        borderColor: ['#fff', '#fff'],
        borderWidth: 3
      }]
    };

    const cellPieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: { 
          display: true,
          position: 'bottom' as const,
          labels: {
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    };

      return (
      <div className="row g-4 mb-4">
        {/* NE Statistics Pie Chart */}
        <div className="col-xl-6 col-lg-6 col-md-12">
          <div className="card h-100 shadow-lg border-0">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <i className="fas fa-network-wired fa-2x text-success"></i>
              </div>
              <h4 className="card-title fw-bold mb-3">
                Thống kê NE đã kiểm tra
              </h4>
              
              <div style={{ height: '250px', position: 'relative' }} className="my-3">
                <Doughnut data={nePieData} options={nePieOptions} />
                <div className="position-absolute top-50 start-50 translate-middle">
                  <div className="fw-bold text-success" style={{ fontSize: '32px' }}>
                    {totalNE}
                  </div>
                  <small className="text-muted">NE</small>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top">
                <div className="text-center">
                  <div className="fw-bold" style={{ fontSize: '24px', color: '#52c41a' }}>
                    {totalNE}
                  </div>
                  <small className="text-muted">Tổng số NE đã kiểm tra</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cell Statistics Pie Chart */}
        <div className="col-xl-6 col-lg-6 col-md-12">
          <div className="card h-100 shadow-lg border-0">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <i className="fas fa-th fa-2x text-primary"></i>
              </div>
              <h4 className="card-title fw-bold mb-3">
                Thống kê Cell đã kiểm tra
              </h4>
              
              <div style={{ height: '250px', position: 'relative' }} className="my-3">
                <Doughnut data={cellPieData} options={cellPieOptions} />
                <div className="position-absolute top-50 start-50 translate-middle">
                  <div className="fw-bold text-primary" style={{ fontSize: '32px' }}>
                    {totalCells}
                  </div>
                  <small className="text-muted">Cell</small>
                </div>
              </div>

              <div className="d-flex justify-content-around mt-4">
                <div className="text-center">
                  <div className="fw-bold" style={{ fontSize: '20px', color: '#52c41a' }}>
                    {correctCells}
                  </div>
                  <small className="text-muted">Cell chuẩn</small>
                </div>
                <div className="text-center">
                  <div className="fw-bold" style={{ fontSize: '20px', color: '#ff4d4f' }}>
                    {uniqueBadCells}
                  </div>
                  <small className="text-muted">Cell chưa chuẩn</small>
                </div>
              </div>

              <div className="mt-3 pt-3 border-top">
                <small className="text-muted">
                  Tổng: <strong>{totalCells}</strong> Cell đã kiểm tra
                </small>
              </div>
            </div>
          </div>
        </div>
        </div>
      );
  };

  // Memoized parameter display names
  const parameterDisplayNames: { [key: string]: string } = useMemo(() => ({
      'utran_srvcc_switch': 'UTRAN SRVCC',
      'utran_csfb_switch': 'UTRAN CSFB',
      'utran_flash_csfb_switch': 'UTRAN Flash CSFB',
      'geran_flash_csfb_switch': 'GERAN Flash CSFB',
      'csfb_adaptive_blind_ho_switch': 'CSFB Adaptive Blind HO',
      'utran_csfb_steering_switch': 'UTRAN CSFB Steering',
      'idle_csfb_redirect_opt_switch': 'Idle CSFB Redirect Opt',
      'dl_voip_bundling_switch': 'DL VoIP Bundling',
      'ul_voip_pre_allocation_switch': 'UL VoIP Pre Allocation',
      'ul_voip_delay_sch_switch': 'UL VoIP Delay SCH',
      'ul_voip_load_based_sch_switch': 'UL VoIP Load Based SCH',
      'ul_voip_serv_state_enhanced_sw': 'UL VoIP Serv State Enhanced',
      'ul_voip_sch_opt_switch': 'UL VoIP SCH Opt',
      'ul_vo_lte_data_size_est_switch': 'UL VoLTE Data Size Est'
  }), []);

  // Render parameter summaries table
  const renderParameterSummariesTable = () => {
    if (!parameterSummaries || parameterSummaries.length === 0) {
      return (
        <div className="text-center p-4 text-muted">
          <i className="fas fa-info-circle me-2"></i>
          Không có dữ liệu tham số
        </div>
      );
    }

    return (
      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered">
          <thead style={{ backgroundColor: '#f8f9fa' }}>
            <tr>
              <th style={{ width: '50px' }}>STT</th>
              <th style={{ minWidth: '200px' }}>Tên tham số</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Tổng số</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Chuẩn</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Chưa chuẩn</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Tỷ lệ chuẩn (%)</th>
              <th style={{ width: '150px', textAlign: 'center' }}>Trạng thái</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {parameterSummaries.map((param, index) => {
              const displayName = parameterDisplayNames[param.ParameterName] || param.ParameterName;
              const percentage = param.CorrectPercentage || 0;
              const isGood = percentage >= 90;
              const isWarning = percentage >= 70 && percentage < 90;
              const isBad = percentage < 70;
              
              return (
                <tr key={param.ParameterName}>
                  <td className="text-center">{index + 1}</td>
                  <td>
                    <strong>{displayName}</strong>
                    <br />
                    <small className="text-muted">{param.ParameterName}</small>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-info fs-6">
                      {param.TotalCount?.toLocaleString() || '0'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span 
                      className="badge bg-success fs-6"
                      style={{ cursor: 'pointer' }}
                      onClick={() => showSingleParameterDetail(param.ParameterName, true)}
                      title="Click để xem chi tiết cấu hình chuẩn"
                    >
                      {param.CorrectCount?.toLocaleString() || '0'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span 
                      className="badge bg-danger fs-6"
                      style={{ cursor: 'pointer' }}
                      onClick={() => showSingleParameterDetail(param.ParameterName, false)}
                      title="Click để xem chi tiết cấu hình sai"
                    >
                      {param.IncorrectCount?.toLocaleString() || '0'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`badge fs-6 ${isGood ? 'bg-success' : isWarning ? 'bg-warning' : 'bg-danger'}`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </td>
                  <td className="text-center">
                    {isGood && (
                      <span className="badge bg-success">
                        <i className="fas fa-check-circle me-1"></i>
                        Tốt
                      </span>
                    )}
                    {isWarning && (
                      <span className="badge bg-warning">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        Cảnh báo
                      </span>
                    )}
                    {isBad && (
                      <span className="badge bg-danger">
                        <i className="fas fa-times-circle me-1"></i>
                        Cần sửa
                      </span>
                    )}
                  </td>
                  <td className="text-center">
                    <div className="btn-group btn-group-sm" role="group">
                      <button 
                        className="btn btn-outline-success btn-sm"
                        onClick={() => showSingleParameterDetail(param.ParameterName, true)}
                        disabled={param.CorrectCount === 0}
                        title="Xem cấu hình chuẩn"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button 
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => showSingleParameterDetail(param.ParameterName, false)}
                        disabled={param.IncorrectCount === 0}
                        title="Xem cấu hình sai"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* Summary row */}
        <div className="mt-4">
          <div className="row g-3">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body text-center">
                  <h4>{parameterSummaries.reduce((sum, p) => sum + (p.TotalCount || 0), 0).toLocaleString()}</h4>
                  <small>Tổng cấu hình</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body text-center">
                  <h4>{parameterSummaries.reduce((sum, p) => sum + (p.CorrectCount || 0), 0).toLocaleString()}</h4>
                  <small>Cấu hình chuẩn</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-danger text-white">
                <div className="card-body text-center">
                  <h4>{parameterSummaries.reduce((sum, p) => sum + (p.IncorrectCount || 0), 0).toLocaleString()}</h4>
                  <small>Cấu hình chưa chuẩn</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body text-center">
                  <h4>
                    {parameterSummaries.length > 0 
                      ? ((parameterSummaries.reduce((sum, p) => sum + (p.CorrectCount || 0), 0) / 
                          parameterSummaries.reduce((sum, p) => sum + (p.TotalCount || 0), 0)) * 100).toFixed(1)
                      : '0'
                    }%
                  </h4>
                  <small>Tỷ lệ chuẩn tổng</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render baseline type summaries with pie charts (3 charts only)
  const renderBaselineTypeSummaries = () => {
    if (!baselineTypeSummaries || baselineTypeSummaries.length === 0) {
      return (
        <div className="text-center p-4 text-muted">
          <i className="fas fa-info-circle me-2"></i>
          Không có dữ liệu tham số
        </div>
      );
    }

    return (
      <div className="row g-4 justify-content-center">
        {baselineTypeSummaries.map((baseline) => {
          const pieData = {
            labels: ['Chuẩn', 'Chưa chuẩn'],
            datasets: [{
              data: [baseline.CorrectCount || 0, baseline.IncorrectCount || 0],
              backgroundColor: ['#1890ff', '#d9d9d9'],
              borderColor: ['#fff', '#fff'],
              borderWidth: 3
            }]
          };

          const pieOptions = {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    return `${label}: ${value}`;
                  }
                }
              }
            }
          };

          // Get icon based on baseline type
          const getIcon = (type: string) => {
            switch(type) {
              case 'SRVCC': return 'fas fa-phone-alt';
              case 'CSFB': return 'fas fa-exchange-alt';
              case 'VOLTE': return 'fas fa-microphone';
              default: return 'fas fa-chart-pie';
            }
          };

          return (
            <div key={baseline.BaselineType} className="col-xl-4 col-lg-6 col-md-6">
              <div 
                className="card h-100 shadow-lg border-0"
                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                onClick={() => showBaselineTypeDetail(baseline)}
              >
                <div className="card-body text-center p-4">
                  <div className="mb-3">
                    <i className={`${getIcon(baseline.BaselineType)} fa-2x text-primary`}></i>
                  </div>
                  <h4 className="card-title fw-bold mb-3">
                    {baseline.BaselineType}
                  </h4>
                  <p className="text-muted small mb-3">
                    {baseline.Parameters.length} tham số
                  </p>
                  
                  <div style={{ height: '200px', position: 'relative' }} className="my-3">
                    <Doughnut data={pieData} options={pieOptions} />
                    <div className="position-absolute top-50 start-50 translate-middle">
                      <div className="fw-bold text-primary" style={{ fontSize: '24px' }}>
                        {baseline.CorrectPercentage?.toFixed(1) || 0}%
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-around mt-4">
                    <div className="text-center">
                      <div className="fw-bold" style={{ fontSize: '20px', color: '#1890ff' }}>
                        {baseline.CorrectCount || 0}
                      </div>
                      <small className="text-muted">Chuẩn</small>
                    </div>
                    <div className="text-center">
                      <div className="fw-bold" style={{ fontSize: '20px', color: '#8c8c8c' }}>
                        {baseline.IncorrectCount || 0}
                      </div>
                      <small className="text-muted">Chưa chuẩn</small>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-top">
                    <small className="text-muted">
                      Tổng: <strong>{baseline.TotalCount || 0}</strong> cấu hình
                    </small>
                  </div>

                  <div className="mt-3">
                    <button className="btn btn-outline-primary btn-sm">
                      <i className="fas fa-eye me-1"></i>
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render NE names list (Tab 1)
  const renderNeNamesList = () => {
    const uniqueNeNames = Array.from(new Set(runtimeData.map(item => item.NeName))).filter(name => name);
    
    return (
      <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        <table className="table table-sm table-striped table-hover">
          <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              <th style={{ width: '80px' }}>STT</th>
              <th>NE Name</th>
              <th style={{ width: '120px' }}>Số Cell</th>
            </tr>
          </thead>
          <tbody>
            {uniqueNeNames.map((neName, index) => {
              const cellCount = runtimeData.filter(item => item.NeName === neName).length;
              return (
                <tr key={index}>
                  <td className="text-center">{index + 1}</td>
                  <td>{neName}</td>
                  <td className="text-center">
                    <span className="badge bg-info">{cellCount}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {uniqueNeNames.length === 0 && (
          <div className="text-center p-4 text-muted">
            <i className="fas fa-info-circle me-2"></i>
            Không có dữ liệu
          </div>
        )}
      </div>
    );
  };

  // Render runtime data table (Tab 2)
  const renderRuntimeDataTable = () => {
    return (
      <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        <table className="table table-sm table-striped table-hover">
          <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              <th style={{ width: '60px' }}>STT</th>
              <th>NE Name</th>
              <th>Cell ID</th>
              <th>Report Date</th>
              <th>UTRAN SRVCC</th>
              <th>UTRAN CSFB</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {runtimeData.slice(0, 100).map((item, index) => (
              <tr key={item.Id}>
                <td className="text-center">{index + 1}</td>
                <td>{item.NeName}</td>
                <td className="text-center">{item.CellId}</td>
                <td>{new Date(item.ReportDate).toLocaleString('vi-VN')}</td>
                <td className="text-center">
                  <span className={`badge ${item.UtranSrvccSwitch === 'ON' ? 'bg-success' : 'bg-danger'}`}>
                    {item.UtranSrvccSwitch || 'N/A'}
                  </span>
                </td>
                <td className="text-center">
                  <span className={`badge ${item.UtranCsfbSwitch === 'ON' ? 'bg-success' : 'bg-danger'}`}>
                    {item.UtranCsfbSwitch || 'N/A'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-primary">
                    <i className="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {runtimeData.length > 100 && (
          <div className="text-center p-2 text-muted">
            <small>Hiển thị 100 bản ghi đầu tiên trong tổng số {runtimeData.length} bản ghi</small>
          </div>
        )}
        {runtimeData.length === 0 && (
          <div className="text-center p-4 text-muted">
            <i className="fas fa-info-circle me-2"></i>
            Không có dữ liệu
          </div>
        )}
      </div>
    );
  };

  // Paginated bad data
  const paginatedBadData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return uniqueBadData.slice(startIndex, endIndex);
  }, [uniqueBadData, currentPage, pageSize]);

  // Total pages
  const totalPages = useMemo(() => {
    return Math.ceil(uniqueBadData.length / pageSize);
  }, [uniqueBadData.length, pageSize]);

  // Paginated modal data
  const paginatedModalData = useMemo(() => {
    const startIndex = (modalCurrentPage - 1) * modalPageSize;
    const endIndex = startIndex + modalPageSize;
    return modalData.slice(startIndex, endIndex);
  }, [modalData, modalCurrentPage, modalPageSize]);

  // Paginated single param data
  const paginatedSingleParamData = useMemo(() => {
    const startIndex = (modalCurrentPage - 1) * modalPageSize;
    const endIndex = startIndex + modalPageSize;
    return singleParamData.slice(startIndex, endIndex);
  }, [singleParamData, modalCurrentPage, modalPageSize]);

  // Modal total pages
  const modalTotalPages = useMemo(() => {
    const dataLength = singleParamModalVisible ? singleParamData.length : modalData.length;
    return Math.ceil(dataLength / modalPageSize);
  }, [singleParamModalVisible, singleParamData.length, modalData.length, modalPageSize]);

  // Render pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return (
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-muted">
          Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, uniqueBadData.length)} trong tổng số {uniqueBadData.length} bản ghi
        </div>
        <nav>
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <i className="fas fa-angle-double-left"></i>
              </button>
            </li>
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="fas fa-angle-left"></i>
              </button>
            </li>
            {startPage > 1 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
              <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              </li>
            ))}
            {endPage < totalPages && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <i className="fas fa-angle-right"></i>
              </button>
            </li>
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  };

  // Render modal pagination component
  const renderModalPagination = () => {
    if (modalTotalPages <= 1) return null;

    const dataLength = singleParamModalVisible ? singleParamData.length : modalData.length;
    const maxVisiblePages = 5;
    let startPage = Math.max(1, modalCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(modalTotalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return (
      <div className="d-flex justify-content-between align-items-center mt-3 px-3">
        <div className="text-muted">
          Hiển thị {(modalCurrentPage - 1) * modalPageSize + 1} - {Math.min(modalCurrentPage * modalPageSize, dataLength)} trong tổng số {dataLength} bản ghi
        </div>
        <nav>
          <ul className="pagination mb-0">
            <li className={`page-item ${modalCurrentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setModalCurrentPage(1)}
                disabled={modalCurrentPage === 1}
              >
                <i className="fas fa-angle-double-left"></i>
              </button>
            </li>
            <li className={`page-item ${modalCurrentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setModalCurrentPage(modalCurrentPage - 1)}
                disabled={modalCurrentPage === 1}
              >
                <i className="fas fa-angle-left"></i>
              </button>
            </li>
            {startPage > 1 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
              <li key={page} className={`page-item ${modalCurrentPage === page ? 'active' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => setModalCurrentPage(page)}
                >
                  {page}
                </button>
              </li>
            ))}
            {endPage < modalTotalPages && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
            <li className={`page-item ${modalCurrentPage === modalTotalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setModalCurrentPage(modalCurrentPage + 1)}
                disabled={modalCurrentPage === modalTotalPages}
              >
                <i className="fas fa-angle-right"></i>
              </button>
            </li>
            <li className={`page-item ${modalCurrentPage === modalTotalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setModalCurrentPage(modalTotalPages)}
                disabled={modalCurrentPage === modalTotalPages}
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  };

  // Render bad data table (Tab 3)
  const renderBadDataTable = () => {
    return (
      <>
      <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        <table className="table table-sm table-striped table-hover table-bordered">
          <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              <th style={{ width: '50px' }}>STT</th>
              <th style={{ minWidth: '150px' }}>NE Name</th>
              <th style={{ width: '80px' }}>Cell ID</th>
              <th style={{ width: '110px' }}>UTRAN SRVCC</th>
              <th style={{ width: '110px' }}>UTRAN CSFB</th>
              <th style={{ width: '130px' }}>UTRAN Flash CSFB</th>
              <th style={{ width: '130px' }}>GERAN Flash CSFB</th>
              <th style={{ width: '150px' }}>CSFB Adaptive Blind HO</th>
              <th style={{ width: '150px' }}>UTRAN CSFB Steering</th>
              <th style={{ width: '150px' }}>Idle CSFB Redirect Opt</th>
              <th style={{ width: '130px' }}>DL VoIP Bundling</th>
              <th style={{ width: '150px' }}>UL VoIP Pre Allocation</th>
              <th style={{ width: '130px' }}>UL VoIP Delay SCH</th>
              <th style={{ width: '160px' }}>UL VoIP Load Based SCH</th>
              <th style={{ width: '180px' }}>UL VoIP Serv State Enhanced</th>
              <th style={{ width: '130px' }}>UL VoIP SCH Opt</th>
              <th style={{ width: '160px' }}>UL VoLTE Data Size Est</th>
              <th style={{ width: '100px' }}>Action</th>
              <th style={{ width: '120px' }}>Detected Date</th>
            </tr>
          </thead>
          <tbody>
              {paginatedBadData.map((item, index) => {
                const globalIndex = (currentPage - 1) * pageSize + index;
              return (
                <tr key={`${item.NeName}-${item.CellId}-${globalIndex}`}>
                  <td className="text-center">{globalIndex + 1}</td>
                  <td>{item.NeName}</td>
                  <td className="text-center">{item.CellId}</td>
                  <td className="text-center">
                    <span className={`badge ${!item.UtranSrvccSwitch || item.UtranSrvccSwitch === 'N/A' ? 'bg-info' : isParameterCorrect('UtranSrvccSwitch', item.UtranSrvccSwitch) ? 'bg-success' : 'bg-danger'}`}>
                      {item.UtranSrvccSwitch || 'N/A'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${!item.UtranCsfbSwitch || item.UtranCsfbSwitch === 'N/A' ? 'bg-info' : isParameterCorrect('UtranCsfbSwitch', item.UtranCsfbSwitch) ? 'bg-success' : 'bg-danger'}`}>
                      {item.UtranCsfbSwitch || 'N/A'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${!item.UtranFlashCsfbSwitch || item.UtranFlashCsfbSwitch === 'N/A' ? 'bg-info' : isParameterCorrect('UtranFlashCsfbSwitch', item.UtranFlashCsfbSwitch) ? 'bg-success' : 'bg-danger'}`}>
                      {item.UtranFlashCsfbSwitch || 'N/A'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${!item.GeranFlashCsfbSwitch || item.GeranFlashCsfbSwitch === 'N/A' ? 'bg-info' : isParameterCorrect('GeranFlashCsfbSwitch', item.GeranFlashCsfbSwitch) ? 'bg-success' : 'bg-danger'}`}>
                      {item.GeranFlashCsfbSwitch || 'N/A'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${!item.CsfbAdaptiveBlindHoSwitch || item.CsfbAdaptiveBlindHoSwitch === 'N/A' ? 'bg-info' : isParameterCorrect('CsfbAdaptiveBlindHoSwitch', item.CsfbAdaptiveBlindHoSwitch) ? 'bg-success' : 'bg-danger'}`}>
                      {item.CsfbAdaptiveBlindHoSwitch || 'N/A'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${!item.UtranCsfbSteeringSwitch || item.UtranCsfbSteeringSwitch === 'N/A' ? 'bg-info' : isParameterCorrect('UtranCsfbSteeringSwitch', item.UtranCsfbSteeringSwitch) ? 'bg-success' : 'bg-danger'}`}>
                      {item.UtranCsfbSteeringSwitch || 'N/A'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${!item.IdleCsfbRedirectOptSwitch || item.IdleCsfbRedirectOptSwitch === 'N/A' ? 'bg-info' : isParameterCorrect('IdleCsfbRedirectOptSwitch', item.IdleCsfbRedirectOptSwitch) ? 'bg-success' : 'bg-danger'}`}>
                      {item.IdleCsfbRedirectOptSwitch || 'N/A'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${!item.DlVoipBundlingSwitch || item.DlVoipBundlingSwitch === 'N/A' ? 'bg-info' : isParameterCorrect('DlVoipBundlingSwitch', item.DlVoipBundlingSwitch) ? 'bg-success' : 'bg-danger'}`}>
                      {item.DlVoipBundlingSwitch || 'N/A'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${!item.UlVoipPreAllocationSwitch || item.UlVoipPreAllocationSwitch === 'N/A' ? 'bg-info' : isParameterCorrect('UlVoipPreAllocationSwitch', item.UlVoipPreAllocationSwitch) ? 'bg-success' : 'bg-danger'}`}>
                      {item.UlVoipPreAllocationSwitch || 'N/A'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${!item.UlVoipDelaySchSwitch || item.UlVoipDelaySchSwitch === 'N/A' ? 'bg-info' : isParameterCorrect('UlVoipDelaySchSwitch', item.UlVoipDelaySchSwitch) ? 'bg-success' : 'bg-danger'}`}>
                      {item.UlVoipDelaySchSwitch || 'N/A'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${!item.UlVoipLoadBasedSchSwitch || item.UlVoipLoadBasedSchSwitch === 'N/A' ? 'bg-info' : isParameterCorrect('UlVoipLoadBasedSchSwitch', item.UlVoipLoadBasedSchSwitch) ? 'bg-success' : 'bg-danger'}`}>
                      {item.UlVoipLoadBasedSchSwitch || 'N/A'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${!item.UlVoipServStateEnhancedSw || item.UlVoipServStateEnhancedSw === 'N/A' ? 'bg-info' : isParameterCorrect('UlVoipServStateEnhancedSw', item.UlVoipServStateEnhancedSw) ? 'bg-success' : 'bg-danger'}`}>
                      {item.UlVoipServStateEnhancedSw || 'N/A'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${!item.UlVoipSchOptSwitch || item.UlVoipSchOptSwitch === 'N/A' ? 'bg-info' : isParameterCorrect('UlVoipSchOptSwitch', item.UlVoipSchOptSwitch) ? 'bg-success' : 'bg-danger'}`}>
                      {item.UlVoipSchOptSwitch || 'N/A'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${!item.UlVoLteDataSizeEstSwitch || item.UlVoLteDataSizeEstSwitch === 'N/A' ? 'bg-info' : isParameterCorrect('UlVoLteDataSizeEstSwitch', item.UlVoLteDataSizeEstSwitch) ? 'bg-success' : 'bg-danger'}`}>
                      {item.UlVoLteDataSizeEstSwitch || 'N/A'}
                    </span>
                  </td>
                  <td className="text-center">
                    <button 
                      className="btn btn-warning btn-sm"
                      onClick={() => handleFixConfiguration(item)}
                      title="Sửa cấu hình"
                    >
                      <i className="fas fa-edit"></i> Sửa
                    </button>
                  </td>
                  <td className="text-center">
                    {new Date(item.DetectedDate).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {uniqueBadData.length === 0 && (
          <div className="text-center p-4 text-muted">
            <i className="fas fa-check-circle text-success me-2"></i>
            Không có cấu hình sai
          </div>
        )}
      </div>
      {renderPagination()}
    </>
    );
  };

  // Render single parameter modal (only show specific parameter column)
  const renderSingleParameterModal = () => {
    if (!singleParamModalVisible || !selectedParameterName) return null;

    // Map parameter names to display names
    const parameterDisplayNames: { [key: string]: string } = {
      'utran_srvcc_switch': 'UTRAN SRVCC',
      'utran_csfb_switch': 'UTRAN CSFB',
      'utran_flash_csfb_switch': 'UTRAN Flash CSFB',
      'geran_flash_csfb_switch': 'GERAN Flash CSFB',
      'csfb_adaptive_blind_ho_switch': 'CSFB Adaptive Blind HO',
      'utran_csfb_steering_switch': 'UTRAN CSFB Steering',
      'idle_csfb_redirect_opt_switch': 'Idle CSFB Redirect Opt',
      'dl_voip_bundling_switch': 'DL VoIP Bundling',
      'ul_voip_pre_allocation_switch': 'UL VoIP Pre Allocation',
      'ul_voip_delay_sch_switch': 'UL VoIP Delay SCH',
      'ul_voip_load_based_sch_switch': 'UL VoIP Load Based SCH',
      'ul_voip_serv_state_enhanced_sw': 'UL VoIP Serv State Enhanced',
      'ul_voip_sch_opt_switch': 'UL VoIP SCH Opt',
      'ul_vo_lte_data_size_est_switch': 'UL VoLTE Data Size Est'
    };

    const paramMapping: { [key: string]: keyof IR001DataRuntime } = {
      'utran_srvcc_switch': 'UtranSrvccSwitch',
      'utran_csfb_switch': 'UtranCsfbSwitch',
      'utran_flash_csfb_switch': 'UtranFlashCsfbSwitch',
      'geran_flash_csfb_switch': 'GeranFlashCsfbSwitch',
      'csfb_adaptive_blind_ho_switch': 'CsfbAdaptiveBlindHoSwitch',
      'utran_csfb_steering_switch': 'UtranCsfbSteeringSwitch',
      'idle_csfb_redirect_opt_switch': 'IdleCsfbRedirectOptSwitch',
      'dl_voip_bundling_switch': 'DlVoipBundlingSwitch',
      'ul_voip_pre_allocation_switch': 'UlVoipPreAllocationSwitch',
      'ul_voip_delay_sch_switch': 'UlVoipDelaySchSwitch',
      'ul_voip_load_based_sch_switch': 'UlVoipLoadBasedSchSwitch',
      'ul_voip_serv_state_enhanced_sw': 'UlVoipServStateEnhancedSw',
      'ul_voip_sch_opt_switch': 'UlVoipSchOptSwitch',
      'ul_vo_lte_data_size_est_switch': 'UlVoLteDataSizeEstSwitch'
    };

    const displayName = parameterDisplayNames[selectedParameterName] || selectedParameterName;
    const propertyName = paramMapping[selectedParameterName];
    const isWrongModal = singleParamTitle.includes('sai');

    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                <i className="fas fa-list me-2"></i>
                {singleParamTitle} - {displayName}
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setSingleParamModalVisible(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                Hiển thị chi tiết cho tham số: <strong>{displayName}</strong>
              </div>
              
              <div className="table-responsive">
                <table className="table table-sm table-striped table-hover table-bordered">
                  <thead className="table-dark" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      <th style={{ width: '50px' }}>STT</th>
                      <th style={{ width: '120px' }}>NE Name</th>
                      <th style={{ width: '80px' }}>Cell ID</th>
                      <th style={{ width: '150px' }}>{displayName}</th>
                      {isWrongModal && <th style={{ width: '100px' }}>Action</th>}
                      <th style={{ width: '160px' }}>Report Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSingleParamData.map((item, index) => {
                      const globalIndex = (modalCurrentPage - 1) * modalPageSize + index;
                      const paramValue = item[propertyName as keyof typeof item];
                      return (
                        <tr key={globalIndex}>
                          <td className="text-center">{globalIndex + 1}</td>
                          <td>{item.NeName}</td>
                          <td className="text-center">{item.CellId}</td>
                          <td className="text-center">
                            <span className={`badge ${isParameterCorrect(propertyName as string, paramValue as string) ? 'bg-success' : 'bg-danger'}`}>
                              {paramValue || 'N/A'}
                            </span>
                          </td>
                          {isWrongModal && (
                            <td className="text-center">
                              <button 
                                className="btn btn-warning btn-sm"
                                onClick={() => handleFixConfiguration({...item, DetectedDate: item.ReportDate})}
                                title="Sửa cấu hình"
                              >
                                <i className="fas fa-edit"></i> Sửa
                              </button>
                            </td>
                          )}
                          <td className="text-center">
                            {new Date(item.ReportDate).toLocaleString('vi-VN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-3">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="card bg-info text-white">
                      <div className="card-body text-center">
                        <h4>{singleParamData.length.toLocaleString()}</h4>
                        <small>Tổng bản ghi</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className={`card ${isWrongModal ? 'bg-danger' : 'bg-success'} text-white`}>
                      <div className="card-body text-center">
                        <h4>{displayName}</h4>
                        <small>{isWrongModal ? 'Cấu hình chưa chuẩn' : 'Cấu hình chuẩn'}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Pagination */}
              {renderModalPagination()}
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setSingleParamModalVisible(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render baseline type detail modal
  const renderBaselineTypeDetailModal = () => {
    if (!detailModalVisible || !selectedBaselineType) return null;

    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                <i className="fas fa-info-circle me-2"></i>
                Chi tiết {selectedBaselineType.BaselineType} - {selectedBaselineType.Parameters.length} tham số
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setDetailModalVisible(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="row mb-4">
                <div className="col-md-12">
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="row text-center">
                        <div className="col-md-4">
                          <h3 style={{ color: '#1890ff' }}>{selectedBaselineType.CorrectPercentage.toFixed(1)}%</h3>
                          <small className="text-muted">Tỷ lệ chuẩn</small>
                        </div>
                        <div className="col-md-4">
                          <h3 style={{ color: '#1890ff' }}>{selectedBaselineType.CorrectCount}</h3>
                          <small className="text-muted">Cấu hình chưa chuẩn</small>
                        </div>
                        <div className="col-md-4">
                          <h3 style={{ color: '#8c8c8c' }}>{selectedBaselineType.IncorrectCount}</h3>
                          <small className="text-muted">Cấu hình chưa chuẩn</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                {selectedBaselineType.Parameters.map((param) => {
                  const pieData = {
                    labels: ['Chuẩn', 'Chưa chuẩn'],
                    datasets: [{
                      data: [param.CorrectCount || 0, param.IncorrectCount || 0],
                      backgroundColor: ['#1890ff', '#d9d9d9'],
                      borderColor: ['#fff', '#fff'],
                      borderWidth: 2
                    }]
                  };

                  const pieOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: function(context: any) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: ${value}`;
                          }
                        }
                      }
                    }
                  };

                  return (
                    <div key={param.ParameterName} className="col-xl-4 col-lg-6 col-md-6">
                      <div className="card h-100 shadow-sm">
                        <div className="card-body text-center">
                          <h6 className="card-title" style={{ fontSize: '13px', minHeight: '40px' }}>
                            {param.ParameterName}
                          </h6>
                          
                          <div style={{ height: '120px', position: 'relative' }} className="my-3">
                            <Doughnut data={pieData} options={pieOptions} />
                            <div className="position-absolute top-50 start-50 translate-middle">
                              <div className="fw-bold text-primary" style={{ fontSize: '16px' }}>
                                {param.CorrectPercentage?.toFixed(0) || 0}%
                              </div>
                            </div>
                          </div>

                          <div className="d-flex justify-content-around small mb-2">
                            <div style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => showParameterDetail(param.ParameterName, true)}>
                              <i className="fas fa-check-circle me-1"></i>
                              <strong>{param.CorrectCount || 0}</strong> Chuẩn
                            </div>
                            <div style={{ cursor: 'pointer', color: '#8c8c8c' }} onClick={() => showParameterDetail(param.ParameterName, false)}>
                              <i className="fas fa-times-circle me-1"></i>
                              <strong>{param.IncorrectCount || 0}</strong> Chưa chuẩn
                            </div>
                          </div>

                          <div className="mt-2 small text-muted mb-3">
                            Tổng: {param.TotalCount || 0}
                          </div>

                          <div className="btn-group btn-group-sm w-100" role="group">
                            <button 
                              type="button" 
                              className="btn btn-outline-primary"
                              onClick={() => showParameterDetail(param.ParameterName, true)}
                              disabled={param.CorrectCount === 0}
                            >
                              <i className="fas fa-list me-1"></i>
                              Xem chuẩn
                            </button>
                            <button 
                              type="button" 
                              className="btn btn-outline-secondary"
                              onClick={() => showParameterDetail(param.ParameterName, false)}
                              disabled={param.IncorrectCount === 0}
                            >
                              <i className="fas fa-list me-1"></i>
                              Xem chưa chuẩn
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setDetailModalVisible(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render modal
  const renderModal = (visible: boolean, onClose: () => void) => {
    if (!visible) return null;

    const isWrongModal = modalTitle.includes('sai');
    
    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-scrollable" style={{ maxWidth: '90%' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{modalTitle}</h5>
              <div className="d-flex gap-2">
                <button 
                  type="button" 
                  className="btn btn-success btn-sm"
                  onClick={exportToExcel}
                  title="Xuất Excel"
                >
                  <i className="fas fa-file-excel me-1"></i>
                  Xuất Excel
                </button>
                <button type="button" className="btn-close" onClick={onClose}></button>
              </div>
            </div>
            <div className="modal-body" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
              <div className="table-responsive">
                <table className="table table-sm table-striped table-hover table-bordered">
                  <thead className="table-dark" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      <th style={{ width: '50px' }}>STT</th>
                      <th style={{ minWidth: '150px' }}>NE Name</th>
                      <th style={{ width: '80px' }}>Cell ID</th>
                      <th style={{ width: '110px' }}>UTRAN SRVCC</th>
                      <th style={{ width: '110px' }}>UTRAN CSFB</th>
                      <th style={{ width: '130px' }}>UTRAN Flash CSFB</th>
                      <th style={{ width: '130px' }}>GERAN Flash CSFB</th>
                      <th style={{ width: '150px' }}>CSFB Adaptive Blind HO</th>
                      <th style={{ width: '150px' }}>UTRAN CSFB Steering</th>
                      <th style={{ width: '150px' }}>Idle CSFB Redirect Opt</th>
                      <th style={{ width: '130px' }}>DL VoIP Bundling</th>
                      <th style={{ width: '150px' }}>UL VoIP Pre Allocation</th>
                      <th style={{ width: '130px' }}>UL VoIP Delay SCH</th>
                      <th style={{ width: '160px' }}>UL VoIP Load Based SCH</th>
                      <th style={{ width: '180px' }}>UL VoIP Serv State Enhanced</th>
                      <th style={{ width: '130px' }}>UL VoIP SCH Opt</th>
                      <th style={{ width: '160px' }}>UL VoLTE Data Size Est</th>
                      {isWrongModal && <th style={{ width: '100px' }}>Action</th>}
                      <th style={{ width: '160px' }}>{isWrongModal ? 'Detected Date' : 'Report Date'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedModalData.map((item, index) => {
                      const globalIndex = (modalCurrentPage - 1) * modalPageSize + index;
                      return (
                      <tr key={globalIndex}>
                        <td className="text-center">{globalIndex + 1}</td>
                        <td>{item.NeName}</td>
                        <td className="text-center">{item.CellId}</td>
                        <td className="text-center">
                          <span className={`badge ${isParameterCorrect('UtranSrvccSwitch', item.UtranSrvccSwitch) ? 'bg-success' : 'bg-danger'}`}>
                            {item.UtranSrvccSwitch || 'N/A'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge ${isParameterCorrect('UtranCsfbSwitch', item.UtranCsfbSwitch) ? 'bg-success' : 'bg-danger'}`}>
                            {item.UtranCsfbSwitch || 'N/A'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge ${isParameterCorrect('UtranFlashCsfbSwitch', item.UtranFlashCsfbSwitch) ? 'bg-success' : 'bg-danger'}`}>
                            {item.UtranFlashCsfbSwitch || 'N/A'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge ${isParameterCorrect('GeranFlashCsfbSwitch', item.GeranFlashCsfbSwitch) ? 'bg-success' : 'bg-danger'}`}>
                            {item.GeranFlashCsfbSwitch || 'N/A'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge ${isParameterCorrect('CsfbAdaptiveBlindHoSwitch', item.CsfbAdaptiveBlindHoSwitch) ? 'bg-success' : 'bg-danger'}`}>
                            {item.CsfbAdaptiveBlindHoSwitch || 'N/A'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge ${isParameterCorrect('UtranCsfbSteeringSwitch', item.UtranCsfbSteeringSwitch) ? 'bg-success' : 'bg-danger'}`}>
                            {item.UtranCsfbSteeringSwitch || 'N/A'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge ${isParameterCorrect('IdleCsfbRedirectOptSwitch', item.IdleCsfbRedirectOptSwitch) ? 'bg-success' : 'bg-danger'}`}>
                            {item.IdleCsfbRedirectOptSwitch || 'N/A'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge ${isParameterCorrect('DlVoipBundlingSwitch', item.DlVoipBundlingSwitch) ? 'bg-success' : 'bg-danger'}`}>
                            {item.DlVoipBundlingSwitch || 'N/A'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge ${isParameterCorrect('UlVoipPreAllocationSwitch', item.UlVoipPreAllocationSwitch) ? 'bg-success' : 'bg-danger'}`}>
                            {item.UlVoipPreAllocationSwitch || 'N/A'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge ${isParameterCorrect('UlVoipDelaySchSwitch', item.UlVoipDelaySchSwitch) ? 'bg-success' : 'bg-danger'}`}>
                            {item.UlVoipDelaySchSwitch || 'N/A'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge ${isParameterCorrect('UlVoipLoadBasedSchSwitch', item.UlVoipLoadBasedSchSwitch) ? 'bg-success' : 'bg-danger'}`}>
                            {item.UlVoipLoadBasedSchSwitch || 'N/A'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge ${isParameterCorrect('UlVoipServStateEnhancedSw', item.UlVoipServStateEnhancedSw) ? 'bg-success' : 'bg-danger'}`}>
                            {item.UlVoipServStateEnhancedSw || 'N/A'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge ${isParameterCorrect('UlVoipSchOptSwitch', item.UlVoipSchOptSwitch) ? 'bg-success' : 'bg-danger'}`}>
                            {item.UlVoipSchOptSwitch || 'N/A'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge ${isParameterCorrect('UlVoLteDataSizeEstSwitch', item.UlVoLteDataSizeEstSwitch) ? 'bg-success' : 'bg-danger'}`}>
                            {item.UlVoLteDataSizeEstSwitch || 'N/A'}
                          </span>
                        </td>
                        {isWrongModal && (
                          <td className="text-center">
                            <button 
                              className="btn btn-warning btn-sm"
                              onClick={() => handleFixConfiguration(item)}
                              title="Sửa cấu hình"
                            >
                              <i className="fas fa-edit"></i> Sửa
                            </button>
                          </td>
                        )}
                        <td className="text-center">
                          {isWrongModal 
                            ? new Date(item.DetectedDate).toLocaleString('vi-VN')
                            : new Date(item.ReportDate).toLocaleString('vi-VN')
                          }
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {renderModalPagination()}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Đóng</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="mt-2">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <>
      <CtrlNotification ref={refNotification} />
      
      <Tab 
        key="r001-dashboard-tabs"
        activeName="parameters"
        tabsPanel={[
          {
              label: "Tổng quan tham số",
            name: "parameter-summary",
            panel: (
              <Card 
                title="Tổng quan tham số cấu hình - R001" 
                icon="fas fa-table" 
                buttonGroups={ButtonGroupsRender()}
              >
                <div className="alert alert-info mb-4">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Dashboard tổng quan:</strong> Hiển thị thống kê trạm và Cell đã kiểm tra. 
                  <strong> Click vào số liệu Chuẩn hóa/chưa chuẩn hóa</strong> để xem chi tiết cấu hình của từng tham số.
                </div>
                
                {/* Overview Pie Charts */}
                {renderOverviewPieCharts()}
                
                {/* Parameter Summary Table */}
                {renderParameterSummariesTable()}
              </Card>
            )
          },
          {
            label: "Tổng quan theo Baseline Type",
            name: "parameters",
            panel: (
              <Card 
                title="Dashboard Audit - R001 Cấu hình tự động mạng vô tuyến" 
                icon="fas fa-chart-pie" 
                buttonGroups={ButtonGroupsRender()}
              >
                <div className="alert alert-info mb-4">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Click vào biểu đồ</strong> để xem chi tiết các tham số trong từng Baseline Type
                </div>
                {renderBaselineTypeSummaries()}
              </Card>
            )
          },
          // {
          //   label: "Danh sách NE đã thực hiện",
          //   name: "ne-list",
          //   panel: (
          //     <Card 
          //       title="Danh sách NE đã thực hiện cấu hình" 
          //       icon="fas fa-list" 
          //       buttonGroups={ButtonGroupsRender()}
          //     >
          //       {renderNeNamesList()}
          //     </Card>
          //   )
          // },
          // {
          //   label: "Site thực hiện",
          //   name: "runtime",
          //   panel: (
          //     <Card 
          //       title="Chi tiết dữ liệu Cell Id" 
          //       icon="fas fa-database" 
          //       buttonGroups={ButtonGroupsRender()}
          //     >
          //       {renderRuntimeDataTable()}
          //     </Card>
          //   )
          // },
          {
            label: "Danh sách audit sai",
            name: "bad-config",
            panel: (
              <Card 
                title="Danh sách cấu hình audit sai" 
                icon="fas fa-exclamation-triangle text-danger" 
                buttonGroups={ButtonGroupsRenderWithExport()}
              >
                {renderBadDataTable()}
              </Card>
            )
          }
        ]}
        onTabClick={(tab: any) => {
          console.log('Tab clicked:', tab);
        }}
      />
       //thay đổi nội dung file
      {/* Modals */}
      {renderSingleParameterModal()}
      {renderBaselineTypeDetailModal()}
      {renderModal(correctModalVisible, () => setCorrectModalVisible(false))}
      {renderModal(wrongModalVisible, () => setWrongModalVisible(false))}
    </>
  );
};

const mapState = ({ ...state }) => ({
  Apps: state.apps
});

const mapDispatchToProps = {};

export default connect(mapState, mapDispatchToProps)(DashboardAudit);

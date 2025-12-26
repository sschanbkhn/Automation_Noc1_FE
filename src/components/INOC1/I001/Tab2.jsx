import React, { useState, useMemo } from 'react';
import { mockTab2ASNData, PRTG_GROUPS, mockASNGrowthWeekly, mockASNGrowthMonthly } from './mockDataTab2';
import Tab2Service from 'services/Tab2Service';
import { Cookie } from 'helpers/cookie';

// ============================================
// TopASNTable Component - Display TOP 20 ASN with expandable prefix details
// Features: Shows Max In/Out, expandable prefix list with scrollbar (max 6 visible)
// ============================================
const TopASNTable = ({ data, expandedASNId, onRowClick }) => (
  <div className="top-asn-table-container">
    <table className="top-asn-table">
      <thead>
        <tr>
          <th style={{ width: '60px' }}>STT</th>
          <th style={{ width: '100px' }}>ASN</th>
          <th style={{ flex: 1, minWidth: '200px' }}>AS Name</th>
          <th style={{ width: '140px' }}>Max In</th>
          <th style={{ width: '140px' }}>Max Out</th>
          <th style={{ width: '50px' }}>Chi tiết</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <React.Fragment key={row.id}>
            <tr className="asn-row" onClick={() => onRowClick(row)} style={{ cursor: 'pointer' }}>
              <td className="text-center" style={{ width: '60px' }}>{row.stt}</td>
              <td className="font-mono" style={{ width: '100px' }}>{row.asn}</td>
              <td style={{ flex: 1, minWidth: '200px' }}>{row.asName}</td>
              <td className="text-right" style={{ width: '140px' }}><span className="badge badge-in">{row.maxIn}</span></td>
              <td className="text-right" style={{ width: '140px' }}><span className="badge badge-out">{row.maxOut}</span></td>
              <td className="text-center" style={{ width: '50px' }}><span className="expand-icon" style={{ fontSize: '12px' }}>{expandedASNId === row.id ? '▼' : '▶'}</span></td>
            </tr>
            {expandedASNId === row.id && row.prefixes && (
              <tr className="prefix-row">
                <td colSpan={6}>
                  <div className="prefix-container">
                    <h4 style={{ marginBottom: '12px' }}>Chi tiết Prefix ({row.prefixes.length}):</h4>
                    <div className="prefix-details-list" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                      {row.prefixes.map((prefix, idx) => (
                        <div key={idx} className="prefix-detail-item" style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
                          <div className="prefix-info">
                            <div className="prefix-name" style={{ marginBottom: '8px' }}>
                              <span className="prefix-icon">📍</span>
                              <code style={{ fontWeight: '500' }}>{prefix.prefix}</code>
                              {prefix.isCountered && <span className="countered-badge" style={{ marginLeft: '8px', color: '#f59e0b', fontSize: '12px' }}>Đã counter</span>}
                            </div>
                          </div>
                          <div className="prefix-traffic" style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
                            <div className="traffic-item">
                              <span className="traffic-label" style={{ color: '#6b7280' }}>Max In:</span>
                              <span className="traffic-value in" style={{ marginLeft: '4px', color: '#3b82f6', fontWeight: '500' }}>{prefix.maxIn}</span>
                            </div>
                            <div className="traffic-item">
                              <span className="traffic-label" style={{ color: '#6b7280' }}>Max Out:</span>
                              <span className="traffic-value out" style={{ marginLeft: '4px', color: '#10b981', fontWeight: '500' }}>{prefix.maxOut}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  </div>
);

// ============================================
// AddCounterModal Component - Modal for adding new ASN counters
// Features: ASN/Name input → Prefix selection (with isCountered check) → PRTG Group selection (single) → Device selection (6 POPs, all default)
// ============================================
const AddCounterModal = ({ asnList, onApply, onCancel, selectedDate, usedPRTGGroupIds = [] }) => {
  const [inputASN, setInputASN] = useState('');
  const [inputASName, setInputASName] = useState('');
  const [selectedPrefixes, setSelectedPrefixes] = useState([]);
  const [selectedPRTGGroup, setSelectedPRTGGroup] = useState('');
  const [asnAlreadyCountered, setAsnAlreadyCountered] = useState(false);
  const [checkingAsn, setCheckingAsn] = useState(false);
  const [availablePrefixes, setAvailablePrefixes] = useState([]);
  const [loadingPrefixes, setLoadingPrefixes] = useState(false);
  const [asnError, setAsnError] = useState('');

  const foundASN = useMemo(() => {
    if (!inputASN.trim()) return null;
    const normalize = (v) => String(v || '').replace(/^AS/i, '').trim();
    return asnList.find((a) => normalize(a.asn) === normalize(inputASN));
  }, [inputASN, asnList]);

  const isFormValid = inputASN.trim() !== '' && inputASName.trim() !== '' && selectedPrefixes.length > 0 && selectedPRTGGroup !== '';

  React.useEffect(() => {
    console.debug('AddCounterModal - usedPRTGGroupIds:', usedPRTGGroupIds);
  }, [usedPRTGGroupIds]);

  const handleASNChange = async (value) => {
    setInputASN(value);
    setInputASName('');
    setSelectedPrefixes([]);
    setSelectedPRTGGroup('');
    setAvailablePrefixes([]);
    setAsnError('');
    setAsnAlreadyCountered(false);
    setCheckingAsn(false);
    
    // Remove AS prefix and validate
    const asnNumber = value.trim().replace(/^AS/i, '');
    
    if (!asnNumber) return;
    
    // Check if ASN exists in current list
    const found = asnList.find((a) => String(a.asn) === asnNumber);
    let usedCache = false;
    if (found) {
      setInputASName(found.asName);
      // Use cached prefixes if available (but still proceed to check counter status)
      if (found.prefixes && found.prefixes.length > 0) {
        setAvailablePrefixes(found.prefixes);
        usedCache = true;
      }
    }
    
    // Fetch prefixes from API for any ASN (even if not in TOP 20)
    if (asnNumber && /^\d+$/.test(asnNumber)) {
      setLoadingPrefixes(true);
      try {
        if (!usedCache) {
          console.log('🔍 Fetching prefixes for ASN:', asnNumber, 'Date:', selectedDate);
          const response = await Tab2Service.GetPrefixFromASN(asnNumber, selectedDate);
          if (response?.status === 'success' && Array.isArray(response.data)) {
            if (response.data.length > 0) {
              const transformedPrefixes = response.data.map(prefix => ({
                prefix: prefix.prefix || 'Unknown',
                maxIn: prefix.max_in ? `${parseFloat(prefix.max_in).toFixed(2)} Gbps` : '0.00 Gbps',
                maxOut: prefix.max_out ? `${parseFloat(prefix.max_out).toFixed(2)} Gbps` : '0.00 Gbps',
                isCountered: prefix.is_countered || false
              }));
              // check which prefixes are already countered via API and merge
              try {
                console.debug('Calling CheckPrefixesUsed for ASN (add-modal):', asnNumber);
                const prefRes = await Tab2Service.CheckPrefixesUsed(asnNumber);
                console.debug('CheckPrefixesUsed response for ASN (add-modal):', asnNumber, prefRes);
                const usedSet = (prefRes?.status === 'success' && Array.isArray(prefRes.data)) ? new Set(prefRes.data.map(p => String(p).trim())) : new Set();
                const merged = transformedPrefixes.map(tp => ({ ...tp, isCountered: !!tp.isCountered || usedSet.has(String(tp.prefix).trim()) }));
                setAvailablePrefixes(merged);
              } catch (e) {
                console.debug('Failed to check prefixes used for ASN', asnNumber, e);
                setAvailablePrefixes(transformedPrefixes);
              }
              setAsnError('');
            } else {
              setAvailablePrefixes([]);
              setAsnError('Không tìm thấy prefix cho ASN này');
            }
          } else {
            setAvailablePrefixes([]);
            setAsnError('Lỗi khi tải danh sách prefix');
          }
        }
      } catch (err) {
        console.error('❌ Error fetching prefixes:', err);
        setAvailablePrefixes([]);
        setAsnError('Không thể kết nối đến server');
      } finally {
        setLoadingPrefixes(false);
      }
      // Check whether ASN is already countered
      setCheckingAsn(true);
      try {
        const chk = await Tab2Service.CheckASNCounter(asnNumber);
        // backend may return boolean OR { status, data } where data can be boolean, object, or array
        if (typeof chk === 'boolean') {
          setAsnAlreadyCountered(!!chk);
        } else if (chk?.status === 'success') {
          // If backend returns an array of records => exists when length > 0
          if (Array.isArray(chk.data)) {
            // ensure returned records actually match requested ASN
            const match = chk.data.some(item => String(item.asn) === String(asnNumber) || String(item.asn) === String('AS' + asnNumber));
            setAsnAlreadyCountered(!!match);
          } else if (typeof chk.data === 'boolean') {
            setAsnAlreadyCountered(!!chk.data);
          } else if (typeof chk.data === 'object' && chk.data !== null) {
            // support { isCountered: true } or similar
            setAsnAlreadyCountered(!!(chk.data.isCountered ?? chk.data.exists ?? false));
          } else {
            setAsnAlreadyCountered(false);
          }
        } else {
          setAsnAlreadyCountered(false);
        }
      } catch (e) {
        console.error('Error checking ASN counter state', e);
        setAsnAlreadyCountered(false);
      } finally {
        setCheckingAsn(false);
      }
    }
  };

  const handlePrefixChange = (prefix, checked) => {
    setSelectedPrefixes((prev) => {
      if (checked) {
        return prev.includes(prefix) ? prev : [...prev, prefix];
      }
      return prev.filter((p) => p !== prefix);
    });
  };

  // Device selection removed — devices will no longer be selected in this modal

  const handleApply = () => {
    if (isFormValid) {
      onApply({
        asn: inputASN.trim(),
        asName: inputASName.trim(),
        selectedPrefixes,
        selectedPRTGGroup: parseInt(selectedPRTGGroup),
        isAlreadyCountered: asnAlreadyCountered
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content add-counter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Add Counter</h3>
            <p className="modal-subtitle">Thêm counter cho ASN mới</p>
          </div>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        {/* ASN Information Section */}
        <div className="add-counter-section">
          <h4 className="section-header">Thông tin ASN</h4>
          <div className="asn-input-group">
            <div className="input-field">
              <label htmlFor="asn-input">ASN</label>
              <input 
                id="asn-input" 
                type="text" 
                placeholder="e.g., AS64512" 
                value={inputASN} 
                onChange={(e) => handleASNChange(e.target.value)} 
                className="form-input" 
              />
                <div style={{ marginTop: '6px', fontSize: '13px' }}>
                  {checkingAsn ? (
                    <span style={{ color: '#6b7280' }}>Checking counter status...</span>
                  ) : (
                    <span style={{ color: asnAlreadyCountered ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                      {asnAlreadyCountered ? 'Đã được counter' : 'Chưa được counter'}
                    </span>
                  )}
                </div>
            </div>
            <div className="input-field">
              <label htmlFor="asname-input">AS Name</label>
              <input 
                id="asname-input" 
                type="text" 
                placeholder="e.g., TECHNET-AS" 
                value={inputASName} 
                onChange={(e) => setInputASName(e.target.value)} 
                className="form-input" 
                disabled={!!foundASN} 
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loadingPrefixes && (
          <div className="add-counter-section">
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
              <div className="spinner" style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ marginTop: '10px' }}>Đang tải danh sách prefix...</p>
            </div>
          </div>
        )}
        
        {/* Error State */}
        {asnError && !loadingPrefixes && (
          <div className="add-counter-section">
            <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626' }}>
              ⚠️ {asnError}
            </div>
          </div>
        )}

        {/* Prefix Selection Section - Shows after ASN is entered */}
        {availablePrefixes.length > 0 && !loadingPrefixes && (
          <div className="add-counter-section">
            <h4 className="section-header">Chọn Prefix (Đã chọn: {selectedPrefixes.length})</h4>
            <div className="prefix-selection-list" style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '8px' }}>
              {availablePrefixes.map((prefix) => {
                const isDisabled = prefix.isCountered;
                return (
                  <label 
                    key={prefix.prefix} 
                    className={`prefix-selection-item ${isDisabled ? 'disabled' : ''}`}
                    style={{ opacity: isDisabled ? 0.6 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer', marginBottom: '8px' }}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedPrefixes.includes(prefix.prefix)} 
                      onChange={(e) => !isDisabled && handlePrefixChange(prefix.prefix, e.target.checked)} 
                      disabled={isDisabled} 
                    />
                    <div className="prefix-selection-content">
                      <div className="prefix-text">
                        <code>{prefix.prefix}</code>
                        {isDisabled && <span className="disabled-badge" style={{ marginLeft: '8px', color: '#f59e0b', fontSize: '12px' }}>Đã được counter</span>}
                      </div>
                      <div className="prefix-traffic-info">
                        <span className="traffic-badge in">Max In: {prefix.maxIn}</span>
                        <span className="traffic-badge out">Max Out: {prefix.maxOut}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* PRTG Group Selection - Single selection only */}
        <div className="add-counter-section">
          <h4 className="section-header">Chọn PRTG-ID Group (Chọn 1)</h4>
          <div className="prtg-group-selection" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {PRTG_GROUPS.map((group) => {
              const disabled = usedPRTGGroupIds.includes(Number(group.id));
              return (
                <label 
                  key={group.id} 
                  className="prtg-group-radio"
                  style={{
                    padding: '10px',
                    border: selectedPRTGGroup === group.id.toString() ? '2px solid #2563eb' : '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    textAlign: 'center',
                    backgroundColor: selectedPRTGGroup === group.id.toString() ? '#dbeafe' : '#f9fafb',
                    opacity: disabled ? 0.6 : 1
                  }}
                >
                  <input 
                    type="radio" 
                    name="prtg-group" 
                    value={group.id} 
                    disabled={disabled}
                    checked={selectedPRTGGroup === group.id.toString()} 
                    onChange={(e) => setSelectedPRTGGroup(e.target.value)} 
                    style={{ marginRight: '6px' }}
                  />
                  <span className="group-label" style={{ fontWeight: '500' }}>{group.name}{disabled ? ' (used)' : ''}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Device selection removed — devices are not chosen from this modal anymore */}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Hủy bỏ</button>
          <button className="btn btn-primary" onClick={handleApply} disabled={!isFormValid}>Apply</button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ConfirmApplyModal Component - Confirmation before applying config to devices
// ============================================
const ConfirmApplyModal = ({ asn, asName, prefixes, prtgGroup, isAlreadyCountered, onApply, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-content modal-confirm-apply" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Xác nhận cấu hình</h3>
        <button className="modal-close" onClick={onCancel}>✕</button>
      </div>
      <div className="confirm-message-section">
        <div className="confirm-icon">✓</div>
        <p>Bạn có chắc muốn thêm counter cho ASN này?</p>
      </div>
      <div className="confirm-summary-section">
        <div className="summary-row"><span className="summary-label">ASN:</span><span className="summary-value">{asn}</span></div>
        <div className="summary-row"><span className="summary-label">AS Name:</span><span className="summary-value">{asName}</span></div>
        <div className="summary-row"><span className="summary-label">PRTG Group:</span><span className="summary-value">Group{prtgGroup}</span></div>
        <div className="summary-row"><span className="summary-label">Số Prefix:</span><span className="summary-value">{prefixes.length}</span></div>
        <div className="summary-row"><span className="summary-label">Đã counter:</span><span className="summary-value">{isAlreadyCountered ? 'True' : 'False'}</span></div>
        {/* devices removed from summary */}
      </div>
      <div className="confirm-details-section">
        <h4 className="details-header">Danh sách Prefix:</h4>
        <div className="prefixes-list-confirm">
          {prefixes.map((prefix, idx) => (
            <div key={idx} className="prefix-item-confirm">
              <span className="prefix-icon">📍</span>
              <code>{prefix}</code>
            </div>
          ))}
        </div>
      </div>
      {/* devices list removed */}
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onCancel}>Hủy bỏ</button>
        <button className="btn btn-primary" onClick={onApply}>Đồng ý</button>
      </div>
    </div>
  </div>
);

// ============================================
// ResultDisplayModal Component - Shows configuration result per device
// ============================================
const ResultDisplayModal = ({ result, onClose }) => {
  const stats = useMemo(() => {
    const successCount = result.results.filter((r) => r.status === 'success').length;
    const failedCount = result.results.filter((r) => r.status === 'failed').length;
    return {
      success: successCount,
      failed: failedCount,
      total: result.results.length
    };
  }, [result.results]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-result-display" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Kết quả cấu hình</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="result-summary-cards">
          <div className="summary-card success-card"><div className="card-number">{stats.success}</div><div className="card-label">Thành công</div></div>
          <div className="summary-card failed-card"><div className="card-number">{stats.failed}</div><div className="card-label">Thất bại</div></div>
          <div className="summary-card total-card"><div className="card-number">{stats.total}</div><div className="card-label">Tổng cộng</div></div>
        </div>
        <div className="result-config-info">
          <div className="config-row"><span className="config-label">ASN:</span><span className="config-value">{result.asn}</span></div>
          <div className="config-row"><span className="config-label">AS Name:</span><span className="config-value">{result.asName}</span></div>
          <div className="config-row"><span className="config-label">Thời gian:</span><span className="config-value">{result.timestamp}</span></div>
        </div>
        <div className="result-details-section">
          <h4 className="details-header">Chi tiết kết quả từng thiết bị:</h4>
          <div className="result-items-list">
            {result.results.map((item, idx) => (
              <div key={idx} className={`result-item-card ${item.status}`}>
                <div className="result-item-icon">{item.status === 'success' ? '✓' : '✗'}</div>
                <div className="result-item-info">
                  <div className="result-item-device">{item.device}</div>
                  <div className="result-item-message">{item.message}</div>
                </div>
                <div className="result-item-status">{item.status === 'success' ? 'Thành công' : 'Thất bại'}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// DateRangePickerModal Component - Expandable modal for selecting week/month ranges
// Features: Shows available weeks or months based on period type, allows date range selection
// ============================================
const DateRangePickerModal = ({ period, onSelectRange, onClose }) => {
  const weekOptions = [
    { id: 'week1', label: 'Tuần 1 (1-7 Jan)', value: 'Week 1 (1-7 Jan)' },
    { id: 'week2', label: 'Tuần 2 (8-14 Jan)', value: 'Week 2 (8-14 Jan)' },
    { id: 'week3', label: 'Tuần 3 (15-21 Jan)', value: 'Week 3 (15-21 Jan)' },
    { id: 'week4', label: 'Tuần 4 (22-28 Jan)', value: 'Week 4 (22-28 Jan)' },
    { id: 'week5', label: 'Tuần 5 (29 Jan - 4 Feb)', value: 'Week 5 (29 Jan - 4 Feb)' }
  ];

  const monthOptions = [
    { id: 'jan', label: 'Tháng 1 (Jan)', value: 'January' },
    { id: 'feb', label: 'Tháng 2 (Feb)', value: 'February' },
    { id: 'mar', label: 'Tháng 3 (Mar)', value: 'March' },
    { id: 'apr', label: 'Tháng 4 (Apr)', value: 'April' },
    { id: 'may', label: 'Tháng 5 (May)', value: 'May' },
    { id: 'jun', label: 'Tháng 6 (Jun)', value: 'June' },
    { id: 'jul', label: 'Tháng 7 (Jul)', value: 'July' },
    { id: 'aug', label: 'Tháng 8 (Aug)', value: 'August' },
    { id: 'sep', label: 'Tháng 9 (Sep)', value: 'September' },
    { id: 'oct', label: 'Tháng 10 (Oct)', value: 'October' },
    { id: 'nov', label: 'Tháng 11 (Nov)', value: 'November' },
    { id: 'dec', label: 'Tháng 12 (Dec)', value: 'December' }
  ];

  const options = period === 'week' ? weekOptions : monthOptions;
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);

  const handleApply = () => {
    if (selectedFrom && selectedTo) {
      onSelectRange(selectedFrom.value, selectedTo.value);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-date-range-picker" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3>Chọn khoảng thời gian</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
            {period === 'week' ? 'Chọn Tuần' : 'Chọn Tháng'}
          </h4>
        </div>

        <div style={{ padding: '20px', display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Từ</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedFrom(option)}
                  style={{
                    padding: '10px 12px',
                    border: selectedFrom?.id === option.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                    borderRadius: '6px',
                    background: selectedFrom?.id === option.id ? '#dbeafe' : '#f9fafb',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: selectedFrom?.id === option.id ? '600' : '500',
                    color: '#1f2937',
                    transition: 'all 0.2s'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Đến</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedTo(option)}
                  style={{
                    padding: '10px 12px',
                    border: selectedTo?.id === option.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                    borderRadius: '6px',
                    background: selectedTo?.id === option.id ? '#dbeafe' : '#f9fafb',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: selectedTo?.id === option.id ? '600' : '500',
                    color: '#1f2937',
                    transition: 'all 0.2s'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Hủy bỏ</button>
          <button className="btn btn-primary" onClick={handleApply} disabled={!selectedFrom || !selectedTo}>Áp dụng</button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ASNGrowthTable Component - Shows ASN growth statistics with sorting & period selection
// Features: Week/Month period selector, expandable date range picker modal, sortable columns (Max In / % Growth), pagination
// ============================================
const ASNGrowthTable = ({ data, period, sortBy, onSortChange, onPeriodChange, onDateRangeChange, currentPage, onPageChange, totalPages, dateRange }) => {
  const [periodType, setPeriodType] = useState(period);
  const [fromDate, setFromDate] = useState(dateRange?.from || '');
  const [toDate, setToDate] = useState(dateRange?.to || '');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handlePeriodChange = (newPeriod) => {
    setPeriodType(newPeriod);
    onPeriodChange(newPeriod);
    setFromDate('');
    setToDate('');
  };

  const handleDateRangeSelect = (from, to) => {
    setFromDate(from);
    setToDate(to);
    onDateRangeChange({ from, to });
    setShowDatePicker(false);
  };

  return (
    <div className="asn-growth-table-container">
      <div className="growth-header">
        <h3 className="growth-title">Dữ liệu tăng trưởng ASN</h3>
        <p className="growth-subtitle">Tăng trưởng lưu lượng Max in theo khoảng thời gian</p>
      </div>
      <div className="growth-controls">
        <div className="control-group">
          <label>Thống kê theo:</label>
          <select value={periodType} onChange={(e) => handlePeriodChange(e.target.value)}>
            <option value="week">Tuần</option>
            <option value="month">Tháng</option>
          </select>
        </div>
        <div className="control-group">
          <label>Từ:</label>
          <button
            className="date-range-picker-btn"
            onClick={() => setShowDatePicker(true)}
            style={{
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              background: '#f9fafb',
              cursor: 'pointer',
              fontSize: '13px',
              color: fromDate ? '#1f2937' : '#9ca3af',
              fontWeight: '500',
              minWidth: '180px',
              textAlign: 'left'
            }}
          >
            {fromDate || (periodType === 'week' ? 'Chọn tuần' : 'Chọn tháng')}
          </button>
        </div>
        <div className="control-group">
          <label>Đến:</label>
          <button
            className="date-range-picker-btn"
            onClick={() => setShowDatePicker(true)}
            style={{
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              background: '#f9fafb',
              cursor: 'pointer',
              fontSize: '13px',
              color: toDate ? '#1f2937' : '#9ca3af',
              fontWeight: '500',
              minWidth: '180px',
              textAlign: 'left'
            }}
          >
            {toDate || (periodType === 'week' ? 'Chọn tuần' : 'Chọn tháng')}
          </button>
        </div>
        <div className="control-group">
          <label>Sắp xếp theo:</label>
          <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
            <option value="maxIn">Max In</option>
            <option value="growth">% Tăng trưởng</option>
          </select>
        </div>
      </div>
      <table className="growth-data-table">
        <thead>
          <tr>
            <th style={{ width: '60px' }}>STT</th>
            <th style={{ width: '120px' }}>ASN</th>
            <th style={{ flex: 1 }}>AS Name</th>
            <th style={{ width: '160px' }}>Max In</th>
            <th style={{ width: '160px' }}>% Tăng trưởng</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={`${row.asn}-${row.stt}`}>
              <td className="text-center">{row.stt}</td>
              <td className="font-mono">{row.asn}</td>
              <td>{row.asName}</td>
              <td className="text-right"><span className="badge badge-in">{row.maxIn}</span></td>
              <td className="text-right"><span className="badge badge-growth" style={{ color: row.growthPercent > 0 ? '#10b981' : '#ef4444' }}>
                {row.growthPercent > 0 ? '+' : ''}{row.growthPercent.toFixed(1)}%
              </span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="growth-pagination">
        <div className="pagination-info">
          Trang {currentPage} / {totalPages}
        </div>
        <div className="pagination-controls">
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>← Trước</button>
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Sau →</button>
        </div>
      </div>

      {/* Date Range Picker Modal */}
      {showDatePicker && (
        <DateRangePickerModal
          period={periodType}
          onSelectRange={handleDateRangeSelect}
          onClose={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
};

// ============================================
// Tab2 Main Component - IPT Counter Management with 2 tables and Add Counter flow
// ============================================
function Tab2() {
  const [asnData, setAsnData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedASNId, setExpandedASNId] = useState(null);
  const [prefixData, setPrefixData] = useState({}); // Store prefixes by ASN ID
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalState, setModalState] = useState('closed');
  const [addCounterData, setAddCounterData] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingSubMessage, setLoadingSubMessage] = useState('');
  const [growthPeriod, setGrowthPeriod] = useState('week');
  const [growthSortBy, setGrowthSortBy] = useState('maxIn');
  const [growthPage, setGrowthPage] = useState(1);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [usedPRTGGroupIds, setUsedPRTGGroupIds] = useState([]);
  const growthItemsPerPage = 10;

  // Fetch TOP 20 ASN data from API when component mounts or date changes
  React.useEffect(() => {
    const fetchTopASNData = async () => {
      setLoading(true);
      try {
        console.log('🔄 Fetching TOP 20 ASN data for date:', selectedDate);
        const response = await Tab2Service.GetArborASTraffic(selectedDate);
        
        if (response?.status === 'success' && Array.isArray(response.data) && response.data.length > 0) {
          console.log('✅ GetArborASTraffic SUCCESS - Data count:', response.data.length);
          
          // Sort by max_in descending and take TOP 20
          const sortedData = [...response.data].sort((a, b) => {
            const aMaxIn = parseFloat(a.max_in) || 0;
            const bMaxIn = parseFloat(b.max_in) || 0;
            return bMaxIn - aMaxIn;
          });
          
          const top20 = sortedData.slice(0, 20);
          console.log('✅ TOP 20 ASN extracted');
          
          // Transform to component format
          const transformedData = top20.map((item, index) => ({
            id: item.id || `asn-${index}`,
            stt: index + 1,
            asn: item.asn || `AS${item.as_number || 'Unknown'}`,
            asName: item.as_name || 'Unknown AS',
            maxIn: item.max_in ? `${parseFloat(item.max_in).toFixed(2)} Gbps` : '0.00 Gbps',
            maxOut: item.max_out ? `${parseFloat(item.max_out).toFixed(2)} Gbps` : '0.00 Gbps',
            prefixes: [] // Will be loaded when expanded
          }));
          
          console.log('✅ Transformed TOP 20 ASN data:', transformedData.slice(0, 3));
          setAsnData(transformedData);
        } else {
          console.warn('⚠️ GetArborASTraffic failed or no data');
          setAsnData([]);
        }
      } catch (err) {
        console.error('❌ Fetch TOP ASN error:', err);
        setAsnData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopASNData();
  }, [selectedDate]);

  // Handle ASN row click - fetch prefixes when expanding
  const handleASNRowClick = async (row) => {
    const newExpandedId = expandedASNId === row.id ? null : row.id;
    setExpandedASNId(newExpandedId);
    
    // If expanding and prefixes not loaded yet, fetch from API
    if (newExpandedId && !prefixData[row.id]) {
      try {
        const normalizedAsn = String(row.asn || '').replace(/^AS/i, '').trim();
        console.log('🔄 Fetching prefixes for ASN:', row.asn, 'normalized:', normalizedAsn, 'date:', selectedDate);
        const response = await Tab2Service.GetPrefixFromASN(normalizedAsn, selectedDate);
        
        if (response?.status === 'success' && Array.isArray(response.data) && response.data.length > 0) {
          console.log('✅ GetPrefixFromASN SUCCESS - Prefix count:', response.data.length);
          
          // Transform prefix data
          const transformedPrefixes = response.data.map(prefix => ({
            prefix: prefix.prefix || prefix.prefix_name || 'Unknown',
            maxIn: prefix.max_in ? `${parseFloat(prefix.max_in).toFixed(2)} Gbps` : '0.00 Gbps',
            maxOut: prefix.max_out ? `${parseFloat(prefix.max_out).toFixed(2)} Gbps` : '0.00 Gbps',
            isCountered: prefix.is_countered || false
          }));
          console.log('✅ Transformed prefix data:', transformedPrefixes.slice(0, 3));

          // Check which prefixes are already used and merge
          try {
            console.debug('Calling CheckPrefixesUsed for ASN (expand-row):', normalizedAsn);
            const prefRes = await Tab2Service.CheckPrefixesUsed(String(normalizedAsn));
            console.debug('CheckPrefixesUsed response for ASN (expand-row):', normalizedAsn, prefRes);
            const usedSet = (prefRes?.status === 'success' && Array.isArray(prefRes.data)) ? new Set(prefRes.data.map(p => String(p).trim())) : new Set();
            const merged = transformedPrefixes.map(tp => ({ ...tp, isCountered: !!tp.isCountered || usedSet.has(String(tp.prefix).trim()) }));

            // Store prefixes for this ASN
            setPrefixData(prev => ({
              ...prev,
              [row.id]: merged
            }));

            // Update asnData with prefixes
            setAsnData(prevData => 
              prevData.map(asn => 
                asn.id === row.id 
                  ? { ...asn, prefixes: merged }
                  : asn
              )
            );
          } catch (e) {
            console.debug('Failed to check prefixes used for ASN in expansion', normalizedAsn, e);
            setPrefixData(prev => ({ ...prev, [row.id]: transformedPrefixes }));
            setAsnData(prevData => prevData.map(asn => asn.id === row.id ? { ...asn, prefixes: transformedPrefixes } : asn));
          }
        } else {
          console.warn('⚠️ GetPrefixFromASN failed or no data for ASN:', row.asn);
          // Set empty prefixes
          setPrefixData(prev => ({
            ...prev,
            [row.id]: []
          }));
        }
      } catch (err) {
        console.error('❌ Fetch prefix error:', err);
        setPrefixData(prev => ({
          ...prev,
          [row.id]: []
        }));
      }
    }
  };

  const handleAddCounterClick = async () => {
    // fetch used PRTG group ids before opening modal so modal can disable them
    try {
      const resp = await Tab2Service.CheckPRTGGroupUsed();
      console.debug('CheckPRTGGroupUsed response:', resp);
      if (resp?.status === 'success' && Array.isArray(resp.data)) {
        setUsedPRTGGroupIds(resp.data.map((n) => Number(n)));
      } else {
        setUsedPRTGGroupIds([]);
      }
    } catch (err) {
      console.debug('Failed to fetch used PRTG groups', err);
      setUsedPRTGGroupIds([]);
    }
    setModalState('addCounter');
  };

  const handleAddCounterApply = (data) => {
    setAddCounterData(data);
    setModalState('confirm');
  };

  const handleAddCounterCancel = () => {
    setModalState('closed');
    setAddCounterData(null);
  };

  const handleConfirmAddCounter = async () => {
    if (!addCounterData) return;
    try {
      // Start loading modal to block user actions
      setLoadingMessage('Đang gửi lệnh đến N8N...');
      setLoadingSubMessage('Vui lòng không thao tác trong khi hệ thống gửi lệnh.');
      setModalState('loading');

      // Post Add-ASN-Counter to backend (which forwards to N8N)
      // Get current user from cookie (set at login). Fall back to env or empty string if not available.
      let userUpdate = '';
      try {
        const u = Cookie.getCookie('UserInfo');
        if (u) {
          const parsed = JSON.parse(u);
          userUpdate = parsed?.UserName || parsed?.UserName || '';
        }
      } catch (e) {
        console.warn('Unable to parse UserInfo cookie', e);
      }
      userUpdate = userUpdate || process.env.REACT_APP_USER_UPDATE || '';

      const postRes = await Tab2Service.PostAddASNCounterToN8(
        addCounterData.asn,
        addCounterData.asName,
        addCounterData.selectedPrefixes,
        addCounterData.selectedPRTGGroup,
        !!addCounterData.isAlreadyCountered,
        userUpdate
      );

      if (postRes?.status !== 'success') {
        throw new Error(postRes?.message || 'Lỗi khi gửi lệnh đến N8N');
      }

      // Let N8N process (short wait), update messages
      setLoadingMessage('N8N đang xử lý lệnh...');
      setLoadingSubMessage('Hệ thống đang áp dụng cấu hình. Đang chờ kết quả...');
      await new Promise(r => setTimeout(r, 2000));

      // Fetch result from backend Config-Counter-result (support multiple response shapes)
      setLoadingMessage('Đang lấy kết quả cấu hình...');
      setLoadingSubMessage('Kiểm tra trạng thái áp dụng trên từng thiết bị...');
      const resultRes = await Tab2Service.GetConfigCounterResult();

      // Normalize device results from several possible backend shapes
      const extractDeviceResults = (res) => {
        // res may be: { status, latest_sample: { data, updated_at }, ... }
        // or: { status, data: { data: { device: {...} }, updated_at }, ... }
        // or: { status, data: { device: {...} }, ... }
        let container = null;
        let updatedAt = null;

        if (!res) return { map: {}, updatedAt: null };

        if (res.latest_sample && res.latest_sample.data) {
          container = res.latest_sample.data;
          updatedAt = res.latest_sample.updated_at || res.latest_sample.timestamp || res.updated_at;
        } else if (res.data && res.data.data) {
          container = res.data.data;
          updatedAt = res.data.updated_at || res.data.timestamp || res.updated_at;
        } else if (res.data && typeof res.data === 'object') {
          // maybe res.data is directly the device map
          container = res.data;
          updatedAt = res.updated_at || res.data.updated_at || null;
        } else if (res.raw_result && res.raw_result.data) {
          container = res.raw_result.data;
          updatedAt = res.updated_at || null;
        }

        if (!container) return { map: {}, updatedAt };

        const map = {};
        Object.keys(container).forEach(deviceName => {
          const d = container[deviceName];
          // d may contain { status, message, data: {...} }
          let status = d?.status || (d?.data && d.data.status) || 'failed';
          let message = d?.message || d?.data?.message || '';
          // if no explicit status but diff exists, assume success
          if (!status && d?.data && Object.keys(d.data).length > 0) status = 'success';
          map[deviceName] = { status, message };
        });

        return { map, updatedAt };
      };

      if (resultRes?.status === 'success') {
        const { map: deviceResultsRaw, updatedAt } = extractDeviceResults(resultRes);
        const deviceResults = [];
        let successCount = 0;
        let failedCount = 0;

        Object.keys(deviceResultsRaw).forEach(deviceName => {
          const deviceData = deviceResultsRaw[deviceName];
          const isSuccess = String(deviceData.status).toLowerCase() === 'success';
          if (isSuccess) {
            successCount++;
            deviceResults.push({ device: deviceName, status: 'success', message: deviceData.message || 'Cấu hình thành công' });
          } else {
            failedCount++;
            deviceResults.push({ device: deviceName, status: 'failed', message: deviceData.message || 'Lỗi không xác định' });
          }
        });

        const result = {
          timestamp: new Date(updatedAt || Date.now()).toLocaleString('vi-VN'),
          asn: addCounterData.asn,
          asName: addCounterData.asName,
          prefixes: addCounterData.selectedPrefixes,
          results: deviceResults
        };

        setResultData(result);
        setModalState('result');

        // If not all devices succeeded, show an additional alert
        const total = successCount + failedCount;
        if (total > 0 && successCount < total) {
          alert(`Kết quả: ${successCount}/${total} thiết bị áp dụng thành công. Vui lòng kiểm tra chi tiết.`);
        }
      } else {
        throw new Error(resultRes?.message || 'Không thể lấy kết quả cấu hình');
      }
    } catch (err) {
      console.error('AddCounter flow error:', err);
      setModalState('closed');
      alert(`❌ Lỗi khi áp dụng cấu hình:\n\n${err.message || err}\n\nVui lòng thử lại hoặc liên hệ quản trị viên.`);
    }
  };

  const handleConfirmCancel = () => {
    setModalState('addCounter');
  };

  const handleResultClose = () => {
    setModalState('closed');
    setResultData(null);
    setAddCounterData(null);
  };

  const growthData = useMemo(() => {
    const data = growthPeriod === 'week' ? mockASNGrowthWeekly : mockASNGrowthMonthly;
    let sorted = [...data];

    if (growthSortBy === 'maxIn') {
      sorted.sort((a, b) => {
        const aNum = parseFloat(a.maxIn);
        const bNum = parseFloat(b.maxIn);
        return bNum - aNum;
      });
    } else if (growthSortBy === 'growth') {
      sorted.sort((a, b) => b.growthPercent - a.growthPercent);
    }

    return sorted;
  }, [growthPeriod, growthSortBy]);

  const paginatedGrowthData = useMemo(() => {
    const start = (growthPage - 1) * growthItemsPerPage;
    const end = start + growthItemsPerPage;
    return growthData.slice(start, end);
  }, [growthData, growthPage]);

  const totalGrowthPages = Math.ceil(growthData.length / growthItemsPerPage);

  return (
    <div className="tab2-container">
      <div className="tab2-header">
        <div className="header-left">
          <h3 className="tab2-title">Thống kê IPT - TOP 20 ASN</h3>
          <p className="tab2-subtitle">Lưu lượng cao nhất theo ngày</p>
        </div>
        <div className="header-right">
          <div className="date-picker-group">
            <label htmlFor="tab2-date-picker">Chọn ngày:</label>
            <input 
              id="tab2-date-picker" 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="date-picker-input" 
            />
          </div>
          <button className="btn-add-counter" onClick={handleAddCounterClick}>+ Add Counter</button>
        </div>
      </div>

      {/* Table 1: TOP 20 ASN Statistics */}
      <div className="tab2-table-section">
        <TopASNTable data={asnData} expandedASNId={expandedASNId} onRowClick={handleASNRowClick} />
      </div>

      {/* Table 2: ASN Grow
          selectedDate={selectedDate}h Data */}
      <div className="tab2-growth-section">
        <ASNGrowthTable
          data={paginatedGrowthData}
          period={growthPeriod}
          sortBy={growthSortBy}
          onSortChange={setGrowthSortBy}
          onPeriodChange={(period) => { setGrowthPeriod(period); setGrowthPage(1); }}
          onDateRangeChange={setDateRange}
          currentPage={growthPage}
          onPageChange={setGrowthPage}
          totalPages={totalGrowthPages}
          dateRange={dateRange}
        />
      </div>

      {/* Modal: Add Counter */}
      {modalState === 'addCounter' && (
        <AddCounterModal 
          asnList={asnData}
          selectedDate={selectedDate}
          usedPRTGGroupIds={usedPRTGGroupIds}
          onApply={handleAddCounterApply} 
          onCancel={handleAddCounterCancel} 
        />
      )}

      {/* Modal: Confirm Apply */}
      {modalState === 'confirm' && addCounterData && (
        <ConfirmApplyModal 
          asn={addCounterData.asn} 
          asName={addCounterData.asName} 
          prefixes={addCounterData.selectedPrefixes} 
          prtgGroup={addCounterData.selectedPRTGGroup} 
          isAlreadyCountered={!!addCounterData.isAlreadyCountered}
          onApply={handleConfirmAddCounter} 
          onCancel={handleConfirmCancel} 
        />
      )}

      {/* Modal: Result Display */}
      {modalState === 'result' && resultData && (
        <ResultDisplayModal result={resultData} onClose={handleResultClose} />
      )}
      {/* Modal: Loading / Sending to N8N (blocks UI) */}
      {modalState === 'loading' && (
        <div className="modal-overlay" onClick={() => {}}>
          <div className="modal-content modal-loading" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>
            <h3 style={{ marginBottom: '6px' }}>{loadingMessage}</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>{loadingSubMessage}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <div className="spinner" style={{ width: '28px', height: '28px', border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tab2;

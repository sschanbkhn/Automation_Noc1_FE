import React, { useState } from 'react';
import { mockIPTMonitoringData, IPTMonitoringItem, DEFAULT_TRIGGER_ALARM, DEFAULT_ROLLBACK_TIME } from './mockDataTab3';
import IPTMonitoringTable from './IPTMonitoringTable';
import AddIPTModal from './AddIPTModal';
import SetTriggerAlarmModal from './SetTriggerAlarmModal';
import SetTimeToRollbackModal from './SetTimeToRollbackModal';

type ModalState = 'closed' | 'addIPT' | 'triggerAlarm' | 'rollbackTime';

const Tab3AdminWork: React.FC = () => {
  const [iptData, setIptData] = useState<IPTMonitoringItem[]>(mockIPTMonitoringData);
  const [modalState, setModalState] = useState<ModalState>('closed');
  const [currentTriggerAlarm, setCurrentTriggerAlarm] = useState<number>(DEFAULT_TRIGGER_ALARM);
  const [currentRollbackTime, setCurrentRollbackTime] = useState<string>(DEFAULT_ROLLBACK_TIME);

  // Handle Add IPT
  const handleAddIPT = (newIPT: Omit<IPTMonitoringItem, 'id' | 'stt'>) => {
    const newItem: IPTMonitoringItem = {
      ...newIPT,
      id: Math.max(...iptData.map(item => item.id), 0) + 1,
      stt: iptData.length + 1
    };
    setIptData([...iptData, newItem]);
    setModalState('closed');
  };

  // Handle Set Trigger Alarm
  const handleSetTriggerAlarm = (alarmLevel: number) => {
    setCurrentTriggerAlarm(alarmLevel);
    setModalState('closed');
  };

  // Handle Set Time to Rollback
  const handleSetTimeToRollback = (time: string) => {
    setCurrentRollbackTime(time);
    setModalState('closed');
  };

  return (
    <div className="tab3-container">
      {/* Header Section */}
      <div className="tab3-header">
        <div className="header-left">
          <h3 className="tab3-title">Admin Work - Quản lý theo dõi IPT</h3>
          <p className="tab3-subtitle">Thêm, cấu hình và quản lý các điểm theo dõi lưu lượng IPT</p>
        </div>
        <div className="header-right">
          <button
            className="btn btn-add-ipt"
            onClick={() => setModalState('addIPT')}
          >
            + Add IPT
          </button>
          <button
            className="btn btn-trigger-alarm"
            onClick={() => setModalState('triggerAlarm')}
          >
            ⚠ Set Trigger Alarm
          </button>
          <button
            className="btn btn-rollback-time"
            onClick={() => setModalState('rollbackTime')}
          >
            ⏱ Set Time to Rollback
          </button>
        </div>
      </div>

      {/* Alert Boxes Section */}
      <div className="tab3-alert-boxes">
        <div className="alert-box trigger-alarm-box">
          <div className="alert-label">Ngưỡng Trigger Alarm hiện tại</div>
          <div className="alert-value">{currentTriggerAlarm}%</div>
        </div>
        <div className="alert-box rollback-time-box">
          <div className="alert-label">Thời gian Rollback hệ thống sẽ từng</div>
          <div className="alert-value">{currentRollbackTime}</div>
        </div>
      </div>

      {/* Table Section */}
      <div className="tab3-table-section">
        <h4 className="table-title">Danh sách IPT đang được theo dõi</h4>
        <IPTMonitoringTable data={iptData} />
      </div>

      {/* Modals */}
      {modalState === 'addIPT' && (
        <AddIPTModal
          onApply={handleAddIPT}
          onCancel={() => setModalState('closed')}
        />
      )}

      {modalState === 'triggerAlarm' && (
        <SetTriggerAlarmModal
          currentAlarm={currentTriggerAlarm}
          onApply={handleSetTriggerAlarm}
          onCancel={() => setModalState('closed')}
        />
      )}

      {modalState === 'rollbackTime' && (
        <SetTimeToRollbackModal
          currentTime={currentRollbackTime}
          onApply={handleSetTimeToRollback}
          onCancel={() => setModalState('closed')}
        />
      )}
    </div>
  );
};

export default Tab3AdminWork;

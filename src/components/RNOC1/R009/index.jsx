import React, { useEffect, useState } from 'react';
import { fetchWorkflow, updateWorkflow } from './api';
import UpdateWorkflowButton from './UpdateWorkflowButton';

const INTERVAL_OPTIONS = [
  { value: 'minutes', label: 'Phút' },
  { value: 'hours', label: 'Giờ' },
  { value: 'days', label: 'Ngày' },
  { value: 'weeks', label: 'Tuần' },
  { value: 'months', label: 'Tháng' },
  { value: 'custom', label: 'Tùy chỉnh (Cron)' }
];

const HOURS = Array.from({ length: 24 }, (_, i) => ({ value: i, label: `${i}h` }));
const MINUTES = Array.from({ length: 60 }, (_, i) => ({ value: i, label: `${i} phút` }));

function getScheduleNode(workflow) {
  return workflow.nodes.find(n => n.type === 'n8n-nodes-base.scheduleTrigger');
}

function parseScheduleParams(params) {
  // N8N lưu interval là mảng (có thể nhiều rule)
  if (params && params.rule && params.rule.interval && Array.isArray(params.rule.interval)) {
    const rule = params.rule.interval[0] || {};
    if (rule.cron) {
      return { type: 'custom', value: rule.cron.expression };
    }
    for (let key of ['minutes', 'hours', 'days', 'weeks', 'months']) {
      if (rule[key]) {
        return {
          type: key,
          value: rule[key],
          triggerAtHour: rule.triggerAtHour ?? 0,
          triggerAtMinute: rule.triggerAtMinute ?? 0
        };
      }
    }
  }
  // fallback
  return { type: 'minutes', value: 1, triggerAtHour: 0, triggerAtMinute: 0 };
}

export default function ScheduleTriggerForm() {
  const [loading, setLoading] = useState(true);
  const [workflow, setWorkflow] = useState(null);
  const [scheduleType, setScheduleType] = useState('minutes');
  const [scheduleValue, setScheduleValue] = useState(1);
  const [cronValue, setCronValue] = useState('');
  const [triggerAtHour, setTriggerAtHour] = useState(0);
  const [triggerAtMinute, setTriggerAtMinute] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchWorkflow()
      .then(wf => {
        setWorkflow(wf);
        const node = getScheduleNode(wf);
        const parsed = parseScheduleParams(node.parameters);
        setScheduleType(parsed.type);
        if (parsed.type === 'custom') {
          setCronValue(parsed.value);
        } else {
          setScheduleValue(parsed.value);
          setTriggerAtHour(parsed.triggerAtHour ?? 0);
          setTriggerAtMinute(parsed.triggerAtMinute ?? 0);
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!workflow) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const newWorkflow = { ...workflow };
      const node = getScheduleNode(newWorkflow);
      if (!node) throw new Error('Không tìm thấy Schedule Trigger node!');
      // Build new parameters
      let intervalArr = [];
      if (scheduleType === 'custom') {
        intervalArr.push({ cron: { expression: cronValue } });
      } else {
        let rule = {
          [scheduleType]: Number(scheduleValue),
          triggerAtHour: Number(triggerAtHour),
          triggerAtMinute: Number(triggerAtMinute)
        };
        intervalArr.push(rule);
      }
      node.parameters.rule = { interval: intervalArr };
      await updateWorkflow(newWorkflow);
      setSuccess('Cập nhật thành công!');
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  return (
    <div className="schedule-form-container">
      <style>{`
        .schedule-form-container {
          background: #fff;
          padding: 32px 24px 24px 24px;
          border-radius: 16px;
          max-width: 420px;
          margin: 40px auto;
          box-shadow: 0 4px 24px #0002;
          font-family: 'Segoe UI', Arial, sans-serif;
        }
        .schedule-form-container h2 {
          text-align: center;
          color: #1890ff;
          margin-bottom: 24px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-label {
          display: block;
          font-weight: 500;
          margin-bottom: 6px;
        }
        .form-input, .form-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d9d9d9;
          border-radius: 6px;
          font-size: 16px;
          margin-bottom: 2px;
          transition: border 0.2s;
        }
        .form-input:focus, .form-select:focus {
          border-color: #1890ff;
          outline: none;
        }
        .form-row {
          display: flex;
          gap: 12px;
        }
        .form-btn {
          width: 100%;
          padding: 10px 0;
          background: linear-gradient(90deg, #1890ff 60%, #40a9ff 100%);
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .form-btn:disabled {
          background: #b3d8fd;
          cursor: not-allowed;
        }
        .form-message {
          text-align: center;
          margin-top: 14px;
          font-size: 15px;
        }
        .form-message.success {
          color: #52c41a;
        }
        .form-message.error {
          color: #ff4d4f;
        }
        @media (max-width: 600px) {
          .schedule-form-container {
            padding: 16px 4vw;
            max-width: 98vw;
          }
          .form-row {
            flex-direction: column;
            gap: 0;
          }
        }
      `}</style>
      <h2>Cấu hình lịch chạy tự động (N8N)</h2>
      {loading ? (
        <div className="form-message">Đang tải cấu hình workflow...</div>
      ) : (
        <>
          <div className="form-group">
            <label className="form-label">Trigger Interval:</label>
            <select
              className="form-select"
              value={scheduleType}
              onChange={e => setScheduleType(e.target.value)}
              disabled={saving}
            >
              {INTERVAL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {scheduleType !== 'custom' ? (
            <>
              <div className="form-group">
                <label className="form-label">
                  Số {INTERVAL_OPTIONS.find(opt => opt.value === scheduleType).label.toLowerCase()} giữa các lần chạy:
                </label>
                <input
                  className="form-input"
                  type="number"
                  min={1}
                  value={scheduleValue}
                  onChange={e => setScheduleValue(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Trigger at Hour:</label>
                  <select
                    className="form-select"
                    value={triggerAtHour}
                    onChange={e => setTriggerAtHour(e.target.value)}
                    disabled={saving}
                  >
                    {HOURS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Trigger at Minute:</label>
                  <select
                    className="form-select"
                    value={triggerAtMinute}
                    onChange={e => setTriggerAtMinute(e.target.value)}
                    disabled={saving}
                  >
                    {MINUTES.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <div className="form-group">
              <label className="form-label">Biểu thức Cron:</label>
              <input
                className="form-input"
                type="text"
                value={cronValue}
                onChange={e => setCronValue(e.target.value)}
                placeholder="* * * * *"
                disabled={saving}
              />
            </div>
          )}
          <button className="form-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </button>
          {success && <div className="form-message success">{success}</div>}
          {error && <div className="form-message error">{error}</div>}
          <UpdateWorkflowButton />
        </>
      )}
    </div>
  );
} 
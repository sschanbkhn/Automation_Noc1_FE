import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Select, Button, Space, message, Checkbox, Spin, Card } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';

interface DetailAlarmData {
  alarm_id: string;
  device_name: string;
  ip_address: string;
  resource: string;
  native_condition_type: string;
  condition_severity: string;
  service_affecting: string;
  additional_text: string;
  last_raise_time: string;
  state: string;
  acknowledge_state: string;
  node_type: string;
  device_id: string;
  manual_reset?: boolean;
  restart_type?: string;
  comments?: string;
}

interface DetailAlarmProps {
  visible: boolean;
  alarmId?: string;
  onClose?: () => void;
}

const DetailAlarm: React.FC<DetailAlarmProps> = ({ visible, alarmId, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alarmData, setAlarmData] = useState<DetailAlarmData | null>(null);
  const [resetResult, setResetResult] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (visible && alarmId) {
      fetchAlarmDetail();
      // Reset resetResult và isSubmitted khi mở drawer mới
      setResetResult(null);
      setIsSubmitted(false);
    }
  }, [visible, alarmId]);

  const fetchAlarmDetail = async () => {
    if (!alarmId) return;
    
    setLoading(true);
    try {
      // Encode alarmId để tránh lỗi với các ký tự đặc biệt
      const encodedAlarmId = encodeURIComponent(String(alarmId).trim());
      const apiUrl = `http://10.155.43.200:8001/api/v1/manualrestart/${encodedAlarmId}`;
      
      console.log('=== Fetch Alarm Detail ===');
      console.log('alarmId prop:', alarmId);
      console.log('encodedAlarmId:', encodedAlarmId);
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      console.log('Alarm detail response:', result);
      
      // Extract attributes if exists
      const data = result.data?.attributes || result.attributes || result;
      console.log('Extracted alarm data:', data);
      console.log('alarm_id from data:', data?.alarm_id);
      
      setAlarmData(data);
      form.setFieldsValue({
        ...data,
        manual_reset: false,
        restart_type: 'warm',
      });
    } catch (error) {
      console.error('Error fetching alarm detail:', error);
      message.error('Lỗi khi tải chi tiết cảnh báo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReset = async (values: any) => {
    if (!values.manual_reset) {
      message.warning('Vui lòng chọn kích hoạt restart');
      return;
    }

    if (!values.restart_type) {
      message.warning('Vui lòng chọn loại restart');
      return;
    }

    // Ưu tiên dùng alarm_id từ alarmData (từ API response) thay vì alarmId prop
    // Vì alarmId prop có thể có giá trị không hợp lệ
    // CHỈ dùng alarm_id, không dùng device_id vì device_id có thể trùng lặp
    const finalAlarmId = alarmData?.alarm_id || alarmId;
    
    // Kiểm tra alarmId trước khi gọi API
    if (!finalAlarmId) {
      message.error('Không tìm thấy ID cảnh báo. Vui lòng kiểm tra lại dữ liệu cảnh báo.');
      console.error('No alarm ID found. alarmData:', alarmData, 'alarmId prop:', alarmId);
      return;
    }

    // Validate alarmId - kiểm tra xem có phải là string/number hợp lệ không
    const alarmIdStr = String(finalAlarmId).trim();
    if (!alarmIdStr || alarmIdStr === 'undefined' || alarmIdStr === 'null' || alarmIdStr === '') {
      message.error('ID cảnh báo không hợp lệ. Vui lòng thử lại.');
      console.error('Invalid alarm ID:', alarmIdStr);
      return;
    }
    
    // Kiểm tra xem alarm_id có phải là số hợp lệ không (nếu backend yêu cầu)
    // Một số backend có thể yêu cầu alarm_id phải là số nguyên dương
    if (isNaN(Number(alarmIdStr)) && alarmIdStr.length > 50) {
      console.warn('Alarm ID có vẻ không phải là số hợp lệ:', alarmIdStr);
    }

    setSubmitting(true);
    try {
      const payload = {
        reset_type: values.restart_type,
        comments: values.comments || '',
      };

      // Thử không encode nếu alarm_id là số, encode nếu là string có ký tự đặc biệt
      // Một số backend có thể yêu cầu alarm_id là số nguyên không encode
      const isNumeric = /^\d+$/.test(alarmIdStr);
      const finalAlarmIdForUrl = isNumeric ? alarmIdStr : encodeURIComponent(alarmIdStr);
      const apiUrl = `http://10.155.43.200:8001/api/v1/manualrestart/${finalAlarmIdForUrl}`;
      
      // Log thông tin để debug
      console.log('=== Manual Restart API Call ===');
      console.log('alarmId prop:', alarmId);
      console.log('alarmData:', alarmData);
      console.log('alarmData.alarm_id:', alarmData?.alarm_id);
      console.log('Final alarmId used:', alarmIdStr);
      console.log('Is numeric:', isNumeric);
      console.log('Final alarmId for URL:', finalAlarmIdForUrl);
      console.log('URL:', apiUrl);
      console.log('Payload:', payload);
      console.log('Full alarm data for reference:', JSON.stringify(alarmData, null, 2));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        // Hiển thị lỗi ngắn gọn hơn nếu là HTML error page
        let errorMessage = `HTTP ${response.status}`;
        if (errorText && !errorText.includes('<!DOCTYPE')) {
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch {
            errorMessage = errorText.length > 100 ? errorText.substring(0, 100) + '...' : errorText;
          }
        } else if (errorText.includes('OSError') || errorText.includes('Input/output error')) {
          errorMessage = 'Lỗi server: Input/output error. Vui lòng kiểm tra lại ID cảnh báo hoặc liên hệ quản trị viên.';
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Success result:', result);
      
      // Lấy reset_result từ response
      const resetResultValue = result.reset_result || result.data?.reset_result || result.attributes?.reset_result || 'Không có kết quả';
      setResetResult(resetResultValue);
      
      // Đánh dấu đã submit thành công
      setIsSubmitted(true);
      
      message.success('Restart thiết bị thành công');
      // Không tự động đóng drawer, chỉ reset form
      form.resetFields();
      // Set lại manual_reset = false và disable
      form.setFieldsValue({
        manual_reset: false,
      });
      // Không gọi onClose() để giữ drawer mở
    } catch (error: any) {
      console.error('Error submitting reset:', error);
      message.error(`Lỗi khi restart thiết bị: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setResetResult(null);
    setIsSubmitted(false);
    if (onClose) onClose();
  };

  return (
    <Drawer
      title="Chi tiết cảnh báo của thiết bị restart:"
      placement="right"
      onClose={handleCancel}
      open={visible}
      width={800}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : !alarmData ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          Không tìm thấy dữ liệu cảnh báo
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitReset}
          style={{ marginTop: '16px' }}
        >
          {/* Thông tin */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {[
              { label: '1. Tên thiết bị:', value: alarmData?.device_name },
              { label: '2. Địa chỉ IP:', value: alarmData?.ip_address },
              { label: '3. Vị trí:', value: alarmData?.resource },
              { label: '4. Cảnh báo:', value: alarmData?.native_condition_type },
              { label: '5. Mức cảnh báo:', value: alarmData?.condition_severity },
              { label: '6. Ảnh hưởng:', value: alarmData?.service_affecting },
              { label: '7. Chi tiết:', value: alarmData?.additional_text },
              { label: '8. Thời gian:', value: alarmData?.last_raise_time },
              { label: '9. Trạng thái:', value: alarmData?.state },
              { label: '10. Xác nhận:', value: alarmData?.acknowledge_state },
              { label: '11. Node:', value: alarmData?.node_type },
              { label: '12. ID thiết bị:', value: alarmData?.device_id },
            ].map((item, idx) => (
              <div key={idx}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', display: 'block' }}>
                  {item.label}
                </label>
                <Input size="small" readOnly disabled value={item.value || ''} />
              </div>
            ))}
          </div>

          {/* Reset controls */}
          <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '4px', marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Restart card truyền dẫn:</div>
            
            <Form.Item name="manual_reset" valuePropName="checked" style={{ marginBottom: '8px' }}>
              <Checkbox 
                style={{ fontSize: '12px' }}
                disabled={isSubmitted}
              >
                Kích hoạt Restart
              </Checkbox>
            </Form.Item>

            <Form.Item label={<span style={{ fontSize: '12px' }}>Ghi chú</span>} name="comments" style={{ marginBottom: '8px' }}>
              <Input.TextArea rows={1} size="small" placeholder="Ghi chú" disabled={isSubmitted} />
            </Form.Item>

            <Form.Item label={<span style={{ fontSize: '12px' }}>Loại Restart</span>} name="restart_type" rules={[{ required: true }]} style={{ marginBottom: '8px' }}>
              <Select size="small" placeholder="Chọn loại" disabled={isSubmitted}>
                <Select.Option value="warm">Warm Restart</Select.Option>
                <Select.Option value="cold">Cold Restart</Select.Option>
              </Select>
            </Form.Item>
          </div>

          {/* Hiển thị kết quả reset */}
          {resetResult && (
            <div style={{ 
              backgroundColor: '#e6f7ff', 
              border: '1px solid #91d5ff', 
              padding: '12px', 
              borderRadius: '4px', 
              marginBottom: '12px' 
            }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', color: '#1890ff' }}>
                Kết quả Restart:
              </div>
              <div style={{ fontSize: '12px', color: '#0050b3', whiteSpace: 'pre-wrap' }}>
                {resetResult}
              </div>
            </div>
          )}

          {/* Buttons */}
          <Space size="small">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting} 
              danger 
              size="small" 
              icon={<SaveOutlined />}
              disabled={isSubmitted}
            >
              Xác nhận
            </Button>
            <Button size="small" icon={<CloseOutlined />} onClick={handleCancel}>
              Đóng
            </Button>
          </Space>
        </Form>
      )}
    </Drawer>
  );
};

export default DetailAlarm;

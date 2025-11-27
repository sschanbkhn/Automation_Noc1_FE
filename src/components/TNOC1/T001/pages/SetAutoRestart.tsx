import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Space, message, Table, Checkbox } from 'antd';
import { SaveOutlined, ClearOutlined, ReloadOutlined } from '@ant-design/icons';

interface NodeItem {
  id?: string | number;
  node_name: string;
  ip_address: string;
}

const SetAutoRestart: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [nodeList, setNodeList] = useState<NodeItem[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  const fetchNodeList = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://10.155.43.200:8001/api/v1/managenode');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      console.log('ManageNode API response:', result);
      
      // Extract data from nested structure
      let nodes: NodeItem[] = [];
      if (result.data && Array.isArray(result.data)) {
        nodes = result.data.map((item: any, index: number) => ({
          id: item.id || item.attributes?.id || index + 1,
          node_name: item.node_name || item.attributes?.node_name || '',
          ip_address: item.ip_address || item.attributes?.ip_address || '',
        }));
      } else if (Array.isArray(result)) {
        nodes = result.map((item: any, index: number) => ({
          id: item.id || index + 1,
          node_name: item.node_name || '',
          ip_address: item.ip_address || '',
        }));
      }
      
      setNodeList(nodes);
    } catch (error) {
      console.error('Error fetching node list:', error);
      message.error('Lỗi khi tải danh sách thiết bị');
      setNodeList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodeList();
  }, []);

  const handleSubmit = async (values: any) => {
    if (selectedDevices.length === 0) {
      message.warning('Vui lòng chọn ít nhất một thiết bị');
      return;
    }

    setSubmitting(true);
    try {
      // Get selected devices data
      const selectedDevicesData = nodeList.filter(node => 
        selectedDevices.includes(node.id?.toString() || '')
      );

      // Prepare data for each selected device
      const submitPromises = selectedDevicesData.map(async (device) => {
        const payload = {
          native_condition_type: values.native_condition_type,
          restart_numbers: values.restart_numbers, // Changed from restart_number
          restart_type: values.restart_type,
          device_name: device.node_name,
          ip_address: device.ip_address,
        };

        console.log('Submitting payload:', payload);

        const response = await fetch('http://10.155.43.200:8001/api/v1/alarmautorestart/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.json();
      });

      // Wait for all requests to complete
      await Promise.all(submitPromises);

      message.success(`Thiết lập restart tự động thành công cho ${selectedDevicesData.length} thiết bị`);
      form.resetFields();
      setSelectedDevices([]);
    } catch (error: any) {
      console.error('Error submitting auto restart:', error);
      message.error(`Lỗi khi thiết lập restart tự động: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setSelectedDevices([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDevices(nodeList.map(node => node.id?.toString() || ''));
    } else {
      setSelectedDevices([]);
    }
  };

  const columns = [
    {
      title: 'Chọn',
      dataIndex: 'id',
      key: 'select',
      width: 80,
      render: (id: string | number | undefined, record: NodeItem) => {
        const idStr = id?.toString() || '';
        return (
          <Checkbox
            checked={selectedDevices.includes(idStr)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedDevices([...selectedDevices, idStr]);
              } else {
                setSelectedDevices(selectedDevices.filter(item => item !== idStr));
              }
            }}
          />
        );
      },
    },
    {
      title: 'Tên thiết bị',
      dataIndex: 'node_name',
      key: 'node_name',
    },
    {
      title: 'Địa chỉ IP',
      dataIndex: 'ip_address',
      key: 'ip_address',
    },
  ];

  return (
    <div className="form-container">

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {/* Cảnh báo */}
        <Form.Item
          label="Thiết lập cảnh báo restart card tự động"
          name="native_condition_type"
          rules={[{ required: true, message: 'Vui lòng nhập cảnh báo' }]}
          style={{ marginBottom: '12px' }}
        >
          <Input placeholder="Nhập vào cảnh báo sẽ restart tự động" />
        </Form.Item>

        {/* Số lần restart */}
        <Form.Item
          label="Thiết lập số lần restart đối với một cảnh báo"
          name="restart_numbers"
          rules={[{ required: true, message: 'Vui lòng chọn số lần restart' }]}
          style={{ marginBottom: '12px' }}
        >
          <Select placeholder="Chọn số lần restart">
            <Select.Option value="1">1 lần</Select.Option>
            <Select.Option value="2">2 lần</Select.Option>
          </Select>
        </Form.Item>

        {/* Loại restart */}
        <Form.Item
          label="Loại Restart"
          name="restart_type"
          rules={[{ required: true, message: 'Vui lòng chọn loại restart' }]}
          style={{ marginBottom: '12px' }}
        >
          <Select placeholder="Chọn loại restart">
            <Select.Option value="warm">Warm Restart</Select.Option>
            <Select.Option value="cold">Cold Restart</Select.Option>
          </Select>
        </Form.Item>

        {/* Chọn thiết bị */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">Vui lòng chọn thiết bị bên dưới và bấm Thiết lập</label>
            <Space>
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={fetchNodeList}
                loading={loading}
              >
                Làm mới
              </Button>
              <Checkbox
                indeterminate={selectedDevices.length > 0 && selectedDevices.length < nodeList.length}
                checked={selectedDevices.length === nodeList.length && nodeList.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                Chọn tất cả ({nodeList.length})
              </Checkbox>
            </Space>
          </div>
          <div className="table-container">
            <Table
              columns={columns}
              dataSource={nodeList}
              rowKey={(record) => record.id?.toString() || Math.random().toString()}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                size: 'small',
              }}
              loading={loading}
              bordered
              size="small"
              style={{
                fontSize: '13px',
              }}
            />
          </div>
        </div>

        {/* Buttons */}
        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              danger
              icon={<SaveOutlined />}
            >
              Thiết lập
            </Button>
            <Button
              icon={<ClearOutlined />}
              onClick={handleReset}
            >
              Xóa
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SetAutoRestart;

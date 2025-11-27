import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Checkbox, Popconfirm } from 'antd';
import { DeleteOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

interface AutoRestartItem {
  id: string | number;
  native_condition_type: string;
  restart_numbers: string | number;
  restart_type: string;
  device_name: string;
  ip_address: string;
}

const ListAutoRestart: React.FC = () => {
  const [items, setItems] = useState<AutoRestartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://10.155.43.200:8001/api/v1/alarmautorestart/');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      console.log('ListAutoRestart API response:', result);
      
      // Extract data from nested structure
      let data: AutoRestartItem[] = [];
      if (result.data && Array.isArray(result.data)) {
        data = result.data.map((item: any) => ({
          id: item.id || item.attributes?.id,
          native_condition_type: item.native_condition_type || item.attributes?.native_condition_type || '',
          restart_numbers: item.restart_numbers || item.attributes?.restart_numbers || '',
          restart_type: item.restart_type || item.attributes?.restart_type || '',
          device_name: item.device_name || item.attributes?.device_name || '',
          ip_address: item.ip_address || item.attributes?.ip_address || '',
        }));
      } else if (Array.isArray(result)) {
        data = result.map((item: any) => ({
          id: item.id,
          native_condition_type: item.native_condition_type || '',
          restart_numbers: item.restart_numbers || '',
          restart_type: item.restart_type || '',
          device_name: item.device_name || '',
          ip_address: item.ip_address || '',
        }));
      }
      
      setItems(data);
      message.success(`Tải ${data.length} bản ghi thành công`);
    } catch (error) {
      console.error('Error fetching auto restart list:', error);
      message.error('Lỗi khi tải danh sách cảnh báo restart tự động');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (selectedItems.length === 0) {
      message.warning('Vui lòng chọn ít nhất một mục để xóa');
      return;
    }

    setLoading(true);
    try {
      console.log('Deleting items:', selectedItems);
      
      // Gọi API DELETE cho từng id được chọn
      const deletePromises = selectedItems.map(async (id) => {
        const response = await fetch(`http://10.155.43.200:8001/api/v1/alarmautorestart/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          let errorText = '';
          try {
            errorText = await response.text();
          } catch (e) {
            errorText = `HTTP ${response.status}`;
          }
          console.error(`Error deleting item ${id}:`, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
        }

        // Kiểm tra xem response có body không trước khi parse JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const text = await response.text();
            return text ? JSON.parse(text) : { success: true };
          } catch (e) {
            // Nếu không parse được JSON, coi như thành công nếu status code là 200-299
            return { success: true };
          }
        }
        
        // Nếu không có JSON body, chỉ cần kiểm tra status code (200-299 = success)
        return { success: true };
      });

      // Đợi tất cả các request xóa hoàn thành
      await Promise.all(deletePromises);
      
      message.success(`Xóa thành công ${selectedItems.length} cảnh báo restart tự động`);
      setSelectedItems([]);
      
      // Refresh lại dữ liệu từ API để đảm bảo đồng bộ
      await fetchData();
    } catch (error: any) {
      console.error('Error deleting items:', error);
      message.error(`Lỗi khi xóa cảnh báo: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (items.length === 0) {
      message.warning('Không có dữ liệu để xuất Excel');
      return;
    }

    try {
      // Prepare data for export
      const exportData = items.map((item, index) => ({
        '#': index + 1,
        'Tên cảnh báo': item.native_condition_type || '-',
        'Số lượt restart tự động': item.restart_numbers || '-',
        'Loại restart tự động': item.restart_type || '-',
        'Thiết bị': item.device_name || '-',
        'Địa chỉ IP': item.ip_address || '-',
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Cài đặt restart tự động');
      
      // Generate filename with current date
      const fileName = `Danh_sach_cai_dat_restart_tu_dong_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Write file
      XLSX.writeFile(workbook, fileName);
      
      message.success('Xuất file Excel thành công');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      message.error('Lỗi khi xuất file Excel');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map(item => String(item.id)));
    } else {
      setSelectedItems([]);
    }
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      width: 50,
      render: (text: string, record: AutoRestartItem, index: number) => index + 1,
    },
    {
      title: 'Chọn',
      dataIndex: 'id',
      key: 'select',
      width: 80,
      render: (id: string | number) => {
        const idStr = String(id);
        return (
          <Checkbox
            checked={selectedItems.includes(idStr)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems([...selectedItems, idStr]);
              } else {
                setSelectedItems(selectedItems.filter(item => item !== idStr));
              }
            }}
          />
        );
      },
    },
    {
      title: 'Tên cảnh báo',
      dataIndex: 'native_condition_type',
      key: 'native_condition_type',
    },
    {
      title: 'Số lượt restart tự động',
      dataIndex: 'restart_numbers',
      key: 'restart_numbers',
      align: 'center' as const,
    },
    {
      title: 'Loại restart tự động',
      dataIndex: 'restart_type',
      key: 'restart_type',
    },
    {
      title: 'Thiết bị',
      dataIndex: 'device_name',
      key: 'device_name',
    },
    {
      title: 'Địa chỉ IP',
      dataIndex: 'ip_address',
      key: 'ip_address',
    },
  ];

  return (
    <div className="form-container">

      <div style={{ marginBottom: '16px', display: 'flex', gap: '10px' }}>
        <Popconfirm
          title="Xác nhận xóa"
          description={`Bạn có chắc chắn muốn xóa ${selectedItems.length} mục đã chọn?`}
          onConfirm={handleDelete}
          okText="Có"
          cancelText="Không"
        >
          <Button
            type="primary"
            danger
            loading={loading}
            disabled={selectedItems.length === 0}
            icon={<DeleteOutlined />}
          >
            Hủy ({selectedItems.length} mục)
          </Button>
        </Popconfirm>

        <Button
          type="default"
          onClick={handleExport}
          icon={<DownloadOutlined />}
          disabled={items.length === 0}
        >
          Xuất Excel
        </Button>

        <Button
          type="default"
          onClick={fetchData}
          loading={loading}
          icon={<ReloadOutlined />}
        >
          Làm mới
        </Button>

        <div style={{ flex: 1 }}>
          <Checkbox
            indeterminate={
              selectedItems.length > 0 && selectedItems.length < items.length
            }
            checked={selectedItems.length === items.length && items.length > 0}
            onChange={(e) => handleSelectAll(e.target.checked)}
            style={{ marginLeft: '8px' }}
          >
            Chọn tất cả ({items.length})
          </Checkbox>
        </div>
      </div>

      <div className="table-container">
          <Table
          columns={columns}
          dataSource={items}
          rowKey={(record) => String(record.id)}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} cảnh báo`,
          }}
          loading={loading}
          bordered
          size="small"
        />
      </div>
    </div>
  );
};

export default ListAutoRestart;

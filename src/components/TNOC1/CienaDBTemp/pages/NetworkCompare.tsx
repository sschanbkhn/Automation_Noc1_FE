import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  message,
  Popconfirm,
  Row,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
} from 'antd';
import {
  CloudUploadOutlined,
  EditOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  SwapOutlined,
} from '@ant-design/icons';

const COMPARE_API_URL =
  'http://10.155.43.200:8001/api/cienatemp/networkelements/?action=compare';
const SYNC_API_URL = 'http://10.155.43.200:8001/api/cienatemp/networkelements/';

const COMPARE_FIELDS = ['name', 'ipAddress', 'isActive'] as const;

const FIELD_LABELS: Record<(typeof COMPARE_FIELDS)[number], string> = {
  name: 'Tên thiết bị',
  ipAddress: 'IP',
  isActive: 'Trạng thái',
};

interface NewNetworkElement {
  neId: string;
  name?: string;
  display_name?: string;
  ipAddress?: string;
  memberFunction?: string;
  deviceType?: string;
  isActive?: boolean;
}

interface ModifiedValue {
  db: unknown;
  api: unknown;
}

interface ModifiedNetworkElement {
  neId: string;
  display_name: string;
  changes: Partial<Record<(typeof COMPARE_FIELDS)[number], ModifiedValue>>;
}

interface CompareData {
  message?: string;
  new_NE: NewNetworkElement[];
  modified_NE: ModifiedNetworkElement[];
}

interface ModifiedDiffRow {
  field: (typeof COMPARE_FIELDS)[number];
  db: unknown;
  api: unknown;
}

const toDisplayText = (value: unknown): string => {
  if (typeof value === 'boolean') return value ? 'Active' : 'Inactive';
  const text = value == null ? '' : String(value).trim();
  return text || 'N/A';
};

const getModifiedDiffRows = (item: ModifiedNetworkElement): ModifiedDiffRow[] =>
  COMPARE_FIELDS.reduce<ModifiedDiffRow[]>((rows, field) => {
    const value = item.changes?.[field];
    if (value) {
      rows.push({ field, db: value.db, api: value.api });
    }
    return rows;
  }, []);

const NetworkCompare: React.FC = () => {
  const [compareData, setCompareData] = useState<CompareData>({
    new_NE: [],
    modified_NE: [],
  });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchCompareData = useCallback(async (showToast = true) => {
    setLoading(true);
    try {
      const response = await fetch(COMPARE_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data: CompareData = {
        message: result.message,
        new_NE: Array.isArray(result.new_NE) ? result.new_NE : [],
        modified_NE: Array.isArray(result.modified_NE) ? result.modified_NE : [],
      };

      setCompareData(data);
      if (showToast) {
        message.success('Tải kết quả so sánh thành công');
      }
    } catch (error) {
      console.error('Error fetching compare data:', error);
      message.error('Không thể tải kết quả so sánh');
      setCompareData({ new_NE: [], modified_NE: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateNetworkElement = async () => {
    setUpdating(true);
    try {
      const response = await fetch(SYNC_API_URL, {
        method: 'POST',
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || result.message || `HTTP error! status: ${response.status}`);
      }

      message.success(result.message || 'Cập nhật Network Element thành công');
      await fetchCompareData(false);
    } catch (error) {
      console.error('Error updating network elements:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Không thể cập nhật Network Element';
      message.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchCompareData();
  }, [fetchCompareData]);

  const newNeData = useMemo(
    () =>
      compareData.new_NE.map((item, index) => ({
        key: item.neId || `new-${index}`,
        ...item,
      })),
    [compareData.new_NE]
  );

  const modifiedNeData = useMemo(
    () =>
      compareData.modified_NE.map((item, index) => ({
        key: item.neId || `modified-${index}`,
        neId: item.neId,
        display_name: item.display_name,
        diffRows: getModifiedDiffRows(item),
      })),
    [compareData.modified_NE]
  );

  const modifiedColumns = [
    { title: 'ID thiết bị', dataIndex: 'neId', key: 'neId', width: 280 },
    { title: 'Tên hiển thị', dataIndex: 'display_name', key: 'display_name' },
    {
      title: 'Trường khác nhau',
      dataIndex: 'diffRows',
      key: 'diffFields',
      render: (diffRows: ModifiedDiffRow[]) =>
        diffRows.map((row) => (
          <Tag key={row.field} color="orange" style={{ marginBottom: 4 }}>
            {FIELD_LABELS[row.field]}
          </Tag>
        )),
    },
  ];

  const newColumns = [
    { title: 'ID thiết bị', dataIndex: 'neId', key: 'neId', width: 280 },
    {
      title: 'Tên thiết bị',
      dataIndex: 'name',
      key: 'name',
      render: (_: unknown, record: NewNetworkElement) =>
        toDisplayText(record.name || record.display_name),
    },
    { title: 'IP', dataIndex: 'ipAddress', key: 'ipAddress', render: toDisplayText },
    { title: 'Chức năng', dataIndex: 'memberFunction', key: 'memberFunction', render: toDisplayText },
    { title: 'Loại thiết bị', dataIndex: 'deviceType', key: 'deviceType', render: toDisplayText },
  ];

  return (
    <div>
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
        message="So sánh Network Structure (từ MCP) và Network Element (từ database Automation)"
        description={
          <>
            Backend kiểm tra 3 trường: name, ipAddress, isActive. NE mới là thiết bị có trên MCP
            nhưng chưa có trong DB. NE thay đổi là thiết bị đã có nhưng khác một trong 3 trường trên.
            <br />
            <br />
            <strong>Lưu ý:</strong> "Cập nhật" chỉ cập nhật thông tin NE, người dùng tự cập nhật
            trạng thái hoạt động isActive nếu cần.
          </>
        }
      />

      {compareData.message && (
        <Alert
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
          message={compareData.message}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="NE mới (chưa có trong DB)"
              value={compareData.new_NE.length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<PlusCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="NE thay đổi"
              value={compareData.modified_NE.length}
              valueStyle={{ color: '#faad14' }}
              prefix={<EditOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tổng cần xử lý"
              value={compareData.new_NE.length + compareData.modified_NE.length}
              prefix={<SwapOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => fetchCompareData()}
          loading={loading}
        >
          Kiểm tra lại
        </Button>
        <Popconfirm
          title="Cập nhật Network Element từ dữ liệu MCP?"
          description="Hệ thống sẽ POST lên backend để đồng bộ dữ liệu vào database."
          okText="Cập nhật"
          cancelText="Hủy"
          onConfirm={handleUpdateNetworkElement}
        >
          <Button
            type="default"
            icon={<CloudUploadOutlined />}
            loading={updating}
            disabled={loading}
          >
            Cập nhật
          </Button>
        </Popconfirm>
      </Space>

      <Tabs
        items={[
          {
            key: 'new',
            label: `NE mới (${compareData.new_NE.length})`,
            children: (
              <Table
                columns={newColumns}
                dataSource={newNeData}
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true }}
                scroll={{ x: 1000 }}
                locale={{ emptyText: 'Không có NE mới' }}
              />
            ),
          },
          {
            key: 'modified',
            label: `NE thay đổi (${compareData.modified_NE.length})`,
            children: (
              <Table
                columns={modifiedColumns}
                dataSource={modifiedNeData}
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true }}
                expandable={{
                  expandedRowRender: (record) => (
                    <Table
                      size="small"
                      pagination={false}
                      rowKey="field"
                      columns={[
                        {
                          title: 'Trường',
                          dataIndex: 'field',
                          key: 'field',
                          render: (field: (typeof COMPARE_FIELDS)[number]) => FIELD_LABELS[field],
                        },
                        {
                          title: 'Database (NetworkElement)',
                          dataIndex: 'db',
                          key: 'db',
                          render: toDisplayText,
                        },
                        {
                          title: 'MCP (NetworkStructure)',
                          dataIndex: 'api',
                          key: 'api',
                          render: toDisplayText,
                        },
                      ]}
                      dataSource={record.diffRows}
                    />
                  ),
                  rowExpandable: (record) => record.diffRows.length > 0,
                }}
                locale={{ emptyText: 'Không có NE thay đổi' }}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default NetworkCompare;

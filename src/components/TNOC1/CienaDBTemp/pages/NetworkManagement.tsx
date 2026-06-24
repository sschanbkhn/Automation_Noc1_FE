import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  message,
  Modal,
  Row,
  Space,
  Statistic,
  Switch,
  Table,
  Tabs,
  Tag,
} from 'antd';
import {
  ApartmentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloudServerOutlined,
  ClusterOutlined,
  EditOutlined,
  HddOutlined,
  ReloadOutlined,
  SearchOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import NetworkCompare from './NetworkCompare';

const STRUCTURE_API_URL = 'http://10.155.43.200:8001/api/cienatemp/networkconstructs/';
const ELEMENT_API_URL = 'http://10.155.43.200:8001/api/cienatemp/networkelements/';

const getElementUpdateUrl = (id: number) => `${ELEMENT_API_URL}${id}/`;

const toDisplayText = (value: unknown, fallback = 'N/A'): string => {
  const text = value == null ? '' : String(value).trim();
  return text || fallback;
};

const normalizeNote = (value: unknown): string => {
  if (value == null) return '';
  return String(value).trim();
};

interface MemberShelf {
  shelfNumber: string;
  shelfIP: string;
}

interface NetworkStructureItem {
  neId: string;
  name: string;
  longName: string;
  ipAddress: string;
  deviceType: string;
  softwareVersion: string;
  nativeSoftwareVersion: string;
  numberOfShelves: string;
  memberFunction: string;
  memberShelvesData: MemberShelf[];
}

interface NetworkElementItem {
  id: number;
  neId: string;
  name: string;
  longName: string;
  ipAddress: string;
  deviceType: string;
  softwareVersion: string;
  nativeSoftwareVersion: string;
  numberOfShelves: number;
  memberFunction: string;
  isActive: boolean;
  note: string;
}

interface NetworkElementPatchPayload {
  isActive?: boolean;
  note?: string | null;
}

interface NetworkElementPatchResponse {
  id?: number;
  neId?: string;
  isActive?: boolean;
  note?: string | null;
  message?: string;
  error?: string;
}

const mapNetworkStructureItem = (item: any): NetworkStructureItem => {
  const attrs = item.attributes ?? item;
  const shelves = Array.isArray(attrs.memberShelvesData) ? attrs.memberShelvesData : [];

  return {
    neId: toDisplayText(attrs.neId ?? item.neId, ''),
    name: toDisplayText(attrs.name),
    longName: toDisplayText(attrs.longName),
    ipAddress: toDisplayText(attrs.ipAddress),
    deviceType: toDisplayText(attrs.deviceType),
    softwareVersion: toDisplayText(attrs.softwareVersion),
    nativeSoftwareVersion: toDisplayText(attrs.nativeSoftwareVersion),
    numberOfShelves: toDisplayText(attrs.numberOfShelves),
    memberFunction: toDisplayText(attrs.memberFunction),
    memberShelvesData: shelves.map((shelf: any) => ({
      shelfNumber: toDisplayText(shelf.shelfNumber, ''),
      shelfIP: toDisplayText(shelf.shelfIP, ''),
    })),
  };
};

const mapNetworkElementItem = (item: any): NetworkElementItem => {
  const attrs = item.attributes ?? item;

  return {
    id: Number(attrs.id ?? item.id ?? 0),
    neId: toDisplayText(attrs.neId ?? item.neId, ''),
    name: toDisplayText(attrs.name ?? item.name),
    longName: toDisplayText(attrs.longName ?? item.longName),
    ipAddress: toDisplayText(attrs.ipAddress ?? item.ipAddress),
    deviceType: toDisplayText(attrs.deviceType ?? item.deviceType),
    softwareVersion: toDisplayText(attrs.softwareVersion ?? item.softwareVersion),
    nativeSoftwareVersion: toDisplayText(attrs.nativeSoftwareVersion ?? item.nativeSoftwareVersion),
    numberOfShelves: Number(attrs.numberOfShelves ?? item.numberOfShelves ?? 0),
    memberFunction: toDisplayText(attrs.memberFunction ?? item.memberFunction),
    isActive: Boolean(attrs.isActive ?? item.isActive),
    note: normalizeNote(attrs.note ?? item.note),
  };
};

const buildPatchPayload = (
  editingItem: NetworkElementItem,
  values: { isActive: boolean; note?: string }
): NetworkElementPatchPayload | null => {
  const payload: NetworkElementPatchPayload = {};

  if (values.isActive !== editingItem.isActive) {
    payload.isActive = values.isActive;
  }

  const newNote = values.note?.trim() ?? '';
  if (newNote !== editingItem.note.trim()) {
    payload.note = newNote || null;
  }

  return Object.keys(payload).length > 0 ? payload : null;
};

const NetworkStructurePanel: React.FC = () => {
  const [items, setItems] = useState<NetworkStructureItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(STRUCTURE_API_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      const rawItems = Array.isArray(result)
        ? result
        : Array.isArray(result.data)
          ? result.data
          : [];
      const data = rawItems.map(mapNetworkStructureItem);

      setItems(data);
      message.success(`Tải ${data.length} thiết bị mạng thành công`);
    } catch (error) {
      console.error('Error fetching network constructs:', error);
      message.warning('Chưa kết nối được API cấu trúc mạng.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(() => {
    if (!searchText.trim()) return items;
    const keyword = searchText.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.ipAddress.toLowerCase().includes(keyword) ||
        item.memberFunction.toLowerCase().includes(keyword) ||
        item.deviceType.toLowerCase().includes(keyword)
    );
  }, [items, searchText]);

  const stats = useMemo(() => {
    const total = filteredItems.length;
    const roadm = filteredItems.filter((item) => item.memberFunction === 'ROADM').length;
    const ila = filteredItems.filter((item) => item.memberFunction === 'ILA').length;
    const shelves = filteredItems.reduce(
      (sum, item) => sum + (Number(item.numberOfShelves) || 0),
      0
    );
    return { total, roadm, ila, shelves };
  }, [filteredItems]);

  const columns = [
    {
      title: 'Tên thiết bị',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: NetworkStructureItem, b: NetworkStructureItem) => a.name.localeCompare(b.name),
    },
    { title: 'IP', dataIndex: 'ipAddress', key: 'ipAddress' },
    {
      title: 'Chức năng',
      dataIndex: 'memberFunction',
      key: 'memberFunction',
      render: (value: string) => {
        const color = value === 'ROADM' ? 'blue' : value === 'ILA' ? 'purple' : 'default';
        return <Tag color={color}>{toDisplayText(value)}</Tag>;
      },
    },
    {
      title: 'Số shelf',
      dataIndex: 'numberOfShelves',
      key: 'numberOfShelves',
      sorter: (a: NetworkStructureItem, b: NetworkStructureItem) =>
        Number(a.numberOfShelves) - Number(b.numberOfShelves),
    },
    { title: 'Loại thiết bị', dataIndex: 'deviceType', key: 'deviceType', width: 280 },
    { title: 'Phiên bản SW', dataIndex: 'softwareVersion', key: 'softwareVersion' },
    { title: 'Native SW', dataIndex: 'nativeSoftwareVersion', key: 'nativeSoftwareVersion' },
    {
      title: 'Long Name',
      dataIndex: 'longName',
      key: 'longName',
      width: 220,
      render: (value: string) => toDisplayText(value),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Tổng số NE" value={stats.total} prefix={<ClusterOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="ROADM"
              value={stats.roadm}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ApartmentOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="ILA"
              value={stats.ila}
              valueStyle={{ color: '#722ed1' }}
              prefix={<CloudServerOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Tổng số Shelf" value={stats.shelves} prefix={<ApartmentOutlined />} />
          </Card>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
        <Input
          placeholder="Tìm theo tên NE, IP, chức năng..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 320 }}
          allowClear
        />
        <Button type="primary" icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
          Làm mới
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredItems}
        rowKey="neId"
        loading={loading}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
        }}
        scroll={{ x: 1400 }}
        locale={{ emptyText: 'Chưa có dữ liệu cấu trúc mạng' }}
        expandable={{
          expandedRowRender: (record) => (
            <Table
              size="small"
              pagination={false}
              rowKey={(row) => `${record.neId}-${row.shelfNumber}`}
              columns={[
                { title: 'Shelf', dataIndex: 'shelfNumber', key: 'shelfNumber' },
                { title: 'IP Shelf', dataIndex: 'shelfIP', key: 'shelfIP' },
              ]}
              dataSource={record.memberShelvesData}
            />
          ),
          rowExpandable: (record) => record.memberShelvesData.length > 0,
        }}
      />
    </div>
  );
};

const NetworkElementPanel: React.FC = () => {
  const [items, setItems] = useState<NetworkElementItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NetworkElementItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(ELEMENT_API_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      const rawItems = Array.isArray(result)
        ? result
        : Array.isArray(result.data)
          ? result.data
          : [];
      const data = rawItems.map(mapNetworkElementItem);

      setItems(data);
      message.success(`Tải ${data.length} network element thành công`);
    } catch (error) {
      console.error('Error fetching network elements:', error);
      message.warning('Chưa kết nối được API network elements.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(() => {
    if (!searchText.trim()) return items;
    const keyword = searchText.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.longName.toLowerCase().includes(keyword) ||
        item.ipAddress.toLowerCase().includes(keyword) ||
        item.memberFunction.toLowerCase().includes(keyword) ||
        item.deviceType.toLowerCase().includes(keyword)
    );
  }, [items, searchText]);

  const stats = useMemo(() => {
    const total = filteredItems.length;
    const active = filteredItems.filter((item) => item.isActive).length;
    const inactive = filteredItems.filter((item) => !item.isActive).length;
    const roadm = filteredItems.filter((item) => item.memberFunction === 'ROADM').length;
    return { total, active, inactive, roadm };
  }, [filteredItems]);

  const openEditModal = useCallback(
    (record: NetworkElementItem) => {
      setEditingItem(record);
      form.setFieldsValue({
        isActive: record.isActive,
        note: record.note,
      });
      setEditModalOpen(true);
    },
    [form]
  );

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingItem(null);
    form.resetFields();
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      const values = await form.validateFields();
      const payload = buildPatchPayload(editingItem, values);

      if (!payload) {
        message.info('Không có thay đổi nào để lưu');
        return;
      }

      setSaving(true);
      const response = await fetch(getElementUpdateUrl(editingItem.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result: NetworkElementPatchResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || result.message || `HTTP error! status: ${response.status}`);
      }

      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== editingItem.id) return item;

          const updated = { ...item };
          if ('isActive' in payload) {
            updated.isActive = result.isActive ?? payload.isActive ?? item.isActive;
          }
          if ('note' in payload) {
            updated.note = normalizeNote(result.note !== undefined ? result.note : payload.note);
          }
          return updated;
        })
      );

      message.success(result.message || 'Cập nhật network element thành công');
      closeEditModal();
    } catch (error) {
      console.error('Error updating network element:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Không thể cập nhật network element';
      message.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: 'Tên thiết bị',
        dataIndex: 'name',
        key: 'name',
        sorter: (a: NetworkElementItem, b: NetworkElementItem) => a.name.localeCompare(b.name),
      },
      {
        title: 'Long Name',
        dataIndex: 'longName',
        key: 'longName',
        width: 220,
        render: (value: string) => toDisplayText(value),
      },
      { title: 'IP', dataIndex: 'ipAddress', key: 'ipAddress' },
      {
        title: 'Chức năng',
        dataIndex: 'memberFunction',
        key: 'memberFunction',
        render: (value: string) => {
          const color = value === 'ROADM' ? 'blue' : value === 'ILA' ? 'purple' : 'default';
          return <Tag color={color}>{toDisplayText(value)}</Tag>;
        },
      },
      {
        title: 'Trạng thái',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (value: boolean) =>
          value ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Không hoạt động</Tag>,
      },
      {
        title: 'Số shelf',
        dataIndex: 'numberOfShelves',
        key: 'numberOfShelves',
        sorter: (a: NetworkElementItem, b: NetworkElementItem) =>
          a.numberOfShelves - b.numberOfShelves,
      },
      { title: 'Loại thiết bị', dataIndex: 'deviceType', key: 'deviceType', width: 280 },
      { title: 'Phiên bản SW', dataIndex: 'softwareVersion', key: 'softwareVersion' },
      { title: 'Native SW', dataIndex: 'nativeSoftwareVersion', key: 'nativeSoftwareVersion' },
      {
        title: 'Ghi chú',
        dataIndex: 'note',
        key: 'note',
        render: (value: string) => value || '',
      },
      {
        title: 'Thao tác',
        key: 'action',
        fixed: 'right' as const,
        width: 100,
        render: (_: unknown, record: NetworkElementItem) => (
          <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Sửa
          </Button>
        ),
      },
    ],
    [openEditModal]
  );

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Tổng số NE" value={stats.total} prefix={<HddOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Không hoạt động"
              value={stats.inactive}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="ROADM"
              value={stats.roadm}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ApartmentOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
        <Input
          placeholder="Tìm theo tên, IP, chức năng..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 320 }}
          allowClear
        />
        <Button type="primary" icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
          Làm mới
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredItems}
        rowKey="id"
        loading={loading}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
        }}
        scroll={{ x: 1500 }}
        locale={{ emptyText: 'Chưa có dữ liệu network element' }}
      />

      <Modal
        title={`Chỉnh sửa Network Element #${editingItem?.id ?? ''}`}
        open={editModalOpen}
        onCancel={closeEditModal}
        onOk={handleSave}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={saving}
        destroyOnClose
      >
        {editingItem && (
          <>
            <Descriptions size="small" column={1} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Tên thiết bị">{editingItem.name}</Descriptions.Item>
              <Descriptions.Item label="IP">{editingItem.ipAddress}</Descriptions.Item>
              <Descriptions.Item label="Chức năng">{editingItem.memberFunction}</Descriptions.Item>
            </Descriptions>

            <Form form={form} layout="vertical">
              <Form.Item
                label="Trạng thái hoạt động (isActive)"
                name="isActive"
                valuePropName="checked"
              >
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" />
              </Form.Item>
              <Form.Item label="Ghi chú (note)" name="note">
                <Input.TextArea rows={4} placeholder="Nhập ghi chú..." />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

const NetworkManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('structure');

  const items = [
    {
      key: 'structure',
      label: (
        <span>
          <ClusterOutlined style={{ marginRight: 8 }} />
          Dữ liệu trên MCP
        </span>
      ),
      children: <NetworkStructurePanel />,
    },
    {
      key: 'element',
      label: (
        <span>
          <HddOutlined style={{ marginRight: 8 }} />
          Dữ liệu trong DB
        </span>
      ),
      children: <NetworkElementPanel />,
    },
    {
      key: 'compare',
      label: (
        <span>
          <SwapOutlined style={{ marginRight: 8 }} />
          So sánh dữ liệu
        </span>
      ),
      children: <NetworkCompare />,
    },
  ];

  return <Tabs activeKey={activeSubTab} onChange={setActiveSubTab} items={items} />;
};

export default NetworkManagement;

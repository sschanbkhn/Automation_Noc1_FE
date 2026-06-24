import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
} from 'antd';
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  EditOutlined,
  FireOutlined,
  HddOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  StopOutlined,
} from '@ant-design/icons';

const ACTIVE_NE_API_URL =
  'http://10.155.43.200:8001/api/cienatemp/networkelements/?action=active';
const SLOTS_EQUIP_API_URL =
  'http://10.155.43.200:8001/api/cienatemp/slotsequip/?filter_neid=';
const SLOTS_EQUIP_SYNC_API_URL =
  'http://10.155.43.200:8001/api/cienatemp/slotsequip/';

const getSlotPatchUrl = (id: number) => `${SLOTS_EQUIP_SYNC_API_URL}${id}/`;

interface SlotEquipItem {
  id: number;
  cardId: string;
  locations_shelf: number | string;
  locations_subshelf: string;
  locations_slot: number | string;
  locations_subslot: number | string;
  nativeName: string;
  installedSpec_serialNumber: string;
  installedSpec_manufacturer: string;
  installedSpec_type: string;
  installedSpec_partNumber: string;
  installedSpec_hardwareVersion: string;
  installedSpec_version: string;
  cardType: string;
  tempThreshold: number;
  isActive: boolean;
  networkelement: number;
}

interface ActiveNeOption {
  id: number;
  neId: string;
  name: string;
  isActive: boolean;
}

interface SlotsEquipSyncReport {
  total_active_elements_scanned: number;
  successfully_synced_elements: number;
  new_slots_inserted: number;
  duplicate_slots_skipped: number;
}

interface SlotsEquipSyncResult {
  message: string;
  sync_report: SlotsEquipSyncReport;
}

interface SlotEquipPatchPayload {
  isActive?: boolean;
  tempThreshold?: number;
}

interface SlotEquipPatchResponse {
  id?: number;
  isActive?: boolean;
  tempThreshold?: number;
  message?: string;
  error?: string;
}

const toDisplayText = (value: unknown): string => {
  const text = value == null ? '' : String(value).trim();
  return text || '';
};

const displayValue = (value: unknown): string => {
  const text = toDisplayText(value);
  return text || '-';
};

const renderZeroAsDash = (value: number | string) => (Number(value) === 0 ? '-' : value);

const mapActiveNeOption = (item: any): ActiveNeOption | null => {
  const attrs = item.attributes ?? item;
  const neId = toDisplayText(attrs.neId ?? item.neId);
  if (!neId) return null;

  return {
    id: Number(attrs.id ?? item.id ?? 0),
    neId,
    name: toDisplayText(attrs.name ?? item.name),
    isActive: Boolean(attrs.isActive ?? item.isActive),
  };
};

const mapSlotEquipItem = (item: any): SlotEquipItem => {
  const attrs = item.attributes ?? item;

  return {
    id: Number(attrs.id ?? item.id ?? 0),
    cardId: toDisplayText(attrs.cardId ?? item.cardId),
    locations_shelf: attrs.locations_shelf ?? item.locations_shelf ?? '',
    locations_subshelf: attrs.locations_subshelf ?? item.locations_subshelf ?? '',
    locations_slot: attrs.locations_slot ?? item.locations_slot ?? '',
    locations_subslot: attrs.locations_subslot ?? item.locations_subslot ?? '',
    nativeName: attrs.nativeName ?? item.nativeName ?? '',
    installedSpec_serialNumber: displayValue(
      attrs.installedSpec_serialNumber ?? item.installedSpec_serialNumber
    ),
    installedSpec_manufacturer: displayValue(
      attrs.installedSpec_manufacturer ?? item.installedSpec_manufacturer
    ),
    installedSpec_type: displayValue(attrs.installedSpec_type ?? item.installedSpec_type),
    installedSpec_partNumber: displayValue(
      attrs.installedSpec_partNumber ?? item.installedSpec_partNumber
    ),
    installedSpec_hardwareVersion: displayValue(
      attrs.installedSpec_hardwareVersion ?? item.installedSpec_hardwareVersion
    ),
    installedSpec_version: displayValue(attrs.installedSpec_version ?? item.installedSpec_version),
    cardType: displayValue(attrs.cardType ?? item.cardType),
    tempThreshold: attrs.tempThreshold ?? item.tempThreshold ?? 0,
    isActive: Boolean(attrs.isActive ?? item.isActive),
    networkelement: Number(attrs.networkelement ?? item.networkelement ?? 0),
  };
};

const buildSlotPatchPayload = (
  editingItem: SlotEquipItem,
  values: { isActive: boolean; tempThreshold: number }
): SlotEquipPatchPayload | null => {
  const payload: SlotEquipPatchPayload = {};

  if (values.isActive !== editingItem.isActive) {
    payload.isActive = values.isActive;
  }

  if (Number(values.tempThreshold) !== Number(editingItem.tempThreshold)) {
    payload.tempThreshold = Number(values.tempThreshold);
  }

  return Object.keys(payload).length > 0 ? payload : null;
};

const SlotsEquip: React.FC = () => {
  const [activeNeList, setActiveNeList] = useState<ActiveNeOption[]>([]);
  const [selectedNeId, setSelectedNeId] = useState<string>();
  const [slots, setSlots] = useState<SlotEquipItem[]>([]);
  const [loadingNe, setLoadingNe] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [syncResult, setSyncResult] = useState<SlotsEquipSyncResult | null>(null);
  const [tempThresholdInput, setTempThresholdInput] = useState<number | null>(null);
  const [settingThreshold, setSettingThreshold] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SlotEquipItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchActiveNeList = useCallback(async () => {
    setLoadingNe(true);
    try {
      const response = await fetch(ACTIVE_NE_API_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      const rawItems = Array.isArray(result)
        ? result
        : Array.isArray(result.data)
          ? result.data
          : [];
      const options = rawItems
        .map((item: any) => mapActiveNeOption(item))
        .filter((item: ActiveNeOption | null): item is ActiveNeOption => item !== null);

      setActiveNeList(options);
    } catch (error) {
      console.error('Error fetching active NE list:', error);
      message.error('Không thể tải danh sách thiết bị Active');
      setActiveNeList([]);
    } finally {
      setLoadingNe(false);
    }
  }, []);

  const fetchSlotsByNeId = useCallback(async (neId: string, showToast = true) => {
    setLoadingSlots(true);
    try {
      const response = await fetch(`${SLOTS_EQUIP_API_URL}${encodeURIComponent(neId)}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      const rawItems = Array.isArray(result)
        ? result
        : Array.isArray(result.data)
          ? result.data
          : [];
      const data = rawItems.map((item: any) => mapSlotEquipItem(item));

      setSlots(data);
      if (showToast) {
        message.success(`Tải ${data.length} slot/card thành công`);
      }
    } catch (error) {
      console.error('Error fetching slots equip:', error);
      message.error('Không thể tải dữ liệu Slots Equip');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  const handleUpdateSlotsEquip = async () => {
    setUpdating(true);
    try {
      const response = await fetch(SLOTS_EQUIP_SYNC_API_URL, {
        method: 'POST',
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || result.message || `HTTP error! status: ${response.status}`);
      }

      const syncReport = result.sync_report ?? {};
      const nextResult: SlotsEquipSyncResult = {
        message: result.message || 'Cập nhật Slots Equip thành công',
        sync_report: {
          total_active_elements_scanned: Number(syncReport.total_active_elements_scanned ?? 0),
          successfully_synced_elements: Number(syncReport.successfully_synced_elements ?? 0),
          new_slots_inserted: Number(syncReport.new_slots_inserted ?? 0),
          duplicate_slots_skipped: Number(syncReport.duplicate_slots_skipped ?? 0),
        },
      };

      setSyncResult(nextResult);
      message.success(nextResult.message);
      if (selectedNeId) {
        await fetchSlotsByNeId(selectedNeId, false);
      }
    } catch (error) {
      console.error('Error updating slots equip:', error);
      setSyncResult(null);
      const errorMessage =
        error instanceof Error ? error.message : 'Không thể cập nhật Slots Equip';
      message.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleSetTempThreshold = async () => {
    if (!selectedNeId || slots.length === 0) {
      message.warning('Vui lòng chọn thiết bị có dữ liệu slot/card');
      return;
    }

    if (tempThresholdInput == null || Number.isNaN(Number(tempThresholdInput))) {
      message.warning('Vui lòng nhập ngưỡng nhiệt');
      return;
    }

    const threshold = Number(tempThresholdInput);
    setSettingThreshold(true);

    try {
      let successCount = 0;
      let failCount = 0;
      const updatedIds = new Set<number>();

      for (const slot of slots) {
        try {
          const response = await fetch(getSlotPatchUrl(slot.id), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tempThreshold: threshold }),
          });
          const result = await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(
              result.error || result.message || `HTTP error! status: ${response.status}`
            );
          }

          successCount += 1;
          updatedIds.add(slot.id);
        } catch (error) {
          failCount += 1;
          console.error(`Error updating slot ${slot.id}:`, error);
        }
      }

      if (updatedIds.size > 0) {
        setSlots((prev) =>
          prev.map((slot) =>
            updatedIds.has(slot.id) ? { ...slot, tempThreshold: threshold } : slot
          )
        );
      }

      if (failCount === 0) {
        message.success(`Đã thiết lập ngưỡng nhiệt ${threshold} cho ${successCount} slot/card`);
      } else if (successCount > 0) {
        message.warning(
          `Thiết lập thành công ${successCount} slot/card, thất bại ${failCount} slot/card`
        );
      } else {
        message.error('Không thể thiết lập ngưỡng nhiệt cho các slot/card');
      }
    } finally {
      setSettingThreshold(false);
    }
  };

  const openEditModal = useCallback(
    (record: SlotEquipItem) => {
      setEditingItem(record);
      form.setFieldsValue({
        isActive: record.isActive,
        tempThreshold: record.tempThreshold,
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

  const handleSaveSlot = async () => {
    if (!editingItem) return;

    try {
      const values = await form.validateFields();
      const payload = buildSlotPatchPayload(editingItem, values);

      if (!payload) {
        message.info('Không có thay đổi nào để lưu');
        return;
      }

      setSaving(true);
      const response = await fetch(getSlotPatchUrl(editingItem.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result: SlotEquipPatchResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || result.message || `HTTP error! status: ${response.status}`);
      }

      setSlots((prev) =>
        prev.map((item) => {
          if (item.id !== editingItem.id) return item;

          const updated = { ...item };
          if ('isActive' in payload) {
            updated.isActive = result.isActive ?? payload.isActive ?? item.isActive;
          }
          if ('tempThreshold' in payload) {
            updated.tempThreshold =
              result.tempThreshold ?? payload.tempThreshold ?? item.tempThreshold;
          }
          return updated;
        })
      );

      message.success(result.message || 'Cập nhật slot/card thành công');
      closeEditModal();
    } catch (error) {
      console.error('Error updating slot equip:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật slot/card';
      message.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchActiveNeList();
  }, [fetchActiveNeList]);

  useEffect(() => {
    if (selectedNeId) {
      fetchSlotsByNeId(selectedNeId);
    } else {
      setSlots([]);
    }
  }, [selectedNeId, fetchSlotsByNeId]);

  const selectedNe = useMemo(
    () => activeNeList.find((item) => item.neId === selectedNeId),
    [activeNeList, selectedNeId]
  );

  const columns = useMemo(
    () => [
      {
        title: 'Shelf',
        dataIndex: 'locations_shelf',
        key: 'locations_shelf',
        width: 70,
        sorter: (a: SlotEquipItem, b: SlotEquipItem) =>
          Number(a.locations_shelf) - Number(b.locations_shelf),
      },
      {
        title: 'Sub shelf',
        dataIndex: 'locations_subshelf',
        key: 'locations_subshelf',
        width: 90,
      },
      {
        title: 'Slot',
        dataIndex: 'locations_slot',
        key: 'locations_slot',
        width: 70,
        render: renderZeroAsDash,
        sorter: (a: SlotEquipItem, b: SlotEquipItem) =>
          Number(a.locations_slot) - Number(b.locations_slot),
        defaultSortOrder: 'ascend' as const,
      },
      {
        title: 'Sub slot',
        dataIndex: 'locations_subslot',
        key: 'locations_subslot',
        width: 80,
        render: renderZeroAsDash,
      },
      {
        title: 'Native Name',
        dataIndex: 'nativeName',
        key: 'nativeName',
        width: 140,
        sorter: (a: SlotEquipItem, b: SlotEquipItem) =>
          String(a.nativeName).localeCompare(String(b.nativeName)),
      },
      {
        title: 'Loại card',
        dataIndex: 'cardType',
        key: 'cardType',
        width: 90,
        sorter: (a: SlotEquipItem, b: SlotEquipItem) =>
          String(a.cardType).localeCompare(String(b.cardType)),
      },
      {
        title: 'Serial Number',
        dataIndex: 'installedSpec_serialNumber',
        key: 'installedSpec_serialNumber',
        width: 150,
      },
      {
        title: 'Manufacturer',
        dataIndex: 'installedSpec_manufacturer',
        key: 'installedSpec_manufacturer',
        width: 110,
      },
      {
        title: 'Chi tiết loại card',
        dataIndex: 'installedSpec_type',
        key: 'installedSpec_type',
        width: 260,
      },
      {
        title: 'Part Number',
        dataIndex: 'installedSpec_partNumber',
        key: 'installedSpec_partNumber',
        width: 120,
      },
      {
        title: 'HW Version',
        dataIndex: 'installedSpec_hardwareVersion',
        key: 'installedSpec_hardwareVersion',
        width: 100,
      },
      {
        title: 'Version',
        dataIndex: 'installedSpec_version',
        key: 'installedSpec_version',
        width: 100,
      },
      {
        title: 'Ngưỡng nhiệt',
        dataIndex: 'tempThreshold',
        key: 'tempThreshold',
        width: 100,
      },
      {
        title: 'Thao tác',
        key: 'action',
        fixed: 'right' as const,
        width: 100,
        render: (_: unknown, record: SlotEquipItem) => (
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
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Danh sách card theo Network Element đang Active"
        description="Dropdown lấy danh sách thiết bị từ API networkelements/?action=active. Khi chọn thiết bị, hệ thống gọi API slotsequip với filter_neid là neId tương ứng để hiển thị danh sách slot/card của thiết bị đó."
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="Thiết bị Active" value={activeNeList.length} prefix={<HddOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Slot/Card hiển thị"
              value={slots.length}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Thiết bị đang chọn"
              value={selectedNe?.name || '-'}
              valueStyle={{ fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16, width: '100%' }} wrap>
        <Select
          showSearch
          allowClear
          placeholder="Chọn thiết bị (name)"
          style={{ minWidth: 360 }}
          loading={loadingNe}
          value={selectedNeId}
          optionFilterProp="label"
          onChange={(value) => {
            setSyncResult(null);
            setTempThresholdInput(null);
            setSelectedNeId(value);
          }}
          options={activeNeList.map((item) => ({
            value: item.neId,
            label: item.name || item.neId,
          }))}
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            setSyncResult(null);
            fetchActiveNeList();
          }}
          loading={loadingNe}
        >
          Tải lại danh sách NE
        </Button>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => selectedNeId && fetchSlotsByNeId(selectedNeId)}
          loading={loadingSlots}
          disabled={!selectedNeId}
        >
          Làm mới bảng
        </Button>
        <Popconfirm
          title="Cập nhật Slots Equip cho tất cả thiết bị?"
          description="Hệ thống sẽ POST lên backend để đồng bộ dữ liệu slot/card vào database."
          okText="Cập nhật"
          cancelText="Hủy"
          onConfirm={handleUpdateSlotsEquip}
        >
          <Button
            type="default"
            icon={<CloudUploadOutlined />}
            loading={updating}
            disabled={loadingSlots}
          >
            Cập nhật
          </Button>
        </Popconfirm>
        <InputNumber
          min={0}
          max={200}
          placeholder="Ngưỡng nhiệt"
          value={tempThresholdInput}
          onChange={(value) => setTempThresholdInput(value)}
          disabled={!selectedNeId || slots.length === 0 || settingThreshold}
          style={{ width: 160 }}
        />
        <Popconfirm
          title="Thiết lập ngưỡng nhiệt cho tất cả slot/card?"
          description={
            selectedNe
              ? `Áp dụng ngưỡng ${tempThresholdInput ?? '-'} cho ${slots.length} slot/card của thiết bị "${selectedNe.name}".`
              : 'Vui lòng chọn thiết bị và nhập ngưỡng nhiệt.'
          }
          okText="Thiết lập"
          cancelText="Hủy"
          onConfirm={handleSetTempThreshold}
        >
          <Button
            type="default"
            icon={<FireOutlined />}
            loading={settingThreshold}
            disabled={!selectedNeId || slots.length === 0 || tempThresholdInput == null || loadingSlots}
          >
            Thiết lập
          </Button>
        </Popconfirm>
      </Space>

      {syncResult && (
        <>
          <Alert
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
            message="Kết quả cập nhật Slots Equip"
            description={syncResult.message}
          />
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="NE Active đã quét"
                  value={syncResult.sync_report.total_active_elements_scanned}
                  prefix={<HddOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="NE đồng bộ thành công"
                  value={syncResult.sync_report.successfully_synced_elements}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Slot mới thêm"
                  value={syncResult.sync_report.new_slots_inserted}
                  valueStyle={{ color: '#1677ff' }}
                  prefix={<PlusCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Slot trùng vị trí bỏ qua"
                  value={syncResult.sync_report.duplicate_slots_skipped}
                  valueStyle={{ color: '#faad14' }}
                  prefix={<StopOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}

      <Table
        columns={columns}
        dataSource={slots}
        rowKey="id"
        loading={loadingSlots}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
        }}
        scroll={{ x: 1850 }}
        locale={{ emptyText: selectedNeId ? 'Không có dữ liệu slot/card' : 'Vui lòng chọn thiết bị' }}
      />

      <Modal
        title={`Chỉnh sửa Slot/Card #${editingItem?.id ?? ''}`}
        open={editModalOpen}
        onCancel={closeEditModal}
        onOk={handleSaveSlot}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={saving}
        destroyOnClose
      >
        {editingItem && (
          <>
            <Descriptions size="small" column={1} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Shelf">{editingItem.locations_shelf}</Descriptions.Item>
              <Descriptions.Item label="Slot">{editingItem.locations_slot}</Descriptions.Item>
              <Descriptions.Item label="Native Name">{editingItem.nativeName}</Descriptions.Item>
              <Descriptions.Item label="Loại card">{editingItem.cardType}</Descriptions.Item>
            </Descriptions>

            <Form form={form} layout="vertical">
              <Form.Item
                label="Trạng thái (isActive)"
                name="isActive"
                valuePropName="checked"
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
              <Form.Item
                label="Ngưỡng nhiệt (tempThreshold)"
                name="tempThreshold"
                rules={[{ required: true, message: 'Vui lòng nhập ngưỡng nhiệt' }]}
              >
                <InputNumber min={0} max={200} style={{ width: '100%' }} />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default SlotsEquip;

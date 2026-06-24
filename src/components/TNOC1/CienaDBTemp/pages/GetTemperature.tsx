import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  message,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
} from 'antd';
import { ReloadOutlined, ThunderboltOutlined } from '@ant-design/icons';

const ACTIVE_NE_API_URL =
  'http://10.155.43.200:8001/api/cienatemp/networkelements/?action=active';
const SHELF_API_URL = 'http://10.155.43.200:8001/api/cienatemp/neshelfs/?filter=';
const SLOT_API_URL = 'http://10.155.43.200:8001/api/cienatemp/slotsequip/';
const TEMPERATURE_API_URL =
  'http://10.155.43.200:8001/api/cienatemp/temperaturestatistics/';

interface ActiveNeOption {
  id: number;
  neId: string;
  name: string;
}

interface ShelfOption {
  shelfNumber: string;
}

interface SlotOption {
  id: number;
  locations_slot: number | string;
  nativeName: string;
}

interface ShelfDetailItem {
  key: string;
  slot: number | string;
  nativeName: string;
  status: string;
  temperature?: number | string;
  error?: string;
}

const toDisplayText = (value: unknown): string => {
  const text = value == null ? '' : String(value).trim();
  return text || '';
};

const getRawItems = (result: any): any[] => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (result?.data) return [result.data];
  if (result && typeof result === 'object') return [result];
  return [];
};

const mapActiveNeOption = (item: any): ActiveNeOption | null => {
  const attrs = item.attributes ?? item;
  const neId = toDisplayText(attrs.neId ?? item.neId);
  if (!neId) return null;

  return {
    id: Number(attrs.id ?? item.id ?? 0),
    neId,
    name: toDisplayText(attrs.name ?? item.name) || neId,
  };
};

const mapShelfOption = (item: any): ShelfOption | null => {
  const attrs = item.attributes ?? item;
  const shelfNumber = toDisplayText(attrs.shelfNumber ?? item.shelfNumber);
  if (!shelfNumber) return null;
  return { shelfNumber };
};

const mapSlotOption = (item: any): SlotOption | null => {
  const attrs = item.attributes ?? item;
  const slot = attrs.locations_slot ?? item.locations_slot;
  const nativeName = toDisplayText(attrs.nativeName ?? item.nativeName);

  if (slot == null || String(slot).trim() === '') return null;

  return {
    id: Number(attrs.id ?? item.id ?? 0),
    locations_slot: slot,
    nativeName,
  };
};

const buildUniqueSlotOptions = (items: SlotOption[]): SlotOption[] => {
  const seen = new Set<string>();
  const result: SlotOption[] = [];

  items.forEach((item) => {
    const key = String(item.locations_slot);
    if (seen.has(key)) return;
    seen.add(key);
    result.push(item);
  });

  return result;
};

const GetTemperature: React.FC = () => {
  const [activeNeList, setActiveNeList] = useState<ActiveNeOption[]>([]);
  const [shelfList, setShelfList] = useState<ShelfOption[]>([]);
  const [slotList, setSlotList] = useState<SlotOption[]>([]);
  const [nativeNameList, setNativeNameList] = useState<SlotOption[]>([]);
  const [selectedNeId, setSelectedNeId] = useState<string>();
  const [selectedShelf, setSelectedShelf] = useState<string>();
  const [selectedSlot, setSelectedSlot] = useState<string>();
  const [selectedNativeName, setSelectedNativeName] = useState<string>();
  const [tempCurrent, setTempCurrent] = useState<number | string>();
  const [responseLog, setResponseLog] = useState<unknown>(null);
  const [selectedShelfNeId, setSelectedShelfNeId] = useState<string>();
  const [selectedShelfOnly, setSelectedShelfOnly] = useState<string>();
  const [shelfOnlyList, setShelfOnlyList] = useState<ShelfOption[]>([]);
  const [shelfResponseLog, setShelfResponseLog] = useState<any>(null);
  const [loadingNe, setLoadingNe] = useState(false);
  const [loadingShelf, setLoadingShelf] = useState(false);
  const [loadingSlot, setLoadingSlot] = useState(false);
  const [loadingNativeName, setLoadingNativeName] = useState(false);
  const [gettingTemperature, setGettingTemperature] = useState(false);
  const [loadingShelfOnly, setLoadingShelfOnly] = useState(false);
  const [gettingShelfTemperature, setGettingShelfTemperature] = useState(false);

  const clearTemperatureResult = () => {
    setTempCurrent(undefined);
    setResponseLog(null);
  };

  const clearShelfTemperatureResult = () => {
    setShelfResponseLog(null);
  };

  const fetchActiveNeList = useCallback(async () => {
    setLoadingNe(true);
    try {
      const response = await fetch(ACTIVE_NE_API_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      const data = getRawItems(result)
        .map(mapActiveNeOption)
        .filter((item: ActiveNeOption | null): item is ActiveNeOption => item !== null);

      setActiveNeList(data);
    } catch (error) {
      console.error('Error fetching active NE list:', error);
      message.error('Không thể tải danh sách thiết bị Active');
      setActiveNeList([]);
    } finally {
      setLoadingNe(false);
    }
  }, []);

  const fetchShelfList = useCallback(async (neId: string) => {
    setLoadingShelf(true);
    try {
      const response = await fetch(`${SHELF_API_URL}${encodeURIComponent(neId)}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      const data = getRawItems(result)
        .map(mapShelfOption)
        .filter((item: ShelfOption | null): item is ShelfOption => item !== null);

      setShelfList(data);
    } catch (error) {
      console.error('Error fetching shelf list:', error);
      message.error('Không thể tải danh sách shelf');
      setShelfList([]);
    } finally {
      setLoadingShelf(false);
    }
  }, []);

  const fetchShelfOnlyList = useCallback(async (neId: string) => {
    setLoadingShelfOnly(true);
    try {
      const response = await fetch(`${SHELF_API_URL}${encodeURIComponent(neId)}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      const data = getRawItems(result)
        .map(mapShelfOption)
        .filter((item: ShelfOption | null): item is ShelfOption => item !== null);

      setShelfOnlyList(data);
    } catch (error) {
      console.error('Error fetching shelf list for shelf temperature:', error);
      message.error('Không thể tải danh sách shelf');
      setShelfOnlyList([]);
    } finally {
      setLoadingShelfOnly(false);
    }
  }, []);

  const fetchSlotList = useCallback(async (neId: string, shelf: string) => {
    setLoadingSlot(true);
    try {
      const response = await fetch(
        `${SLOT_API_URL}?filter_neid=${encodeURIComponent(neId)}&shelf=${encodeURIComponent(
          shelf
        )}&shortlist=true`
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      const data = getRawItems(result)
        .map(mapSlotOption)
        .filter((item: SlotOption | null): item is SlotOption => item !== null);

      setSlotList(buildUniqueSlotOptions(data));
    } catch (error) {
      console.error('Error fetching slot list:', error);
      message.error('Không thể tải danh sách slot');
      setSlotList([]);
    } finally {
      setLoadingSlot(false);
    }
  }, []);

  const fetchNativeNameList = useCallback(async (neId: string, shelf: string, slot: string) => {
    setLoadingNativeName(true);
    try {
      const response = await fetch(
        `${SLOT_API_URL}?filter_neid=${encodeURIComponent(neId)}&shelf=${encodeURIComponent(
          shelf
        )}&slot=${encodeURIComponent(slot)}&shortlist=true`
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      const data = getRawItems(result)
        .map(mapSlotOption)
        .filter((item: SlotOption | null): item is SlotOption => item !== null && !!item.nativeName);

      setNativeNameList(data);
    } catch (error) {
      console.error('Error fetching native name list:', error);
      message.error('Không thể tải danh sách Native Name');
      setNativeNameList([]);
    } finally {
      setLoadingNativeName(false);
    }
  }, []);

  const handleGetTemperatureBySlot = async () => {
    if (!selectedNeId || !selectedShelf || !selectedSlot || !selectedNativeName) {
      message.warning('Vui lòng chọn đủ thiết bị, shelf, slot và Native Name');
      return;
    }

    setGettingTemperature(true);
    try {
      const response = await fetch(TEMPERATURE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          neId: selectedNeId,
          shelf: selectedShelf,
          nativeName: selectedNativeName,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || result.message || `HTTP error! status: ${response.status}`);
      }

      setTempCurrent(result.temp_current);
      setResponseLog(result);
      message.success(result.message || 'Lấy nhiệt độ thành công');
    } catch (error) {
      console.error('Error getting temperature by slot:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể lấy nhiệt độ';
      message.error(errorMessage);
      setTempCurrent(undefined);
    } finally {
      setGettingTemperature(false);
    }
  };

  const handleGetTemperatureByShelf = async () => {
    if (!selectedShelfNeId || !selectedShelfOnly) {
      message.warning('Vui lòng chọn đủ thiết bị và shelf');
      return;
    }

    setGettingShelfTemperature(true);
    try {
      const response = await fetch(TEMPERATURE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          neId: selectedShelfNeId,
          shelf: selectedShelfOnly,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || result.message || `HTTP error! status: ${response.status}`);
      }

      setShelfResponseLog(result);
      message.success(result.message || 'Lấy nhiệt độ theo shelf thành công');
    } catch (error) {
      console.error('Error getting temperature by shelf:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Không thể lấy nhiệt độ theo shelf';
      message.error(errorMessage);
      setShelfResponseLog(null);
    } finally {
      setGettingShelfTemperature(false);
    }
  };

  useEffect(() => {
    fetchActiveNeList();
  }, [fetchActiveNeList]);

  const selectedNe = useMemo(
    () => activeNeList.find((item) => item.neId === selectedNeId),
    [activeNeList, selectedNeId]
  );

  const selectedShelfNe = useMemo(
    () => activeNeList.find((item) => item.neId === selectedShelfNeId),
    [activeNeList, selectedShelfNeId]
  );

  const shelfDetailRows = useMemo<ShelfDetailItem[]>(() => {
    const details = Array.isArray(shelfResponseLog?.details) ? shelfResponseLog.details : [];

    return details.map((item: any, index: number) => ({
      key: `${item.slot ?? 'slot'}-${item.nativeName ?? 'native'}-${index}`,
      slot: item.slot ?? '',
      nativeName: toDisplayText(item.nativeName),
      status: toDisplayText(item.status),
      temperature: item.temperature,
      error: toDisplayText(item.error),
    }));
  }, [shelfResponseLog]);

  const shelfDetailColumns = [
    { title: 'Slot', dataIndex: 'slot', key: 'slot', width: 100 },
    { title: 'Native Name', dataIndex: 'nativeName', key: 'nativeName', width: 180 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value: string) => (
        <Tag color={value === 'success' ? 'green' : value === 'error' ? 'red' : 'default'}>
          {value || '-'}
        </Tag>
      ),
    },
    {
      title: 'Temperature',
      dataIndex: 'temperature',
      key: 'temperature',
      width: 140,
      render: (value: number | string | undefined) =>
        value == null || value === '' ? '-' : `${value}°C`,
    },
    {
      title: 'Error',
      dataIndex: 'error',
      key: 'error',
      render: (value: string) => value || '-',
    },
  ];

  const slotTemperatureArea = (
    <Card title="Lấy nhiệt độ theo slot" style={{ marginBottom: 24 }}>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Lấy nhiệt độ theo slot"
        description={
          <>
            Chọn thiết bị, shelf, slot và Native Name. Hệ thống POST các tham số neId, shelf,
            nativeName đến API temperaturestatistics để lấy nhiệt độ nhân công từ thiết bị.
            <br />
            Thiết bị Active: <strong>{activeNeList.length}</strong> | Thiết bị đang chọn:{' '}
            <strong>{selectedNe?.name || '-'}</strong>
          </>
        }
      />

      <Space style={{ marginBottom: 16, width: '100%' }} wrap>
        <Select
          showSearch
          allowClear
          placeholder="Chọn thiết bị"
          style={{ minWidth: 320 }}
          loading={loadingNe}
          value={selectedNeId}
          optionFilterProp="label"
          onChange={(value) => {
            setSelectedNeId(value);
            setSelectedShelf(undefined);
            setSelectedSlot(undefined);
            setSelectedNativeName(undefined);
            setShelfList([]);
            setSlotList([]);
            setNativeNameList([]);
            clearTemperatureResult();
            if (value) {
              fetchShelfList(value);
            }
          }}
          options={activeNeList.map((item) => ({
            value: item.neId,
            label: item.name || item.neId,
          }))}
        />

        <Select
          showSearch
          allowClear
          placeholder="Chọn shelf"
          style={{ minWidth: 180 }}
          loading={loadingShelf}
          value={selectedShelf}
          disabled={!selectedNeId}
          optionFilterProp="label"
          onChange={(value) => {
            setSelectedShelf(value);
            setSelectedSlot(undefined);
            setSelectedNativeName(undefined);
            setSlotList([]);
            setNativeNameList([]);
            clearTemperatureResult();
            if (selectedNeId && value) {
              fetchSlotList(selectedNeId, value);
            }
          }}
          options={shelfList.map((item) => ({
            value: item.shelfNumber,
            label: item.shelfNumber,
          }))}
        />

        <Select
          showSearch
          allowClear
          placeholder="Chọn slot"
          style={{ minWidth: 180 }}
          loading={loadingSlot}
          value={selectedSlot}
          disabled={!selectedNeId || !selectedShelf}
          optionFilterProp="label"
          onChange={(value) => {
            setSelectedSlot(value);
            setSelectedNativeName(undefined);
            setNativeNameList([]);
            clearTemperatureResult();
            if (selectedNeId && selectedShelf && value) {
              fetchNativeNameList(selectedNeId, selectedShelf, value);
            }
          }}
          options={slotList.map((item) => ({
            value: String(item.locations_slot),
            label: String(item.locations_slot),
          }))}
        />

        <Select
          showSearch
          allowClear
          placeholder="Chọn Native Name"
          style={{ minWidth: 240 }}
          loading={loadingNativeName}
          value={selectedNativeName}
          disabled={!selectedNeId || !selectedShelf || !selectedSlot}
          optionFilterProp="label"
          onChange={(value) => {
            setSelectedNativeName(value);
            clearTemperatureResult();
          }}
          options={nativeNameList.map((item) => ({
            value: item.nativeName,
            label: item.nativeName,
          }))}
        />

        <Button
          icon={<ReloadOutlined />}
          onClick={fetchActiveNeList}
          loading={loadingNe}
        >
          Tải lại thiết bị
        </Button>

        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          onClick={handleGetTemperatureBySlot}
          loading={gettingTemperature}
          disabled={!selectedNeId || !selectedShelf || !selectedSlot || !selectedNativeName}
        >
          Lấy nhiệt độ
        </Button>
        <Card size="small" bodyStyle={{ padding: '6px 12px' }} style={{ minWidth: 130 }}>
          <Statistic
            title="Kết quả"
            value={tempCurrent ?? '-'}
            suffix={tempCurrent == null ? undefined : '°C'}
            prefix={<ThunderboltOutlined />}
            valueStyle={{ fontSize: 18 }}
          />
        </Card>
      </Space>

      {responseLog && (
        <Card title="Log response API" style={{ marginBottom: 16 }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(responseLog, null, 2)}
          </pre>
        </Card>
      )}

    </Card>
  );

  const shelfTemperatureArea = (
    <Card title="Lấy nhiệt độ theo shelf">
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Lấy nhiệt độ theo shelf"
        description={
          <>
            Chọn thiết bị và shelf. Hệ thống POST các tham số neId, shelf đến API
            temperaturestatistics để quét nhiệt độ các slot thuộc shelf.
            <br />
            Thiết bị Active: <strong>{activeNeList.length}</strong> | Thiết bị đang chọn:{' '}
            <strong>{selectedShelfNe?.name || '-'}</strong>
          </>
        }
      />

      <Space style={{ marginBottom: 16, width: '100%' }} wrap>
        <Select
          showSearch
          allowClear
          placeholder="Chọn thiết bị"
          style={{ minWidth: 320 }}
          loading={loadingNe}
          value={selectedShelfNeId}
          optionFilterProp="label"
          onChange={(value) => {
            setSelectedShelfNeId(value);
            setSelectedShelfOnly(undefined);
            setShelfOnlyList([]);
            clearShelfTemperatureResult();
            if (value) {
              fetchShelfOnlyList(value);
            }
          }}
          options={activeNeList.map((item) => ({
            value: item.neId,
            label: item.name || item.neId,
          }))}
        />

        <Select
          showSearch
          allowClear
          placeholder="Chọn shelf"
          style={{ minWidth: 180 }}
          loading={loadingShelfOnly}
          value={selectedShelfOnly}
          disabled={!selectedShelfNeId}
          optionFilterProp="label"
          onChange={(value) => {
            setSelectedShelfOnly(value);
            clearShelfTemperatureResult();
          }}
          options={shelfOnlyList.map((item) => ({
            value: item.shelfNumber,
            label: item.shelfNumber,
          }))}
        />

        <Button
          icon={<ReloadOutlined />}
          onClick={fetchActiveNeList}
          loading={loadingNe}
        >
          Tải lại thiết bị
        </Button>

        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          onClick={handleGetTemperatureByShelf}
          loading={gettingShelfTemperature}
          disabled={!selectedShelfNeId || !selectedShelfOnly}
        >
          Lấy nhiệt độ
        </Button>
      </Space>

      {shelfResponseLog && (
        <>
          <Card title="Kết quả quét shelf" style={{ marginBottom: 16 }}>
            <Space direction="vertical" size={4}>
              <div>
                <strong>message:</strong> {shelfResponseLog.message || '-'}
              </div>
              <div>
                <strong>Tên thiết bị:</strong> {shelfResponseLog['Tên thiết bị'] || '-'}
              </div>
              <div>
                <strong>shelf:</strong> {shelfResponseLog.shelf ?? '-'}
              </div>
              <div>
                <strong>total_slots_scanned:</strong>{' '}
                {shelfResponseLog.total_slots_scanned ?? '-'}
              </div>
            </Space>
          </Card>

          <Card title="Chi tiết quét nhiệt độ">
            <Table
              columns={shelfDetailColumns}
              dataSource={shelfDetailRows}
              rowKey="key"
              pagination={{ pageSize: 10, showSizeChanger: true }}
              scroll={{ x: 900 }}
              locale={{ emptyText: 'Không có chi tiết quét nhiệt độ' }}
            />
          </Card>
        </>
      )}
    </Card>
  );

  return (
    <div>
      {slotTemperatureArea}
      {shelfTemperatureArea}
    </div>
  );
};

export default GetTemperature;

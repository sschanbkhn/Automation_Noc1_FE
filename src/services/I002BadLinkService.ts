import request from 'helpers/request';
import { IResponseMessage } from 'models/Apps';
import badlinkMock from 'components/INOC1/I002/I002_3_BadLink/data.json';

const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try { return await fn(); } catch { return fallback; }
};

const I002BadLinkService = {
  async GetList(): Promise<any> {
    return safe(async () => {
      const res: any = await request.get('/I002BadLink/list');
      return res;
    }, {
      Success: true,
      Data: (badlinkMock as any).list
    });
  },

  async CheckLink(id: string): Promise<any> {
    return safe(async () => {
      const res: any = await request.get('/I002BadLink/check', { params: { id } });
      return res;
    }, {
      Success: true,
      Data: ((badlinkMock as any).details && (badlinkMock as any).details[id]) || {
        id,
        router: 'PE-HNI-01', ip: '10.0.0.1', port: 'xe-1/0/0',
        portStatus: 'flap',
        bandwidthGbps: 10, currentGbps: 8.4, usage: 84,
        agg: { name: 'ae1', groupBandwidth: 40, groupTraffic: 6.4, usage: 16 },
        note: 'Đã ghi nhận cảnh báo, kiểm tra bắt đầu diễn giải.',
        can_disable: true
      }
    });
  },

  async DisablePort(id: string): Promise<IResponseMessage> {
    return safe(async () => {
      const res: any = await request.post('/I002BadLink/disable', { id });
      return res;
    }, { Success: true, Message: 'Port đã disable', Data: { id, statusProcess: 'Auto', timeReboot: new Date().toLocaleString('vi-VN') } } as any);
  },

  async MarkNA(id: string): Promise<IResponseMessage> {
    return safe(async () => {
      const res: any = await request.post('/I002BadLink/na', { id });
      return res;
    }, { Success: true, Message: 'Đánh dấu N/A', Data: { id, statusProcess: 'N/A' } } as any);
  }
};

export default I002BadLinkService;

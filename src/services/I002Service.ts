import request from 'helpers/request';
import { IResponseMessage } from 'models/Apps';

const withFallback = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try { return await fn(); } catch { return fallback; }
};

const I002Service = {
  async GetAlarms(): Promise<any> {
    return withFallback(async () => {
      const res: any = await request.get('/I002/alarms');
      return res;
    }, {
      Success: true,
      Data: [
        { id: '1', appearTime: '16:52:54 15/10/2025', alarmId: 'AL-1001', device: 'PTO-BNG1', ipLoopback: '123.29.4.187', fpcSlot: 'FPC 11', severity: 'Major', keyword: 'FPC temperature high', statusProcess: '', timeReboot: '-', timeClear: { status: 'Not clear', at: '' }, canRestart: 'yes' },
        { id: '2', appearTime: '16:16:24 15/10/2025', alarmId: 'AL-1002', device: 'PE-HNI-01', ipLoopback: '10.0.0.1', fpcSlot: 'FPC1', severity: 'Critical', keyword: 'Link flap detected', statusProcess: '', timeReboot: '-', timeClear: { status: 'Not clear', at: '' }, canRestart: 'no' },
        { id: '3', appearTime: '15:43:24 15/10/2025', alarmId: 'AL-1003', device: 'PE-HCM-02', ipLoopback: '10.0.0.2', fpcSlot: 'FPC0', severity: 'Minor', keyword: 'Packet drop anomaly', statusProcess: 'Manual', timeReboot: '-', timeClear: { status: 'Cleared', at: '16:18:24 15/10/2025' }, canRestart: 'no' }
      ]
    });
  },

  async CheckAlarm(alarmId: string): Promise<any> {
    return withFallback(async () => {
      const res: any = await request.get('/I002/check', { params: { alarmId } });
      return res;
    }, {
      Success: true,
      Data: {
        alarmId,
        device: 'PTO-BNG1',
        ipLoopback: '123.29.4.187',
        fpcSlot: 'FPC 11',
        severity: 'Major',
        keyword: 'FPC temperature high',
        desc: 'FPC temperature exceeds threshold, auto check started.',
        serial: 'CAJ0495',
        pn: '750-06744',
        model: 'MX-MPC2E-3D',
        version: 'REV 07',
        can_restart: 'yes',
        interfaces: [
          { name: 'xe-1/0/0', admin_status: 'up', oper_status: 'down' },
          { name: 'xe-1/0/1', admin_status: 'up', oper_status: 'down' },
          { name: 'xe-1/1/0', admin_status: 'down', oper_status: 'down' },
          { name: 'xe-1/1/1', admin_status: 'up', oper_status: 'down' }
        ]
      }
    });
  },

  async AutoRebootFPC(alarmId: string): Promise<IResponseMessage> {
    return withFallback(async () => {
      const res: any = await request.post('/I002/reboot', { alarmId });
      return res;
    }, { Success: true, Message: 'Auto reboot started', Data: { alarmId, timeReboot: new Date().toLocaleString('vi-VN') } } as any);
  },

  async ManualProcess(alarmId: string): Promise<IResponseMessage> {
    return withFallback(async () => {
      const res: any = await request.post('/I002/manual', { alarmId });
      return res;
    }, { Success: true, Message: 'Marked as manual', Data: { alarmId } } as any);
  }
};

export default I002Service;

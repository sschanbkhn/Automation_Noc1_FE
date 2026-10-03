// Hook DUNG CHUNG cho lich su 2 chi so QoS va QoE theo ngay.
//
// TAI SAO gop 1 hook thay vi viet useQoeHistory rieng: 2 endpoint /qos/{cell} va /qoe/{cell} nhan Y HET
// param ({days} hoac {from,to}) va tra ve Y HET hinh dang, KHAC DUNG 1 CHO la ten truong diem ("qos" vs
// "qoe"). Neu de 2 hook rieng thi moi cho dung (chart 15 ngay) phai tu re nhanh chon hook - ma re nhanh
// hook trong React la vi pham Rules of Hooks. Gop vao day: cho dung goi 1 hook duy nhat, truyen chi so nao
// muon xem, va NHAN VE CUNG MOT KIEU (QosHistoryResponse) nen toan bo phan tinh toan/ve chart cua QoS
// (buildQosEvaluation, resolveQosWindow, QosEvaluationChart) dung lai duoc nguyen ven, khong phai nhan ban
import { useQuery } from '@tanstack/react-query';
import { getQosHistory, getQoeHistory } from '../services/R012Service';
import { QosHistoryResponse, QosHistoryQueryParams } from '../types';

export type ChiSoChatLuong = 'qos' | 'qoe';

export const useChiSoHistory = (
  chiSo: ChiSoChatLuong,
  cellName: string | null,
  params: QosHistoryQueryParams = {}
) => {
  return useQuery<QosHistoryResponse>({
    // Voi chiSo='qos' thi queryKey ra DUNG ['r012','qos-history',...] - TRUNG KHOP voi useQosHistory dang
    // dung o CellQosHistoryChart, nen 2 noi van dung chung cache cho cung 1 cell/window thay vi goi 2 lan
    queryKey: ['r012', `${chiSo}-history`, cellName, params],
    queryFn: async () => {
      if (chiSo === 'qoe') {
        const res = await getQoeHistory(cellName as string, params);
        // doi ten truong qoe -> qos NGAY TAI DAY de moi thu phia sau chi phai biet 1 hinh dang duy nhat.
        // Day KHONG phai "gia mao QoS": QosHistoryPoint chi la kieu du lieu "diem so theo thoi gian",
        // ten truong la chi tiet lich su cua endpoint QoS chu khong mang y nghia nghiep vu rieng
        return { cell_name: res.cell_name, data: res.data.map((p) => ({ time: p.time, qos: p.qoe })) };
      }
      return getQosHistory(cellName as string, params);
    },
    enabled: cellName !== null,
  });
};

export default useChiSoHistory;

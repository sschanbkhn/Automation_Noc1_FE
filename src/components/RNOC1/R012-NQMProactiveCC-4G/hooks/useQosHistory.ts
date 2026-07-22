// hook wrap useQuery cua TanStack Query quanh R012Service.getQosHistory
// chi goi API khi da co cellName (enabled) - dropdown chon cell trong CellQosHistoryChart/QosEvaluationChart
// chua chon gi (cellName=null) thi KHONG goi API vo ich
import { useQuery } from '@tanstack/react-query';
import { getQosHistory } from '../services/R012Service';
import { QosHistoryResponse, QosHistoryQueryParams } from '../types';

// params nhan CA {days} (Phan 2, preview) LAN {from,to} (Phan 3, danh gia chat luong) - xem comment
// QosHistoryQueryParams trong types/index.ts de biet 2 che do nay khac nhau the nao o phia BE
export const useQosHistory = (cellName: string | null, params: QosHistoryQueryParams = {}) => {
  return useQuery<QosHistoryResponse>({
    // queryKey gom ca cellName VA params - doi cell hoac doi window (days/from/to) deu phai goi lai API,
    // khong doc nham cache cell/khoang ngay khac
    queryKey: ['r012', 'qos-history', cellName, params],
    queryFn: () => getQosHistory(cellName as string, params),
    enabled: cellName !== null,
  });
};

export default useQosHistory;

// hook wrap useQuery cua TanStack Query quanh R012Service.getStationsMap - dung cho ban do xem truoc CR
// (BUOC 4c, 10/10/2026, BE chua deploy) de hien TOAN BO tram cung tinh voi X lam context tren ban do
import { useQuery } from '@tanstack/react-query';
import { getStationsMap } from '../services/R012Service';
import { StationMapPoint } from '../types';

// maTinh null/undefined (chua xac dinh duoc tinh cua X, vd X thieu ma_tinh) -> KHONG goi API (enabled:false),
// tranh goi /stations/map?ma_tinh=null/undefined chac chan bi BE tra 422 (Query(..., min_length=3, max_length=3))
export const useStationsMap = (maTinh: string | null | undefined) => {
  return useQuery<StationMapPoint[]>({
    // cache theo TUNG TINH (yeu cau truc tiep user "cache theo tinh") - doi X sang tram KHAC tinh moi goi
    // lai API, doi sang tram CUNG tinh thi dung lai cache, khong goi lai ~6.200 tram (vd HNI) mot lan nua
    queryKey: ['r012', 'stationsMap', maTinh],
    queryFn: () => getStationsMap(maTinh as string),
    enabled: !!maTinh,
    // staleTime/cacheTime dai hon useStations (danh sach tram 1 tinh gan nhu khong doi trong 1 phien lam
    // viec, khac trang_thai/cr_status cua bang tram co the doi lien tuc) - giam so lan tai lai ~6.200 tram
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });
};

export default useStationsMap;

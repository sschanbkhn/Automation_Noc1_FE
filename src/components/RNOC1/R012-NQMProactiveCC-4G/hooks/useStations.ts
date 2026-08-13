// hook wrap useQuery cua TanStack Query quanh R012Service.getStations
// chi goi API that qua service, khong tu them logic tinh toan/format du lieu
import { useQuery } from '@tanstack/react-query';
import { getStations } from '../services/R012Service';
import { StationsQueryParams, StationListResponse } from '../types';

export const useStations = (params?: StationsQueryParams) => {
  return useQuery<StationListResponse>({
    // query key gom ten module + ten resource + params, de TanStack Query tu tach cache theo tung bo loc/trang khac nhau
    // khi params doi (vd doi trang, doi tu khoa tim kiem) thi key doi theo, tranh doc nham cache cu
    queryKey: ['r012', 'stations', params],
    // queryFn goi thang R012Service.getStations, khong bien doi them du lieu tra ve
    queryFn: () => getStations(params),
    // staleTime 30s: trang thai tram (trang_thai, cr_status) co the doi trong luc NOC dang thao tac CR,
    // nen khong de qua lau moi coi la cu, nhung cung khong can refetch lien tuc gay tai BE
    staleTime: 30 * 1000,
    // cacheTime 5 phut: giu du lieu trong cache du lau de chuyen qua lai giua cac tab/lan xem khong phai cho lai,
    // nhung van don dep sau 1 khoang de tranh giu cache qua han qua lau trong bo nho
    cacheTime: 5 * 60 * 1000,
  });
};

export default useStations;

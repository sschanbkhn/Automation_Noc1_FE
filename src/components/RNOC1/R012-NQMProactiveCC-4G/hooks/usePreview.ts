// hook wrap useMutation cua TanStack Query quanh R012Service.getPreview
// dung useMutation (KHONG phai useQuery) vi preview chi duoc goi khi NOC chu dong bam nut
// "Xem truoc anh huong" - neu dung useQuery se tu dong fetch ngay khi co du lieu tram_id, goi CDS
// (mat vai giay theo yeu cau) khong can thiet moi lan NOC chi luot xem qua danh sach tram
import { useMutation } from '@tanstack/react-query';
import { getPreview } from '../services/R012Service';
import { TriggerCrRequest, PreviewCrResponse } from '../types';

export const usePreview = () => {
  return useMutation<PreviewCrResponse, Error, TriggerCrRequest>({
    // mutationFn goi thang R012Service.getPreview, khong bien doi them du lieu tra ve -
    // component goi mutate() se tu quan ly loading (isLoading) / error (isError, error) tu ket qua hook nay
    mutationFn: (payload) => getPreview(payload),
  });
};

export default usePreview;

// Nhan/mau "Ket luan" + dinh dang diem so DUNG CHUNG cho ca 2 bang hau kiem QoS (QosEvaluationTable.tsx) va
// QoE (QoeCellsTable.tsx) - TACH RIENG file nay (18/10/2026, yeu cau truc tiep user: "QoS va QoE hien thi DOI
// XUNG o moi cho - cung cot, cung nhan, cung mau"). TRUOC DAY 2 bang moi ban tu khai CONCLUSION_TAG/
// KET_QUA_TAG rieng, GAN GIONG nhau nhung LECH 1 chu cho CUNG 1 gia tri INSUFFICIENT_DATA ("Chua du du lieu"
// o QoS vs "Khong du du lieu" o QoE) - gop ve 1 nguon DUY NHAT de khong con lech, dung CHINH chu "Thieu du
// lieu" theo yeu cau.

// ket_qua: "PASS"|"FAIL"|"INSUFFICIENT_DATA" (de string, KHONG union - BE khai bao la str tu do, xem
// QosCellItem/QoeCellItem trong types/index.ts). INSUFFICIENT_DATA mau XAM (default) - day la tinh trang
// BINH THUONG khi CTS/CEM thieu du lieu (vd lo thung du lieu CEM thang 7), KHONG phai loi he thong - to mau
// do se bien bang danh gia thanh 1 bang toan bao dong gia. KHONG an dong nay (BE van tra ve day du, xem WHY
// trong QosCellItem/QoeCellItem) - van hien Tag binh thuong nhu moi ket_qua khac
export const KET_QUA_TAG: Record<string, { label: string; color: string }> = {
  PASS: { label: "DAT", color: "green" },
  FAIL: { label: "KHONG DAT", color: "red" },
  INSUFFICIENT_DATA: { label: "Thieu du lieu", color: "default" },
};

// "" = "Tat ca" - khong loc theo Ket luan, giong quy uoc cac bo loc khac trong module
export const KET_QUA_FILTER_OPTIONS = [
  { value: "", label: "Tat ca ket luan" },
  { value: "PASS", label: "DAT" },
  { value: "FAIL", label: "KHONG DAT" },
  { value: "INSUFFICIENT_DATA", label: "Thieu du lieu" },
];

// dinh dang 1 DIEM SO (avg_before/avg_after/delta/diem_thap_nhat_sau) - 2 chu so thap phan, dau PHAY (quy
// uoc so VN). SUA (18/10/2026, yeu cau truc tiep user) - LUU Y QUAN TRONG: day la DIEM SO tren thang 1-5
// (MOS-like), KHONG PHAI phan tram - DA XAC NHAN qua doc truc tiep domain/services/evaluation_service.py
// ben BE (MUC_TOI_THIEU = 3.0 la 1 nguong TREN THANG DIEM, hoan toan khong lien quan 0-100%). Vi vay KHONG
// duoc gan dau "%" (se hien SAI nhu "3,80%" cho 1 diem so 3.8/5, vo nghia don vi) - ham nay CHI dung CHUNG
// CACH dinh dang (2 chu so + dau phay) voi formatPercent/formatSrPercent (helpers/hoLabels.ts), KHONG goi
// chung CHINH 2 ham do (2 loai gia tri khac ban chat, gop chung se nham don vi hien thi).
// null/undefined -> "-" (CHUA co du lieu - KHAC voi 0.00 la 1 diem so THAT, vd CTS/CEM thieu du lieu cell do)
export function formatDiemSo(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }
  return value.toFixed(2).replace(".", ",");
}

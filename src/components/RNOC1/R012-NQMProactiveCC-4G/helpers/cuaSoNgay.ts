// Hien thi CUA SO NGAY danh gia (BE tra o cap response cua /qos-cells, /qoe-cells).
//
// === VI SAO CAN ===
// Truoc day FE chi hien "6 ngay" - khong noi len duoc 6 ngay do la NHIEU hay IT: 6/7 la gan du, 6/15 la
// thieu tram trong. Va quan trong hon: QoS voi QoE tinh tren 2 TAP NGAY khac nhau (CTS tre 1 ngay, CEM
// tre 2 ngay va co lo thung du lieu) nhung UI lai dat 2 bang canh nhau nhu the chung cung mot thuoc do.
// Do that session 1811: QoS before 06-12 (7 ngay) / after 14-19 (6 ngay); QoE before 07-12 (6 ngay) /
// after 14-20 (7 ngay). Khong noi ra thi nguoi dung se so sanh 2 con so trung binh nhu the chung so sanh
// duoc voi nhau.
import dayjs from "dayjs";

import { CuaSoNgay } from "../types";

// "2026-08-14" -> "14/08". Dang NGAN dung trong o bang/tooltip; nam bi cat vi ca 2 dau mut cua 1 cua so
// luon cung nam (cua so chi 7 ngay) va nam da co o cot "Bat dau"
const ngayNgan = (v: string): string => dayjs(v).format("DD/MM");

// So ngay cua CUA SO YEU CAU (tinh ca 2 dau mut). KHAC voi so ngay THUC TE co du lieu - do la
// so_ngay_before/so_ngay_after cua tung cell
export const soNgayCuaSo = (cs: CuaSoNgay): number => dayjs(cs.den).diff(dayjs(cs.tu), "day") + 1;

// "6/7 ngay (14-20/08)" - mau so la do dai cua so yeu cau, tu so la so ngay thuc te co du lieu
export const moTaSoNgay = (soNgayThucTe: number, cs: CuaSoNgay | undefined): string => {
  if (!cs) {
    // chua co du lieu cua so (response cu / dang tai) - van hien duoc phan biet duoc
    return `${soNgayThucTe} ngay`;
  }
  return `${soNgayThucTe}/${soNgayCuaSo(cs)} ngay (${ngayNgan(cs.tu)}-${ngayNgan(cs.den)})`;
};

// Mot dong tom tat cua so cua ca bang, dat duoi tieu de: "Ngay CR 13/08 - cua so truoc 06-12/08, sau 14-20/08"
export const moTaCuaSoBang = (
  ngayCr: string | undefined,
  before: CuaSoNgay | undefined,
  after: CuaSoNgay | undefined
): string | null => {
  if (!ngayCr || !before || !after) {
    return null;
  }
  return (
    `Ngay CR ${ngayNgan(ngayCr)} - cua so truoc ${ngayNgan(before.tu)}-${ngayNgan(before.den)}, ` +
    `sau ${ngayNgan(after.tu)}-${ngayNgan(after.den)}`
  );
};

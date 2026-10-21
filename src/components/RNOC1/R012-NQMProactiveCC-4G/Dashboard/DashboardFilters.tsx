// Thanh bo loc chung cua tab Dashboard (LAM LAI 18/10/2026, yeu cau truc tiep user, muc 1) - Khoang ngay |
// Khu vuc | Tinh | Vendor, lay lua chon tu GET /dashboard/bo-loc. Chon Khu vuc se LOC lai danh sach Tinh
// (chi con tinh thuoc khu vuc do) - tu BO LUA CHON TINH neu tinh do khong con hop le sau khi doi Khu vuc.
import React, { useEffect, useMemo } from "react";
import { Button, DatePicker, Tooltip } from "antd";
import { useQuery } from "@tanstack/react-query";
import dayjs, { Dayjs } from "dayjs";
import { getDashboardBoLoc } from "../services/R012Service";
import { DashboardBoLocResponse } from "../types";
import SelectTimKiemNhieu from "./SelectTimKiemNhieu";
import { MAU } from "./dashboardConstants";
import ThanhBoLoc, { BO_LOC_RONG, CumNut, oRongCoGian } from "../common/ThanhBoLoc";

const { RangePicker } = DatePicker;

// presets khoang ngay thuong dung (THEM 19/10/2026, yeu cau truc tiep user muc 2) - "7 ngay"/"30 ngay" la
// cua so TRUOT (tinh den HOM NAY, giong gia tri mac dinh cua Dashboard.tsx), "Thang nay"/"Thang truoc" CAN
// THEO LICH (startOf/endOf "month"), "3 thang" la cua so TRUOT 3 thang gan nhat (giong kieu 7/30 ngay, KHONG
// phai 1 thang lich cu the) - quy uoc nay pho bien o cac dashboard BI khac (khoang ngan = truot, ky co ten
// rieng = theo lich)
const PRESETS_NGAY: Array<{ label: string; value: [Dayjs, Dayjs] }> = [
  { label: "7 ngay", value: [dayjs().subtract(6, "day"), dayjs()] },
  { label: "30 ngay", value: [dayjs().subtract(29, "day"), dayjs()] },
  { label: "Thang nay", value: [dayjs().startOf("month"), dayjs()] },
  { label: "Thang truoc", value: [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")] },
  { label: "3 thang", value: [dayjs().subtract(3, "month"), dayjs()] },
];

interface DashboardFiltersProps {
  dateRange: [Dayjs, Dayjs];
  onDateRangeChange: (range: [Dayjs, Dayjs]) => void;
  khuVuc: string[];
  onKhuVucChange: (v: string[]) => void;
  maTinh: string[];
  onMaTinhChange: (v: string[]) => void;
  vendor: string[];
  onVendorChange: (v: string[]) => void;
  onXuatExcel: () => void;
  dangXuatExcel: boolean;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  khuVuc,
  onKhuVucChange,
  maTinh,
  onMaTinhChange,
  vendor,
  onVendorChange,
  onXuatExcel,
  dangXuatExcel,
}) => {
  // bo-loc gan nhu khong doi trong 1 phien lam viec (DISTINCT tu bang tram) - staleTime dai de khong goi lai
  // lien tuc moi lan mo tab Dashboard
  const { data: boLoc } = useQuery<DashboardBoLocResponse>({
    queryKey: ["r012", "dashboard-bo-loc"],
    queryFn: getDashboardBoLoc,
    staleTime: 10 * 60 * 1000,
  });

  const khuVucOptions = useMemo(() => (boLoc?.khu_vuc ?? []).map((kv) => ({ label: kv, value: kv })), [boLoc]);

  const vendorOptions = useMemo(() => (boLoc?.vendor ?? []).map((v) => ({ label: v, value: v })), [boLoc]);

  // chon Khu vuc -> CHI con tinh thuoc khu vuc do (yeu cau truc tiep user) - khong chon khu vuc nao thi hien
  // TOAN BO tinh. Nhan "<ma> - <ten>" (vd "HNI - Ha Noi") - fallback ve chinh ma neu ten null (du lieu chua
  // map duoc, xem WHY o DashboardBoLocMaTinh)
  const tinhOptions = useMemo(() => {
    const list = boLoc?.ma_tinh ?? [];
    const daLoc = khuVuc.length > 0 ? list.filter((t) => t.khu_vuc && khuVuc.includes(t.khu_vuc)) : list;
    return daLoc.map((t) => ({ label: `${t.ma} - ${t.ten ?? t.ma}`, value: t.ma }));
  }, [boLoc, khuVuc]);

  // SUA (18/10/2026) - khi doi Khu vuc, tu dong bo CAC tinh dang chon ma khong con thuoc khu vuc moi (tranh
  // giu 1 bo loc "mo coi" nguoi dung khong con nhin thay trong dropdown nhung van am tham loc du lieu)
  useEffect(() => {
    if (!boLoc || khuVuc.length === 0 || maTinh.length === 0) {
      return;
    }
    const maHopLe = new Set(tinhOptions.map((o) => o.value));
    const conLai = maTinh.filter((m) => maHopLe.has(m));
    if (conLai.length !== maTinh.length) {
      onMaTinhChange(conLai);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [khuVuc, boLoc]);

  const handleDateRangeChange = (values: [Dayjs | null, Dayjs | null] | null) => {
    if (values && values[0] && values[1]) {
      onDateRangeChange([values[0], values[1]]);
    }
  };

  return (
    <>
      {/* vien Select/RangePicker = MAU.nen.vien (yeu cau truc tiep user lan 5, muc 3) - antd KHONG cho sua
      mau vien o ".ant-select-selector"/".ant-picker" qua prop style thong thuong (style cua <Select>/
      <RangePicker> chi gan vao DIV bao ngoai, khong vao DUNG o nhap ben trong) nen phai override qua CSS
      scope rieng, giong cach DashboardChiTietModal.tsx da lam cho mau nut dong X cua Modal
      (".ant-modal-close"). Dat CLASS RIENG (khong phai class dung chung "r012-thanh-bo-loc" cua ThanhBoLoc)
      de CHI anh huong hang bo loc cua Dashboard, khong lan sang 3 man con lai dang KHONG dung MAU.nen.vien */}
      <style>{`
        .r012-dashboard-filters-row .ant-select-selector,
        .r012-dashboard-filters-row .ant-picker {
          border-color: ${MAU.nen.vien} !important;
        }
      `}</style>
      <ThanhBoLoc
        className="r012-dashboard-filters-row"
        style={{
          // nen = MAU.nen.xanh (yeu cau truc tiep user lan 5, muc 3: "vung bo loc nen nen.xanh" - THAY
          // R012_COLORS.tableRowAlt/primaryPale cu, 2 token do thuoc theme.ts chung toan app, khong con dung
          // cho rieng Dashboard nua tu khi co BO_MAU rieng)
          backgroundColor: MAU.nen.xanh,
          border: `1px solid ${MAU.nen.vien}`,
        }}
      >
        <RangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          format="DD/MM/YYYY"
          allowClear={false}
          presets={PRESETS_NGAY}
          size="middle"
          style={oRongCoGian(BO_LOC_RONG.rangePicker)}
          // placement + getPopupContainer (yeu cau truc tiep user, muc 2) - bo loc Dashboard nam SAT DINH
          // trang (ngay duoi header), antd RangePicker MAC DINH tu doi placement theo khong gian con lai nen
          // hay chon "topLeft" (mo LEN TREN) khi khong du cho duoi - luc do phan tieu de thang/nam cua lich bi
          // mep tren trinh duyet cat mat. Ep CUNG placement="bottomLeft" (luon mo XUONG) + getPopupContainer
          // gan popup vao chinh hang bo loc (thay vi body) de popup luon nam DUNG ngay duoi o nhap, khong bi
          // logic tu dong doi huong can thiep nua
          placement="bottomLeft"
          getPopupContainer={(trigger) => trigger.parentElement!}
        />
        <SelectTimKiemNhieu placeholder="Khu vuc" options={khuVucOptions} value={khuVuc} onChange={onKhuVucChange} style={oRongCoGian(BO_LOC_RONG.select)} />
        <SelectTimKiemNhieu placeholder="Tinh" options={tinhOptions} value={maTinh} onChange={onMaTinhChange} style={oRongCoGian(BO_LOC_RONG.select)} />
        <SelectTimKiemNhieu placeholder="Vendor" options={vendorOptions} value={vendor} onChange={onVendorChange} style={oRongCoGian(BO_LOC_RONG.select)} />
        {/* Dashboard KHONG co nut "Xoa loc" - man nay chua tung co tinh nang nay va KHONG nam trong pham vi
        yeu cau lan nay (chi chuan hoa BO CUC/kich thuoc), nen KHONG tu them 1 tinh nang moi (can callback
        reset state o Dashboard.tsx, ngoai pham vi "sua bo cuc cho thang hang" cua yeu cau nay). Van boc
        trong CumNut (du chi 1 nut) de dong bo cach can PHAI voi 3 man con lai */}
        <CumNut>
          <Tooltip title="Xuat toan bo dashboard dang xem (theo bo loc o tren) ra file Excel">
            <Button onClick={onXuatExcel} loading={dangXuatExcel} size="middle">
              Xuat Excel
            </Button>
          </Tooltip>
        </CumNut>
      </ThanhBoLoc>
    </>
  );
};

export default DashboardFilters;

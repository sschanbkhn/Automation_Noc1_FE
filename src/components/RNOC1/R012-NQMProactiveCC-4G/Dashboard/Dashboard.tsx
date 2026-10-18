// Tab "Dashboard" (THEM 18/10/2026, yeu cau truc tiep user) - tong quan toan module R012, goi GET
// /dashboard/tong-quan. Dat DAU TIEN trong R012Tabs (xem Designer/R012Tabs.tsx) - thay the cho "StatsStrip"
// cu da bo truoc day (xem comment LichSuCR.tsx: "Khi nao BE co API thong ke that thi dung widget hien SO
// LIEU that vao day").
//
// QUAN TRONG: BE KHONG co Pydantic schema cho endpoint nay (response la dict dung tay) - moi type dung o day
// (DashboardTongQuanResponse, types/index.ts) lay TRUC TIEP tu doc source code BE, KHONG co openapi.json de
// doi chieu. Neu BE doi hinh dang response sau nay ma khong bao, man hinh nay se la noi phat hien dau tien
// (field undefined/NaN tren man hinh).
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Card, Col, DatePicker, Row, Segmented, Select, Spin, Statistic, Tag } from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getDashboardTongQuan } from "../services/R012Service";
import { DashboardNhomRow, DashboardTongQuanResponse } from "../types";
import { R012_COLORS } from "../theme";
import { layThongBaoLoi } from "../helpers/layThongBaoLoi";
// mau Tag + nhan trang thai session DUNG CHUNG voi Lich su CR (crSessionStatus.ts) - "The so: so CR theo
// trang thai (mau tag dung chung)" theo dung yeu cau, KHONG tu dinh nghia mau rieng o day
import { CR_STATUS_COLOR, layNhanTrangThaiCr } from "../LichSuCR/crSessionStatus";
import DashboardGroupTable from "./DashboardGroupTable";
import { KHU_VUC_OPTIONS, formatSoDem, formatTyLe, nhanTuanNgan } from "./dashboardHelpers";

const { RangePicker } = DatePicker;

interface DashboardProps {
  // THEM 18/10/2026 - "bam -> mo session trong Lich su CR" (yeu cau truc tiep user) cho 2 danh sach trong
  // muc "Can xu ly" ben duoi. R012Tabs.tsx truyen xuong ham DOI active tab + dat YeuCauMoSession cho
  // SessionHistoryList.tsx (xem ham handleMoSessionTrongLichSuCR trong file do)
  onMoSessionTrongLichSuCR: (sessionId: number) => void;
}

const NHOM_KHU_VUC = "khu_vuc";
const NHOM_MA_TINH = "ma_tinh";
const NHOM_NETACT = "netact";

const NHOM_OPTIONS = [
  { label: "Khu vuc", value: NHOM_KHU_VUC },
  { label: "Tinh", value: NHOM_MA_TINH },
  { label: "NetAct", value: NHOM_NETACT },
];

// 2 khoa "dang_chay"/"khac" trong DashboardTrangThaiCount la BUCKET GOP cua dashboard (xem WHY day du o
// type do, types/index.ts), KHONG phai gia tri CrStatus that - layNhanTrangThaiCr() (dung cho trang thai
// THAT) se tra nguyen van 2 chuoi nay (khong co trong CR_STATUS_LABEL), hien "dang_chay"/"khac" tho ra man
// hinh. Map rieng o day (KHONG dua vao crSessionStatus.ts - file do danh cho trang thai CrStatus THAT su)
const NHAN_BUCKET_DASHBOARD: Record<string, string> = {
  dang_chay: "Dang chay",
  khac: "Khac",
};

const Dashboard: React.FC<DashboardProps> = ({ onMoSessionTrongLichSuCR }) => {
  // mac dinh 30 ngay GAN NHAT (yeu cau truc tiep user) - [today-29, today] = 30 ngay tinh ca 2 dau mut
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs().subtract(29, "day"), dayjs()]);
  const [khuVucFilter, setKhuVucFilter] = useState<string[]>([]);
  // ma_tinh/netact KHONG co danh sach gia tri co dinh nao BE cung cap san (khac khu_vuc la enum 3 gia tri) -
  // dung Select mode="tags" de nguoi dung tu go dung ma tinh/oss_instance_id can loc, KHONG bia 1 danh sach
  // "du doan" co the thieu/sai so voi du lieu that
  const [maTinhFilter, setMaTinhFilter] = useState<string[]>([]);
  const [netactFilter, setNetactFilter] = useState<string[]>([]);
  const [nhomDangXem, setNhomDangXem] = useState<string>(NHOM_KHU_VUC);

  const tuNgay = dateRange[0].format("YYYY-MM-DD");
  const denNgay = dateRange[1].format("YYYY-MM-DD");

  const { data, isLoading, isError, error } = useQuery<DashboardTongQuanResponse>({
    queryKey: ["r012", "dashboard-tong-quan", tuNgay, denNgay, khuVucFilter, maTinhFilter, netactFilter],
    queryFn: () =>
      getDashboardTongQuan({
        tu_ngay: tuNgay,
        den_ngay: denNgay,
        khu_vuc: khuVucFilter.length > 0 ? khuVucFilter : undefined,
        ma_tinh: maTinhFilter.length > 0 ? maTinhFilter : undefined,
        netact: netactFilter.length > 0 ? netactFilter : undefined,
      }),
  });

  const handleDateRangeChange = (values: [Dayjs | null, Dayjs | null] | null) => {
    if (values && values[0] && values[1]) {
      setDateRange([values[0], values[1]]);
    }
  };

  const nhomRows: DashboardNhomRow[] = useMemo(() => {
    if (!data) {
      return [];
    }
    if (nhomDangXem === NHOM_MA_TINH) {
      return data.theo_nhom.ma_tinh;
    }
    if (nhomDangXem === NHOM_NETACT) {
      return data.theo_nhom.netact;
    }
    return data.theo_nhom.khu_vuc;
  }, [data, nhomDangXem]);

  const nhanCotNhom = NHOM_OPTIONS.find((o) => o.value === nhomDangXem)?.label ?? "Nhom";

  // du lieu cho recharts - gan them nhan ngan ("dd/mm") tu "tuan" (ISO date) de truc X khong qua dai
  const xuHuongData = useMemo(
    () => (data?.xu_huong ?? []).map((d) => ({ ...d, nhanTuan: nhanTuanNgan(d.tuan) })),
    [data?.xu_huong]
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "12px",
          padding: "12px",
          marginBottom: "1rem",
          backgroundColor: R012_COLORS.tableRowAlt,
          border: `1px solid ${R012_COLORS.primaryPale}`,
          borderRadius: "8px",
        }}
      >
        <RangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          format="DD/MM/YYYY"
          allowClear={false}
        />
        <Select
          mode="multiple"
          placeholder="Khu vuc"
          style={{ minWidth: "160px" }}
          options={KHU_VUC_OPTIONS}
          value={khuVucFilter}
          onChange={setKhuVucFilter}
          allowClear
        />
        <Select
          mode="tags"
          placeholder="Ma tinh (go de them)"
          style={{ minWidth: "180px" }}
          value={maTinhFilter}
          onChange={setMaTinhFilter}
          allowClear
          open={false}
        />
        <Select
          mode="tags"
          placeholder="NetAct (go de them)"
          style={{ minWidth: "180px" }}
          value={netactFilter}
          onChange={setNetactFilter}
          allowClear
          open={false}
        />
      </div>

      {isLoading && <Spin tip="Dang tai du lieu dashboard..." />}

      {isError && (
        <Alert
          type="error"
          message="Khong tai duoc dashboard"
          description={layThongBaoLoi(error, "Loi khong xac dinh")}
          style={{ marginBottom: "1rem" }}
        />
      )}

      {data && (
        <>
          {/* === THE SO === */}
          <Row gutter={[16, 16]} style={{ marginBottom: "1rem" }}>
            <Col xs={24} md={12} lg={6}>
              <Card size="small" title="So CR theo trang thai" style={{ height: "100%" }}>
                <Statistic value={formatSoDem(data.tong.so_session)} />
                <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {(Object.keys(data.tong.theo_trang_thai) as Array<keyof typeof data.tong.theo_trang_thai>).map(
                    (key) => (
                      <Tag key={key} color={CR_STATUS_COLOR[key]?.list ?? "default"}>
                        {NHAN_BUCKET_DASHBOARD[key] ?? layNhanTrangThaiCr(key)}: {formatSoDem(data.tong.theo_trang_thai[key])}
                      </Tag>
                    )
                  )}
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Card size="small" title="% QoS dat" style={{ height: "100%" }}>
                <Statistic value={formatTyLe(data.hau_kiem.qos.dat.ty_le)} />
                <div style={{ color: "#595959", fontSize: "0.8rem", marginTop: "4px" }}>
                  {formatSoDem(data.hau_kiem.qos.dat.so)}/{formatSoDem(data.hau_kiem.qos.so_cell)} cell
                </div>
                <div style={{ marginTop: "8px" }}>
                  <Tag color="red">
                    Khong dat: {formatSoDem(data.hau_kiem.qos.khong_dat.so)} ({formatTyLe(data.hau_kiem.qos.khong_dat.ty_le)})
                  </Tag>
                  <div style={{ color: "#8c8c8c", fontSize: "0.75rem", marginTop: "4px" }}>
                    TB sau duoi muc: {formatSoDem(data.hau_kiem.qos.khong_dat.tb_sau_duoi_muc)} · Tut qua nguong:{" "}
                    {formatSoDem(data.hau_kiem.qos.khong_dat.lech_qua_nguong)}
                  </div>
                  <Tag color="default" style={{ marginTop: "4px" }}>
                    Thieu du lieu: {formatSoDem(data.hau_kiem.qos.thieu_du_lieu.so)} ({formatTyLe(data.hau_kiem.qos.thieu_du_lieu.ty_le)})
                  </Tag>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Card size="small" title="% QoE dat" style={{ height: "100%" }}>
                <Statistic value={formatTyLe(data.hau_kiem.qoe.dat.ty_le)} />
                <div style={{ color: "#595959", fontSize: "0.8rem", marginTop: "4px" }}>
                  {formatSoDem(data.hau_kiem.qoe.dat.so)}/{formatSoDem(data.hau_kiem.qoe.so_cell)} cell
                </div>
                <div style={{ marginTop: "8px" }}>
                  <Tag color="red">
                    Khong dat: {formatSoDem(data.hau_kiem.qoe.khong_dat.so)} ({formatTyLe(data.hau_kiem.qoe.khong_dat.ty_le)})
                  </Tag>
                  <div style={{ color: "#8c8c8c", fontSize: "0.75rem", marginTop: "4px" }}>
                    TB sau duoi muc: {formatSoDem(data.hau_kiem.qoe.khong_dat.tb_sau_duoi_muc)} · Tut qua nguong:{" "}
                    {formatSoDem(data.hau_kiem.qoe.khong_dat.lech_qua_nguong)}
                  </div>
                  <Tag color="default" style={{ marginTop: "4px" }}>
                    Thieu du lieu: {formatSoDem(data.hau_kiem.qoe.thieu_du_lieu.so)} ({formatTyLe(data.hau_kiem.qoe.thieu_du_lieu.ty_le)})
                  </Tag>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Card size="small" title="Phieu" style={{ height: "100%" }}>
                <Statistic value={formatSoDem(data.phieu.success)} />
                <div style={{ color: "#595959", fontSize: "0.8rem", marginTop: "4px" }}>phieu thanh cong</div>
                <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  <Tag color="blue">He thong: {formatSoDem(data.phieu.he_thong)}</Tag>
                  <Tag color="cyan">Hien truong: {formatSoDem(data.phieu.hien_truong)}</Tag>
                  <Tag color="gold">Cho xuat tay: {formatSoDem(data.phieu.cho_xuat_tay)}</Tag>
                  <Tag color="red">Loi: {formatSoDem(data.phieu.loi)}</Tag>
                </div>
              </Card>
            </Col>
          </Row>

          {/* === BANG THEO NHOM === */}
          <Card
            size="small"
            title="Theo nhom"
            style={{ marginBottom: "1rem" }}
            extra={<Segmented value={nhomDangXem} onChange={(v) => setNhomDangXem(v as string)} options={NHOM_OPTIONS} />}
          >
            <DashboardGroupTable rows={nhomRows} nhanCotNhom={nhanCotNhom} />
          </Card>

          {/* === BIEU DO XU HUONG THEO TUAN === */}
          <Card size="small" title="Xu huong theo tuan" style={{ marginBottom: "1rem" }}>
            {xuHuongData.length === 0 ? (
              <div style={{ color: "#8c8c8c" }}>Khong co du lieu trong khoang loc dang chon.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={xuHuongData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nhanTuan" />
                  <YAxis yAxisId="ty_le" unit="%" />
                  <YAxis yAxisId="so_luong" orientation="right" />
                  <RechartsTooltip />
                  <Legend />
                  <Line yAxisId="ty_le" type="monotone" dataKey="ty_le_dat_qos" name="% QoS dat" stroke={R012_COLORS.chartAfterCr} connectNulls />
                  <Line yAxisId="ty_le" type="monotone" dataKey="ty_le_dat_qoe" name="% QoE dat" stroke={R012_COLORS.chartBeforeCr} connectNulls />
                  <Line yAxisId="so_luong" type="monotone" dataKey="so_session" name="So CR" stroke={R012_COLORS.chartCrDay} />
                  <Line yAxisId="so_luong" type="monotone" dataKey="so_phieu" name="So phieu" stroke={R012_COLORS.statusSuccess} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* === CAN XU LY === */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card size="small" title={`Qua han xuat phieu (${formatSoDem(data.can_xu_ly.qua_han_xuat_phieu.so_luong)})`}>
                {data.can_xu_ly.qua_han_xuat_phieu.sessions.length === 0 ? (
                  <div style={{ color: "#8c8c8c" }}>Khong co session nao qua han xuat phieu.</div>
                ) : (
                  <div style={{ maxHeight: "260px", overflowY: "auto" }}>
                    {data.can_xu_ly.qua_han_xuat_phieu.sessions.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => onMoSessionTrongLichSuCR(s.id)}
                        style={{
                          padding: "6px 8px",
                          borderBottom: `1px solid ${R012_COLORS.tableBorder}`,
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "8px",
                        }}
                      >
                        <span>
                          {s.tram_id} - {s.tram_name ?? "-"}
                        </span>
                        <span style={{ color: "#8c8c8c" }}>{s.ngay_cr ? dayjs(s.ngay_cr).format("DD/MM/YYYY") : "-"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card size="small" title={`Khong chay (${formatSoDem(data.can_xu_ly.khong_chay.so_luong)})`}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
                  {Object.entries(data.can_xu_ly.khong_chay.theo_ma_loi).map(([maLoi, soLuong]) => (
                    <Tag key={maLoi} color="gold">
                      {maLoi}: {formatSoDem(soLuong)}
                    </Tag>
                  ))}
                </div>
                {data.can_xu_ly.khong_chay.sessions.length === 0 ? (
                  <div style={{ color: "#8c8c8c" }}>Khong co session nao Khong chay.</div>
                ) : (
                  <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                    {data.can_xu_ly.khong_chay.sessions.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => onMoSessionTrongLichSuCR(s.id)}
                        style={{
                          padding: "6px 8px",
                          borderBottom: `1px solid ${R012_COLORS.tableBorder}`,
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "8px",
                        }}
                      >
                        <span>
                          {s.tram_id} - {s.tram_name ?? "-"}
                        </span>
                        <span style={{ color: "#8c8c8c" }}>{s.ma_loi ?? "-"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          {/* THEM 18/10/2026 (yeu cau truc tiep user) - chu thich nho giai thich nguon so lieu hau kiem, dong
              bo voi dong ghi nho tren bang QoS/QoE (xem WHY day du o helpers/cuaSoNgay.ts::moTaNguonSoLieu) */}
          <div style={{ color: "#8c8c8c", fontSize: "0.8rem", marginTop: "0.75rem" }}>
            Hau kiem tinh tu so lieu da luu luc danh gia
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

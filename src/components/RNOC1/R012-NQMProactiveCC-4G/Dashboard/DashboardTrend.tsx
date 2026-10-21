// Khoi "Xu huong theo tuan" (LAM LAI 19/10/2026 LAN 2, yeu cau truc tiep user "SUA GIAO DIEN DASHBOARD R012
// THEO GOP Y" muc 3) - 1 the DUY NHAT, het chieu ngang, GOM CA "Ket qua hau kiem" lam lua chon Segmented thu 7
// (truoc la 1 the rieng canh ben, xem DashboardHauKiemStack.tsx). LUON goi chi_tiet_thoi_gian="tuan" - BO han
// lua chon "Theo ngay" (yeu cau truc tiep user: "LUON goi chi_tiet_thoi_gian=tuan; BO moi lua chon theo
// ngay"), nen component nay khong con nhan/phat prop chiTietThoiGian nua.
//
// NULL -> DUT NET (khong ve 0): recharts <Line> MAC DINH connectNulls=false - CHI CAN khong set
// connectNulls={true} va khong tu thay null bang 0 khi chuan bi du lieu la du dat yeu cau.
//
// "Tat ca": cot (So CR/So phieu/So cell khong dat) VE TRUOC duong trong JSX (yeu cau truc tiep user: "ve
// TRUOC duong") de duong de o TREN trong z-order cua recharts (phan tu khai bao SAU ve DE len tren).
//
// MAU (SUA 19/10/2026 LAN 3, yeu cau truc tiep user "Thay toan bo bang mau") - So CR->flow, So phieu->warning,
// So cell khong dat->critical (CA QoS lan QoE GOP VE 1 mau critical duy nhat - truoc day 2 mau rieng), %QoS
// dat->primary, %QoE dat->compute. Luoi (CartesianGrid) BO stroke tu dat rieng - GIU MAC DINH recharts (yeu
// cau truc tiep user: "Luoi, truc, chu truc: giu mac dinh ..., khong tu dat mau xam moi").
import React, { useMemo, useState } from "react";
import { Segmented } from "antd";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardHauKiem, DashboardXuHuongDiem } from "../types";
import { formatSoDem, nhanMocNgan, nhanTuanKhoang } from "./dashboardHelpers";
import { DB_BIEU_DO, DB_CHU, MAU } from "./dashboardConstants";
import DashboardHauKiemStack, { KetQuaHauKiem } from "./DashboardHauKiemStack";

interface DashboardTrendProps {
  xuHuong: DashboardXuHuongDiem[];
  hauKiem: DashboardHauKiem;
  onClickHauKiemSegment: (loai: "qos" | "qoe", ketQua: KetQuaHauKiem) => void;
}

type ChiSoXem = "tat_ca" | "ty_le_dat_qos" | "ty_le_dat_qoe" | "so_cr" | "so_phieu" | "so_cell_khong_dat" | "ket_qua_hau_kiem";

const CHI_SO_OPTIONS: Array<{ label: string; value: ChiSoXem }> = [
  { label: "Tat ca", value: "tat_ca" },
  { label: "QoS", value: "ty_le_dat_qos" },
  { label: "QoE", value: "ty_le_dat_qoe" },
  { label: "So CR", value: "so_cr" },
  { label: "So phieu", value: "so_phieu" },
  { label: "So cell khong dat", value: "so_cell_khong_dat" },
  { label: "Ket qua hau kiem", value: "ket_qua_hau_kiem" },
];

// Tooltip TUY CHINH - "Tuan dd/mm - dd/mm" + 1 cham mau truoc moi dong gia tri (yeu cau truc tiep user:
// "Tooltip tuy chinh: khung trang, 'Tuan dd/mm - dd/mm' + gia tri, cham mau tung dong")
//
// LOC TRUNG LAP THEO dataKey (SUA 19/10/2026 lan 4) - tab 1 chi so cot (So CR/So phieu) co THEM 1 duong phu
// "noi dinh cot" CUNG dataKey voi chinh cot do (xem Bar/Line overlay ben duoi) - neu khong loc, Tooltip se
// hien 2 dong GIONG HET nhau (1 tu Bar, 1 tu Line) cho cung 1 gia tri. Giu lai phan tu DAU TIEN gap duoc cho
// moi dataKey la du, vi gia tri luon giong nhau giua Bar va Line cua no.
const locTrungLapTheoKhoa = (payload: any[]): any[] => {
  const daThay = new Set<string>();
  return payload.filter((p) => {
    if (daThay.has(p.dataKey)) {
      return false;
    }
    daThay.add(p.dataKey);
    return true;
  });
};

const TooltipTuyChinh: React.FC<any> = ({ active, payload: payloadGoc }) => {
  if (!active || !payloadGoc || payloadGoc.length === 0) {
    return null;
  }
  const payload = locTrungLapTheoKhoa(payloadGoc);
  const moc: string | undefined = payload[0]?.payload?.moc;
  return (
    <div
      style={{
        backgroundColor: DB_BIEU_DO.tooltipNen,
        border: DB_BIEU_DO.tooltipVien,
        borderRadius: DB_BIEU_DO.tooltipBoGoc,
        boxShadow: DB_BIEU_DO.tooltipBong,
        padding: DB_BIEU_DO.tooltipPadding,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: "4px" }}>{moc ? nhanTuanKhoang(moc) : ""}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: p.color, flexShrink: 0 }} />
          <span>
            {p.name}: {p.value}
            {p.unit ?? ""}
          </span>
        </div>
      ))}
    </div>
  );
};

// LabelList so tren dinh cot - AN khi =0 (yeu cau truc tiep user: "LabelList so tren dinh cot, an khi = 0")
const nhanSoTrenCot = (value: number) => (value === 0 ? "" : formatSoDem(value));

const DashboardTrend: React.FC<DashboardTrendProps> = ({ xuHuong, hauKiem, onClickHauKiemSegment }) => {
  const [chiSoXem, setChiSoXem] = useState<ChiSoXem>("tat_ca");
  // chuoi dang bi AN qua bam Legend (yeu cau truc tiep user: "Legend bam de an/hien tung chuoi") - doc lap
  // voi chiSoXem (bo chon CHI SO nao tham gia bieu do, an/hien la lop dieu khien THEM phia tren)
  const [anChuoi, setAnChuoi] = useState<Set<string>>(new Set());

  // so_cell_khong_dat_tong: tong QoS+QoE - CHI dung de ve duong noi dinh cot xep chong o tab "So cell khong
  // dat" (yeu cau truc tiep user: "Tab 1 chi so co duong line noi dinh cot")
  const duLieu = useMemo(
    () => xuHuong.map((d) => ({ ...d, nhan: nhanMocNgan(d.moc), so_cell_khong_dat_tong: d.so_cell_khong_dat_qos + d.so_cell_khong_dat_qoe })),
    [xuHuong]
  );

  const hienTyLeQos = chiSoXem === "tat_ca" || chiSoXem === "ty_le_dat_qos";
  const hienTyLeQoe = chiSoXem === "tat_ca" || chiSoXem === "ty_le_dat_qoe";
  const hienSoCr = chiSoXem === "tat_ca" || chiSoXem === "so_cr";
  const hienSoPhieu = chiSoXem === "tat_ca" || chiSoXem === "so_phieu";
  // "So cell khong dat" CHI hien o dung tab cua no, KHONG con trong "Tat ca" nua (xac nhan truc tiep voi user:
  // "Tab 'Tat ca' da bo cot Khong dat QoS, Khong dat QoE")
  const hienSoCellKhongDat = chiSoXem === "so_cell_khong_dat";

  const coTrucTyLe = hienTyLeQos || hienTyLeQoe;
  const coTrucSoLuong = hienSoCr || hienSoPhieu || hienSoCellKhongDat;
  // "Tab 1 chi so": duong hien cham tron vien trang de tach khoi cot (r=4); "Tat ca": VAN hien cham (r=3, nho
  // hon) - KHONG an han nua, vi 1 tuan co du lieu nam giua 2 tuan trong se chi la 1 diem don le, neu an cham
  // thi diem do se "bien mat" hoan toan khoi bieu do (yeu cau truc tiep user, lan nay)
  const laTatCa = chiSoXem === "tat_ca";
  // duong noi dinh cot (yeu cau truc tiep user, muc b) - CHI o dung 1 trong 3 tab bieu do thuan cot (khong
  // hien trong "Tat ca" vi da co san 2 duong %, them duong nay se roi)
  const hienDuongNoiSoCr = chiSoXem === "so_cr";
  const hienDuongNoiSoPhieu = chiSoXem === "so_phieu";
  const hienDuongNoiSoCellKhongDat = chiSoXem === "so_cell_khong_dat";

  const toggleChuoi = (dataKey: string) => {
    setAnChuoi((truoc) => {
      const moi = new Set(truoc);
      if (moi.has(dataKey)) {
        moi.delete(dataKey);
      } else {
        moi.add(dataKey);
      }
      return moi;
    });
  };

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "1rem", alignItems: "center" }}>
        <Segmented value={chiSoXem} onChange={(v) => setChiSoXem(v as ChiSoXem)} options={CHI_SO_OPTIONS} />
      </div>

      {chiSoXem === "ket_qua_hau_kiem" ? (
        <DashboardHauKiemStack hauKiem={hauKiem} onClickSegment={onClickHauKiemSegment} />
      ) : duLieu.length === 0 ? (
        <div style={{ color: "#8c8c8c" }}>Khong co du lieu trong khoang loc dang chon.</div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={duLieu} margin={{ top: 8, bottom: 0 }} barGap={2}>
            <CartesianGrid strokeDasharray={DB_BIEU_DO.luoi} vertical={false} />
            <XAxis dataKey="nhan" />
            {coTrucTyLe && (
              <YAxis yAxisId="ty_le" orientation="left" domain={[0, 100]} unit="%" label={{ value: "Ty le dat (%)", angle: -90, position: "insideLeft" }} />
            )}
            {coTrucSoLuong && (
              <YAxis yAxisId="so_luong" orientation="right" label={{ value: "So luong", angle: 90, position: "insideRight" }} />
            )}
            {/* vung hover (cursor) cua Tooltip dung mau .nhat (yeu cau truc tiep user: "Mau .nhat: ... vung
            hover tooltip (cursor fill)") - dung chung 1 vai tro primary lam diem tham chieu vi cursor la 1
            vung bam duy nhat, khong gan rieng cho 1 chi so cu the nao trong bieu do */}
            <RechartsTooltip content={<TooltipTuyChinh />} cursor={{ fill: MAU.primary.nhat }} />
            {/* Legend cham tron nho, GIUA canh tren (yeu cau truc tiep user, muc d: "Legend dat tren cung
            giua, khong de len truc" - truoc day align="right" de len nhan truc phai "So luong") - chu chuyen
            xam khi dang AN */}
            <Legend
              verticalAlign="top"
              align="center"
              iconType="circle"
              iconSize={8}
              onClick={(e: any) => toggleChuoi(e.dataKey)}
              formatter={(value: string, entry: any) => (
                <span style={{ color: anChuoi.has(entry.dataKey) ? "#bfbfbf" : "#262626", cursor: "pointer", fontSize: "0.8rem" }}>{value}</span>
              )}
            />
            {/* cot VE TRUOC duong (yeu cau truc tiep user: "ve TRUOC duong") - fill = mau .dam cua vai tro,
            radius=[6,6,0,0], barSize toi da 28 (yeu cau truc tiep user muc 3). LabelList so tren dinh cot, an
            khi =0 (yeu cau truc tiep user, muc c) */}
            {hienSoCr && (
              <Bar yAxisId="so_luong" dataKey="so_cr" name="So CR" fill={MAU.flow.dam} radius={[6, 6, 0, 0]} barSize={24} hide={anChuoi.has("so_cr")}>
                <LabelList dataKey="so_cr" position="top" formatter={nhanSoTrenCot} fill={DB_CHU.mauTieuDe} fontSize={11} />
              </Bar>
            )}
            {hienSoPhieu && (
              // mau "phieu" (vai tro RIENG, SUA 19/10/2026 lan 5 - truoc dung chung "warning") - dong bo voi
              // the Phieu (DashboardCards.tsx) va DB_MAU_THEO_LOAI.phieu (dashboardConstants.ts)
              <Bar
                yAxisId="so_luong"
                dataKey="so_phieu"
                name="So phieu"
                fill={MAU.phieu.dam}
                radius={[6, 6, 0, 0]}
                barSize={24}
                hide={anChuoi.has("so_phieu")}
              >
                <LabelList dataKey="so_phieu" position="top" formatter={nhanSoTrenCot} fill={DB_CHU.mauTieuDe} fontSize={11} />
              </Bar>
            )}
            {hienSoCellKhongDat && (
              <>
                {/* SUA 19/10/2026 lan 4 (yeu cau truc tiep user) - QoS/QoE GIO 2 mau PHAN BIET (truoc deu
                critical nen khong phan biet duoc): QoS dung lai mau "primary" (dong bo voi %QoS dat o cac tab
                khac), QoE dung "compute" (dong bo %QoE dat). Mau "critical" danh rieng cho DUONG TONG ben
                duoi - tong la tin hieu "can luu y" chinh, 2 cot la bo phan chia theo QoS/QoE.
                QoS la cot KHAI BAO TRUOC -> nam DUOI trong stack -> radius=0 (vuong, khong bo goc) de khop
                thang voi canh tren cua no la day cua cot QoE; QoE KHAI BAO SAU -> nam TREN -> radius bo goc
                dinh cot (yeu cau truc tiep user: "Bo goc chi doan tren cung ... doan duoi radius 0 -> het
                'that eo' giua 2 doan" - truoc day CA 2 doan deu bo goc dinh, tao 1 khe hinh thoi gia tao o
                ranh gioi giua 2 doan xep chong, nhin giong bi "that lai").
                LABELLIST: CHI 1, gan vao Bar TREN CUNG (QoE) nhung DOC GIA TRI TU dataKey KHAC
                (so_cell_khong_dat_tong, da tinh san trong duLieu) - SUA dung loi da bao cao: truoc day MOI
                Bar co LabelList rieng doc dataKey cua CHINH no, position="top" dat o DINH cua TUNG DOAN rieng
                (khong phai dinh CA cot) nen 2 so chong len nhau kho doc VA so o doan QoE (vd 63) bi hieu lam
                la tong ca cot (vd ~86) du no chi la 1 phan. */}
                <Bar
                  yAxisId="so_luong"
                  dataKey="so_cell_khong_dat_qos"
                  name="Khong dat QoS"
                  stackId="khong_dat"
                  fill={MAU.primary.dam}
                  radius={0}
                  barSize={24}
                  hide={anChuoi.has("so_cell_khong_dat_qos")}
                />
                <Bar
                  yAxisId="so_luong"
                  dataKey="so_cell_khong_dat_qoe"
                  name="Khong dat QoE"
                  stackId="khong_dat"
                  fill={MAU.compute.dam}
                  radius={[6, 6, 0, 0]}
                  barSize={24}
                  hide={anChuoi.has("so_cell_khong_dat_qoe")}
                >
                  <LabelList dataKey="so_cell_khong_dat_tong" position="top" formatter={nhanSoTrenCot} fill={DB_CHU.mauTieuDe} fontSize={11} />
                </Bar>
              </>
            )}
            {/* duong NOI DINH COT cho dung 1 tab bieu do thuan cot (yeu cau truc tiep user, muc b) - CUNG mau
            .dam voi cot tuong ung, an khoi Legend (legendType="none") vi da co san 1 muc cho chinh cot do */}
            {hienDuongNoiSoCr && (
              <Line
                yAxisId="so_luong"
                type="monotone"
                dataKey="so_cr"
                name="So CR"
                legendType="none"
                stroke={MAU.flow.dam}
                strokeWidth={2}
                dot={{ r: 4, stroke: "#ffffff", strokeWidth: 2, fill: MAU.flow.dam }}
                activeDot={{ r: 5 }}
                hide={anChuoi.has("so_cr")}
              />
            )}
            {hienDuongNoiSoPhieu && (
              <Line
                yAxisId="so_luong"
                type="monotone"
                dataKey="so_phieu"
                name="So phieu"
                legendType="none"
                stroke={MAU.phieu.dam}
                strokeWidth={2}
                dot={{ r: 4, stroke: "#ffffff", strokeWidth: 2, fill: MAU.phieu.dam }}
                activeDot={{ r: 5 }}
                hide={anChuoi.has("so_phieu")}
              />
            )}
            {hienDuongNoiSoCellKhongDat && (
              <Line
                yAxisId="so_luong"
                // type="linear" (KHONG monotone - yeu cau truc tiep user: "monotone lam cong vot", duong noi
                // thang giua cac diem khop THAT voi dinh cot hon, khong bi noi "vong" ra ngoai dinh cot that)
                type="linear"
                dataKey="so_cell_khong_dat_tong"
                // nhan "Tong" (KHONG phai "So cell khong dat") - yeu cau truc tiep user: "Tooltip: Khong dat
                // QoS x, Khong dat QoE y, Tong z"
                name="Tong"
                legendType="none"
                stroke={MAU.critical.dam}
                strokeWidth={2}
                dot={{ r: 4, stroke: "#ffffff", strokeWidth: 2, fill: MAU.critical.dam }}
                activeDot={{ r: 5 }}
              />
            )}
            {/* duong ve SAU cot - net 2.5, CUNG mau .dam voi cot tuong ung. Tab "Tat ca": type="linear", cham
            r=3 (NHO hon, KHONG an nua - yeu cau truc tiep user lan nay: "vi tuan co du lieu nam giua 2 tuan
            trong se chi la 1 diem -> khong co dot thi bien mat"). Tab 1 chi so (QoS/QoE rieng le):
            type="monotone", cham r=4 - ca 2 truong hop deu vien trang (stroke #FFFFFF) de tach khoi cot - yeu
            cau truc tiep user: "khong dung mau dam hon vi khong co trong bang mau" (#FFFFFF la mau trung
            tinh, khong phai 1 trong 12 mau nghiep vu nen duoc phep dung cho vien cham) */}
            {hienTyLeQos && (
              <Line
                yAxisId="ty_le"
                type={laTatCa ? "linear" : "monotone"}
                dataKey="ty_le_dat_qos"
                name="% QoS dat"
                stroke={MAU.primary.dam}
                strokeWidth={2.5}
                dot={{ r: laTatCa ? 3 : 4, stroke: "#ffffff", strokeWidth: 2, fill: MAU.primary.dam }}
                activeDot={{ r: 5 }}
                hide={anChuoi.has("ty_le_dat_qos")}
              />
            )}
            {hienTyLeQoe && (
              <Line
                yAxisId="ty_le"
                type={laTatCa ? "linear" : "monotone"}
                dataKey="ty_le_dat_qoe"
                name="% QoE dat"
                stroke={MAU.compute.dam}
                strokeWidth={2.5}
                dot={{ r: laTatCa ? 3 : 4, stroke: "#ffffff", strokeWidth: 2, fill: MAU.compute.dam }}
                activeDot={{ r: 5 }}
                hide={anChuoi.has("ty_le_dat_qoe")}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DashboardTrend;

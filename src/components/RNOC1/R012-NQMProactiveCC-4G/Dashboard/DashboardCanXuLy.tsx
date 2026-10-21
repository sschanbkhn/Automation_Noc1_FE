// Khoi "Can xu ly" - noi dung GIU NHU CU (yeu cau truc tiep user, muc 6 cua task truoc: "Can xu ly giu nhu
// cu"), CHI doi vo boc sang "kieu the trang + vien trai" (THEM 19/10/2026, yeu cau truc tiep user muc 4:
// "ap cung kieu card trang + vien trai cho dong bo") - dung KhungThe thay Card cua antd. Mau vien trai = DO
// (nguyHiem): day la 2 danh sach NOC can XU LY NGAY, khac voi cac khoi thong tin trung tinh khac.
import React from "react";
import { Col, Row, Tag } from "antd";
import dayjs from "dayjs";
import { DashboardCanXuLy as DashboardCanXuLyData } from "../types";
import { R012_COLORS } from "../theme";
import { formatSoDem } from "./dashboardHelpers";
import { MAU } from "./dashboardConstants";
import KhungThe from "./KhungThe";

interface DashboardCanXuLyProps {
  data: DashboardCanXuLyData;
  onMoSessionTrongLichSuCR: (sessionId: number) => void;
}

const DashboardCanXuLy: React.FC<DashboardCanXuLyProps> = ({ data, onMoSessionTrongLichSuCR }) => (
  <Row gutter={[16, 16]}>
    <Col xs={24} md={12}>
      <KhungThe title={`Qua han xuat phieu (${formatSoDem(data.qua_han_xuat_phieu.so_luong)})`} mauVienTrai={MAU.critical.dam} style={{ height: "100%" }}>
        {data.qua_han_xuat_phieu.sessions.length === 0 ? (
          <div style={{ color: "#8c8c8c" }}>Khong co session nao qua han xuat phieu.</div>
        ) : (
          <div style={{ maxHeight: "260px", overflowY: "auto" }}>
            {data.qua_han_xuat_phieu.sessions.map((s) => (
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
      </KhungThe>
    </Col>
    <Col xs={24} md={12}>
      <KhungThe title={`Khong chay (${formatSoDem(data.khong_chay.so_luong)})`} mauVienTrai={MAU.critical.dam} style={{ height: "100%" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
          {/* Tag mau nen .nhat + chu .dam vai tro "warning" (cung vai tro voi trang thai KHONG_CHAY - yeu cau
          truc tiep user: "nen Tag trong bang/modal" dung .nhat lam nen) - thay the Tag preset "gold" cua antd */}
          {Object.entries(data.khong_chay.theo_ma_loi).map(([maLoi, soLuong]) => (
            <Tag key={maLoi} style={{ backgroundColor: MAU.warning.nhat, color: MAU.warning.dam, border: "none" }}>
              {maLoi}: {formatSoDem(soLuong)}
            </Tag>
          ))}
        </div>
        {data.khong_chay.sessions.length === 0 ? (
          <div style={{ color: "#8c8c8c" }}>Khong co session nao Khong chay.</div>
        ) : (
          <div style={{ maxHeight: "220px", overflowY: "auto" }}>
            {data.khong_chay.sessions.map((s) => (
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
      </KhungThe>
    </Col>
  </Row>
);

export default DashboardCanXuLy;

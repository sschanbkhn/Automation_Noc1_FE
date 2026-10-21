// 4 the so dau tab Dashboard (LAM LAI 19/10/2026 LAN 5, yeu cau truc tiep user "them bo mau vnpt theo anh
// mau" muc 2) - THEO DUNG ANH MAU moi: nen gradient (.nhat -> trang), o icon 48px nen gradient (.dam -> .sang
// neu co) + icon trang, tieu de dat CANH o icon (khac ban truoc: tieu de nam TREN so lon, icon tach rieng goc
// phai), nut tron goc phai tren mo modal (THEM moi), so lon 44px mau .dam2/.dam, hinh trang tri mo o goc the
// (THEM moi), dong chi tiet dang "cham tron + nhan + so mau vai tro" MOI DONG RIENG cho CR/QoS/QoE (khac ban
// truoc: noi chung 1 dong bang " · ") - rieng The Phieu GIU nguyen kieu noi " · " (yeu cau truc tiep user:
// "dong 'He thong 8 · Hien truong 137'..."), chi THEM icon dau dong.
import React, { useState } from "react";
import { Col, Progress, Row, Tooltip } from "antd";
import { ApiOutlined, BarChartOutlined, FileDoneOutlined, FileTextOutlined, RightOutlined, RiseOutlined, SmileOutlined, ToolOutlined, WifiOutlined } from "@ant-design/icons";
import { DashboardChiTietLoai, DashboardChiTietParams, DashboardTongQuanResponse } from "../types";
import { layNhanTrangThaiCr } from "../LichSuCR/crSessionStatus";
import { NHAN_TRANG_THAI_DASHBOARD, formatSoDem, formatTyLe } from "./dashboardHelpers";
import { DB_CARD, DB_CHU, DB_MAU_THEO_LOAI, DB_MAU_THEO_LOAI_NHAT, DB_MAU_TRANG_THAI_CR, MAU } from "./dashboardConstants";

type LocConChiTiet = Pick<DashboardChiTietParams, "trang_thai" | "ket_qua" | "ly_do" | "phuong_an">;

interface DashboardCardsProps {
  data: DashboardTongQuanResponse;
  onMoModal: (loai: DashboardChiTietLoai, locCon?: Partial<LocConChiTiet>) => void;
}

// 3 trang_thai THAT hop thanh "cho xuat tay" (BE dung LIKE 'KHONG_XUAT_%', xem WHY day du da xac nhan truoc
// day qua api/schemas/phieu_schemas.py::PhieuListItem.trang_thai) - KHONG co 1 gia tri DUY NHAT dai dien, nen
// khi bam phai gui CA 3 de xap xi dung dieu kien LIKE cua BE
const TRANG_THAI_CHO_XUAT_TAY = ["KHONG_XUAT_VUOT_GIOI_HAN", "KHONG_XUAT_HET_LUOT_THU", "KHONG_XUAT_THIEU_DU_LIEU"];

// vai tro mau cua 1 "the" - dam2/sang la TUY CHON vi CHI co o 1 vai BO_MAU (vd "flow" moi co dam2, "flow"/
// "compute" moi co sang) - cac bo mau CU da duoc backfill dam2=dam/sang=dam (xem dashboardConstants.ts) nen
// truong nay LUON ton tai o MOI bo mau dang dung, optional (?) o day chi la kieu khai bao an toan chung
interface VaiTroMau {
  dam: string;
  dam2?: string;
  sang?: string;
  nhat: string;
}

// === THE CO BAN (vo boc chung) - LAM LAI 19/10/2026 lan 5 theo anh mau: nen gradient .nhat->trang, vien 1px
// MAU.nen.track, bo goc RIENG DB_CARD.boGocThe (16px, khac KhungThe van dung DB_CARD.boGoc 12px). Nhan
// "vaiTro" nguyen CA OBJECT {dam,dam2?,sang?,nhat} thay vi 2 string rieng (mauNhan/mauNhanNhat ban truoc) vi
// can doc ca dam2/sang de tinh gradient/mau so lon/mau tieu de - gop thanh 1 prop cho gon.
interface TheCoBanProps {
  tieuDe: string;
  vaiTro: VaiTroMau;
  icon: React.ReactNode; // icon chinh trong o 48px
  iconTrangTri: React.ReactNode; // hinh mo goc the (yeu cau truc tiep user: "Hinh trang tri mo goc phai")
  giaTriLon: React.ReactNode;
  dongPhu?: React.ReactNode;
  onClick?: () => void;
  children?: React.ReactNode;
}

const TheCoBan: React.FC<TheCoBanProps> = ({ tieuDe, vaiTro, icon, iconTrangTri, giaTriLon, dongPhu, onClick, children }) => {
  const [dangHover, setDangHover] = useState(false);
  const mauSang = vaiTro.sang ?? vaiTro.dam; // khong co sang rieng -> coi nhu 1 mau (gradient "phang")
  const mauTieuDe = vaiTro.dam2 ?? DB_CHU.mauTieuDeThe; // yeu cau truc tiep user: "chu dam mau dam2/#1E293B"
  const mauSoLon = vaiTro.dam2 ?? vaiTro.dam; // yeu cau truc tiep user: "mau .dam2 (CR) / .dam (cac the khac)"
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden", // CAT hinh trang tri tran ra ngoai bo goc the
        background: `linear-gradient(135deg, ${vaiTro.nhat} 0%, #FFFFFF 70%)`,
        border: `1px solid ${MAU.nen.track}`,
        borderLeft: `${DB_CARD.doRongVienTrai} solid ${vaiTro.dam}`,
        borderRadius: DB_CARD.boGocThe,
        boxShadow: dangHover ? DB_CARD.boBongHover : DB_CARD.boBong,
        padding: DB_CARD.padding,
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        transform: dangHover ? DB_CARD.hieuUngHover : "translateY(0)",
        transition: DB_CARD.thoiGianChuyen,
      }}
      onMouseEnter={() => setDangHover(true)}
      onMouseLeave={() => setDangHover(false)}
      onClick={onClick}
    >
      {/* hinh trang tri mo goc phai - opacity 0.12, pointer-events none (khong chan bam), nam DUOI noi dung
      (zIndex 0) */}
      <div
        style={{
          position: "absolute",
          right: "-8px",
          bottom: "-14px",
          fontSize: "72px",
          lineHeight: 1,
          color: vaiTro.dam,
          opacity: 0.12,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {iconTrangTri}
      </div>

      {/* nut tron goc phai tren - mo modal chi tiet (yeu cau truc tiep user: "giu hanh vi bam ca the" - CA
      the van bam duoc nhu truoc, nut nay la THEM, khong THAY the hanh vi do) */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          border: `1px solid ${MAU.nen.track}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: onClick ? "pointer" : "default",
          zIndex: 2,
        }}
        onClick={(e) => {
          if (onClick) {
            e.stopPropagation();
            onClick();
          }
        }}
      >
        <RightOutlined style={{ color: vaiTro.dam, fontSize: "0.8rem" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* hang 1: o icon + tieu de CANH NHAU (yeu cau truc tiep user: "Tieu de the dat CANH o icon, cung
        hang") - paddingRight de danh cho nut tron goc phai tren, tranh chu tieu de de qua dai se de len nut */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingRight: "40px" }}>
          <div
            style={{
              width: DB_CARD.kichThuocIcon,
              height: DB_CARD.kichThuocIcon,
              borderRadius: DB_CARD.boGocIcon,
              background: `linear-gradient(135deg, ${vaiTro.dam} 0%, ${mauSang} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "1.3rem",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <div style={{ color: mauTieuDe, fontSize: DB_CHU.coChuTieuDe, fontWeight: 700 }}>{tieuDe}</div>
        </div>

        <div style={{ color: mauSoLon, fontSize: DB_CHU.coChuSoLon, fontWeight: DB_CHU.doDamSoLon, lineHeight: 1.2, margin: "10px 0 4px" }}>
          {giaTriLon}
        </div>
        {dongPhu && <div style={{ color: DB_CHU.mauDongPhu, fontSize: DB_CHU.coChuDongPhu }}>{dongPhu}</div>}
        {children && <div style={{ marginTop: "10px" }}>{children}</div>}
      </div>
    </div>
  );
};

// === THANH CHIA DOAN (the "Tong CR") - 1 thanh ngang chia theo trang_thai, bam 1 doan -> loc dung trang
// thai do. Mau segment lay THANG tu DB_MAU_TRANG_THAI_CR (anh xa 6 khoa trang_thai -> vai tro BO_MAU, da xac
// nhan truc tiep voi user - xem dashboardConstants.ts) ===
interface DoanTrangThai {
  khoa: string;
  soLuong: number;
  nhan: string;
  onClick?: () => void;
}

const ThanhChiaDoan: React.FC<{ doan: DoanTrangThai[]; tong: number }> = ({ doan, tong }) => {
  if (tong <= 0) {
    return <div style={{ height: "8px", borderRadius: "4px", backgroundColor: "#f0f0f0" }} />;
  }
  return (
    <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden", backgroundColor: "#f0f0f0" }}>
      {doan
        .filter((d) => d.soLuong > 0)
        .map((d) => (
          <Tooltip key={d.khoa} title={`${d.nhan}: ${formatSoDem(d.soLuong)}`}>
            <div
              style={{
                width: `${(d.soLuong / tong) * 100}%`,
                backgroundColor: DB_MAU_TRANG_THAI_CR[d.khoa] ?? MAU.primary.dam,
                cursor: d.onClick ? "pointer" : "default",
              }}
              onClick={(e) => {
                if (d.onClick) {
                  e.stopPropagation();
                  d.onClick();
                }
              }}
            />
          </Tooltip>
        ))}
    </div>
  );
};

// === DONG CHI TIET MOI (THEM 19/10/2026 lan 5, yeu cau truc tiep user muc 2: "cham tron 10px mau vai tro +
// chu xam dam, SO mau vai tro... Moi muc 1 dong, khong noi bang ' · '") - dung cho the Tong CR/QoS/QoE. THAY
// cho DongChiSo (ban truoc noi " · " tren 1 dong) o 3 the nay - DongChiSo CU van giu cho rieng the Phieu (yeu
// cau truc tiep user: "dong 'He thong 8 · Hien truong 137'..." - Phieu VAN noi " · ", khong doi) ===
interface ChiSoDong {
  nhan: string;
  soLuong: number;
  mauVaiTro: string;
  onClick?: () => void;
}

const DongChiTietMoi: React.FC<{ items: ChiSoDong[] }> = ({ items }) => (
  <div>
    {items.map((it) => (
      <div
        key={it.nhan}
        onClick={(e) => {
          if (it.onClick) {
            e.stopPropagation();
            it.onClick();
          }
        }}
        style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", padding: "2px 0", cursor: it.onClick ? "pointer" : "default" }}
      >
        <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: it.mauVaiTro, flexShrink: 0 }} />
        <span style={{ color: DB_CHU.mauTieuDe }}>{it.nhan}</span>
        <span style={{ color: it.mauVaiTro, fontWeight: 600 }}>{formatSoDem(it.soLuong)}</span>
      </div>
    ))}
  </div>
);

// === DONG CHI SO NHO KIEU CU (noi " · " tren 1 dong) - CHI con dung cho The Phieu (yeu cau truc tiep user
// muc 2 giu nguyen kieu nay cho Phieu) ===
interface ChiSoNho {
  nhan: string;
  soLuong: number;
  mau?: string; // mac dinh xam chu thich (DB_CHU.mauDongPhu) neu khong truyen - CHI dung cho chi so KHONG gan
  // vai tro nghiep vu nao (vd "He thong"/"Hien truong")
  onClick?: () => void;
}

const DongChiSo: React.FC<{ items: ChiSoNho[] }> = ({ items }) => (
  <div style={{ fontSize: "0.8rem" }}>
    {items.map((it, idx) => (
      <React.Fragment key={it.nhan}>
        {idx > 0 && <span style={{ color: "#d9d9d9" }}> · </span>}
        <span
          style={{ color: it.mau ?? DB_CHU.mauDongPhu, fontWeight: it.mau ? 600 : 400, cursor: it.onClick ? "pointer" : "default" }}
          onClick={(e) => {
            if (it.onClick) {
              e.stopPropagation();
              it.onClick();
            }
          }}
        >
          {it.nhan} {formatSoDem(it.soLuong)}
        </span>
      </React.Fragment>
    ))}
  </div>
);

// thu tu hien thi trang_thai trong thanh chia doan/chi so nho (yeu cau truc tiep user, xac nhan truc tiep qua
// AskUserQuestion trong phien truoc) - KHONG dung thu tu khoa JSON tho tu BE (khong dam bao on dinh)
const THU_TU_TRANG_THAI = ["DONE", "PARTIAL_SUCCESS", "KHONG_CHAY", "FAILED", "dang_chay", "khac"];

const DashboardCards: React.FC<DashboardCardsProps> = ({ data, onMoModal }) => {
  const trangThaiKeys = (Object.keys(data.tong.theo_trang_thai) as Array<keyof typeof data.tong.theo_trang_thai>).sort(
    (a, b) => THU_TU_TRANG_THAI.indexOf(a) - THU_TU_TRANG_THAI.indexOf(b)
  );

  // 4 cot o desktop (lg=6, 24/6=4), 2 cot (sm), 1 cot (xs)
  const colProps = { xs: 24, sm: 12, lg: 6 };

  const doanTrangThai: DoanTrangThai[] = trangThaiKeys.map((key) => ({
    khoa: key,
    soLuong: data.tong.theo_trang_thai[key],
    nhan: NHAN_TRANG_THAI_DASHBOARD[key] ?? layNhanTrangThaiCr(key),
    onClick: key === "dang_chay" || key === "khac" ? () => onMoModal("cr") : () => onMoModal("cr", { trang_thai: [key] }),
  }));

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: "1rem" }}>
      {/* 1. Tong CR */}
      <Col {...colProps}>
        <TheCoBan
          tieuDe="Tong CR"
          vaiTro={MAU.flow}
          icon={<BarChartOutlined />}
          iconTrangTri={<BarChartOutlined />}
          giaTriLon={formatSoDem(data.tong.so_session)}
          dongPhu={`${formatSoDem(data.tong.so_tram)} tram · ${formatSoDem(data.tong.so_cell_cr)} cell chay CR`}
          onClick={() => onMoModal("cr")}
        >
          <ThanhChiaDoan doan={doanTrangThai} tong={data.tong.so_session} />
          {/* duoi thanh CHI liet ke trang thai > 0 (yeu cau truc tiep user), MOI trang thai 1 dong rieng (yeu
          cau truc tiep user lan 5) */}
          <div style={{ marginTop: "8px" }}>
            <DongChiTietMoi
              items={doanTrangThai
                .filter((d) => d.soLuong > 0)
                .map((d) => ({
                  nhan: d.nhan,
                  soLuong: d.soLuong,
                  mauVaiTro: DB_MAU_TRANG_THAI_CR[d.khoa] ?? MAU.primary.dam,
                  onClick: d.onClick,
                }))}
            />
          </div>
        </TheCoBan>
      </Col>

      {/* 2. % QoS dat */}
      <Col {...colProps}>
        <TheCoBan
          tieuDe="% QoS dat"
          vaiTro={MAU.primary}
          icon={<ApiOutlined />}
          iconTrangTri={<WifiOutlined />}
          giaTriLon={formatTyLe(data.hau_kiem.qos.dat.ty_le)}
          dongPhu={`${formatSoDem(data.hau_kiem.qos.dat.so)}/${formatSoDem(data.hau_kiem.qos.so_cell)} cell dat`}
          onClick={() => onMoModal("qos")}
        >
          {/* Progress LUON dung mau .dam cua vai tro (khong fallback xam khi ty_le null - percent=0 gan nhu
          khong hien thanh nen mau o % nay khong anh huong). trailColor = MAU.nen.track (yeu cau truc tiep
          user lan 5: "Progress: track nen.track" - THAY cho rgba pha alpha tu .dam cua lan truoc) */}
          <Progress percent={data.hau_kiem.qos.dat.ty_le ?? 0} strokeColor={MAU.primary.dam} trailColor={MAU.nen.track} showInfo={false} size="small" />
          <div style={{ marginTop: "6px" }}>
            <DongChiTietMoi
              items={[
                {
                  nhan: "Khong dat",
                  soLuong: data.hau_kiem.qos.khong_dat.so,
                  mauVaiTro: MAU.critical.dam,
                  onClick: () => onMoModal("qos", { ket_qua: ["KHONG_DAT"] }),
                },
                {
                  nhan: "Thieu du lieu",
                  soLuong: data.hau_kiem.qos.thieu_du_lieu.so,
                  mauVaiTro: MAU.warning.dam,
                  onClick: () => onMoModal("qos", { ket_qua: ["INSUFFICIENT_DATA"] }),
                },
              ]}
            />
          </div>
        </TheCoBan>
      </Col>

      {/* 3. % QoE dat */}
      <Col {...colProps}>
        <TheCoBan
          tieuDe="% QoE dat"
          vaiTro={MAU.compute}
          icon={<SmileOutlined />}
          iconTrangTri={<RiseOutlined />}
          giaTriLon={formatTyLe(data.hau_kiem.qoe.dat.ty_le)}
          dongPhu={`${formatSoDem(data.hau_kiem.qoe.dat.so)}/${formatSoDem(data.hau_kiem.qoe.so_cell)} cell dat`}
          onClick={() => onMoModal("qoe")}
        >
          {/* QoE fill GRADIENT .dam->.sang (yeu cau truc tiep user lan 5: "QoE fill gradient .dam -> .sang") -
          antd Progress strokeColor nhan {from,to} de ve gradient, KHAC QoS (primary khong co "sang" nen giu
          phang 1 mau) */}
          <Progress
            percent={data.hau_kiem.qoe.dat.ty_le ?? 0}
            strokeColor={{ from: MAU.compute.dam, to: MAU.compute.sang }}
            trailColor={MAU.nen.track}
            showInfo={false}
            size="small"
          />
          <div style={{ marginTop: "6px" }}>
            <DongChiTietMoi
              items={[
                {
                  nhan: "Khong dat",
                  soLuong: data.hau_kiem.qoe.khong_dat.so,
                  mauVaiTro: MAU.critical.dam,
                  onClick: () => onMoModal("qoe", { ket_qua: ["KHONG_DAT"] }),
                },
                {
                  nhan: "Thieu du lieu",
                  soLuong: data.hau_kiem.qoe.thieu_du_lieu.so,
                  mauVaiTro: MAU.warning.dam,
                  onClick: () => onMoModal("qoe", { ket_qua: ["INSUFFICIENT_DATA"] }),
                },
              ]}
            />
          </div>
        </TheCoBan>
      </Col>

      {/* 4. Phieu - He thong/Hien truong la 2 TAP CON cua success (xem WHY o DashboardPhieu, types/index.ts).
      GIU kieu DongChiSo noi " · " (yeu cau truc tiep user), CHI THEM 1 icon dau moi dong */}
      <Col {...colProps}>
        <TheCoBan
          tieuDe="Phieu"
          vaiTro={MAU.phieu}
          icon={<FileDoneOutlined />}
          iconTrangTri={<FileTextOutlined />}
          giaTriLon={formatSoDem(data.phieu.success)}
          dongPhu="phieu thanh cong"
          onClick={() => onMoModal("phieu")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FileTextOutlined style={{ color: DB_CHU.mauDongPhu, fontSize: "0.8rem" }} />
            <DongChiSo
              items={[
                { nhan: "He thong", soLuong: data.phieu.he_thong, onClick: () => onMoModal("phieu", { phuong_an: ["1"] }) },
                { nhan: "Hien truong", soLuong: data.phieu.hien_truong, onClick: () => onMoModal("phieu", { phuong_an: ["2"] }) },
              ]}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
            <ToolOutlined style={{ color: DB_CHU.mauDongPhu, fontSize: "0.8rem" }} />
            <DongChiSo
              items={[
                {
                  nhan: "cho xuat tay",
                  soLuong: data.phieu.cho_xuat_tay,
                  mau: MAU.warning.dam,
                  onClick: () => onMoModal("phieu", { trang_thai: TRANG_THAI_CHO_XUAT_TAY }),
                },
                // "loi" CHI hien khi > 0 (yeu cau truc tiep user) - loc het mang neu =0, KHONG chi doi mau
                ...(data.phieu.loi > 0
                  ? [
                      {
                        nhan: "loi",
                        soLuong: data.phieu.loi,
                        mau: MAU.critical.dam,
                        onClick: () => onMoModal("phieu", { trang_thai: ["FAILED"] }),
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        </TheCoBan>
      </Col>
    </Row>
  );
};

export default DashboardCards;

import React, { useMemo, useState } from "react";
import { Row, Col, Collapse, Alert, Tag } from "antd";
import type { CollapseProps } from "antd";
// khu vuc tim kiem va chon tram, xac nhan trigger CR - tuong ung Zone A trong UI_DESIGN.md
// doi ten tu ZoneA sang TimTram de ten thu muc phan anh dung chuc nang thay vi ten generic theo vi tri layout
import StationSearchGrid from "./TimTram/StationSearchGrid";
import ConfirmTriggerModal from "./TimTram/ConfirmTriggerModal";
// khu vuc ban do mang va huong song - tuong ung Zone B trong UI_DESIGN.md
// doi ten tu ZoneB sang BanDoMang cho dung chuc nang hien thi
// SectorBeam KHONG import truc tiep o day nua - da nam ben trong NetworkMap (ve chung 1 MapContainer)
import NetworkMap from "./BanDoMang/NetworkMap";
// bang tram + bang cell bi anh huong (Buoc 2 tinh nang preview) - hien NGAY DUOI map trong cung Zone B,
// dung chung previewData da co san, KHONG tu goi API rieng
import AffectedStationsTable from "./XemTruocAnhHuong/AffectedStationsTable";
import AffectedCellsTable from "./XemTruocAnhHuong/AffectedCellsTable";
// bang cell CHAY CR (MOI, tach rieng khoi bang cell bi anh huong o tren - Phan 1, schema BE moi 22072026)
import CrCellsTable from "./XemTruocAnhHuong/CrCellsTable";
// bang cell bi LOAI khoi pham vi quan ly (27092026, BE commit d84215b/ed59418) - xem WHY day du trong
// chinh file do
import CellNgoaiPhamViTable from "./XemTruocAnhHuong/CellNgoaiPhamViTable";
import CellQosHistoryChart from "./XemTruocAnhHuong/CellQosHistoryChart";
// bang "Quan he day du" (BUOC 4b, 08/10/2026, yeu cau truc tiep user, BE chua deploy) - xem WHY day du
// trong chinh file do
import QuanHeDayDuTable from "./XemTruocAnhHuong/QuanHeDayDuTable";
// khu vuc ket qua CR theo tung huong va log tien trinh CR - tuong ung Zone C trong UI_DESIGN.md
// doi ten tu ZoneC sang KetQuaCR cho dung chuc nang hien thi
// QosSparkline (Widget F33) va QoeQosCharts (Zone E) da XOA HAN (khong con dung o dau trong module) - CTS
// chi ho tro granularity ngay nen chart 48h vo nghia (QosSparkline), QoeQosCharts luon rong vi phu thuoc
// job evaluate 21 ngay - thay bang CellQosHistoryChart (7 ngay preview) va QosEvaluationChart (15 ngay danh gia)
import CrResultsByDirection from "./KetQuaCR/CrResultsByDirection";
import SseProgressLog from "./KetQuaCR/SseProgressLog";
import { StationItem, PreviewCrResponse } from "../types";
// token mau xanh duong dung chung toan module - dong bo mau header Collapse (Viec 1) voi phan con lai
import { R012_COLORS } from "../theme";
// nhan hien thi cho ma co dinh "x_co" cua tram goc (BUOC 4b, 08/10/2026) - xem WHY day du trong chinh file do
import { layDanhSachNhanXCo } from "../helpers/hoLabels";
// goi useSseStream DUY NHAT 1 LAN o cap TacDongTram nay, KHONG goi rieng trong tung component con cua Zone C -
// neu goi nhieu lan se mo nhieu ket noi EventSource trung lap toi CUNG 1 session_id, gay lang phi tai nguyen
// va co the loi (nhieu socket cung tranh nhau doc/dong 1 session tren BE)
import useSseStream from "../hooks/useSseStream";

const TacDongTram: React.FC = () => {
  // state duoc nang len TacDongTram (thay vi de rieng trong StationSearchGrid) vi ca 2 component con
  // StationSearchGrid va ConfirmTriggerModal deu can doc/ghi cung 1 nguon du lieu nay:
  // - stationToTrigger: tram dang can trigger CR, StationSearchGrid ghi vao (khi bam nut Trigger CR),
  //   ConfirmTriggerModal doc ra de hien thong tin va gui request
  // - isTriggerModalOpen: co dong/mo modal, StationSearchGrid bat len true, ConfirmTriggerModal tat ve false khi dong
  const [stationToTrigger, setStationToTrigger] = useState<StationItem | null>(null);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState<boolean>(false);

  // state RIENG cho tram dang "xem tren ban do" (Zone B - BanDoMang), TACH BIET voi stationToTrigger o tren:
  // - stationToTrigger: tram dang lam CR, chi doi khi NOC bam nut "Trigger CR"
  // - selectedStationForView: tram dang hien tren NetworkMap, doi MOI LAN NOC click 1 dong trong bang
  // 2 state nay co the KHAC NHAU cung luc (vd NOC dang xem tram A tren map nhung truoc do da trigger CR cho tram B
  // va modal xac nhan tram B van con hien) - neu dung chung 1 state se lam sai lech ca 2 luong nghiep vu
  const [selectedStationForView, setSelectedStationForView] = useState<StationItem | null>(null);

  // ket qua "Xem truoc anh huong" (Buoc 1 tinh nang preview) - null nghia la chua xem truoc hoac vua doi
  // sang tram khac (StationSearchGrid tu reset ve null khi doi tram, xem comment handleRowClick trong do).
  // CO gia tri thi NetworkMap uu tien hien che do nhieu marker (tram_goc + tram_bi_anh_huong) thay vi 1 marker
  const [previewData, setPreviewData] = useState<PreviewCrResponse | null>(null);

  // session_id cua phien CR dang duoc theo doi SSE realtime (Zone C - KetQuaCR) - null nghia la chua trigger
  // CR nao trong phien lam viec nay, hoac chua co ket qua tu ConfirmTriggerModal
  const [activeCrSessionId, setActiveCrSessionId] = useState<number | null>(null);

  // goi useSseStream 1 LAN DUY NHAT tai day (xem comment o import phia tren), ca SseProgressLog va
  // CrResultsByDirection deu nhan logs/status tu KET QUA CHUNG nay qua props, khong tu ket noi rieng
  const { logs, status } = useSseStream(activeCrSessionId);

  // ham nay truyen xuong StationSearchGrid qua prop onTriggerCr - goi khi NOC bam nut Trigger CR cho 1 tram
  const handleTriggerCr = (station: StationItem) => {
    setStationToTrigger(station);
    setIsTriggerModalOpen(true);
  };

  // ham nay truyen xuong ConfirmTriggerModal qua prop onTriggerSuccess - goi khi trigger CR thanh cong,
  // nhan duoc session_id moi thi bat dau theo doi SSE cho session do (useSseStream se tu dong ket noi lai
  // vi sessionId trong dependency array cua no doi)
  const handleTriggerSuccess = (sessionId: number) => {
    setActiveCrSessionId(sessionId);
  };

  // ham nay truyen xuong StationSearchGrid qua prop onSelectStation - goi moi lan NOC click 1 dong trong bang,
  // CHI de cap nhat tram hien tren map, khong lien quan gi den luong Trigger CR o tren
  const handleSelectStationForView = (station: StationItem) => {
    setSelectedStationForView(station);
  };

  // ham nay truyen xuong StationSearchGrid qua prop onPreviewResult - goi khi "Xem truoc anh huong" thanh cong
  // (data) hoac khi NOC doi sang tram khac (null, StationSearchGrid tu reset) - cap nhat state de NetworkMap
  // doi qua che do nhieu marker (hoac quay lai 1 marker khi null)
  const handlePreviewResult = (data: PreviewCrResponse | null) => {
    setPreviewData(data);
  };

  // ham nay truyen xuong ConfirmTriggerModal qua prop onClose - goi khi dong modal (huy hoac sau khi trigger xong)
  const handleCloseTriggerModal = () => {
    setIsTriggerModalOpen(false);
  };

  // Viec 6: danh sach muc Collapse cua Zone B - tach rieng thanh useMemo (thay vi viet thang trong JSX)
  // vi antd Collapse ban moi (5.5+) dung prop "items" (mang), khong con dung <Collapse.Panel> children nhu
  // ban cu (da deprecated) - xay mang nay CO DIEU KIEN de cac muc bang/chart CHI xuat hien SAU KHI co
  // previewData, giu DUNG hanh vi an/hien nhu truoc khi doi sang Collapse
  const zoneBCollapseItems: CollapseProps["items"] = useMemo(() => {
    const items: NonNullable<CollapseProps["items"]> = [
      {
        key: "map",
        label: "Ban do mang",
        children: <NetworkMap station={selectedStationForView} previewData={previewData} />,
      },
    ];
    if (previewData) {
      items.push(
        {
          key: "tram-anh-huong",
          label: "Tram bi anh huong",
          children: <AffectedStationsTable previewData={previewData} />,
        },
        {
          key: "cell-anh-huong",
          label: "Cell bi anh huong",
          children: <AffectedCellsTable previewData={previewData} />,
        },
        {
          key: "cell-chay-cr",
          label: "Cell chay CR",
          children: <CrCellsTable previewData={previewData} />,
        },
        {
          key: "chart-qos-preview",
          label: "Chart QoS 7 ngay gan nhat",
          children: <CellQosHistoryChart previewData={previewData} />,
        }
      );
      // muc "Cell bi loai khoi pham vi" CHI them vao Collapse khi THAT SU co cell bi loai - rong thi
      // khong chiem 1 muc Collapse vo ich (nhat quan voi CellNgoaiPhamViTable tu return null khi rong,
      // nhung kiem o day truoc de khong tao ca 1 Collapse.Panel rong)
      if (previewData.cell_ngoai_pham_vi_chi_tiet && previewData.cell_ngoai_pham_vi_chi_tiet.length > 0) {
        items.push({
          key: "cell-ngoai-pham-vi",
          label: `Cell bi loai khoi pham vi (${previewData.cell_ngoai_pham_vi_chi_tiet.length})`,
          children: <CellNgoaiPhamViTable previewData={previewData} />,
        });
      }
      // muc "Quan he day du" (BUOC 4b, 08/10/2026) - CHI them khi THAT SU co du lieu (nhanh HO), giong
      // quy uoc "Cell bi loai khoi pham vi" ngay tren - thu gon theo mac dinh (KHONG nam trong
      // defaultActiveKey), NOC tu bam mo rong khi can xem (yeu cau "bang thu gon, bam mo rong")
      if (previewData.quan_he_day_du && previewData.quan_he_day_du.length > 0) {
        items.push({
          key: "quan-he-day-du",
          label: `Quan he day du (${previewData.quan_he_day_du.length})`,
          children: <QuanHeDayDuTable previewData={previewData} />,
        });
      }
    }
    return items;
  }, [selectedStationForView, previewData]);

  return (
    <div>
      <div id="zone-a">
        <Row gutter={16}>
          <Col span={24}>
            <StationSearchGrid
              onTriggerCr={handleTriggerCr}
              onSelectStation={handleSelectStationForView}
              onPreviewResult={handlePreviewResult}
            />
          </Col>
        </Row>
      </div>
      {/* ConfirmTriggerModal dat ngoai Row/Col cua zone-a vi la Modal (overlay), khong can chiem layout cot */}
      <ConfirmTriggerModal
        open={isTriggerModalOpen}
        station={stationToTrigger}
        onClose={handleCloseTriggerModal}
        onTriggerSuccess={handleTriggerSuccess}
      />
      <div id="zone-b">
        {/* Viec 6: gom Zone B thanh Collapse (antd) - khu vuc nay da kha dai khi co previewData (map + 3
            bang + 1 chart), NOC phai cuon nhieu de thay het. Mac dinh CHI mo muc "Ban do mang" (tong quan
            truoc tien), cac muc con lai thu gon - NOC tu bam mo muc nao can xem, tranh trang qua dai.
            Thu tu giu DUNG bo tri cu: Map -> Bang tram -> Bang cell bi anh huong -> Bang cell chay CR ->
            Chart QoS (cac muc bang/chart CHI xuat hien SAU KHI co previewData, giong logic an/hien cu) */}
        {/* Viec 1 (24072026, xac nhan voi user): header Collapse dong bo mau xanh duong toan module - dung
            className "r012-collapse" + selector 2 lop de TANG DO SPECIFICITY hon rule goc cua antd, THANG
            cascade thong thuong, KHONG can !important (giong quy uoc EvaluationDetail.tsx/cac bang trong module) */}
        <style>{`
          .r012-collapse.ant-collapse .ant-collapse-header {
            background-color: ${R012_COLORS.tableRowAlt};
          }
          .r012-collapse.ant-collapse .ant-collapse-header .ant-collapse-header-text {
            color: ${R012_COLORS.primaryDark};
            font-weight: 700;
          }
          .r012-collapse.ant-collapse .ant-collapse-expand-icon {
            color: ${R012_COLORS.primary};
          }
          .r012-collapse.ant-collapse,
          .r012-collapse.ant-collapse .ant-collapse-item {
            border-color: ${R012_COLORS.primaryLight};
          }
          .r012-collapse.ant-collapse .ant-collapse-item-active > .ant-collapse-header {
            background-color: ${R012_COLORS.primaryPale};
          }
        `}</style>
        {/* "NetAct se dung" (27092026) - CO Y dat NGOAI Collapse (luon hien, khong thu gon duoc): day la
            thong tin AN TOAN, NOC phai THAY truoc khi bam nut "Trigger CR" that o Zone A ben tren - giau
            trong 1 muc Collapse mac dinh thu gon se danh mat dung muc dich ("phat hien nham OSS truoc khi
            anh huong live network", xem comment OssSeDung trong types/index.ts). optional + null deu an:
            BE .196 chua deploy truong nay (undefined), hoac BE tra null that su khi khong con cell nao
            route duoc OSS nao - ca 2 truong hop deu khong co gi de hien */}
        {/* "Nguon du lieu" + "Co cua tram X" (BUOC 4b, 08/10/2026, yeu cau truc tiep user) - CHI co khi tram
            nay chay nhanh HO (nguon_du_lieu luon co gia tri cho nhanh HO, undefined cho nhanh CDS). Dat
            NGOAI Collapse (luon hien) giong "NetAct se dung" ben duoi - day la ngu canh NOC can biet NGAY
            TRUOC khi doc cac bang/ban do o duoi (vd biet truoc sao X la CRAN hay sao sector nao it du lieu),
            khong nen giau trong 1 muc Collapse mac dinh thu gon */}
        {previewData?.nguon_du_lieu && (
          <Alert
            type="info"
            showIcon
            message={`Nguon du lieu: ${previewData.nguon_du_lieu}`}
            style={{ marginBottom: "0.5rem" }}
          />
        )}
        {previewData?.x_co && previewData.x_co.length > 0 && (
          <Alert
            type="warning"
            showIcon
            message={
              <>
                Co cua tram {previewData.tram_goc.tram_name ?? previewData.tram_goc.tram_id}:{" "}
                {/* "IT_DU_LIEU" duoc khai trien thanh 1 nhan/sector qua sectors_it_du_lieu (THEM 10/10/2026) -
                    xem layDanhSachNhanXCo() de biet WHY khong con dung X_CO_LABELS truc tiep o day */}
                {layDanhSachNhanXCo(previewData.x_co, previewData.sectors_it_du_lieu).map((nhan) => (
                  <Tag key={nhan} color="orange" style={{ marginLeft: "4px" }}>
                    {nhan}
                  </Tag>
                ))}
              </>
            }
            style={{ marginBottom: "0.75rem" }}
          />
        )}
        {previewData?.oss_se_dung && (
          <Alert
            type="info"
            showIcon
            // CHI hien instance_id - "host" (IP NetAct) da bi BE xoa khoi schema (bao mat, xem comment
            // OssSeDung trong types/index.ts) nen khong con de hien o day
            message={`NetAct se dung: ${previewData.oss_se_dung.instance_id}`}
            style={{ marginBottom: "0.75rem" }}
          />
        )}
        <Collapse className="r012-collapse" defaultActiveKey={["map"]} items={zoneBCollapseItems} />
      </div>
      {/* CHI render zone-c khi da co activeCrSessionId (da trigger CR) - truoc day zone-c luon hien du
          chua trigger, dan den CA CrResultsByDirection LAN SseProgressLog cung hien text "Chua co phien CR..."
          giong het nhau ngay trong luc chua co loi gi, de gay hieu lam la dang bi loi/trung lap. An han
          (khong render) thay vi chi an bang CSS de KHONG chiem layout khi chua co CR nao duoc trigger */}
      {activeCrSessionId && (
        <div id="zone-c">
          <Row gutter={16}>
            <Col span={12}>
              <CrResultsByDirection sessionId={activeCrSessionId} status={status} />
            </Col>
            <Col span={12}>
              <SseProgressLog logs={logs} status={status} />
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default TacDongTram;

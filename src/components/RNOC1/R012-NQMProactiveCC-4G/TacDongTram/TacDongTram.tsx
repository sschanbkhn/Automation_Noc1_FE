import React, { useState } from "react";
import { Row, Col } from "antd";
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
// khu vuc ket qua CR theo tung huong va log tien trinh CR - tuong ung Zone C trong UI_DESIGN.md
// doi ten tu ZoneC sang KetQuaCR cho dung chuc nang hien thi
// QosSparkline (Widget F33) va QoeQosCharts (Zone E) KHONG import truc tiep o day nua - da nhung san
// BEN TRONG CrResultsByDirection.tsx (hien sau khi co ket qua CR), tranh render trung 2 lan cung du lieu
import CrResultsByDirection from "./KetQuaCR/CrResultsByDirection";
import SseProgressLog from "./KetQuaCR/SseProgressLog";
import { StationItem, PreviewCrResponse } from "../types";
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
  // CO gia tri thi NetworkMap uu tien hien che do nhieu marker (tram_goc + tram_lan_can) thay vi 1 marker
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
        <Row gutter={16}>
          {/* mot cot day du (span 24) vi SectorBeam da nam trong long NetworkMap, khong con la 2 khoi rieng canh nhau */}
          <Col span={24}>
            <NetworkMap station={selectedStationForView} previewData={previewData} />
          </Col>
        </Row>
        {/* bang tram + bang cell CHI hien khi da co previewData (da bam "Xem truoc anh huong" thanh cong) -
            an han (khong render) khi chua co, tranh chiem layout voi 2 bang rong vo nghia truoc do.
            Thu tu Map -> Bang tram -> Bang cell (tu tong quan den chi tiet) theo dung yeu cau bo tri */}
        {previewData && (
          <>
            <Row gutter={16} style={{ marginTop: "1rem" }}>
              <Col span={24}>
                <AffectedStationsTable previewData={previewData} />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: "1rem" }}>
              <Col span={24}>
                <AffectedCellsTable previewData={previewData} />
              </Col>
            </Row>
          </>
        )}
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

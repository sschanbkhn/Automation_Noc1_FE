import React, { useState } from "react";
import { Row, Col } from "antd";
// khu vuc tim kiem va chon tram, xac nhan trigger CR - tuong ung Zone A trong UI_DESIGN.md
// doi ten tu ZoneA sang TimTram de ten thu muc phan anh dung chuc nang thay vi ten generic theo vi tri layout
import StationSearchGrid from "./TimTram/StationSearchGrid";
import ConfirmTriggerModal from "./TimTram/ConfirmTriggerModal";
// khu vuc ban do mang va huong song - tuong ung Zone B trong UI_DESIGN.md
// doi ten tu ZoneB sang BanDoMang cho dung chuc nang hien thi
import NetworkMap from "./BanDoMang/NetworkMap";
import SectorBeam from "./BanDoMang/SectorBeam";
// khu vuc ket qua CR theo tung huong va log tien trinh CR - tuong ung Zone C trong UI_DESIGN.md
// doi ten tu ZoneC sang KetQuaCR cho dung chuc nang hien thi
import CrResultsByDirection from "./KetQuaCR/CrResultsByDirection";
import SseProgressLog from "./KetQuaCR/SseProgressLog";
// widget hien chi so QoS dang sparkline - tuong ung Widget F33 trong UI_DESIGN.md
// doi ten tu WidgetF33 sang ChiSoQos cho dung chuc nang hien thi
import QosSparkline from "./ChiSoQos/QosSparkline";
// khu vuc bieu do danh gia chat luong QoE/QoS truoc-sau CR - tuong ung Zone E trong UI_DESIGN.md
// doi ten tu ZoneE sang DanhGiaChatLuong cho dung chuc nang hien thi
import QoeQosCharts from "./DanhGiaChatLuong/QoeQosCharts";
import { StationItem } from "../types";

const TacDongTram: React.FC = () => {
  // state duoc nang len TacDongTram (thay vi de rieng trong StationSearchGrid) vi ca 2 component con
  // StationSearchGrid va ConfirmTriggerModal deu can doc/ghi cung 1 nguon du lieu nay:
  // - stationToTrigger: tram dang can trigger CR, StationSearchGrid ghi vao (khi bam nut Trigger CR),
  //   ConfirmTriggerModal doc ra de hien thong tin va gui request
  // - isTriggerModalOpen: co dong/mo modal, StationSearchGrid bat len true, ConfirmTriggerModal tat ve false khi dong
  const [stationToTrigger, setStationToTrigger] = useState<StationItem | null>(null);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState<boolean>(false);

  // ham nay truyen xuong StationSearchGrid qua prop onTriggerCr - goi khi NOC bam nut Trigger CR cho 1 tram
  const handleTriggerCr = (station: StationItem) => {
    setStationToTrigger(station);
    setIsTriggerModalOpen(true);
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
            <StationSearchGrid onTriggerCr={handleTriggerCr} />
          </Col>
        </Row>
      </div>
      {/* ConfirmTriggerModal dat ngoai Row/Col cua zone-a vi la Modal (overlay), khong can chiem layout cot */}
      <ConfirmTriggerModal
        open={isTriggerModalOpen}
        station={stationToTrigger}
        onClose={handleCloseTriggerModal}
      />
      <div id="zone-b">
        <Row gutter={16}>
          <Col span={12}>
            <NetworkMap />
          </Col>
          <Col span={12}>
            <SectorBeam />
          </Col>
        </Row>
      </div>
      <div id="zone-c">
        <Row gutter={16}>
          <Col span={12}>
            <CrResultsByDirection />
          </Col>
          <Col span={12}>
            <SseProgressLog />
          </Col>
        </Row>
      </div>
      <div id="widget-f33">
        <QosSparkline />
      </div>
      <div id="zone-e">
        <QoeQosCharts />
      </div>
    </div>
  );
};

export default TacDongTram;

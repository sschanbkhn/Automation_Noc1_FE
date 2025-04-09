import React, { useEffect, useState } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import { Tile as TileLayer } from "ol/layer";
import { OSM } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { snapToRoad } from "./snapToRoad";
import { drawConnectionWithoutArrow, drawConnectionWithState } from "./drawConnectionWithArrow";
import { createSwitchFeature } from "./createSwitchFeature";
import { switches as initialSwitches } from "./switches";
import { connections } from "./connections";
import { Modal, Button } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
const MapComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedSwitch, setSelectedSwitch] = useState<any>(null);
  const [switches, setSwitches] = useState(initialSwitches); // Lưu trạng thái switches

  const handleClose = () => setShowModal(false);

  const toggleSwitchState = (id: string) => {
    setSwitches((prevSwitches) =>
      prevSwitches.map((sw) =>
        sw.id === id ? { ...sw, active: !sw.active } : sw
      )
    );
    setShowModal(false);
  };

  useEffect(() => {
    const processConnections = async () => {
      const map = new Map({
        target: "map",
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: [11850707.33, 1222267.87], // EPSG:3857
          zoom: 14,
        }),
      });
  
      // Tìm đường gần nhất cho các thiết bị
      const snappedSwitches = await Promise.all(
        switches.map(async (sw) => {
          const snappedCoordinates = await snapToRoad(sw.lat, sw.lon);
          return { ...sw, lat: snappedCoordinates[0], lon: snappedCoordinates[1] };
        })
      );
  
      // Vẽ các thiết bị lên bản đồ
      const switchFeatures = snappedSwitches.map(createSwitchFeature);
  
      const switchLayer = new VectorLayer({
        source: new VectorSource({
          features: switchFeatures,
        }),
      });
  
      map.addLayer(switchLayer);
  
      // Vẽ các kết nối
      const updatedConnections = await Promise.all(
        connections.map(async (conn) => {
          const startDevice = snappedSwitches.find((sw) => sw.id === conn.source);
          const endDevice = snappedSwitches.find((sw) => sw.id === conn.target);
  
          if (startDevice && endDevice) {
            // Kiểm tra trạng thái của link (cả hai thiết bị phải "active")
            const active = startDevice.active && endDevice.active;
  
            const distance = await drawConnectionWithState(
              map,
              [startDevice.lon, startDevice.lat],
              [endDevice.lon, endDevice.lat],
              conn.type,
              active
            );
            return { ...conn, distance, active };
          }
          return null;
        })
      );
  
      const finalizedConnections = updatedConnections.filter((conn) => conn !== null);
  
      // Sự kiện click vào thiết bị
      map.on("click", (event) => {
        const feature = map.forEachFeatureAtPixel(event.pixel, (feat) => feat);
        if (feature) {
          const switchId = feature.get("id");
          const switchDetails = snappedSwitches.find((sw) => sw.id === switchId);
  
          if (switchDetails) {
            const connectionsDetails = finalizedConnections
              .filter((conn) => conn.source === switchId || conn.target === switchId)
              .map((conn) => {
                const targetSwitch =
                  conn.source === switchId
                    ? snappedSwitches.find((sw) => sw.id === conn.target)
                    : snappedSwitches.find((sw) => sw.id === conn.source);
  
                return {
                  sourcePort: conn.source === switchId ? conn.sourcePort : conn.targetPort,
                  targetPort: conn.source === switchId ? conn.targetPort : conn.sourcePort,
                  targetSwitch: targetSwitch?.name || "Unknown",
                  distance: conn.distance || 0, // Hiển thị khoảng cách
                  type: conn.type, // Loại cáp
                  active: conn.active, // Trạng thái link
                };
              });
  
            setSelectedSwitch({ ...switchDetails, connections: connectionsDetails });
            setShowModal(true);
          }
        }
      });
    };
  
    processConnections();
  }, [switches]);
  
  return (
    <>
      <div id="map" style={{ width: "100%", height: "100vh" }} />

      {selectedSwitch && (
  <Modal show={showModal} onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title>{selectedSwitch.name}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p><strong>ID:</strong> {selectedSwitch.id}</p>
      <p><strong>Trạng thái:</strong> {selectedSwitch.active ? "Đang hoạt động" : "Không hoạt động"}</p>
      <h5>Kết nối:</h5>
      <ul>
        {selectedSwitch.connections.map((conn: any, index: number) => (
          <li key={index}>
            Cổng {conn.sourcePort} → Cổng {conn.targetPort} / {conn.targetSwitch}  
            (Khoảng cách: {(conn.distance / 1000).toFixed(2)} km, Loại: {conn.type}, 
            Trạng thái: {conn.active ? "Hoạt động" : "Bị ảnh hưởng"})
          </li>
        ))}
      </ul>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={handleClose}>
        Đóng
      </Button>
    </Modal.Footer>
  </Modal>
)}

    </>
  );
};

export default MapComponent;

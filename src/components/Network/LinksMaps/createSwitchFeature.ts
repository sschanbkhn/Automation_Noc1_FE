import { Feature } from "ol";
import { Point } from "ol/geom";
import { Style, Icon, Text, Fill } from "ol/style";
import { fromLonLat } from "ol/proj";
import { Switch } from "./switches";

export function createSwitchFeature(sw: Switch): Feature {
  const feature = new Feature({
    geometry: new Point(fromLonLat([sw.lon, sw.lat])),
    id: sw.id,
    name: sw.name,
  });

  // Chọn icon dựa trên trạng thái `active`
  const iconUrl = sw.active
    ? "https://img.icons8.com/ios-filled/50/008000/switch-on.png" // Icon "đang hoạt động"
    : "https://img.icons8.com/ios-filled/50/FF0000/switch-off.png"; // Icon "không hoạt động"

  feature.setStyle(
    new Style({
      image: new Icon({
        src: iconUrl, // Icon tùy thuộc vào trạng thái
        scale: 0.7,
      }),
      text: new Text({
        text: sw.name,
        font: "12px Arial, sans-serif",
        fill: new Fill({ color: "#000" }),
        offsetY: -20, // Hiển thị tên phía trên icon
      }),
    })
  );

  return feature;
}

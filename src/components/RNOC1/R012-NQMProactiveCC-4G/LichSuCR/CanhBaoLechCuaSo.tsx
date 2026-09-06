// Canh bao khi QoS va QoE duoc tinh tren 2 TAP NGAY KHAC NHAU.
//
// === VI SAO CAN ===
// 2 bang QoS/QoE nam canh nhau trong cung 1 muc, chuyen qua lai bang Segmented - nguoi dung mac dinh coi
// chung la 2 goc nhin cua CUNG mot phep do. Thuc te KHONG phai: CTS tre du lieu 1 ngay, CEM tre 2 ngay va
// con lo thung, nen cua so thuc te cua 2 chi so lech nhau.
// Do that session 1811:
//     QoS: before 06-12 (7 ngay), after 14-19 (6 ngay)
//     QoE: before 07-12 (6 ngay), after 14-20 (7 ngay)
// Hai con so trung binh vi vay KHONG so sanh truc tiep duoc voi nhau. Khong noi ra thi nguoi dung se ket
// luan "QoE tot hon QoS" trong khi that ra 2 ben dang do tren 2 khoang thoi gian khac.
//
// === VI SAO DOC TU CACHE, KHONG TU GOI API ===
// Moi lan goi /qos-cells hay /qoe-cells deu bat BE goi CTS/CEM cho tung cell (QoS: ~34 request cho 17
// cell). Goi them 1 lan nua CHI de so sanh cua so la khong dang. Dung useQuery voi enabled:false - doc
// DUNG cache ma 2 bang da nap, khong ban them request nao.
// He qua: canh bao chi hien khi nguoi dung DA xem ca hai bang. Chap nhan duoc - dung luc do moi co 2 con
// so dat canh nhau de ma so sanh nham.
import React from "react";
import { Alert } from "antd";
import { useQuery } from "@tanstack/react-query";

import { QoeCellsResponse, QosCellsResponse } from "../types";
import { soNgayCuaSo } from "../helpers/cuaSoNgay";

interface CanhBaoLechCuaSoProps {
  sessionId: number;
}

const CanhBaoLechCuaSo: React.FC<CanhBaoLechCuaSoProps> = ({ sessionId }) => {
  // enabled:false + queryFn nem loi: 2 query nay TUYET DOI khong duoc tu goi API. Chung dung chung
  // queryKey voi 2 bang nen chi doc lai du lieu 2 bang da nap. queryFn van phai khai bao (TanStack yeu
  // cau) - de no nem loi cho ro y dinh, neu sau nay ai do bat enabled len se thay ngay
  const { data: qos } = useQuery<QosCellsResponse>({
    queryKey: ["r012", "qos-cells", sessionId],
    queryFn: () => Promise.reject(new Error("chi doc cache, khong tu goi")),
    enabled: false,
  });
  const { data: qoe } = useQuery<QoeCellsResponse>({
    queryKey: ["r012", "qoe-cells", sessionId],
    queryFn: () => Promise.reject(new Error("chi doc cache, khong tu goi")),
    enabled: false,
  });

  if (!qos || !qoe) {
    return null; // chua xem du ca 2 bang -> chua co gi de so sanh
  }

  const lech: string[] = [];
  if (qos.cua_so_before.tu !== qoe.cua_so_before.tu || qos.cua_so_before.den !== qoe.cua_so_before.den) {
    lech.push(
      `truoc CR: QoS ${qos.cua_so_before.tu}..${qos.cua_so_before.den} ` +
        `(${soNgayCuaSo(qos.cua_so_before)} ngay) vs QoE ${qoe.cua_so_before.tu}..${qoe.cua_so_before.den} ` +
        `(${soNgayCuaSo(qoe.cua_so_before)} ngay)`
    );
  }
  if (qos.cua_so_after.tu !== qoe.cua_so_after.tu || qos.cua_so_after.den !== qoe.cua_so_after.den) {
    lech.push(
      `sau CR: QoS ${qos.cua_so_after.tu}..${qos.cua_so_after.den} ` +
        `(${soNgayCuaSo(qos.cua_so_after)} ngay) vs QoE ${qoe.cua_so_after.tu}..${qoe.cua_so_after.den} ` +
        `(${soNgayCuaSo(qoe.cua_so_after)} ngay)`
    );
  }

  if (lech.length === 0) {
    return null; // 2 cua so trung nhau - khong co gi phai canh bao
  }

  return (
    <Alert
      type="warning"
      showIcon
      style={{ marginBottom: "12px" }}
      message="QoS va QoE dang tinh tren 2 khoang ngay KHAC NHAU - khong so sanh truc tiep 2 con so trung binh"
      description={
        <ul style={{ margin: 0, paddingInlineStart: "18px" }}>
          {lech.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      }
    />
  );
};

export default CanhBaoLechCuaSo;

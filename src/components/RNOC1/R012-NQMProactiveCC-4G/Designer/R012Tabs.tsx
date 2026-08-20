import React, { useCallback, useState } from "react";
import { Tabs } from "antd";
import TacDongTram from "../TacDongTram/TacDongTram";
import LichSuCR from "../LichSuCR/LichSuCR";
import CellXau from "../CellXau/CellXau";
import LichSuPhieu from "../LichSuPhieu/LichSuPhieu";
import { YeuCauLocTram } from "../LichSuCR/SessionHistoryList";
// CSS bo cuc dung CHUNG cho moi bang trong module - nhung DUNG 1 LAN o day (goc module) thay vi lap lai
// the <style> trong 12 file bang. Xem ly do day du trong common/r012TableStyle.tsx
import { R012TableStyle } from "../common/r012TableStyle";

// key cua tab "Lich su CR" - dat thanh hang so vi gio co cho khac (dieu huong tu tab Lich su phieu) tro
// toi no, go lech chinh ta se lam nut bam khong ra tab nao ma cung khong bao loi gi
const KEY_TAB_LICH_SU_CR = "tab2";

const R012Tabs: React.FC = () => {
  // Tabs chuyen tu KHONG dieu khien (defaultActiveKey) sang CO dieu khien: can doi tab bang CODE khi nguoi
  // dung bam ma tram o muc "Tien trinh" cua tab Lich su phieu. defaultActiveKey chi co tac dung o lan
  // render dau, khong doi tab theo lenh duoc
  const [activeKey, setActiveKey] = useState<string>("tab1");

  // Yeu cau loc gui sang tab Lich su CR. Mang theo "seq" tang dan chu khong chi tramId: bam lai DUNG ma
  // tram vua bam se khong lam prop doi gia tri -> useEffect ben SessionHistoryList khong chay lai ->
  // nguoi dung bam ma khong thay gi xay ra
  const [yeuCauLocTram, setYeuCauLocTram] = useState<YeuCauLocTram | null>(null);

  const handleXemLichSuCR = useCallback((tramId: string) => {
    setYeuCauLocTram((truoc) => ({ tramId, seq: (truoc?.seq ?? 0) + 1 }));
    setActiveKey(KEY_TAB_LICH_SU_CR);
  }, []);

  const items = [
    {
      key: "tab1",
      label: "Tác động trạm",
      children: <TacDongTram />,
    },
    {
      key: KEY_TAB_LICH_SU_CR,
      label: "Lịch sử CR",
      children: <LichSuCR yeuCauLocTram={yeuCauLocTram} />,
    },
    // DOI CHO tab "Lich su phieu" LEN TRUOC "Cell xau" (truoc day nguoc lai). Ly do: 3 tab Tac dong tram /
    // Lich su CR / Lich su phieu deu la NOI DUNG CUA R012, doc CUNG 1 BE (FastAPI R012) va la 3 buoc lien
    // tiep cua cung quy trinh (tac dong tram -> theo doi CR -> xuat phieu) - phai nam lien nhau de NOC di
    // tu trai sang phai dung theo trinh tu lam viec. "Cell xau" la module S006-CELL cua HE THONG SOC RIENG
    // (BE khac han, xem comment ben duoi) chi duoc nhung nho vao day, nen day XUONG CUOI de khong cat ngang
    // mach 3 tab R012.
    // GIU NGUYEN key "tab3"/"tab4" da gan voi tung noi dung (khong danh so lai theo vi tri moi): key chi la
    // dinh danh noi bo cua antd Tabs, doi no khong lam thay doi thu tu hien thi ma chi tao rui ro cho bat ky
    // cho nao dang tro toi key cu.
    {
      key: "tab4",
      label: "Lịch sử phiếu",
      children: <LichSuPhieu onXemLichSuCR={handleXemLichSuCR} />,
    },
    {
      key: "tab3",
      label: "Cell xấu",
      // Module S006-CELL, goi truc tiep BE ben SOC (10.155.43.210:8000/api/cell) qua apiConfig.tsx
      // rieng cua no, KHONG qua BE cua R012 - xem CellXau/apiConfig.tsx
      children: <CellXau />,
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        padding: "0.5rem 1rem",
      }}
    >
      {/* CSS bo cuc bang dung chung - phai nam TRONG cay DOM cua module de moi bang con deu nhan duoc */}
      <R012TableStyle />

      {/* CO dieu khien (activeKey + onChange) thay cho defaultActiveKey: xem ly do o comment state activeKey */}
      <Tabs activeKey={activeKey} onChange={setActiveKey} items={items} />
    </div>
  );
};

export default R012Tabs;

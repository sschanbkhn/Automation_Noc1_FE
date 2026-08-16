import React, { useState } from "react";
import { Segmented } from "antd";
import PhieuHistoryTable from "./PhieuHistoryTable";
import JobRunTable from "./JobRunTable";
// canh bao "job xuat phieu khong chay/loi" - xem ly do day du trong chinh file do
import JobHealthAlert from "./JobHealthAlert";

// 2 muc cua Segmented. Tach ra hang so de gia tri dung o value/state khong bi go lech chinh ta
const MUC_PHIEU = "phieu";
const MUC_JOB = "job";

const SEGMENTED_OPTIONS = [
  { value: MUC_PHIEU, label: "Phieu" },
  { value: MUC_JOB, label: "Luot chay job" },
];

// Tab "Lich su phieu" - gom 2 goc nhin cua CUNG mot viec xuat phieu:
//  - "Phieu": tung phieu da xuat (GET /api/v1/phieu) - man hinh goc, van la mac dinh
//  - "Luot chay job": tung LUOT chay cua job xuat phieu tu dong (GET /api/v1/jobs/runs) - 1 dong la tong
//    ket ca luot, mo ra moi thay tung cell
// Chon Segmented (khong phai them tab thu 5 vao Designer/R012Tabs.tsx): day van la "lich su phieu", chi
// khac muc do gom nhom - them 1 tab ngang hang se lam thanh tab chinh dai them ma 2 noi dung nay lai roi
// nhau, trong khi nguoi dung thuong xem lien tiep ca hai.
const LichSuPhieu: React.FC = () => {
  // state local trong file nay - 2 bang con deu tu quan ly phan trang/loc rieng cua chung
  const [muc, setMuc] = useState<string>(MUC_PHIEU);

  return (
    <div>
      {/* Dat TREN Segmented (khong nam trong muc "Phieu" hay "Luot chay job") vi canh bao nay dung cho CA
          HAI goc nhin: job chet thi ca bang phieu lan bang luot chay deu trong. Nam ngoai Segmented con co
          nghia la doi qua lai giua 2 muc KHONG lam component nay unmount roi goi lai API */}
      <JobHealthAlert />

      <Segmented
        value={muc}
        onChange={(value) => setMuc(value as string)}
        options={SEGMENTED_OPTIONS}
        style={{ marginBottom: "1rem" }}
      />

      {/* render co dieu kien (khong dung display:none): moi bang tu goi API rieng, giu ca hai cung mount
          se ban 2 request moi lan doi bo loc. Doi qua lai KHONG mat du lieu vi TanStack Query da cache
          theo queryKey - bang mount lai se lay ngay tu cache roi refetch nen, khong phai cho tu dau */}
      {muc === MUC_PHIEU ? (
        // KHONG truyen sessionId -> lay phieu cua tat ca session; thanh loc (trang thai + cell) tu hien
        // theo mac dinh cua PhieuHistoryTable khi khong co sessionId.
        // GIU NGUYEN component nay - no con duoc dung lai trong chi tiet session CR (EvaluationDetail.tsx)
        <PhieuHistoryTable />
      ) : (
        <JobRunTable />
      )}
    </div>
  );
};

export default LichSuPhieu;

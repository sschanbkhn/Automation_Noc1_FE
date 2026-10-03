import React, { useState } from "react";
import { Segmented } from "antd";
import PhieuHistoryTable from "./PhieuHistoryTable";
import JobRunTable from "./JobRunTable";
import TienTrinhTable from "./TienTrinhTable";
// canh bao "job xuat phieu khong chay/loi" - xem ly do day du trong chinh file do
import JobHealthAlert from "./JobHealthAlert";

// 3 muc cua Segmented. Tach ra hang so de gia tri dung o value/state khong bi go lech chinh ta
const MUC_PHIEU = "phieu";
const MUC_TIEN_TRINH = "tien_trinh";
const MUC_JOB = "job";

// Thu tu CO CHU DICH: Phieu (ket qua da co) -> Tien trinh (cai dang tren duong toi) -> Luot chay job (co
// may chay ra chung). Di tu thu cu the nhat den thu ky thuat nhat
const SEGMENTED_OPTIONS = [
  { value: MUC_PHIEU, label: "Phieu" },
  { value: MUC_TIEN_TRINH, label: "Tien trinh" },
  { value: MUC_JOB, label: "Luot chay job" },
];

interface LichSuPhieuProps {
  // chuyen sang tab "Lich su CR" va loc san 1 tram - do R012Tabs truyen xuong, xem TienTrinhTable
  onXemLichSuCR: (tramId: string) => void;
}

// Tab "Lich su phieu" - gom 3 goc nhin cua CUNG mot viec xuat phieu:
//  - "Phieu": tung phieu da xuat (GET /api/v1/phieu) - man hinh goc, van la mac dinh
//  - "Tien trinh": tung session dang tren duong toi luc co phieu (GET /api/v1/sessions kem buoc/qua_han)
//  - "Luot chay job": tung LUOT chay cua job xuat phieu tu dong (GET /api/v1/jobs/runs)
// Chon Segmented (khong phai them tab ngang hang vao Designer/R012Tabs.tsx): ca ba van la "lich su phieu",
// chi khac muc do gom nhom - them tab ngang hang se lam thanh tab chinh dai them ma 3 noi dung nay lai roi
// nhau, trong khi nguoi dung thuong xem lien tiep ca ba
const LichSuPhieu: React.FC<LichSuPhieuProps> = ({ onXemLichSuCR }) => {
  // state local trong file nay - 3 bang con deu tu quan ly phan trang/loc rieng cua chung
  const [muc, setMuc] = useState<string>(MUC_PHIEU);

  return (
    <div>
      {/* Dat TREN Segmented (khong nam trong muc nao) vi canh bao nay dung cho CA BA goc nhin: job chet thi
          ca 3 bang deu trong. Nam ngoai Segmented con co nghia la doi qua lai giua cac muc KHONG lam
          component nay unmount roi goi lai API */}
      <JobHealthAlert />

      <Segmented
        value={muc}
        onChange={(value) => setMuc(value as string)}
        options={SEGMENTED_OPTIONS}
        style={{ marginBottom: "1rem" }}
      />

      {/* render co dieu kien (khong dung display:none): moi bang tu goi API rieng, giu ca ba cung mount se
          ban 3 request moi lan doi bo loc. Doi qua lai KHONG mat du lieu vi TanStack Query da cache theo
          queryKey - bang mount lai se lay ngay tu cache roi refetch nen, khong phai cho tu dau */}
      {muc === MUC_PHIEU && (
        // KHONG truyen sessionId -> lay phieu cua tat ca session; thanh loc (trang thai + cell) tu hien
        // theo mac dinh cua PhieuHistoryTable khi khong co sessionId.
        // GIU NGUYEN component nay - no con duoc dung lai trong chi tiet session CR (EvaluationDetail.tsx)
        <PhieuHistoryTable />
      )}
      {muc === MUC_TIEN_TRINH && <TienTrinhTable onXemLichSuCR={onXemLichSuCR} />}
      {muc === MUC_JOB && <JobRunTable />}
    </div>
  );
};

export default LichSuPhieu;

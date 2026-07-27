// Token mau xanh duong dung CHUNG cho toan module R012 - trich xuat tu cac gia tri hex dang lap lai
// trong R012Header.tsx va EvaluationDetail.tsx (#1e40af/#3b82f6/#93c5fd), de MOI file trong R012 doc
// tu 1 nguon duy nhat thay vi tu dinh nghia lai hex rieng.
// Ly do: khao sat module R003-PRBLoadBalancing cho thay khi KHONG co file token, moi file/moi tab tu
// chon 1 mau khac nhau (xanh duong/xanh la/cam/tim), con sot lai ca gradient cu bi comment thay vi xoa -
// R012 chu dong tranh lap lai tinh trang do bang cach gom mau vao 1 noi ngay tu dau.
export const R012_COLORS = {
  primaryDark: "#1e40af", // xanh duong dam - diem dau gradient header, mau accent section/tieu de
  primary: "#3b82f6", // xanh duong - diem giua gradient, mau nut/link/vien nhan manh
  primaryLight: "#93c5fd", // xanh duong nhat - diem cuoi gradient header
  primaryPale: "#dbeafe", // xanh duong rat nhat - mau Divider, dung lai cho rowHoverBg ben duoi

  headerGradient: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #93c5fd 100%)", // gradient chinh: R012Header.tsx + header Card cua EvaluationDetail.tsx
  headerShadow: "0 8px 32px rgba(30, 64, 175, 0.3)", // boxShadow tuong ung primaryDark (RGB 30,64,175) - dung o R012Header.tsx

  // ---- token rieng cho bang: SessionHistoryList.tsx / StationSearchGrid.tsx ----
  tableHeaderBg: "#1e40af", // nen header bang - dung primaryDark de du dam, chu trang tren nen nay moi du tuong phan de doc
  tableRowAlt: "#f0f7ff", // mau dong xen ke - xanh duong RAT nhat, nhat hon primaryPale de khong gay roi mat khi lap lai lien tuc nhieu dong
  tableBorder: "#e2e8f0", // mau border xam trung tinh - giu nguyen gia tri da dung san truoc do trong 2 bang nay, KHONG doi sang xanh de tranh border lan at noi dung
  rowHoverBg: "#dbeafe", // mau highlight khi hover dong - dung lai primaryPale, dam hon tableRowAlt mot chut de nguoi dung nhan biet ro dang tro chuot vao dong nao
  rowSelectedBg: "#e6f7ff", // mau dong dang duoc chon (StationSearchGrid) - giu nguyen gia tri hien co, chi trich thanh token de dong bo nguon mau

  // ---- token cho Card/panel ----
  cardShadow: "0 2px 8px rgba(0,0,0,0.08)", // shadow mem - hoc tu khao sat R003 (Monitor/Configuration dung chung gia tri nay cho card), ap dung cho Card R012 de nhin nhe nhang hon boxShadow dam cua header

  // ---- token rieng cho marker "tram goc" tren map preview (NetworkMap.tsx) ----
  // day la mau NGOAI ho blue cua module - CO Y dung do vi tram_goc (tram bi tat CR) can phan biet ro rang
  // voi cac tram_lan_can (van dung primary blue) tren cung 1 ban do, dung chung 1 mau se khong the
  // phan biet duoc marker nao la tram bi tat truc tiep khi nhin luot qua
  dangerRed: "#dc2626",

  // ---- token cho bieu do cot QoS (CellQosHistoryChart.tsx preview + QosEvaluationChart.tsx danh gia) ----
  // SUA (Viec 3, 22072026, xac nhan voi user): ban cu dung chartBeforeCr = xam-xanh (#94a3b8) qua nhat,
  // kho nhin tren nen trang. Doi ca 3 token sang CUNG 1 tong mau XANH DUONG da co san (primaryLight/
  // primary/primaryDark) thay vi mau xam trung tinh - dam bao dong bo voi toan bo giao dien module (header,
  // nut, bang deu dung tong mau nay), CHI khac nhau ve DO DAM de phan biet 3 nhom, rieng "ngay CR" giu mau
  // cam/amber (tuong phan tot voi ca 3 sac xanh, de nhin thay ngay ranh gioi truoc/sau)
  chartBeforeCr: "#93c5fd", // = primaryLight - nhat hon, 7 ngay TRUOC ngay CR la du lieu tham khao, chua phai trong tam theo doi
  chartCrDay: "#f59e0b", // cam/amber - dung mau nong nhat cho DUNG 1 cot "ngay CR" (gia dinh = hom nay trong preview), de noi bat nhat
  chartAfterCr: "#1e40af", // = primaryDark - dam nhat, 7 ngay SAU ngay CR la khoang thoi gian TRONG TAM theo doi hieu qua CR
  // mau cot DUY NHAT cho chart preview 7 ngay (CellQosHistoryChart.tsx) - khong con nhom truoc/CR/sau nen
  // dung 1 mau o GIUA thang do dam (= primary, khac ca chartBeforeCr lan chartAfterCr), tranh nham lan
  // voi 2 token tren neu sau nay 2 chart dung chung 1 hang muc trong bao cao/screenshot
  chartPreview: "#3b82f6", // = primary

  // ---- token cho Log tac dong (trang thai tung buoc CR, LichSuCR/CrLogTimeline.tsx) ----
  // 3 trang thai that BE tra ve qua cr_log.status: "running"|"success"|"failed". failed TAI SU DUNG dangerRed
  // o tren (KHONG tao ban sao) - do la mau do DUY NHAT toan module cho trang thai loi, giu 1 nguon de dong bo
  // voi marker tram_goc/badge FAILED (STATUS_TAG_COLOR trong EvaluationDetail.tsx).
  statusRunning: "#94a3b8", // xam trung tinh - buoc dang chay/trung gian, CO Y KHONG dung xanh duong thuong hieu (primary/primaryLight) de tranh nham voi cac phan tu UI "active" khac cua module
  statusSuccess: "#16a34a", // xanh la (green-600) - buoc hoan thanh thanh cong, cung do dam voi dangerRed (red-600) de 2 mau doi xung ve cuong do khi dat canh nhau
};

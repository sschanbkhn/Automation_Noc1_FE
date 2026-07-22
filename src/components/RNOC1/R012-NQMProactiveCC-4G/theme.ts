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

  // ---- token cho bieu do cot QoS/QoE preview (CellQosHistoryChart.tsx, Phan 2) ----
  // 3 mau PHAN BIET RO 3 nhom ngay (truoc CR / ngay CR / sau CR) - CO Y dung 3 mau khac han nhau (khong
  // chi khac do dam cua CUNG 1 mau) de NOC nhin luot qua bieu do la phan biet ngay dang thuoc nhom nao,
  // khong phai doc tung label truc X
  chartBeforeCr: "#94a3b8", // xam-xanh trung tinh - 2 ngay TRUOC ngay CR, la du lieu tham khao, chua phai trong tam theo doi
  chartCrDay: "#f59e0b", // cam/amber - dung mau nong nhat cho DUNG 1 cot "ngay CR" (gia dinh = hom nay trong preview), de noi bat nhat
  chartAfterCr: "#3b82f6", // xanh duong - dung lai token primary, 5 ngay SAU ngay CR la khoang thoi gian se theo doi hieu qua CR
};

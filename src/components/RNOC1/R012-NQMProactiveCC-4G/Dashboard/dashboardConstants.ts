// Hang so THIET KE dung CHUNG cho toan bo Dashboard R012 (THEM 19/10/2026, SUA LAI 19/10/2026 LAN 3 theo gop
// y truc tiep user: "Thay toan bo bang mau Dashboard R012. CHI duoc dung cac ma mau duoi day, khong them mau
// khac"). TOAN BO mau NGHIEP VU (cot/duong bieu do, icon/so lon/vien trai the, tag trang thai, mau header
// modal, o Dat/Khong dat bang theo nhom) GIO CHI con lay tu 1 TRONG 3 BO_MAU ben duoi - KHONG con duoc rai hex
// rieng le o tung noi nhu cac ban truoc. Mau TRUNG TINH giao dien (nen trang, vien 1px, duong ke, chu chu
// thich xam, zebra bang, luoi/truc bieu do) GIU NGUYEN - da duoc nguoi dung xac nhan truc tiep day KHONG phai
// "bang mau nghiep vu" nen khong thuoc pham vi doi lan nay (xem cac AskUserQuestion da hoi/duoc tra loi trong
// phien lam viec nay neu can doi chieu lai quyet dinh).

// === A. BO MAU NGHIEP VU - 4 BO CO SAN, MOI VAI TRO CO IT NHAT {dam, nhat} (flow/compute co them dam2/sang o
// RIENG bo "vnpt"). DOI BO MAU: CHI SUA DONG BO_MAU_DANG_DUNG, KHONG sua tung gia tri hex ben trong BO_MAU
// (yeu cau truc tiep user: "doi bo chi sua dong nay").
//
// THEM BO "vnpt" (19/10/2026 lan 5, yeu cau truc tiep user "them bo mau vnpt theo anh mau") - CHI DUNG DUNG 14
// ma hex duoc giao (0078D4/005BAC/3EA6FF/EEF4FF/16A34A/8B5CF6/C4B5FD/F97316/FED7AA/F59E0B/EF4444/F8FAFC/
// E2E8F0/CBD5E1), cac gia tri "nhat" con lai la rgba(<dam>, alpha) DUOC GIAO SAN tu truoc (KHONG tu tinh lai
// qua ham), dung y het chuoi rgba nguoi dung da viet.
// 3 bo CU (mintFresh/skyBright/vividDay) DUOC BO SUNG them 3 truong MOI de CUNG 1 KIEU DU LIEU voi "vnpt"
// (dam2/sang cho flow, sang cho compute, phieu, nen) - NEU KHONG bo sung, TypeScript se bao loi bien dich o
// MOI noi dung MAU.flow.dam2/MAU.compute.sang/MAU.phieu/MAU.nen khi lo BO_MAU_DANG_DUNG tro ve 1 trong 3 bo cu
// nay (object literal cua tung bo mau PHAI co CUNG shape de "doi bo chi sua 1 dong" THAT SU dung, khong phai
// doi dong xong con phai di sua them code o noi khac). Gia tri bo sung cho 3 bo cu CHI LA FALLBACK TRUNG TINH,
// khong anh huong giao dien (vnpt dang la bo DANG DUNG):
//   - dam2/sang (flow, compute): = chinh gia tri dam (chua tung co sac do/dam rieng truoc day, dung lai 1 mau
//     duy nhat la an toan nhat, KHONG doi giao dien neu co ai doi BO_MAU_DANG_DUNG ve 1 trong 3 bo nay)
//   - phieu: = chinh warning (yeu cau truc tiep user: "3 bo cu khong co 'phieu'/'nen' -> fallback phieu=warning")
//   - nen: = cac mau trung tinh hien co cua DB_CARD/dashboardConstants TRUOC lan sua nay (yeu cau truc tiep
//     user: "nen = mau trung tinh hien tai")
export const BO_MAU = {
  mintFresh: {
    primary: { dam: "#14C4A8", nhat: "#E0F7F4" },
    flow: { dam: "#3B8FEA", dam2: "#3B8FEA", sang: "#3B8FEA", nhat: "#E6F0FC" },
    success: { dam: "#16B364", nhat: "#E1F5EB" },
    warning: { dam: "#F79009", nhat: "#FEF1DF" },
    critical: { dam: "#F04438", nhat: "#FDE7E5" },
    compute: { dam: "#7A5AF8", sang: "#7A5AF8", nhat: "#EEEAFE" },
    phieu: { dam: "#F79009", nhat: "#FEF1DF" },
    nen: { trang: "#ffffff", xanh: "#fafafa", track: "#f0f0f0", vien: "#e8e8e8" },
  },
  skyBright: {
    primary: { dam: "#00C2D4", nhat: "#DEF7F9" },
    flow: { dam: "#2E90FA", dam2: "#2E90FA", sang: "#2E90FA", nhat: "#E4F1FE" },
    success: { dam: "#12B76A", nhat: "#E0F6EC" },
    warning: { dam: "#FDB022", nhat: "#FFF5E2" },
    critical: { dam: "#F97066", nhat: "#FEECEB" },
    compute: { dam: "#9E77ED", sang: "#9E77ED", nhat: "#F2EDFD" },
    phieu: { dam: "#FDB022", nhat: "#FFF5E2" },
    nen: { trang: "#ffffff", xanh: "#fafafa", track: "#f0f0f0", vien: "#e8e8e8" },
  },
  vividDay: {
    primary: { dam: "#12CBB0", nhat: "#E0F8F5" },
    flow: { dam: "#2F80ED", dam2: "#2F80ED", sang: "#2F80ED", nhat: "#E4EEFD" },
    success: { dam: "#27AE60", nhat: "#E3F4EA" },
    warning: { dam: "#F2994A", nhat: "#FDF2E7" },
    critical: { dam: "#EB5757", nhat: "#FCE9E9" },
    compute: { dam: "#7B61FF", sang: "#7B61FF", nhat: "#EEEAFF" },
    phieu: { dam: "#F2994A", nhat: "#FDF2E7" },
    nen: { trang: "#ffffff", xanh: "#fafafa", track: "#f0f0f0", vien: "#e8e8e8" },
  },
  vnpt: {
    flow: { dam: "#0078D4", dam2: "#005BAC", sang: "#3EA6FF", nhat: "#EEF4FF" }, // CR
    primary: { dam: "#16A34A", nhat: "rgba(22,163,74,0.08)" }, // QoS
    success: { dam: "#16A34A", nhat: "rgba(22,163,74,0.08)" },
    compute: { dam: "#8B5CF6", sang: "#C4B5FD", nhat: "rgba(139,92,246,0.08)" }, // QoE
    phieu: { dam: "#F97316", nhat: "#FED7AA" }, // Phieu (vai tro RIENG, khong con dung chung warning)
    warning: { dam: "#F59E0B", nhat: "rgba(245,158,11,0.10)" },
    critical: { dam: "#EF4444", nhat: "rgba(239,68,68,0.08)" },
    nen: { trang: "#F8FAFC", xanh: "#EEF4FF", track: "#E2E8F0", vien: "#CBD5E1" },
  },
} as const;

export const BO_MAU_DANG_DUNG: keyof typeof BO_MAU = "vnpt"; // DOI BO MAU: CHI SUA DONG NAY
export const MAU = BO_MAU[BO_MAU_DANG_DUNG];

// vai tro theo tung chi so nghiep vu (yeu cau truc tiep user, SUA 19/10/2026 lan 5) - DUNG CHUNG moi noi
// trong Dashboard (card/bieu do/modal/bang theo nhom) de 1 chi so LUON cung 1 mau du xuat hien o dau:
//   So CR -> flow | So phieu -> phieu (vai tro RIENG, SUA lan nay - truoc dung chung warning) | So cell
//   khong dat -> critical | QoS (cot/% QoS dat) -> primary | QoE (cot/% QoE dat) -> compute
//   Hau kiem: Dat -> success, Khong dat -> critical, Thieu du lieu -> warning
// CHU Y: "So cell khong dat" gom CA QoS lan QoE deu ve 1 vai tro "critical" DUY NHAT trong Ket qua hau kiem
// (DashboardHauKiemStack.tsx) - RIENG o bieu do xu huong (DashboardTrend.tsx, tab "So cell khong dat") da doi
// sang 2 mau rieng QoS=primary/QoE=compute theo gop y lan truoc (dong bo voi mau %QoS/%QoE dat o cac tab khac).

// mau header Modal / vien trai the / tint header bang DONG THEO "loai" dang xem (cr/qos/qoe/phieu/can_xu_ly) -
// anh xa THANG 1-1 voi vai tro nghiep vu o tren (cr~So CR->flow, qos->primary, qoe->compute, phieu->phieu,
// can_xu_ly~can luu y ngay->critical, giong "Khong dat"/"So cell khong dat")
export const DB_MAU_THEO_LOAI: Record<string, string> = {
  cr: MAU.flow.dam,
  qos: MAU.primary.dam,
  qoe: MAU.compute.dam,
  phieu: MAU.phieu.dam,
  can_xu_ly: MAU.critical.dam,
};

// mau NEN THE (.nhat CUNG vai tro voi DB_MAU_THEO_LOAI o tren) - THEM 19/10/2026 lan 4. Tach map RIENG (khong
// doi DB_MAU_THEO_LOAI thanh object {dam,nhat}) vi DB_MAU_THEO_LOAI dang duoc DashboardChiTietModal.tsx dung
// TRUC TIEP nhu 1 string hex (header background, mau chu, hex+"15"/vien 2px) - doi kieu du lieu cua no se
// phai sua ca file Modal ngoai pham vi yeu cau lan nay (chi noi ve "the" o DashboardCards.tsx)
export const DB_MAU_THEO_LOAI_NHAT: Record<string, string> = {
  cr: MAU.flow.nhat,
  qos: MAU.primary.nhat,
  qoe: MAU.compute.nhat,
  phieu: MAU.phieu.nhat,
  can_xu_ly: MAU.critical.nhat,
};

// mau theo TUNG KHOA trang_thai THAT cua "Tong CR" (thanh chia doan + chi so nho) - xac nhan truc tiep voi
// user tung khoa 1 (AskUserQuestion, phien truoc), KHONG tu doan:
//   DONE (Thanh cong) -> success | FAILED (That bai) -> critical
//   PARTIAL_SUCCESS (Thanh cong mot phan) -> warning | KHONG_CHAY -> warning (CUNG mau PARTIAL_SUCCESS - nhan
//     chu tren Tag da phan biet duoc 2 trang thai nay, chap nhan trung mau theo dung xac nhan cua user)
//   dang_chay (dang xu ly) -> flow | khac (khong phan loai duoc) -> critical (SUA 19/10/2026 lan 5, yeu cau
//     truc tiep user: "CR status 'khac' -> critical" - truoc la primary)
export const DB_MAU_TRANG_THAI_CR: Record<string, string> = {
  DONE: MAU.success.dam,
  PARTIAL_SUCCESS: MAU.warning.dam,
  KHONG_CHAY: MAU.warning.dam,
  FAILED: MAU.critical.dam,
  dang_chay: MAU.flow.dam,
  khac: MAU.critical.dam,
};

// === B. CARD - DB_CARD.nen/vien/boGoc VAN la gia tri CHUNG, con dung cho KhungThe (Xu huong/Theo nhom/Can xu
// ly - KHONG doi lan nay, yeu cau chi noi ve "The" DashboardCards.tsx). RIENG "the so" o DashboardCards.tsx
// GIO TU VE nen (gradient .nhat->trang), vien (MAU.nen.track) VA bo goc RIENG (boGocThe, 16px - LON HON boGoc
// chung 12px cua KhungThe) ngay trong component, khong con dung DB_CARD.nen/vien/boGoc nua (yeu cau truc tiep
// user lan 5: "Nen: gradient...; vien 1px nen.track; bo goc 16px"). kichThuocIcon/boGocIcon CHI DashboardCards
// dung (KhungThe khong co khai niem "o icon") nen doi thang duoc, khong anh huong noi khac: 40px->48px.
export const DB_CARD = {
  nen: "#ffffff",
  vien: "1px solid #e8e8e8",
  boGoc: "12px",
  boGocThe: "16px", // THEM 19/10/2026 lan 5 - rieng cho "the so" DashboardCards.tsx, KhungThe van dung "boGoc"
  boBong: "0 2px 8px rgba(0,0,0,0.06)", // nhe (resting)
  boBongHover: "0 6px 16px rgba(0,0,0,0.12)", // dam hon (hover)
  doRongVienTrai: "4px",
  padding: "16px",
  khoangCachGrid: "16px",
  hieuUngHover: "translateY(-2px)",
  thoiGianChuyen: "all 0.2s ease",
  kichThuocIcon: "48px",
  boGocIcon: "12px",
};

// === C. CHU - "chu so lon tren card" la mau .dam2 (neu co, hien chi "flow"/CR) hoac .dam (cac the khac) CUA
// TUNG CARD, khong con 1 mau chu dung chung cho ca 4 card - xem DashboardCards.tsx::TheCoBan. mauTieuDe/
// mauDongPhu GIU NGUYEN (chu chu thich la mau trung tinh, khong phai mau nghiep vu). coChuSoLon 32px->44px
// (yeu cau truc tiep user lan 5: "co chu 44px dam"). THEM mauTieuDeThe lam fallback mau TIEU DE cua "the so"
// khi vai tro KHONG co dam2 (yeu cau truc tiep user: "chu dam mau dam2/#1E293B" - "#1E293B" la gia tri CU THE
// nguoi dung da giao, khong phai tu bia, dung lam fallback trung tinh cho QoS/QoE/Phieu) ===
export const DB_CHU = {
  mauTieuDe: "#595959", // xam dam
  coChuTieuDe: "0.85rem",
  coChuSoLon: "44px",
  doDamSoLon: 700,
  coChuDongPhu: "0.8rem",
  mauDongPhu: "#8c8c8c", // xam - CHI dung cho chu thich KHONG gan voi 1 vai tro nghiep vu nao (vd "He thong"/
  // "Hien truong" o the Phieu) - cac chi so co vai tro (Khong dat/Thieu du lieu/loi/cho xuat tay...) PHAI dung
  // MAU.<vai_tro>.dam, KHONG duoc fallback ve mau nay
  mauTieuDeThe: "#1E293B",
};

// === E. MODAL CHI TIET (vien/duong ke/hover la mau TRUNG TINH giao dien - giu nguyen, khong doi theo yeu cau
// lan nay) ===
export const DB_MODAL = {
  chieuRong: "90vw",
  chieuRongToiDa: "1200px",
  chieuCao: "85vh",
  boGoc: "16px",
  boBong: "0 25px 50px -12px rgba(0,0,0,0.25)",
  kichThuocIconHeader: "40px",
  boGocIconHeader: "10px",
  mauHoverDong: "#e3f2fd",
  mauDuongKe: "#e5e7eb",
};

// === F. BIEU DO (luoi/truc/tooltip-chrome la mau TRUNG TINH, GIU MAC DINH antd/recharts - khong tu dat mau
// xam moi, yeu cau truc tiep user muc 3: "giu mac dinh antd/recharts, khong tu dat mau xam moi") ===
export const DB_BIEU_DO = {
  luoi: "3 3",
  tooltipNen: "#ffffff",
  tooltipVien: "1px solid #e5e7eb",
  tooltipBoGoc: "8px",
  tooltipBong: "0 4px 12px rgba(0,0,0,0.15)",
  tooltipPadding: "10px 14px",
};

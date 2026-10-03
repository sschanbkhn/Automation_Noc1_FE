// Dong canh bao "job xuat phieu khong chay" - dat o DAU tab Lich su phieu, TREN Segmented.
//
// ==== TAI SAO PHAI CO KHOI NAY ====
// Job xuat phieu tu dong chay 8h sang, KHONG AI NGOI XEM luc no chay. Ket qua la man hinh nay co mot the
// hong rat de bo qua: khi hom nay khong thay phieu nao moi, co DUNG 2 kha nang va nhin vao bang thi KHONG
// PHAN BIET DUOC:
//   (a) job da chay binh thuong, hom nay khong co session nao toi han -> khong co viec de lam, moi thu OK;
//   (b) job CHET (khong chay / chay loi / treo) -> co viec nhung khong ai lam.
// Ca hai deu hien ra y het nhau: mot bang trong.
//
// Voi phuong an A (job quet DUNG 1 ngay - chi lay cac session den han xuat phieu dung hom do, khong quet
// nguoc lai qua khu), job chet 1 ngay la MAT LUON ngay CR do: hom sau job chay lai se khong nhin thay cac
// session cua hom truoc nua, chung nam lai vinh vien cho toi khi co nguoi phat hien va xuat tay. Vi vay
// canh bao phai chu dong dap vao mat ngay khi mo tab, khong the de nguoi truc tu di doi chieu bang.
//
// Binh thuong (job chay dung, khong loi) khoi nay KHONG HIEN GI - de no chi keu khi that su co chuyen,
// neu ngay nao cung hien mot dong mau vang thi vai hom la khong ai doc nua.
import React from "react";
import { Alert } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useQuery } from "@tanstack/react-query";
import { getJobRuns } from "../services/R012Service";
import { JobRunListResponse } from "../types";
import { formatDateTime } from "../helpers/formatDateTime";

// dayjs.extend goi lai cho chac (helpers/formatDateTime cung extend 2 plugin nay). extend la idempotent -
// goi nhieu lan khong sao. KHONG dua vao viec "file kia da extend roi": neu sau nay formatDateTime doi
// cach lam hoac file nay duoc import truoc, .tz() se nem loi runtime ngay giua man hinh
dayjs.extend(utc);
dayjs.extend(timezone);

const MUI_GIO_VN = "Asia/Ho_Chi_Minh";

// Job chay 8h00 sang (da doi chieu du lieu that: started_at 01:00:00Z = 08:00 GMT+7). Chi bat dau nghi ngo
// tu 8h30 - de ra 30 phut cho job chay tre/cham chu khong keu ngay 8h01, tranh bao dong gia moi sang
const MOC_PHAI_CHAY_XONG_PHUT = 8 * 60 + 30; // 8h30 tinh theo phut ke tu 00:00 gio VN

// Luot chay that xong trong duoi 1 giay (xem du lieu that: started 01:00:00.16Z, finished 01:00:00.25Z).
// Qua 30 phut ma van RUNNING nghia la job treo (ket o CDS/CTS) hoac process chet ma khong kip ghi FAILED -
// dong nao cung can nguoi vao xem, khong tu khoi duoc
const NGUONG_CHAY_LAU_PHUT = 30;

// Tu goi lai moi 60s: tab nay thuong duoc mo va de nguyen ca buoi. Neu chi goi 1 lan luc mount thi mo tab
// luc 8h20 (job chua chay, chua toi moc canh bao) roi de do se KHONG BAO GIO thay canh bao cua 8h30.
// Endpoint chi lay 1 dong (size=1) va doc thuan 1 bang trong DB nen 60s la re
const CHU_KY_LAM_MOI_MS = 60 * 1000;

// Trong 30s coi du lieu con tuoi - chan cac lan goi lai thua khi component remount lien tuc (doi qua lai
// giua 2 muc Segmented, quay lai tab tu tab khac). Dat THAP HON CHU_KY_LAM_MOI_MS de khong trung tranh voi
// nhip refetch dinh ky o tren
const THOI_GIAN_CON_TUOI_MS = 30 * 1000;

const JobHealthAlert: React.FC = () => {
  // size=1: chi can DONG MOI NHAT. BE sort mac dinh la desc nhung van truyen sort_by/order TUONG MINH -
  // toan bo logic ben duoi dua tren gia dinh "dong nay la luot chay gan nhat", khong duoc phu thuoc mac
  // dinh cua BE co the doi
  const { data, isLoading, isError } = useQuery<JobRunListResponse>({
    queryKey: ["r012", "jobs", "runs", "health-check"],
    queryFn: () => getJobRuns({ page: 1, size: 1, sort_by: "started_at", order: "desc" }),
    refetchInterval: CHU_KY_LAM_MOI_MS,
    staleTime: THOI_GIAN_CON_TUOI_MS,
  });

  // Dang tai / loi goi API -> KHONG hien gi. Loi mang da co interceptor cua r012Request bao bang
  // Notification roi; hien them 1 canh bao mau vang o day se bi doc nham thanh "job co van de" trong khi
  // that ra la khong doc duoc trang thai job
  if (isLoading || isError) {
    return null;
  }

  const luotMoiNhat = data?.data?.[0] ?? null;

  const bayGio = dayjs().tz(MUI_GIO_VN);
  const soPhutTrongNgay = bayGio.hour() * 60 + bayGio.minute();

  // MOI so sanh ngay/gio duoi day deu ep ve GMT+7 truoc: BE tra started_at dang UTC ("...Z"), so thang
  // voi ngay dia phuong se lech 7 tieng - luot chay 8h sang VN nam o 01:00Z CUNG NGAY nen khong lo, nhung
  // luot chay sau 17h VN se roi sang NGAY HOM SAU theo UTC va lam sai het phep so "co phai hom nay khong"
  const batDau = luotMoiNhat ? dayjs.utc(luotMoiNhat.started_at).tz(MUI_GIO_VN) : null;
  const chayHomNay = batDau !== null && batDau.isSame(bayGio, "day");

  // gom canh bao vao 1 mang thay vi return som o tung nhanh: cac luat KHONG loai tru nhau (vd job hom nay
  // FAILED va dong thoi co phieu loi) - return som se giau mat canh bao thu hai
  const canhBao: string[] = [];

  if (!chayHomNay && soPhutTrongNgay > MOC_PHAI_CHAY_XONG_PHUT) {
    // Chi xet dong MOI NHAT la du de ket luan "khong co luot nao hom nay": danh sach da sort giam dan theo
    // started_at, dong dau tien khong phai hom nay thi khong dong nao phia sau la hom nay duoc
    const lanCuoi = luotMoiNhat ? formatDateTime(luotMoiNhat.started_at) : "chua co luot chay nao";
    canhBao.push(`Job xuat phieu chua chay hom nay (lan cuoi: ${lanCuoi})`);
  }

  if (chayHomNay && luotMoiNhat) {
    if (luotMoiNhat.trang_thai === "FAILED") {
      // error_message co the null ngay ca khi FAILED (job chet truoc luc kip ghi) - van phai bao, chi la
      // khong co mo ta
      canhBao.push(`Job hom nay loi: ${luotMoiNhat.error_message ?? "khong co mo ta loi"}`);
    }

    if (luotMoiNhat.trang_thai === "RUNNING" && batDau !== null) {
      const soPhutDaChay = bayGio.diff(batDau, "minute");
      if (soPhutDaChay > NGUONG_CHAY_LAU_PHUT) {
        canhBao.push(`Job dang chay bat thuong lau (${soPhutDaChay} phut, binh thuong duoi 1 phut)`);
      }
    }
  }

  // Phieu loi xet tren luot chay moi nhat bat ke luot do co phai hom nay hay khong: phieu that bai la viec
  // TON DONG chua ai xu ly, khong tu het di sau 1 dem
  if (luotMoiNhat && luotMoiNhat.so_phieu_that_bai > 0) {
    canhBao.push(`Co ${luotMoiNhat.so_phieu_that_bai} phieu xuat loi`);
  }

  if (canhBao.length === 0) {
    return null; // truong hop BINH THUONG - khong chiem cho tren man hinh
  }

  return (
    <>
      {canhBao.map((noiDung) => (
        // Moi canh bao 1 Alert rieng va closable rieng: nguoi truc doc xong 1 canh bao co the tat no de
        // con lai nhung canh bao chua xu ly, gop chung 1 Alert thi tat 1 cai la mat het.
        // closable chi tat trong phien xem hien tai - tai lai trang se hien lai neu su co van con, dung
        // vay: day la canh bao van hanh, khong phai thong bao doc-roi-thoi
        <Alert
          key={noiDung}
          type="warning"
          message={noiDung}
          showIcon
          closable
          style={{ marginBottom: "8px" }}
        />
      ))}
    </>
  );
};

export default JobHealthAlert;

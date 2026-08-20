// Nut "Chay job xuat phieu" + Modal xem truoc, dat trong muc "Luot chay job" cua tab Lich su phieu.
//
// ==== TAI SAO PHAI XEM TRUOC MOI CHO CHAY ====
// Day la hanh dong ghi THAT ra he thong ngoai (CTS) va KHONG HOAN TAC DUOC - xuat nham thi phai nho CTS
// xoa tay tung phieu. Khac han moi nut khac trong module (deu la doc/tinh toan). Mot khoang ngay 30 ngay
// co the sinh ra hang tram phieu, ma tu man hinh nay KHONG co cach nao doan duoc con so do truoc khi bam.
// Vi vay luong bat buoc: chon khoang ngay -> XEM TRUOC (dem thu, khong ghi gi) -> doc so lieu that ->
// xac nhan. Nut "Xac nhan xuat" bi khoa cho toi khi xem truoc thanh cong, va khoa lai NGAY khi doi khoang
// ngay (so lieu cu khong con dung voi khoang moi nua).
import React, { useCallback, useMemo, useState } from "react";
import { Alert, Button, DatePicker, Empty, Modal, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { useQueryClient } from "@tanstack/react-query";
import { xemTruocXuatPhieuAuto, chayXuatPhieuAuto } from "../services/R012Service";
import { XemTruocCellItem, XemTruocXuatPhieuResponse } from "../types";
import { NGUON_KHONG_DAT_LABELS } from "./phieuStatus";
import { formatDateTime } from "../helpers/formatDateTime";

const { RangePicker } = DatePicker;

// Job tu dong chi xu ly cac session da du so ngay thu thap KPI, tuc ngay CR phai cach hom nay it nhat bay
// nhieu ngay. BE tu chan (den_ngay <= hom nay - 8 -> 422); o day dung lai dung con so do de: (1) dat mac
// dinh DUNG bang job tu dong dang lam, (2) chan luon tren lich thay vi de nguoi dung chon roi moi an 422
const SO_NGAY_TRE_TOI_THIEU = 8;

// BE gioi han khoang toi da 30 ngay -> 422 neu vuot. Chan tai cho de bao som va ro hon
const SO_NGAY_TOI_DA = 30;

// 1 dong cua bang chi tiet: cell + session cha cua no (lam phang de xem het trong 1 bang, thay vi phai mo
// tung session ra dem)
interface DongChiTiet extends XemTruocCellItem {
  cr_session_id: number;
  tram_id: string;
}

// gom cach doc message loi cua BE vao 1 cho: FastAPI dat noi dung o response.data.detail, mot so endpoint
// lai dung response.data.message - thu ca hai roi moi chiu thua
const layMessageBe = (error: any): string | undefined => {
  const data = error?.response?.data;
  if (!data) return undefined;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.message === "string") return data.message;
  return undefined;
};

const ChayJobModal: React.FC = () => {
  const [moModal, setMoModal] = useState<boolean>(false);

  // mac dinh CA HAI dau mut = hom nay - 8, dung nhu job tu dong chay hang ngay (no quet dung 1 ngay)
  const mocMacDinh = useMemo(() => dayjs().subtract(SO_NGAY_TRE_TOI_THIEU, "day"), []);
  const [khoangNgay, setKhoangNgay] = useState<[Dayjs, Dayjs]>([mocMacDinh, mocMacDinh]);

  const [dangXemTruoc, setDangXemTruoc] = useState<boolean>(false);
  const [dangChay, setDangChay] = useState<boolean>(false);
  // null = CHUA xem truoc lan nao (hoac vua doi khoang ngay) -> nut "Xac nhan xuat" bi khoa
  const [ketQuaXemTruoc, setKetQuaXemTruoc] = useState<XemTruocXuatPhieuResponse | null>(null);

  const queryClient = useQueryClient();

  // ngay MUON NHAT duoc phep chon - dung de chan tren lich (disabledDate)
  const ngayMuonNhat = useMemo(() => dayjs().subtract(SO_NGAY_TRE_TOI_THIEU, "day").endOf("day"), []);

  const doiKhoangNgay = (values: [Dayjs | null, Dayjs | null] | null) => {
    if (values && values[0] && values[1]) {
      setKhoangNgay([values[0], values[1]]);
    }
    // XOA ket qua xem truoc khi doi khoang ngay: so lieu cu la cua khoang ngay CU, giu lai se cho phep bam
    // "Xac nhan xuat" voi con so cua mot khoang ngay khac han - kieu sai nguy hiem nhat o man hinh nay
    setKetQuaXemTruoc(null);
  };

  // tu_ngay/den_ngay gui dang "YYYY-MM-DD" (BE khai kieu `date` theo dac ta) - KHONG toISOString(). Day la
  // quy uoc cua /phieu va /jobs/runs; rieng /sessions moi nhan `datetime` (xem TienTrinhTable.tsx)
  const body = useMemo(
    () => ({ tu_ngay: khoangNgay[0].format("YYYY-MM-DD"), den_ngay: khoangNgay[1].format("YYYY-MM-DD") }),
    [khoangNgay]
  );

  const soNgayChon = khoangNgay[1].diff(khoangNgay[0], "day") + 1;
  const vuotSoNgay = soNgayChon > SO_NGAY_TOI_DA;

  const handleXemTruoc = async () => {
    setDangXemTruoc(true);
    setKetQuaXemTruoc(null);
    try {
      const res = await xemTruocXuatPhieuAuto(body);
      setKetQuaXemTruoc(res);
    } catch (error: any) {
      // 422 = vi pham rang buoc khoang ngay. Message cua BE da neu RO so lieu that (dang chon bao nhieu
      // ngay, gioi han bao nhieu) nen hien NGUYEN VAN, khong tu dien lai thanh cau chung chung
      if (error?.response?.status === 422) {
        message.warning(layMessageBe(error) || "Khoang ngay khong hop le");
      } else {
        message.error(layMessageBe(error) || "Xem truoc that bai");
      }
    } finally {
      setDangXemTruoc(false);
    }
  };

  const handleChayThat = useCallback(async () => {
    setDangChay(true);
    try {
      await chayXuatPhieuAuto(body);
      message.success("Da khoi chay job xuat phieu. Theo doi ket qua o bang Luot chay job ben duoi.");
      setMoModal(false);
      setKetQuaXemTruoc(null);
      // Nap lai CA 3 cho doc du lieu job/phieu:
      //  - ["r012","job-runs"]      : bang Luot chay job ngay duoi modal nay
      //  - ["r012","jobs"]          : dong canh bao JobHealthAlert (queryKey ["r012","jobs","runs",
      //    "health-check"]) - khong invalidate thi no van bao "job chua chay hom nay" ngay sau khi vua bam
      //  - ["r012","phieu-history"] : bang Phieu + 2 bang danh gia QoS/QoE trong modal chi tiet session
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["r012", "job-runs"] }),
        queryClient.invalidateQueries({ queryKey: ["r012", "jobs"] }),
        queryClient.invalidateQueries({ queryKey: ["r012", "phieu-history"] }),
      ]);
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 409) {
        message.warning("Job xuat phieu dang chay, thu lai sau");
      } else if (status === 422) {
        message.warning(layMessageBe(error) || "Khoang ngay khong hop le");
      } else {
        message.error(layMessageBe(error) || "Khoi chay job that bai");
      }
    } finally {
      setDangChay(false);
    }
  }, [body, queryClient]);

  // XAC NHAN LAN 2 - kem SO LUONG CU THE lay tu ket qua xem truoc. Con so nay la ly do chinh cua ca hop
  // thoai: "se gui phieu" nghe nhe nhang, "se gui 127 phieu" thi khong
  const handleXacNhanXuat = () => {
    const soPhieu = ketQuaXemTruoc?.tong_phieu_se_xuat ?? 0;
    Modal.confirm({
      title: "Xac nhan xuat phieu that",
      okText: "Xuat " + soPhieu + " phieu",
      okButtonProps: { danger: true },
      cancelText: "Huy",
      width: 540,
      content: (
        <p style={{ marginTop: 0 }}>
          Se <b>GUI {soPhieu} PHIEU THAT</b> len CTS. Khong the tu thu hoi, phai nho CTS xoa tay.
        </p>
      ),
      onOk: () => handleChayThat(),
    });
  };

  // useMemo: "?? []" tao mang MOI moi lan render, dua thang vao deps cua useMemo ben duoi se lam no tinh
  // lai lien tuc (eslint react-hooks bat duoc dung cho nay)
  const sessions = useMemo(() => ketQuaXemTruoc?.sessions ?? [], [ketQuaXemTruoc]);
  const tongPhieu = ketQuaXemTruoc?.tong_phieu_se_xuat ?? 0;
  // da xem truoc XONG va ket qua la 0 phieu - khac han "chua xem truoc" (ketQuaXemTruoc === null)
  const xemTruocRaKhong = ketQuaXemTruoc !== null && tongPhieu === 0;

  // lam phang cells cua moi session thanh 1 bang duy nhat - nhin het trong 1 lan thay vi mo tung session
  // KHONG dung Array.flatMap: tsconfig cua repo dang target es5 khong khai bao lib es2019 nen flatMap
  // khong ton tai o tang type (va co the thieu ca o runtime tren trinh duyet cu) - doi lib la anh huong
  // toan repo, trong khi 1 vong lap o day la du
  const dongChiTiet: DongChiTiet[] = useMemo(() => {
    const ds: DongChiTiet[] = [];
    sessions.forEach((s) => {
      (s.cells ?? []).forEach((c) => {
        ds.push({ ...c, cr_session_id: s.cr_session_id, tram_id: s.tram_id });
      });
    });
    return ds;
  }, [sessions]);

  const cotChiTiet: ColumnsType<DongChiTiet> = [
    { title: "Session", key: "session", render: (_, r) => "#" + r.cr_session_id },
    { title: "Ma tram", dataIndex: "tram_id", key: "tram_id" },
    { title: "Cell", dataIndex: "cell_name", key: "cell_name" },
    {
      title: "Nguon",
      key: "nguon",
      // dung CHUNG bang nhan voi cot "Nguon" cua bang phieu - 2 cho ghi khac nhau se lam nguoi doc tuong
      // day la 2 thu khac nhau
      render: (_, r) => <Tag>{NGUON_KHONG_DAT_LABELS[r.nguon] ?? r.nguon}</Tag>,
    },
    { title: "Do te", key: "do_te", render: (_, r) => (typeof r.do_te === "number" ? r.do_te.toFixed(2) : "-") },
    {
      title: "TB truoc",
      key: "avg_before",
      render: (_, r) => (typeof r.avg_before === "number" ? r.avg_before.toFixed(2) : "-"),
    },
    {
      title: "TB sau",
      key: "avg_after",
      render: (_, r) => (typeof r.avg_after === "number" ? r.avg_after.toFixed(2) : "-"),
    },
  ];

  return (
    <>
      <Button type="primary" onClick={() => setMoModal(true)} style={{ marginBottom: "1rem" }}>
        Chay job xuat phieu
      </Button>

      <Modal
        title="Chay job xuat phieu"
        open={moModal}
        onCancel={() => setMoModal(false)}
        width={900}
        // footer tu dat: 2 nut co dieu kien bat/tat rieng, khong dung duoc onOk mac dinh
        footer={[
          <Button key="dong" onClick={() => setMoModal(false)}>
            Dong
          </Button>,
          <Button key="xem" onClick={handleXemTruoc} loading={dangXemTruoc} disabled={vuotSoNgay}>
            Xem truoc
          </Button>,
          <Button
            key="chay"
            type="primary"
            danger
            loading={dangChay}
            // KHOA cho toi khi da xem truoc thanh cong VA co it nhat 1 phieu de xuat. Day la chan chot
            // chinh cua man hinh nay - xem comment dau file
            disabled={ketQuaXemTruoc === null || tongPhieu === 0}
            onClick={handleXacNhanXuat}
          >
            Xac nhan xuat
          </Button>,
        ]}
      >
        <div
          style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", marginBottom: "12px" }}
        >
          <span style={{ fontWeight: 600 }}>Khoang ngay CR:</span>
          <RangePicker
            value={khoangNgay}
            onChange={doiKhoangNgay}
            format="DD/MM/YYYY"
            allowClear={false}
            // chan ngay qua moi tren lich: session phai du so ngay thu thap KPI moi danh gia duoc
            disabledDate={(d) => d.isAfter(ngayMuonNhat)}
          />
          <span style={{ color: "#8c8c8c" }}>({soNgayChon} ngay)</span>
        </div>

        <Alert
          type="info"
          showIcon
          style={{ marginBottom: "12px" }}
          message={
            "Mac dinh la ngay hom nay - " +
            SO_NGAY_TRE_TOI_THIEU +
            " (dung khoang job tu dong quet hang ngay). Toi da " +
            SO_NGAY_TOI_DA +
            " ngay 1 lan."
          }
        />

        {vuotSoNgay && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: "12px" }}
            message={
              "Khoang dang chon " +
              soNgayChon +
              " ngay, vuot gioi han " +
              SO_NGAY_TOI_DA +
              " ngay. Thu hep lai truoc khi xem truoc."
            }
          />
        )}

        {ketQuaXemTruoc === null && !dangXemTruoc && (
          <Empty
            description="Bam [Xem truoc] de dem thu se xuat bao nhieu phieu. Chua xem truoc thi khong xuat duoc."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}

        {/* noi ro vi sao lau: endpoint dong bo quet tung cell cua tung session, co the mat vai phut */}
        {dangXemTruoc && (
          <Alert
            type="info"
            showIcon
            message="Dang dem thu... (quet tung cell cua tung session, co the mat vai phut)"
          />
        )}

        {xemTruocRaKhong && (
          <Alert type="warning" showIcon message="Khong co phieu nao de xuat trong khoang ngay nay" />
        )}

        {ketQuaXemTruoc !== null && tongPhieu > 0 && (
          <>
            <Typography.Paragraph style={{ marginBottom: "8px" }}>
              Se xuat <b>{tongPhieu} phieu</b> cho <b>{sessions.length} session</b>:
            </Typography.Paragraph>
            <ul style={{ marginTop: 0, marginBottom: "12px" }}>
              {sessions.map((s) => (
                <li key={s.cr_session_id}>
                  #{s.cr_session_id} tram {s.tram_id}
                  {s.tram_name ? " (" + s.tram_name + ")" : ""} - {s.so_cell_se_xuat} cell
                  {s.executed_at ? " - CR " + formatDateTime(s.executed_at) : ""}
                </li>
              ))}
            </ul>
            <Table
              rowKey={(r) => r.cr_session_id + "-" + r.cell_name}
              columns={cotChiTiet}
              dataSource={dongChiTiet}
              size="small"
              scroll={{ x: true }}
              pagination={dongChiTiet.length > 10 ? { pageSize: 10, showSizeChanger: false } : false}
            />
          </>
        )}
      </Modal>
    </>
  );
};

export default ChayJobModal;

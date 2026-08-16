// Bang danh gia QoE theo TUNG CELL cua 1 session (GET /sessions/{id}/qoe-cells).
//
// Dat CANH bang QoS (QosEvaluationTable) trong muc "Bang danh gia chi tiet" cua modal chi tiet session,
// chuyen qua lai bang Segmented [QoS] [QoE]. Cung 1 cau hoi "cac cell cua session nay tot len hay xau di",
// khac o NGUON SO LIEU: QoS tu CTS (do mang), QoE tu CEM (cam nhan nguoi dung).
//
// ==== KHONG CO NUT [Xuat phieu] O BANG NAY - CO CHU DICH ====
// Phieu SaveCellClm CHI duoc xuat theo ket luan QoS. QoE la thong tin THAM KHAO de nguoi truc hieu them
// boi canh (mang do tot len nhung nguoi dung van thay te, hoac nguoc lai), KHONG phai can cu xuat phieu.
// Neu de nut Xuat o day thi se co phieu duoc xuat theo tieu chi QoE - lech han quy trinh dang chay, va
// khong the doi chieu lai voi bang QoS von la noi duy nhat quyet dinh cell nao phai xuat.
import React from "react";
import { Alert, Empty, Spin, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { getQoeCells } from "../../services/R012Service";
import { QoeCellItem, QoeCellsResponse } from "../../types";

// Nhan + mau cho ket_qua. INSUFFICIENT_DATA dung mau XAM (default) chu KHONG phai do:
// CEM thung du lieu la tinh trang THUONG GAP va BINH THUONG voi QoE (vd toan bo du lieu thang 7 bi thieu),
// KHONG phai loi he thong va cung khong co gi de di sua. To do se bien mot bang du lieu binh thuong thanh
// mot bang toan bao dong gia, vai lan la nguoi dung khong con tin mau do o cac cot khac nua.
const KET_QUA_TAG: Record<string, { label: string; color: string }> = {
  PASS: { label: "DAT", color: "green" },
  FAIL: { label: "KHONG DAT", color: "red" },
  INSUFFICIENT_DATA: { label: "Khong du du lieu", color: "default" },
};

// hien so thuc 2 chu so thap phan, null -> "-" (khong hien "0.00": 0 diem va "khong co du lieu" la 2
// chuyen khac han nhau, gop lam mot se doc thanh "QoE bang 0" tuc la te nhat co the)
const soHoacGach = (v: number | null): string => (typeof v === "number" ? v.toFixed(2) : "-");

interface QoeCellsTableProps {
  sessionId: number;
  // CHI goi API khi nguoi dung that su dang xem tab QoE (xem ly do o comment prop nay tai EvaluationDetail):
  // 1 lan goi = ~14 request CEM ben BE
  enabled: boolean;
}

const QoeCellsTable: React.FC<QoeCellsTableProps> = ({ sessionId, enabled }) => {
  const { data, isLoading, isError, error } = useQuery<QoeCellsResponse>({
    queryKey: ["r012", "qoe-cells", sessionId],
    queryFn: () => getQoeCells(sessionId),
    enabled,
    // Ket qua nay TON KEM (~14 request CEM/lan) va gan nhu khong doi trong 1 phien lam viec: giu 5 phut de
    // dong modal roi mo lai, hoac chuyen QoS <-> QoE vai lan, khong ban lai chung ay request
    staleTime: 5 * 60 * 1000,
  });

  const columns: ColumnsType<QoeCellItem> = [
    { title: "Cell", dataIndex: "cell_name", key: "cell_name" },
    {
      title: "TB truoc CR",
      key: "avg_before",
      // Tooltip kem SO NGAY co du lieu that: "3.80" tinh tu 7 ngay va "3.80" tinh tu 1 ngay dang tin cay
      // rat khac nhau, ma nhin con so tran thi khong the biet duoc
      render: (_, row) => (
        <Tooltip title={`Tinh tu ${row.so_ngay_before} ngay co du lieu`}>{soHoacGach(row.avg_before)}</Tooltip>
      ),
    },
    {
      title: "TB sau CR",
      key: "avg_after",
      render: (_, row) => (
        <Tooltip title={`Tinh tu ${row.so_ngay_after} ngay co du lieu`}>{soHoacGach(row.avg_after)}</Tooltip>
      ),
    },
    {
      title: "Chenh lech",
      key: "delta",
      render: (_, row) => soHoacGach(row.delta),
    },
    {
      title: "Ket luan",
      key: "ket_qua",
      render: (_, row) => {
        // fallback cho gia tri ngoai 3 cai da biet: BE khai bao ket_qua la string tu do nen van co the
        // xuat hien gia tri moi - hien nguyen van con hon lam vo bang
        const tag = KET_QUA_TAG[row.ket_qua] ?? { label: row.ket_qua, color: "default" };
        return <Tag color={tag.color}>{tag.label}</Tag>;
      },
    },
    // ==== 2 cot RIENG cua QoE (bang QoS khong co) ====
    {
      // Diem TB co the dat trong khi van co ngay tut sau rat sau - cot nay de lo cai day
      title: "Diem thap nhat sau",
      key: "diem_thap_nhat_sau",
      render: (_, row) => soHoacGach(row.diem_thap_nhat_sau),
    },
    {
      title: "So ngay dat",
      key: "so_ngay_dat_sau",
      // hien dang "x/y" (so ngay dat / tong so ngay co du lieu sau CR): rieng "3 ngay dat" khong noi len
      // gi neu khong biet la dat 3/3 hay 3/14
      render: (_, row) => `${row.so_ngay_dat_sau ?? 0}/${row.so_ngay_after}`,
    },
  ];

  if (!enabled) {
    return null; // chua bam sang tab QoE - khong render, cung khong goi API
  }

  if (isLoading) {
    // noi ro vi sao cham: nguoi dung cho 10-20 giay ma khong biet dang cho gi se tuong treo va bam lung tung
    return <Spin tip="Dang tinh QoE tung cell (goi CEM cho tung cell nen hoi lau)..." />;
  }

  if (isError) {
    return (
      <Alert
        type="error"
        message="Khong tai duoc danh gia QoE"
        description={(error as Error)?.message || "Loi khong xac dinh"}
      />
    );
  }

  const rows = data?.data ?? [];
  if (rows.length === 0) {
    return <Empty description="Session nay khong co cell nao de danh gia QoE" />;
  }

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: "12px" }}
        message="QoE la thong tin tham khao - phieu chi xuat theo ket luan QoS (xem tab QoS ben canh)"
      />
      <Table
        rowKey="cell_name"
        columns={columns}
        dataSource={rows}
        size="small"
        // phan trang phia CLIENT: BE tra ve TOAN BO cell cua session trong 1 lan (khong co param page/size
        // cho endpoint nay), va so cell 1 session chi vai chuc - khong can phan trang server-side
        pagination={rows.length > 10 ? { pageSize: 10, showSizeChanger: false } : false}
      />
    </>
  );
};

export default QoeCellsTable;

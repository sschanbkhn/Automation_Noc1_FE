// Bang danh gia QoE theo TUNG CELL cua 1 session (GET /sessions/{id}/qoe-cells).
//
// Dat CANH bang QoS (QosEvaluationTable) trong muc "Bang danh gia chi tiet" cua modal chi tiet session,
// chuyen qua lai bang Segmented [QoS] [QoE]. Cung 1 cau hoi "cac cell cua session nay tot len hay xau di",
// khac o NGUON SO LIEU: QoS tu CTS (do mang), QoE tu CEM (cam nhan nguoi dung).
//
// ==== QoE NGANG HANG QoS (doi theo hop dong BE moi) ====
// Truoc day bang nay KHONG co nut xuat phieu va co 1 Alert ghi "QoE chi la thong tin tham khao" - da BO CA
// HAI: hop dong BE moi coi cell KHONG DAT o BAT KY chi so nao (QoS hoac QoE) deu phai xuat phieu, nen QoE
// khong con la thong tin ben le ma la mot can cu xuat phieu ngang hang QoS.
// Xuat phieu o day goi CHINH endpoint POST /api/v1/phieu cua bang QoS - KHONG co endpoint rieng cho QoE:
// 1 cell chi co 1 phieu bat ke phat hien ra no qua chi so nao (BE tu ghi nguon_khong_dat = QOS/QOE/CA_HAI).
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { OneLineCell } from "../../common/r012TableStyle";
import { Alert, Button, Empty, Modal, Pagination, Select, Spin, Tag, Tooltip, message } from "antd";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import * as XLSX from "xlsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQoeCells, getLichSuPhieu, xuatPhieu } from "../../services/R012Service";
import {
  QoeCellItem,
  QoeCellsResponse,
  PhieuHistoryItem,
  PhieuHistoryResponse,
  SessionAffectedCellItem,
} from "../../types";
import { R012_COLORS } from "../../theme";
import { moTaCuaSoBang, moTaSoNgay } from "../../helpers/cuaSoNgay";
import { SortableHeaderCell } from "../../common/SortableHeaderCell";
// dung LAI ham dat ten file export cua bang QoS (da export de khong phai nhan ban) - 2 bang xuat file
// cung mot quy uoc ten thi ghep bao cao moi de
import { formatTimestampForFileName } from "./QosEvaluationTable";

const columnHelper = createColumnHelper<QoeCellItem>();

// "" = "Tat ca" - giu DUNG quy uoc cua CONCLUSION_FILTER_OPTIONS ben bang QoS
const KET_QUA_FILTER_OPTIONS = [
  { value: "", label: "Tat ca ket luan" },
  { value: "PASS", label: "DAT" },
  { value: "FAIL", label: "KHONG DAT" },
  { value: "INSUFFICIENT_DATA", label: "Khong du du lieu" },
];

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

// trang thai nut Xuat phieu cua RIENG phien nay, khoa theo cell_name - giong het khuon PhieuState cua
// QosEvaluationTable. Day CHI la ket qua lan bam trong phien, KHONG phai nguon su that (nguon su that la
// phieuTuServer ben duoi)
interface PhieuState {
  loading: boolean;
  trangThai?: string;
  phieuId?: string | null;
}

interface QoeCellsTableProps {
  sessionId: number;
  // Dung de suy ra cot "Ma tram": endpoint /qoe-cells KHONG tra tram_id, nhung affected_cells cua session
  // (da co san o EvaluationDetail) co day du cap cell_name -> tram_id. Doi chieu qua day thay vi bo cot -
  // bang QoS co cot nay, thieu o QoE la 1 trong nhung diem lech giua 2 bang
  affectedCells: SessionAffectedCellItem[];
  // CHI goi API khi nguoi dung that su dang xem tab QoE (xem ly do o comment prop nay tai EvaluationDetail):
  // 1 lan goi = ~14 request CEM ben BE
  enabled: boolean;
}

const QoeCellsTable: React.FC<QoeCellsTableProps> = ({ sessionId, affectedCells, enabled }) => {
  const [phieuByCell, setPhieuByCell] = useState<Record<string, PhieuState>>({});
  // 3 state duoi day de KHOP voi bang QoS (truoc day bang QoE khong co bo loc/sort/phan trang nao)
  const [ketQuaFilter, setKetQuaFilter] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<QoeCellsResponse>({
    queryKey: ["r012", "qoe-cells", sessionId],
    queryFn: () => getQoeCells(sessionId),
    enabled,
    // Ket qua nay TON KEM (~14 request CEM/lan) va gan nhu khong doi trong 1 phien lam viec: giu 5 phut de
    // dong modal roi mo lai, hoac chuyen QoS <-> QoE vai lan, khong ban lai chung ay request
    staleTime: 5 * 60 * 1000,
  });

  // === NGUON SU THAT ve phieu da xuat - y het cach QosEvaluationTable lam ===
  // phieuByCell rong lai moi lan component mount (doi Segmented QoS<->QoE la mount lai), nen KHONG the dua
  // vao no de biet cell da co phieu chua: phieu co the do JOB TU DONG xuat, do nguoi khac xuat, hoac do
  // chinh minh xuat o lan mo Modal truoc - va quan trong nhat: co the do BANG QoS ben canh vua xuat.
  // queryKey dung TIEN TO ["r012","phieu-history"] Y HET QosEvaluationTable/PhieuHistoryTable -> 1 lan
  // invalidate la CA BA cho cung nap lai
  const { data: phieuData } = useQuery<PhieuHistoryResponse>({
    queryKey: ["r012", "phieu-history", sessionId, 1, 200, "danh-gia-qoe"],
    queryFn: () => getLichSuPhieu({ session_id: sessionId, page: 1, size: 200 }),
    enabled,
  });

  // cell_name -> dong phieu. Neu 1 cell co nhieu dong (thu lai nhieu lan), UU TIEN dong SUCCESS: chi can
  // TON TAI 1 phieu thanh cong la cell do coi nhu da xong, khong duoc de dong FAILED cu de len tren
  const phieuTuServer: Record<string, PhieuHistoryItem> = useMemo(() => {
    const map: Record<string, PhieuHistoryItem> = {};
    for (const p of phieuData?.data ?? []) {
      const dangCo = map[p.cell_name];
      if (!dangCo || (dangCo.trang_thai !== "SUCCESS" && p.trang_thai === "SUCCESS")) {
        map[p.cell_name] = p;
      }
    }
    return map;
  }, [phieuData?.data]);

  // Goi THAT POST /api/v1/phieu cho 1 cell - CUNG endpoint bang QoS dung, khong co endpoint rieng cho QoE.
  // setPhieuByCell({loading:true}) TRUOC khi await de Button disable NGAY (khong doi response), tranh bam 2
  // lan lien tiep tao phieu trung: day la WRITE API tao ban ghi THAT tren CTS
  const handleXuatPhieu = useCallback(
    async (cellName: string) => {
      setPhieuByCell((s) => ({ ...s, [cellName]: { loading: true } }));
      try {
        const resp = await xuatPhieu(sessionId, cellName);
        setPhieuByCell((s) => ({
          ...s,
          [cellName]: { loading: false, trangThai: resp.trang_thai, phieuId: resp.phieu_id },
        }));

        // moi trang_thai 1 y nghia rieng, KHONG gop chung 1 thong bao - giong QosEvaluationTable
        if (resp.trang_thai === "DAT_KHONG_XUAT") {
          message.info(resp.message || "Cell dat, khong can xuat");
        } else if (resp.trang_thai === "SUCCESS") {
          // cts_response=null la dau hieu DUY NHAT phan biet "da xuat truoc do" (BE khong goi lai CTS) voi
          // "vua xuat THAT xong lan nay" - CA HAI deu trang_thai=SUCCESS
          if (resp.cts_response === null) {
            message.info(`Da xuat truoc, ma phieu ${resp.phieu_id ?? "-"}`);
          } else {
            message.success(`Xuat phieu thanh cong, ma phieu: ${resp.phieu_id ?? "-"}`);
          }
        } else if (resp.trang_thai === "FAILED") {
          // hien NGUYEN VAN message tu CTS (vd "thieu WardCode"), KHONG dien giai lai - day la cach NOC
          // biet field bat buoc nao con thieu de bao CTS sua
          message.error(resp.cts_response?.message || "Xuat phieu that bai");
        }

        // Invalidate theo TIEN TO ["r012","phieu-history"] (khong kem sessionId/page): lam moi CA bang QoS
        // ben canh, CA muc 6 "Lich su phieu" trong cung modal, CA tab Lich su phieu - vi 1 cell chi co 1
        // phieu, xuat o day thi bang QoS cung phai thoi hien nut va chuyen sang Tag "Da xuat"
        await queryClient.invalidateQueries({ queryKey: ["r012", "phieu-history"] });
      } catch (err: any) {
        setPhieuByCell((s) => ({ ...s, [cellName]: { loading: false } }));
        // r012Request da tu hien 1 Notification loi chung qua interceptor - o day CHI them thong bao RIENG
        // ro rang hon theo status code, giong pattern cua QosEvaluationTable
        const status = err?.response?.status;
        if (status === 422) {
          message.warning("Chua du du lieu danh gia");
        } else if (status === 503) {
          message.error("Loi ket noi CTS");
        } else {
          message.error(
            err?.response?.data?.detail || err?.response?.data?.message || "Xuat phieu that bai, vui long thu lai"
          );
        }
      }
    },
    [sessionId, queryClient]
  );

  // Hop xac nhan - GIU NGUYEN cau canh bao dung nhu bang QoS va bang Lich su phieu. Cung mot hanh dong
  // khong hoan tac duoc thi 3 man hinh phai canh bao y het nhau, khong duoc noi nang hon/nhe hon
  const handleXacNhanXuat = useCallback(
    (cellName: string, ketQua: string) => {
      const phieu = phieuTuServer[cellName];
      const soLanThu = phieu?.so_lan_thu ?? 0;

      Modal.confirm({
        title: "Xac nhan xuat phieu",
        okText: "Xuat phieu",
        okButtonProps: { danger: true }, // do - hanh dong khong hoan tac duoc
        cancelText: "Huy",
        width: 520,
        content: (
          <div>
            <p style={{ marginTop: 0 }}>
              Se <b>GUI PHIEU THAT</b> len CTS cho cell <b>{cellName}</b>. Khong the tu thu hoi, phai nho CTS
              xoa tay.
            </p>
            {/* Cell CHUA ket luan duoc van cho xuat - phai noi ro dang xuat cho 1 cell may KHONG ket luan
                duoc, khong phai cho 1 cell da xac dinh la khong dat. Cau chu nay dung Y HET ben
                QosEvaluationTable: cung mot tinh huong thi 2 bang canh nhau phai canh bao giong nhau tung chu */}
            {ketQua === "INSUFFICIENT_DATA" && (
              <Alert
                type="warning"
                showIcon
                message="Cell nay chua ket luan duoc (khong du du lieu). Van xuat phieu de nguoi di kiem tra?"
              />
            )}
            {/* chi hien khi da tung thu that bai - thong tin nay LAM DOI quyet dinh: xuat tay lan nua rat co
                the hong y het, nen doc loi gan nhat truoc khi bam */}
            {soLanThu > 0 && (
              <Alert
                style={{ marginTop: ketQua === "INSUFFICIENT_DATA" ? "8px" : 0 }}
                type="warning"
                showIcon
                message={`Cell nay da thu ${soLanThu} lan that bai.`}
                description={
                  phieu?.error_message ? (
                    // nguyen van loi tu BE/CTS, khong dien giai lai
                    <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      Loi gan nhat: {phieu.error_message}
                    </span>
                  ) : undefined
                }
              />
            )}
          </div>
        ),
        onOk: () => handleXuatPhieu(cellName),
      });
    },
    [phieuTuServer, handleXuatPhieu]
  );

  // cell_name -> tram_id, suy tu affected_cells cua session (endpoint /qoe-cells khong tra tram_id)
  const tramTheoCell: Record<string, string | null> = useMemo(() => {
    const map: Record<string, string | null> = {};
    for (const c of affectedCells) {
      map[c.cell_name] = c.tram_id;
    }
    return map;
  }, [affectedCells]);

  const rows = useMemo(() => data?.data ?? [], [data?.data]);
  // cua so ngay do BE tra o cap response - xem helpers/cuaSoNgay.ts.
  // useMemo: object nay duoc dua vao deps cua useMemo "columns"; tao moi moi lan render se lam columns
  // tinh lai lien tuc
  const cuaSo = useMemo(
    () => (data ? { ngayCr: data.ngay_cr, before: data.cua_so_before, after: data.cua_so_after } : null),
    [data]
  );

  const filteredRows = useMemo(
    () => rows.filter((r) => !ketQuaFilter || r.ket_qua === ketQuaFilter),
    [rows, ketQuaFilter]
  );

  // ve trang 1 khi doi bo loc / khi co du lieu moi - dang o trang 5 roi loc con 2 dong thi se khong thay gi
  useEffect(() => {
    setPagination((pg) => ({ ...pg, pageIndex: 0 }));
  }, [ketQuaFilter, rows]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "stt",
        header: "STT",
        enableSorting: false, // STT chi la vi tri hien thi, sort cot nay khong co y nghia
        // tinh theo vi tri TUYET DOI (khong reset moi trang) - giong het bang QoS
        cell: (info) => pagination.pageIndex * pagination.pageSize + info.row.index + 1,
      }),
      columnHelper.accessor("cell_name", {
        header: "Cell",
        // OneLineCell: ellipsis + Tooltip lam duong lui cho ten dai bat thuong - xem
        // common/r012TableStyle.tsx
        cell: (info) => <OneLineCell value={info.getValue()} />,
      }),
      columnHelper.display({
        id: "tram_id",
        header: "Ma tram",
        enableSorting: false, // gia tri suy tu affected_cells, khong phai field cua /qoe-cells
        cell: (info) => tramTheoCell[info.row.original.cell_name] ?? "-",
      }),
      columnHelper.accessor("avg_before", {
        header: "TB truoc CR",
        // Tooltip kem SO NGAY co du lieu that: "3.80" tinh tu 7 ngay va "3.80" tinh tu 1 ngay dang tin cay
        // rat khac nhau, ma nhin con so tran thi khong the biet duoc
        cell: (info) => (
          <Tooltip title={`Tinh tu ${moTaSoNgay(info.row.original.so_ngay_before, cuaSo?.before)} co du lieu`}>
            {soHoacGach(info.getValue())}
          </Tooltip>
        ),
      }),
      columnHelper.accessor("avg_after", {
        header: "TB sau CR",
        cell: (info) => (
          <Tooltip title={`Tinh tu ${moTaSoNgay(info.row.original.so_ngay_after, cuaSo?.after)} co du lieu`}>
            {soHoacGach(info.getValue())}
          </Tooltip>
        ),
      }),
      columnHelper.accessor("delta", {
        header: "Chenh lech",
        cell: (info) => soHoacGach(info.getValue()),
      }),
      columnHelper.accessor("ket_qua", {
        header: "Ket luan",
        cell: (info) => {
          // fallback cho gia tri ngoai 3 cai da biet: BE khai bao ket_qua la string tu do nen van co the
          // xuat hien gia tri moi - hien nguyen van con hon lam vo bang
          const v = info.getValue();
          const tag = KET_QUA_TAG[v] ?? { label: v, color: "default" };
          return <Tag color={tag.color}>{tag.label}</Tag>;
        },
      }),
      // ==== 2 cot RIENG cua QoE (bang QoS khong co) ====
      columnHelper.accessor("diem_thap_nhat_sau", {
        // Diem TB co the dat trong khi van co ngay tut sau rat sau - cot nay de lo cai day
        header: "Diem thap nhat sau",
        cell: (info) => soHoacGach(info.getValue()),
      }),
      columnHelper.accessor("so_ngay_dat_sau", {
        header: "So ngay dat",
        // hien dang "x/y" (so ngay dat / tong so ngay co du lieu sau CR): rieng "3 ngay dat" khong noi len
        // gi neu khong biet la dat 3/3 hay 3/14
        cell: (info) => `${info.getValue() ?? 0}/${info.row.original.so_ngay_after}`,
      }),
      columnHelper.display({
        id: "thao_tac",
        header: "Thao tac",
        enableSorting: false, // cot hanh dong, khong co gia tri de sort
        cell: (info) => {
          const row = info.row.original;
          const state = phieuByCell[row.cell_name];
          const phieu = phieuTuServer[row.cell_name];

          // Uu tien hien trang thai DA XUAT bat ke ket_qua hien tai la gi, va SERVER dung truoc state cuc
          // bo: phieu DA TON TAI THAT tren CTS thi khong duoc "quen" chi vi bang tinh lai ket qua danh gia.
          // Cell nay co the da duoc xuat tu bang QoS ben canh (1 cell 1 phieu) - phai the hien duoc dieu do
          const daXuat = phieu?.trang_thai === "SUCCESS" || state?.trangThai === "SUCCESS";
          if (daXuat) {
            const maPhieu = state?.phieuId ?? phieu?.phieu_id;
            return <Tag color="blue">Da xuat{maPhieu ? ` (${maPhieu})` : ""}</Tag>;
          }

          // PASS -> AN nut han (chi hien gach) - giong het nhanh PASS cua bang QoS
          if (row.ket_qua === "PASS") {
            return <span style={{ color: "#bfbfbf" }}>-</span>;
          }

          // FAIL -> nut do. INSUFFICIENT_DATA -> van cho bam, mau thuong + Alert vang trong hop xac nhan
          const chuaKetLuan = row.ket_qua === "INSUFFICIENT_DATA";
          return (
            <Tooltip
              title={
                chuaKetLuan
                  ? "Chua du du lieu QoE de ket luan - van cho xuat, ban tu quyet dinh"
                  : "Cell khong dat QoE - xuat phieu"
              }
            >
              <Button
                size="small"
                type="primary"
                danger={!chuaKetLuan} // do cho cell da ket luan khong dat; cell chua ket luan de mau thuong
                loading={state?.loading}
                onClick={() => handleXacNhanXuat(row.cell_name, row.ket_qua)}
              >
                Xuat phieu
              </Button>
            </Tooltip>
          );
        },
      }),
    ],
    [pagination, tramTheoCell, phieuByCell, phieuTuServer, handleXacNhanXuat, cuaSo]
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // export theo DUNG danh sach dang hien (da loc theo Ket luan) - giong quy uoc cua bang QoS
  const handleExportExcel = () => {
    const exportRows = filteredRows.map((r) => ({
      cell_name: r.cell_name,
      ma_tram: tramTheoCell[r.cell_name] ?? "-",
      tb_truoc: r.avg_before ?? "",
      tb_sau: r.avg_after ?? "",
      chenh_lech: r.delta ?? "",
      ket_luan: (KET_QUA_TAG[r.ket_qua] ?? { label: r.ket_qua }).label,
      diem_thap_nhat_sau: r.diem_thap_nhat_sau ?? "",
      so_ngay_dat_sau: `${r.so_ngay_dat_sau ?? 0}/${r.so_ngay_after}`,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh gia QoE");
    XLSX.writeFile(workbook, `R012_danhgia_qoe_${sessionId}_${formatTimestampForFileName(new Date())}.xlsx`);
  };

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

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <h4 style={{ margin: "0 0 0.5rem 0" }}>Danh gia QoE toan bo cell cua session ({rows.length})</h4>
      {moTaCuaSoBang(cuaSo?.ngayCr, cuaSo?.before, cuaSo?.after) && (
        <div style={{ color: "#8c8c8c", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
          {moTaCuaSoBang(cuaSo?.ngayCr, cuaSo?.before, cuaSo?.after)}
        </div>
      )}

      {rows.length === 0 ? (
        <Empty description="Session nay khong co cell nao de danh gia QoE" />
      ) : (
        <>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
            {/* Bang QoS co nut "Tinh lai danh gia" vi phai bam moi chay. Bang QoE tu goi khi mo tab, nhung
                VAN can duong chay lai: du lieu duoc giu 5 phut (staleTime) nen sau khi CEM co them du lieu
                hoac sau khi vua xuat phieu, khong co nut nay thi phai dong/mo lai ca Modal moi thay cai moi */}
            <Button type="primary" onClick={() => refetch()} loading={isFetching}>
              Tinh lai danh gia
            </Button>
            <Select
              value={ketQuaFilter}
              onChange={setKetQuaFilter}
              options={KET_QUA_FILTER_OPTIONS}
              style={{ width: 180 }}
            />
            <Button onClick={handleExportExcel} disabled={filteredRows.length === 0}>
              Export Excel
            </Button>
          </div>

          <style>{`
            /* KHONG dat "width: 100%" - de bang giu do rong tu nhien theo noi dung roi CUON trong div
               overflow-x ben ngoai, dung nhu bang QoS (neu ep 100% thi cac cot bi bop lai qua nho) */
            .r012-qoe-eval-table { border-collapse: collapse; }
            .r012-qoe-eval-table thead th {
              text-align: left;
              padding: 10px 8px;
              background-color: ${R012_COLORS.tableHeaderBg};
              color: #ffffff;
              font-weight: 700;
              border: 1px solid ${R012_COLORS.primary};
            }
            .r012-qoe-eval-table tbody td {
              padding: 8px;
              border-bottom: 1px solid ${R012_COLORS.tableBorder};
            }
            .r012-qoe-eval-table tbody tr:nth-child(odd) { background-color: #ffffff; }
            .r012-qoe-eval-table tbody tr:nth-child(even) { background-color: ${R012_COLORS.tableRowAlt}; }
            .r012-qoe-eval-table tbody tr:hover { background-color: ${R012_COLORS.rowHoverBg}; }
          `}</style>

          {filteredRows.length === 0 ? (
            <div>Khong co cell nao khop bo loc dang chon.</div>
          ) : (
            <>
              {/* header dung whiteSpace:nowrap nen tong chieu rong that su cua bang co the vuot chieu rong
                  Modal (800px) -> boc overflow-x de bang CUON RIENG, khong lam vo layout Modal */}
              <div className="r012-table-scroll">
                <table className="r012-table r012-qoe-eval-table">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <SortableHeaderCell key={header.id} header={header} />
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                current={pagination.pageIndex + 1}
                pageSize={pagination.pageSize}
                total={filteredRows.length}
                showSizeChanger
                pageSizeOptions={[5, 10, 20, 50]}
                showTotal={(t) => `Tong ${t} cell`}
                onChange={(newPage, newSize) =>
                  setPagination({ pageIndex: newPage - 1, pageSize: newSize })
                }
                style={{ marginTop: "1rem" }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default QoeCellsTable;

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Pagination, Progress, Select, Tag, Tooltip, message } from "antd";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
// dung xlsx (SheetJS) co san trong package.json - KHONG cai them dependency moi, giong cac bang preview khac
import * as XLSX from "xlsx";
import { Dayjs } from "dayjs";
import { SessionAffectedCellItem } from "../../types";
import { R012_COLORS } from "../../theme";
import { SortableHeaderCell } from "../../common/SortableHeaderCell";
import { xuatPhieu } from "../../services/R012Service";
import { CellEvalRow, QosConclusion, evaluateAllAffectedCells, resolveQosWindow } from "./qosEvaluation";

// trang thai nut "Xuat phieu" theo TUNG cell (khoa theo cell_name) - RIENG voi CellEvalRow (ket qua danh
// gia QoS thuan, khong lien quan xuat phieu) vi 1 cell co the duoc TINH LAI danh gia (nut "Tinh lai danh
// gia") ma KHONG mat trang thai da xuat phieu truoc do - state nay PHAI song doc lap voi "rows"
interface PhieuState {
  loading: boolean;
  trangThai?: string; // SUCCESS/FAILED/DAT_KHONG_XUAT - gia tri THAT tu BE lan goi gan nhat
  phieuId?: string | null;
}

// dinh dang timestamp DDMMYYYY_HHMM cho ten file export - dung DUNG quy uoc da dung o cac bang preview khac
function formatTimestampForFileName(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const dd = pad(date.getDate());
  const mm = pad(date.getMonth() + 1);
  const yyyy = date.getFullYear();
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${dd}${mm}${yyyy}_${hh}${min}`;
}

// SUA (yeu cau truc tiep user, khop tieu chi MOI phia BE) - BO "ACTION_TAG"/"ACTION_FILTER_OPTIONS" rieng
// (Tieu chi 2 "Can xu ly" cu) - chi con 1 Tag/filter "Ket luan" DUY NHAT, dua tren chenh lech TB truoc/sau.
const CONCLUSION_TAG: Record<QosConclusion, { label: string; color: string }> = {
  PASS: { label: "DAT", color: "green" },
  FAIL: { label: "KHONG DAT", color: "red" },
  INSUFFICIENT: { label: "Chua du du lieu", color: "default" },
};

// "" nghia la "Tat ca" - khong loc theo Ket luan, giong quy uoc STATUS_FILTER_OPTIONS o SessionHistoryList.tsx
const CONCLUSION_FILTER_OPTIONS = [
  { value: "", label: "Tat ca ket luan" },
  { value: "PASS", label: "DAT" },
  { value: "FAIL", label: "KHONG DAT" },
  { value: "INSUFFICIENT", label: "Chua du du lieu" },
];

const columnHelper = createColumnHelper<CellEvalRow>();

interface QosEvaluationTableProps {
  sessionId: number;
  affectedCells: SessionAffectedCellItem[];
  crDateGmt7: Dayjs;
}

// bang danh gia QoS cho TOAN BO affected_cells cua session, theo 1 TIEU CHI DUY NHAT (khop BE). NUT bam thu
// cong (khong tu chay khi mount) vi co the phai goi TOI 47 request QoS (xem qosEvaluation.ts::
// evaluateAllAffectedCells, gioi han 5 request dong thoi/lan) - de NOC chu dong quyet dinh luc nao can
// chay, tranh ton tai nguyen moi lan panel nay duoc render/mo lai
const QosEvaluationTable: React.FC<QosEvaluationTableProps> = ({ sessionId, affectedCells, crDateGmt7 }) => {
  const [rows, setRows] = useState<CellEvalRow[] | null>(null); // null = chua chay danh gia lan nao
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  // CHI con 1 bo loc (Ket luan) - da bo "Can xu ly" rieng (gop lam 1 tieu chi duy nhat, khop BE)
  const [conclusionFilter, setConclusionFilter] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  // Viec 3: phan trang mac dinh 5 dong/trang (giong 3 bang preview AffectedStationsTable/AffectedCellsTable/
  // CrCellsTable da lam) - bang nay co the toi 47 dong, chua co phan trang truoc day se rat dai
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  // KHOI 4b/5 - trang thai nut Xuat phieu, khoa theo cell_name (khong phai theo hang trong bang, vi sort/
  // filter/phan trang co the doi vi tri hang nhung cell_name la khoa nghiep vu on dinh)
  const [phieuByCell, setPhieuByCell] = useState<Record<string, PhieuState>>({});

  const handleRunEvaluation = async () => {
    setIsRunning(true);
    setProgress({ done: 0, total: affectedCells.length });
    const window = resolveQosWindow(crDateGmt7);
    const result = await evaluateAllAffectedCells(affectedCells, crDateGmt7, window, (done, total) =>
      setProgress({ done, total })
    );
    setRows(result);
    setIsRunning(false);
  };

  // KHOI 4b/5 (yeu cau truc tiep user) - goi POST /api/v1/phieu cho 1 cell. setPhieuByCell({loading:true})
  // TRUOC khi await - Button dung gia tri nay de disable NGAY lap tuc (khong doi response), tranh NOC bam 2
  // lan lien tiep tao phieu trung (day la WRITE API tao ban ghi that tren TTS, khac cac nut GET/tinh toan
  // thuan trong module nay).
  // useCallback (khong phai function thuong) - "columns" useMemo (duoi day) can THAM CHIEU ON DINH cua ham
  // nay trong deps array, neu khong se bi warning "makes deps change moi render" (da gap khi build lan dau)
  const handleXuatPhieu = useCallback(async (cellName: string) => {
    setPhieuByCell((s) => ({ ...s, [cellName]: { loading: true } }));
    try {
      const resp = await xuatPhieu(sessionId, cellName);
      setPhieuByCell((s) => ({
        ...s,
        [cellName]: { loading: false, trangThai: resp.trang_thai, phieuId: resp.phieu_id },
      }));

      // BUOC 3 (dac ta KHOI 4b/5) - moi trang_thai 1 mau/y nghia rieng, KHONG gop chung 1 thong bao:
      if (resp.trang_thai === "DAT_KHONG_XUAT") {
        message.info(resp.message || "Cell dat, khong can xuat");
      } else if (resp.trang_thai === "SUCCESS") {
        // cts_response=null la dau hieu DUY NHAT phan biet "da xuat truoc do" (BE khong goi lai CTS, xem
        // api/routers/phieu.py) voi "vua xuat THAT xong lan nay" (BE co goi CTS that, cts_response co gia
        // tri) - CA HAI deu trang_thai=SUCCESS, khong the phan biet bang trang_thai don thuan
        if (resp.cts_response === null) {
          message.info(`Da xuat truoc, ma phieu ${resp.phieu_id ?? "-"}`);
        } else {
          message.success(`Xuat phieu thanh cong, ma phieu: ${resp.phieu_id ?? "-"}`);
        }
      } else if (resp.trang_thai === "FAILED") {
        // QUAN TRONG (BUOC 3 dac ta) - hien NGUYEN VAN cts_response.message tu CTS (vd "thieu WardCode"),
        // KHONG tu dien lai/che giau - day la cach NOC biet field bat buoc nao con thieu de bao CTS sua.
        message.error(resp.cts_response?.message || "Xuat phieu that bai");
      }
    } catch (error: any) {
      setPhieuByCell((s) => ({ ...s, [cellName]: { loading: false } }));
      // r012Request (services/r012Request.ts) DA tu hien 1 Notification loi chung qua interceptor - o day
      // CHI them thong bao RIENG, RO RANG hon theo dung status code (422/503) nhu BUOC 3 yeu cau, giong
      // pattern "interceptor + component tu hien them" da co san o ConfirmTriggerModal.tsx.
      const status = error?.response?.status;
      if (status === 422) {
        message.warning("Chua du du lieu danh gia");
      } else if (status === 503) {
        message.error("Loi ket noi CTS");
      } else {
        message.error(error?.response?.data?.detail || error?.response?.data?.message || "Xuat phieu that bai, vui long thu lai");
      }
    }
    // sessionId la prop, khong doi trong 1 lan mo bang - deps [] + sessionId la du (khong can setPhieuByCell,
    // setState function tu React LUON on dinh giua cac render, ESLint khong yeu cau khai bao)
  }, [sessionId]);

  const filteredRows = useMemo(() => {
    if (rows === null) return [];
    return rows.filter((r) => !conclusionFilter || r.conclusion === conclusionFilter);
  }, [rows, conclusionFilter]);

  // reset ve trang 1 khi doi bo loc/chay lai danh gia - tranh dung o trang cu co the vuot qua so trang cua
  // danh sach da loc moi (vd dang o trang 5 roi loc con 2 dong thi se khong thay gi)
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [conclusionFilter, rows]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "stt",
        header: "STT",
        enableSorting: false, // STT chi la vi tri hien thi, sort cot nay khong co y nghia
        // STT tinh theo vi tri TUYET DOI (khong reset moi trang) - info.row.index la vi tri TRONG TRANG
        // hien tai (getPaginationRowModel), nen phai cong them offset cua trang
        cell: (info) => pagination.pageIndex * pagination.pageSize + info.row.index + 1,
      }),
      columnHelper.accessor("cell_name", { header: "Cell" }),
      columnHelper.accessor("tram_id", {
        header: "Ma tram",
        cell: (info) => info.getValue() ?? "-",
      }),
      columnHelper.accessor("avgBefore", {
        header: "TB truoc CR",
        cell: (info) => {
          const v = info.getValue();
          return v !== null ? v.toFixed(2) : "-";
        },
      }),
      columnHelper.accessor("avgAfter", {
        header: "TB sau CR",
        cell: (info) => {
          const v = info.getValue();
          return v !== null ? v.toFixed(2) : "-";
        },
      }),
      columnHelper.accessor("diff", {
        header: "Chenh lech",
        cell: (info) => {
          const v = info.getValue();
          return v !== null ? v.toFixed(2) : "-";
        },
      }),
      columnHelper.accessor("conclusion", {
        header: "Ket luan",
        // sort theo GIA TRI GOC "PASS"/"FAIL"/"INSUFFICIENT" (khong phai nhan tieng Viet hien thi) - don gian,
        // nhat quan voi cach cac bang khac trong module sort theo gia tri field goc thay vi nhan da dich
        cell: (info) => {
          const v = info.getValue();
          return <Tag color={CONCLUSION_TAG[v].color}>{CONCLUSION_TAG[v].label}</Tag>;
        },
      }),
      columnHelper.display({
        id: "xuat_phieu",
        header: "Xuat phieu",
        enableSorting: false, // cot hanh dong, khong co gia tri de sort
        cell: (info) => {
          const row = info.row.original;
          const state = phieuByCell[row.cell_name];

          // Uu tien hien trang thai DA XUAT (SUCCESS) bat ke conclusion hien tai la gi - "Tinh lai danh
          // gia" (nut o tren) co the doi conclusion cell nay sang PASS/INSUFFICIENT sau khi da xuat phieu,
          // nhung PHIEU DA TON TAI THAT tren TTS thi khong duoc "quen" chi vi tinh lai danh gia
          if (state?.trangThai === "SUCCESS") {
            return <Tag color="blue">Da xuat{state.phieuId ? ` (${state.phieuId})` : ""}</Tag>;
          }

          // CHI cell KHONG DAT (FAIL) moi duoc xuat phieu (dung BUOC 3 KHOI 4a/5 phia BE: "cell duoc xuat
          // phieu = cell KHONG DAT"). PASS/INSUFFICIENT -> disable + tooltip ly do, KHONG an nut de NOC
          // hieu VI SAO khong bam duoc (thay vi lam nhu cot nay khong ton tai o dong do)
          if (row.conclusion !== "FAIL") {
            return (
              <Tooltip
                title={
                  row.conclusion === "PASS"
                    ? "Cell dat tieu chi QoS (chenh lech <= 0.2) - khong can xuat phieu"
                    : "Chua du du lieu (>=5/7 ngay moi phia) de danh gia - khong the xuat phieu"
                }
              >
                <Button size="small" disabled>
                  Xuat phieu
                </Button>
              </Tooltip>
            );
          }

          return (
            <Button
              size="small"
              type="primary"
              danger
              loading={state?.loading}
              onClick={() => handleXuatPhieu(row.cell_name)}
            >
              Xuat phieu
            </Button>
          );
        },
      }),
    ],
    [pagination, phieuByCell, handleXuatPhieu]
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

  // export theo DUNG danh sach dang hien (da loc theo Ket luan) - NOC loc "KHONG DAT" roi export se ra dung
  // file chi chua cell khong dat, hop ly hon export ca 47 cell moi lan
  const handleExportExcel = () => {
    const exportRows = filteredRows.map((r) => ({
      cell_name: r.cell_name,
      ma_tram: r.tram_id ?? "-",
      tb_truoc: r.avgBefore ?? "",
      tb_sau: r.avgAfter ?? "",
      chenh_lech: r.diff ?? "",
      ket_luan: CONCLUSION_TAG[r.conclusion].label,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh gia QoS");
    XLSX.writeFile(workbook, `R012_danhgia_qos_${sessionId}_${formatTimestampForFileName(new Date())}.xlsx`);
  };

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <h4 style={{ margin: "0 0 0.5rem 0" }}>Danh gia QoS toan bo cell bi anh huong ({affectedCells.length})</h4>

      {affectedCells.length === 0 ? (
        <div style={{ color: "#8c8c8c" }}>
          Session nay chua co affected_cells (session cu truoc 22072026 khong co du lieu nay - xem
          types/index.ts::SessionAffectedCellItem).
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
            <Button type="primary" onClick={handleRunEvaluation} loading={isRunning}>
              {rows === null ? "Tinh danh gia cho tat ca cell" : "Tinh lai danh gia"}
            </Button>
            {rows !== null && (
              <>
                <Select
                  value={conclusionFilter}
                  onChange={setConclusionFilter}
                  options={CONCLUSION_FILTER_OPTIONS}
                  style={{ width: 180 }}
                />
                <Button onClick={handleExportExcel} disabled={filteredRows.length === 0}>
                  Export Excel
                </Button>
              </>
            )}
          </div>

          {/* tien do khi dang chay - hien "da xong X/47" thay vi 1 spinner mo ho, vi co the mat vai chuc
              giay (47 cell / 5 request-dong-thoi-moi-lan ~ 10 nhom noi tiep) */}
          {isRunning && (
            <Progress
              percent={progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0}
              format={() => `${progress.done}/${progress.total} cell`}
              style={{ marginBottom: "1rem", maxWidth: "400px" }}
            />
          )}

          {rows !== null && !isRunning && (
            <>
              <style>{`
                /* BO "width: 100%" (ban cu) - ep bang co dung 100% chieu rong container se lam cac cot bi
                   BOP lai qua nho, MAU THUAN voi div overflow-x:auto vua boc ben ngoai (muon bang GIU DUNG
                   do rong tu nhien theo noi dung roi CUON, khong bop) */
                .r012-qos-eval-table { border-collapse: collapse; white-space: nowrap; }
                .r012-qos-eval-table thead th {
                  text-align: left;
                  padding: 10px 8px;
                  background-color: ${R012_COLORS.tableHeaderBg};
                  color: #ffffff;
                  font-weight: 700;
                  border: 1px solid ${R012_COLORS.primary};
                }
                .r012-qos-eval-table tbody td {
                  padding: 8px;
                  border-bottom: 1px solid ${R012_COLORS.tableBorder};
                }
                .r012-qos-eval-table tbody tr:nth-child(odd) { background-color: #ffffff; }
                .r012-qos-eval-table tbody tr:nth-child(even) { background-color: ${R012_COLORS.tableRowAlt}; }
                .r012-qos-eval-table tbody tr:hover { background-color: ${R012_COLORS.rowHoverBg}; }
              `}</style>
              {filteredRows.length === 0 ? (
                <div>Khong co cell nao khop bo loc dang chon.</div>
              ) : (
                // header dung "whiteSpace: nowrap" (SortableHeaderCell) nen tong chieu rong THAT SU cua bang
                // co the vuot qua chieu rong Modal (800px, xem SessionHistoryList.tsx) -> bang se TRAN ra
                // ngoai neu khong gioi han. Boc trong div overflow-x:auto de bang CUON NGANG rieng trong
                // khung cua no, KHONG lam vo layout Modal ben ngoai
                <div style={{ overflowX: "auto" }}>
                  <table className="r012-qos-eval-table">
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
              )}
              {/* Viec 3: Pagination cua antd chi la UI dieu khien - state that nam trong TanStack Table
                  (bien "pagination"), giong cach da lam o AffectedStationsTable.tsx/AffectedCellsTable.tsx/
                  CrCellsTable.tsx. Mac dinh 5 dong/trang theo yeu cau */}
              {filteredRows.length > 0 && (
                <Pagination
                  current={pagination.pageIndex + 1}
                  pageSize={pagination.pageSize}
                  total={filteredRows.length}
                  pageSizeOptions={["5", "10", "20", "50"]}
                  showSizeChanger
                  onChange={(newPage, newPageSize) => {
                    setPagination({ pageIndex: newPage - 1, pageSize: newPageSize });
                  }}
                  style={{ marginTop: "1rem" }}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default QosEvaluationTable;

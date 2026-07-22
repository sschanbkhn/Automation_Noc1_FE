import React, { useMemo, useState } from "react";
import { Button, Progress, Select, Tag } from "antd";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
// dung xlsx (SheetJS) co san trong package.json - KHONG cai them dependency moi, giong cac bang preview khac
import * as XLSX from "xlsx";
import { Dayjs } from "dayjs";
import { SessionAffectedCellItem } from "../../types";
import { R012_COLORS } from "../../theme";
import { SortableHeaderCell } from "../../common/SortableHeaderCell";
import {
  CellEvalRow,
  QosConclusion,
  QosActionNeeded,
  QOS_BAD_DAY_THRESHOLD,
  evaluateAllAffectedCells,
  resolveQosWindow,
} from "./qosEvaluation";

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

// Viec 4: 2 tieu chi DOC LAP, moi tieu chi 1 bo Tag/filter rieng - KHONG con gop chung 1 "trang thai" nhu ban cu
const CONCLUSION_TAG: Record<QosConclusion, { label: string; color: string }> = {
  PASS: { label: "DAT", color: "green" },
  FAIL: { label: "KHONG DAT", color: "red" },
  INSUFFICIENT: { label: "Chua du du lieu", color: "default" },
};

const ACTION_TAG: Record<QosActionNeeded, { label: string; color: string }> = {
  YES: { label: "Can xu ly", color: "red" },
  NO: { label: "Khong can xu ly", color: "green" },
  INSUFFICIENT: { label: "Chua du du lieu", color: "default" },
};

// "" nghia la "Tat ca" - khong loc theo tieu chi do, giong quy uoc STATUS_FILTER_OPTIONS o SessionHistoryList.tsx
const CONCLUSION_FILTER_OPTIONS = [
  { value: "", label: "Tat ca ket luan" },
  { value: "PASS", label: "DAT" },
  { value: "FAIL", label: "KHONG DAT" },
  { value: "INSUFFICIENT", label: "Chua du du lieu" },
];

const ACTION_FILTER_OPTIONS = [
  { value: "", label: "Tat ca (can xu ly)" },
  { value: "YES", label: "Can xu ly" },
  { value: "NO", label: "Khong can xu ly" },
  { value: "INSUFFICIENT", label: "Chua du du lieu" },
];

const columnHelper = createColumnHelper<CellEvalRow>();

interface QosEvaluationTableProps {
  sessionId: number;
  affectedCells: SessionAffectedCellItem[];
  crDateGmt7: Dayjs;
}

// bang danh gia QoS cho TOAN BO affected_cells cua session, theo 2 TIEU CHI DOC LAP (Viec 4). NUT bam thu
// cong (khong tu chay khi mount) vi co the phai goi TOI 47 request QoS (xem qosEvaluation.ts::
// evaluateAllAffectedCells, gioi han 5 request dong thoi/lan) - de NOC chu dong quyet dinh luc nao can
// chay, tranh ton tai nguyen moi lan panel nay duoc render/mo lai
const QosEvaluationTable: React.FC<QosEvaluationTableProps> = ({ sessionId, affectedCells, crDateGmt7 }) => {
  const [rows, setRows] = useState<CellEvalRow[] | null>(null); // null = chua chay danh gia lan nao
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  // 2 bo loc DOC LAP - NOC co the loc theo Ket luan VA theo Can xu ly CUNG LUC (vd xem cell "DAT" nhung
  // "Can xu ly" - truong hop hiem nhung co the xay ra vi 2 tieu chi tinh tren 2 tap du lieu khac nhau)
  const [conclusionFilter, setConclusionFilter] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);

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

  const filteredRows = useMemo(() => {
    if (rows === null) return [];
    return rows.filter(
      (r) => (!conclusionFilter || r.conclusion === conclusionFilter) && (!actionFilter || r.actionNeeded === actionFilter)
    );
  }, [rows, conclusionFilter, actionFilter]);

  const columns = useMemo(
    () => [
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
      columnHelper.accessor("badDaysAfter", {
        header: `So ngay khong dat (QoS<=${QOS_BAD_DAY_THRESHOLD})`,
        // hien dang "X/7" de NOC biet NGAY vi sao Ket luan la DAT/KHONG DAT, khong phai chi hien so tron
        cell: (info) => {
          const v = info.getValue();
          return v !== null ? `${v}/7 ngay` : "-";
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
      columnHelper.accessor("actionNeeded", {
        header: "Can xu ly",
        cell: (info) => {
          const v = info.getValue();
          return <Tag color={ACTION_TAG[v].color}>{ACTION_TAG[v].label}</Tag>;
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // export theo DUNG danh sach dang hien (da loc theo ca 2 bo loc) - NOC loc "Can xu ly" roi export se ra
  // dung file chi chua cell can xu ly, hop ly hon export ca 47 cell moi lan
  const handleExportExcel = () => {
    const exportRows = filteredRows.map((r) => ({
      cell_name: r.cell_name,
      ma_tram: r.tram_id ?? "-",
      tb_truoc: r.avgBefore ?? "",
      tb_sau: r.avgAfter ?? "",
      chenh_lech: r.diff ?? "",
      so_ngay_khong_dat: r.badDaysAfter !== null ? `${r.badDaysAfter}/7` : "-",
      ket_luan: CONCLUSION_TAG[r.conclusion].label,
      can_xu_ly: ACTION_TAG[r.actionNeeded].label,
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
                <Select
                  value={actionFilter}
                  onChange={setActionFilter}
                  options={ACTION_FILTER_OPTIONS}
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
                /* Viec 4: BO "width: 100%" (ban cu) - ep bang co dung 100% chieu rong container se lam
                   cac cot bi BOP lai qua nho khi co qua nhieu cot (8 cot), MAU THUAN voi div overflow-x:auto
                   vua boc ben ngoai (muon bang GIU DUNG do rong tu nhien theo noi dung roi CUON, khong bop) */
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
                // Viec 4: bang nay co TOI 8 cot (Cell/Ma tram/TB truoc/TB sau/Chenh lech/So ngay khong dat/
                // Ket luan/Can xu ly), header lai "whiteSpace: nowrap" (SortableHeaderCell) nen tong chieu
                // rong THAT SU cua bang de vuot qua chieu rong Modal (800px, xem SessionHistoryList.tsx) ->
                // bang se TRAN ra ngoai neu khong gioi han. Boc trong div overflow-x:auto de bang CUON
                // NGANG rieng trong khung cua no, KHONG lam vo layout Modal ben ngoai
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
            </>
          )}
        </>
      )}
    </div>
  );
};

export default QosEvaluationTable;

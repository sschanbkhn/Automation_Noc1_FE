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
import { CellEvalRow, QosEvalVerdict, evaluateAllAffectedCells, resolveQosWindow } from "./qosEvaluation";

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

const VERDICT_TAG: Record<QosEvalVerdict, { label: string; color: string }> = {
  PASS: { label: "DAT", color: "green" },
  FAIL: { label: "KHONG DAT", color: "red" },
  INSUFFICIENT: { label: "Chua du du lieu", color: "default" },
};

// "" nghia la "Tat ca" - khong loc theo trang thai, giong quy uoc STATUS_FILTER_OPTIONS o SessionHistoryList.tsx
const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tat ca" },
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

// bang danh gia DAT/KHONG DAT cho TOAN BO affected_cells cua session - tuong ung Buoc 4 Phan 3. NUT bam
// thu cong (khong tu chay khi mount) vi Buoc 4 co the phai goi TOI 47 request QoS (xem qosEvaluation.ts::
// evaluateAllAffectedCells, gioi han 5 request dong thoi/lan) - de NOC chu dong quyet dinh luc nao can
// chay, tranh ton tai nguyen moi lan panel nay duoc render/mo lai
const QosEvaluationTable: React.FC<QosEvaluationTableProps> = ({ sessionId, affectedCells, crDateGmt7 }) => {
  const [rows, setRows] = useState<CellEvalRow[] | null>(null); // null = chua chay danh gia lan nao
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  const [statusFilter, setStatusFilter] = useState<string>("");
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
    if (!statusFilter) return rows;
    return rows.filter((r) => r.verdict === statusFilter);
  }, [rows, statusFilter]);

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
      columnHelper.accessor("verdict", {
        header: "Trang thai",
        // sort theo GIA TRI GOC "PASS"/"FAIL"/"INSUFFICIENT" (khong phai nhan tieng Viet hien thi) - don gian,
        // nhat quan voi cach cac bang khac trong module sort theo gia tri field goc thay vi nhan da dich
        cell: (info) => {
          const v = info.getValue();
          return <Tag color={VERDICT_TAG[v].color}>{VERDICT_TAG[v].label}</Tag>;
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

  // export theo DUNG danh sach dang hien (da loc theo statusFilter) - NOC loc "KHONG DAT" roi export se ra
  // dung file chi chua cell KHONG DAT, hop ly hon export ca 47 cell moi lan
  const handleExportExcel = () => {
    const exportRows = filteredRows.map((r) => ({
      cell_name: r.cell_name,
      ma_tram: r.tram_id ?? "-",
      tb_truoc: r.avgBefore ?? "",
      tb_sau: r.avgAfter ?? "",
      chenh_lech: r.diff ?? "",
      trang_thai: VERDICT_TAG[r.verdict].label,
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
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={STATUS_FILTER_OPTIONS}
                  style={{ width: 160 }}
                />
                <Button onClick={handleExportExcel} disabled={filteredRows.length === 0}>
                  Export Excel
                </Button>
              </>
            )}
          </div>

          {/* tien do khi dang chay - hien "da xong X/47" thay vi 1 spinner mo ho, vi Buoc 4 co the mat vai
              chuc giay (47 cell / 5 request-dong-thoi-moi-lan ~ 10 nhom noi tiep) */}
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
                .r012-qos-eval-table { width: 100%; border-collapse: collapse; }
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
                <div>Khong co cell nao khop bo loc trang thai dang chon.</div>
              ) : (
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
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default QosEvaluationTable;

import React, { useMemo } from "react";
import { Button } from "antd";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
// dung xlsx (SheetJS) co san trong package.json (^0.17.5), giong cach CellParamsByHuong.tsx va
// AffectedStationsTable.tsx da dung - KHONG cai them dependency moi
import * as XLSX from "xlsx";
import { PreviewCrResponse } from "../../types";
import { R012_COLORS } from "../../theme";

// dinh dang timestamp DDMMYYYY_HHMM cho ten file export - dung DUNG quy uoc da dung o CellParamsByHuong.tsx
// va AffectedStationsTable.tsx. KHONG tach thanh helper dung chung vi ham chi 8 dong, tach som se la
// premature abstraction cho 1 ham qua nho
function formatTimestampForFileName(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const dd = pad(date.getDate());
  const mm = pad(date.getMonth() + 1);
  const yyyy = date.getFullYear();
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${dd}${mm}${yyyy}_${hh}${min}`;
}

interface CellRow {
  cell_name: string;
  tram_id: string; // ma tram cha - tram_id cua tram_lan_can chua cell nay (co the la chinh tram_goc, xem comment ben duoi)
  huong_id: string | null;
  action_type: string | null;
  priority: number | null;
  rsboost_cu: number | null;
  rsboost_moi: number | null;
  qrxlevmin_cu: number | null;
  qrxlevmin_moi: number | null;
}

const columnHelper = createColumnHelper<CellRow>();

interface AffectedCellsTableProps {
  previewData: PreviewCrResponse;
}

// bang gom TAT CA cell bi anh huong (phang tu moi tram trong tram_lan_can) - tuong ung Buoc 2 tinh nang
// preview lan 2. Component nay CHI nhan previewData da co san tu state cua TacDongTram.tsx (khong tu goi API)
const AffectedCellsTable: React.FC<AffectedCellsTableProps> = ({ previewData }) => {
  // KHAC voi AffectedStationsTable: o day KHONG loc bo tram_goc khoi tram_lan_can truoc khi gom cell.
  // Ly do: tram_goc chi lap lai 1 LAN DUY NHAT trong tram_lan_can (da xac nhan qua goi that), nen cells cua
  // no chi duoc dem 1 lan - khong bi trung lap. Va ve nghiep vu, bang cell PHAI hien ca cell cua chinh
  // tram_goc (tram bi tat) chu khong chi cell cua cac tram lan can xung quanh, moi la day du "TAT CA cell
  // bi anh huong" dung nhu yeu cau
  // dung reduce+forEach thay vi flatMap - tsconfig.json target "es5" khong co san flatMap (ES2019),
  // dung flatMap se loi bien dich TS2550
  const rows: CellRow[] = useMemo(
    () =>
      previewData.tram_lan_can.reduce<CellRow[]>((acc, t) => {
        t.cells.forEach((c) => {
          acc.push({
            cell_name: c.cell_name,
            tram_id: t.tram_id,
            huong_id: c.huong_id,
            action_type: c.action_type,
            priority: c.priority,
            rsboost_cu: c.rsboost_cu,
            rsboost_moi: c.rsboost_moi,
            qrxlevmin_cu: c.qrxlevmin_cu,
            qrxlevmin_moi: c.qrxlevmin_moi,
          });
        });
        return acc;
      }, []),
    [previewData]
  );

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "stt",
        header: "STT",
        cell: (info) => info.row.index + 1, // so thu tu tinh theo vi tri dong, khong phai du lieu tu BE
      }),
      columnHelper.accessor("cell_name", { header: "Cell" }),
      columnHelper.accessor("tram_id", { header: "Ma tram" }),
      columnHelper.accessor("huong_id", {
        header: "Huong",
        cell: (info) => info.getValue() ?? "-", // co the null theo schema PreviewCellItem
      }),
      columnHelper.accessor("action_type", {
        header: "Hanh dong",
        cell: (info) => info.getValue() ?? "-", // rsboost / qrxlevmin / skip / null theo schema
      }),
      columnHelper.accessor("priority", {
        header: "Priority",
        cell: (info) => info.getValue() ?? "-",
      }),
      columnHelper.display({
        id: "rsboost",
        header: "Rsboost (cu -> moi)",
        // hien CA HAI gia tri du action_type la gi (khong chi loc theo rsboost) - rsboost_cu la dB that
        // (vd 1.8), rsboost_moi la step chuan (vd 3.0), 2 don vi khac nhau nen KHONG duoc gop/tinh toan,
        // chi hien canh nhau de NOC tu doi chieu
        cell: (info) => {
          const row = info.row.original;
          return `${row.rsboost_cu ?? "-"} -> ${row.rsboost_moi ?? "-"}`;
        },
      }),
      columnHelper.display({
        id: "qrxlevmin",
        header: "Qrxlevmin (cu -> moi)",
        cell: (info) => {
          const row = info.row.original;
          return `${row.qrxlevmin_cu ?? "-"} -> ${row.qrxlevmin_moi ?? "-"}`;
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // export du cot theo yeu cau: ma tram, cell_name, huong_id, action_type, priority, rsboost cu/moi,
  // qrxlevmin cu/moi - gia tri so xuat "" (rong) khi null thay vi chu "null"/"-" de o Excel van la kieu so
  const handleExportExcel = () => {
    const exportRows = rows.map((r) => ({
      ma_tram: r.tram_id,
      cell_name: r.cell_name,
      huong_id: r.huong_id ?? "-",
      action_type: r.action_type ?? "-",
      priority: r.priority ?? "",
      rsboost_cu: r.rsboost_cu ?? "",
      rsboost_moi: r.rsboost_moi ?? "",
      qrxlevmin_cu: r.qrxlevmin_cu ?? "",
      qrxlevmin_moi: r.qrxlevmin_moi ?? "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cell anh huong");
    XLSX.writeFile(
      workbook,
      `R012_preview_cell_${previewData.tram_goc.tram_id}_${formatTimestampForFileName(new Date())}.xlsx`
    );
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <h4 style={{ margin: 0 }}>Danh sach cell bi anh huong ({rows.length})</h4>
        <Button onClick={handleExportExcel} disabled={rows.length === 0}>
          Export Excel
        </Button>
      </div>

      {rows.length === 0 ? (
        <div>Khong co cell nao bi anh huong.</div>
      ) : (
        <>
          {/* CSS scoped rieng cho bang nay, dung DUNG token tu theme.ts, dong bo voi 2 bang con lai trong module */}
          <style>{`
            .r012-affected-cells-table { width: 100%; border-collapse: collapse; }
            .r012-affected-cells-table thead th {
              text-align: left;
              padding: 10px 8px;
              background-color: ${R012_COLORS.tableHeaderBg};
              color: #ffffff;
              font-weight: 700;
              border: 1px solid ${R012_COLORS.primary};
            }
            .r012-affected-cells-table tbody td {
              padding: 8px;
              border-bottom: 1px solid ${R012_COLORS.tableBorder};
            }
            .r012-affected-cells-table tbody tr:nth-child(odd) { background-color: #ffffff; }
            .r012-affected-cells-table tbody tr:nth-child(even) { background-color: ${R012_COLORS.tableRowAlt}; }
            .r012-affected-cells-table tbody tr:hover { background-color: ${R012_COLORS.rowHoverBg}; }
          `}</style>
          <table className="r012-affected-cells-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
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
        </>
      )}
    </div>
  );
};

export default AffectedCellsTable;

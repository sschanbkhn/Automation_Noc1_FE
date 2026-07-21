import React, { useMemo } from "react";
import { Button } from "antd";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
// dung xlsx (SheetJS) co san trong package.json (^0.17.5), giong cach CellParamsByHuong.tsx da dung -
// KHONG cai them dependency moi cho 1 export co ban (1 sheet, khong can style/merge cell phuc tap)
import * as XLSX from "xlsx";
import { PreviewCrResponse } from "../../types";
import { R012_COLORS } from "../../theme";

// dinh dang timestamp DDMMYYYY_HHMM cho ten file export - dung DUNG quy uoc da dung o CellParamsByHuong.tsx.
// KHONG tach thanh helper dung chung vi ham chi 8 dong va hien chi co 2-3 noi can, tach som se la
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

interface StationRow {
  tram_id: string;
  tram_name: string | null;
  soCellAnhHuong: number;
  longitude: number | null;
  latitude: number | null;
}

const columnHelper = createColumnHelper<StationRow>();

interface AffectedStationsTableProps {
  previewData: PreviewCrResponse;
}

// bang danh sach tram_lan_can (da loc trung tram_goc) - tuong ung Buoc 1 tinh nang preview lan 2.
// Component nay CHI nhan previewData da co san tu state cua TacDongTram.tsx (khong tu goi API)
const AffectedStationsTable: React.FC<AffectedStationsTableProps> = ({ previewData }) => {
  // loc trung tram_goc khoi tram_lan_can - DA XAC NHAN qua goi that (xem comment PreviewTramItem trong
  // types/index.ts): BE tra tram_goc LAP LAI trong chinh mang tram_lan_can. Bang tram CHI hien cac tram
  // lan can THAT SU (tram_goc da duoc hien rieng bang marker do tren map), giong cach da loc o NetworkMap.tsx
  const rows: StationRow[] = useMemo(
    () =>
      previewData.tram_lan_can
        .filter((t) => t.tram_id !== previewData.tram_goc.tram_id)
        .map((t) => ({
          tram_id: t.tram_id,
          tram_name: t.tram_name,
          soCellAnhHuong: t.cells.length,
          longitude: t.longitude,
          latitude: t.latitude,
        })),
    [previewData]
  );

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "stt",
        header: "STT",
        cell: (info) => info.row.index + 1, // so thu tu tinh theo vi tri dong, khong phai du lieu tu BE
      }),
      columnHelper.accessor("tram_id", { header: "Ma tram" }),
      columnHelper.accessor("tram_name", {
        header: "Ten tram",
        cell: (info) => info.getValue() ?? "-", // co the null theo schema PreviewTramItem
      }),
      columnHelper.accessor("soCellAnhHuong", { header: "So cell bi anh huong" }),
      columnHelper.display({
        id: "toaDo",
        header: "Toa do",
        // longitude/latitude co the null theo schema (~0.4% tram khong join duoc toa do) - ghi ro
        // "Thieu toa do" thay vi hien "null, null" gay kho hieu cho NOC
        cell: (info) => {
          const row = info.row.original;
          return row.longitude !== null && row.latitude !== null
            ? `${row.latitude}, ${row.longitude}`
            : "Thieu toa do";
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

  // export dung DUNG cot yeu cau: ma tram, ten tram, so cell, longitude, latitude - longitude/latitude
  // xuat "" (rong) khi null thay vi chu "null"/"Thieu toa do" de o Excel van la kieu so, de loc/tinh toan sau
  const handleExportExcel = () => {
    const exportRows = rows.map((r) => ({
      ma_tram: r.tram_id,
      ten_tram: r.tram_name ?? "-",
      so_cell: r.soCellAnhHuong,
      longitude: r.longitude ?? "",
      latitude: r.latitude ?? "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tram anh huong");
    XLSX.writeFile(
      workbook,
      `R012_preview_tram_${previewData.tram_goc.tram_id}_${formatTimestampForFileName(new Date())}.xlsx`
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
        <h4 style={{ margin: 0 }}>Danh sach tram bi anh huong ({rows.length})</h4>
        <Button onClick={handleExportExcel} disabled={rows.length === 0}>
          Export Excel
        </Button>
      </div>

      {rows.length === 0 ? (
        <div>Khong co tram lan can nao bi anh huong.</div>
      ) : (
        <>
          {/* CSS scoped rieng cho bang nay, dung DUNG token tu theme.ts, dong bo voi StationSearchGrid.tsx
              va SessionHistoryList.tsx (header dam mau, dong xen ke, hover) */}
          <style>{`
            .r012-affected-stations-table { width: 100%; border-collapse: collapse; }
            .r012-affected-stations-table thead th {
              text-align: left;
              padding: 10px 8px;
              background-color: ${R012_COLORS.tableHeaderBg};
              color: #ffffff;
              font-weight: 700;
              border: 1px solid ${R012_COLORS.primary};
            }
            .r012-affected-stations-table tbody td {
              padding: 8px;
              border-bottom: 1px solid ${R012_COLORS.tableBorder};
            }
            .r012-affected-stations-table tbody tr:nth-child(odd) { background-color: #ffffff; }
            .r012-affected-stations-table tbody tr:nth-child(even) { background-color: ${R012_COLORS.tableRowAlt}; }
            .r012-affected-stations-table tbody tr:hover { background-color: ${R012_COLORS.rowHoverBg}; }
          `}</style>
          <table className="r012-affected-stations-table">
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

export default AffectedStationsTable;

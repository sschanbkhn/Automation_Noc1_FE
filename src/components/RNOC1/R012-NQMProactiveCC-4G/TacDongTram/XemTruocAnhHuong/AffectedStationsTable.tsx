import React, { useEffect, useMemo, useState } from "react";
import { Button, Pagination } from "antd";
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
// dung xlsx (SheetJS) co san trong package.json (^0.17.5), giong cach CellParamsByHuong.tsx da dung -
// KHONG cai them dependency moi cho 1 export co ban (1 sheet, khong can style/merge cell phuc tap)
import * as XLSX from "xlsx";
import { PreviewCrResponse } from "../../types";
import { R012_COLORS } from "../../theme";
// <th> dung chung cho MOI bang co sort trong module (click header + mui ten huong sort)
import { SortableHeaderCell } from "../../common/SortableHeaderCell";
import { OneLineCell } from "../../common/r012TableStyle";

// dinh dang timestamp DDMMYYYY_HHMM cho ten file export - dung DUNG quy uoc da dung o CellParamsByHuong.tsx.
// KHONG tach thanh helper dung chung vi ham chi 8 dong, tach som se la premature abstraction cho 1 ham qua nho
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

// bang danh sach tram_bi_anh_huong - tuong ung Buoc 3 (Phan 1, ban sua theo schema BE moi 22072026).
// FIX so voi ban truoc: BE da doi schema, tram_bi_anh_huong la mang PHANG BE tra san (KHONG con la
// tram_lan_can long ca tram_goc ben trong nhu cu) - FE KHONG con phai tu loc trung tram_goc nua, dung
// THANG mang nay. Component nay CHI nhan previewData da co san tu state cua TacDongTram.tsx (khong tu goi API)
const AffectedStationsTable: React.FC<AffectedStationsTableProps> = ({ previewData }) => {
  // dem so cell bi anh huong cho tung tram bang cells_bi_anh_huong.tram_id - AffectedTramItem (schema moi)
  // KHONG con kem san danh sach cells nhu PreviewTramItem cu, nen phai tu dem qua mang cells_bi_anh_huong rieng
  const soCellTheoTram = useMemo(() => {
    const counts = new Map<string, number>();
    previewData.cells_bi_anh_huong.forEach((c) => {
      counts.set(c.tram_id, (counts.get(c.tram_id) ?? 0) + 1);
    });
    return counts;
  }, [previewData]);

  const rows: StationRow[] = useMemo(
    () =>
      previewData.tram_bi_anh_huong.map((t) => ({
        tram_id: t.tram_id,
        tram_name: t.tram_name,
        soCellAnhHuong: soCellTheoTram.get(t.tram_id) ?? 0,
        longitude: t.longitude,
        latitude: t.latitude,
      })),
    [previewData, soCellTheoTram]
  );

  // sort + phan trang deu xu ly qua TanStack Table (KHONG tu slice mang thu cong nhu ban truoc) - de
  // getSortedRowModel chay TRUOC getPaginationRowModel, dam bao sort tren TOAN BO du lieu roi moi cat trang,
  // thay vi chi sort trong pham vi 1 trang dang xem (khac voi StationSearchGrid/SessionHistoryList o cho
  // du lieu preview nay da co san DAY DU trong bo nho, khong bi gioi han boi phan trang server-side)
  const [sorting, setSorting] = useState<SortingState>([]);
  // mac dinh 5 dong/trang (Viec 3, giam tu 10 xuong 5), cho doi 5/10/20/50 theo yeu cau
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  // reset ve trang 1 moi khi previewData doi (NOC xem preview tram khac) de tranh dung o trang cu co the
  // vuot qua so trang cua du lieu moi
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [previewData]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "stt",
        header: "STT",
        enableSorting: false, // STT chi la vi tri hien thi, sort cot nay khong co y nghia
        // STT tinh theo vi tri TUYET DOI trong ca danh sach (khong reset ve 1 moi trang), giup NOC biet
        // dung thu tu tong the khi chuyen trang - info.row.index o day la vi tri TRONG TRANG hien tai
        // (getPaginationRowModel dang duoc dung) nen phai cong them offset cua trang
        cell: (info) => pagination.pageIndex * pagination.pageSize + info.row.index + 1,
      }),
      columnHelper.accessor("tram_id", { header: "Ma tram" }),
      columnHelper.accessor("tram_name", {
        header: "Ten tram",
        cell: (info) => <OneLineCell value={info.getValue()} />,
      }),
      columnHelper.accessor("soCellAnhHuong", { header: "So cell bi anh huong" }),
      columnHelper.display({
        id: "toaDo",
        header: "Toa do",
        // longitude/latitude co the null theo schema (EDGE CASE toa do null van giu nguyen xu ly nhu cu,
        // du response mau lan nay ca 29 tram deu co du toa do) - ghi ro "Thieu toa do" thay vi "null, null"
        cell: (info) => {
          const row = info.row.original;
          return row.longitude !== null && row.latitude !== null
            ? `${row.latitude}, ${row.longitude}`
            : "Thieu toa do";
        },
        // sort theo latitude (KHONG the sort truc tiep tren chuoi "lat, lng" da format) - tram thieu toa do
        // (null) luon xep CUOI bat ke asc/desc, tranh lam gian doan thu tu cac tram co toa do that
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.latitude;
          const b = rowB.original.latitude;
          if (a === null && b === null) return 0;
          if (a === null) return 1;
          if (b === null) return -1;
          return a - b;
        },
      }),
    ],
    [pagination]
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // export TOAN BO rows (khong chi trang dang xem) - dung DUNG cot yeu cau: ma tram, ten tram, so cell,
  // longitude, latitude - longitude/latitude xuat "" (rong) khi null thay vi chu "null"/"Thieu toa do" de
  // o Excel van la kieu so, de loc/tinh toan sau
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
        {/* tieu de dung DUNG dinh dang "Tram bi anh huong (N)" theo yeu cau, N la TONG so tram (khong phai so dong dang hien) */}
        <h4 style={{ margin: 0 }}>Tram bi anh huong ({rows.length})</h4>
        <Button onClick={handleExportExcel} disabled={rows.length === 0}>
          Export Excel
        </Button>
      </div>

      {rows.length === 0 ? (
        <div>Khong co tram nao bi anh huong.</div>
      ) : (
        <>
          {/* CSS scoped rieng cho bang nay, dung DUNG token tu theme.ts, dong bo voi StationSearchGrid.tsx
              va SessionHistoryList.tsx (header dam mau, dong xen ke, hover) */}
          <style>{`
            .r012-affected-stations-table { border-collapse: collapse; }
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
          <div className="r012-table-scroll">
<table className="r012-table r012-affected-stations-table">
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

          {/* Pagination cua antd chi la UI dieu khien - state that (pageIndex/pageSize) nam trong TanStack
              Table (bien "pagination" o tren) de phoi hop dung voi getSortedRowModel/getPaginationRowModel */}
          <Pagination
            current={pagination.pageIndex + 1}
            pageSize={pagination.pageSize}
            total={rows.length}
            pageSizeOptions={["5", "10", "20", "50"]}
            showSizeChanger
            onChange={(newPage, newPageSize) => {
              setPagination({ pageIndex: newPage - 1, pageSize: newPageSize });
            }}
            style={{ marginTop: "1rem" }}
          />
        </>
      )}
    </div>
  );
};

export default AffectedStationsTable;

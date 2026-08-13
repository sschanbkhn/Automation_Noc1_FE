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
// dung xlsx (SheetJS) co san trong package.json (^0.17.5), giong cach CellParamsByHuong.tsx va
// AffectedStationsTable.tsx da dung - KHONG cai them dependency moi
import * as XLSX from "xlsx";
import { PreviewCrResponse } from "../../types";
import { R012_COLORS } from "../../theme";
// <th> dung chung cho MOI bang co sort trong module (click header + mui ten huong sort)
import { SortableHeaderCell } from "../../common/SortableHeaderCell";

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
  tram_id: string; // ma tram cha - tram_id cua tram_bi_anh_huong chua cell nay
  huong_id: string | null;
}

const columnHelper = createColumnHelper<CellRow>();

interface AffectedCellsTableProps {
  previewData: PreviewCrResponse;
}

// bang "Cell bi anh huong" - tuong ung Buoc 1 (Phan 1, ban sua theo schema BE moi 22072026).
// FIX so voi ban truoc: BE da tach rieng cells_bi_anh_huong (TOAN BO cell nam trong vung anh huong, KHONG
// co rsboost/qrxlevmin/priority/action_type - xem schema AffectedCellItem) voi cells_chay_cr (tap con
// THAT SU se chay CR, xem CrCellsTable.tsx rieng) - 2 khai niem khac nhau, truoc day bi gop chung 1 bang.
// Component nay CHI nhan previewData da co san tu state cua TacDongTram.tsx (khong tu goi API)
const AffectedCellsTable: React.FC<AffectedCellsTableProps> = ({ previewData }) => {
  const rows: CellRow[] = useMemo(
    () =>
      previewData.cells_bi_anh_huong.map((c) => ({
        cell_name: c.cell_name,
        tram_id: c.tram_id,
        huong_id: c.huong_id,
      })),
    [previewData]
  );

  // sort + phan trang deu xu ly qua TanStack Table (getSortedRowModel chay TRUOC getPaginationRowModel) -
  // giong AffectedStationsTable.tsx, xem comment giai thich chi tiet o file do
  const [sorting, setSorting] = useState<SortingState>([]);
  // mac dinh 5 dong/trang (Viec 3, giam tu 10 xuong 5)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [previewData]);

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
      columnHelper.accessor("tram_id", { header: "Ma tram" }),
      columnHelper.accessor("huong_id", {
        header: "Huong",
        cell: (info) => info.getValue() ?? "-", // co the null theo schema AffectedCellItem
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

  // export TOAN BO rows (khong chi trang dang xem) - dung DUNG cot yeu cau: ma tram, cell_name, huong_id.
  // KHONG co rsboost/qrxlevmin/priority/action_type vi AffectedCellItem (schema that) khong co cac field nay
  const handleExportExcel = () => {
    const exportRows = rows.map((r) => ({
      ma_tram: r.tram_id,
      cell_name: r.cell_name,
      huong_id: r.huong_id ?? "-",
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cell anh huong");
    XLSX.writeFile(
      workbook,
      `R012_preview_cell_anh_huong_${previewData.tram_goc.tram_id}_${formatTimestampForFileName(new Date())}.xlsx`
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
        {/* tieu de dung DUNG dinh dang "Cell bi anh huong (N)" theo yeu cau, N la TONG so cell (khong phai so dong dang hien) */}
        <h4 style={{ margin: 0 }}>Cell bi anh huong ({rows.length})</h4>
        <Button onClick={handleExportExcel} disabled={rows.length === 0}>
          Export Excel
        </Button>
      </div>

      {rows.length === 0 ? (
        <div>Khong co cell nao bi anh huong.</div>
      ) : (
        <>
          {/* CSS scoped rieng cho bang nay, dung DUNG token tu theme.ts, dong bo voi cac bang con lai trong module */}
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
            /* Cot "Cell" (cot thu 2, ngay sau STT): ten cell dai (vd "HNI1234_L1800_1") truoc day bi ngat
               thanh 2 dong lam chieu cao hang gap doi va bang nhin lo cho. nowrap giu ten tren DUNG 1 hang.
               Cap voi width:1% - day la cach chuan de trinh duyet cap cho cot dung be rong NOI DUNG that
               ("1%" nghia la "nho nhat co the", nhung nowrap khong cho ep nho hon ten cell) roi chia phan
               du cho cac cot con lai; KHONG dat px cung vi ten cell dai ngan khac nhau tuy tram.
               nth-child(2) bam theo thu tu cot khai bao co dinh trong "columns" o tren (STT, Cell, ...) */
            .r012-affected-cells-table thead th:nth-child(2),
            .r012-affected-cells-table tbody td:nth-child(2) {
              white-space: nowrap;
              width: 1%;
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

          {/* Pagination cua antd chi la UI dieu khien - state that nam trong TanStack Table (bien "pagination") */}
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

export default AffectedCellsTable;

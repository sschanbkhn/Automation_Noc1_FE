import React, { useEffect, useMemo, useState } from "react";
import { OneLineCell } from "../../common/r012TableStyle";
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
// dung xlsx (SheetJS) co san trong package.json (^0.17.5), giong cach cac bang preview khac da dung -
// KHONG cai them dependency moi
import * as XLSX from "xlsx";
import { PreviewCrResponse } from "../../types";
import { R012_COLORS } from "../../theme";
// <th> dung chung cho MOI bang co sort trong module (click header + mui ten huong sort)
import { SortableHeaderCell } from "../../common/SortableHeaderCell";

// dinh dang timestamp DDMMYYYY_HHMM cho ten file export - dung DUNG quy uoc da dung o cac bang preview
// khac. KHONG tach thanh helper dung chung vi ham chi 8 dong, tach som se la premature abstraction
function formatTimestampForFileName(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const dd = pad(date.getDate());
  const mm = pad(date.getMonth() + 1);
  const yyyy = date.getFullYear();
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${dd}${mm}${yyyy}_${hh}${min}`;
}

interface CrCellRow {
  cell_name: string;
  tram_id: string; // ma tram cha
  huong_id: string | null;
  action_type: string | null;
  priority: number | null;
  rsboost_cu: number | null;
  rsboost_moi: number | null;
  qrxlevmin_cu: number | null;
  qrxlevmin_moi: number | null;
}

const columnHelper = createColumnHelper<CrCellRow>();

interface CrCellsTableProps {
  previewData: PreviewCrResponse;
}

// bang "Cell chay CR" (MOI, tach rieng khoi bang "Cell bi anh huong") - tuong ung Buoc 2 (Phan 1, ban sua
// theo schema BE moi 22072026). cells_chay_cr la TAP CON THAT SU se duoc dieu chinh tham so (rsboost/
// qrxlevmin) khi trigger CR - KHAC voi cells_bi_anh_huong (TOAN BO cell nam trong vung anh huong suy hao/
// nhieu, khong phai tat ca deu chay CR). DA XAC NHAN qua goi that: 12/47 cell (tram 110548). Component nay
// CHI nhan previewData da co san tu state cua TacDongTram.tsx (khong tu goi API)
const CrCellsTable: React.FC<CrCellsTableProps> = ({ previewData }) => {
  const rows: CrCellRow[] = useMemo(
    () =>
      previewData.cells_chay_cr.map((c) => ({
        cell_name: c.cell_name,
        tram_id: c.tram_id,
        huong_id: c.huong_id,
        action_type: c.action_type,
        priority: c.priority,
        rsboost_cu: c.rsboost_cu,
        rsboost_moi: c.rsboost_moi,
        qrxlevmin_cu: c.qrxlevmin_cu,
        qrxlevmin_moi: c.qrxlevmin_moi,
      })),
    [previewData]
  );

  // sort + phan trang deu xu ly qua TanStack Table (getSortedRowModel chay TRUOC getPaginationRowModel) -
  // giong AffectedStationsTable.tsx/AffectedCellsTable.tsx, xem comment giai thich chi tiet o AffectedStationsTable.tsx
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
        // STT tinh theo vi tri TUYET DOI - info.row.index la vi tri TRONG TRANG hien tai (getPaginationRowModel)
        cell: (info) => pagination.pageIndex * pagination.pageSize + info.row.index + 1,
      }),
      columnHelper.accessor("cell_name", {
        header: "Cell",
        // OneLineCell: ellipsis + Tooltip lam duong lui cho ten dai bat thuong - xem
        // common/r012TableStyle.tsx
        cell: (info) => <OneLineCell value={info.getValue()} />,
      }),
      columnHelper.accessor("tram_id", { header: "Ma tram" }),
      columnHelper.accessor("huong_id", {
        header: "Huong",
        cell: (info) => info.getValue() ?? "-", // co the null theo schema CrCellItem
      }),
      columnHelper.accessor("action_type", {
        header: "Hanh dong",
        cell: (info) => info.getValue() ?? "-", // rsboost / qrxlevmin / null theo schema
      }),
      columnHelper.accessor("priority", {
        header: "Priority",
        cell: (info) => info.getValue() ?? "-",
      }),
      columnHelper.display({
        id: "rsboost",
        header: "Rsboost (cu -> moi)",
        enableSorting: false, // cot ghep 2 gia tri thanh 1 chuoi "cu -> moi", KHONG phai 1 gia tri don co the sap xep tu nhien
        // hien CA HAI gia tri du action_type la gi - rsboost_cu la dB that (vd 1.8), rsboost_moi la step
        // chuan (vd 3.0), 2 don vi khac nhau nen KHONG duoc gop/tinh toan, chi hien canh nhau de NOC tu doi chieu.
        // LUU Y cho nguoi grep sau nay: so 3.0 o day la STEP RSBOOST (dB), KHONG lien quan gi den
        // nguong danh gia chat luong muc_toi_thieu=3.0 - trung so ngau nhien, 2 don vi khac han nhau
        cell: (info) => {
          const row = info.row.original;
          return `${row.rsboost_cu ?? "-"} -> ${row.rsboost_moi ?? "-"}`;
        },
      }),
      columnHelper.display({
        id: "qrxlevmin",
        header: "Qrxlevmin (cu -> moi)",
        enableSorting: false, // cot ghep 2 gia tri thanh 1 chuoi "cu -> moi", KHONG phai 1 gia tri don co the sap xep tu nhien
        cell: (info) => {
          const row = info.row.original;
          return `${row.qrxlevmin_cu ?? "-"} -> ${row.qrxlevmin_moi ?? "-"}`;
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

  // export TOAN BO rows (khong chi trang dang xem) - dung DUNG cot yeu cau: ma tram, cell_name, huong_id,
  // action_type, priority, rsboost cu/moi, qrxlevmin cu/moi - gia tri so xuat "" (rong) khi null thay vi
  // chu "-" de o Excel van la kieu so
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cell chay CR");
    XLSX.writeFile(
      workbook,
      `R012_preview_cell_chay_cr_${previewData.tram_goc.tram_id}_${formatTimestampForFileName(new Date())}.xlsx`
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
        {/* tieu de dung DUNG dinh dang "Cell chay CR (N)" theo yeu cau, N la TONG so cell (khong phai so dong dang hien) */}
        <h4 style={{ margin: 0 }}>Cell chay CR ({rows.length})</h4>
        <Button onClick={handleExportExcel} disabled={rows.length === 0}>
          Export Excel
        </Button>
      </div>

      {rows.length === 0 ? (
        <div>Khong co cell nao chay CR.</div>
      ) : (
        <>
          {/* CSS scoped rieng cho bang nay, dung DUNG token tu theme.ts, dong bo voi cac bang con lai trong module */}
          <style>{`
            .r012-cr-cells-table { border-collapse: collapse; }
            .r012-cr-cells-table thead th {
              text-align: left;
              padding: 10px 8px;
              background-color: ${R012_COLORS.tableHeaderBg};
              color: #ffffff;
              font-weight: 700;
              border: 1px solid ${R012_COLORS.primary};
            }
            .r012-cr-cells-table tbody td {
              padding: 8px;
              border-bottom: 1px solid ${R012_COLORS.tableBorder};
            }
            /* Cot "Cell" (cot thu 2, ngay sau STT): xem giai thich day du trong AffectedCellsTable.tsx -
               bang nay con NHIEU cot hon (9 cot) nen ap luc ep ten cell xuong dong cang lon, cang can nowrap.
               nth-child(2) bam theo thu tu cot khai bao co dinh trong "columns" o tren (STT, Cell, ...) */
            .r012-cr-cells-table thead th:nth-child(2),
            .r012-cr-cells-table tbody td:nth-child(2) {
              white-space: nowrap;
              width: 1%;
            }
            .r012-cr-cells-table tbody tr:nth-child(odd) { background-color: #ffffff; }
            .r012-cr-cells-table tbody tr:nth-child(even) { background-color: ${R012_COLORS.tableRowAlt}; }
            .r012-cr-cells-table tbody tr:hover { background-color: ${R012_COLORS.rowHoverBg}; }
          `}</style>
          <div className="r012-table-scroll">
<table className="r012-table r012-cr-cells-table">
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

export default CrCellsTable;

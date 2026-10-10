import React, { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
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
import { PreviewCrResponse, QuanHeDayDuItem } from "../../types";
import { R012_COLORS } from "../../theme";
// <th> dung chung cho MOI bang co sort trong module (click header + mui ten huong sort)
import { SortableHeaderCell } from "../../common/SortableHeaderCell";
import { formatPctHo, layNhanLayer } from "../../helpers/hoLabels";

const columnHelper = createColumnHelper<QuanHeDayDuItem>();

interface QuanHeDayDuTableProps {
  previewData: PreviewCrResponse;
}

// bang "Quan he day du" (BUOC 4b, 08/10/2026, yeu cau truc tiep user, BE chua deploy tai .196) - TOAN BO
// quan he "sector cua X -> 1 tram dich" (xem QuanHeDayDuItem, types/index.ts), KHONG chi phan da duoc chon
// vao cells_bi_anh_huong/cells_chay_cr. Component nay la bang "thu gon, bam mo rong" theo yeu cau - TU THAN
// no la 1 bang binh thuong, "thu gon" duoc hien thuc qua Collapse.Panel BAO NGOAI no (TacDongTram.tsx dat
// key "quan-he-day-du" KHONG nam trong defaultActiveKey, giong cach "Cell bi loai khoi pham vi" da lam)
const QuanHeDayDuTable: React.FC<QuanHeDayDuTableProps> = ({ previewData }) => {
  const rows: QuanHeDayDuItem[] = previewData.quan_he_day_du ?? [];

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [previewData]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "stt",
        header: "STT",
        enableSorting: false,
        cell: (info) => pagination.pageIndex * pagination.pageSize + info.row.index + 1,
      }),
      columnHelper.accessor("sector", { header: "Sector (X)" }),
      columnHelper.accessor("target_enb", { header: "Tram dich (ENB)" }),
      columnHelper.accessor("target_lcr", { header: "LCR dich" }),
      columnHelper.accessor("pct_trong_sector", {
        header: "% trong sector",
        cell: (info) => formatPctHo(info.getValue()),
      }),
      columnHelper.accessor("ho_attempt", { header: "So HO" }),
      columnHelper.accessor("ho_sr", {
        header: "SR",
        cell: (info) => formatPctHo(info.getValue()),
      }),
      columnHelper.accessor("layer", {
        header: "Layer",
        cell: (info) => layNhanLayer(info.getValue()),
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

  if (rows.length === 0) {
    return <div>Khong co quan he day du nao.</div>;
  }

  return (
    <div>
      {/* CSS scoped rieng cho bang nay, dung DUNG token tu theme.ts, dong bo voi cac bang con lai trong module */}
      <style>{`
        .r012-quan-he-day-du-table { border-collapse: collapse; }
        .r012-quan-he-day-du-table thead th {
          text-align: left;
          padding: 10px 8px;
          background-color: ${R012_COLORS.tableHeaderBg};
          color: #ffffff;
          font-weight: 700;
          border: 1px solid ${R012_COLORS.primary};
        }
        .r012-quan-he-day-du-table tbody td {
          padding: 8px;
          border-bottom: 1px solid ${R012_COLORS.tableBorder};
        }
        .r012-quan-he-day-du-table tbody tr:nth-child(odd) { background-color: #ffffff; }
        .r012-quan-he-day-du-table tbody tr:nth-child(even) { background-color: ${R012_COLORS.tableRowAlt}; }
        .r012-quan-he-day-du-table tbody tr:hover { background-color: ${R012_COLORS.rowHoverBg}; }
      `}</style>
      <div className="r012-table-scroll">
        <table className="r012-table r012-quan-he-day-du-table">
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
        total={rows.length}
        pageSizeOptions={["5", "10", "20", "50"]}
        showSizeChanger
        onChange={(newPage, newPageSize) => {
          setPagination({ pageIndex: newPage - 1, pageSize: newPageSize });
        }}
        style={{ marginTop: "1rem" }}
      />
    </div>
  );
};

export default QuanHeDayDuTable;

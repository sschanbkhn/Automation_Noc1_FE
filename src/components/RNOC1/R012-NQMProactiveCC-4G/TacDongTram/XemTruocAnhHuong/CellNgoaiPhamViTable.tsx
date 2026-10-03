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
import { PreviewCrResponse, CellNgoaiPhamViChiTiet } from "../../types";
import { R012_COLORS } from "../../theme";
// <th> dung chung cho MOI bang co sort trong module (click header + mui ten huong sort)
import { SortableHeaderCell } from "../../common/SortableHeaderCell";

// Nhan hien thi cho MA ly_do co dinh (BE domain/services/neighbor_cell_filter.py::LY_DO_*). Ma la hop dong
// on dinh giua FE/BE, text la DIEN GIAI rieng cua FE - doi chu khong can sua BE. Ma la nam ngoai bang nay
// (BE them ma moi ma FE chua kip cap nhat) van hien duoc NGUYEN VAN ma do thay vi rong/vo (xem cell ben duoi)
const LY_DO_LABELS: Record<string, string> = {
  CELL_ID_PHANG: "Khong phai cell Nokia",
  TEN_CELL_SAI_MAU: "Ten cell sai mau",
  OSS_CHUA_CAU_HINH: "Chua cau hinh NetAct",
  SMALL_CELL: "Small cell",
  BAND_KHONG_CHAY_CR: "Khong phai band 1800",
};

const columnHelper = createColumnHelper<CellNgoaiPhamViChiTiet>();

interface CellNgoaiPhamViTableProps {
  previewData: PreviewCrResponse;
}

// Bang "Cell bi loai khoi pham vi" - ban CHI TIET cua cell_ngoai_pham_vi_chi_tiet (27092026, BE commit
// d84215b/ed59418). THAY THE cho cach hien cu (list[str] cell_ngoai_pham_vi, chi co ten khong co ly do) -
// truoc day FE module nay CHUA TUNG hien cell_ngoai_pham_vi o dau ca (da kiem: 0 cho dung field do trong
// toan bo module, ca nhanh master lan dev) nen khong co cho nao bi hien 2 lan, component nay la THEM MOI
// hoan toan, khong phai thay the 1 UI cu da ton tai.
// Component CHI nhan previewData da co san tu state cua TacDongTram.tsx (khong tu goi API), giong cac bang
// preview khac trong module
const CellNgoaiPhamViTable: React.FC<CellNgoaiPhamViTableProps> = ({ previewData }) => {
  // optional vi BE .196 hien chua deploy truong nay (xem comment types/index.ts::PreviewCrResponse) - mac
  // dinh mang rong de component nay khong crash, nhung chua co gia tri THAT nao de hien tren .196 hom nay
  const rows: CellNgoaiPhamViChiTiet[] = previewData.cell_ngoai_pham_vi_chi_tiet ?? [];

  const [sorting, setSorting] = useState<SortingState>([]);
  // mac dinh 5 dong/trang, giong cac bang preview khac trong module (AffectedCellsTable.tsx)
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
        cell: (info) => pagination.pageIndex * pagination.pageSize + info.row.index + 1,
      }),
      columnHelper.accessor("cell_name", { header: "Cell" }),
      columnHelper.accessor("ly_do", {
        header: "Ly do bi loai",
        cell: (info) => {
          const maLyDo = info.getValue();
          return LY_DO_LABELS[maLyDo] ?? maLyDo;
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

  // rong thi KHONG render gi (khong phai "khong co cell nao bi loai" - noi dung tot thi khong can chiem
  // cho): component nay chi duoc dua vao Collapse khi TacDongTram.tsx da kiem rows.length > 0, nhung van
  // giu guard o day phong truong hop sau nay co noi khac goi thang component ma quen kiem truoc
  if (rows.length === 0) {
    return null;
  }

  return (
    <div>
      <h4 style={{ margin: "0 0 0.5rem 0" }}>Cell bi loai khoi pham vi ({rows.length})</h4>
      {/* CSS scoped rieng cho bang nay, dung DUNG token tu theme.ts, dong bo voi cac bang con lai trong module */}
      <style>{`
        .r012-cell-ngoai-pham-vi-table { width: 100%; border-collapse: collapse; }
        .r012-cell-ngoai-pham-vi-table thead th {
          text-align: left;
          padding: 10px 8px;
          background-color: ${R012_COLORS.tableHeaderBg};
          color: #ffffff;
          font-weight: 700;
          border: 1px solid ${R012_COLORS.primary};
        }
        .r012-cell-ngoai-pham-vi-table tbody td {
          padding: 8px;
          border-bottom: 1px solid ${R012_COLORS.tableBorder};
        }
        .r012-cell-ngoai-pham-vi-table tbody tr:nth-child(odd) { background-color: #ffffff; }
        .r012-cell-ngoai-pham-vi-table tbody tr:nth-child(even) { background-color: ${R012_COLORS.tableRowAlt}; }
        .r012-cell-ngoai-pham-vi-table tbody tr:hover { background-color: ${R012_COLORS.rowHoverBg}; }
      `}</style>
      <table className="r012-cell-ngoai-pham-vi-table">
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

export default CellNgoaiPhamViTable;

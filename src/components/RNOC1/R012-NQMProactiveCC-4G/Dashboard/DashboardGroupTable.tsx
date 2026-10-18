// Bang "theo nhom" (khu_vuc/ma_tinh/netact) cua tab Dashboard - 1 COMPONENT DUNG CHUNG cho ca 3 nhom (THEM
// 18/10/2026, yeu cau truc tiep user) vi ca 3 deu CUNG 1 hinh dang DashboardNhomRow (xem types/index.ts) -
// chi khac NHAN cot dau ("Khu vuc"/"Tinh"/"NetAct") va nguon du lieu. Dung TanStack Table + SortableHeaderCell
// + class "r012-table" DUNG QUY UOC voi moi bang khac trong module (KHONG dung antd Table - module nay chua
// tung dung antd Table o dau, gan them 1 thu vien bang thu hai se pha vo tinh nhat quan giao dien/CSS).
// Sort CLIENT-SIDE (getSortedRowModel): so dong toi da ~63 tinh/vai chuc NetAct, khong can phan trang/sort
// server cho tap du lieu nho co dinh nay.
import React, { useMemo, useState } from "react";
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from "@tanstack/react-table";
import { DashboardNhomRow } from "../types";
import { R012_COLORS } from "../theme";
import { SortableHeaderCell } from "../common/SortableHeaderCell";
import { formatSoDem, formatTyLe } from "./dashboardHelpers";

interface DashboardGroupTableProps {
  rows: DashboardNhomRow[];
  // nhan cot dau tien - "Khu vuc"/"Tinh"/"NetAct" tuy nhom dang xem (xem Dashboard.tsx noi goi)
  nhanCotNhom: string;
}

const columnHelper = createColumnHelper<DashboardNhomRow>();

const DashboardGroupTable: React.FC<DashboardGroupTableProps> = ({ rows, nhanCotNhom }) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("gia_tri", {
        header: nhanCotNhom,
      }),
      columnHelper.accessor((r) => r.tong.so_session, {
        id: "so_session",
        header: "So CR",
        cell: (info) => formatSoDem(info.getValue()),
      }),
      columnHelper.accessor((r) => r.tong.so_tram, {
        id: "so_tram",
        header: "So tram",
        cell: (info) => formatSoDem(info.getValue()),
      }),
      columnHelper.accessor((r) => r.hau_kiem.qos.dat.ty_le, {
        id: "qos_dat",
        header: "% QoS dat",
        cell: (info) => formatTyLe(info.getValue()),
      }),
      columnHelper.accessor((r) => r.hau_kiem.qoe.dat.ty_le, {
        id: "qoe_dat",
        header: "% QoE dat",
        cell: (info) => formatTyLe(info.getValue()),
      }),
      columnHelper.accessor((r) => r.phieu.success, {
        id: "phieu_success",
        header: "Phieu thanh cong",
        cell: (info) => formatSoDem(info.getValue()),
      }),
      columnHelper.accessor((r) => r.phieu.cho_xuat_tay, {
        id: "cho_xuat_tay",
        header: "Cho xuat tay",
        cell: (info) => formatSoDem(info.getValue()),
      }),
      columnHelper.accessor((r) => r.phieu.loi, {
        id: "loi",
        header: "Loi",
        cell: (info) => formatSoDem(info.getValue()),
      }),
    ],
    [nhanCotNhom]
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (rows.length === 0) {
    return <div style={{ color: "#8c8c8c" }}>Khong co du lieu trong khoang loc dang chon.</div>;
  }

  return (
    <div>
      <style>{`
        .r012-dashboard-group-table { border-collapse: collapse; }
        .r012-dashboard-group-table thead th {
          text-align: left;
          padding: 10px 8px;
          background-color: ${R012_COLORS.tableHeaderBg};
          color: #ffffff;
          font-weight: 700;
          border: 1px solid ${R012_COLORS.primary};
        }
        .r012-dashboard-group-table tbody td {
          padding: 8px;
          border-bottom: 1px solid ${R012_COLORS.tableBorder};
        }
        .r012-dashboard-group-table tbody tr:nth-child(odd) { background-color: #ffffff; }
        .r012-dashboard-group-table tbody tr:nth-child(even) { background-color: ${R012_COLORS.tableRowAlt}; }
        .r012-dashboard-group-table tbody tr:hover { background-color: ${R012_COLORS.rowHoverBg}; }
      `}</style>
      <div className="r012-table-scroll">
        <table className="r012-table r012-dashboard-group-table">
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
    </div>
  );
};

export default DashboardGroupTable;

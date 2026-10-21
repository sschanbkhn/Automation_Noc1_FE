// Bang "theo nhom" (LAM LAI 18/10/2026, yeu cau truc tiep user, muc 6) - 3 tab Khu vuc / Tinh / Vendor (BO
// "NetAct", THEM "Vendor" - dung schema BE moi commit 124b72b, xem WHY day du o DashboardTongQuanResponse,
// types/index.ts). Bam 1 dong -> LOC CA DASHBOARD theo gia tri dong do (KHAC ban truoc: truoc day bang nay
// chi de xem, khong bam duoc).
import React, { useMemo, useState } from "react";
import { Segmented } from "antd";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { DashboardNhomRow, DashboardTongQuanResponse } from "../types";
import { R012_COLORS } from "../theme";
import { SortableHeaderCell } from "../common/SortableHeaderCell";
import { formatSoDem, formatTyLe } from "./dashboardHelpers";
import { MAU } from "./dashboardConstants";

// pill nen .nhat + chu .dam cho o "% QoS dat"/"% QoE dat" (yeu cau truc tiep user: "Mau .nhat: ... nen o
// 'Khong dat'/'Dat' trong bang theo nhom" - bang nay khong co cot "Khong dat" rieng, ap dung cho dung 2 cot
// % dat hien co, gan nhat voi khai niem "Dat" ma user neu)
const OTyLePill: React.FC<{ giaTri: number | null; mauDam: string; mauNhat: string }> = ({ giaTri, mauDam, mauNhat }) => (
  <span style={{ backgroundColor: mauNhat, color: mauDam, borderRadius: "4px", padding: "1px 6px", fontWeight: 600 }}>{formatTyLe(giaTri)}</span>
);

type TenNhom = "khu_vuc" | "ma_tinh" | "vendor";

interface DashboardGroupTableProps {
  data: DashboardTongQuanResponse;
  onClickNhom: (nhom: TenNhom, giaTri: string) => void;
}

const NHOM_TAB_OPTIONS: Array<{ label: string; value: TenNhom }> = [
  { label: "Khu vuc", value: "khu_vuc" },
  { label: "Tinh", value: "ma_tinh" },
  { label: "Vendor", value: "vendor" },
];

const NHAN_COT_DAU: Record<TenNhom, string> = { khu_vuc: "Khu vuc", ma_tinh: "Tinh", vendor: "Vendor" };

// BE commit 84a8938 (main) tu nay LOAI HAN dong KHONG_XAC_DINH/UNKNOWN khoi theo_nhom (xem WHY day du da doi
// chieu truc tiep git show 84a8938 - "tong"/"hau_kiem"/"phieu" tong chung KHONG doi, CHI rieng cac dong
// theo_nhom bi bo), dung dung yeu cau truc tiep user ("BO dong UNKNOWN/KHONG_XAC_DINH ... ap ca 3 tab"). Loc
// lai 1 lan nua O FE (phong truong hop .196 chua len dung commit nay) thay vi chi disable-click nhu ban truoc
// - gon hon, khong con hien dong "Khong xac dinh" nao nua dung tinh than "gon, sach".
const GIA_TRI_AN: Record<TenNhom, string> = { khu_vuc: "KHONG_XAC_DINH", ma_tinh: "", vendor: "UNKNOWN" };

const columnHelper = createColumnHelper<DashboardNhomRow>();

const DashboardGroupTable: React.FC<DashboardGroupTableProps> = ({ data, onClickNhom }) => {
  const [nhomDangXem, setNhomDangXem] = useState<TenNhom>("khu_vuc");
  const [sorting, setSorting] = useState<SortingState>([]);

  const rows = useMemo(
    () => data.theo_nhom[nhomDangXem].filter((r) => r.gia_tri !== GIA_TRI_AN[nhomDangXem]),
    [data, nhomDangXem]
  );

  // "any[]" (giong quy uoc da dung o LichSuPhieu/PhieuHistoryTable.tsx::baseColumns) - cac cot accessor tra
  // ve KIEU GIA TRI khac nhau (string/number/null) nen TanStack ColumnDef<DashboardNhomRow, T> khong gop
  // chung duoc 1 mang co kieu T co dinh
  const columns = useMemo(() => {
    const cot: any[] = [
      columnHelper.accessor("gia_tri", { header: NHAN_COT_DAU[nhomDangXem] }),
    ];
    // cot "Ten tinh" + "Khu vuc" CHI co y nghia o tab Tinh (ten_tinh/khu_vuc chi ton tai tren DashboardNhomRow
    // cua nhom ma_tinh - xem WHY day du o types/index.ts)
    if (nhomDangXem === "ma_tinh") {
      cot.push(
        columnHelper.accessor((r) => r.ten_tinh ?? "-", { id: "ten_tinh", header: "Ten tinh" }),
        columnHelper.accessor((r) => r.khu_vuc ?? "-", { id: "khu_vuc_cua_tinh", header: "Khu vuc" })
      );
    }
    cot.push(
      columnHelper.accessor((r) => r.tong.so_session, { id: "so_session", header: "So CR", cell: (info) => formatSoDem(info.getValue()) }),
      columnHelper.accessor((r) => r.tong.so_tram, { id: "so_tram", header: "So tram", cell: (info) => formatSoDem(info.getValue()) }),
      columnHelper.accessor((r) => r.hau_kiem.qos.dat.ty_le, {
        id: "qos_dat",
        header: "% QoS dat",
        cell: (info) => <OTyLePill giaTri={info.getValue()} mauDam={MAU.primary.dam} mauNhat={MAU.primary.nhat} />,
      }),
      columnHelper.accessor((r) => r.hau_kiem.qoe.dat.ty_le, {
        id: "qoe_dat",
        header: "% QoE dat",
        cell: (info) => <OTyLePill giaTri={info.getValue()} mauDam={MAU.compute.dam} mauNhat={MAU.compute.nhat} />,
      }),
      columnHelper.accessor((r) => r.phieu.success, { id: "phieu_success", header: "Phieu thanh cong", cell: (info) => formatSoDem(info.getValue()) }),
      columnHelper.accessor((r) => r.phieu.cho_xuat_tay, { id: "cho_xuat_tay", header: "Cho xuat tay", cell: (info) => formatSoDem(info.getValue()) }),
      columnHelper.accessor((r) => r.phieu.loi, { id: "loi", header: "Loi", cell: (info) => formatSoDem(info.getValue()) })
    );
    return cot;
  }, [nhomDangXem]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      <div style={{ marginBottom: "0.75rem" }}>
        <Segmented value={nhomDangXem} onChange={(v) => setNhomDangXem(v as TenNhom)} options={NHOM_TAB_OPTIONS} />
      </div>
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
      {rows.length === 0 ? (
        <div style={{ color: "#8c8c8c" }}>Khong co du lieu trong khoang loc dang chon.</div>
      ) : (
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
                <tr key={row.id} style={{ cursor: "pointer" }} onClick={() => onClickNhom(nhomDangXem, row.original.gia_tri)}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DashboardGroupTable;

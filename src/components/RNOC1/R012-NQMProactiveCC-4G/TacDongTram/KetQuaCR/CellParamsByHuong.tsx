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
// dung xlsx (SheetJS) co san trong package.json (^0.17.5) - KHONG cai them dependency moi. Du an co ca
// exceljs lan xlsx san, chon xlsx vi API json_to_sheet/writeFile don gian, du dung cho 1 export co ban
// (1 sheet, khong can dinh dang phuc tap nhu merge cell/style rieng ma exceljs manh hon), nhe hon khi bundle
import * as XLSX from "xlsx";
import { CellParamDetailItem } from "../../types";
import { R012_COLORS } from "../../theme";
// <th> dung chung cho MOI bang co sort trong module (click header + mui ten huong sort)
import { SortableHeaderCell } from "../../common/SortableHeaderCell";

// tach rieng phan hien thi cell_params tu CrResultsByDirection.tsx thanh component dung CHUNG, de
// EvaluationDetail.tsx (LichSuCR - xem lai session da DONE, khong co SSE) TAI SU DUNG duoc thay vi viet lai
// - ca 2 noi deu chi can 1 mang CellParamDetailItem[] la du, KHONG phu thuoc sessionId/SSE gi ca
interface CellParamsByHuongProps {
  cellParams: CellParamDetailItem[];
  // can sessionId de dat ten file export dung quy uoc R012_CR_cells_{session_id}_{timestamp}.xlsx -
  // ca 2 noi goi component nay (CrResultsByDirection/EvaluationDetail) deu co san sessionId dang number
  // tai thoi diem render toi day (da qua guard sessionId===null o component cha)
  sessionId: number;
}

// dinh dang timestamp DDMMYYYY_HHMM cho ten file - dung DUNG quy uoc dat ten da thong nhat trong du an
// (giong quy uoc folder theo ngay {DDMMYYYY_HHMM}/ o cac noi khac), khong tu bia dinh dang moi
function formatTimestampForFileName(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const dd = pad(date.getDate());
  const mm = pad(date.getMonth() + 1);
  const yyyy = date.getFullYear();
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${dd}${mm}${yyyy}_${hh}${min}`;
}

// xac dinh cap gia tri "truoc CR -> sau CR" DUNG theo action_type cua tung cell - 1 cell chi thuoc DUNG 1
// loai tham so (rsboost HOAC qrxlevmin), khong phai luc nao cung co ca 2, nen phai chon dung cap de export
// khong bi nham gia tri (vd cell rsboost thi khong dung nham cap qrxlevmin dang null)
function resolveBeforeAfter(cellParam: CellParamDetailItem): { before: number | string; after: number | string } {
  if (cellParam.action_type === "rsboost") {
    return { before: cellParam.rsboost_before_cr ?? "-", after: cellParam.rsboost_new ?? "-" };
  }
  if (cellParam.action_type === "qrxlevmin") {
    return { before: cellParam.qrxlevmin_before_cr ?? "-", after: cellParam.qrxlevmin_new ?? "-" };
  }
  // action_type la "skip" hoac null - khong co gia tri truoc/sau de xuat, tranh hien nham gia tri cua loai khac
  return { before: "-", after: "-" };
}

const columnHelper = createColumnHelper<CellParamDetailItem>();

// SUA (Viec 2, 22072026, xac nhan voi user): GOP nhieu bang rieng theo tung huong (1 bang/huong, truoc day
// tach o HuongCellTable) thanh 1 BANG DUY NHAT, them cot "Huong" de phan biet - de NOC sort/loc xuyen suot
// TOAN BO cell bat ke huong nao, thay vi phai doc rai rac nhieu bang nho
const CellParamsByHuong: React.FC<CellParamsByHuongProps> = ({ cellParams, sessionId }) => {
  const [sorting, setSorting] = useState<SortingState>([
    // mac dinh sort Huong tang dan roi Priority tang dan (Viec 2 yeu cau) - TanStack Table ho tro multi-sort
    // qua thu tu phan tu trong mang SortingState, phan tu dau la tieu chi CHINH
    { id: "huong_id", desc: false },
    { id: "priority", desc: false },
  ]);
  // Viec 5: phan trang mac dinh 5 dong/trang, selector 5/10/20/50 - giong cac bang khac trong module
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  // reset ve trang 1 khi doi cellParams (vd xem session khac) - tranh dung o trang cu co the vuot qua so
  // trang cua danh sach moi
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [cellParams]);

  // xuat TAT CA cell chung 1 sheet theo dung yeu cau - moi dong ung voi 1 cell, cot lay dung ten field yeu
  // cau: huong_id, cell_name, param_type, gia_tri_cu, gia_tri_moi, priority
  const handleExportExcel = () => {
    const rows = cellParams.map((cellParam) => {
      const { before, after } = resolveBeforeAfter(cellParam);
      return {
        huong_id: cellParam.huong_id ?? "-",
        cell_name: cellParam.cell_name,
        param_type: cellParam.action_type ?? "-",
        gia_tri_cu: before,
        gia_tri_moi: after,
        priority: cellParam.priority ?? "-",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CR Cells");
    // writeFile tu trigger download tren browser (SheetJS lo het phan tao Blob/anchor), khong can tu viet
    // logic download rieng
    XLSX.writeFile(workbook, `R012_CR_cells_${sessionId}_${formatTimestampForFileName(new Date())}.xlsx`);
  };

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "stt",
        header: "STT",
        enableSorting: false, // STT chi la vi tri hien thi theo thu tu DANG SAP XEP, sort cot nay khong co y nghia
        // STT tinh theo vi tri TUYET DOI (khong reset moi trang) - info.row.index la vi tri TRONG TRANG
        // hien tai (getPaginationRowModel, Viec 5), nen phai cong them offset cua trang
        cell: (info) => pagination.pageIndex * pagination.pageSize + info.row.index + 1,
      }),
      columnHelper.accessor("huong_id", {
        header: "Huong",
        cell: (info) => info.getValue() ?? "-", // co the null theo schema (cell khong xac dinh duoc huong)
      }),
      columnHelper.accessor("cell_name", { header: "Cell" }),
      columnHelper.accessor("action_type", {
        header: "Hanh dong",
        cell: (info) => info.getValue() ?? "-",
      }),
      columnHelper.accessor("priority", {
        header: "Priority",
        cell: (info) => info.getValue() ?? "-",
      }),
      columnHelper.display({
        id: "rsboost",
        header: "Rsboost (truoc -> moi)",
        enableSorting: false, // cot ghep 2 gia tri thanh 1 chuoi, KHONG phai 1 gia tri don co the sap xep tu nhien
        cell: (info) => {
          const row = info.row.original;
          return `${row.rsboost_before_cr ?? "-"} -> ${row.rsboost_new ?? "-"}`;
        },
      }),
      columnHelper.display({
        id: "qrxlevmin",
        header: "Qrxlevmin (truoc -> moi)",
        enableSorting: false,
        cell: (info) => {
          const row = info.row.original;
          return `${row.qrxlevmin_before_cr ?? "-"} -> ${row.qrxlevmin_new ?? "-"}`;
        },
      }),
    ],
    [pagination]
  );

  // Viec 5: them phan trang (truoc day KHONG phan trang, cellParams co the toi 47 cell se rat dai)
  const table = useReactTable({
    data: cellParams,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // nut export dat CHUNG cho ca 2 truong hop (co/khong co cell) - disable khi rong thay vi an han, de NOC
  // luon thay nut o cung 1 vi tri, khong bi giat layout giua 2 trang thai co/khong co du lieu
  const exportButton = (
    <Button onClick={handleExportExcel} disabled={cellParams.length === 0} style={{ marginBottom: "1rem" }}>
      {cellParams.length === 0 ? "Khong co du lieu de export" : "Export Excel"}
    </Button>
  );

  if (cellParams.length === 0) {
    // truong hop hoan tat nhung khong co cell nao thay doi (tat ca skip), hoac session chua co cell_params -
    // van la ket qua hop le, khong phai loi
    return (
      <div>
        {exportButton}
        <div>Khong co cell nao can dieu chinh.</div>
      </div>
    );
  }

  return (
    <div>
      {exportButton}
      <style>{`
        /* Viec 4: BO "width: 100%" - bang nay hien co 7 cot (them cot Huong sau khi gop, Viec 2), header
           "whiteSpace: nowrap" (SortableHeaderCell) nen co the rong hon Modal 800px (EvaluationDetail.tsx)
           - de bang GIU DUNG do rong tu nhien roi CUON qua div overflow-x:auto ben ngoai, KHONG bop cot */
        .r012-cellparams-table { border-collapse: collapse; white-space: nowrap; }
        .r012-cellparams-table thead th {
          text-align: left;
          padding: 10px 8px;
          background-color: ${R012_COLORS.tableHeaderBg};
          color: #ffffff;
          font-weight: 700;
          border: 1px solid ${R012_COLORS.primary};
        }
        .r012-cellparams-table tbody td {
          padding: 8px;
          border-bottom: 1px solid ${R012_COLORS.tableBorder};
        }
        .r012-cellparams-table tbody tr:nth-child(odd) { background-color: #ffffff; }
        .r012-cellparams-table tbody tr:nth-child(even) { background-color: ${R012_COLORS.tableRowAlt}; }
        .r012-cellparams-table tbody tr:hover { background-color: ${R012_COLORS.rowHoverBg}; }
      `}</style>
      {/* Viec 4: boc trong div overflow-x:auto de bang CUON NGANG rieng trong khung cua no khi rong hon
          Modal ben ngoai, KHONG lam vo layout Modal (giong cach da lam o QosEvaluationTable.tsx) */}
      <div style={{ overflowX: "auto" }}>
        <table className="r012-cellparams-table">
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
            {/* KHONG loc theo action_type - moi cell_param deu duoc render du la rsboost/qrxlevmin/skip, chi de
                "-" o cot khong ap dung cho loai do (vd cell rsboost se co "-" o cot Qrxlevmin) - neu 1 session
                that su khong co cell qrxlevmin nao thi cot do se toan "-", DAY LA DAC DIEM DU LIEU THAT (da
                xac nhan qua session that), KHONG PHAI loi an du lieu */}
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

      {/* Viec 5: Pagination cua antd chi la UI dieu khien - state that nam trong TanStack Table (bien
          "pagination"), giong cach da lam o AffectedStationsTable.tsx/QosEvaluationTable.tsx */}
      <Pagination
        current={pagination.pageIndex + 1}
        pageSize={pagination.pageSize}
        total={cellParams.length}
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

export default CellParamsByHuong;

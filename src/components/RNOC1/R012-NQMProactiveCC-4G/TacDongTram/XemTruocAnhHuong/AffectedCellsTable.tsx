import React, { useEffect, useMemo, useState } from "react";
import { OneLineCell } from "../../common/r012TableStyle";
import { Button, Pagination, Tag } from "antd";
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
// nhan hien thi cho ma co dinh cua nhanh HO (BUOC 4b, 08/10/2026) - xem WHY day du trong chinh file do
import { CELL_CO_LABELS, formatPctHo, layNhanLayer } from "../../helpers/hoLabels";

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
  // SUA (BUOC 4b, 08/10/2026) - WIDEN sang nullable: cell CAN_GHEP_TEN (nhanh HO, BE chua deploy) khong co
  // ten/ma tram - xem WHY day du o AffectedCellItem (types/index.ts)
  cell_name: string | null;
  tram_id: string | null; // ma tram cha - tram_id cua tram_bi_anh_huong chua cell nay
  huong_id: string | null;
  // 5 field OPTIONAL THEM (BUOC 4b) - undefined/[] cho nhanh CDS (BE cu)
  pct_ho?: number | null;
  so_ho?: number | null;
  sr?: number | null;
  layer?: string | null;
  co?: string[];
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
        pct_ho: c.pct_ho,
        so_ho: c.so_ho,
        sr: c.sr,
        layer: c.layer,
        co: c.co,
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
      // "(lan can)" - MOI cell trong bang nay la cell LAN CAN bi anh huong boi CR, KHONG phai cell cua
      // tram tat. Khong ghi ro de nguoi doc de nham, nhat la khi doi chieu voi cot "Cell anh huong" (cung
      // nghia, cell lan can) va "ID tram tat"/"Tram tat" (khac nghia, tram_goc) o bang Lich su phieu
      columnHelper.accessor("cell_name", {
        header: "Cell (lan can)",
        // SUA (BUOC 4b) - cell_name co the null (cell CAN_GHEP_TEN, nhanh HO) - hien "(chua co ten cell)"
        // thay vi OneLineCell rong de NOC biet NGAY la thieu du lieu, khong phai loi hien thi
        cell: (info) => (info.getValue() ? <OneLineCell value={info.getValue() as string} /> : "(chua co ten cell)"),
      }),
      columnHelper.accessor("tram_id", {
        header: "Ma tram (lan can)",
        cell: (info) => info.getValue() ?? "-", // SUA (BUOC 4b) - co the null cung voi cell_name (cell CAN_GHEP_TEN)
      }),
      columnHelper.accessor("huong_id", {
        header: "Huong",
        cell: (info) => info.getValue() ?? "-", // co the null theo schema AffectedCellItem
      }),
      // 4 cot MOI (BUOC 4b, 08/10/2026, BE chua deploy) - "—" khi undefined (nhanh CDS/BE cu chua tra)
      columnHelper.accessor("pct_ho", {
        header: "% HO",
        cell: (info) => formatPctHo(info.getValue()),
      }),
      columnHelper.accessor("so_ho", {
        header: "So HO",
        cell: (info) => info.getValue() ?? "—",
      }),
      columnHelper.accessor("sr", {
        header: "SR",
        cell: (info) => formatPctHo(info.getValue()),
      }),
      columnHelper.accessor("layer", {
        header: "Layer",
        cell: (info) => layNhanLayer(info.getValue()),
      }),
      columnHelper.accessor("co", {
        header: "Co",
        enableSorting: false, // mang Tag, khong co thu tu sap xep tu nhien
        cell: (info) => {
          const co = info.getValue();
          if (!co || co.length === 0) {
            return "—";
          }
          return (
            <>
              {co.map((ma) => (
                <Tag key={ma} color="orange">
                  {CELL_CO_LABELS[ma] ?? ma}
                </Tag>
              ))}
            </>
          );
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

  // export TOAN BO rows (khong chi trang dang xem) - MIRROR cac cot dang hien tren bang (THEM 5 cot HO,
  // BUOC 4b). gia tri % de RAW (0-1, khong *100) trong Excel - de nguoi dung tu dinh dang % trong Excel
  // thay vi FE tu nhan 100 (tranh nham don vi neu ho doi chieu lai voi so lieu goc)
  const handleExportExcel = () => {
    const exportRows = rows.map((r) => ({
      ma_tram: r.tram_id ?? "-",
      cell_name: r.cell_name ?? "(chua co ten cell)",
      huong_id: r.huong_id ?? "-",
      pct_ho: r.pct_ho ?? "",
      so_ho: r.so_ho ?? "",
      sr: r.sr ?? "",
      layer: layNhanLayer(r.layer),
      co: r.co && r.co.length > 0 ? r.co.map((ma) => CELL_CO_LABELS[ma] ?? ma).join(", ") : "-",
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
            .r012-affected-cells-table { border-collapse: collapse; }
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
            /* DA BO rule "th/td:nth-child(2) { white-space: nowrap; width: 1%; }" (07092026).
                 MUC DICH CU cua no: hoi bang con dung "width:100%" + table-layout:auto, dat width:1% len
                 cot Cell la meo chuan de trinh duyet cap cho cot do dung be rong noi dung roi chia phan du
                 cho cac cot khac, kem nowrap giu ten cell tren 1 dong.
                 VI SAO PHAI BO: tu khi gop CSS chung (.r012-table) bang co them "min-width: max-content",
                 va width:1% tro thanh THU PHAM lam bang tran ngang. Co che: phan tram tren o bang duoc
                 giai theo be rong BANG, nen "cot nay = 1% bang" cong voi noi dung khong co lai duoc
                 (nowrap, ~133px) bat trinh duyet suy ra be rong bang toi thieu ~ 133/0.01 = 13300px. Truoc
                 day "width:100%" con ghim bang vao container nen khong lo ra; them min-width:max-content
                 thi khong con gi ghim nua -> bang phinh ra that.
                 SO DO: noi dung that cua bang nay chi ~295px (CrCellsTable ~778px) - con xa 1920px, tuc
                 KHONG co ly do gi de tran neu khong co rule nay.
                 MUC DICH CU VAN DUOC GIU: .r012-table da dat "white-space: nowrap" cho MOI td/th (khong
                 rieng cot 2), va cot Cell dung OneLineCell (maxWidth + ellipsis + Tooltip) nen ten dai van
                 gon 1 dong. Bo rule nay KHONG mat gi. */
            .r012-affected-cells-table tbody tr:nth-child(odd) { background-color: #ffffff; }
            .r012-affected-cells-table tbody tr:nth-child(even) { background-color: ${R012_COLORS.tableRowAlt}; }
            .r012-affected-cells-table tbody tr:hover { background-color: ${R012_COLORS.rowHoverBg}; }
          `}</style>
          <div className="r012-table-scroll">
<table className="r012-table r012-affected-cells-table">
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

export default AffectedCellsTable;

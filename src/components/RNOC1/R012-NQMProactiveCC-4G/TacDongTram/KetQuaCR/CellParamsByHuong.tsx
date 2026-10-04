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

// Suy SECTOR cua TRAM TAT tu huong_id (04/10/2026, yeu cau truc tiep user). huong_id BE tra dang chuoi
// 2 ky tu "XY": X = ma band (rank uu tien, xem BAND_PRIORITY ben BE), Y = SECTOR cua TRAM TAT (Y = huong_id
// % 10). Truoc day cot nay hien NGUYEN VAN huong_id (vd "52") - de nguoi xem tuong day la 1 con so co y
// nghia khac han (vd nham thanh "band 2100" MHz) trong khi that ra chi la Y=2 (sector 2 cua tram tat) ghep
// voi X=5 (band). Hien dung Y (sector) moi la thong tin nguoi van hanh can: "cell lan can nay dang bu cho
// SECTOR NAO cua tram da tat".
// null khi huong_id null (cell khong xac dinh duoc huong) HOAC parse that bai (du lieu la, phong thu).
const tinhSectorTramTat = (huongId: string | null): number | null => {
  if (!huongId) {
    return null;
  }
  const so = Number(huongId);
  return Number.isNaN(so) ? null : so % 10;
};

// Nhan hien thi cho MA ly do "ngoai dieu kien moi" (THEM 04/10/2026, BE
// domain/services/danh_gia_dieu_kien_cr_moi.py) - ma la hop dong on dinh giua FE/BE, text la dien giai
// rieng cua FE. Ma la ngoai bang nay (BE them ma moi ma FE chua kip cap nhat) van hien duoc NGUYEN VAN ma
// do thay vi rong/vo - xem cell ben duoi
const NGOAI_DIEU_KIEN_MOI_LABELS: Record<string, string> = {
  BAND_KHONG_PHAI_1800: "Khong phai band 1800",
  KHONG_XAC_DINH_BAND: "Khong xac dinh band",
  VUOT_2_CELL_SECTOR: "Vuot 2 cell/sector",
};

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
    // mac dinh sort Sector tang dan roi Priority tang dan (Viec 2 yeu cau, doi tu "huong_id" sang "sector"
    // 04/10/2026 - xem WHY o tinhSectorTramTat phia tren) - TanStack Table ho tro multi-sort qua thu tu
    // phan tu trong mang SortingState, phan tu dau la tieu chi CHINH
    { id: "sector", desc: false },
    { id: "priority", desc: false },
  ]);
  // Viec 5: phan trang mac dinh 5 dong/trang, selector 5/10/20/50 - giong cac bang khac trong module
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  // reset ve trang 1 khi doi cellParams (vd xem session khac) - tranh dung o trang cu co the vuot qua so
  // trang cua danh sach moi
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [cellParams]);

  // xuat TAT CA cell chung 1 sheet theo dung yeu cau - moi dong ung voi 1 cell. MIRROR dung cot dang hien
  // tren bang: sector (suy tu huong_id, 04/10/2026), cell_name, param_type, gia_tri_cu, gia_tri_moi, priority
  const handleExportExcel = () => {
    const rows = cellParams.map((cellParam) => {
      const { before, after } = resolveBeforeAfter(cellParam);
      return {
        sector: tinhSectorTramTat(cellParam.huong_id) ?? "-",
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
      // "(tram tat)" - gia tri la SECTOR cua TRAM TAT (suy tu huong_id % 10), KHONG phai huong rieng cua
      // cell lan can o cot ben duoi - xem WHY day du o tinhSectorTramTat phia tren dau file
      columnHelper.accessor((row) => tinhSectorTramTat(row.huong_id), {
        id: "sector",
        header: "Sector (tram tat)",
        cell: (info) => info.getValue() ?? "—",
      }),
      // "(lan can)" - bang nay liet ke cac cell LAN CAN da duoc dieu chinh rsboost/qrxlevmin trong CR, khong
      // phai cell cua tram tat (tram tat khong co cell_params - no la doi tuong BI shutdown, khong phai
      // doi tuong duoc dieu chinh tham so)
      columnHelper.accessor("cell_name", {
        header: "Cell (lan can)",
        // OneLineCell: ellipsis + Tooltip lam duong lui cho ten dai bat thuong - xem
        // common/r012TableStyle.tsx
        cell: (info) => <OneLineCell value={info.getValue()} />,
      }),
      // THEM 04/10/2026 - cell co the co NHIEU ly do cung luc (BE tra list[str], khong phai 1 chuoi don) nen
      // hien NHIEU Tag canh nhau. Mang rong hoac undefined (BE .196 chua deploy truong nay) deu la "dat du
      // dieu kien moi, khong co gi de hien" - KHONG phai loi, hien "-" cho gon thay vi de o trong kho doc
      columnHelper.accessor("ngoai_dieu_kien_moi", {
        header: "Ngoai dieu kien moi",
        enableSorting: false, // mang, khong phai 1 gia tri don co the sap xep tu nhien
        cell: (info) => {
          const lyDoList = info.getValue();
          if (!lyDoList || lyDoList.length === 0) {
            return "-";
          }
          return (
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {lyDoList.map((ma) => (
                <Tag key={ma} color="orange">
                  {NGOAI_DIEU_KIEN_MOI_LABELS[ma] ?? ma}
                </Tag>
              ))}
            </div>
          );
        },
      }),
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
        .r012-cellparams-table { border-collapse: collapse; }
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
      <div className="r012-table-scroll">
        <table className="r012-table r012-cellparams-table">
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

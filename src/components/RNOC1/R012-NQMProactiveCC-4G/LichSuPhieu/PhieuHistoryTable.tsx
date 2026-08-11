import React, { useMemo, useState } from "react";
import { Alert, Button, Empty, Input, Pagination, Select, Spin, Tag } from "antd";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
// <th> dung chung cho MOI bang co sort trong module (click header + mui ten huong sort)
import { SortableHeaderCell } from "../common/SortableHeaderCell";
import { getLichSuPhieu } from "../services/R012Service";
import { PhieuHistoryItem, PhieuHistoryResponse } from "../types";
import { R012_COLORS } from "../theme";
// dinh dang thoi gian dung CHUNG toan module (ep UTC->GMT+7) - xem ly do trong file helper
import { formatDateTime } from "../helpers/formatDateTime";
import { PHIEU_STATUS_COLORS, PHIEU_STATUS_FILTER_OPTIONS } from "./phieuStatus";
import PhieuDetailModal from "./PhieuDetailModal";

interface PhieuHistoryTableProps {
  // KHONG truyen (undefined) -> hien phieu cua MOI session, dung cho tab rieng "Lich su phieu"
  // Co truyen -> chi hien phieu cua dung session do, dung trong chi tiet session CR (EvaluationDetail)
  sessionId?: number;
  // hien thanh cong cu loc (trang thai + tim cell) hay khong. Mac dinh: CHI hien khi dung o tab tat ca -
  // trong chi tiet 1 session so dong thuong rat it, them 1 thanh loc nua chi lam chat cho trong Modal
  showFilters?: boolean;
}

const columnHelper = createColumnHelper<PhieuHistoryItem>();

const PhieuHistoryTable: React.FC<PhieuHistoryTableProps> = ({ sessionId, showFilters }) => {
  // trong chi tiet 1 session so phieu it (bang so cell KHONG DAT) -> 10 dong/trang la du va giu Modal gon;
  // o tab tat ca thi dung 20 giong cac bang danh sach khac cua module
  const defaultSize = sessionId !== undefined ? 10 : 20;
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(defaultSize);

  // trang thai dang loc - "" nghia la khong gui param trang_thai (BE mac dinh AN DRY_RUN, xem phieuStatus.ts)
  const [statusFilter, setStatusFilter] = useState<string>("");

  // tu khoa loc theo ten cell. LUU Y: GET /api/v1/phieu KHONG co param tim kiem (chi co session_id/
  // trang_thai/page/size/sort_by/order) nen day la loc PHIA CLIENT tren cac dong CUA TRANG HIEN TAI -
  // KHONG debounce/goi lai API. Da ghi ro trong placeholder + dong ghi chu duoi bang de NOC khong hieu
  // nham la tim tren toan bo du lieu; khi nao BE bo sung param q thi doi sang loc server-side nhu
  // SessionHistoryList.tsx (co san pattern debounce o do)
  const [cellKeyword, setCellKeyword] = useState<string>("");

  // dong dang xem chi tiet - null nghia la Modal dang dong
  const [selectedPhieu, setSelectedPhieu] = useState<PhieuHistoryItem | null>(null);

  // sort SERVER-SIDE giong SessionHistoryList: SortingState CHI dieu khien icon mui ten, KHONG dang ky
  // getSortedRowModel (se sort lai lan 2 tren client, thua va co the nghich thu tu BE tra ve)
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleSortingChange = (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
    setSorting(updaterOrValue);
    setPage(1); // doi sort -> thu tu toan bo danh sach doi, trang cu khong con cung y nghia
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1); // doi bo loc -> ve trang 1, tranh hien trang trong gay hieu lam het du lieu
  };

  const handleClearFilters = () => {
    setStatusFilter("");
    setCellKeyword("");
    setPage(1);
  };

  // column.id cua cac cot accessor trung ten field that cua BE nen dung thang lam sort_by (quy uoc da dung
  // o GET /sessions). sorting rong = chua chon cot nao -> KHONG truyen sort_by/order, de BE tu dung thu tu
  // mac dinh cua no
  const sortBy = sorting.length > 0 ? sorting[0].id : undefined;
  const sortOrder: "asc" | "desc" | undefined = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined;

  const { data, isLoading, isError, error } = useQuery<PhieuHistoryResponse>({
    // sessionId nam trong queryKey de 2 noi dung component nay (tab tat ca / trong 1 session) KHONG dung
    // chung cache cua nhau; cac gia tri loc/sort cung vay de TanStack Query tu goi lai API khi chung doi
    queryKey: ["r012", "phieu-history", sessionId ?? "all", page, size, statusFilter, sortBy, sortOrder],
    queryFn: () =>
      getLichSuPhieu({
        session_id: sessionId,
        trang_thai: statusFilter || undefined,
        page,
        size,
        sort_by: sortBy,
        order: sortOrder,
      }),
  });

  // useMemo cho allRows (khong viet thang "data?.data ?? []"): nhanh fallback [] tao MANG MOI moi lan render,
  // lam deps cua useMemo loc cell ben duoi doi lien tuc -> loc lai vo ich moi render (ESLint da canh bao
  // dung cho truong hop nay luc build)
  const allRows = useMemo(() => data?.data ?? [], [data?.data]);
  const total = data?.total ?? 0;

  // loc theo cell tren du lieu CUA TRANG HIEN TAI (xem ly do o comment khai bao cellKeyword)
  const rows = useMemo(() => {
    const keyword = cellKeyword.trim().toLowerCase();
    if (keyword === "") return allRows;
    return allRows.filter((item) => item.cell_name.toLowerCase().includes(keyword));
  }, [allRows, cellKeyword]);

  const columns = useMemo(() => {
    const baseColumns: any[] = [
      columnHelper.display({
        id: "stt",
        header: "STT",
        enableSorting: false, // STT la vi tri hien thi, khong phai field that -> sort khong co y nghia
        cell: (info) => (page - 1) * size + info.row.index + 1,
      }),
      columnHelper.accessor("cell_name", { header: "Cell" }),
      columnHelper.accessor("trang_thai", {
        header: "Trang thai",
        cell: (info) => {
          const status = info.getValue();
          return <Tag color={PHIEU_STATUS_COLORS[status] ?? "default"}>{status}</Tag>;
        },
      }),
      columnHelper.accessor("phieu_id", {
        header: "Ma phieu",
        // phieu_id null khi FAILED/PENDING (chua co phieu ben TTS) - hien "-" thay vi o trong
        cell: (info) => info.getValue() ?? "-",
        // KHONG cho sort cot nay: sort theo ma phieu khong co y nghia nghiep vu, va cung tranh gui gia tri
        // sort_by chua duoc xac nhan nam trong enum cua BE
        enableSorting: false,
      }),
    ];

    // cot "Session" chi hien o tab TAT CA - khi dang xem trong chi tiet 1 session thi moi dong deu cung 1
    // gia tri, hien them 1 cot lap lai la thua cho
    if (sessionId === undefined) {
      baseColumns.push(
        columnHelper.accessor("cr_session_id", {
          header: "Session",
          cell: (info) => info.getValue() ?? "-",
          enableSorting: false, // chua xac nhan cr_session_id nam trong enum sort_by cua BE
        })
      );
    }

    baseColumns.push(
      columnHelper.accessor("created_at", {
        header: "Thoi diem",
        cell: (info) => formatDateTime(info.getValue()),
      })
    );

    return baseColumns;
  }, [page, size, sessionId]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
  });

  // mac dinh: chi hien thanh loc o tab tat ca (xem comment prop showFilters)
  const shouldShowFilters = showFilters ?? sessionId === undefined;

  return (
    <div>
      {shouldShowFilters && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "12px",
            padding: "12px",
            marginBottom: "1rem",
            backgroundColor: R012_COLORS.tableRowAlt,
            border: `1px solid ${R012_COLORS.primaryPale}`,
            borderRadius: "8px",
          }}
        >
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            options={PHIEU_STATUS_FILTER_OPTIONS}
            style={{ width: "200px" }}
          />
          <Input.Search
            // ghi RO "trong trang" ngay tren placeholder: day la loc client-side, khong phai tim toan bo
            placeholder="Loc theo cell (trong trang)"
            allowClear
            value={cellKeyword}
            onChange={(e) => setCellKeyword(e.target.value)}
            style={{ width: "260px" }}
          />
          <Button onClick={handleClearFilters}>Xoa loc</Button>
        </div>
      )}

      {isLoading && <Spin tip="Dang tai lich su phieu..." />}

      {isError && (
        <Alert
          type="error"
          message="Khong tai duoc lich su phieu"
          description={(error as Error)?.message || "Loi khong xac dinh"}
          style={{ marginBottom: "1rem" }}
        />
      )}

      {!isLoading && !isError && (
        <>
          {/* CSS scoped rieng cho bang nay (class r012-phieu-table) - dung DUNG token tu theme.ts de dong bo
              voi r012-session-table, khong hardcode hex o day */}
          <style>{`
            .r012-phieu-table { width: 100%; border-collapse: collapse; }
            .r012-phieu-table thead th {
              text-align: left;
              padding: 10px 8px;
              background-color: ${R012_COLORS.tableHeaderBg};
              color: #ffffff;
              font-weight: 700;
              border: 1px solid ${R012_COLORS.primary};
            }
            .r012-phieu-table tbody td {
              padding: 8px;
              border-bottom: 1px solid ${R012_COLORS.tableBorder};
            }
            .r012-phieu-table tbody tr { cursor: pointer; }
            .r012-phieu-table tbody tr:nth-child(odd) { background-color: #ffffff; }
            .r012-phieu-table tbody tr:nth-child(even) { background-color: ${R012_COLORS.tableRowAlt}; }
            /* dat SAU 2 rule nth-child o tren de cung specificity nhung dung sau se thang, khong can !important */
            .r012-phieu-table tbody tr:hover { background-color: ${R012_COLORS.rowHoverBg}; }
          `}</style>
          <table className="r012-phieu-table">
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
                // click 1 dong mo Modal chi tiet - truyen NGUYEN dong (da co du payload/response), khong goi lai API
                <tr key={row.id} onClick={() => setSelectedPhieu(row.original)}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length === 0 && (
            <Empty
              // phan biet 2 truong hop rong de NOC biet co phai do bo loc cell cua minh khong
              description={
                cellKeyword.trim() !== "" && allRows.length > 0
                  ? "Khong co cell nao khop trong trang nay"
                  : "Chua co phieu nao"
              }
              style={{ margin: "24px 0" }}
            />
          )}

          {/* Pagination dung total THAT tu BE. Khi dang loc cell client-side thi so dong hien thi co the it
              hon so dong cua trang - da co dong ghi chu ben duoi giai thich, KHONG sua total theo so dong
              da loc (lam vay se sai tong so ban ghi that va nhay lung tung khi go tung ky tu) */}
          <Pagination
            current={page}
            pageSize={size}
            total={total}
            showSizeChanger
            showTotal={(t) => `Tong ${t} phieu`}
            onChange={(newPage, newSize) => {
              // antd Pagination tra ve ca page va pageSize trong 1 callback, phai cap nhat ca 2 de dong bo voi BE
              setPage(newPage);
              setSize(newSize);
            }}
            style={{ marginTop: "1rem" }}
          />

          {cellKeyword.trim() !== "" && (
            <div style={{ marginTop: "8px", fontSize: "12px", color: R012_COLORS.statusRunning }}>
              Dang loc cell trong trang hien tai ({rows.length}/{allRows.length} dong) - bo loc nay khong ap
              dung cho cac trang khac.
            </div>
          )}
        </>
      )}

      <PhieuDetailModal phieu={selectedPhieu} onClose={() => setSelectedPhieu(null)} />
    </div>
  );
};

export default PhieuHistoryTable;

import React, { useMemo, useState } from "react";
import { Alert, Button, DatePicker, Empty, Pagination, Select, Spin, Tag } from "antd";
import { Dayjs } from "dayjs";
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
import { getJobRuns } from "../services/R012Service";
import { JobRunListItem, JobRunListResponse, JobRunSortBy, JobRunTrangThai } from "../types";
import { R012_COLORS } from "../theme";
// dinh dang thoi gian dung CHUNG toan module (ep UTC->GMT+7) - xem ly do trong file helper
import { formatDateTime } from "../helpers/formatDateTime";
import { JOB_RUN_STATUS_COLORS, JOB_RUN_STATUS_FILTER_OPTIONS } from "./jobRunStatus";
import JobRunDetailModal from "./JobRunDetailModal";

const { RangePicker } = DatePicker;

const columnHelper = createColumnHelper<JobRunListItem>();

const JobRunTable: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(20); // 20 la default cua BE theo schema JobRunQueryParams

  // trang thai dang loc - "" nghia la khong gui param trang_thai (BE tra ve ca 3 trang thai)
  const [statusFilter, setStatusFilter] = useState<"" | JobRunTrangThai>("");

  // khoang ngay dang loc (RangePicker) - null nghia la khong loc theo ngay
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  // luot chay dang xem chi tiet - null nghia la Modal dang dong. Chi giu ID (KHONG giu ca dong nhu
  // PhieuHistoryTable/PhieuDetailModal) vi dong danh sach KHONG chua chi_tiet - Modal phai tu goi
  // GET /jobs/runs/{id} de lay, giong cach EvaluationDetail lam voi session
  const [selectedJobRunId, setSelectedJobRunId] = useState<number | null>(null);

  // sort SERVER-SIDE giong SessionHistoryList/PhieuHistoryTable: SortingState CHI dieu khien icon mui ten,
  // KHONG dang ky getSortedRowModel (se sort lai lan 2 tren client, thua va co the nghich thu tu BE tra ve)
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleSortingChange = (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
    setSorting(updaterOrValue);
    setPage(1); // doi sort -> thu tu toan bo danh sach doi, trang cu khong con cung y nghia
  };

  const handleStatusFilterChange = (value: "" | JobRunTrangThai) => {
    setStatusFilter(value);
    setPage(1); // doi bo loc -> ve trang 1, tranh hien trang trong gay hieu lam het du lieu
  };

  // === CHO KHAC BIET QUAN TRONG NHAT so voi SessionHistoryList.tsx ===
  // SessionHistoryList gui from/to bang start.startOf("day").toISOString() vi GET /sessions nhan kieu
  // `datetime`. O day KHONG duoc lam vay: GET /jobs/runs nhan kieu `date` (NGAY LICH GMT+7) va TU quy doi
  // (_dau_ngay_gmt7(ngay), rieng den_ngay con duoc BE cong them 1 ngay de tinh tron ven ngay cuoi).
  // toISOString() se doi sang UTC -> ngay 12/08 00:00 gio VN thanh "2026-08-11T17:00:00Z", BE cat phan ngay
  // se ra 11/08 -> LECH 1 NGAY; chua ke chuoi co phan gio khac 00:00 con co the bi Pydantic tra 422.
  // Vi vay dung .format("YYYY-MM-DD") - lay dung ngay lich nguoi dung da chon tren lich, khong quy doi gi.
  const { tuNgay, denNgay } = useMemo(() => {
    if (!dateRange) {
      return { tuNgay: undefined as string | undefined, denNgay: undefined as string | undefined };
    }
    const [start, end] = dateRange;
    return {
      tuNgay: start.format("YYYY-MM-DD"),
      // KHONG can endOf("day") nhu ben /sessions: BE da tu cong 1 ngay cho den_ngay roi dung nua khoang
      // [tu, den+1), nen chi can gui dung ngay lich la ca ngay do da nam trong ket qua
      denNgay: end.format("YYYY-MM-DD"),
    };
  }, [dateRange]);

  // reset ve trang 1 khi doi bo loc ngay - tranh hien trang cu voi bo loc moi gay hieu lam het du lieu
  const handleDateRangeChange = (values: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(values && values[0] && values[1] ? [values[0], values[1]] : null);
    setPage(1);
  };

  const handleClearFilters = () => {
    setStatusFilter("");
    setDateRange(null);
    setPage(1);
  };

  // column.id cua cac cot accessor trung ten field that cua BE nen dung thang lam sort_by. sorting rong =
  // chua chon cot nao -> KHONG truyen sort_by/order, de BE tu dung thu tu mac dinh (started_at DESC)
  const sortBy = sorting.length > 0 ? (sorting[0].id as JobRunSortBy) : undefined;
  const sortOrder: "asc" | "desc" | undefined = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined;

  const { data, isLoading, isError, error } = useQuery<JobRunListResponse>({
    // moi gia tri anh huong toi request deu nam trong queryKey de TanStack Query TU goi lai API khi chung
    // doi, khong can effect/handler goi refetch thu cong
    queryKey: ["r012", "job-runs", page, size, statusFilter, tuNgay, denNgay, sortBy, sortOrder],
    queryFn: () =>
      getJobRuns({
        page,
        size,
        trang_thai: statusFilter || undefined, // "" (Tat ca) -> khong gui param, de BE tra ve ca 3 trang thai
        tu_ngay: tuNgay,
        den_ngay: denNgay,
        sort_by: sortBy,
        order: sortOrder,
      }),
  });

  const rows = useMemo(() => data?.data ?? [], [data?.data]);
  const total = data?.total ?? 0;

  const columns = useMemo(
    () => [
      columnHelper.accessor("started_at", {
        header: "Bat dau",
        cell: (info) => formatDateTime(info.getValue()),
        // "started_at" nam trong enum sort_by cua BE -> cho sort (va day cung la cot nguoi dung hay sort nhat)
      }),
      columnHelper.accessor("trang_thai", {
        header: "Trang thai",
        cell: (info) => {
          const status = info.getValue();
          return <Tag color={JOB_RUN_STATUS_COLORS[status] ?? "default"}>{status}</Tag>;
        },
        // "trang_thai" cung nam trong enum sort_by cua BE
      }),
      // DA BO cot "Che do" (Thu/That): hop dong BE moi bo hoan toan che do chay thu, job_run_log khong con
      // cot dry_run - moi luot chay deu la chay THAT nen cot nay chi con 1 gia tri, khong con gi de phan biet
      columnHelper.accessor("so_session_quet", {
        header: "Session quet",
        enableSorting: false, // cac cot so_* deu KHONG nam trong enum _JobRunSortBy cua BE
      }),
      columnHelper.accessor("so_phieu_thanh_cong", {
        header: "Phieu OK",
        enableSorting: false,
      }),
      columnHelper.accessor("so_phieu_that_bai", {
        header: "Phieu loi",
        enableSorting: false,
      }),
      columnHelper.accessor("so_cell_vuot_gioi_han", {
        header: "Cell vuot",
        enableSorting: false,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      {/* thanh cong cu loc - dung DUNG token mau tu theme.ts giong thanh loc cua PhieuHistoryTable/
          SessionHistoryList, khong bia mau moi.
          KHONG co o tim kiem tu do o day (nen cung khong can debounce nhu SessionHistoryList): GET
          /jobs/runs KHONG co param q/tu khoa nao - 1 dong la tong ket ca luot chay, khong co truong van
          ban de tim. RangePicker chi ban su kien 1 lan luc chon xong khoang ngay nen cung khong can debounce */}
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
          options={JOB_RUN_STATUS_FILTER_OPTIONS}
          style={{ width: "160px" }}
        />
        <RangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          // hien theo dinh dang quen thuoc cua NOC; gia tri gui len BE duoc format rieng thanh YYYY-MM-DD
          // o useMemo ben tren, KHONG lien quan toi format hien thi nay
          format="DD/MM/YYYY"
          placeholder={["Tu ngay", "Den ngay"]}
        />
        <Button onClick={handleClearFilters}>Xoa loc</Button>
      </div>

      {isLoading && <Spin tip="Dang tai lich su chay job..." />}

      {isError && (
        <Alert
          type="error"
          message="Khong tai duoc lich su chay job"
          description={(error as Error)?.message || "Loi khong xac dinh"}
          style={{ marginBottom: "1rem" }}
        />
      )}

      {!isLoading && !isError && (
        <>
          {/* CSS scoped rieng cho bang nay (class r012-jobrun-table) - dung DUNG token tu theme.ts de dong
              bo voi r012-phieu-table/r012-session-table, khong hardcode hex o day */}
          <style>{`
            .r012-jobrun-table { width: 100%; border-collapse: collapse; }
            .r012-jobrun-table thead th {
              text-align: left;
              padding: 10px 8px;
              background-color: ${R012_COLORS.tableHeaderBg};
              color: #ffffff;
              font-weight: 700;
              border: 1px solid ${R012_COLORS.primary};
            }
            .r012-jobrun-table tbody td {
              padding: 8px;
              border-bottom: 1px solid ${R012_COLORS.tableBorder};
            }
            .r012-jobrun-table tbody tr { cursor: pointer; }
            .r012-jobrun-table tbody tr:nth-child(odd) { background-color: #ffffff; }
            .r012-jobrun-table tbody tr:nth-child(even) { background-color: ${R012_COLORS.tableRowAlt}; }
            /* dat SAU 2 rule nth-child o tren de cung specificity nhung dung sau se thang, khong can !important */
            .r012-jobrun-table tbody tr:hover { background-color: ${R012_COLORS.rowHoverBg}; }
          `}</style>
          <table className="r012-jobrun-table">
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
                // click 1 dong mo Modal chi tiet - CHI truyen id, Modal tu goi GET /jobs/runs/{id} (dong
                // danh sach khong co chi_tiet)
                <tr key={row.id} onClick={() => setSelectedJobRunId(row.original.id)}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length === 0 && (
            <Empty
              // khac PhieuHistoryTable (co loc cell client-side nen phai phan biet 2 kieu rong): o day MOI
              // bo loc deu chay tren BE, rong nghia la khong co ban ghi nao khop - 1 thong bao la du
              description="Chua co luot chay job nao"
              style={{ margin: "24px 0" }}
            />
          )}

          <Pagination
            current={page}
            pageSize={size}
            total={total}
            showSizeChanger
            // khai bao TUONG MINH cac muc <= 100: BE gioi han size le=100 (thap hon /phieu la 200), de antd
            // tu quyet dinh danh sach mac dinh thi mot ban antd khac co the them muc lon hon -> 422
            pageSizeOptions={[10, 20, 50, 100]}
            showTotal={(t) => `Tong ${t} luot chay`}
            onChange={(newPage, newSize) => {
              // antd Pagination tra ve ca page va pageSize trong 1 callback, phai cap nhat ca 2 de dong bo voi BE
              setPage(newPage);
              setSize(newSize);
            }}
            style={{ marginTop: "1rem" }}
          />
        </>
      )}

      <JobRunDetailModal jobRunId={selectedJobRunId} onClose={() => setSelectedJobRunId(null)} />
    </div>
  );
};

export default JobRunTable;

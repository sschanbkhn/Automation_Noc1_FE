import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, DatePicker, Input, Modal, Pagination, Spin, Tag } from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
// dung debounce co san tu lodash (da la dependency co san trong package.json, StationSearchGrid.tsx cung
// dung cach nay) thay vi tu viet lai setTimeout/clearTimeout - tranh trung lap logic da duoc test san
import debounce from "lodash/debounce";
import { getSessions } from "../services/R012Service";
import { SessionListItem, SessionListResponse } from "../types";
import EvaluationDetail from "./EvaluationDetail";
// token mau dung chung toan module - xem theme.ts de biet ly do chon tung gia tri
import { R012_COLORS } from "../theme";
// dinh dang thoi gian dung CHUNG toan module (ep UTC->GMT+7) - xem ly do trong file helper
import { formatDateTime } from "../helpers/formatDateTime";

const { RangePicker } = DatePicker;

// khoi tao column helper rieng cho SessionListItem, giup TanStack Table bao dam kieu du lieu dung ngay luc khai bao cot
const columnHelper = createColumnHelper<SessionListItem>();

// mau Tag theo tung trang thai session - dung DUNG cac gia tri status that co the co tu BE
// (domain/entities/cr_session.py CrStatus: RUNNING/DONE/FAILED, + EVAL_PENDING/EVALUATED tu evaluate_cr_use_case.py)
const STATUS_COLORS: Record<string, string> = {
  RUNNING: "processing",
  DONE: "success",
  FAILED: "error",
  EVAL_PENDING: "warning",
  EVALUATED: "success",
  EVALUATING: "processing",
};

const SessionHistoryList: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(20); // 20 la default cua BE theo schema SessionsQueryParams

  // state luu session dang duoc xem chi tiet - null nghia la Modal dang dong
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  // searchInput: gia tri hien thi TRUC TIEP tren o Input.Search, cap nhat ngay khi go phim de khong bi
  // cam giac lag do cho debounce. searchTerm: gia tri THAT SU dung goi API (param q), chi doi sau khi
  // nguoi dung ngung go 400ms - tach 2 state giong pattern da dung o StationSearchGrid.tsx
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // khoang ngay dang loc (RangePicker) - null nghia la khong loc theo ngay
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const debouncedApplySearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
        setPage(1); // reset ve trang 1 khi doi tu khoa, tranh hien trang cu voi bo loc moi gay hieu lam het du lieu
      }, 400),
    []
  );

  useEffect(() => {
    // huy debounce dang cho khi component unmount, tranh goi setState tren component da unmount
    return () => {
      debouncedApplySearch.cancel();
    };
  }, [debouncedApplySearch]);

  // chuyen dateRange sang from/to dang ISO de goi API - 'to' PHAI la CUOI ngay (endOf day, 23:59:59.999)
  // chu KHONG phai 00:00:00 cua ngay ket thuc, neu khong se bi thieu toan bo du lieu trong ngay cuoi cung
  // duoc chon (bai hoc lap lai tu API CTS truoc do - cung 1 loai loi "cut mat 1 ngay" da tung gap)
  const { fromParam, toParam } = useMemo(() => {
    if (!dateRange) {
      return { fromParam: undefined as string | undefined, toParam: undefined as string | undefined };
    }
    const [start, end] = dateRange;
    return {
      fromParam: start.startOf("day").toISOString(),
      toParam: end.endOf("day").toISOString(),
    };
  }, [dateRange]);

  // reset ve trang 1 khi doi bo loc ngay - tranh hien trang cu voi bo loc moi gay hieu lam het du lieu
  const handleDateRangeChange = (values: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(values && values[0] && values[1] ? [values[0], values[1]] : null);
    setPage(1);
  };

  // nut "Xoa loc" dua tat ca bo loc (q/from/to) ve mac dinh va ve lai trang 1, giup NOC thoat nhanh khoi
  // 1 bo loc dang khong ra ket qua ma khong can xoa tung o thu cong
  const handleClearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setDateRange(null);
    setPage(1);
  };

  const { data, isLoading, isError, error } = useQuery<SessionListResponse>({
    // dua ca searchTerm/fromParam/toParam vao queryKey de TanStack Query TU goi lai API moi khi doi bo loc,
    // khong can effect/handler goi refetch thu cong
    queryKey: ["r012", "sessions", page, size, searchTerm, fromParam, toParam],
    queryFn: () =>
      getSessions({
        page,
        size,
        q: searchTerm || undefined, // khong gui q rong de tranh BE phai xu ly filter rong khong can thiet
        from: fromParam,
        to: toParam,
      }),
  });

  const sessions = data?.data ?? [];
  const total = data?.total ?? 0;

  // khai bao cot dung DUNG cac field that trong SessionListItem (types/index.ts), khong bia them cot
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "stt",
        header: "STT",
        cell: (info) => (page - 1) * size + info.row.index + 1, // tinh STT tu vi tri dong, khong phai du lieu that tu BE
      }),
      columnHelper.accessor("tram_id", { header: "Ma tram" }),
      columnHelper.accessor("tram_name", {
        header: "Ten tram",
        cell: (info) => info.getValue() ?? "-", // co the null theo schema
      }),
      columnHelper.accessor("action", { header: "Hanh dong" }),
      columnHelper.accessor("status", {
        header: "Trang thai",
        cell: (info) => {
          const status = info.getValue();
          return <Tag color={STATUS_COLORS[status] ?? "default"}>{status}</Tag>;
        },
      }),
      columnHelper.accessor("executed_at", {
        header: "Thoi gian thuc thi",
        cell: (info) => formatDateTime(info.getValue()),
      }),
      columnHelper.accessor("created_at", {
        header: "Thoi gian tao",
        cell: (info) => formatDateTime(info.getValue()),
      }),
    ],
    [page, size]
  );

  const table = useReactTable({
    data: sessions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      {/* thanh cong cu loc: khoang ngay + tim theo tram + xoa loc - nen/vien dung token xanh duong tu theme.ts
          de dong bo voi mau bang ben duoi, KHONG bia mau moi ngoai bang mau da chot cua module */}
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
        <RangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          format="DD/MM/YYYY"
          placeholder={["Tu ngay", "Den ngay"]}
        />
        <Input.Search
          placeholder="Tim theo ma tram / ten tram"
          allowClear
          // value dieu khien boi searchInput (cap nhat ngay) chu KHONG phai searchTerm (cap nhat tre 400ms),
          // de o input luon hien dung ky tu vua go, khong bi giat/tre do cho debounce
          value={searchInput}
          onChange={(e) => {
            const value = e.target.value;
            setSearchInput(value);
            debouncedApplySearch(value);
          }}
          style={{ width: "260px" }}
        />
        <Button onClick={handleClearFilters}>Xoa loc</Button>
      </div>

      {isLoading && <Spin tip="Dang tai lich su CR..." />}

      {isError && (
        <Alert
          type="error"
          message="Khong tai duoc lich su CR"
          description={(error as Error)?.message || "Loi khong xac dinh"}
          style={{ marginBottom: "1rem" }}
        />
      )}

      {!isLoading && !isError && (
        <>
          {/* CSS scoped rieng cho bang nay (class r012-session-table) - dat header dam mau + dong xen ke +
              hover, dung DUNG token tu theme.ts (khong hardcode hex o day) de dong bo voi StationSearchGrid.
              Ky thuat nth-child giong cach da khao sat o R003Monitor.tsx, khong can them thu vien CSS-in-JS moi */}
          <style>{`
            .r012-session-table { width: 100%; border-collapse: collapse; }
            .r012-session-table thead th {
              text-align: left;
              padding: 10px 8px;
              background-color: ${R012_COLORS.tableHeaderBg};
              color: #ffffff;
              font-weight: 700;
              border: 1px solid ${R012_COLORS.primary};
            }
            .r012-session-table tbody td {
              padding: 8px;
              border-bottom: 1px solid ${R012_COLORS.tableBorder};
            }
            .r012-session-table tbody tr { cursor: pointer; }
            .r012-session-table tbody tr:nth-child(odd) { background-color: #ffffff; }
            .r012-session-table tbody tr:nth-child(even) { background-color: ${R012_COLORS.tableRowAlt}; }
            /* dat SAU 2 rule nth-child o tren de cung specificity nhung dung sau se thang, khong can !important */
            .r012-session-table tbody tr:hover { background-color: ${R012_COLORS.rowHoverBg}; }
          `}</style>
          <table className="r012-session-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  // click 1 dong mo Modal EvaluationDetail cho dung session_id cua dong do
                  onClick={() => setSelectedSessionId(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            current={page}
            pageSize={size}
            total={total}
            onChange={(newPage, newSize) => {
              // antd Pagination tra ve ca page va pageSize trong 1 callback, phai cap nhat ca 2 de dong bo voi BE
              setPage(newPage);
              setSize(newSize);
            }}
            style={{ marginTop: "1rem" }}
          />
        </>
      )}

      {/* Modal don gian de xem chi tiet 1 session - chon Modal thay vi view rieng vi don gian hon, dung theo yeu cau */}
      <Modal
        title={`Chi tiet session CR #${selectedSessionId ?? ""}`}
        open={selectedSessionId !== null}
        onCancel={() => setSelectedSessionId(null)}
        footer={null}
        width={800}
      >
        {/* EvaluationDetail tu goi API rieng theo sessionId, khong can SessionHistoryList truyen du lieu xuong */}
        <EvaluationDetail sessionId={selectedSessionId} />
      </Modal>
    </div>
  );
};

export default SessionHistoryList;

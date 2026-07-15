import React, { useMemo, useState } from "react";
import { Alert, Modal, Pagination, Spin, Tag } from "antd";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { getSessions } from "../services/R012Service";
import { SessionListItem, SessionListResponse } from "../types";
import EvaluationDetail from "./EvaluationDetail";

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

// dinh dang thoi gian ISO tu BE sang gio dia phuong de NOC de doc, tra "-" khi null (executed_at/evaluated_at
// co the null theo schema - session chua thuc thi/chua danh gia)
const formatDateTime = (value: string | null): string => (value ? new Date(value).toLocaleString("vi-VN") : "-");

const SessionHistoryList: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(20); // 20 la default cua BE theo schema SessionsQueryParams

  // state luu session dang duoc xem chi tiet - null nghia la Modal dang dong
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  const { data, isLoading, isError, error } = useQuery<SessionListResponse>({
    queryKey: ["r012", "sessions", page, size],
    queryFn: () => getSessions({ page, size }),
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
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0", padding: "8px" }}
                    >
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
                  style={{ cursor: "pointer" }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} style={{ borderBottom: "1px solid #f1f5f9", padding: "8px" }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
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

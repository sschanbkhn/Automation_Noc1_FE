// Muc "Tien trinh" cua tab Lich su phieu: moi dong la 1 session CR dang di qua vong doi nhieu ngay
// (chay CR -> cho thu thap KPI -> xuat phieu), tra loi DUY NHAT mot cau hoi "session nao dang ket o dau".
//
// TAI SAO nam trong tab "Lich su phieu" chu khong phai tab "Lich su CR": 3 cot chinh cua bang nay (tien
// trinh / phieu / con lai) deu la chuyen XUAT PHIEU - tien do o day chinh la "con bao lau nua thi co
// phieu". Tab Lich su CR tra loi cau hoi khac han: "phien CR do da chay ra sao" (tham so tung cell, log
// tung buoc, danh gia chat luong).
import React, { useMemo, useState } from "react";
import { Alert, Button, Empty, Pagination, Select, Spin } from "antd";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { getSessions } from "../services/R012Service";
import { SessionListItem, SessionListResponse } from "../types";
import { R012_COLORS } from "../theme";
// dinh dang thoi gian dung CHUNG toan module (ep UTC->GMT+7) - xem ly do trong file helper
import { formatDateTime } from "../helpers/formatDateTime";
import {
  TienTrinhProgress,
  PhieuCell,
  ConLaiCell,
  TIEN_TRINH_FILTER_OPTIONS,
  TIEN_TRINH_TAT_CA,
  layParamTienTrinh,
} from "./tienTrinh";

const columnHelper = createColumnHelper<SessionListItem>();

interface TienTrinhTableProps {
  // Bam vao ma tram -> chuyen sang tab "Lich su CR" va loc san session cua tram do.
  // TAI SAO khong cho bam ca dong de mo Modal chi tiet nhu bang Lich su CR dang lam: chi tiet 1 session DA
  // CO SAN o tab Lich su CR (Modal EvaluationDetail: log tung buoc, ket qua theo huong, danh gia chat
  // luong, lich su phieu). Mo them 1 duong vao thu hai cho cung mot noi dung la trung lap, va sinh ra dung
  // cai kho chiu "co 2 cho xem cung 1 thu, khong biet nen vao duong nao / 2 cho co giong nhau khong".
  // Thay vi nhan ban, bang nay DAN NGUOI DUNG sang dung cho da co - va loc san de khong phai tu tim lai
  onXemLichSuCR: (tramId: string) => void;
}

const TienTrinhTable: React.FC<TienTrinhTableProps> = ({ onXemLichSuCR }) => {
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(20); // 20 = default cua BE theo schema SessionsQueryParams

  // buoc tien trinh dang loc - "" = Tat ca. Gia tri nay dieu khien CA HAI param ?buoc= va ?qua_han=,
  // xem ly do gop 1 Select trong tienTrinh.tsx
  const [tienTrinhFilter, setTienTrinhFilter] = useState<string>(TIEN_TRINH_TAT_CA);

  const handleTienTrinhFilterChange = (value: string) => {
    setTienTrinhFilter(value);
    setPage(1); // doi bo loc -> ve trang 1, dang o trang 3 ma loc lai se ra bang trong du van con du lieu
  };

  const paramTienTrinh = layParamTienTrinh(tienTrinhFilter);

  const { data, isLoading, isError, error } = useQuery<SessionListResponse>({
    // dung tienTrinhFilter (chuoi cua Select) trong queryKey chu KHONG phai paramTienTrinh: object duoc tao
    // moi moi lan render nen queryKey se doi lien tuc -> refetch vo han
    queryKey: ["r012", "sessions", "tien-trinh", page, size, tienTrinhFilter],
    queryFn: () =>
      getSessions({
        page,
        size,
        // buoc/qua_han: chi 1 trong 2 co gia tri (hoac khong cai nao khi chon "Tat ca")
        ...paramTienTrinh,
        // sap xep theo ngay chay CR moi nhat truoc - session moi la session dang duoc theo doi
        sort_by: "executed_at",
        order: "desc",
      }),
  });

  const sessions = data?.data ?? [];
  const total = data?.total ?? 0;

  const columns = useMemo(
    () => [
      columnHelper.accessor("tram_id", {
        header: "Ma tram",
        // Link sang tab Lich su CR (xem ly do day du o comment prop onXemLichSuCR). Dung Button type="link"
        // thay vi the <a>: khong co URL that de dieu huong (day la doi tab trong cung 1 trang), the <a>
        // href="#" se lam ban do cuon len dau trang khi bam
        cell: (info) => (
          <Button type="link" style={{ padding: 0 }} onClick={() => onXemLichSuCR(info.getValue())}>
            {info.getValue()}
          </Button>
        ),
      }),
      columnHelper.accessor("tram_name", {
        header: "Ten tram",
        cell: (info) => info.getValue() ?? "-", // co the null theo schema
      }),
      columnHelper.accessor("executed_at", {
        header: "Ngay CR",
        cell: (info) => formatDateTime(info.getValue()),
      }),
      columnHelper.accessor("buoc_hien_tai", {
        header: "Tien trinh",
        cell: (info) => <TienTrinhProgress session={info.row.original} />,
      }),
      columnHelper.accessor("so_phieu_da_xuat", {
        header: "Phieu",
        cell: (info) => <PhieuCell session={info.row.original} />,
      }),
      columnHelper.accessor("con_bao_nhieu_ngay", {
        header: "Con lai",
        cell: (info) => <ConLaiCell session={info.row.original} />,
      }),
    ],
    [onXemLichSuCR]
  );

  // KHONG dang ky getSortedRowModel va KHONG bat sort tren header: enum sort_by cua BE khong chua
  // buoc_hien_tai/so_phieu_da_xuat/con_bao_nhieu_ngay (da doi chieu openapi.json that), bat sort cho cac
  // cot do se gui sort_by ngoai enum -> BE tra 422 -> bang trang. Thu tu hien thi do BE quyet dinh qua
  // sort_by=executed_at truyen o queryFn
  const table = useReactTable({
    data: sessions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
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
          value={tienTrinhFilter}
          onChange={handleTienTrinhFilterChange}
          options={TIEN_TRINH_FILTER_OPTIONS}
          style={{ width: "190px" }}
          prefix="Tien trinh:"
        />
      </div>

      {isLoading && <Spin tip="Dang tai tien trinh..." />}

      {isError && (
        <Alert
          type="error"
          message="Khong tai duoc tien trinh"
          description={(error as Error)?.message || "Loi khong xac dinh"}
          style={{ marginBottom: "1rem" }}
        />
      )}

      {!isLoading && !isError && (
        <>
          {sessions.length === 0 ? (
            <Empty description="Khong co session nao khop bo loc" />
          ) : (
            <>
              {/* CSS scoped rieng cho bang nay - dung DUNG token tu theme.ts (khong hardcode hex), giong
                  quy uoc cua cac bang khac trong module.
                  KHONG co rule "tbody tr { cursor: pointer }" nhu bang Lich su CR: ca dong o day KHONG bam
                  duoc, chi rieng ma tram la link. De con tro hinh ban tay tren ca dong se moi nguoi dung
                  bam vao cho khong co gi xay ra */}
              <style>{`
                .r012-tien-trinh-table { width: 100%; border-collapse: collapse; }
                .r012-tien-trinh-table thead th {
                  text-align: left;
                  padding: 10px 8px;
                  background-color: ${R012_COLORS.tableHeaderBg};
                  color: #ffffff;
                  font-weight: 700;
                  border: 1px solid ${R012_COLORS.primary};
                }
                .r012-tien-trinh-table tbody td {
                  padding: 8px;
                  border-bottom: 1px solid ${R012_COLORS.tableBorder};
                }
                .r012-tien-trinh-table tbody tr:nth-child(odd) { background-color: #ffffff; }
                .r012-tien-trinh-table tbody tr:nth-child(even) { background-color: ${R012_COLORS.tableRowAlt}; }
                .r012-tien-trinh-table tbody tr:hover { background-color: ${R012_COLORS.rowHoverBg}; }
              `}</style>
              <table className="r012-tien-trinh-table">
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
                    <tr key={row.id}>
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
                showSizeChanger
                pageSizeOptions={[10, 20, 50, 100]}
                showTotal={(t) => `Tong ${t} session`}
                onChange={(newPage, newSize) => {
                  setPage(newPage);
                  setSize(newSize);
                }}
                style={{ marginTop: "1rem" }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TienTrinhTable;

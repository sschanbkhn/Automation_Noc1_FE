// Muc "Tien trinh" cua tab Lich su phieu: moi dong la 1 session CR dang di qua vong doi nhieu ngay
// (chay CR -> cho thu thap KPI -> xuat phieu), tra loi DUY NHAT mot cau hoi "session nao dang ket o dau".
//
// TAI SAO nam trong tab "Lich su phieu" chu khong phai tab "Lich su CR": 3 cot chinh cua bang nay (tien
// trinh / phieu / con lai) deu la chuyen XUAT PHIEU - tien do o day chinh la "con bao lau nua thi co
// phieu". Tab Lich su CR tra loi cau hoi khac han: "phien CR do da chay ra sao" (tham so tung cell, log
// tung buoc, danh gia chat luong).
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, DatePicker, Empty, Input, Pagination, Select, Spin } from "antd";
import { Dayjs } from "dayjs";
// debounce co san tu lodash (SessionHistoryList/PhieuHistoryTable cung dung cach nay)
import debounce from "lodash/debounce";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { getSessions } from "../services/R012Service";
import { SessionListItem, SessionListResponse } from "../types";
import { R012_COLORS } from "../theme";
import { OneLineCell } from "../common/r012TableStyle";
import {
  BatDauCell,
  KetThucCell,
  TienTrinhBar,
  TrangThaiTienTrinhText,
  CellProvisionCell,
  PhieuCell,
  ConLaiCell,
  TIEN_TRINH_FILTER_OPTIONS,
  TIEN_TRINH_TAT_CA,
  layParamTienTrinh,
} from "./tienTrinh";

const { RangePicker } = DatePicker;

const columnHelper = createColumnHelper<SessionListItem>();

// danh sach muc so dong/trang - khai bao TUONG MINH de moi ban antd deu ra cung 1 danh sach
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

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
  // 10 dong/trang thay vi 20 (default cua BE): bang nay co nhieu cot rong (thanh tien do, phieu, DN) nen
  // 20 dong phai cuon het man hinh moi thay Pagination. Van gui size tuong minh len BE
  const [size, setSize] = useState<number>(10);

  // tim theo ma tram / ten tram - tach 2 state giong SessionHistoryList: searchInput hien ngay tren o
  // (khong giat khi go), searchTerm moi la gia tri that su goi API sau khi ngung go 400ms
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // khoang ngay CR dang loc (RangePicker) - null nghia la khong loc theo ngay
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  // buoc tien trinh dang loc - "" = Tat ca. Gia tri nay dieu khien CA HAI param ?buoc= va ?qua_han=,
  // xem ly do gop 1 Select trong tienTrinh.tsx
  const [tienTrinhFilter, setTienTrinhFilter] = useState<string>(TIEN_TRINH_TAT_CA);

  const handleTienTrinhFilterChange = (value: string) => {
    setTienTrinhFilter(value);
    setPage(1); // doi bo loc -> ve trang 1, dang o trang 3 ma loc lai se ra bang trong du van con du lieu
  };

  const debouncedApplySearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
        setPage(1);
      }, 400),
    []
  );

  useEffect(() => {
    return () => {
      debouncedApplySearch.cancel(); // huy lan go dang cho khi unmount (doi Segmented la unmount ngay)
    };
  }, [debouncedApplySearch]);

  // === CHO PHAI CAN THAN: /sessions nhan from/to kieu `datetime`, KHONG phai `date` ===
  // KHAC HAN /phieu va /jobs/runs (2 endpoint do nhan `date` nen phai gui "YYYY-MM-DD", gui ISO se lech
  // 1 ngay). O day nguoc lai: DA THU THAT tren BE .196:8080 - gui to=2026-08-13 (dang YYYY-MM-DD) tra ve
  // 0 dong, con to=2026-08-13T23:59:59 tra ve 1 dong. Ly do: Pydantic doi "2026-08-13" thanh 00:00:00 nen
  // CAT MAT tron ngay cuoi. Vi vay phai dung toISOString() cua endOf("day") - dung y het cach
  // SessionHistoryList.tsx da lam cho cung endpoint nay
  const { fromParam, toParam } = useMemo(() => {
    if (!dateRange) {
      return { fromParam: undefined as string | undefined, toParam: undefined as string | undefined };
    }
    const [start, end] = dateRange;
    return { fromParam: start.startOf("day").toISOString(), toParam: end.endOf("day").toISOString() };
  }, [dateRange]);

  const handleDateRangeChange = (values: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(values && values[0] && values[1] ? [values[0], values[1]] : null);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    debouncedApplySearch.cancel(); // huy lan go dang cho, neu khong no ghi de searchTerm rong sau 400ms
    setDateRange(null);
    setTienTrinhFilter(TIEN_TRINH_TAT_CA);
    setPage(1);
  };

  const paramTienTrinh = layParamTienTrinh(tienTrinhFilter);

  const { data, isLoading, isError, error } = useQuery<SessionListResponse>({
    // dung tienTrinhFilter (chuoi cua Select) trong queryKey chu KHONG phai paramTienTrinh: object duoc tao
    // moi moi lan render nen queryKey se doi lien tuc -> refetch vo han
    queryKey: ["r012", "sessions", "tien-trinh", page, size, tienTrinhFilter, searchTerm, fromParam, toParam],
    queryFn: () =>
      getSessions({
        page,
        size,
        q: searchTerm || undefined, // khong gui q rong de BE khoi chay ILIKE thua
        from: fromParam,
        to: toParam,
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
      columnHelper.display({
        id: "stt",
        header: "STT",
        // tinh tu vi tri dong + offset trang (phan trang chay tren BE nen row.index la vi tri TRONG TRANG)
        cell: (info) => (page - 1) * size + info.row.index + 1,
      }),
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
        cell: (info) => <OneLineCell value={info.getValue()} />,
      }),
      // TRUOC DAY cot nay ten "Ngay CR" va doc executed_at - SAI o 2 diem: (1) executed_at la moc KET THUC
      // (ghi o buoc 17) chu khong phai "ngay CR" chung chung; (2) no NULL voi moi session FAILED (24/52
      // dong tren du lieu that) nen dung 1 nua bang khong hien ngay gi ca, du session do CO chay va CO moc
      // thoi gian - chi la chet giua chung. Gio hien ca 2 moc, xem ThoiGianCrCell
      columnHelper.accessor("created_at", {
        header: "Bat dau",
        cell: (info) => <BatDauCell session={info.row.original} />,
      }),
      columnHelper.accessor("executed_at", {
        header: "Ket thuc",
        cell: (info) => <KetThucCell session={info.row.original} />,
      }),
      // TACH lam 2 cot: thanh tien do va chu trang thai. Truoc day chung nam chung 1 o - o do rong gan gap
      // doi cac cot khac va la cho bop moi cot con lai khi bang co them cot (STT/DN vua them)
      columnHelper.accessor("buoc_hien_tai", {
        header: "Tien trinh",
        cell: (info) => <TienTrinhBar session={info.row.original} />,
      }),
      columnHelper.accessor("status", {
        header: "Trang thai",
        cell: (info) => <TrangThaiTienTrinhText session={info.row.original} />,
      }),
      columnHelper.accessor("so_phieu_da_xuat", {
        // "Phieu/Cell" - o hien dang phan so so_phieu_da_xuat/so_cell_anh_huong, ten cot noi luon 2 ve cua
        // phan so la gi nen khong can tooltip giai thich them
        header: "Phieu/Cell",
        cell: (info) => <PhieuCell session={info.row.original} />,
      }),
      columnHelper.accessor("con_bao_nhieu_ngay", {
        header: "Con lai",
        cell: (info) => <ConLaiCell session={info.row.original} />,
      }),
      columnHelper.display({
        id: "cell_provision",
        header: "Cell",
        cell: (info) => <CellProvisionCell session={info.row.original} />,
      }),
    ],
    [onXemLichSuCR, page, size]
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
        <RangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          format="DD/MM/YYYY"
          placeholder={["Ngay CR tu", "den"]}
        />
        <Input.Search
          placeholder="Tim theo ma tram / ten tram"
          allowClear
          // value theo searchInput (cap nhat ngay tung phim) chu KHONG phai searchTerm (tre 400ms), de o
          // input khong bi giat khi go
          value={searchInput}
          onChange={(e) => {
            const value = e.target.value;
            setSearchInput(value);
            debouncedApplySearch(value);
          }}
          style={{ flex: "1 1 220px", minWidth: "180px", maxWidth: "260px" }}
        />
        <Select
          value={tienTrinhFilter}
          onChange={handleTienTrinhFilterChange}
          options={TIEN_TRINH_FILTER_OPTIONS}
          style={{ width: "190px" }}
          prefix="Tien trinh:"
        />
        <Button onClick={handleClearFilters}>Xoa loc</Button>
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
                .r012-tien-trinh-table { border-collapse: collapse; }
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
              <div className="r012-table-scroll">
<table className="r012-table r012-tien-trinh-table">
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
</div>

              <Pagination
                current={page}
                pageSize={size}
                total={total}
                showSizeChanger
                pageSizeOptions={PAGE_SIZE_OPTIONS}
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

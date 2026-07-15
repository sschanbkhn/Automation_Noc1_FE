import React, { useMemo, useState } from "react";
import { Input, Pagination, Button, Alert, Spin } from "antd";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useStations } from "../../hooks/useStations";
import { StationItem } from "../../types";

// props nhan tu TacDongTram.tsx: ham nay duoc goi khi NOC bam nut "Trigger CR" cho 1 tram
// TacDongTram.tsx se dung ham nay de mo ConfirmTriggerModal va truyen dung station da chon xuong modal
interface StationSearchGridProps {
  onTriggerCr: (station: StationItem) => void;
}

// khoi tao column helper rieng cho kieu StationItem, giup TanStack Table bao dam kieu du lieu dung ngay luc khai bao cot
const columnHelper = createColumnHelper<StationItem>();

const StationSearchGrid: React.FC<StationSearchGridProps> = ({ onTriggerCr }) => {
  // state cho tu khoa tim kiem - dung 1 state duy nhat vi thiet ke da chot dung 1 o search chung
  // thay vi nhieu input rieng cho tung field (ID/ten/dia danh/CSHT), tranh UI room roi va giam so lan goi API
  // khi go nhieu input cung luc; nguoi dung go 1 cho, BE tu tim theo bat ky field nao khop
  const [searchTerm, setSearchTerm] = useState<string>("");

  // state phan trang - can gui dung len BE qua param page/size cua GET /api/v1/stations
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(50); // 50 la default cua BE theo schema StationsQueryParams

  // state luu station dang duoc chon (bang click vao 1 dong) - chi la local state trong component nay,
  // dung de hien nut "Trigger CR" cho dung tram vua click, chua can Context/Redux vi pham vi dung chi trong Zone A
  const [selectedStation, setSelectedStation] = useState<StationItem | null>(null);

  // goi hook that, truyen dung q/page/size khop voi StationsQueryParams va tham so ma getStations dang nhan
  const { data, isLoading, isError, error } = useStations({
    q: searchTerm || undefined, // khong gui q rong de tranh BE phai xu ly filter rong khong can thiet
    page,
    size,
  });

  // du lieu tram lay tu response that, fallback mang rong khi chua co data (dang loading lan dau)
  const stations = data?.data ?? [];
  const total = data?.total ?? 0;

  // khai bao cot bang dung DUNG cac field co that trong StationItem (types/index.ts) - khong bia them cot
  // STT khong phai field tu BE, chi la so thu tu hien thi tinh theo vi tri dong + trang hien tai
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "stt",
        header: "STT",
        cell: (info) => (page - 1) * size + info.row.index + 1, // tinh STT tu vi tri dong, khong phai du lieu that tu BE
      }),
      columnHelper.accessor("tram_id", {
        header: "Ma tram",
      }),
      columnHelper.accessor("tram_name", {
        header: "Ten tram",
      }),
      columnHelper.accessor("ten_quan_ly", {
        header: "Don vi quan ly",
        cell: (info) => info.getValue() ?? "-", // field co the null theo schema, hien "-" khi khong co du lieu
      }),
      columnHelper.accessor("ma_csht", {
        header: "Ma CSHT",
        cell: (info) => info.getValue() ?? "-", // field co the null theo schema
      }),
      columnHelper.accessor("trang_thai", {
        header: "Trang thai",
      }),
      columnHelper.accessor("cr_status", {
        header: "Trang thai CR",
        cell: (info) => info.getValue() ?? "-", // field co the null theo schema (tram chua tung trigger CR)
      }),
    ],
    [page, size]
  );

  // khoi tao table instance cua TanStack Table v8 - chi dung getCoreRowModel vi phan trang/loc da xu ly o phia BE (server-side)
  const table = useReactTable({
    data: stations,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // ham xu ly khi click 1 dong - luu station vao local state de hien nut Trigger CR cho dung tram do
  const handleRowClick = (station: StationItem) => {
    setSelectedStation(station);
  };

  return (
    <div>
      <Input.Search
        placeholder="Tim theo ma tram / ten tram / dia danh / CSHT"
        allowClear
        onSearch={(value) => {
          // reset ve trang 1 khi doi tu khoa tim kiem, tranh hien thi trang cu voi bo loc moi gay hieu lam khong con du lieu
          setSearchTerm(value);
          setPage(1);
        }}
        style={{ marginBottom: "1rem" }}
      />

      {/* hien loading ro rang khi dang cho BE tra du lieu, tranh hien bang rong gay hieu lam la khong co tram nao */}
      {isLoading && <Spin tip="Dang tai danh sach tram..." />}

      {/* hien loi ro rang khi goi API that bai, khong de UI crash hoac im lang khong bao gi */}
      {isError && (
        <Alert
          type="error"
          message="Khong tai duoc danh sach tram"
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
                  onClick={() => handleRowClick(row.original)}
                  style={{
                    cursor: "pointer",
                    // highlight dong dang chon de NOC biet ro minh vua click tram nao truoc khi bam Trigger CR
                    backgroundColor:
                      selectedStation?.tram_id === row.original.tram_id ? "#e6f7ff" : undefined,
                  }}
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

      {/* nut Trigger CR chi hien khi da chon 1 tram, tranh NOC bam nham khi chua xac dinh tram nao */}
      {selectedStation && (
        <div style={{ marginTop: "1rem" }}>
          <Button type="primary" onClick={() => onTriggerCr(selectedStation)}>
            Trigger CR cho tram {selectedStation.tram_name}
          </Button>
        </div>
      )}
    </div>
  );
};

export default StationSearchGrid;

import React, { useEffect, useMemo, useState } from "react";
import { Input, Pagination, Button, Alert, Spin } from "antd";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
// <th> dung chung cho MOI bang co sort trong module (click header + mui ten huong sort) - xem ly do
// tach rieng trong chinh file do
import { SortableHeaderCell } from "../../common/SortableHeaderCell";
// dung debounce co san tu lodash (da la dependency co san trong package.json) thay vi tu viet lai
// setTimeout/clearTimeout, tranh trung lap logic da duoc thu vien xu ly va test san
import debounce from "lodash/debounce";
import { useStations } from "../../hooks/useStations";
import { usePreview } from "../../hooks/usePreview";
import { StationItem, StationsQueryParams, PreviewCrResponse } from "../../types";
// token mau dung chung toan module - xem theme.ts de biet ly do chon tung gia tri
import { R012_COLORS } from "../../theme";
import { OneLineCell } from "../../common/r012TableStyle";

// props nhan tu TacDongTram.tsx: ham nay duoc goi khi NOC bam nut "Trigger CR" cho 1 tram
// TacDongTram.tsx se dung ham nay de mo ConfirmTriggerModal va truyen dung station da chon xuong modal
interface StationSearchGridProps {
  onTriggerCr: (station: StationItem) => void;
  // ham nay duoc goi MOI LAN click 1 dong trong bang (khac voi onTriggerCr chi goi khi bam nut Trigger CR)
  // TacDongTram.tsx dung ham nay de cap nhat tram dang "xem tren ban do" (selectedStationForView),
  // tach biet voi tram dang "lam CR" vi 2 muc dich khac nhau (vd dang xem tram A nhung truoc do da trigger tram B)
  onSelectStation: (station: StationItem) => void;
  // ham nay duoc goi khi bam "Xem truoc anh huong" thanh cong (data), hoac voi null khi doi sang tram khac
  // (preview cu khong con dung cho tram moi) - TacDongTram.tsx dung de cap nhat previewData truyen vao NetworkMap
  onPreviewResult: (data: PreviewCrResponse | null) => void;
}

// khoi tao column helper rieng cho kieu StationItem, giup TanStack Table bao dam kieu du lieu dung ngay luc khai bao cot
const columnHelper = createColumnHelper<StationItem>();

const StationSearchGrid: React.FC<StationSearchGridProps> = ({ onTriggerCr, onSelectStation, onPreviewResult }) => {
  // searchInput: gia tri hien thi TRUC TIEP tren o Input.Search, cap nhat ngay khi go phim
  // de nguoi dung thay ky tu minh vua go ngay lap tuc, khong bi cam giac lag do cho debounce
  const [searchInput, setSearchInput] = useState<string>("");

  // searchTerm: gia tri THAT SU dung de goi API, chi doi sau khi nguoi dung ngung go 400ms (xem debouncedApplySearch ben duoi)
  // tach rieng 2 state nay de UI go phim muot nhung API khong bi goi lien tuc tung phim
  const [searchTerm, setSearchTerm] = useState<string>("");

  // state phan trang - can gui dung len BE qua param page/size cua GET /api/v1/stations
  const [page, setPage] = useState<number>(1);
  // doi default tu 50 xuong 10 theo yeu cau UX - giam tai du lieu tai lan render dau va bang de doc hon,
  // nguoi dung van doi duoc len 20/50 qua UI Pagination (showSizeChanger) nhu binh thuong
  const [size, setSize] = useState<number>(10);

  // state luu station dang duoc chon (bang click vao 1 dong) - chi la local state trong component nay,
  // dung de hien nut "Trigger CR" cho dung tram vua click, chua can Context/Redux vi pham vi dung chi trong Zone A
  const [selectedStation, setSelectedStation] = useState<StationItem | null>(null);

  // tao ham debounce 1 LAN DUY NHAT qua useMemo (deps rong) - neu tao moi moi lan render se mat tac dung debounce
  // vi ham cu bi thay the lien tuc truoc khi kip cho du 400ms
  // 400ms: du de khong goi API lien tuc tung phim go (giam tai BE + tranh nhap nhay ket qua),
  // nhung van du nhanh de nguoi dung khong cam thay cham/lag sau khi ngung go
  const debouncedApplySearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
        setPage(1); // reset ve trang 1 khi doi tu khoa tim kiem, tranh hien thi trang cu voi bo loc moi gay hieu lam khong con du lieu
      }, 400),
    []
  );

  // huy debounce dang cho khi component unmount, tranh goi setState tren component da unmount gay canh bao/memory leak
  useEffect(() => {
    return () => {
      debouncedApplySearch.cancel();
    };
  }, [debouncedApplySearch]);

  // sort SERVER-SIDE (BE vua bo sung param sort_by/order, xem StationsQueryParams trong types/index.ts) -
  // dung state SortingState cua TanStack Table CHI de dieu khien icon mui ten + click header qua
  // SortableHeaderCell, KHONG dang ky getSortedRowModel (se sort lai lan 2 tren client, thua va co the
  // sai neu client sort khac thu tu BE tra ve) - thu tu hien thi CUOI CUNG hoan toan do BE quyet dinh
  // qua sort_by/order truyen xuong useStations() ben duoi
  const [sorting, setSorting] = useState<SortingState>([]);

  // click header doi sort -> luon ve trang 1 (Buoc yeu cau "Doi sort -> ve trang 1"): thu tu toan bo danh
  // sach da doi, trang cu (tinh theo thu tu MOI) khong con cung y nghia voi truoc khi doi sort
  const handleSortingChange = (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
    setSorting(updaterOrValue);
    setPage(1);
  };

  // suy ra sort_by/order tu SortingState cua TanStack Table - column.id cua cac cot accessor (vd "tram_id",
  // "tram_name") TRUNG KHOP voi gia tri enum sort_by that cua BE, nen dung thang duoc, khong can map rieng.
  // sorting rong ([]) nghia la chua chon sort cot nao -> KHONG truyen sort_by/order, de BE tu dung thu tu mac dinh
  const sortBy = sorting.length > 0 ? (sorting[0].id as StationsQueryParams["sort_by"]) : undefined;
  const sortOrder: "asc" | "desc" | undefined = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined;

  // goi hook that, truyen dung q/page/size/sort_by/order khop voi StationsQueryParams va tham so ma
  // getStations dang nhan - GIU sort state khi doi trang (khong reset sorting khi setPage), CHI reset ve
  // trang 1 khi CHINH sorting doi (xem handleSortingChange o tren)
  const { data, isLoading, isError, error } = useStations({
    q: searchTerm || undefined, // khong gui q rong de tranh BE phai xu ly filter rong khong can thiet
    page,
    size,
    sort_by: sortBy,
    order: sortOrder,
  });

  // du lieu tram lay tu response that, fallback mang rong khi chua co data (dang loading lan dau)
  const stations = data?.data ?? [];
  const total = data?.total ?? 0;

  // usePreview la useMutation (khong tu fetch) - chi goi khi NOC bam nut "Xem truoc anh huong" ben duoi,
  // isLoading/isError/error dung de hien loading/error state ngay canh nut, khong can state rieng
  const previewMutation = usePreview();

  // khai bao cot bang dung DUNG cac field co that trong StationItem (types/index.ts) - khong bia them cot
  // STT khong phai field tu BE, chi la so thu tu hien thi tinh theo vi tri dong + trang hien tai
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "stt",
        header: "STT",
        enableSorting: false, // STT chi la vi tri hien thi, sort cot nay khong co y nghia
        cell: (info) => (page - 1) * size + info.row.index + 1, // tinh STT tu vi tri dong, khong phai du lieu that tu BE
      }),
      columnHelper.accessor("tram_id", {
        header: "Ma tram",
        // sort_by="tram_id" nam trong enum BE ho tro (xem StationsQueryParams) - duoc phep sort
      }),
      columnHelper.accessor("tram_name", {
        header: "Ten tram",
        cell: (info) => <OneLineCell value={info.getValue()} />,
        // sort_by="tram_name" nam trong enum BE ho tro - duoc phep sort
      }),
      columnHelper.accessor("ten_quan_ly", {
        header: "Don vi quan ly",
        enableSorting: false, // "ten_quan_ly" KHONG nam trong enum sort_by cua BE (xem StationsQueryParams) - sort cot nay se bi BE tra 422
        cell: (info) => info.getValue() ?? "-", // field co the null theo schema, hien "-" khi khong co du lieu
      }),
      columnHelper.accessor("ma_csht", {
        header: "Ma CSHT",
        enableSorting: false, // "ma_csht" KHONG nam trong enum sort_by cua BE
        cell: (info) => info.getValue() ?? "-", // field co the null theo schema
      }),
      columnHelper.accessor("trang_thai", {
        header: "Trang thai",
        enableSorting: false, // "trang_thai" KHONG nam trong enum sort_by cua BE
      }),
      columnHelper.accessor("cr_status", {
        header: "Trang thai CR",
        enableSorting: false, // "cr_status" KHONG nam trong enum sort_by cua BE
        cell: (info) => info.getValue() ?? "-", // field co the null theo schema (tram chua tung trigger CR)
      }),
    ],
    [page, size]
  );

  // khoi tao table instance cua TanStack Table v8 - phan trang/sort deu da xu ly o phia BE (server-side).
  // sorting state CHI dung de dieu khien UI (icon mui ten qua SortableHeaderCell), KHONG dang ky
  // getSortedRowModel - `stations` hien thi THANG theo thu tu BE tra ve, KHONG sort lai lan 2 tren client
  const table = useReactTable({
    data: stations,
    columns,
    state: { sorting },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
  });

  // ham xu ly khi click 1 dong - luu station vao local state de hien nut Trigger CR cho dung tram do
  const handleRowClick = (station: StationItem) => {
    setSelectedStation(station);
    // bao ra ngoai cho TacDongTram.tsx biet tram nao dang duoc xem, DE RIENG voi luong Trigger CR ben duoi
    // (chi goi khi bam nut), vi xem tram tren map khong bat buoc phai dan den hanh dong trigger CR
    onSelectStation(station);
    // doi sang tram khac thi preview cu (neu co, cua tram truoc do) khong con dung cho tram vua chon - reset
    // ve che do 1 marker binh thuong, tranh hien nham ket qua preview cua tram khac tren map cho den khi NOC
    // bam "Xem truoc" lai cho dung tram nay
    previewMutation.reset();
    onPreviewResult(null);
  };

  // ham xu ly khi bam nut "Xem truoc anh huong" - goi usePreview voi dung tram dang chon, action co dinh
  // "shutdown" vi day la action DA VERIFY qua goi that o Buoc 0 va la truong hop nghiep vu chinh can xem truoc
  // (chua co UI chon action rieng cho preview trong luot nay - se bo sung cung luc voi Bang/Chart o buoc sau)
  const handlePreviewClick = () => {
    if (!selectedStation) {
      return;
    }
    previewMutation.mutate(
      {
        tram_id: selectedStation.tram_id,
        tram_name: selectedStation.tram_name,
        action: "shutdown",
      },
      {
        onSuccess: (result) => onPreviewResult(result),
      }
    );
  };

  return (
    <div>
      <Input.Search
        placeholder="Tim theo ma tram / ten tram / dia danh / CSHT"
        allowClear
        // value dieu khien boi searchInput (cap nhat ngay lap tuc) chu KHONG phai searchTerm (cap nhat tre 400ms),
        // de o input luon hien dung ky tu nguoi dung vua go, khong bi giat/tre do cho debounce
        value={searchInput}
        onChange={(e) => {
          const value = e.target.value;
          setSearchInput(value); // cap nhat UI ngay, khong qua debounce
          debouncedApplySearch(value); // chi goi API that sau khi ngung go 400ms
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
          {/* CSS scoped rieng cho bang nay (class r012-station-table) - dong bo hoa toan voi
              SessionHistoryList.tsx (cung dung TanStack Table + <table> thuong, cung 1 nguon token theme.ts).
              Dong "dang chon" van dung inline backgroundColor (uu tien hon CSS ngoai vi la style rieng cua
              tung dong theo du lieu dong), rieng hover dat SAU 2 rule nth-child de thang o dong KHONG chon,
              nhung khong dung !important nen hover se KHONG de len mau cua dong dang chon - dung y muon */}
          <style>{`
            .r012-station-table { border-collapse: collapse; }
            .r012-station-table thead th {
              text-align: left;
              padding: 10px 8px;
              background-color: ${R012_COLORS.tableHeaderBg};
              color: #ffffff;
              font-weight: 700;
              border: 1px solid ${R012_COLORS.primary};
            }
            .r012-station-table tbody td {
              padding: 8px;
              border-bottom: 1px solid ${R012_COLORS.tableBorder};
            }
            .r012-station-table tbody tr { cursor: pointer; }
            .r012-station-table tbody tr:nth-child(odd) { background-color: #ffffff; }
            .r012-station-table tbody tr:nth-child(even) { background-color: ${R012_COLORS.tableRowAlt}; }
            .r012-station-table tbody tr:hover { background-color: ${R012_COLORS.rowHoverBg}; }
          `}</style>
          <div className="r012-table-scroll">
<table className="r012-table r012-station-table">
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
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row.original)}
                  style={{
                    // highlight dong dang chon de NOC biet ro minh vua click tram nao truoc khi bam Trigger CR -
                    // inline style nay luon thang CSS ben ngoai (kha ca hover), gia tri lay tu theme.ts
                    backgroundColor:
                      selectedStation?.tram_id === row.original.tram_id ? R012_COLORS.rowSelectedBg : undefined,
                  }}
                >
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
            onChange={(newPage, newSize) => {
              // antd Pagination tra ve ca page va pageSize trong 1 callback, phai cap nhat ca 2 de dong bo voi BE
              setPage(newPage);
              setSize(newSize);
            }}
            style={{ marginTop: "1rem" }}
          />
        </>
      )}

      {/* nut Trigger CR + Xem truoc anh huong chi hien khi da chon 1 tram, tranh NOC bam nham khi chua xac dinh tram nao */}
      {selectedStation && (
        <div style={{ marginTop: "1rem" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <Button type="primary" onClick={() => onTriggerCr(selectedStation)}>
              Trigger CR cho tram {selectedStation.tram_name}
            </Button>
            {/* loading state: CDS co the mat vai giay den gan 1 phut de tra ve tram_lan_can (timeout FE da tang
                len 60s de khop), dung loading co san cua antd Button thay vi tu ve Spin rieng, NOC van thay ro
                nut dang xu ly va khong bam trung lap duoc (antd tu disable) */}
            <Button loading={previewMutation.isLoading} onClick={handlePreviewClick}>
              Xem truoc anh huong
            </Button>
            {/* text ro rang thay vi chi spinner tren nut - CDS co the phan hoi cham, NOC can biet dang cho
                chu khong phai treo may, tranh bam lap lai hoac F5 giua chung */}
            {previewMutation.isLoading && (
              <span style={{ color: "#888", fontStyle: "italic" }}>
                Dang tai du lieu tu CDS, co the mat den 1 phut...
              </span>
            )}
          </div>
          {/* error state: preview that bai (vd tram khong co tram lan can / CDS loi - da xac nhan qua goi that
              tram_id khong hop le tra HTTP 502 CDS_API_ERROR o Buoc 0) - hien ro cho NOC, KHONG de im lang.
              Toast loi chung da co san qua interceptor r012Request.ts, Alert nay THEM chi tiet ngay tai cho
              bam nut de NOC khong phai nhin ra ngoai toast (toast se tu bien mat sau vai giay) */}
          {previewMutation.isError && (
            <Alert
              type="warning"
              message="Khong xem truoc duoc anh huong"
              description={
                (previewMutation.error as Error)?.message ||
                "Tram co the khong co tram lan can, hoac CDS khong tra du lieu. Vui long thu lai."
              }
              style={{ marginTop: "0.5rem" }}
              showIcon
            />
          )}
        </div>
      )}
    </div>
  );
};

export default StationSearchGrid;

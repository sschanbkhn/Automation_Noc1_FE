import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, DatePicker, Input, Modal, Pagination, Select, Spin, Tag, Tooltip, message } from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// <th> dung chung cho MOI bang co sort trong module (click header + mui ten huong sort)
import { SortableHeaderCell } from "../common/SortableHeaderCell";
// dung debounce co san tu lodash (da la dependency co san trong package.json, StationSearchGrid.tsx cung
// dung cach nay) thay vi tu viet lai setTimeout/clearTimeout - tranh trung lap logic da duoc test san
import debounce from "lodash/debounce";
import { getSessions, xoaSession, xuatHauKiemExcel } from "../services/R012Service";
import { SessionListItem, SessionListResponse, SessionsQueryParams } from "../types";
import EvaluationDetail from "./EvaluationDetail";
// mau Tag theo trang thai session - GOP VE 1 hang so dung chung voi EvaluationDetail.tsx (27092026), xem
// crSessionStatus.ts de biet day du 9 trang thai + ly do tach mau list/badge
import { CR_STATUS_COLOR, layNhanTrangThaiCr } from "./crSessionStatus";
// token mau dung chung toan module - xem theme.ts de biet ly do chon tung gia tri
import { R012_COLORS } from "../theme";
// dinh dang thoi gian dung CHUNG toan module (ep UTC->GMT+7) - xem ly do trong file helper
import { formatDateTime } from "../helpers/formatDateTime";
// doc message loi THAT tu BE thay vi loi chung cua axios - xem WHY day du trong chinh file do
import { layThongBaoLoi } from "../helpers/layThongBaoLoi";
import { OneLineCell } from "../common/r012TableStyle";
import ThanhBoLoc, { BO_LOC_RONG, CumNut, oRongCoGian } from "../common/ThanhBoLoc";

const { RangePicker } = DatePicker;

// khoi tao column helper rieng cho SessionListItem, giup TanStack Table bao dam kieu du lieu dung ngay luc khai bao cot
const columnHelper = createColumnHelper<SessionListItem>();

// options loc theo trang thai - CHI 3 gia tri DONE/FAILED/RUNNING theo yeu cau nghiep vu (khong dua het
// tat ca trang thai trong CR_STATUS_COLOR (crSessionStatus.ts) vao, vi cac trang thai con lai la buoc
// danh gia/xu ly sau CR, ngoai pham vi bo loc nay). value "" nghia la "Tat ca" - KHONG gui param status len
// BE khi chon muc nay
// SUA (16/10/2026, yeu cau truc tiep user) - THEM KHONG_CHAY (tach khoi FAILED, xem WHY day du o
// crSessionStatus.ts) vao bo loc, cung nhom voi FAILED (ca 2 deu la "session khong hoan thanh duoc")
//
// SUA (20/10/2026, yeu cau truc tiep user) - nhan tieng Viet KHONG dau cho DONE/FAILED/RUNNING (truoc day
// hien NGUYEN VAN ma tho "DONE"/"FAILED"/"RUNNING"). CHI doi nhan trong 4 OPTION LOC nay (khong dung lai/doi
// layNhanTrangThaiCr() cua crSessionStatus.ts): ham do CO CHU Y giu nguyen RAW cho moi trang thai tru
// KHONG_CHAY (xem WHY day du o chinh file do - "KHONG dich toan bo 9 trang thai"), dung cho ca Tag trong
// BANG danh sach lan badge trong EvaluationDetail.tsx - doi hanh vi cua ham do se lam ca 2 noi KHAC doi theo,
// ngoai pham vi yeu cau lan nay (chi noi ve 1 Select loc o day)
const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tat ca" },
  { value: "DONE", label: "Thanh cong" },
  { value: "FAILED", label: "That bai" },
  { value: "KHONG_CHAY", label: "Khong chay" },
  { value: "RUNNING", label: "Dang chay" },
];

// Yeu cau loc san 1 tram, do TAB KHAC gui sang (tab "Lich su phieu" > muc "Tien trinh", bam vao ma tram).
// PHAI co "seq" ben canh tramId: neu chi truyen tramId thi bam lai DUNG ma tram vua bam se khong lam prop
// doi gia tri -> useEffect khong chay lai -> nguoi dung bam ma khong thay gi xay ra. seq tang moi lan bam
// nen lan nao cung co hieu luc, ke ca bam lien tiep cung 1 tram
export interface YeuCauLocTram {
  tramId: string;
  seq: number;
}

// THEM 18/10/2026 (yeu cau truc tiep user) - yeu cau MO THANG 1 session (khac yeuCauLocTram chi LOC danh
// sach): tab Dashboard (muc "Can xu ly" - qua han xuat phieu / Khong chay) biet CHINH XAC session id can mo,
// khac voi tab Lich su phieu (chi biet tram_id, phai loc danh sach roi NOC tu bam dong can xem). "seq" cung
// ly do voi YeuCauLocTram.seq: bam lai DUNG session vua mo se khong lam prop doi gia tri object (chi doi
// field con), useEffect se khong chay lai
export interface YeuCauMoSession {
  sessionId: number;
  seq: number;
}

interface SessionHistoryListProps {
  yeuCauLocTram?: YeuCauLocTram | null;
  yeuCauMoSession?: YeuCauMoSession | null;
}

const SessionHistoryList: React.FC<SessionHistoryListProps> = ({ yeuCauLocTram = null, yeuCauMoSession = null }) => {
  const [page, setPage] = useState<number>(1);
  // 10 dong/trang (yeu cau truc tiep user) - CO Y khac default 20 cua BE (schema SessionsQueryParams):
  // bang nay nam ngay dau tab, 20 dong lam phai cuon het man hinh moi thay Pagination. Van gui size=10
  // tuong minh len BE nen khong phu thuoc default cua BE
  const [size, setSize] = useState<number>(10);

  // state luu session dang duoc xem chi tiet - null nghia la Modal dang dong
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  // id session dang goi DELETE - de disable RIENG nut cua dong do trong luc cho response. Khoa theo id
  // (khong phai vi tri hang) vi sort/loc/phan trang lam vi tri hang doi
  const [dangXoaId, setDangXoaId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // searchInput: gia tri hien thi TRUC TIEP tren o Input.Search, cap nhat ngay khi go phim de khong bi
  // cam giac lag do cho debounce. searchTerm: gia tri THAT SU dung goi API (param q), chi doi sau khi
  // nguoi dung ngung go 400ms - tach 2 state giong pattern da dung o StationSearchGrid.tsx
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // khoang ngay dang loc (RangePicker) - null nghia la khong loc theo ngay
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  // trang thai dang loc (Select) - "" nghia la "Tat ca", khong gui param status len BE
  const [statusFilter, setStatusFilter] = useState<string>("");

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

  // Nhan yeu cau loc tu tab khac (bam ma tram o muc "Tien trinh" trong tab Lich su phieu) - do o tim cua
  // bang nay chay ILIKE tren ca tram_id/tram_name nen chi can dat searchTerm = ma tram la ra dung session
  // cua tram do.
  // Dat THANG searchTerm (khong qua debouncedApplySearch): day khong phai nguoi dung dang go phim, khong
  // co gi de cho - de qua debounce se lam bang hien du lieu cu them 400ms ngay sau khi vua chuyen tab.
  // Van dat searchInput cung luc de o tim HIEN ma tram dang loc, neu khong nguoi dung se thay bang da bi
  // loc ma o tim trong tron, khong hieu tai sao chi con vai dong va cung khong biet cach xoa loc
  useEffect(() => {
    if (!yeuCauLocTram) {
      return;
    }
    debouncedApplySearch.cancel(); // huy lan go dang cho (neu co) de no khong ghi de gia tri vua dat
    setSearchInput(yeuCauLocTram.tramId);
    setSearchTerm(yeuCauLocTram.tramId);
    setPage(1);
    // phu thuoc vao seq (KHONG phai ca object yeuCauLocTram): component cha tao object moi moi lan render,
    // dua ca object vao day se lam effect chay lai lien tuc va dap len tu khoa nguoi dung dang tu go
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yeuCauLocTram?.seq]);

  // Nhan yeu cau MO THANG 1 session tu Dashboard (muc "Can xu ly") - chi can gan selectedSessionId, Modal
  // chi tiet (dieu khien boi bien nay, xem JSX cuoi file) tu mo, KHONG can loc/doi gi o danh sach ben duoi
  // (EvaluationDetail trong Modal tu goi API rieng theo sessionId, doc lap voi state loc/phan trang cua bang)
  useEffect(() => {
    if (!yeuCauMoSession) {
      return;
    }
    setSelectedSessionId(yeuCauMoSession.sessionId);
    // phu thuoc vao seq (KHONG phai ca object) - cung ly do voi effect yeuCauLocTram o tren
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yeuCauMoSession?.seq]);

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

  // doi Select trang thai -> reset ve trang 1, giong cach xu ly cua handleDateRangeChange o tren
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  // tu_ngay/den_ngay RIENG cho xuatHauKiemExcel (THEM 18/10/2026) - KHONG dung lai fromParam/toParam o tren:
  // /hau-kiem/excel nhan `date` ("YYYY-MM-DD" ngay lich GMT+7), KHAC han /sessions nhan `datetime` (ISO) -
  // gui ISO vao day se bi FastAPI tu choi 422 (sai kieu). Cung dateRange goc, chi khac cach format khi gui len
  const { tuNgayHauKiem, denNgayHauKiem } = useMemo(() => {
    if (!dateRange) {
      return { tuNgayHauKiem: undefined as string | undefined, denNgayHauKiem: undefined as string | undefined };
    }
    const [start, end] = dateRange;
    return { tuNgayHauKiem: start.format("YYYY-MM-DD"), denNgayHauKiem: end.format("YYYY-MM-DD") };
  }, [dateRange]);

  // dang goi GET /hau-kiem/excel hay khong - rieng voi dangXoaId (khac hanh dong, khac nut)
  const [dangXuatHauKiem, setDangXuatHauKiem] = useState<boolean>(false);

  // THEM 18/10/2026 (yeu cau truc tiep user) - nut "Xuat hau kiem" o tab Lich su CR (danh sach): xuat theo
  // KHOANG NGAY + bo loc trang thai DANG CHON (statusFilter), KHONG theo 1 session rieng (khac nut tuong tu o
  // EvaluationDetail.tsx, noi xuat theo session_id). BAT BUOC co ca tu_ngay va den_ngay (xem WHY day du o
  // HauKiemExcelParams, types/index.ts - BE tra 422 neu thieu 1 trong 2 khi khong co session_id) - nut nay bi
  // KHOA cho den khi nguoi dung chon khoang ngay (xem disabled o JSX ben duoi)
  const handleXuatHauKiem = async () => {
    if (!tuNgayHauKiem || !denNgayHauKiem) {
      return;
    }
    setDangXuatHauKiem(true);
    try {
      await xuatHauKiemExcel({
        tu_ngay: tuNgayHauKiem,
        den_ngay: denNgayHauKiem,
        trang_thai: statusFilter ? [statusFilter] : undefined,
      });
    } catch (error) {
      // ham xuatHauKiemExcel KHONG qua r012Request nen KHONG co Notification loi tu dong qua interceptor -
      // PHAI tu hien o day, dung CHUNG layThongBaoLoi voi moi noi khac trong module
      message.error(layThongBaoLoi(error, "Xuat hau kiem that bai, vui long thu lai"));
    } finally {
      setDangXuatHauKiem(false);
    }
  };

  // Goi THAT DELETE /api/v1/sessions/{id}. Tach rieng khoi handleXacNhanXoa ben duoi: ham nay chi lo goi
  // API + bao ket qua, viec hoi xac nhan nam o ham kia (dung khuon da co o QosEvaluationTable/PhieuHistoryTable)
  const handleXoaSession = async (id: number) => {
    setDangXoaId(id);
    try {
      const ketQua = await xoaSession(id);
      // BE tra {ten_bang: so_dong_da_xoa}. Duyet nguyen object thay vi doc tung ten bang cu the: danh sach
      // bang co the doi khi BE them bang lien quan moi, doc cung ten se lam mat so lieu ma khong bao gi
      const moTa = Object.entries(ketQua ?? {})
        .map(([bang, soDong]) => `${soDong} ${bang}`)
        .join(", ");
      message.success(moTa ? `Da xoa: ${moTa}` : `Da xoa session ${id}`);
      // nap lai danh sach session. Invalidate theo TIEN TO ["r012","sessions"] (khong kem page/size/bo loc)
      // de MOI bien the cua bang - ke ca bang Tien trinh ben tab Lich su phieu - deu nap lai
      await queryClient.invalidateQueries({ queryKey: ["r012", "sessions"] });
    } catch (error: any) {
      const status = error?.response?.status;
      // 409 = BE tu choi vi session khong o trang thai FAILED. Message cua BE da giai thich RO vi sao,
      // hien NGUYEN VAN thay vi tu dien lai - FE khong nam du dieu kien de dien giai cho dung
      if (status === 409) {
        // GOP ve ham dung chung layThongBaoLoi (03102026, merge master->dev) - xem WHY day du trong
        // helpers/layThongBaoLoi.ts
        message.warning(layThongBaoLoi(error, "Khong xoa duoc session nay"));
      } else {
        message.error(layThongBaoLoi(error, "Xoa session that bai"));
      }
    } finally {
      setDangXoaId(null);
    }
  };

  // Hop xac nhan - hanh dong nay KHONG HOAN TAC DUOC va xoa lan sang nhieu bang khac (cell/log/phieu),
  // nen phai noi ro pham vi anh huong truoc khi bam, giong cach lam voi nut xuat phieu
  const handleXacNhanXoa = (id: number) => {
    Modal.confirm({
      title: "Xac nhan xoa session",
      okText: "Xoa vinh vien",
      okButtonProps: { danger: true },
      cancelText: "Huy",
      width: 520,
      content: (
        <p style={{ marginTop: 0 }}>
          Se <b>XOA VINH VIEN</b> session {id} va toan bo du lieu lien quan (cell, log, phieu). Khong khoi
          phuc duoc.
        </p>
      ),
      onOk: () => handleXoaSession(id),
    });
  };

  // nut "Xoa loc" dua tat ca bo loc (q/from/to/status) ve mac dinh va ve lai trang 1, giup NOC thoat nhanh khoi
  // 1 bo loc dang khong ra ket qua ma khong can xoa tung o thu cong
  const handleClearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setDateRange(null);
    setStatusFilter("");
    setPage(1);
  };

  // sort SERVER-SIDE (BE vua bo sung param sort_by/order, xem SessionsQueryParams trong types/index.ts) -
  // dung state SortingState cua TanStack Table CHI de dieu khien icon mui ten + click header qua
  // SortableHeaderCell, KHONG dang ky getSortedRowModel (se sort lai lan 2 tren client, thua va co the
  // sai neu client sort khac thu tu BE tra ve) - thu tu hien thi CUOI CUNG hoan toan do BE quyet dinh
  // qua sort_by/order truyen xuong getSessions() ben duoi
  const [sorting, setSorting] = useState<SortingState>([]);

  // click header doi sort -> luon ve trang 1 (yeu cau "Doi sort -> ve trang 1"): thu tu toan bo danh sach
  // da doi, trang cu (tinh theo thu tu MOI) khong con cung y nghia voi truoc khi doi sort
  const handleSortingChange = (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
    setSorting(updaterOrValue);
    setPage(1);
  };

  // suy ra sort_by/order tu SortingState - column.id cua cac cot accessor (vd "tram_id", "executed_at")
  // TRUNG KHOP voi gia tri enum sort_by that cua BE, nen dung thang duoc, khong can map rieng. sorting
  // rong ([]) nghia la chua chon sort cot nao -> KHONG truyen sort_by/order, de BE tu dung thu tu mac dinh
  const sortBy = sorting.length > 0 ? (sorting[0].id as SessionsQueryParams["sort_by"]) : undefined;
  const sortOrder: "asc" | "desc" | undefined = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined;

  const { data, isLoading, isError, error } = useQuery<SessionListResponse>({
    // dua ca searchTerm/fromParam/toParam/statusFilter/sortBy/sortOrder vao queryKey de TanStack Query TU
    // goi lai API moi khi doi bo loc/sort, khong can effect/handler goi refetch thu cong
    queryKey: ["r012", "sessions", page, size, searchTerm, fromParam, toParam, statusFilter, sortBy, sortOrder],
    queryFn: () =>
      getSessions({
        page,
        size,
        q: searchTerm || undefined, // khong gui q rong de tranh BE phai xu ly filter rong khong can thiet
        from: fromParam,
        to: toParam,
        status: statusFilter || undefined, // "" (Tat ca) khong gui param status, de BE tra ve tat ca trang thai
        sort_by: sortBy,
        order: sortOrder,
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
        enableSorting: false, // STT chi la vi tri hien thi, sort cot nay khong co y nghia
        cell: (info) => (page - 1) * size + info.row.index + 1, // tinh STT tu vi tri dong, khong phai du lieu that tu BE
      }),
      // tram_id/tram_name/action/status/executed_at/created_at DEU nam trong enum sort_by cua BE (xem
      // SessionsQueryParams) - KHAC voi StationSearchGrid.tsx, o day KHONG can enableSorting:false cot nao
      columnHelper.accessor("tram_id", { header: "Ma tram" }),
      columnHelper.accessor("tram_name", {
        header: "Ten tram",
        cell: (info) => <OneLineCell value={info.getValue()} />,
      }),
      columnHelper.accessor("action", { header: "Hanh dong" }),
      columnHelper.accessor("status", {
        header: "Trang thai",
        cell: (info) => {
          const status = info.getValue();
          const soNgoaiDieuKien = info.row.original.so_cell_ngoai_dieu_kien_moi;
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
              <Tag color={CR_STATUS_COLOR[status]?.list ?? "default"}>{layNhanTrangThaiCr(status)}</Tag>
              {/* THEM 04/10/2026 - dat CUNG O voi Trang thai (khong tach cot rieng): hau het session co gia
                  tri nay = 0 (dat du dieu kien), tach cot se tao mot cot gan nhu luon trong, giong cach
                  "phan_loai_loi" da lam o PhieuHistoryTable.tsx */}
              {typeof soNgoaiDieuKien === "number" && soNgoaiDieuKien > 0 && (
                <Tag color="orange">{soNgoaiDieuKien} cell ngoai dieu kien moi</Tag>
              )}
            </div>
          );
        },
      }),
      // DA BO cot "Thoi gian thuc thi" (executed_at): truong nay duoc ghi o BUOC 17 cua quy trinh CR nen
      // NULL voi MOI session chet giua chung - tren du lieu that la 24/52 dong, tuc gan mot nua bang chi
      // hien "-". Cot "Thoi gian tao" (created_at) ben duoi thi 52/52 dong deu co gia tri, va 2 moc nay
      // cach nhau vai chuc giay nen giu 1 cot la du. Ai can doi chieu ca 2 moc thi xem muc "Tien trinh"
      // ben tab Lich su phieu (cot Bat dau/Ket thuc) hoac Modal chi tiet session
      columnHelper.accessor("created_at", {
        header: "Thoi gian tao",
        cell: (info) => formatDateTime(info.getValue()),
      }),
      columnHelper.display({
        id: "thao_tac",
        header: "Thao tac",
        enableSorting: false, // cot hanh dong, khong co gia tri de sort
        cell: (info) => {
          const row = info.row.original;
          // CHI session FAILED/KHONG_CHAY moi hien nut - dung dieu kien BE dat ra (cac trang thai khac bi tra
          // 409). SUA (16/10/2026, yeu cau truc tiep user) - THEM KHONG_CHAY: da doi chieu truc tiep
          // application/xoa_session_use_case.py::_TRANG_THAI_XOA_DUOC = (CrStatus.FAILED, CrStatus.KHONG_CHAY)
          // ben BE (mo rong 16/10/2026 khi them trang thai nay) - thieu nhanh nay se an mat nut Xoa cho
          // session KHONG_CHAY du BE da cho phep, LECH voi BE that.
          // AN han thay vi hien nut disabled: day la nut XOA VINH VIEN, mot nut xoa mo mo o moi dong se
          // moi nguoi ta bam thu, trong khi tuyet dai da so dong khong bao gio duoc phep xoa
          if (row.status !== "FAILED" && row.status !== "KHONG_CHAY") {
            return <span style={{ color: "#bfbfbf" }}>-</span>;
          }
          return (
            <Button
              size="small"
              danger
              loading={dangXoaId === row.id}
              // stopPropagation: ca dong dang bat onClick mo Modal chi tiet - khong chan thi bam Xoa se
              // vua mo hop xac nhan vua mo luon Modal chi tiet chong len nhau
              onClick={(e) => {
                e.stopPropagation();
                handleXacNhanXoa(row.id);
              }}
            >
              Xoa
            </Button>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, size, dangXoaId]
  );

  // khoi tao table instance - phan trang/sort deu da xu ly o phia BE (server-side). sorting state CHI
  // dung de dieu khien UI (icon mui ten qua SortableHeaderCell), KHONG dang ky getSortedRowModel -
  // `sessions` hien thi THANG theo thu tu BE tra ve, KHONG sort lai lan 2 tren client
  const table = useReactTable({
    data: sessions,
    columns,
    state: { sorting },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      {/* thanh cong cu loc: khoang ngay + tim theo tram + trang thai + xoa loc + xuat hau kiem - LAM LAI
          20/10/2026 (yeu cau truc tiep user muc 0/1/2/4). size="middle" (32px, SUA tu "large" 40px - dong
          bo CHIEU CAO voi tab "Tac dong tram": da doc truc tiep StationSearchGrid.tsx, moi Input/Button o do
          KHONG khai bao size nao ca = mac dinh "middle" cua antd) */}
      <ThanhBoLoc style={{ backgroundColor: R012_COLORS.tableRowAlt, border: `1px solid ${R012_COLORS.primaryPale}` }}>
        <RangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          format="DD/MM/YYYY"
          placeholder={["Tu ngay", "Den ngay"]}
          size="middle"
          style={oRongCoGian(BO_LOC_RONG.rangePicker)}
        />
        {/* Input.Search + enterButton (yeu cau truc tiep user: "size=middle enterButton - bo kieu Input +
            Button ghep tay") - enterButton ve 1 KHOI nut tim rieng gan LIEN voi o nhap (khac dang mac dinh
            chi co icon kinh lup nam BEN TRONG o nhap), dam bao input+nut LUON cung 1 chieu cao vi la 1
            compound component duy nhat cua antd, khong con 2 manh rieng co the lech nhau */}
        <Input.Search
          placeholder="Tim theo ma tram / ten tram"
          allowClear
          enterButton
          // value dieu khien boi searchInput (cap nhat ngay) chu KHONG phai searchTerm (cap nhat tre 400ms),
          // de o input luon hien dung ky tu vua go, khong bi giat/tre do cho debounce
          value={searchInput}
          onChange={(e) => {
            const value = e.target.value;
            setSearchInput(value);
            debouncedApplySearch(value);
          }}
          size="middle"
          style={oRongCoGian(BO_LOC_RONG.timKiem)}
        />
        {/* Select loc trang thai - them tien to "Tien trinh:" (yeu cau truc tiep user: Select nay loc
            DONE/FAILED/KHONG_CHAY/RUNNING - DUNG la trang thai TIEN TRINH cua session CR, khong phai ket
            qua danh gia hau kiem, nen dat ten "Tien trinh" cho dung y nghia) */}
        <Select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          options={STATUS_FILTER_OPTIONS}
          size="middle"
          style={oRongCoGian(BO_LOC_RONG.selectCoTienTo)}
          prefix="Tien trinh:"
        />
        {/* CumNut (THEM lan 4) - "Xoa loc" + "Xuat hau kiem" boc CHUNG 1 cum, LUON di cung nhau khi
            flex-wrap day xuong hang moi - xem WHY day du o common/ThanhBoLoc.tsx::CumNut */}
        <CumNut>
          <Button onClick={handleClearFilters} size="middle">
            Xoa loc
          </Button>
          {/* THEM 18/10/2026 (yeu cau truc tiep user) - xuat Excel hau kiem theo khoang ngay + trang thai
              DANG LOC. KHOA khi chua chon khoang ngay (BE bat buoc ca tu_ngay va den_ngay khi khong co
              session_id - xem WHY day du o handleXuatHauKiem) - Tooltip giai thich ly do bi khoa */}
          <Tooltip title={!dateRange ? "Chon khoang ngay truoc khi xuat" : undefined}>
            <Button onClick={handleXuatHauKiem} loading={dangXuatHauKiem} disabled={!dateRange} size="middle">
              Xuat hau kiem
            </Button>
          </Tooltip>
        </CumNut>
      </ThanhBoLoc>

      {isLoading && <Spin tip="Dang tai lich su CR..." />}

      {isError && (
        <Alert
          type="error"
          message="Khong tai duoc lich su CR"
          description={layThongBaoLoi(error, "Loi khong xac dinh")}
          style={{ marginBottom: "1rem" }}
        />
      )}

      {!isLoading && !isError && (
        <>
          {/* CSS scoped rieng cho bang nay (class r012-session-table) - dat header dam mau + dong xen ke +
              hover, dung DUNG token tu theme.ts (khong hardcode hex o day) de dong bo voi StationSearchGrid.
              Ky thuat nth-child giong cach da khao sat o R003Monitor.tsx, khong can them thu vien CSS-in-JS moi */}
          <style>{`
            /* BO "width: 100%" va THEM "white-space: nowrap": ep bang co dung 100% be rong container se lam
               trinh duyet bop cac cot lai cho vua, va gia tri dai (ten tram) bi ngat xuong 2 dong. Gio bang
               giu do rong TU NHIEN theo noi dung roi cuon ngang trong div overflow-x boc ngoai - dung cach
               3 bang khong bao gio bi ngat dong dang lam (r012-qos-eval-table/r012-qoe-eval-table/
               r012-cellparams-table) */
            .r012-session-table { border-collapse: collapse; }
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
          {/* boc overflow-x: sau khi bo width:100% o tren, bang co the rong hon container - cho no cuon
              ngang RIENG trong khung cua no thay vi tran ra lam vo layout tab */}
          <div className="r012-table-scroll">
          <table className="r012-table r012-session-table">
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
          </div>

          <Pagination
            current={page}
            pageSize={size}
            total={total}
            showSizeChanger
            // khai bao TUONG MINH danh sach muc: BE gioi han size le=200 nhung 200 dong/trang la vo dung o
            // man hinh nay; de antd tu quyet dinh thi moi ban antd co the dua ra danh sach khac nhau.
            // Mac dinh van la 10 (state "size" khoi tao o tren)
            pageSizeOptions={[5, 10, 20, 50]}
            showTotal={(t) => `Tong ${t} session`}
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

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  DatePicker,
  Empty,
  Input,
  Modal,
  Pagination,
  Select,
  Spin,
  Tag,
  Tooltip,
  message,
} from "antd";
import { Dayjs } from "dayjs";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// debounce co san tu lodash (da la dependency, SessionHistoryList.tsx/StationSearchGrid.tsx cung dung
// cach nay) - khong tu viet lai setTimeout/clearTimeout
import debounce from "lodash/debounce";
// <th> dung chung cho MOI bang co sort trong module (click header + mui ten huong sort)
import { SortableHeaderCell } from "../common/SortableHeaderCell";
import { getLichSuPhieu, xuatPhieu, xoaPhieu } from "../services/R012Service";
import { NguonKhongDat, PhieuHistoryItem, PhieuHistoryResponse } from "../types";
import { R012_COLORS } from "../theme";
// dinh dang thoi gian dung CHUNG toan module (ep UTC->GMT+7) - xem ly do trong file helper
import { formatDateTime } from "../helpers/formatDateTime";
import {
  PHIEU_STATUS_COLORS,
  PHIEU_STATUS_FILTER_OPTIONS,
  PHIEU_STATUS_LABELS,
  NGUON_FILTER_OPTIONS,
  NGUON_KHONG_DAT_LABELS,
  PHAN_LOAI_LOI_TAG,
} from "./phieuStatus";
import PhieuDetailModal from "./PhieuDetailModal";
import { OneLineCell } from "../common/r012TableStyle";

const { RangePicker } = DatePicker;

// danh sach muc so dong/trang dung CHUNG cho ca 2 ngu canh cua bang. Khai bao TUONG MINH (khong de antd tu
// quyet dinh) de moi ban antd deu ra cung 1 danh sach, va de KHONG co muc nao vuot le=200 cua BE
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

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
  // So dong/trang MAC DINH khac nhau theo ngu canh:
  //  - trong Modal chi tiet session CR (co sessionId): 5 - Modal chi cao 800px va con phai chua QoS chart,
  //    bang danh gia... 10 dong day het cac muc khac xuong duoi man hinh
  //  - tab rieng "Lich su phieu" (khong sessionId): 10 - ca trang chi co 1 bang nay
  // Ca hai deu doi duoc qua showSizeChanger (PAGE_SIZE_OPTIONS)
  const defaultSize = sessionId !== undefined ? 5 : 10;
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(defaultSize);

  // trang thai dang loc - "" nghia la khong gui param trang_thai, tuc lay TAT CA trang thai (BE khong con
  // an ngam DRY_RUN nhu truoc vi trang thai do da bi bo han - xem phieuStatus.ts)
  const [statusFilter, setStatusFilter] = useState<string>("");

  // nguon phat hien cell khong dat dang loc - "" = khong gui param nguon, tuc lay TAT CA nguon.
  // LUU Y: BE tren .196:8080 CHUA trien khai param nay (xem PhieuHistoryQueryParams.nguon trong
  // types/index.ts) - gui len khong loi nhung cung chua loc gi cho den khi BE duoc deploy lai
  const [nguonFilter, setNguonFilter] = useState<string>("");

  // cell_name dang goi POST /phieu - dung de disable RIENG nut cua dong do trong luc cho response. Khoa theo
  // cell_name (khong phai vi tri hang) vi sort/loc/phan trang lam vi tri hang doi, con cell_name la khoa
  // nghiep vu on dinh - cung ly do da dung o QosEvaluationTable.tsx::phieuByCell
  const [dangXuatCell, setDangXuatCell] = useState<string | null>(null);

  // dung de bao TanStack Query nap lai bang sau khi xuat phieu thanh cong
  const queryClient = useQueryClient();

  // Tim kiem SERVER-SIDE qua param q (BE bo sung 13/08, xem api/routers/phieu.py) - TRUOC DAY la loc client
  // tren cac dong CUA TRANG HIEN TAI, nen go ten 1 cell nam o trang 3 thi khong bao gio ra ma man hinh van
  // bao "khong tim thay": sai pham vi mot cach im lang. Gio BE chay ILIKE %q% tren CA cell_name LAN phieu_id.
  // Tach 2 state giong SessionHistoryList.tsx: searchInput hien ngay tren o (khong giat khi go),
  // searchTerm moi la gia tri that su goi API sau khi ngung go 400ms
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // khoang ngay loc tren created_at - null nghia la khong loc theo ngay
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  // === GOP o "Session ID" VAO o tim kiem (truoc day la 2 o rieng) ===
  // 2 kieu tim van khac han nhau ve ban chat va van duoc gui len 2 param KHAC nhau:
  //  - q: BE chay ILIKE %q% tren cell_name/phieu_id -> tim chuoi GAN DUNG
  //  - session_id: so CHINH XAC, BE so sanh bang
  // Nhung nguoi dung KHONG can phai chon truoc minh dang tim kieu nao: 2 loai gia tri nay tu phan biet
  // duoc bang chinh hinh dang cua chung. Ten cell luon co chu ("4G-SSN014M11-HNI"), so session thi TOAN SO.
  // Nen o day tu nhan dang: go toan chu so -> gui session_id; con lai -> gui q.
  // Danh doi DUY NHAT: ma phieu cung toan so ("19652") nen go ma phieu se bi hieu la so session. Chap nhan
  // duoc vi tim theo ma phieu la viec hiem (nguoi ta doc ma phieu tu bang chu khong go vao de tim), trong
  // khi loc theo session la thao tac hang ngay - va o tim ghi ro thu tu uu tien trong placeholder
  const searchTermTrimmed = searchTerm.trim();
  const oTimLaSo = searchTermTrimmed !== "" && /^\d+$/.test(searchTermTrimmed);

  // session_id THAT SU gui len BE: uu tien prop sessionId (dang dung trong EvaluationDetail - da khoa cung
  // 1 session) roi moi den gia tri suy tu o tim cua tab rieng
  const effectiveSessionId = sessionId ?? (oTimLaSo ? Number(searchTermTrimmed) : undefined);

  // chi gui q khi o tim KHONG phai toan so - neu khong se vua gui session_id vua gui q va BE loc giao ca 2,
  // ra bang rong
  const qParam = !oTimLaSo && searchTermTrimmed !== "" ? searchTermTrimmed : undefined;

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

  const debouncedApplySearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
        setPage(1); // doi tu khoa -> ve trang 1, neu khong se dung o trang 3 cua ket qua chi con 2 dong
      }, 400),
    []
  );

  useEffect(() => {
    // huy debounce dang cho khi unmount - tranh setState tren component da unmount (bang nay nam trong Modal
    // chi tiet session, dong Modal la unmount ngay giua luc dang cho 400ms)
    return () => {
      debouncedApplySearch.cancel();
    };
  }, [debouncedApplySearch]);

  // === CHO PHAI CAN THAN NHAT ===
  // BE nhan tu_ngay/den_ngay kieu `date` (NGAY LICH GMT+7) roi TU quy doi qua khoang_ngay_gmt7():
  // tu_ngay -> dau ngay GMT+7, den_ngay -> dau ngay GMT+7 + 1 NGAY (nua khoang [tu, den+1)).
  // Vi vay .format("YYYY-MM-DD") - TUYET DOI KHONG toISOString() nhu SessionHistoryList dang lam cho
  // /sessions (endpoint do nhan `datetime` nen ISO moi dung). Gui ISO vao day se lech 1 ngay.
  // Cung KHONG can endOf("day") cho den_ngay: BE da cong 1 ngay san roi.
  const { tuNgay, denNgay } = useMemo(() => {
    if (!dateRange) {
      return { tuNgay: undefined as string | undefined, denNgay: undefined as string | undefined };
    }
    const [start, end] = dateRange;
    return { tuNgay: start.format("YYYY-MM-DD"), denNgay: end.format("YYYY-MM-DD") };
  }, [dateRange]);

  const handleDateRangeChange = (values: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(values && values[0] && values[1] ? [values[0], values[1]] : null);
    setPage(1);
  };

  const handleNguonFilterChange = (value: string) => {
    setNguonFilter(value);
    setPage(1); // doi bo loc -> ve trang 1, giong cac bo loc con lai
  };

  // id dong phieu dang goi DELETE - disable RIENG nut cua dong do trong luc cho response
  const [dangXoaPhieuId, setDangXoaPhieuId] = useState<number | null>(null);

  // Goi THAT DELETE /api/v1/phieu/{id}. Xoa 1 DONG lich su phieu (khong phai xoa phieu ben CTS) de cell
  // quay lai trang thai chua xu ly va co the xuat lai
  // useCallback: "columns" (useMemo ben duoi) tham chieu toi ham nay qua handleXacNhanXoaPhieu,
  // tham chieu khong on dinh se lam useMemo tinh lai moi render
  const handleXoaPhieu = useCallback(async (id: number) => {
    setDangXoaPhieuId(id);
    try {
      await xoaPhieu(id);
      message.success(`Da xoa dong phieu ${id}`);
      // invalidate theo TIEN TO ["r012","phieu-history"] - lam moi CA bang nay, CA 2 bang danh gia
      // QoS/QoE trong modal chi tiet session (chung doc cung tien to de biet cell nao da co phieu)
      await queryClient.invalidateQueries({ queryKey: ["r012", "phieu-history"] });
    } catch (error: any) {
      const status = error?.response?.status;
      // 409 = phieu da len CTS that (trang_thai=SUCCESS), BE chan xoa. Hien NGUYEN VAN message cua BE thay
      // vi tu dien lai - BE la noi nam du dieu kien de giai thich
      if (status === 409) {
        message.warning(
          error?.response?.data?.detail || error?.response?.data?.message || `Phieu ${id} da len CTS, khong xoa duoc o day`
        );
      } else {
        message.error(error?.response?.data?.detail || error?.response?.data?.message || "Xoa phieu that bai");
      }
    } finally {
      setDangXoaPhieuId(null);
    }
  }, [queryClient]);

  const handleXacNhanXoaPhieu = useCallback((id: number) => {
    Modal.confirm({
      title: "Xac nhan xoa dong phieu",
      okText: "Xoa",
      okButtonProps: { danger: true },
      cancelText: "Huy",
      width: 520,
      content: (
        <p style={{ marginTop: 0 }}>
          Xoa dong phieu nay? Cell se quay lai trang thai chua xu ly va co the xuat lai.
        </p>
      ),
      onOk: () => handleXoaPhieu(id),
    });
  }, [handleXoaPhieu]);

  const handleClearFilters = () => {
    setStatusFilter("");
    setNguonFilter("");
    setSearchInput("");
    setSearchTerm("");
    debouncedApplySearch.cancel(); // huy lan go dang cho, neu khong no se ghi de searchTerm rong sau 400ms
    setDateRange(null);
    setPage(1);
  };

  // Goi THAT POST /api/v1/phieu cho 1 dong. Tach rieng khoi handleXacNhanXuat ben duoi de phan ranh ro:
  // ham nay chi lo goi API + bao ket qua, con viec hoi xac nhan nam o ham kia.
  // useCallback: "columns" (useMemo ben duoi) tham chieu toi ham nay trong deps, khong on dinh tham chieu
  // se lam useMemo tinh lai moi render
  const thucHienXuatPhieu = useCallback(
    async (crSessionId: number, cellName: string) => {
      setDangXuatCell(cellName); // set TRUOC await -> nut disable NGAY, tranh bam 2 lan tao 2 phieu that
      try {
        const resp = await xuatPhieu(crSessionId, cellName);

        // moi trang_thai 1 y nghia rieng, KHONG gop chung 1 thong bao - giu y het cach QosEvaluationTable.tsx
        // dang bao ket qua cho cung endpoint nay, de 2 man hinh khong noi 2 kieu ve cung 1 su viec
        if (resp.trang_thai === "DAT_KHONG_XUAT") {
          message.info(resp.message || "Cell dat, khong can xuat");
        } else if (resp.trang_thai === "SUCCESS") {
          // cts_response=null la dau hieu DUY NHAT phan biet "da xuat truoc do" (BE khong goi lai CTS) voi
          // "vua xuat THAT xong lan nay" - ca hai deu tra trang_thai=SUCCESS
          if (resp.cts_response === null) {
            message.info(`Da xuat truoc, ma phieu ${resp.phieu_id ?? "-"}`);
          } else {
            message.success(`Xuat phieu thanh cong, ma phieu: ${resp.phieu_id ?? "-"}`);
          }
        } else if (resp.trang_thai === "FAILED") {
          // hien NGUYEN VAN message tu CTS (vd "thieu WardCode"), KHONG dien giai lai - day la cach NOC biet
          // field bat buoc nao con thieu de bao CTS sua
          message.error(resp.cts_response?.message || "Xuat phieu that bai");
        }

        // Nap lai bang du ket qua la gi (ke ca FAILED): dong vua bam CHAC CHAN da doi ben BE - it nhat
        // so_lan_thu tang, thuong keo theo ca trang_thai/error_message. Invalidate theo TIEN TO
        // ["r012","phieu-history"] (khong kem sessionId/page/...) de moi bien the cua bang deu nap lai -
        // cung 1 phieu co the dang hien o CA tab "Lich su phieu" LAN chi tiet session CR dang mo
        await queryClient.invalidateQueries({ queryKey: ["r012", "phieu-history"] });
      } catch (error: any) {
        // r012Request da tu hien 1 Notification loi chung qua interceptor - o day CHI them thong bao RO
        // RANG hon theo status code, giong pattern da co o QosEvaluationTable.tsx/ConfirmTriggerModal.tsx
        const status = error?.response?.status;
        if (status === 422) {
          message.warning("Chua du du lieu de xuat phieu cho cell nay");
        } else if (status === 503) {
          message.error("Loi ket noi CTS");
        } else {
          message.error(
            error?.response?.data?.detail || error?.response?.data?.message || "Xuat phieu that bai, vui long thu lai"
          );
        }
      } finally {
        // finally (khong phai dat o ca 2 nhanh): du thanh cong hay loi thi nut cung phai mo khoa lai
        setDangXuatCell(null);
      }
    },
    [queryClient]
  );

  // Hoi xac nhan TRUOC KHI xuat. BAT BUOC co buoc nay (khac cac nut GET/tinh toan khac trong module):
  // POST /phieu tao phieu THAT tren TTS, khong co API nao thu hoi duoc - bam nham la phai nho CTS xoa tay
  const handleXacNhanXuat = useCallback(
    (row: PhieuHistoryItem) => {
      // crSessionId phai co thi moi goi duoc POST /phieu (body bat buoc session_id + cell_name). Ve hop dong
      // BE thi cr_session_id la NOT NULL nen nhanh nay khong xay ra, nhung type FE dang khai bao nullable
      // -> chan o day thay vi ep kieu, de neu co dong du lieu la thi bao ro chu khong gui request rac
      if (row.cr_session_id === null) {
        message.error("Dong nay khong co session CR nen khong xuat lai duoc");
        return;
      }
      const crSessionId = row.cr_session_id;
      const soLanThu = row.so_lan_thu ?? 0; // ?? 0: response cu (truoc khi BE bo sung cot) khong co field nay

      Modal.confirm({
        title: "Xac nhan xuat phieu",
        okText: "Xuat phieu",
        okButtonProps: { danger: true }, // nut do - day la hanh dong khong hoan tac duoc
        cancelText: "Huy",
        width: 520,
        content: (
          <div>
            <p style={{ marginTop: 0 }}>
              Se <b>GUI PHIEU THAT</b> len CTS cho cell <b>{row.cell_name}</b>. Khong the tu thu hoi, phai
              nho CTS xoa tay.
            </p>
            {/* chi hien khi da tung thu that bai - day la thong tin lam DOI quyet dinh: xuat tay lan nua
                rat co the hong y het, nen doc loi gan nhat truoc khi bam */}
            {soLanThu > 0 && (
              <Alert
                type="warning"
                showIcon
                message={`Cell nay da thu ${soLanThu} lan that bai.`}
                description={
                  row.error_message ? (
                    // nguyen van loi tu BE/CTS, khong dien giai lai. pre-wrap de chuoi loi nhieu dong
                    // (vd stack/JSON tu CTS) van xuong dong dung cho thay vi don thanh 1 khoi
                    <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      Loi gan nhat: {row.error_message}
                    </span>
                  ) : undefined
                }
              />
            )}
          </div>
        ),
        onOk: () => thucHienXuatPhieu(crSessionId, row.cell_name),
      });
    },
    [thucHienXuatPhieu]
  );

  // column.id cua cac cot accessor trung ten field that cua BE nen dung thang lam sort_by (quy uoc da dung
  // o GET /sessions). sorting rong = chua chon cot nao -> KHONG truyen sort_by/order, de BE tu dung thu tu
  // mac dinh cua no
  const sortBy = sorting.length > 0 ? sorting[0].id : undefined;
  const sortOrder: "asc" | "desc" | undefined = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined;

  const { data, isLoading, isError, error } = useQuery<PhieuHistoryResponse>({
    // sessionId nam trong queryKey de 2 noi dung component nay (tab tat ca / trong 1 session) KHONG dung
    // chung cache cua nhau; cac gia tri loc/sort cung vay de TanStack Query tu goi lai API khi chung doi
    queryKey: [
      "r012",
      "phieu-history",
      // dung effectiveSessionId (khong phai rieng prop sessionId): o loc session cua tab rieng cung phai
      // lam doi queryKey, neu khong TanStack Query se tra lai cache cu khi go so session moi
      effectiveSessionId ?? "all",
      page,
      size,
      statusFilter,
      nguonFilter,
      searchTerm,
      tuNgay,
      denNgay,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      getLichSuPhieu({
        session_id: effectiveSessionId,
        trang_thai: statusFilter || undefined,
        // "" (Tat ca) -> undefined, axios tu bo key undefined khoi query string nen khong gui param thua
        nguon: (nguonFilter || undefined) as NguonKhongDat | undefined,
        q: qParam, // undefined khi o tim la so (luc do da gui session_id) hoac khi o tim rong
        tu_ngay: tuNgay,
        den_ngay: denNgay,
        page,
        size,
        sort_by: sortBy,
        order: sortOrder,
      }),
  });

  // MOI bo loc gio deu chay tren BE - khong con buoc loc client nao o day nua
  const rows = useMemo(() => data?.data ?? [], [data?.data]);
  const total = data?.total ?? 0;

  const columns = useMemo(() => {
    const baseColumns: any[] = [
      columnHelper.display({
        id: "stt",
        header: "STT",
        enableSorting: false, // STT la vi tri hien thi, khong phai field that -> sort khong co y nghia
        cell: (info) => (page - 1) * size + info.row.index + 1,
      }),
      columnHelper.accessor("cell_name", {
        header: "Cell",
        // nowrap o CSS bang da du cho ten cell dung khuon (~16-20 ky tu) nam gon 1 dong. maxWidth+ellipsis
        // o day la DUONG LUI cho ten bat thuong dai: khong co no thi 1 ten dai se keo ca bang rong ra va
        // day cac cot con lai ra ngoai vung nhin. Tooltip giu lai gia tri day du de khong mat thong tin
        cell: (info) => (
          <Tooltip title={info.getValue()}>
            <span
              style={{
                display: "inline-block",
                maxWidth: "220px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                verticalAlign: "bottom",
              }}
            >
              {info.getValue()}
            </span>
          </Tooltip>
        ),
      }),
      columnHelper.accessor("trang_thai", {
        header: "Trang thai",
        cell: (info) => {
          const status = info.getValue();
          // PHIEU_STATUS_LABELS[status] ?? status: 2 trang thai KHONG_XUAT_* co nhan tieng Viet ngan, cac
          // trang thai con lai (SUCCESS/FAILED/PENDING) hien nguyen ten - va gia tri la ma BE them sau nay
          // cung van hien duoc nguyen van thay vi ra o rong
          // Dong co loi: hien THEM 1 Tag phan loai ngay canh trang thai. Dat CUNG O chu khong tach cot
          // rieng - phan loai chi co nghia khi doc kem trang thai (dong SUCCESS khong bao gio co), tach
          // cot se tao mot cot gan nhu trong tron
          const phanLoai = info.row.original.phan_loai_loi
            ? PHAN_LOAI_LOI_TAG[info.row.original.phan_loai_loi]
            : undefined;
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
              <Tag color={PHIEU_STATUS_COLORS[status] ?? "default"} style={{ marginInlineEnd: 0 }}>
                {PHIEU_STATUS_LABELS[status] ?? status}
              </Tag>
              {phanLoai && (
                <Tooltip title={phanLoai.tooltip}>
                  <Tag color={phanLoai.color} style={{ marginInlineEnd: 0 }}>
                    {phanLoai.label}
                  </Tag>
                </Tooltip>
              )}
            </div>
          );
        },
      }),
      // Cot "Tram tat" - tram BI TAT cua CR sinh ra phieu nay (BE efd89d0 join san tram_id/tram_name).
      // Phieu duoc xuat cho cell LAN CAN nen ten cell KHONG cho biet CR nao sinh ra no; truoc day muon
      // biet phai mo tung dong ra xem cr_session_id roi tra cuu tiep.
      // enableSorting:false - enum sort_by cua BE la id/cr_session_id/cell_name/trang_thai/created_at,
      // KHONG co tram_id; gui sort_by ngoai enum se bi tra 422
      columnHelper.display({
        id: "tram_tat",
        header: "Tram tat",
        enableSorting: false,
        cell: (info) => {
          const r = info.row.original;
          if (!r.tram_id && !r.tram_name) {
            // phieu cu truoc dot BE bo sung 2 truong nay
            return <span style={{ color: "#bfbfbf" }}>-</span>;
          }
          // OneLineCell nhu cac cot ten khac - chong ngat dong khi ten tram dai
          return <OneLineCell value={r.tram_name ? `${r.tram_id} - ${r.tram_name}` : r.tram_id} />;
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
      // Cot "Nguon" - cell nay bi phat hien khong dat qua chi so nao (QoS / QoE / ca hai). Tu khi QoE ngang
      // hang QoS, 1 dong phieu khong con tu noi len duoc no sinh ra tu dau, ma do la thu can biet dau tien
      // khi doi chieu lai voi bang danh gia.
      // enableSorting:false - enum sort_by cua BE la id/cr_session_id/cell_name/trang_thai/created_at,
      // KHONG co nguon_khong_dat (da doi chieu openapi.json), gui sort_by ngoai enum se bi tra 422
      columnHelper.accessor("nguon_khong_dat", {
        header: "Nguon",
        enableSorting: false,
        cell: (info) => {
          const v = info.getValue();
          // "-" cho CA HAI truong hop khong co gia tri, va ca hai deu BINH THUONG:
          //  - null: phieu cu xuat truoc dot doi nay (BE khong backfill)
          //  - undefined: BE tren .196 chua deploy truong nay -> hien tai MOI dong deu vao nhanh nay
          if (!v) {
            return <span style={{ color: "#bfbfbf" }}>-</span>;
          }
          // KHONG to mau theo nguon: mau trong bang nay da danh cho TRANG THAI phieu (do = loi, xanh =
          // thanh cong). Them mau thu hai cho nguon se tranh tin hieu voi cot Trang thai ngay ben canh -
          // nguon khong phai chuyen tot/xau, chi la thong tin phan loai
          return <Tag>{NGUON_KHONG_DAT_LABELS[v] ?? v}</Tag>;
        },
      }),
    ];

    // cot "Session" chi hien o tab TAT CA - khi dang xem trong chi tiet 1 session thi moi dong deu cung 1
    // gia tri, hien them 1 cot lap lai la thua cho
    if (sessionId === undefined) {
      baseColumns.push(
        columnHelper.accessor("cr_session_id", {
          header: "Session",
          cell: (info) => info.getValue() ?? "-",
          // "cr_session_id" CO nam trong enum _PhieuSortBy cua BE (da doc api/routers/phieu.py) nen sort
          // duoc - khong con la phong doan nhu ghi chu cu. column.id trung dung ten field nen dung thang
          // lam sort_by, khong can map rieng
          enableSorting: true,
        })
      );
    }

    baseColumns.push(
      columnHelper.accessor("created_at", {
        header: "Thoi diem",
        cell: (info) => formatDateTime(info.getValue()),
      }),
      columnHelper.display({
        id: "thao_tac",
        header: "Thao tac",
        enableSorting: false, // cot hanh dong, khong co gia tri de sort
        // Cot nay hien o CA HAI cho dung bang (tab "Lich su phieu" va chi tiet session CR trong
        // EvaluationDetail) - deu la cung 1 viec "xuat lai phieu cho cell nay", khong co ly do gi cho phep
        // o cho nay ma cam o cho kia
        cell: (info) => {
          const row = info.row.original;
          // SUCCESS = da co phieu that tren TTS -> KHONG hien nut, xuat lan nua chi tao phieu trung.
          // Con lai (FAILED / PENDING / KHONG_XUAT_VUOT_GIOI_HAN / KHONG_XUAT_HET_LUOT_THU) deu la "chua co
          // phieu" nen deu cho xuat tay. Rieng 2 trang thai KHONG_XUAT_* chinh la truong hop nut nay sinh ra
          // de phuc vu: job tu dong da CHU DONG bo qua chung, chi con duong xuat tay
          const nutXuat =
            row.trang_thai === "SUCCESS" ? null : (
            <Button
              size="small"
              danger // do - nhac day la hanh dong ghi that ra he thong ngoai, khong phai nut xem/tinh toan
              loading={dangXuatCell === row.cell_name}
              // chan noi bot len <tr>: ca hang co onClick mo Modal chi tiet, khong chan thi 1 lan bam se
              // vua hien hop xac nhan vua mo modal chi tiet chong len nhau
              onClick={(e) => {
                e.stopPropagation();
                handleXacNhanXuat(row);
              }}
            >
              Xuat
            </Button>
          );

          // Nut XOA hien khi trang_thai !== SUCCESS - dung dieu kien BE dat ra (SUCCESS bi tra 409 vi phieu
          // da len CTS that). AN han o dong SUCCESS thay vi disable: 2 nut xam canh nhau o moi dong da xong
          // chi lam ray bang
          const nutXoa =
            row.trang_thai === "SUCCESS" ? null : (
              <Button
                size="small"
                danger
                loading={dangXoaPhieuId === row.id}
                onClick={(e) => {
                  e.stopPropagation(); // ca hang co onClick mo Modal chi tiet, khong chan se mo chong len
                  handleXacNhanXoaPhieu(row.id);
                }}
              >
                Xoa
              </Button>
            );

          if (!nutXuat && !nutXoa) return null;
          return (
            <div style={{ display: "flex", gap: "6px" }}>
              {nutXuat}
              {nutXoa}
            </div>
          );
        },
      })
    );

    return baseColumns;
  }, [page, size, sessionId, dangXuatCell, handleXacNhanXuat, dangXoaPhieuId, handleXacNhanXoaPhieu]);

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
            prefix="Trang thai:"
          />
          {/* Select loc theo NGUON. Co prefix "Nguon:" vi dat canh Select trang thai o tren, 2 o Select tron
              giong nhau se khong biet o nao loc cai gi neu chua bam mo (cung ly do da them prefix cho o kia) */}
          <Select
            value={nguonFilter}
            onChange={handleNguonFilterChange}
            options={NGUON_FILTER_OPTIONS}
            style={{ width: "160px" }}
            prefix="Nguon:"
          />
          <Input.Search
            // Placeholder liet ke ca 3 thu tim duoc - nguoi dung khong phai doan, cung khong phai chon
            // truoc "tim theo gi" (o nay tu nhan dang theo kieu du lieu go vao, xem oTimLaSo o tren)
            placeholder="Tim theo cell / ma phieu / so session"
            allowClear
            // value theo searchInput (cap nhat ngay tung phim) chu KHONG phai searchTerm (tre 400ms), de o
            // input khong bi giat/tre khi go
            value={searchInput}
            onChange={(e) => {
              const value = e.target.value;
              setSearchInput(value);
              debouncedApplySearch(value);
            }}
            style={{ flex: "1 1 220px", minWidth: "180px", maxWidth: "260px" }}
          />
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            // dinh dang HIEN THI quen thuoc cua NOC; gia tri GUI LEN BE duoc format rieng thanh YYYY-MM-DD
            // o useMemo ben tren, khong lien quan toi format nay
            format="DD/MM/YYYY"
            placeholder={["Tu ngay", "Den ngay"]}
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
            /* NGUYEN NHAN ten cell bi ngat 2 dong: "width: 100%" ep bang co dung be rong container, 8 cot
               chia nhau khong du cho nen trinh duyet ngat gia tri dai ("4G-SSN014M11-HNI") xuong dong. Bo
               width:100% + them nowrap: bang giu do rong TU NHIEN theo noi dung roi cuon ngang trong div
               overflow-x boc ngoai - dung cach 3 bang khong bao gio bi ngat dong dang lam
               (r012-qos-eval-table / r012-qoe-eval-table / r012-cellparams-table) */
            .r012-phieu-table { border-collapse: collapse; }
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
          {/* boc overflow-x: sau khi bo width:100%, bang co the rong hon container (nhat la trong Modal
              chi tiet session chi rong 800px) - cho cuon ngang RIENG trong khung cua no */}
          <div className="r012-table-scroll">
          <table className="r012-table r012-phieu-table">
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
          </div>

          {rows.length === 0 && (
            <Empty
              // MOI bo loc deu chay tren BE nen "rong" chi con 1 nghia: khong ban ghi nao khop. Khong con
              // phai phan biet "rong that" voi "rong do loc client trong trang" nhu ban cu
              description={
                searchTerm || statusFilter || nguonFilter || dateRange
                  ? "Khong co phieu nao khop bo loc"
                  : "Chua co phieu nao"
              }
              style={{ margin: "24px 0" }}
            />
          )}

          {/* total la tong so ban ghi KHOP BO LOC tu BE (khong phai so dong cua trang) - gio moi bo loc deu
              server-side nen con so nay luon dung voi thu dang hien */}
          <Pagination
            current={page}
            pageSize={size}
            total={total}
            showSizeChanger
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            showTotal={(t) => `Tong ${t} phieu`}
            onChange={(newPage, newSize) => {
              // antd Pagination tra ve ca page va pageSize trong 1 callback, phai cap nhat ca 2 de dong bo voi BE
              setPage(newPage);
              setSize(newSize);
            }}
            style={{ marginTop: "1rem" }}
          />
        </>
      )}

      <PhieuDetailModal phieu={selectedPhieu} onClose={() => setSelectedPhieu(null)} />
    </div>
  );
};

export default PhieuHistoryTable;

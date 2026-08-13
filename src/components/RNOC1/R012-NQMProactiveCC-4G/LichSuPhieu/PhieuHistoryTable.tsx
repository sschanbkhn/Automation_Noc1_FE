import React, { useCallback, useMemo, useState } from "react";
import { Alert, Button, Empty, Input, Modal, Pagination, Select, Spin, Tag, message } from "antd";
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
import { getLichSuPhieu, xuatPhieu } from "../services/R012Service";
import { PhieuHistoryItem, PhieuHistoryResponse } from "../types";
import { R012_COLORS } from "../theme";
// dinh dang thoi gian dung CHUNG toan module (ep UTC->GMT+7) - xem ly do trong file helper
import { formatDateTime } from "../helpers/formatDateTime";
import { PHIEU_STATUS_COLORS, PHIEU_STATUS_FILTER_OPTIONS, PHIEU_STATUS_LABELS } from "./phieuStatus";
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
  // 10 dong/trang o CA HAI cho dung component nay (truoc day tab tat ca dung 20, trong chi tiet session
  // dung 10) - yeu cau truc tiep user, va thong nhat 1 con so thi khong con phai giai thich vi sao 2 man
  // hinh cua cung 1 bang lai phan trang khac nhau
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);

  // trang thai dang loc - "" nghia la khong gui param trang_thai, tuc lay TAT CA trang thai (BE khong con
  // an ngam DRY_RUN nhu truoc vi trang thai do da bi bo han - xem phieuStatus.ts)
  const [statusFilter, setStatusFilter] = useState<string>("");

  // cell_name dang goi POST /phieu - dung de disable RIENG nut cua dong do trong luc cho response. Khoa theo
  // cell_name (khong phai vi tri hang) vi sort/loc/phan trang lam vi tri hang doi, con cell_name la khoa
  // nghiep vu on dinh - cung ly do da dung o QosEvaluationTable.tsx::phieuByCell
  const [dangXuatCell, setDangXuatCell] = useState<string | null>(null);

  // dung de bao TanStack Query nap lai bang sau khi xuat phieu thanh cong
  const queryClient = useQueryClient();

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
          // PHIEU_STATUS_LABELS[status] ?? status: 2 trang thai KHONG_XUAT_* co nhan tieng Viet ngan, cac
          // trang thai con lai (SUCCESS/FAILED/PENDING) hien nguyen ten - va gia tri la ma BE them sau nay
          // cung van hien duoc nguyen van thay vi ra o rong
          return (
            <Tag color={PHIEU_STATUS_COLORS[status] ?? "default"}>{PHIEU_STATUS_LABELS[status] ?? status}</Tag>
          );
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
          if (row.trang_thai === "SUCCESS") return null;
          return (
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
        },
      })
    );

    return baseColumns;
  }, [page, size, sessionId, dangXuatCell, handleXacNhanXuat]);

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

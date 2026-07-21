# R012 (NQM Proactive CC 4G) — Báo cáo build & điều tra API thật (Phần A/B/C)

Báo cáo này tổng hợp các phần còn thiếu từ lượt triển khai Phần A (QosSparkline),
Phần B (QoeQosCharts), Phần C (LichSuCR: StatsStrip/SessionHistoryList/EvaluationDetail),
và trích lại kết quả điều tra SSE từ lượt KetQuaCR trước đó.

---

## 1. Cấu trúc thật response `GET /api/v1/qos/{cell_name}`

Đã gọi thử trực tiếp API thật (không đoán) với cell_name lấy từ 1 session CR thật (`session_id=194`,
tram_id=110548):

```bash
curl -s "http://127.0.0.1:8000/api/v1/qos/4G-DDA155M12-HNI"
```

Kết quả JSON thật nhận được:

```json
{
  "cell_name": "4G-DDA155M12-HNI",
  "data": [
    { "time": "2026-07-13T00:00:00Z", "qos": 4 }
  ]
}
```

Đã test thêm với 2 cell_name khác để xác nhận cấu trúc nhất quán:

```json
// 4G-HBG295M11-HNI
{ "cell_name": "4G-HBG295M11-HNI", "data": [{ "time": "2026-07-13T00:00:00Z", "qos": 3 }] }

// 4G-BDH271M11-HNI
{ "cell_name": "4G-BDH271M11-HNI", "data": [{ "time": "2026-07-13T00:00:00Z", "qos": 5 }] }
```

**Nhận xét:**
- Field tên là `time` (ISO datetime string) và `qos` (number) — **khác hoàn toàn** với tên field
  `snapshot_date`/`qoe_score`/`qos_score` dùng trong `SessionDetailResponse` (mục 2 dưới đây). Đây là 2 API
  độc lập, không dùng chung schema.
- Dữ liệu test hiện tại chỉ trả về **1 điểm/cell** (không đủ 48 điểm hourly như thiết kế lý tưởng trong
  `UI_DESIGN.md`) — nhiều khả năng do dữ liệu CTS mock/test còn giới hạn ở môi trường dev. Code FE
  (`QosSparkline.tsx`) được viết để xử lý đúng với số điểm bất kỳ (0 → N), không hardcode giả định 48 điểm.
- Type `QosMetrics` trong `types/index.ts` khai báo `Record<string, unknown>` vì OpenAPI schema của BE khai
  báo `additionalProperties: true` (chưa có schema cố định phía BE) — FE phải tự ép kiểu lại theo cấu trúc
  thật đã xác nhận qua curl khi dùng, không sửa lại type gốc vì đó là phản ánh đúng hợp đồng OpenAPI hiện tại.

---

## 2. Cấu trúc thật `qoe_snapshots[]` / `qos_snapshots[]` trong SessionDetail

Endpoint: `GET /api/v1/sessions/{session_id}`.

**Không tìm được session nào ở trạng thái `EVALUATED`** trong DB thật tại thời điểm điều tra (chỉ có 3
session tổng cộng: 1 `DONE`, 2 `FAILED` — chưa có session nào tồn tại đủ lâu để job `evaluate-cr` chạy).
Do đó không lấy được ví dụ JSON có dữ liệu điền sẵn qua curl. Thay vào đó, cấu trúc được xác nhận **trực
tiếp từ source code BE** (nguồn xác thực hơn dữ liệu mẫu, vì đây là code sinh ra response, không phải suy
đoán):

- `api/routers/sessions.py` (dòng 93-108): map field `snapshot_date` (ISO date, qua `.isoformat()`),
  `qoe_score`/`qos_score` (float), `period` (string).
- `application/evaluate_cr_use_case.py` (dòng 270-283): giá trị `period` **chỉ có 2 khả năng thật**:
  `"before"` hoặc `"after"` — **không phải** dạng "T-2"/"T+0" như ASCII mockup trong `UI_DESIGN.md` gợi ý.
- DB schema (`models/qoe_snapshot.py`, `models/qos_snapshot.py`): `qoe_score`/`qos_score` là
  `NUMERIC(3,2) NOT NULL` — không thể lưu giá trị null/rỗng.
- `BUSINESS_RULES.md`: cả QoE và QoS đều dùng thang điểm **1–5** (không phải %/ms như nghi ngờ ban đầu).

**Phát hiện quan trọng nhất** (từ docstring `evaluate_cr_use_case.py`, mục 12–13, "THEM Nhom 4,
13072026"):

```
12. THEM (Nhom 4, 13072026) - persist 10-diem chart (Zone E, BUSINESS_RULES.md
    SS8.5) qua qoe_snapshot_repo/qos_snapshot_repo (moi). TAI SU DUNG dung du
    lieu da tinh trong _daily_averages_dict() (khong goi lai CTS/SOC). CHI luu
    9/10 diem THAT: T-2,T-1 (2 ngay gan CR nhat trong before_dates) + T+1..T+7
    (toan bo after_dates) - T-7..T-3 CHI dung de tinh avg PASS/FAIL, KHONG
    persist rieng tung ngay (ngoai pham vi "10 diem chart", tranh luu du thua).
    T+0 (ngay CR) KHONG BAO GIO co du lieu duoc luu - before window ket thuc
    T-1, after window bat dau T+1, KHONG co nguon nao fetch dung ngay T+0 ma
    khong can 1 lan goi CTS/SOC moi (bi cam theo yeu cau) - xem TU GIA DINH
    #13 duoi day.
13. TU GIA DINH - CAN XAC NHAN: T+0 (ngay CR) LUON THIEU DU LIEU trong chuoi
    10 diem (khong co row nao duoc ghi cho ngay nay) - KHONG hien thi placeholder
    null (qoe_score/qos_score la NOT NULL trong DB, khong the luu "diem rong"),
    ma DON GIAN BO QUA diem T+0 khoi mang tra ve. FE tu suy ra "ngay CR" tu field
    executed_at da co san trong response GET /sessions/{id}, khong can server
    danh dau rieng tung diem. Tuong tu, BAT KY ngay nao khac (T-2,T-1,T+1..T+7)
    thieu du lieu that (CTS/SOC khong tra ve) cung DON GIAN VANG MAT khoi mang,
    khong co gia tri null/0 gia.
```

Tóm tắt hệ quả cho FE:
- Mảng `qoe_snapshots`/`qos_snapshots` chứa **tối đa 9 phần tử** (T-2, T-1, T+1..T+7), **không bao giờ có
  T+0**.
- Bất kỳ ngày nào thiếu dữ liệu thật (kể cả T+0) đều **bị bỏ hẳn khỏi mảng**, không có placeholder
  `null`/`0`.
- FE phải tự tính "ngày CR" bằng field `executed_at` (đã có sẵn trong `SessionDetailResponse`), tự ghép
  từng điểm snapshot theo đúng ngày lịch, và để trống (gap) trên chart cho những ngày không khớp — đã cài
  đặt đúng theo phát hiện này trong `QoeQosCharts.tsx` (hàm `buildChartData`, dùng `connectNulls={false}`
  của Recharts).

Cũng đã xác nhận qua `SessionDetailResponse` thật của session #194 (status `DONE`, chưa `EVALUATED`):
`qoe_snapshots: []`, `qos_snapshots: []`, `cr_logs: []` — khớp đúng dự đoán (chưa evaluate thì mảng rỗng).

---

## 3. StatsStrip — có API tổng hợp không?

**KHÔNG có API tổng hợp nào.** Đã kiểm tra toàn bộ 6 router mà BE có (`main.py`: `stations`, `cr`, `sse`,
`sessions`, `qos`, `jobs`) — không có endpoint `/stats` hay bất kỳ endpoint nào trả về số liệu thống kê
tổng hợp (tổng số session, tỷ lệ thành công/thất bại...). `GET /api/v1/sessions` chỉ trả về
`{ total, data }`, trong đó `total` là **tổng số bản ghi khớp bộ lọc hiện tại** (ví dụ `status=DONE`), không
phải thống kê đồng thời theo nhiều trạng thái.

Theo đúng yêu cầu ban đầu ("KHÔNG tự tính toán phức tạp ở FE... đếm tay từ danh sách session trên 1 trang là
sai"), `StatsStrip.tsx` hiện đang hiển thị:

```
Alert type="info": "Chua co API tong hop"
Mo ta: "BE hien chua co endpoint tra ve so lieu thong ke tong quan (tong so session,
ty le thanh cong/that bai...). Widget nay se duoc bo sung sau khi BE cung cap API tuong ung."
```

---

## 4. Bảng toàn bộ file đã tạo/sửa (Phần A/B/C)

| File | Trạng thái | Ghi chú |
|---|---|---|
| `TacDongTram/ChiSoQos/QosSparkline.tsx` | Sửa (từ placeholder) | **Giả định tự chọn có ghi rõ trong code**: `UI_DESIGN.md` mục 10 mô tả widget trigger khi chọn trạm (trước CR) và lấy cell lân cận của trạm đó, nhưng đã kiểm tra toàn bộ BE và **không có API liệt kê cell lân cận của 1 trạm trước khi CR** (logic gọi CDS lấy neighbor chỉ nằm server-side trong `TriggerCrUseCase`, không expose ra ngoài). Giải pháp: lấy cell_name thật từ `cell_params` của session detail (sau khi CR done), vẫn giữ đúng rule "tối đa 6 cell, ưu tiên priority 1-2 trước" của tài liệu (vì `cell_params` có sẵn field `priority`). Mỗi cell tự gọi `GET /qos/{cell_name}` độc lập, tự xử lý loading/error/rỗng riêng. |
| `TacDongTram/DanhGiaChatLuong/QoeQosCharts.tsx` | Sửa (từ placeholder) | Self-contained: chỉ nhận `sessionId`, tự gọi `getSessionDetail`. Tính 10 mốc offset T-2..T+7 dựa trên `executed_at`, ghép với snapshot thật theo ngày lịch, để `null` (gap) cho ngày thiếu — đúng theo phát hiện ở mục 2. Badge PASS/FAIL/INSUFFICIENT_DATA theo `qoe_result`/`qos_result`. Dùng chung `queryKey` với các nơi khác gọi cùng `session_id` để TanStack Query tự cache, không gọi API trùng lặp. |
| `TacDongTram/KetQuaCR/CrResultsByDirection.tsx` | Sửa | Nhúng thêm `<QosSparkline>` + `<QoeQosCharts>` ngay sau bảng kết quả theo hướng (huong_id), chỉ hiện khi `status === "done"`. |
| `TacDongTram/TacDongTram.tsx` | Sửa | Bỏ import/render riêng lẻ cũ của `QosSparkline`/`QoeQosCharts` (2 div `widget-f33`/`zone-e` cũ) vì giờ đã nhúng bên trong `CrResultsByDirection`, tránh render trùng 2 lần cùng dữ liệu. |
| `LichSuCR/StatsStrip.tsx` | Sửa (từ placeholder) | Hiển thị `Alert` "Chưa có API tổng hợp" — xem mục 3. |
| `LichSuCR/SessionHistoryList.tsx` | Sửa (từ placeholder) | TanStack Table (cùng pattern với `StationSearchGrid`) + `Pagination` (default size 20 theo schema BE), cột dùng đúng field thật của `SessionListItem`. Click 1 dòng mở `Modal` chứa `EvaluationDetail` cho đúng `session_id` dòng đó. |
| `LichSuCR/EvaluationDetail.tsx` | Sửa (từ placeholder) | Hiện `Descriptions` cơ bản (tram/action/status/plan_name/executed_at) từ `getSessionDetail`, và tái sử dụng lại `QoeQosCharts` (Phần B) truyền `sessionId` vào — không viết lại logic chart. |
| `LichSuCR/LichSuCR.tsx` | Sửa | Bỏ `<EvaluationDetail />` đứng riêng lẻ (giờ chỉ mở qua Modal bên trong `SessionHistoryList`, không còn là khối tĩnh độc lập trên trang). |

---

## 5. Kết quả build thật (Phần A/B/C)

Chạy `npm run dev` sau khi hoàn tất toàn bộ thay đổi ở trên:

- **Exit code: 0**
- **0 error, 60 warning**
- Toàn bộ 60 warning đều là baseline cũ đã tồn tại từ trước (ESLint `react-hooks/exhaustive-deps` ở các
  module khác ngoài R012) — **không có dòng warning/error nào chứa đường dẫn
  `R012-NQMProactiveCC-4G`**.
- Lần build này mất khoảng 12.7 phút (765473 ms) — chậm hơn đáng kể so với các lần build trước đó (thường
  50-90 giây), nhiều khả năng do tải máy tại thời điểm chạy chứ không phải do code mới gây ra (không có
  dấu hiệu hang thật: quá trình `node.exe` vẫn tích cực dùng CPU/RAM 2-3GB trong lúc chờ, và output file
  vẫn đang được ghi tăng dần trước khi hoàn tất).

---

## 6. Trích lại nguyên văn Bước 0 của KetQuaCR (điều tra SSE) — từ lượt làm trước Phần A/B/C

Kết quả điều tra được lưu làm comment ngay trong code, tại 2 vị trí:

### a) `hooks/useSseStream.ts` (dòng 1-4, comment đầu file)

```
// hook ket noi SSE that toi GET /api/v1/cr/stream/{session_id}, dung EventSource chuan cua trinh duyet
// da xac nhan tai Buoc 0 (doc source that api/routers/sse.py): endpoint nay KHONG co Depends(get_current_user)
// va main.py KHONG co middleware auth toan cuc nao - nen KHONG can header Authorization, EventSource native
// dung duoc binh thuong, khong can hack qua fetch + ReadableStream
```

**Dịch nghĩa / kết luận:** Không có vấn đề auth chặn EventSource. Endpoint `/api/v1/cr/stream/{session_id}`
trong `api/routers/sse.py` không có `Depends(get_current_user)`, và `main.py` không gắn middleware xác thực
toàn cục nào cho bất kỳ router nào. Vì vậy `EventSource` chuẩn của trình duyệt dùng được trực tiếp, không
cần cơ chế truyền token qua query param, và không cần giải pháp thay thế (fetch + ReadableStream).

### b) `types/index.ts` (comment trên interface `CrStreamEvent`, dòng 136-150)

```
// dung cho SSE stream GET /api/v1/cr/stream/{session_id} - doc truc tiep tu source code BE that
// (application/trigger_cr_use_case.py ham _emit()/_fail(), va api/routers/sse.py dong 36 cho truong hop timeout)
// MOI KHAC HOAN TOAN voi CrLogItem o tren (CrLogItem la cr_logs tu DB, BE hien LUON tra ve mang rong -
// xem api/routers/sessions.py dong 92: cr_logs=[], vi BE chua co persist cr_log - TODO rieng cua BE)
// BE KHONG dat ten "event:" rieng, chi gui "data: {json}\n\n" nen FE doc bang onmessage mac dinh, khong can event ten rieng
export interface CrStreamEvent {
  step?: number; // buoc thu may (1-18), KHONG co trong truong hop status="timeout" (sse.py dong 36 chi gui {"status": "timeout"})
  step_name?: string; // ten buoc, khong co trong truong hop status="timeout"
  pct?: number; // phan tram tien do, khong co trong truong hop status="timeout"
  status: string; // "running" | "success" | "failed" | "timeout" - dung string vi BE khong khai bao enum rieng cho SSE
  msg?: string; // thong diep chi tiet buoc, khong co trong truong hop status="timeout"
  detail?: Record<string, unknown>; // BE hien luon emit {} rong (TODO cua BE, xem _emit() dong 423 trigger_cr_use_case.py)
  done?: boolean; // true khi CR ket thuc (thanh cong buoc 17/18 hoac that bai qua _fail()), khong co trong truong hop timeout
  error?: string | null; // thong diep loi khi that bai (_fail()), null khi khong loi, khong co trong truong hop timeout
}
```

**Dịch nghĩa / kết luận:** BE chỉ gửi dòng `data: {json}\n\n`, không đặt tên `event:` riêng cho từng loại
sự kiện — nên toàn bộ event đều rơi vào callback `onmessage` mặc định của `EventSource`, không cần
`addEventListener` với tên event riêng. Cấu trúc JSON chuẩn gồm `step`, `step_name`, `pct`, `status`, `msg`,
`detail` (luôn là `{}` rỗng — BE chưa dùng, để TODO), `done`, `error`. Trường hợp đặc biệt khi BE chờ hàng
đợi quá 120 giây không có gì mới (`sse.py` dòng 33-37), payload chỉ có duy nhất field
`{"status": "timeout"}`, không có các field còn lại — nên toàn bộ field trừ `status` phải khai báo optional
trong type.

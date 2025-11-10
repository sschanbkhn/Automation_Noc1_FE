# R001 Dashboard Audit - Cấu hình tự động mạng vô tuyến

## Tổng quan

Module R001 Dashboard Audit được xây dựng để hiển thị và quản lý thông tin audit cấu hình tự động mạng vô tuyến. Dashboard bao gồm 4 tabs chính với các chức năng khác nhau.

## Cấu trúc giao diện

### Tab 1: Tham số Audit (Dashboard chính)
- **Mô tả**: Hiển thị tất cả 14 tham số cấu hình với biểu đồ tròn cho từng tham số
- **Tham số được hiển thị**:
  1. utran_srvcc_switch
  2. utran_csfb_switch
  3. utran_flash_csfb_switch
  4. geran_flash_csfb_switch
  5. csfb_adaptive_blind_ho_switch
  6. utran_csfb_steering_switch
  7. idle_csfb_redirect_opt_switch
  8. dl_voip_bundling_switch
  9. ul_voip_pre_allocation_switch
  10. ul_voip_delay_sch_switch
  11. ul_voip_load_based_sch_switch
  12. ul_voip_serv_state_enhanced_sw
  13. ul_voip_sch_opt_switch
  14. ul_vo_lte_data_size_est_switch

- **Chức năng**:
  - Mỗi tham số hiển thị 1 biểu đồ tròn với:
    - Số lượng cấu hình đúng (màu xanh)
    - Số lượng cấu hình sai (màu đỏ)
    - Tỷ lệ phần trăm đúng ở giữa biểu đồ
  - Click vào phần "Đúng" → Mở modal hiển thị danh sách NE với cấu hình đúng
  - Click vào phần "Sai" → Mở modal hiển thị danh sách NE với cấu hình sai

### Tab 2: Danh sách NE đã thực hiện
- **Mô tả**: Danh sách các NE Name đã thực hiện cấu hình tự động
- **Dữ liệu**: Lấy từ bảng `r001_data_runtime`
- **Hiển thị**:
  - STT
  - NE Name
  - Số lượng Cell của mỗi NE

### Tab 3: Chi tiết Runtime
- **Mô tả**: Bảng chi tiết tất cả các cấu hình đã thực hiện
- **Dữ liệu**: Lấy từ bảng `r001_data_runtime`
- **Cột hiển thị**:
  - STT
  - NE Name
  - Cell ID
  - Report Date
  - UTRAN SRVCC Switch (với badge màu)
  - UTRAN CSFB Switch (với badge màu)
  - Actions (nút xem chi tiết)

### Tab 4: Cấu hình sai
- **Mô tả**: Danh sách các NE có cấu hình sai
- **Dữ liệu**: Lấy từ bảng `r001_data_runtime_bad`
- **Cột hiển thị**:
  - STT
  - NE Name
  - Cell ID
  - Detected Date
  - Số lượng tham số sai
  - Actions (nút cảnh báo)

## Các Modal

### Modal Cấu hình đúng
- Hiển thị danh sách NE Name và Cell ID có tất cả tham số đúng
- Hiển thị chi tiết các tham số với badge màu xanh
- Có nút đóng

### Modal Cấu hình sai
- Hiển thị danh sách NE Name và Cell ID có ít nhất 1 tham số sai
- Hiển thị chi tiết các tham số với badge màu đỏ
- Có nút đóng

## Chức năng tìm kiếm

### Date Picker
- Cho phép chọn ngày để xem dữ liệu audit theo ngày
- Giới hạn không được chọn ngày trong tương lai
- Mặc định là ngày hiện tại

### Nút Tìm kiếm
- Tải lại dữ liệu theo ngày đã chọn
- Hiển thị loading khi đang tải

### Nút Làm mới
- Tải lại dữ liệu với ngày hiện tại

## Backend API được sử dụng

Module sử dụng các API từ `Rnoc_R001Controller`:

### 1. GetParameterSummaries
- **Endpoint**: `GET /Rnoc_R001/parameter-summaries?date={date}`
- **Mục đích**: Lấy thống kê tổng quan cho từng tham số
- **Response**: Danh sách `IR001ParameterSummary`

### 2. GetConfiguredSites
- **Endpoint**: `GET /Rnoc_R001/configured-sites?date={date}`
- **Mục đích**: Lấy danh sách tất cả NE đã cấu hình
- **Response**: Danh sách `IR001DataRuntime`

### 3. GetBadConfigurations
- **Endpoint**: `GET /Rnoc_R001/bad-configurations?date={date}`
- **Mục đích**: Lấy danh sách NE có cấu hình sai
- **Response**: Danh sách `IR001DataRuntimeBad`

## Cấu trúc Database

### Bảng r001_data_runtime
- Lưu trữ tất cả các cấu hình đã thực hiện
- Các cột chính:
  - id, ne_name, cell_id
  - 14 cột tham số cấu hình
  - report_date, created_at, updated_at

### Bảng r001_data_runtime_bad
- Lưu trữ các cấu hình sai
- Cấu trúc tương tự r001_data_runtime
- Thêm cột: detected_date

## Service Layer

File `RnocR001Service.tsx` cung cấp các methods:
- GetParameterSummaries(date)
- GetConfiguredSites(date)
- GetBadConfigurations(date)
- GetStatistics(date)
- GetDashboard(date)
- ExportConfiguredSites(data)
- ExportBadConfigurations(data)

## Component chính

### DashboardAudit.tsx
- Component chính của module
- Sử dụng React Hooks (useState, useEffect, useCallback)
- Kết nối với Redux store
- Sử dụng Chart.js cho biểu đồ tròn
- Bootstrap 5 cho UI components

## Cách sử dụng

1. Truy cập menu "AU Vô tuyến" → "Audit cấu hình vô tuyến"
2. Chọn ngày cần xem audit
3. Click "Tìm kiếm" để tải dữ liệu
4. Xem các tab khác nhau để có cái nhìn chi tiết
5. Click vào các phần của biểu đồ tròn để xem chi tiết modal

## Lưu ý kỹ thuật

- Component sử dụng `isMountedRef` để tránh memory leak
- Dữ liệu được cache trong state để tránh gọi API nhiều lần
- Modal được render động dựa trên state
- Table có giới hạn hiển thị 100 dòng đầu tiên cho performance

## Tính năng mở rộng

Các tính năng có thể bổ sung sau:
1. Export dữ liệu ra Excel/CSV
2. Filter và search trong bảng
3. Pagination cho các bảng lớn
4. Chart tổng quan theo khoảng thời gian
5. So sánh giữa các ngày khác nhau
6. Notification khi có cấu hình sai mới
7. Auto refresh theo interval
8. Xem chi tiết từng tham số của từng NE

## Build và Deploy

```bash
# Build development
npm run start

# Build production
npm run build
```

Build thành công với 0 errors, chỉ có warnings không ảnh hưởng.
Tôi vừa thay dổi gì ....
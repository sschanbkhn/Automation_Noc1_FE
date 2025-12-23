# R008 - Dashboard Tiết kiệm điện tự động

## 📋 Tổng quan
Module R008 cung cấp Dashboard theo dõi và thống kê hoạt động tiết kiệm điện của các Cell trong hệ thống mạng viễn thông.

## 🎯 Tính năng chính

### 1. Dashboard theo 3 khoảng thời gian
- **Theo Ngày**: Thống kê theo giờ trong ngày với bộ lọc từ giờ đến giờ
- **Theo Tuần**: Thống kê theo tuần với breakdown hàng ngày
- **Theo Tháng**: Thống kê theo tháng với breakdown hàng ngày

### 2. Các chỉ số thống kê
Mỗi tab hiển thị 5 biểu đồ hình tròn (Doughnut Chart) với các chỉ số:

1. **Tổng số Cell đã thực hiện**: Số cell đã thực hiện tiết kiệm điện (run_off = 1 hoặc run_on = 1)
2. **Tổng số Cell chưa thực hiện**: Số cell chưa thực hiện tiết kiệm điện
3. **Tổng số Cell đã OFF**: Số cell đã thực hiện tắt (run_off = 1)
4. **Tổng số Cell đã ON**: Số cell đã thực hiện bật lại (run_on = 1)
5. **Tổng số giờ đã thực hiện**: Tổng thời gian từ lúc OFF đến lúc ON (tính bằng giờ)

### 3. Bộ lọc thời gian
- **Tab Ngày**: Chọn ngày và giờ bắt đầu/kết thúc (mặc định: ngày hiện tại, giờ hiện tại)
- **Tab Tuần**: Chọn khoảng tuần (mặc định: từ thứ 2 tuần này đến ngày hiện tại)
- **Tab Tháng**: Chọn khoảng tháng (mặc định: từ đầu tháng đến ngày hiện tại)

### 4. Xuất dữ liệu
- Xuất file CSV với dữ liệu chi tiết theo khoảng thời gian đã chọn

## 🗄️ Cấu trúc Database

### Bảng: `r008_run_scheduler`
```sql
CREATE TABLE r008_run_scheduler (
    id BIGSERIAL PRIMARY KEY,
    time TIMESTAMP,
    cell_name TEXT,
    enodeb_name VARCHAR,
    srn INT4,
    cn INT4,
    sn INT4,
    localcellid TEXT,
    run_off INT4,
    run_on INT4,
    time_run_off TIMESTAMPTZ,
    time_run_on TIMESTAMPTZ
);
```

### Các trường quan trọng:
- `run_off`: 1 = đã thực hiện OFF, 0/NULL = chưa thực hiện
- `run_on`: 1 = đã thực hiện ON, 0/NULL = chưa thực hiện
- `time_run_off`: Thời điểm thực hiện OFF
- `time_run_on`: Thời điểm thực hiện ON
- **Duration**: Được tính tự động = time_run_on - time_run_off (đơn vị: giờ)

## 🔌 Backend API

### Base URL: `/api/Rnoc_R008`

### Endpoints:

#### 1. Dashboard theo ngày
```
GET /dashboard/day?startDate={datetime}&endDate={datetime}
```
**Mô tả**: Lấy thống kê theo giờ trong ngày
**Params**: 
- startDate: DateTime (format: yyyy-MM-ddTHH:mm:ss)
- endDate: DateTime (format: yyyy-MM-ddTHH:mm:ss)

#### 2. Dashboard theo tuần
```
GET /dashboard/week?startDate={date}&endDate={date}
```
**Mô tả**: Lấy thống kê theo tuần với breakdown hàng ngày
**Params**: 
- startDate: Date (format: yyyy-MM-dd)
- endDate: Date (format: yyyy-MM-dd)

#### 3. Dashboard theo tháng
```
GET /dashboard/month?startDate={date}&endDate={date}
```
**Mô tả**: Lấy thống kê theo tháng với breakdown hàng ngày
**Params**: 
- startDate: Date (format: yyyy-MM-dd)
- endDate: Date (format: yyyy-MM-dd)

#### 4. Lấy records phân trang
```
GET /records/paged?startDate={date}&endDate={date}&page={int}&pageSize={int}
```
**Mô tả**: Lấy danh sách records với phân trang

#### 5. Xuất CSV
```
GET /export/csv?startDate={date}&endDate={date}
```
**Mô tả**: Xuất dữ liệu ra file CSV

## 🎨 Frontend Components

### Cấu trúc thư mục:
```
src/components/RNOC1/R008/
├── DashboardPowerSaving.tsx    # Main dashboard component
└── index.tsx                    # Export component
```

### Services:
```
src/services/RnocR008Service.tsx
```

## 🚀 Cách sử dụng

### 1. Import Component
```tsx
import DashboardPowerSaving from 'components/RNOC1/R008';
```

### 2. Sử dụng trong Route
```tsx
<Route path="/r008/power-saving" component={DashboardPowerSaving} />
```

### 3. Thêm vào Menu
Thêm menu item với path tương ứng trong cấu hình menu của hệ thống.

## 📊 Công thức tính toán

### 1. Cell đã thực hiện
```sql
COUNT(DISTINCT CASE WHEN run_off = 1 OR run_on = 1 THEN cell_name END)
```

### 2. Cell chưa thực hiện
```sql
COUNT(DISTINCT CASE WHEN (run_off IS NULL OR run_off = 0) 
    AND (run_on IS NULL OR run_on = 0) THEN cell_name END)
```

### 3. Tổng giờ thực hiện
```sql
SUM(EXTRACT(EPOCH FROM (time_run_on - time_run_off)) / 3600)
```

## 🔧 Cấu hình

### Connection String (Backend)
File: `appsettings.json`
```json
{
  "RnocConnectionString": "Server=10.155.43.204;Port=5432;Database=rnoc1_db;Username=postgres;Password=Noc1!@#123;"
}
```

### Base API URL (Frontend)
Được cấu hình trong `helpers/request.ts`

## 🎯 Best Practices

1. **Performance**: Sử dụng indexes trên các cột:
   - `time`
   - `cell_name`
   - `run_off`, `run_on`

2. **Caching**: Cache kết quả dashboard trong 5 phút để giảm tải DB

3. **Pagination**: Sử dụng server-side pagination khi lấy danh sách records

4. **Date Range**: Giới hạn khoảng thời gian tối đa (vd: 3 tháng) để tránh query quá lớn

## 📝 Ghi chú

- Mặc định khi mở Dashboard, hiển thị tab "Theo Ngày" với thời gian hiện tại
- Biểu đồ tự động cập nhật khi thay đổi bộ lọc
- Hỗ trợ export Excel/CSV với định dạng chuẩn
- Responsive design hỗ trợ mobile và desktop

## 🐛 Troubleshooting

### Lỗi: "Không có dữ liệu"
- Kiểm tra kết nối database
- Kiểm tra bảng `r008_run_scheduler` có dữ liệu không
- Kiểm tra khoảng thời gian đã chọn

### Lỗi: "Timeout"
- Giảm khoảng thời gian query
- Thêm indexes vào database
- Tăng timeout trong cấu hình

## 📞 Liên hệ

Để được hỗ trợ, vui lòng liên hệ team NOC1 Development.

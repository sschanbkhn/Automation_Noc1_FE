# RNOC1 R009 - Quản Lý Config Vô Tuyến

## Cấu trúc Component

Component này được thiết kế với 2 tab chính:

### Tab 1: Dashboard Tổng Quan
- **File**: `Dashboard.tsx`
- **Mục đích**: Hiển thị tổng quan về dữ liệu Config Vô Tuyến
- **Tính năng**:
  - Thống kê tổng số Sites và Cells
  - Phân bố theo Vendor (Huawei, Nokia, Ericsson)
  - Phân bố theo Công nghệ (4G, 5G)
  - Phân bố theo Băng tần (900MHz, 1800MHz, 2100MHz, 2600MHz)
  - Xu hướng 7 ngày gần nhất
  - Biểu đồ trực quan

### Tab 2: Quản Lý Dữ Liệu BTS
- **File**: `index.tsx` (tab thứ 2)
- **Mục đích**: Quản lý chi tiết dữ liệu BTS theo vendor và công nghệ
- **Tính năng**:
  - Tìm kiếm theo ngày, vendor, công nghệ
  - Hiển thị bảng dữ liệu chi tiết
  - Phân trang
  - Xuất Excel
  - Hỗ trợ 4 loại dữ liệu:
    - Huawei 4G
    - Nokia 4G
    - Nokia 5G
    - ZTE 4G

## Cấu trúc Files

```
src/components/RNOC1/R009/
├── index.tsx              # Component chính với 2 tab
├── Dashboard.tsx          # Component Dashboard tổng quan
├── Nokia4GTable.tsx       # Bảng dữ liệu Nokia 4G
├── Nokia5GTable.tsx       # Bảng dữ liệu Nokia 5G
├── Huawei4GTable.tsx      # Bảng dữ liệu Huawei 4G
├── Zte4GTable.tsx         # Bảng dữ liệu ZTE 4G
└── README.md             # Tài liệu này
```

## Cách sử dụng

1. **Dashboard Tab**: 
   - Chọn ngày để xem thống kê
   - Click "Thực hiện" để load dữ liệu
   - Click "Làm mới" để refresh

2. **Quản Lý Dữ Liệu Tab**:
   - Chọn ngày, vendor, công nghệ
   - Click "Thực hiện" để tìm kiếm
   - Click "Xuất Excel" để export dữ liệu

## API Services

Sử dụng `RnocR009Service` với các methods:
- `GetBtsDataByDate(date)` - Huawei 4G
- `GetNokiaBtsDataByDate(date)` - Nokia 4G  
- `GetNokiaBtsData5GByDate(date)` - Nokia 5G
- `GetZteBtsDataByDate(date)` - ZTE 4G

## Dependencies

- React
- Element React (Tab component)
- Bootstrap CSS
- Font Awesome Icons
- Custom components từ `components/common/`
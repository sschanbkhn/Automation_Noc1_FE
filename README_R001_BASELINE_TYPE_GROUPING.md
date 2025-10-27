# R001 Dashboard - Nhóm theo Baseline Type

## Tổng quan thay đổi

Dashboard đã được tái cấu trúc để nhóm các tham số theo **Baseline Type** thay vì hiển thị 14 biểu đồ riêng lẻ.

## Cấu trúc mới

### 1. Giao diện chính - 3 Biểu đồ tròn (Pie Charts)

Dashboard hiện hiển thị **3 biểu đồ chính** tương ứng với 3 Baseline Type:

#### SRVCC (Single Radio Voice Call Continuity)
- **1 tham số**: UtranSrvccSwitch
- **Icon**: fas fa-phone-alt
- **Màu sắc**: Xanh lá (đúng) / Đỏ (sai)

#### CSFB (Circuit Switched Fallback)
- **6 tham số**:
  - UtranCsfbSwitch
  - UtranFlashCsfbSwitch
  - GeranFlashCsfbSwitch
  - CsfbAdaptiveBlindHoSwitch
  - UtranCsfbSteeringSwitch
  - IdleCsfbRedirectOptSwitch
- **Icon**: fas fa-exchange-alt

#### VOLTE (Voice over LTE)
- **7 tham số**:
  - DlVoipBundlingSwitch
  - UlVoipPreAllocationSwitch
  - UlVoipDelaySchSwitch
  - UlVoipLoadBasedSchSwitch
  - UlVoipServStateEnhancedSw
  - UlVoipSchOptSwitch
  - UlVoLteDataSizeEstSwitch
- **Icon**: fas fa-microphone

### 2. Tương tác

#### Click vào biểu đồ
Khi click vào bất kỳ biểu đồ nào (SRVCC, CSFB, hoặc VOLTE), một **modal chi tiết** sẽ hiển thị:

- **Thông tin tổng quan**:
  - Tỷ lệ đúng (%)
  - Số lượng cấu hình đúng
  - Số lượng cấu hình sai

- **Chi tiết từng tham số**:
  - Mỗi tham số hiển thị biểu đồ tròn riêng
  - Phần trăm đúng/sai
  - Số lượng cụ thể
  - Tên tham số đầy đủ

#### Hover effect
- Khi di chuột qua biểu đồ, card sẽ nhô lên (transform translateY)
- Hiệu ứng mượt mà với transition 0.2s

### 3. Cấu trúc code

#### Interfaces mới

```typescript
interface IBaselineTypeSummary {
  BaselineType: string;           // 'SRVCC', 'CSFB', 'VOLTE'
  CorrectCount: number;           // Tổng số cấu hình đúng
  IncorrectCount: number;         // Tổng số cấu hình sai
  TotalCount: number;             // Tổng số cấu hình
  CorrectPercentage: number;      // Phần trăm đúng
  Parameters: IR001ParameterSummary[]; // Danh sách tham số chi tiết
}
```

#### Hàm chính

1. **groupParametersByBaselineType()**
   - Nhóm 14 tham số thành 3 baseline types
   - Tính toán tổng số lượng đúng/sai cho mỗi nhóm
   - Tính phần trăm chính xác

2. **renderBaselineTypeSummaries()**
   - Hiển thị 3 biểu đồ tròn chính
   - Mỗi biểu đồ có icon riêng
   - Hiển thị số lượng tham số trong nhóm
   - Xử lý sự kiện click để mở modal chi tiết

3. **showBaselineTypeDetail()**
   - Mở modal chi tiết khi click vào biểu đồ
   - Lưu baseline type được chọn vào state

4. **renderBaselineTypeDetailModal()**
   - Hiển thị modal với thông tin tổng quan
   - Hiển thị grid các biểu đồ tham số chi tiết (3 cột)
   - Responsive layout (col-xl-4 col-lg-6 col-md-6)

### 4. States mới

```typescript
const [baselineTypeSummaries, setBaselineTypeSummaries] = useState<IBaselineTypeSummary[]>([]);
const [detailModalVisible, setDetailModalVisible] = useState(false);
const [selectedBaselineType, setSelectedBaselineType] = useState<IBaselineTypeSummary | null>(null);
```

### 5. Màu sắc và styling

- **Biểu đồ chính**: Kích thước lớn hơn (200px height)
- **Font size percentage**: 24px (lớn hơn)
- **Card shadow**: shadow-lg cho hiệu ứng nổi bật
- **Modal size**: modal-xl (rộng hơn)
- **Grid layout**: justify-content-center để căn giữa 3 cards
- **Icon size**: fa-2x cho biểu đồ chính

### 6. Luồng dữ liệu

```
API Response (14 parameters)
    ↓
groupParametersByBaselineType()
    ↓
3 Baseline Type Summaries
    ↓
Render 3 Pie Charts
    ↓
Click Event
    ↓
Show Detail Modal with Parameter List
```

## Lợi ích của cấu trúc mới

1. **Giao diện gọn gàng**: 3 biểu đồ thay vì 14
2. **Phân nhóm logic**: Theo Baseline Type (SRVCC, CSFB, VOLTE)
3. **Dễ đọc**: Người dùng nhìn tổng quan trước, chi tiết sau
4. **Tương tác tốt**: Click để xem chi tiết
5. **Responsive**: Hoạt động tốt trên mọi kích thước màn hình
6. **Hiệu ứng đẹp**: Hover effect, transition mượt mà

## Tương thích

- ✅ Tương thích 100% với backend hiện tại
- ✅ Không thay đổi API calls
- ✅ Không thay đổi data structures
- ✅ Chỉ thay đổi cách hiển thị (presentation layer)
- ✅ Giữ nguyên 3 tabs bên phải (NE list, Runtime data, Bad configurations)
- ✅ Giữ nguyên modal cấu hình đúng/sai
- ✅ Giữ nguyên Excel export functionality

## Testing

Để kiểm tra:
1. Refresh trang để load lại dữ liệu
2. Xem 3 biểu đồ chính: SRVCC, CSFB, VOLTE
3. Click vào mỗi biểu đồ để xem chi tiết tham số
4. Kiểm tra hover effect trên cards
5. Kiểm tra responsive trên các kích thước màn hình khác nhau

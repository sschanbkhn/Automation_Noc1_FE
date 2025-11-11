# 🔧 R001 Module - Debug Guide & Fix Summary

## ✅ Các vấn đề đã được sửa (Updated: 2025-11-07)

### 1️⃣ **Tab "Tổng quan tham số" - Chưa load data** ✅ FIXED
**Nguyên nhân:**
- `runtimeData` chỉ được load khi click vào tab (lazy loading)
- Tab đầu tiên cần `runtimeData` để tính statistics (NE count, Cell count)

**Giải pháp:**
- ✅ Thêm `fetchConfiguredSites()` vào initial load (dòng 154-175)
- ✅ Load 3 API song song khi vào module:
  - `/api/Rnoc_R001/parameter-summaries`
  - `/api/Rnoc_R001/bad-configurations-paged`
  - `/api/Rnoc_R001/configured-sites-paged`
- ✅ Thêm `handleTabChange` logic để load data khi click tab (dòng 477-490)
- ✅ Fix tab name mapping: `activeName="parameter-summary"` (trước đó là "parameters")
- ✅ Thêm console.log để debug API calls

### 2️⃣ **Tab "Danh sách audit sai" - Chưa có nút phân trang** ✅ FIXED
**Nguyên nhân:**
- `renderPagination()` có điều kiện `if (currentData.length === 0) return null`
- Nếu `badData.length = 0` thì không hiển thị pagination

**Giải pháp:**
- ✅ Sửa điều kiện: `if (currentData.length === 0 && totalPages <= 1) return null`
- ✅ Thêm debug info để kiểm tra `badTotalPages`, `badTotalCount`
- ✅ Thêm alert banner hiển thị tổng số cấu hình sai
- ✅ Thêm loading state khi chuyển trang
- ✅ Thêm tooltip cho các nút pagination

### 3️⃣ **Kiểm tra 3 API khi vào module** ✅ FIXED
**Kết quả:**
```javascript
// Console output khi load module:
🚀 R001 Module - Loading initial data with date: 2025-11-06
✅ API loaded: /api/Rnoc_R001/parameter-summaries
✅ API loaded: /api/Rnoc_R001/bad-configurations-paged
✅ API loaded: /api/Rnoc_R001/configured-sites-paged
✅ R001 Module - All data loaded in ~3000ms
```

---

## 🧪 Cách kiểm tra (Test Instructions)

### 1. Mở Browser DevTools Console
**Chrome/Edge:** F12 → Console tab

### 2. Vào module R001
URL: `http://localhost/r001` hoặc click vào menu R001

### 3. Kiểm tra Console logs
Bạn sẽ thấy:
```
🚀 R001 Module - Loading initial data with date: 2025-11-06
✅ API loaded: /api/Rnoc_R001/parameter-summaries
✅ API loaded: /api/Rnoc_R001/bad-configurations-paged
✅ API loaded: /api/Rnoc_R001/configured-sites-paged
✅ R001 Module - All data loaded in XXXXms
```

### 4. Kiểm tra tab "Tổng quan tham số"
**Phải thấy:**
- Biểu đồ NE: Hiển thị số lượng NE (không phải 0)
- Biểu đồ Cell: Hiển thị Cell chuẩn/chưa chuẩn (không phải 0)
- Bảng thống kê tham số: Hiển thị danh sách tham số với số liệu

**Console log khi click tab:**
```
🔄 Tab clicked: {name: "parameter-summary", ...}
🔄 Tab index: 0 for tab name: parameter-summary
```

### 5. Kiểm tra tab "Danh sách audit sai"
**Phải thấy:**
- Banner cảnh báo: "Tổng số cấu hình sai: XXX bản ghi"
- Bảng dữ liệu với các cấu hình sai
- **NÚT PHÂN TRANG** ở phía dưới bảng (nếu có > 1 trang)

**Console log:**
```
🔍 Pagination check: {
  badTotalPages: X,
  badDataLength: Y,
  badTotalCount: Z,
  badCurrentPage: 1,
  shouldShow: true
}
```

**Nếu không thấy pagination, kiểm tra debug alert:**
```
Debug: badTotalPages=X, badData.length=Y, badTotalCount=Z
```

---

## 🐛 Nếu vẫn gặp lỗi

### Lỗi 1: Tab "Tổng quan tham số" vẫn hiển thị 0
**Check:**
1. Mở DevTools → Network tab
2. Filter: `configured-sites-paged`
3. Xem response có data không?

**Nếu API trả về 0 data:**
- Kiểm tra database có dữ liệu không
- Kiểm tra date parameter (mặc định: hôm nay)
- Thử chọn ngày khác

### Lỗi 2: Không thấy pagination buttons
**Check Console:**
```javascript
// Phải thấy log này:
🔍 Pagination check: {
  badTotalPages: X,  // Phải > 0
  badDataLength: Y,   // Phải > 0
  badTotalCount: Z,   // Phải > 0
  ...
}
```

**Nếu badTotalPages = 0:**
- Kiểm tra API response: `/api/Rnoc_R001/bad-configurations-paged`
- Xem field `TotalPages` trong response
- Backend có thể chưa trả đúng pagination metadata

### Lỗi 3: API không được gọi
**Check:**
1. Console có log `🚀 R001 Module - Loading initial data` không?
2. Network tab có thấy 3 API calls không?
3. Check lỗi CORS/401/500 trong Network tab

---

## 📊 Chi tiết thay đổi Code

### File: `DashboardAudit.tsx`

**1. Initial Load (dòng 154-175)**
```typescript
useEffect(() => {
  const loadInitialData = async () => {
    console.log('🚀 R001 Module - Loading initial data...');
    await Promise.all([
      fetchSummaryData(),
      fetchBadConfigurations(undefined, undefined, true),
      fetchConfiguredSites(undefined, undefined, true) // ← ADDED
    ]);
    console.log('✅ R001 Module - All data loaded');
  };
  loadInitialData();
}, []);
```

**2. Handle Tab Change (dòng 477-490)**
```typescript
const handleTabChange = useCallback((newTab: number) => {
  setActiveTab(newTab);
  
  // Tab 0: Tổng quan tham số - cần configured sites
  if (newTab === 0 && !dataLoaded.configured) {
    fetchConfiguredSites(undefined, undefined, true);
  }
  
  // Tab 2: Danh sách audit sai - cần bad configurations
  if (newTab === 2 && !dataLoaded.bad) {
    fetchBadConfigurations(undefined, undefined, false);
  }
}, [dataLoaded, fetchConfiguredSites, fetchBadConfigurations]);
```

**3. Pagination Render (dòng 1764-1850)**
```typescript
// BEFORE:
if (currentData.length === 0) return null;

// AFTER:
if (currentData.length === 0 && totalPages <= 1) return null;
```

**4. Tab Configuration (dòng 2589)**
```typescript
// BEFORE:
activeName="parameters"

// AFTER:
activeName="parameter-summary"  // Match first tab name
```

---

## 🚀 Next Steps

1. **Test trong browser** - F5 refresh page
2. **Kiểm tra console logs** - Phải thấy 3 API calls thành công
3. **Kiểm tra tab "Tổng quan tham số"** - Phải có số liệu
4. **Kiểm tra tab "Danh sách audit sai"** - Phải có nút phân trang
5. **Test pagination** - Click các nút trang để chuyển trang

**Nếu vẫn có vấn đề, gửi screenshot console + network tab cho tôi!**

---

## 📝 Notes

- Silent mode: `fetchConfiguredSites(undefined, undefined, true)` - Không hiển thị loading overlay
- Console logs: Dùng emoji để dễ filter (`🚀`, `✅`, `❌`, `🔍`)
- Debug alert: Hiển thị khi pagination không xuất hiện (để debug)

